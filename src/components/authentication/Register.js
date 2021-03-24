import React, { useRef, useState, useCallback } from "react";
import { Form, Card, Button, Alert } from "react-bootstrap";
import Wrapper from "./Wrapper";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function Register() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const [error, setError] = useState();
  const [message, setMessage] = useState();
  const [isLoading, setLoading] = useState(false);
  const auth = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    // Validation checks

    try {
      setError(false);
      setMessage(false);
      setLoading(true);

      if (passwordRef.current.value !== passwordConfirmRef.current.value) {
        setLoading(false);
        return setError("Passwords do not match");
      }

      await auth.register({
        email: emailRef.current.value,
        password: passwordRef.current.value,
      });
      await auth.verifyEmail();
      setMessage(`An Email has been sent to: ${emailRef.current.value}`);
    } catch (error) {
      setError(error.message);
    }

    setLoading(false);
  }

  return (
    <Wrapper>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Sign Up</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="email">
              <Form.Label className="d-none d-sm-block">Email</Form.Label>
              <Form.Control
                type="email"
                ref={emailRef}
                required
                disabled={isLoading}
              />
            </Form.Group>
            <Form.Group id="password">
              <Form.Label className="d-none d-sm-block">Password</Form.Label>
              <Form.Control
                type="password"
                ref={passwordRef}
                required
                disabled={isLoading}
              />
            </Form.Group>
            <Form.Group id="password-confirm">
              <Form.Label className="d-none d-sm-block">Password Confirmation</Form.Label>
              <Form.Control
                type="password"
                ref={passwordConfirmRef}
                required
                disabled={isLoading}
              />
            </Form.Group>
            <Button disabled={isLoading} variant="success" className="w-100" type="submit">
              Sign Up
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
