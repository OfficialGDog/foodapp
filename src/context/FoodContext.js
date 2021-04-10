import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useRef,
  useCallback,
  useReducer
} from "react";
import { Form, Col, Card, Accordion, Button } from "react-bootstrap";
import { firestore } from "../firebase/config";
import { useAuth } from "./AuthContext";

const FoodContext = createContext();

const ACTIONS = {
  ADDLIST: "add-list",
  ADD: "add-object",
  UPDATE: "update-object",
  DELETE: "delete-object",
  CLEAR: "clear-list",
  SET: "set-list"
}

export const useFood = () => {
  return useContext(FoodContext);
};

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useFood().
export function ProvideFood({ children }) {
  const food = useProvideFood();
  return <FoodContext.Provider value={food}>{children}</FoodContext.Provider>;
}

function useProvideFood() {
  const [categories, dispatchCategory] = useReducer(reducer, []);
  const [foods, dispatchFood] = useReducer(reducer, []);
  const [dietaryConditions, dispatchDC] = useReducer(reducer, []);
  const [isLoading, setLoading] = useState(true);
  const [isSaved, setSaved] = useState(false);
  const [selected, dispatchSelect] = useReducer(reducer, []);
  const { user, setUserData } = useAuth();
  const listeners = useRef([]);

  function reducer(state, action) {
    switch(action.type){
      case ACTIONS.ADDLIST: 
        return [...state, ...action.payload]
      case ACTIONS.ADD: 
        return [...state, action.payload]
      case ACTIONS.UPDATE:
        return state.map(item => item.path === action.payload.path ? {...item, ...action.payload} : item)
      case ACTIONS.SET:
        return [...action.payload]
      case ACTIONS.DELETE: 
        return state.filter(item => item.path !== action.payload.path) 
      case ACTIONS.CLEAR:
        return []
      default:
        return state
    }
  }

  const getUserSelectedOptions = useCallback(() => { 

    let foodlist = [], conditionlist = [];

    if(user.foods) foodlist = foods.filter((item) => user.foods.some((item2) => item2 === item.name));
      
    if(user.intolerance) conditionlist = dietaryConditions.filter((item) => user.intolerance.some((item2) => item2 === item.name));
    
    return [...foodlist, ...conditionlist]

  }, [user, foods, dietaryConditions]);

  const handleCheck = useCallback((e) => {
    try {

      let { food, condition } = JSON.parse(e.target.value);

      const isChecked = e.target.checked;

      food = foods.find((item) => item.path === food); 

      condition = dietaryConditions.find((item) => item.path === condition);

      if(food) return dispatchSelect({type: isChecked ? ACTIONS.ADD : ACTIONS.DELETE, payload: food })

      if(condition) return dispatchSelect({type: isChecked ? ACTIONS.ADD : ACTIONS.DELETE, payload: condition})

    } catch (error) {
      console.error(error.message);
    }
  }, [foods, dietaryConditions]);

  
  const handleSave = useCallback(() => {
    try {
      if(!selected.length) return
      const selectedFoods = selected.filter((item) => item.path.split("/")[0] === "foods").map(item => item.name);
      const selectedConditions = selected.filter((item) => item.path.split("/")[0] === "dietaryconditions").map(item => item.name);
      setUserData(user, {foods: selectedFoods, intolerance: selectedConditions });
      setSaved(true);
    } catch (error) {
      console.error(error);
    }

  }, [user, selected, setUserData ])

  function updateProfileButton() {
    if(isLoading) return "Loading..."
    return (
      <>
        <Button
          variant="success"
          disabled={isSaved}
          size="lg"
          type="button"
          onClick={handleSave}>
          {!isSaved ? "Save" : "Saved"}
        </Button>
      </>
    )
  }

  function DietaryConditions() {
    if(isLoading) return "Loading..."
    return (
      <Card>
        <Card.Header
          as="h2"
          className="text-center"
          style={{ backgroundColor: "rgba(0,0,0,0)", border: "none" }}
        >
          Dietary Conditions
        </Card.Header>
        <Card.Body
          className="text-center"
          style={{ paddingBottom: "0px", maxWidth: "800px" }}
        >
          Tell us about your dietary conditions.
          <Form className="m-sm-4">
            <Form.Row className="checkboxgroup">
              {dietaryConditions.map((condition, index) => (
                <Col key={index} xs={6} sm={6} md={6} lg={4}>
                  <Form.Group style={{ marginBottom: ".75rem" }}>
                    <Form.Check
                      inline
                      type="checkbox"
                      value={JSON.stringify({condition: condition.path})}
                      label={condition.name}
                      onChange={handleCheck}
                      checked={selected.some((checked) => checked.path === condition.path)}
                      disabled={isLoading}
                    />
                  </Form.Group>
                </Col>
              ))}
            </Form.Row>
          </Form>
        </Card.Body>
      </Card>
    );
  }

  function FilterDietaryConditions() {
    if(isLoading) return "Loading..."
    return (
      <>
        {dietaryConditions.map((condition, index) => (
            <Col key={index} xs={4} sm={4} md={4} lg={4}>
                  <Form.Check
                      inline
                      type="checkbox"
                      value={JSON.stringify({condition: condition.path})}
                      label={condition.name}
                      onChange={handleCheck}
                      checked={selected.some((checked) => checked.path === condition.path)}
                      disabled={isLoading}
                      />
            </Col>
        ))}
      </>
    );
  }

  function FoodCategories() {
    return (
      <Card>
        <Card.Header
          as="h2"
          className="text-center"
          style={{ backgroundColor: "rgba(0,0,0,0)", border: "none" }}
        >
          My Food Profile
        </Card.Header>
        <Card.Body
          className="text-center"
          style={{ paddingBottom: "0px", maxWidth: "800px" }}
        >
          Tell us about which foods you can't eat.
          <Form className="m-sm-4">
            <Form.Row className="checkboxgroup">
              <Accordion className="w-100">
                {categories.map((category, index) => (
                  <Card key={index}>
                    <Accordion.Toggle as={Card.Header} eventKey={index + 1}>
                      {category.name}
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey={index + 1}>
                      <Card.Body>
                        {foods.map(
                          (food, index2) =>
                            (food.category.path === category.path || food.category === category.name) && (
                              <Col key={index2} xs={6} sm={6} md={6} lg={4}>
                                <Form.Group style={{ marginBottom: ".75rem" }}>
                                  <Form.Check
                                    inline
                                    type="checkbox"
                                    value={JSON.stringify({food: food.path})}
                                    label={food.name}
                                    onChange={handleCheck}
                                    checked={selected.some((checked) => checked.path === food.path)}
                                    disabled={isLoading}
                                  />
                                </Form.Group>
                              </Col>
                            )
                        )}
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>
                ))}
              </Accordion>
            </Form.Row>
          </Form>
        </Card.Body>
      </Card>
    );
  }

  const attachListener = (listener) => listeners.current.push(listener);

  const dettachListeners = () => listeners.current.forEach((listener) => listener());

  useEffect(() => {
 
    dispatchFood({type: ACTIONS.CLEAR});
    dispatchCategory({type: ACTIONS.CLEAR});
    dispatchDC({type: ACTIONS.CLEAR});
    dispatchSelect({type: ACTIONS.CLEAR});

    const unsubscribe1 = firestore
      .collection("foods")
      .limit(30) // This means the user can view up to 30 changes 
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {

          if(change.type === "removed") {
              dispatchFood({type: ACTIONS.DELETE, payload: { path: change.doc.ref.path  }});
              return dispatchSelect({type: ACTIONS.DELETE, payload: { path: change.doc.ref.path }});
          }

          const data = change.doc.data();

          if(change.type === "modified") {
            dispatchFood({type: ACTIONS.UPDATE, payload: { ...data, path: change.doc.ref.path }});
            return dispatchSelect({type: ACTIONS.UPDATE, payload: { ...data, path: change.doc.ref.path }});
          } 

          if(change.type === "added") return dispatchFood({type: ACTIONS.ADD, payload: { ...data, path: change.doc.ref.path }});

          });
        },
        (error) => {
          console.error(error);
        }
      );

    const unsubscribe2 = firestore
      .collection("categories")
      .limit(30) // This means the user can view up to 30 changes 
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {

          if(change.type === "removed") {
              dispatchCategory({type: ACTIONS.DELETE, payload: { path: change.doc.ref.path  }});
              return dispatchSelect({type: ACTIONS.DELETE, payload: { path: change.doc.ref.path }});
          }

          const data = change.doc.data();

          if(change.type === "modified") {
            dispatchCategory({type: ACTIONS.UPDATE, payload: { ...data, path: change.doc.ref.path }});
            return dispatchSelect({type: ACTIONS.UPDATE, payload: { ...data, path: change.doc.ref.path }});
          } 

          if(change.type === "added") return dispatchCategory({type: ACTIONS.ADD, payload: { ...data, path: change.doc.ref.path }});
          
        });
        },
        (error) => {
          console.error(error);
        }
      );

    const unsubscribe3 = firestore
      .collection("dietaryconditions")
      .limit(30) // This means the user can view up to 30 changes 
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {

            if(change.type === "removed") {
                dispatchDC({type: ACTIONS.DELETE, payload: { path: change.doc.ref.path  }});
                return dispatchSelect({type: ACTIONS.DELETE, payload: { path: change.doc.ref.path }});
            }

            const data = change.doc.data();

            if(change.type === "modified") {
              dispatchDC({type: ACTIONS.UPDATE, payload: { ...data, path: change.doc.ref.path }});
              return dispatchSelect({type: ACTIONS.UPDATE, payload: { ...data, path: change.doc.ref.path }});
            } 

            if(change.type === "added") return dispatchDC({type: ACTIONS.ADD, payload: { ...data, path: change.doc.ref.path }});
      
          });
        },
        (error) => {
          console.error(error);
        }
      );


    attachListener(unsubscribe1);
    attachListener(unsubscribe2);
    attachListener(unsubscribe3);

    // Cleanup subscription on unmount
    return () => dettachListeners();

  }, []);

  useEffect(() => {

    dispatchSelect({type: ACTIONS.SET, payload: getUserSelectedOptions()});

    setLoading(false);

  }, [foods, categories, dietaryConditions]);

  // the useEffect() below runs whenever the user selects / unselects a checkbox 
  useEffect(() => {
    // Re-Enable the save button if the user makes a change    
    setSaved(false); 

  }, [selected])

  // Return the user object and auth methods
  return {
    selected,
    DietaryConditions,
    FoodCategories,
    FilterDietaryConditions,
    updateProfileButton
  };
}
