import React from "react";
import { Navbar as FNavBar, Nav } from "react-bootstrap";
import { BsSearch, BsPersonFill } from "react-icons/bs";
import { FaHeart } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const history = useHistory();

  return (
    <>
    {/*  <FNavBar expand={false} bg="light" style={{position: "fixed", bottom: "0", width: "100%"}}>
      <Nav className="navbar-expand justify-content-center w-100" activeKey="/home">
        <Nav.Item className="flex-grow-1 text-lg-right text-md-center" style={{ flexBasis: "100%", textAlign: "center" }}>
          <div className="d-flex flex-column text-reset align-items-lg-end" style={{alignItems: "center"}}>
          <Nav.Link className="d-flex flex-column" title="Home" onClick={() => history.push("/")}>
            <BsSearch className="w-auto"/>
            Search
          </Nav.Link>
          </div>
        </Nav.Item>
        <Nav.Item className="flex-grow-1 text-center" style={{ flexBasis: "100%", maxWidth: "250px" }}>
          <div className="d-inline-flex flex-column text-reset">
          <Nav.Link className="d-flex flex-column" title="Favourites" onClick={() => history.push("/favourites")}>
            <FaHeart className="w-auto" />
            Favourites
          </Nav.Link>
          </div>
        </Nav.Item>
        <Nav.Item className="flex-grow-1 text-lg-left text-md-center" style={{ flexBasis: "100%", textAlign: "center" }}>
          <div className="d-flex flex-column text-reset align-items-lg-start" style={{alignItems: "center"}}>
          <Nav.Link className="d-flex flex-column" title="Profile" onClick={() => history.push("/profile")}>
            <BsPersonFill className="w-auto"/>
            Profile
          </Nav.Link>
          </div>
        </Nav.Item>
      </Nav>
    </FNavBar>  */}
    </>
  );
}
