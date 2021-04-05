import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Button,
  Container
} from "react-bootstrap";
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
              <food.FoodCategories/>
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
          </Container>
        </div>
        <div className="swiper-slide">
          <Container fluid style={{ padding: "20px" }}>
              <food.DietaryConditions/>
                <Container
                  className="text-center"
                  style={{ maxWidth: "400px" }}
                >
                  <food.updateProfileButton/>
                </Container>
          </Container>
        </div>
      </div>
      <div className="swiper-pagination"></div>
    </div>
  );
}
