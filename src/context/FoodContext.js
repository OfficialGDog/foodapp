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
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [dietaryConditions, setDietaryConditions] = useState([]);
  const listeners = useRef([]);

  const attachListener = (listener) => listeners.current.push(listener);

  const dettachListeners = () =>
    listeners.current.forEach((listener) => listener());

  const updateState = ({ categories, foods, dietaryconditions }) => {
    if (categories)
      setCategories((prevState) => [...reducer(prevState, categories)]);

    if (dietaryconditions)
      setDietaryConditions((prevState) => [
        ...reducer(prevState, dietaryconditions),
      ]);

    if (foods) {
      try {
        let { name, intolerance, category } = foods.data[0];

        if (!name) return;

        let conditions = [],
          categories = [];

        // VALIDATION of intolerance and category keys.

        if (typeof intolerance === "object")
          intolerance.forEach(
            (condition) => condition.path && conditions.push(condition.path)
          );

        if (typeof intolerance === "string") conditions[0] = intolerance;

        if (typeof category === "object")
          category.path && categories.push(category.path);

        if (typeof category === "string") categories[0] = category;

        const newArray = {
          data: [
            {
              name,
              intolerance: conditions,
              category: categories,
              path: foods.data[0].path,
            },
          ],
        };

        setFoods((prevState) => [...reducer(prevState, newArray)]);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const reducer = (prevState, array) => {
    let newArray = array.data.filter((condition) => condition.name);
    let updated = prevState.map((item) =>
      newArray.length > 0
        ? item.path === newArray[0].path
          ? newArray[0]
          : item
        : item
    );
    if (prevState.length > 0 && newArray.length > 0) {
      if (prevState.some((item) => item.path === newArray[0].path))
        newArray = [];
    }
    return [...updated, ...newArray];
  };

  function DietaryConditions() {
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

  useEffect(() => {
    console.log("ONLY RUN ONCE!");

    const unsubscribe1 = firestore
      .collection("foods")
      .orderBy("name")
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "removed") return;
            updateState({
              foods: {
                data: [{ ...change.doc.data(), path: change.doc.ref.path }],
              },
            });
          });
        },
        (error) => {
          console.error(error);
        }
      );

    attachListener(unsubscribe1);

    const unsubscribe2 = firestore
      .collection("categories")
      .orderBy("name")
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "removed") return;
            updateState({
              categories: {
                data: [{ ...change.doc.data(), path: change.doc.ref.path }],
              },
            });
          });
        },
        (error) => {
          console.error(error);
        }
      );

    attachListener(unsubscribe2);

    const unsubscribe3 = firestore
      .collection("dietaryconditions")
      .orderBy("name")
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "removed") return;
            updateState({
              dietaryconditions: {
                data: [{ ...change.doc.data(), path: change.doc.ref.path }],
              },
            });
          });
        },
        (error) => {
          console.error(error);
        }
      );

    attachListener(unsubscribe3);

    // Cleanup subscription on unmount
    return () => dettachListeners();
  }, []);

  // Return the user object and auth methods
  return {
    DietaryConditions,
    FoodCategories
  };
}
