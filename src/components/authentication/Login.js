import React, { useRef, useState, useEffect } from "react";
import {
  Form,
  Card,
  Button,
  Alert,
  ButtonGroup
} from "react-bootstrap";
import Wrapper from "./Wrapper";
import { useAuth } from "../../context/AuthContext";
import { Link, useHistory } from "react-router-dom";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import ReCAPTCHA from "react-google-recaptcha";
import "./Login.css";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const auth = useAuth();
  const [error, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isValidEmail, setValidEmail] = useState(true);
  const [isHuman, setHuman] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if(!auth.user.emailVerified) return
    history.push("/"); 
  }, [auth.user]);

  async function handleSubmit(e) {
    e.preventDefault();
    // Validation check
    try {
      setError(false);
      setLoading(true);

      if(!isHuman) {
        setLoading(false);
        setError(`Are you Human?`);
        return;
      }

      const user = await auth.login({
        email: emailRef.current.value,
        password: passwordRef.current.value,
      });

      if (!user.emailVerified) {
        setLoading(false);
        setValidEmail(false);
        return;
      }

      history.push("/");

      console.log("Login Successfull!");

    } catch (error) {
      setError(error.message);
    }

    setLoading(false);
    
  }

  return (
    <>
      <Wrapper>
        <Card className="shadow-sm rounded" style={{ height: "inherit" }}>
          <Card.Body>
            <h2
              className="text-center mb-4 title"
              style={{ margin: "40px 20px 0" }}
            >
              Log In
            </h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {!isValidEmail && (
              <Alert variant="danger">
                Email address is not verified{" "}
                <Alert.Link>Resend verification code</Alert.Link>
              </Alert>
            )}
            <Form
              id="login"
              className="col-sm-6 col-lg-12"
              style={{ padding: "10px" }}
              onSubmit={handleSubmit}
            >
              <Form.Group id="email">
                <Form.Label className="d-none d-sm-block">Email</Form.Label>
                <Form.Control
                  type="email"
                  ref={emailRef}
                  defaultValue={auth.user.email ?? ""}
                  placeholder="name@example.com"
                  required
                />
              </Form.Group>
              <Form.Group id="password">
                <Form.Label className="d-none d-sm-block">Password</Form.Label>
                <Form.Control type="password" ref={passwordRef} required placeholder="••••••••"/>
              </Form.Group>
              <ReCAPTCHA sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY} size="normal" onExpired={() => setHuman(false)} onChange={() => setHuman(true)}/>
              <ButtonGroup>
                <div className="text-center p-2">
                  <Button
                    className="text-truncate float-right"
                    variant="secondary"
                    disabled={isLoading}
                    size="lg"
                    type="button"
                    style={{ borderRadius: ".75rem", fontSize: "1rem" }}
                    onClick={() => history.push("/register")}
                  >
                    Sign Up
                  </Button>
                </div>
                <div className="text-center p-2">
                  <Button
                    className="text-truncate float-left"
                    variant="success"
                    disabled={isLoading}
                    size="lg"
                    type="submit"
                    style={{ borderRadius: ".75rem", fontSize: "1rem" }}>
                    Log In
                  </Button>
                </div>
              </ButtonGroup>
              <div className="mt-1 text-center">
                <Link to="/reset/password">Forgot Password?</Link>
              </div>
            </Form>
            <div id="social" className="col-sm-6 col-lg-12 text-center">
              <StyledFirebaseAuth
                uiConfig={auth.uiConfig}
                firebaseAuth={auth.singleSignIn()}
              />
            </div>
          </Card.Body>
        </Card>
      </Wrapper>
    </>
  );
}
