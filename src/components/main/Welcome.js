import React, { useEffect, useState } from "react";
import { Card, Button, Container } from "react-bootstrap";
import Swiper, { Navigation, Pagination } from "swiper";
import "swiper/swiper-bundle.css";
import { useHistory } from "react-router-dom";
import { useFood } from "../../context/FoodContext";
import mainLogo from "../../breakfast.png";
import mainLogo2 from "../../pizza_share.jpg";
import "./Welcome.css";

export default function Welcome() {
  let [mySwiper, setMySwiper] = useState(null);
  const history = useHistory();
  const food = useFood();

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
  }, []);

  useEffect(() => {
    if (!food.isSaved) return;
    history.go("/");
  }, [food.isSaved]);

  return (
    <div className="swiper-container">
      <div className="swiper-wrapper">
        <div className="swiper-slide">
          <Card style={{ height: "100vh" }}>
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
                style={{
                  minWidth: "140px",
                  maxHeight: "65px",
                  padding: "12px 75px",
                }}
              >
                Next
              </Button>
            </Card.Body>
          </Card>
          <br />
        </div>
        <div className="swiper-slide">
          <Card style={{ height: "100vh" }}>
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
                style={{
                  padding: "12px 75px",
                  minWidth: "140px",
                  maxHeight: "65px",
                }}
              >
                Next
              </Button>
            </Card.Body>
          </Card>
          <br />
        </div>
        <div className="swiper-slide">
          <Container fluid style={{ padding: "25px" }}>
            <Card>
              <Card.Body
                className="mt-2 text-center"
                style={{ maxWidth: "800px", padding: "0px" }}
              >
                <food.FoodCategories />
                <div className="m-4">
                  <Button
                    onClick={() => mySwiper.slideNext()}
                    size="lg"
                    type="button"
                    variant="success"
                    className="btn btn-success btn-lg"
                    style={{
                      padding: "12px 75px",
                      minWidth: "140px",
                      maxHeight: "65px",
                    }}
                  >
                    Next
                  </Button>
                </div>
                <br />
              </Card.Body>
            </Card>
          </Container>
        </div>
        <div className="swiper-slide">
          <Container fluid style={{ padding: "25px" }}>
            <Card>
              <Card.Body
                className="mt-2 text-center"
                style={{ maxWidth: "800px" }}
              >
                <food.DietaryConditions />

                <div
                  style={{
                    display: "contents",
                    padding: "12px 75px 12px 75px",
                  }}
                >
                  <food.updateProfileButton label="Finish" />
                </div>
              </Card.Body>
            </Card>
            <br />
          </Container>
        </div>
      </div>
      <div
        className="swiper-pagination"
        style={{
          overflow: "hidden",
          lineHeight: "50px",
          backgroundColor: "#fafafa",
        }}
      ></div>
    </div>
  );
}
