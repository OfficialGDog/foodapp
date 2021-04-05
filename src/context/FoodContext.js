import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useRef,
  useCallback
} from "react";
import { Form, Col, Card, Accordion, Button } from "react-bootstrap";
import { firestore } from "../firebase/config";
import { useAuth } from "./AuthContext";

const FoodContext = createContext();

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
  const [categories, setCategories] = useState(null);
  const [foods, setFoods] = useState(null);
  const [dietaryConditions, setDietaryConditions] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isSaved, setSaved] = useState(false);
  const [selected, setSelected] = useState([]);
  const listeners = useRef([]);
  const { user, setUserData } = useAuth();

  const getDataFromCache = () => {
      try {
          const foods = localStorage.getItem("LOCAL_FOOD");
          const dietary = localStorage.getItem("LOCAL_DIETARY");
          const category = localStorage.getItem("LOCAL_CATEGORY");
          let lastupdated = localStorage.getItem("LAST_UPDATED");

          if(foods) setFoods([...JSON.parse(foods)]);

          if(dietary) setDietaryConditions([...JSON.parse(dietary)]);

          if(category) setCategories([...JSON.parse(category)]);

          if(lastupdated) lastupdated = new Date(lastupdated);

          return {updated: lastupdated, isCache: (foods && dietary && category) ? true : false };
        }

      catch(error){
          console.log(error)
      }
  }

  const updateState = ({ categories, foods, dietaryconditions }) => {
    if (categories)
      setCategories((prevState) => [...reducer(prevState, categories)]);

    if (dietaryconditions)
      setDietaryConditions((prevState) => [
        ...reducer(prevState, dietaryconditions),
      ]);

    if (foods) {
      try {
        let { intolerance, category } = foods.data[0];

        let conditions = [], categories = [];

        // VALIDATION of intolerance and category keys.

        if (typeof intolerance === "object")
          intolerance.forEach(
            (condition) => condition.path && conditions.push(condition.path)
          );

        if (typeof intolerance === "string") conditions[0] = intolerance;

        if (typeof category === "object")
          category.path && categories.push(category.path);

        if (typeof category === "string") categories[0] = category;

        const newArray = { data: [{ ...foods.data[0], intolerance: conditions, category: categories }]};

        setFoods((prevState) => [...reducer(prevState, newArray)]);

      } catch (error) {
        console.log(error);
      }
    }
  };

  const reducer = (prevState, array) => {
    let newArray = array.data.filter((condition) => condition.name);
    let updated = [];

    if(prevState) {
      updated = prevState.map((item) =>
      newArray.length > 0 ?
          item.path === newArray[0].path ?
              newArray[0] 
          : item
        : item
      );

      // IF the document has been deleted, remove it from the front-end in real-time
      if(newArray.length && newArray[0].isDeleted) updated = updated.filter((item) => item.path !== newArray[0].path);

      if(prevState.some((item) => item.path === newArray[0].path)) newArray = [];

    } 

    return [...updated, ...newArray];
  };

  const isDateLessThanSixHoursAgo = (date) => {
    const HOUR = 1000 * 60 * 60;
    const sixHoursAgo = Date.now() - (HOUR * 6);
    return date > sixHoursAgo
  }

  const updateLastUpdated = () => {
    try {
      localStorage.setItem("LAST_UPDATED", new Date());
    } catch( error ) { 
      console.error(error); 
    }
  }

  const getUserFoodProfile = useCallback(() => {

    let data = { foodlist: [], conditionlist: []};

    try {
      const { intolerance, foods } = user;
      if(intolerance.length) data.conditionlist = intolerance.map((item) => 
          dietaryConditions.find((item2) => 
            item2.path === item.path || item2.name === item 
          ));
      if(foods.length) data.foodlist = foods.map((item) => 
          foods.find((item2) => 
            item2.path === item.path || item2.name === item 
          ));
    } catch (error) {
      console.error(error);
    }

    return data;

  }, [user, foods, dietaryConditions]);

  const handleCheck = useCallback((e) => {
    try {
      let { food, condition } = JSON.parse(e.target.value);

      food = foods.find((item) => item.path === food); 

      condition = dietaryConditions.find((item) => item.path === condition);

      let obj = {};

      if(food) obj = food;

      if(condition) obj = condition;

      if(!e.target.checked) return setSelected(selected.filter(item => item.path !== obj.path));
      
      return setSelected((prevState) => [...reducer(prevState, { data: [ obj ] }) ]);

    } catch (error) {
      console.error(error.message);
    }
  }, [foods, dietaryConditions, selected]);

  
  const handleSave = useCallback(() => {
    try {
      if(!selected.length) return
      const selectedFoods = selected.filter((item) => item.path.split("/")[0] === "foods");
      const selectedConditions = selected.filter((item) => item.path.split("/")[0] === "dietaryconditions");
      setUserData(user, {foods: selectedFoods, intolerance: selectedConditions });
      setSaved(true);
    } catch (error) {
      console.error(error);
    }

  }, [user, selected, setUserData ])

  function updateProfileButton() {
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

  function FoodCategories() {
    if(isLoading) return "Loading..."
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
                            (food.category[0] === category.path ||
                              food.category[0] === category.name) && (
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

    let currentDateTime = new Date(0); // Initialise the date to January 1st 1970 to view all records

    const { isCache, updated } = getDataFromCache();

    // Get data from cache if available
    if(isCache) {
      // Optional clean up local storage after 6 hours
      if(!isDateLessThanSixHoursAgo(updated)) {
        localStorage.clear();
      } else {
        currentDateTime = updated;
      }
    }

    // Fetch from database

    const unsubscribe1 = firestore
      .collection("foods")
      .where('updated', '>=', currentDateTime)
      .limit(40) // This means the user can view up to 40 changes 
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            updateLastUpdated();
            updateState({
              foods: {
                data: [{ ...change.doc.data(), path: change.doc.ref.path, isDeleted: change.type === "removed" ? true : false }],
              },
            });
          });
        },
        (error) => {
          console.error(error);
        }
      );

    const unsubscribe2 = firestore
      .collection("categories")
      .where('updated', '>=', currentDateTime)
      .limit(40) // This means the user can view up to 40 changes 
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            updateLastUpdated();
              updateState({
                categories: {
                  data: [{ ...change.doc.data(), path: change.doc.ref.path, isDeleted: change.type === "removed" ? true : false }],
                },
              });
          });
        },
        (error) => {
          console.error(error);
        }
      );

    const unsubscribe3 = firestore
      .collection("dietaryconditions")
      .where('updated', '>=', currentDateTime)  // new Date should be date Object from local storage?
      .limit(40) // This means the user can view up to 40 changes 
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            updateLastUpdated();
             updateState({
              dietaryconditions: {
                data: [{ ...change.doc.data(), path: change.doc.ref.path, isDeleted: change.type === "removed" ? true : false }],
              },
            });
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
    try{
      if(!foods) return
      localStorage.setItem('LOCAL_FOOD', JSON.stringify(foods));
    } catch (error) {
      console.log(error)
    }
  },[foods]);

  useEffect(() => {
    try{
      if(!categories) return
      localStorage.setItem('LOCAL_CATEGORY', JSON.stringify(categories));
    } catch (error) {
      console.log(error)
    }
  },[categories]);

  useEffect(() => {
    try{
      if(!dietaryConditions) return
      localStorage.setItem('LOCAL_DIETARY', JSON.stringify(dietaryConditions));
    } catch (error) {
      console.log(error)
    }
  },[dietaryConditions]);

  useEffect(() => {
    if(!foods) return
    if(!categories) return
    if(!dietaryConditions) return

    // Definitions loaded now get user settings and set into state

    const { foodlist, conditionlist } = getUserFoodProfile();
    
    setSelected([...foodlist, ...conditionlist]);

    setLoading(false);

  }, [foods, categories, dietaryConditions]);

  // the useEffect() below runs whenever the user selects / unselects a checkbox 
  useEffect(() => {
    console.log(selected);
    setSaved(false); // Enable the save button if the user makes a change
  }, [selected])

  // Return the user object and auth methods
  return {
    DietaryConditions,
    FoodCategories,
    updateProfileButton,
    getUserFoodProfile
  };
}
