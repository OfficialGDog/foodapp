import React from "react";
import Home from "./main/Home";
import Register from "./authentication/Register";
import Login from "./authentication/Login";
import ForgotPassword from "./authentication/ForgotPassword";
import EditProfile from "./authentication/EditProfile";
import PrivateRoute from "./authentication/PrivateRoute";
import NotFound from "./NotFound"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {

  return (
      <Router>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/reset/password" component={ForgotPassword} />
          <PrivateRoute exact path="/" component={Home}/>
          <PrivateRoute path="/update/profile" component={EditProfile}/>
          {/* <Route component={NotFound} /> */}
        </Switch>
      </Router>
  );
}

export default App;
