import React, { useEffect, useState } from 'react';
import { Form, Card, Button, Alert } from "react-bootstrap";
import Swiper, { Navigation, Pagination } from 'swiper';
import 'swiper/swiper-bundle.css';
import mainLogo from '../../breakfast.png';
import mainLogo2 from '../../pizza_share.jpg';
import "./Welcome.css";

export default function Welcome() {
    let [mySwiper, setMySwiper] = useState(null)

    Swiper.use([Navigation, Pagination]);

    useEffect(() => {
        const swiper = new Swiper('.swiper-container', {
            allowSlideNext: true,
            allowSlidePrev: true,
            allowTouchMove: false,
            speed: 1500,
            direction: "horizontal",
            slidesPerView: '1',
            centeredSlides: true,
            pagination: {
                el: '.swiper-pagination',
                type: 'bullets',
                clickable: true,
            }
        });

        setMySwiper(swiper);

    }, []);

    return (

        <div className="swiper-container">
            <div className="swiper-wrapper">
                <div className="swiper-slide">
                    <Card>
                        <div style={{ backgroundImage: `url(${mainLogo})`, height: "50vh", backgroundSize: "cover" }}/>
                        <Card.Body className="mt-4 text-center" style={{maxWidth: "400px"}}>
                            <h2 className="title">Discover</h2>
                            <Card.Text style={{padding: ".5rem"}}>
                                Find venues that cater for you.
                            </Card.Text>
                            <Button size="lg" type="button" variant="success" onClick={() => mySwiper.slideNext()} className="w-50">Next</Button>
                        </Card.Body>
                    </Card>
                </div>
                <div className="swiper-slide">
                    <Card>
                        <div style={{ backgroundImage: `url(${mainLogo2})`, height: "50vh", backgroundSize: "cover" }}/>
                        <Card.Body className="mt-4 text-center" style={{maxWidth: "400px"}}>
                            <h2 className="title">Let's Get Started</h2>
                            <Card.Text style={{padding: ".5rem"}}>
                                Create a dietary profile for foods you can't eat.
                            </Card.Text>
                            <Button size="lg" type="button" variant="success" onClick={() => mySwiper.slideNext()} className="w-50">Next</Button>
                        </Card.Body>
                    </Card>
                </div>
                <div className="swiper-slide">
                    <h1 className="text-center">Dietary Conditions</h1>
                    <Button size="lg" type="button" variant="success" onClick={() => mySwiper.slideNext()}>Next</Button>
                </div>
                <div className="swiper-slide">
                    <h1 className="text-center">My Food Profile</h1>
                    <Button size="lg" type="button" variant="success">Finish</Button>
                </div>
            </div>
            <div className="swiper-pagination"></div>
        </div>
    )
};
