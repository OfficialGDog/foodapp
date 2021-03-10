import React from "react";
import Nav from "react-bootstrap/Nav";
import { BsSearch, BsPersonFill } from "react-icons/bs";
import { FaHeart } from "react-icons/fa";
import { Container  } from "react-bootstrap";

export default function Navbar() {
  return (
    <Container fluid>
      <Nav
        className="navbar-expand justify-content-center w-100 text-center"
        activeKey="/home">
        <Nav.Item className="flex-grow-1" style={{ flexBasis: "0" }}>
          <Nav.Link className="d-flex flex-column text-reset">
            <BsSearch className="w-auto" />
            Search
          </Nav.Link>
        </Nav.Item>
        <Nav.Item className="flex-grow-1" style={{ flexBasis: "0" }}>
          <Nav.Link className="d-flex flex-column text-reset">
            <FaHeart className="w-auto" />
            Favourites
          </Nav.Link>
        </Nav.Item>
        <Nav.Item className="flex-grow-1" style={{ flexBasis: "0" }}>
          <Nav.Link className="d-flex flex-column text-reset">
            <BsPersonFill className="w-auto" />
            Profile
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </Container>
  );
}
