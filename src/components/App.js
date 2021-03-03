import React, { Component } from "react";
import Home from "./Home";
import Register from "./Register";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import PrivateRoute from "./PrivateRoute";
import { Container } from "react-bootstrap";
import { AuthProvider } from "../contexts/AuthContext";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";


function App() {
  return (
      <Container
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}>
        <div className="w-100" style={{ maxWidth: "400px" }}>
          <Router>
            <AuthProvider>
              <Switch>
                <PrivateRoute exact path="/">
                  <Home/>
                </PrivateRoute>
                <Route path="/login" component={Login}/>
                <Route path="/register" component={Register}/>
                <Route path="/reset/password" component={ForgotPassword}/>
              </Switch>
            </AuthProvider>
          </Router>
        </div>
      </Container>
  );
}

export default App;
