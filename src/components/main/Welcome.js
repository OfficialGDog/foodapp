import React, { useEffect, useState } from "react";
import {
  Form,
  Card,
  Button,
  Accordion,
  Container,
  Col,
  Row,
} from "react-bootstrap";
import Swiper, { Navigation, Pagination } from "swiper";
import { Link, useHistory } from "react-router-dom";
import { firestore } from "../../firebase/config";
import "swiper/swiper-bundle.css";
import mainLogo from "../../breakfast.png";
import mainLogo2 from "../../pizza_share.jpg";
import "./Welcome.css";

export default function Welcome() {
  let [mySwiper, setMySwiper] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dietaryConditions, setDietaryConditions] = useState([]);
  const [foods, setFoods] = useState([]);
  const history = useHistory();

  Swiper.use([Navigation, Pagination]);

  useEffect(() => {
    const swiper = new Swiper(".swiper-container", {
      allowSlideNext: true,
      allowSlidePrev: true,
      allowTouchMove: false,
      speed: 1500,
      direction: "horizontal",
      slidesPerView: "1",
      centeredSlides: true,
      pagination: {
        el: ".swiper-pagination",
        type: "bullets",
        clickable: true,
      },
    });

    setMySwiper(swiper);
    setCategories([]);
    setDietaryConditions([]);
    setFoods([]);

    let unsubscribe1 = firestore.collection("foods").onSnapshot(
      (snapshot) => {
        snapshot.docChanges().forEach((change) =>
          updateState({
            foods: {
              data: [{ ...change.doc.data(), path: change.doc.ref.path }],
            },
          })
        );
      },
      (error) => {
        console.error(error);
      }
    );

    let unsubscribe2 = firestore.collection("categories").onSnapshot(
      (snapshot) => {
        snapshot.docChanges().forEach((change) =>
          updateState({
            categories: {
              data: [{ ...change.doc.data(), path: change.doc.ref.path }],
            },
          })
        );
      },
      (error) => {
        console.error(error);
      }
    );

    let unsubscribe3 = firestore.collection("dietaryconditions").onSnapshot(
      (snapshot) => {
        snapshot.docChanges().forEach((change) =>
          updateState({
            dietaryconditions: {
              data: [{ ...change.doc.data(), path: change.doc.ref.path }],
            },
          })
        );
      },
      (error) => {
        console.error(error);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    };
  }, []);

  const updateState = (obj) => {

    const { categories, foods, dietaryconditions} = obj;

    if(categories) setCategories((prevState) => [ ...reducer(prevState, categories)]);

    if(dietaryconditions) setDietaryConditions((prevState) => [ ...reducer(prevState, dietaryconditions)]);

    if(foods) {

      let {name, intolerance, category } = foods.data[0];

      if(!name) return

      try {

        let conditions = [], categories = [];

        // VALIDATION of intolerance and category keys.
  
        if(typeof intolerance === 'object') intolerance.forEach((condition) => condition.path && conditions.push(condition.path))
  
        if(typeof intolerance === 'string') conditions[0] = intolerance;
  
        if(typeof category === 'object') category.path && categories.push(category.path);
  
        if(typeof category === 'string') categories[0] = category;
  
        const newArray = { data: [{ name, intolerance: conditions, category: categories, path: foods.data[0].path }]};
  
        setFoods((prevState) => [ ...reducer(prevState, newArray)]);
 
      } catch (error) {
        console.error(error);
      }
    }
  }

  const reducer = (prevState, array) => {

    let newArray = array.data.filter((condition) => condition.name);

    let temp = prevState.map((item) => newArray.length > 0 ? item.path === newArray[0].path ? newArray[0] : item : item)

    if(prevState.length > 0 && newArray.length > 0) {
        if(prevState.some((item) => item.path === newArray[0].path)) newArray = [];
    }
    
    return [...temp, ...newArray];
  }

  return (
    <div className="swiper-container">
      <div className="swiper-wrapper">
        <div className="swiper-slide">
          <Card>
            <div
              style={{
                backgroundImage: `url(${mainLogo})`,
                height: "50vh",
                backgroundSize: "cover",
              }}
            />
            <Card.Body
              className="mt-2 text-center"
              style={{ maxWidth: "800px" }}
            >
              <h2 className="title">Discover</h2>
              <Card.Text style={{ padding: "5px" }}>
                Find venues that cater for you.
              </Card.Text>
              <Button
                size="lg"
                type="button"
                variant="success"
                onClick={() => mySwiper.slideNext()}
                style={{ width: "25%", minWidth: "140px", maxHeight: "65px" }}
              >
                Next
              </Button>
            </Card.Body>
          </Card>
          <br />
        </div>
        <div className="swiper-slide">
          <Card>
            <div
              style={{
                backgroundImage: `url(${mainLogo2})`,
                height: "50vh",
                backgroundSize: "cover",
              }}
            />
            <Card.Body
              className="mt-2 text-center"
              style={{ maxWidth: "800px" }}
            >
              <h2 className="title">Let's Get Started</h2>
              <Card.Text style={{ padding: "5px" }}>
                Create a dietary profile for foods you can't eat.
              </Card.Text>
              <Button
                size="lg"
                type="button"
                variant="success"
                onClick={() => mySwiper.slideNext()}
                style={{ width: "25%", minWidth: "140px", maxHeight: "65px" }}
              >
                Next
              </Button>
            </Card.Body>
          </Card>
          <br />
        </div>
        <div className="swiper-slide">
          <Container fluid style={{ padding: "20px" }}>
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

                  <Accordion>
                    
                  {categories.map((item, index) => (
                       <Card key={index}>
                          <Accordion.Toggle as={Card.Header} eventKey={(index + 1)}>
                          {item.name}
                          </Accordion.Toggle>
                            <Accordion.Collapse eventKey={(index + 1)}>
                          <Card.Body>
                            {foods.map((item2, index2) => (item2.category[0] === item.path || item2.category[0] === item.name) && (
                              <Col key={index2} xs={6} sm={6} md={6} lg={4}>
                                <Form.Group style={{ marginBottom: ".75rem" }}>
                                <Form.Check type="checkbox" label={item2.name} />
                                </Form.Group>
                              </Col>
                            ))}
                          </Card.Body>
                        </Accordion.Collapse>
                     </Card> 
                ))}   

                  </Accordion>
                      

                  </Form.Row>
                </Form>
              </Card.Body>
              <Card.Footer
                style={{
                  backgroundColor: "rgba(0,0,0,0)",
                  border: "none",
                  padding: "0px",
                }}
              >
                <Container
                  className="text-center"
                  style={{ maxWidth: "400px" }}
                >
                  <Button
                    onClick={() => mySwiper.slideNext()}
                    size="lg"
                    type="button"
                    variant="success"
                    className="btn btn-success btn-lg"
                    style={{
                      width: "25%",
                      minWidth: "140px",
                      maxHeight: "65px",
                    }}
                  >
                    Next
                  </Button>
                </Container>
              </Card.Footer>
            </Card>
            <br />
          </Container>
        </div>
        <div className="swiper-slide">
          <Container fluid style={{ padding: "20px" }}>
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
                      <Form.Group
                        style={{ marginBottom: ".75rem" }}
                      >
                        <Form.Check
                          type="checkbox" label={item.name}
                        />
                      </Form.Group>
                    </Col>
                   ))}
                  </Form.Row>
                </Form>
              </Card.Body>
              <Card.Footer
                style={{
                  backgroundColor: "rgba(0,0,0,0)",
                  border: "none",
                  padding: "0px",
                }}
              >
                <Container
                  className="text-center"
                  style={{ maxWidth: "400px" }}
                >
                  <Button
                    onClick={() => history.go(0)}
                    size="lg"
                    type="button"
                    variant="success"
                    className="btn btn-success btn-lg"
                    style={{
                      width: "25%",
                      minWidth: "140px",
                      maxHeight: "65px",
                    }}
                  >
                    Finish
                  </Button>
                </Container>
              </Card.Footer>
            </Card>
            <br />
          </Container>
        </div>
      </div>
      <div className="swiper-pagination"></div>
    </div>
  );
}
