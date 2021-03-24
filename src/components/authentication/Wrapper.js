import React from "react";
import { Container } from "react-bootstrap";
import "./Wrapper.css";

export default function Wrapper({children}) {
  return (
    <Container className="d-flex align-items-center justify-content-center px-0" style={{ minHeight: "100vh", minWidth: "320px" }}>
      <div className="w-100 wrapper" style={{ maxWidth: "420px", padding: "25px" }}>
        {children}
      </div>
    </Container>
  );
}
