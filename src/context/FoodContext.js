import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useRef,
} from "react";
import { Form, Col, Card, Accordion } from "react-bootstrap";
import { firestore } from "../firebase/config";

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
  const listeners = useRef([]);

  const getDataFromCache = () => {
      try {
          const foods = localStorage.getItem("LOCAL_FOOD");
          const dietary = localStorage.getItem("LOCAL_DIETARY");
          const category = localStorage.getItem("LOCAL_CATEGORY");
          let lastupdated = undefined;

          if(foods) {
            setFoods([...JSON.parse(foods)]);
            lastupdated = new Date(JSON.parse(foods)[0].updated);
          }

          if(dietary) setDietaryConditions([...JSON.parse(dietary)]);

          if(category) setCategories([...JSON.parse(category)]);

          return {updated: lastupdated, isCached: (foods && dietary && category) ? true : false };
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
    if(prevState) updated = prevState.map((item) =>
      newArray.length > 0
        ? item.path === newArray[0].path
          ? newArray[0]
          : item
        : item
    );

    if (prevState && newArray) {
      if (prevState.some((item) => item.path === newArray[0].path))
        newArray = [];
    }
    return [...updated, ...newArray];
  };

  function DietaryConditions() {
    if(isLoading) return "Loading Data..."
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
              {dietaryConditions.map((item, index) => (
                <Col key={index} xs={6} sm={6} md={6} lg={4}>
                  <Form.Group style={{ marginBottom: ".75rem" }}>
                    <Form.Check
                      inline
                      type="checkbox"
                      value={item.name}
                      label={item.name}
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
    if(isLoading) return "Loading Data..."
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
                {categories.map((item, index) => (
                  <Card key={index}>
                    <Accordion.Toggle as={Card.Header} eventKey={index + 1}>
                      {item.name}
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey={index + 1}>
                      <Card.Body>
                        {foods.map(
                          (item2, index2) =>
                            (item2.category[0] === item.path ||
                              item2.category[0] === item.name) && (
                              <Col key={index2} xs={6} sm={6} md={6} lg={4}>
                                <Form.Group style={{ marginBottom: ".75rem" }}>
                                  <Form.Check
                                    inline
                                    type="checkbox"
                                    value={index2}
                                    label={item2.name}
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

  const isDateLessThanSixHoursAgo = (date) => {
    const HOUR = 1000 * 60 * 60;
    const sixHoursAgo = Date.now() - (HOUR * 6);
    return date > sixHoursAgo
  } 
  
  const attachListener = (listener) => listeners.current.push(listener);

  const dettachListeners = () => listeners.current.forEach((listener) => listener());

  useEffect(() => {

    let currentDateTime = new Date(0);

    const { isCached, updated } = getDataFromCache();

    // Get data from cache if available
    if(isCached && updated) {
      // Optional clean local data after 6 hours
      isDateLessThanSixHoursAgo(updated) ? currentDateTime = updated : localStorage.clear();
    }

    // Fetch from database

    const unsubscribe1 = firestore
      .collection("foods")
      .where('updated', '>=', currentDateTime)
      .limit(50) // This means the user can view upto 50 changes 
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            console.log("FETCHING DOCUMENT");
            if (change.type === "removed") return;
            updateState({
              foods: {
                data: [{ ...change.doc.data(), path: change.doc.ref.path, updated: new Date() }],
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
      .limit(50) // This means the user can view upto 50 changes 
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            console.log("FETCHING DOCUMENT");
            // Each document read costs 1 read
            if (change.type === "removed") return;
              updateState({
                categories: {
                  data: [{ ...change.doc.data(), path: change.doc.ref.path, updated: new Date() }],
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
      .limit(50) // This means the user can view upto 50 changes 
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            console.log("FETCHING DOCUMENT");
            // Each document read costs 1 read
            if (change.type === "removed") return;
             updateState({
              dietaryconditions: {
                data: [{ ...change.doc.data(), path: change.doc.ref.path, updated: new Date() }],
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
      localStorage.setItem('LOCAL_FOOD', JSON.stringify(foods))
    } catch (error) {
      console.log(error)
    }
  },[foods]);

  useEffect(() => {
    try{
      if(!categories) return
      localStorage.setItem('LOCAL_CATEGORY', JSON.stringify(categories))
    } catch (error) {
      console.log(error)
    }
  },[categories]);

  useEffect(() => {
    try{
      if(!dietaryConditions) return
      localStorage.setItem('LOCAL_DIETARY', JSON.stringify(dietaryConditions))
    } catch (error) {
      console.log(error)
    }
  },[dietaryConditions]);

  useEffect(() => {
    if(!foods) return
    if(!categories) return
    if(!dietaryConditions) return
    setLoading(false);
  }, [foods, categories, dietaryConditions]);

  // Return the user object and auth methods
  return {
    DietaryConditions,
    FoodCategories
  };
}
