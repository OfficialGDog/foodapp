import React, { useRef, useState } from "react";
import { Form, Card, Button, Alert } from "react-bootstrap";
import Wrapper from "./Wrapper";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const emailRef = useRef();
  const auth = useAuth();
  const [error, setError] = useState();
  const [message, setMessage] = useState();
  const [isLoading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    // Validation check
    try {
      setMessage(false);
      setLoading(true);
      await auth.resetPassword(emailRef.current.value);
      setMessage(`Instructions sent to: ${emailRef.current.value}`);
    } catch (error) {
      setError(error.message);
    }

    setLoading(false);
  }

  return (
    <Wrapper>
      <Card className="shadow-sm rounded" style={{ height: "inherit" }}>
        <Card.Body>
          <h2 className="text-center mb-4" style={{ margin: "40px 20px 0" }}>Reset Password</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleSubmit} style={{padding: "10px"}}>
            <Form.Group id="email">
              <Form.Label className="d-none d-sm-block">Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required />
            </Form.Group>
            <Button disabled={isLoading} variant="success" className="w-100" type="submit">
              Reset Password
            </Button>
          </Form>
          <div className="text-center mt-3">
          Already have an account? <Link to="/login">Log In</Link>
          </div>
        </Card.Body>
      </Card>
    </Wrapper>
  );
}
