import React from "react";
import Home from "../components/Home";
import Register from "../components/Register";
import Login from "../components/Login";
import ForgotPassword from "../components/ForgotPassword";
import PrivateRoute from "../components/PrivateRoute";
import NotFound from "../components/NotFound"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {

  return (
      <Router>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/reset/password" component={ForgotPassword} />
          <PrivateRoute exact path="/" component={Home}/>
          <Route component={NotFound} />
        </Switch>
      </Router>
  );
}

export default App;
