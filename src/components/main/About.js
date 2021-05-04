import React from "react";
import { Form, Card, Button, Alert, ButtonGroup } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import Wrapper from "../authentication/Wrapper";
import { Avatar } from "@material-ui/core";

export default function About() {
  const history = useHistory();
  return (
    <Wrapper>
      <Card
        className="rounded text-center"
        style={{
          height: "inherit",
          boxShadow:
            "0px 1px 5px 0px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 3px 1px -2px rgb(0 0 0 / 12%)",
          minWidth: "300px",
        }}
      >
        <Card.Body>
          <h2 className="mb-4" style={{ margin: "40px 20px 0" }}>
            About
          </h2>
          <blockquote>
            Hello, I hope you enjoy using this app. This was created for my
            client James Miller as part of my final year degree project. If you
            like what I have created and would like me to do some work for you.
            You can contact me on garethdavieslive@gmail.com Thanks for reading.
            🙂
          </blockquote>
          <p>Created by Gareth Davies (2021)</p>
          <p>University of Sunderland Web and Mobile Development student</p>
          <Button
            variant="success"
            className="w-100"
            type="submit"
            style={{ height: "3.5rem", marginTop: "20px" }}
            onClick={() => history.push("/")}
          >
            Home
          </Button>
        </Card.Body>
      </Card>
    </Wrapper>
  );
}
