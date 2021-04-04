import React from "react";
import { Navbar as FNavBar, Nav } from "react-bootstrap";
import { BsSearch, BsPersonFill } from "react-icons/bs";
import { FaHeart } from "react-icons/fa";
import "./Navbar.css";

function handleNavigation(e) {
 // WIP
}

export default function Navbar() {
  return (
    <FNavBar bg="light" style={{position: "fixed", bottom: "0", width: "100%"}}>
      <Nav className="navbar-expand justify-content-center w-100" activeKey="/home">
        <Nav.Item className="flex-grow-1 text-lg-right text-md-center" style={{ flexBasis: "100%", textAlign: "center" }}>
          <Nav.Link className="d-flex flex-column text-reset align-items-lg-end" style={{alignItems: "center"}}>
            <BsSearch className="w-auto custom first"/>
            Search
          </Nav.Link>
        </Nav.Item>
        <Nav.Item className="flex-grow-1 text-center" style={{ flexBasis: "100%" }}>
          <Nav.Link className="d-flex flex-column text-reset">
            <FaHeart className="w-auto" />
            Favourites
          </Nav.Link>
        </Nav.Item>
        <Nav.Item className="flex-grow-1 text-lg-left text-md-center" style={{ flexBasis: "100%", textAlign: "center" }}>
          <Nav.Link className="d-flex flex-column text-reset align-items-lg-start" style={{alignItems: "center"}} onClick={handleNavigation}>
            <BsPersonFill className="w-auto custom last"/>
            Profile
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </FNavBar>
  );
}
