import React from "react";
import Home from "../components/Home";
import Register from "../components/Register";
import Login from "../components/Login";
import ForgotPassword from "../components/ForgotPassword";
import PrivateRoute from "../components/PrivateRoute";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {

  return (
      <Router>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/reset/password" component={ForgotPassword} />
          <PrivateRoute exact path="/" component={Home}/>
        </Switch>
      </Router>
  );
}

export default App;
