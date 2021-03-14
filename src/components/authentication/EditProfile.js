import React, { useRef, useState } from "react";
import { Form, Card, Button, Alert } from "react-bootstrap";
import { useHistory } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function EditProfile() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const auth = useAuth();
  const [error, setError] = useState();
  const [isLoading, setLoading] = useState(false);
  const history = useHistory();

  async function handleSubmit(e) {
    e.preventDefault();
    // Validation checks

    try {
      setError(false);
      setLoading(true);

      if (emailRef.current.value !== auth.user.email) {
        await auth.updateEmail(emailRef.current.value);
        logout();
      }

      if (passwordRef.current.value !== passwordConfirmRef.current.value) {
        setLoading(false);
        return setError("Passwords do not match");
      } else if (
        passwordRef.current.value &&
        passwordConfirmRef.current.value
      ) {
        await auth.updatePassword(passwordRef.current.value);
        logout();
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
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Update Profile</h2>
          {error && <Alert variant="danger">{error}</Alert>}
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
    </>
  );
}
