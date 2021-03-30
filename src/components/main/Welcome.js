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

    fireTest();

  }, []);

  const fireTest = async () => {
    
    try {

      let categoryArray = [], dietaryArray = [], foodArray = [];

      // 1 API REQUEST
      console.debug("FETCHING DATA FROM FIREBASE");
      const foods = await firestore.collection("foods").limit(25).get();

      // 2 API REQUESTS
      console.debug("FETCHING DATA FROM FIREBASE");
      const categories = await firestore.collection("categories").limit(25).get();

      // 3 API REQUESTS ~ 75 items
      console.debug("FETCHING DATA FROM FIREBASE");
      const dietaryconditions = await firestore.collection("dietaryconditions").limit(25).get();

     // LOGIC
      categories.forEach((category) => { 
        const { name } = category.data(); 
        if(!name) return; // REQUIRED name value to avoid bad practice of setting document ID's directly
        categoryArray.push({name, path: category.ref.path});
      });

      dietaryconditions.forEach((condition) => {
        const { name } = condition.data();
        if(!name) return; // REQUIRED name value to avoid bad practice of setting document ID's directly
        dietaryArray.push({name, path: condition.ref.path});
      });

      foods.forEach((food) => { 
        const { name, intolerance, category } = food.data();
        let arr = [], arr2 = [""];
        if(!name) return; 
        if(intolerance) intolerance.forEach((condition) => { 
          const found = dietaryArray.find(({path}) => path === condition.path)
          if(found) arr.push(found.name);
        });
        if(category) { 
          const found = categoryArray.find(({path}) => path === category.path); 
          if(found) arr2[0] = found.name;
        };

        foodArray.push({name, intolerance: arr, category: arr2[0]});

      });

      console.log(foodArray);

    } catch (error) {
      console.log(error)
    }
  }

  const data = [
    "Vegetarian",
    "Vegan",
    "Islam",
    "Sikh",
    "Hindu",
    "Jewish",
    "Pregnancy",
    "Elderly",
    "Breastfeeding",
    "6-12 Months",
    "12-24 months",
    "5-12 years",
    "Teenagers (12+)",
    "Coeliac disease",
    "Peanut allergy",
    "Lactose intolerant",
    "Caffeine intolerant",
    "Celery allergy",
    "Fish allergy",
    "Shellfish allergy",
    "Egg allergy",
    "Milk allergy",
    "Lupin allergy",
    "Sesame allergy",
    "Mustard allergy",
    "Soya allergy",
    "Sulphur dioxide (sulphites) allergy",
    "Diabetes",
    "Cardiovascular Disease (CVD)",
  ];

  const data2 = [
    "Celery",
    "Crustaceans / shellfish",
    "Eggs",
    "Fish",
    "Gluten",
    "Lupin",
    "Cow's Milk",
    "Molluscs",
    "Mustard",
    "Peanuts",
    "Sesame",
    "Soya",
    "Sulphites",
    "Tree nuts",
    "Halal meat",
    "Alcohol",
  ];

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
                style={{width: "25%", minWidth: "140px", maxHeight: "65px"}}>
                Next
              </Button>
            </Card.Body>
          </Card>
          <br/>
        </div>
        <div className="swiper-slide">
          <Card>
            <div style={{backgroundImage: `url(${mainLogo2})`, height: "50vh", backgroundSize: "cover",  }} />
            <Card.Body className="mt-2 text-center" style={{ maxWidth: "800px" }}>
              <h2 className="title">Let's Get Started</h2>
              <Card.Text style={{ padding: "5px" }}>
                Create a dietary profile for foods you can't eat.
              </Card.Text>
              <Button
                size="lg"
                type="button"
                variant="success"
                onClick={() => mySwiper.slideNext()}
                style={{width: "25%", minWidth: "140px", maxHeight: "65px"}}>
                Next
              </Button>
            </Card.Body>
          </Card>
          <br/>
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
              <Card.Body className="text-center" style={{paddingBottom: "0px", maxWidth: "800px"}}>
                Tell us about which foods you can't eat. 
                <Form className="m-sm-4">
                  <Form.Row className="checkboxgroup">
                    {data2.map((item, index) => (
                      <Col xs={6} sm={6} md={6} lg={4}>
                        <Form.Group
                          key={index}
                          style={{ marginBottom: ".75rem" }}
                        >
                          <Form.Check type="checkbox" label={item} />
                        </Form.Group>
                      </Col>
                    ))}
                  </Form.Row>
                </Form>
              </Card.Body>
              <Card.Footer style={{backgroundColor: "rgba(0,0,0,0)", border: "none", padding: "0px"}}>
                <Container className="text-center" style={{maxWidth: "400px"}}>
                       <Button
                        onClick={() => mySwiper.slideNext()}
                        size="lg"
                        type="button"
                        variant="success"
                        className="btn btn-success btn-lg"
                        style={{width: "25%", minWidth: "140px", maxHeight: "65px"}}>
                        Next
                      </Button>
                </Container>
              </Card.Footer>
            </Card>
            <br/>
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
              <Card.Body className="text-center" style={{paddingBottom: "0px", maxWidth: "800px"}}>
                Tell us about your dietary conditions.
                <Form className="m-sm-4">
                  <Form.Row className="checkboxgroup">
                    {data.map((item, index) => (
                      <Col xs={6} sm={6} md={6} lg={4}>
                        <Form.Group
                          key={index}
                          style={{ marginBottom: ".75rem" }}
                        >
                          <Form.Check type="checkbox" label={item} />
                        </Form.Group>
                      </Col>
                    ))}
                  </Form.Row>
                </Form>
              </Card.Body>
              <Card.Footer style={{backgroundColor: "rgba(0,0,0,0)", border: "none", padding: "0px"}}>
                <Container className="text-center" style={{maxWidth: "400px"}}>

                       <Button
                        onClick={() => history.go(0)}
                        size="lg"
                        type="button"
                        variant="success"
                        className="btn btn-success btn-lg"
                        style={{width: "25%", minWidth: "140px", maxHeight: "65px"}}>
                        Finish
                      </Button>

                </Container>
              </Card.Footer>
            </Card>
            <br/>
          </Container>
        </div>
      </div>
      <div className="swiper-pagination"></div>
    </div>
  );
}
