import React from "react";
import { Container } from "react-bootstrap";
import "./Wrapper.css";
import { Image } from "react-bootstrap";
import logo from "../../logo-transparent.png";

export default function Wrapper({ children }) {
  return (
    <Container
      className="d-flex align-items-center justify-content-center px-0"
      style={{ minHeight: "100vh", minWidth: "320px" }}
    >
      <div
        className="w-100 wrapper"
        style={{ maxWidth: "420px", padding: "25px" }}
      >
        {children}
      </div>
      <a
        className="anchorlogo topleft"
        href="https://grapesoftware.co.uk/"
        target="_blank"
        rel="noopener noreferrer"
        title="Visit Grape Software"
      >
        <Image
          alt="Company Logo"
          draggable={false}
          width="125px"
          src={logo}
          style={{ background: "#fafafa" }}
        />
      </a>
    </Container>
  );
}
