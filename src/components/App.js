import React from "react";
import Home from "./main/Home";
import About from "./main/About";
import Register from "./authentication/Register";
import Login from "./authentication/Login";
import ForgotPassword from "./authentication/ForgotPassword";
import EditProfile from "./authentication/EditProfile";
import PrivateRoute from "./authentication/PrivateRoute";
import Favourites from "./main/Favourites";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {

  return (
      <Router>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/reset/password" component={ForgotPassword} />
          <Route path="/about" component={About} />
          <PrivateRoute exact path="/" component={Home}/>
          <PrivateRoute path="/profile" component={EditProfile}/>
          <PrivateRoute path="/favourites" component={Favourites}/>
          {/* Redirect the user if they go to a unknown route  */}
          <PrivateRoute component={Home} />
        </Switch>
      </Router>
  );
}

export default App;
