import React from "react";
import { Card, Jumbotron, Button, Image } from "react-bootstrap";
import { useHistory } from "react-router-dom";

export default function About() {
    const history = useHistory();
  return (
    <Card>
      <Card.Header className="text-center" as="h3">
        About
      </Card.Header>
      <Jumbotron>
        <Image width="200" src="https://thealmanian.com/wp-content/uploads/2019/01/product_image_thumbnail_placeholder.png" roundedCircle />
        <h1>Gareth Davies</h1>
        <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ac turpis egestas integer eget. Ut sem viverra aliquet eget sit amet.
        </p>
        <p>
        <Button variant="success" onClick={() => history.push("/")}>Home</Button>
        </p>
      </Jumbotron>
    </Card>
  );
}
