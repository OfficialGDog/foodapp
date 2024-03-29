import React, { useState, useEffect } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import Wrapper from "./Wrapper";
import { useAuth } from "../../context/AuthContext";
import { Link, useHistory } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { TextField } from "@material-ui/core";

export default function ForgotPassword() {
  const auth = useAuth();
  const [error, setError] = useState();
  const [message, setMessage] = useState();
  const [isLoading, setLoading] = useState(false);
  const [email, setEmail] = useState(null);
  const history = useHistory();
  const { handleSubmit, control } = useForm();

  useEffect(() => {
    if (!auth.user.emailVerified) return;
    history.push("/");
  }, [auth.user]);

  async function onSubmit({ email }) {
    // Validation check
    try {
      setMessage(false);
      setLoading(true);
      await auth.resetPassword(email);
      setEmail(email);
      setMessage(`Instructions sent to: `);
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
            Reset Password
          </h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && (
            <Alert variant="success">
              {message}
              <b>{email}</b>
            </Alert>
          )}
          <form
            id="reset-form"
            onSubmit={handleSubmit((data) => onSubmit(data))}
            style={{ padding: "10px" }}
          >
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
                  autoComplete="username"
                  onChange={(e) => onChange(e.target.value.toLowerCase())}
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

            <Button
              disabled={isLoading}
              variant="success"
              className="w-100"
              type="submit"
              style={{ height: "3.5rem", marginTop: "20px" }}
            >
              Reset Password
            </Button>
          </form>
          <div className="text-center mt-3">
            Already have an account? <Link to="/login">Log In</Link>
          </div>
          <div className="text-center p-2">
            <Link to="/about">Developer Info 👨‍💻</Link>
          </div>
        </Card.Body>
      </Card>
    </Wrapper>
  );
}
