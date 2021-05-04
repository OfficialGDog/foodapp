import React, { useRef, useState, useEffect } from "react";
import { Form, Card, Button, Alert, ButtonGroup } from "react-bootstrap";
import Wrapper from "./Wrapper";
import { useAuth } from "../../context/AuthContext";
import { Link, useHistory } from "react-router-dom";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import ReCAPTCHA from "react-google-recaptcha";
import { useForm, Controller } from "react-hook-form";
import { TextField, Grid, makeStyles } from "@material-ui/core";
import "./Login.css";

const useStyles = makeStyles((theme) => ({}));

export default function Login() {
  const auth = useAuth();
  const [error, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isValidEmail, setValidEmail] = useState(true);
  const [isHuman, setHuman] = useState(false);
  const { handleSubmit, control, watch } = useForm();
  const history = useHistory();

  useEffect(() => {
    if (!auth.user.emailVerified) return;
    history.push("/");
  }, [auth.user]);

  async function onSubmit({ email, password }) {
    // Validation check
    try {
      setError(false);
      setLoading(true);

      if (!isHuman) {
        setLoading(false);
        setError({ captcha: "Please tick the box below" });
        return;
      }

      const user = await auth.login({ email, password });

      if (!user.emailVerified) {
        setLoading(false);
        setValidEmail(false);
        return;
      }

      history.push("/");
    } catch (error) {
      setError(error.message);
    }

    setLoading(false);
  }

  return (
    <>
      <Wrapper>
        <Card
          className="rounded"
          style={{
            height: "inherit",
            boxShadow:
              "0px 1px 5px 0px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 3px 1px -2px rgb(0 0 0 / 12%)",
            minWidth: "300px",
          }}
        >
          <Card.Body>
            <h2
              className="text-center mb-4 title"
              style={{ margin: "40px 20px 0" }}
            >
              Log In
            </h2>
            {error && !error.captcha && <Alert variant="danger">{error}</Alert>}
            {!isValidEmail && (
              <Alert variant="danger">
                Email address is not verified{" "}
                <Alert.Link>Resend verification code</Alert.Link>
              </Alert>
            )}

            <form
              style={{ margin: "20px", marginTop: "40px" }}
              onSubmit={handleSubmit((data) => onSubmit(data))}
            >
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Controller
                        control={control}
                        name="email"
                        defaultValue={auth.user.email || ""}
                        render={({
                          field: { onChange, value, ref },
                          fieldState: { invalid, error },
                        }) => (
                          <TextField
                            fullWidth
                            label="Email"
                            error={invalid}
                            helperText={error && error.message}
                            onChange={(e) =>
                              onChange(e.target.value.toLowerCase())
                            }
                            inputRef={ref}
                            InputLabelProps={{ shrink: true }}
                            value={value}
                          />
                        )}
                        rules={{
                          required: "Email is required",
                          pattern: {
                            value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                            message: "Invalid Email",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        control={control}
                        name="password"
                        defaultValue=""
                        render={({
                          field: { onChange, value, ref },
                          fieldState: { invalid, error },
                        }) => (
                          <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            error={invalid}
                            helperText={error && error.message}
                            onChange={onChange}
                            inputRef={ref}
                            InputLabelProps={{ shrink: true }}
                            value={value}
                          />
                        )}
                        rules={{
                          required: "Password is required",
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {error && error.captcha && (
                <small className="text-danger font-weight-bold">
                  Please tick the box below
                </small>
              )}
              <div style={{ margin: "15px 0px 5px" }}>
                <ReCAPTCHA
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                  size="normal"
                  onExpired={() => setHuman(false)}
                  onChange={() => {
                    setError(false);
                    setHuman(true);
                  }}
                />
              </div>
              <ButtonGroup>
                <div className="text-center p-2">
                  <Button
                    className="text-truncate float-right"
                    variant="secondary"
                    disabled={isLoading}
                    size="lg"
                    type="button"
                    style={{
                      borderRadius: ".75rem",
                      fontSize: "1rem",
                      height: "3rem",
                    }}
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
                    style={{
                      borderRadius: ".75rem",
                      fontSize: "1rem",
                      height: "3rem",
                    }}
                  >
                    Log In
                  </Button>
                </div>
              </ButtonGroup>
              <div className="mt-1 text-center">
                <Link to="/reset/password">Forgot Password?</Link>
              </div>

              <div id="social" className="col-sm-6 col-lg-12 text-center">
                <StyledFirebaseAuth
                  uiConfig={auth.uiConfig}
                  firebaseAuth={auth.singleSignIn()}
                />
              </div>
            </form>
            <div className="text-center">
              <Link to="/about">Developer Info</Link>
            </div>
          </Card.Body>
        </Card>
      </Wrapper>
    </>
  );
}
