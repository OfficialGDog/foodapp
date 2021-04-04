import React, { useRef, useState } from "react";
import { Form, Card, Button, Alert, Container } from "react-bootstrap";
import Wrapper from "./Wrapper";
import { useHistory } from "react-router";
import { useFood } from "../../context/FoodContext";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../main/Navbar";

export default function EditProfile() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const auth = useAuth();
  const [error, setError] = useState();
  const [message, setMessage] = useState();
  const [isLoading, setLoading] = useState(false);
  const history = useHistory();
  const food = useFood();


  async function handleSubmit(e) {
    e.preventDefault();
    // Validation checks

    try {
      setError(false);
      setLoading(true);
      setMessage(false);

      if (emailRef.current.value === auth.user.email && !(passwordRef.current.value)) {
        setLoading(false);
        return setError("You must change your email or password to continue");
      }

      if (passwordRef.current.value !== passwordConfirmRef.current.value) {
        setLoading(false);
        return setError("Passwords do not match");
      }

      if(emailRef.current.value !== auth.user.email) {
        await auth.updateEmail(emailRef.current.value);
        setMessage("Your email address has been updated, please verify before logging in.");
      }
      
      if(passwordRef.current.value && passwordConfirmRef.current.value) {
        await auth.updatePassword(passwordRef.current.value);
        setMessage("Your password has been updated");
      }
    } catch (error) {
      setError(error.message);
    }

    setLoading(false);
  }

  function logout() {
    auth.logout().then(() => history.push("/login"));
  }

  return (
    <>
    <Wrapper>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Update Profile</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                ref={emailRef}
                defaultValue={auth.user.email ?? ""}
                required
              />
            </Form.Group>
            <Form.Group id="password">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                ref={passwordRef}
                placeholder="Leave blank to keep same password"
              />
            </Form.Group>
            <Form.Group id="password-confirm">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                ref={passwordConfirmRef}
                placeholder="Leave blank to keep same password"
              />
            </Form.Group>
            <Button disabled={isLoading} className="w-100" type="submit">
              Update Profile
            </Button>
          </Form>
          <br/>
          <Button
            disabled={isLoading}
            className="w-100"
            type="submit"
            onClick={logout}
          >
            Log Out
          </Button>
        </Card.Body>
      </Card>
      <Container fluid style={{ padding: "20px" }}>
      <food.FoodCategories/>
      </Container>
      <Container fluid style={{ padding: "20px" }}>
      <food.DietaryConditions/>
      </Container>
    </Wrapper>
    <Navbar/>
    </>
  );
}
