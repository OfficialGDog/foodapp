import React, { useRef, useState, useEffect } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import Wrapper from "./Wrapper";
import { useAuth } from "../../context/AuthContext";
import { Link, useHistory } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useForm, Controller } from "react-hook-form";
import { TextField, Grid, InputAdornment, IconButton } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";

export default function Register() {
  const [error, setError] = useState();
  const [message, setMessage] = useState();
  const [isLoading, setLoading] = useState(false);
  const [isHuman, setHuman] = useState(false);
  const [email, setEmail] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { handleSubmit, control, watch } = useForm();
  const recapRef = useRef();
  const password = useRef({});
  const auth = useAuth();
  const history = useHistory();
  password.current = watch("password", "");

  useEffect(() => {
    if (!auth.user.emailVerified) return;
    history.push("/");
  }, [auth.user]);

  async function onSubmit({ email, password }) {
    // Validation checks
    try {
      setError(false);
      setMessage(false);
      setLoading(true);

      if (!isHuman) {
        setLoading(false);
        setError({ captcha: "Please tick the box below" });
        return;
      }

      await auth.register({
        email,
        password,
      });

      await auth.verifyEmail();

      setEmail(email);
      setMessage(`An email has been sent to: `);

      // Account was created successfully
      setHuman(false);
    } catch (error) {
      setError(error.message);
    }

    setLoading(false);
  }

  return (
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
          <h2 id="title" className="text-center mb-4">
            Sign Up
          </h2>
          {error && !error.captcha && <Alert variant="danger">{error}</Alert>}
          {message && (
            <Alert variant="success">
              {message}
              <b>{email}</b>
              <div>Please check your email to complete signing up.</div>
            </Alert>
          )}
          <form
            id="register-form"
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
                      defaultValue=""
                      render={({
                        field: { onChange, value, ref },
                        fieldState: { invalid, error },
                      }) => (
                        <TextField
                          fullWidth
                          label="Email"
                          error={invalid}
                          helperText={error && error.message}
                          autoComplete="username"
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
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          error={invalid}
                          helperText={
                            error &&
                            error.message &&
                            (error.message.split(",").length !== 1 ? (
                              <>
                                <ul className="pl-3">
                                  {error.message
                                    .split(",")
                                    .map((item, index) => (
                                      <li key={index}>{item}</li>
                                    ))}
                                </ul>
                              </>
                            ) : (
                              error.message
                            ))
                          }
                          onChange={onChange}
                          inputRef={ref}
                          InputLabelProps={{ shrink: true }}
                          value={value}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={() => setShowPassword(!showPassword)}
                                  onMouseDown={(event) => {
                                    event.preventDefault();
                                  }}
                                  edge="end"
                                >
                                  {showPassword ? (
                                    <Visibility />
                                  ) : (
                                    <VisibilityOff />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                      rules={{
                        required: "Password is required",
                        pattern: {
                          value:
                            /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
                          message:
                            "Minimum 8 characters, At least one upper case letter [A-Z], At least one lower case letter [a-z], At least one digit [0-9], At least one special character [!£$%^&*]",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      control={control}
                      name="confirmpassword"
                      defaultValue=""
                      render={({
                        field: { onChange, value, ref },
                        fieldState: { invalid, error },
                      }) => (
                        <TextField
                          fullWidth
                          label="Confirm Password"
                          type={showPassword ? "text" : "password"}
                          error={invalid}
                          helperText={error && error.message}
                          autoComplete="off"
                          onChange={onChange}
                          inputRef={ref}
                          InputLabelProps={{ shrink: true }}
                          value={value}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={() => setShowPassword(!showPassword)}
                                  onMouseDown={(event) => {
                                    event.preventDefault();
                                  }}
                                  edge="end"
                                >
                                  {showPassword ? (
                                    <Visibility />
                                  ) : (
                                    <VisibilityOff />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                      rules={{
                        required: "Password is required",
                        validate: (value) =>
                          value === password.current ||
                          "The passwords do not match",
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
            <div
              style={{ margin: "15px 0px 15px" }}
              id="captcha"
              className="centercaptcha"
            >
              <ReCAPTCHA
                ref={recapRef}
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                size="normal"
                onExpired={() => setHuman(false)}
                onChange={() => {
                  setError(false);
                  setHuman(true);
                }}
              />
            </div>
            <Button
              disabled={isLoading}
              variant="success"
              className="w-100"
              type="submit"
              style={{ height: "3.5rem" }}
            >
              Sign Up
            </Button>
            <div className="text-center mt-3">
              Already have an account? <Link to="/login">Log In</Link>
            </div>
          </form>
          <div className="text-center">
            <Link to="/about">Developer Info 👨‍💻</Link>
          </div>
        </Card.Body>
      </Card>
    </Wrapper>
  );
}
