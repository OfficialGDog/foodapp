import React, { useEffect, useRef, useState } from "react";
import { Card, Button, Alert, Container } from "react-bootstrap";
import { useHistory } from "react-router";
import { useFood } from "../../context/FoodContext";
import { useAuth } from "../../context/AuthContext";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Grid,
  AppBar,
  Menu,
  MenuItem,
  Typography,
  Toolbar,
  IconButton,
  InputAdornment,
} from "@material-ui/core";
import SideDrawer from "../main/SideDrawer";
import Logout from "../main/Logout";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { AiOutlineMenu } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import Navbar from "../main/Navbar";

export default function EditProfile() {
  const auth = useAuth();
  const [error, setError] = useState();
  const [message, setMessage] = useState();
  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLogOutDialog, setShowLogOutDialog] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const { handleSubmit, control, watch } = useForm();
  const password = useRef({});
  const history = useHistory();
  const food = useFood();
  password.current = watch("password", "");

  useEffect(() => {
    if (!auth.user.providerData) return;
    if (!auth.user.providerData.some((data) => data.providerId === "password"))
      return setDisabled(true);
  }, [auth.user]);

  async function onSubmit({ email, password }) {
    // Validation checks
    try {
      setError(false);
      setLoading(true);
      setMessage(false);

      if (isDisabled) {
        setLoading(false);
        return setError(
          "You cannot change your email or password from a Google / Facebook account!"
        );
      }

      if (auth.user.email !== email) await auth.updateEmail(email);

      await auth.updatePassword(password);
      setMessage("Your account has been updated.");
    } catch (error) {
      setError(error.message);
    }

    setLoading(false);
  }

  return (
    <>
      <AppBar
        position="fixed"
        style={{
          backgroundColor: "white",
          color: "black",
          boxShadow: "0px 0px 0px 0px",
        }}
        onClick={() => isDrawerOpen && setDrawerOpen(false)}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(true)}
          >
            <AiOutlineMenu />
          </IconButton>
          <Typography variant="h6" noWrap style={{ flexGrow: "1" }}>
            Edit Profile
          </Typography>

          <div>
            <IconButton
              aria-label="User account"
              edge="end"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              color="inherit"
              onClick={(event) => setContextMenu(event.currentTarget)}
            >
              <BsThreeDotsVertical />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={contextMenu}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={!!contextMenu}
              onClose={() => setContextMenu(null)}
            >
              <MenuItem onClick={() => setContextMenu(null)}>
                My profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setContextMenu(null);
                  setShowLogOutDialog(true);
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <SideDrawer
        visible={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        logout={() => {
          setDrawerOpen(false);
          setShowLogOutDialog(true);
        }}
      />
      <Logout
        visible={showLogOutDialog}
        onClose={() => setShowLogOutDialog(false)}
      />
      <Container fluid onClick={() => setDrawerOpen(false)}>
        <Card style={{ marginTop: "60px" }}>
          <Card.Body style={{ maxWidth: "800px" }}>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
            <form
              style={{ margin: "20px", marginTop: "40px" }}
              onSubmit={handleSubmit((data) => onSubmit(data))}
            >
              <Grid container spacing={3}>
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
                        variant="outlined"
                        error={invalid}
                        autoComplete="username"
                        helperText={error && error.message}
                        onChange={(e) => onChange(e.target.value.toLowerCase())}
                        inputRef={ref}
                        InputLabelProps={{ shrink: true }}
                        placeholder={
                          isDisabled ? "Email cannot be changed." : ""
                        }
                        value={value}
                        disabled={isDisabled}
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
                        label="New Password"
                        type={showPassword ? "text" : "password"}
                        variant="outlined"
                        error={invalid}
                        helperText={
                          error &&
                          error.message &&
                          (error.message.split(",").length !== 1 ? (
                            <>
                              <ul className="pl-3">
                                {error.message.split(",").map((item, index) => (
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
                        autoComplete="new-password"
                        disabled={isDisabled}
                        placeholder={
                          isDisabled ? "Password cannot be changed." : ""
                        }
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
                        variant="outlined"
                        autoComplete="off"
                        helperText={error && error.message}
                        onChange={onChange}
                        inputRef={ref}
                        InputLabelProps={{ shrink: true }}
                        value={value}
                        placeholder={
                          isDisabled ? "Password cannot be changed." : ""
                        }
                        disabled={isDisabled}
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
              <div style={{ marginTop: "20px" }}>
                <Button
                  size="lg"
                  disabled={isLoading}
                  className="w-100"
                  type={isDisabled ? "button" : "submit"}
                  onClick={isDisabled ? onSubmit : null}
                >
                  Update Profile
                </Button>
              </div>
            </form>
          </Card.Body>
        </Card>
        <Container fluid style={{ padding: "20px" }}>
          <food.DietaryConditions />
        </Container>
        <div className="text-center">
          <food.updateProfileButton />
        </div>
        <br />
        <br />
        <br />
        <br />
      </Container>
      <Navbar item={2} />
    </>
  );
}
