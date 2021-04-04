import React from "react";
import { Redirect, Route } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Welcome from "../main/Welcome";
import { ProvideFood } from '../../context/FoodContext';

const PrivateRoute = ({ component: RouteComponent, ...rest }) => {
  const auth = useAuth();
  return (
    <Route
      {...rest}
      render={(routeProps) =>
        auth.user && auth.user.emailVerified ? (
          <ProvideFood>
            {auth.user.isNew ? <Welcome /> : <RouteComponent {...routeProps} />}
          </ProvideFood>
        ) : (
          <Redirect to={{ pathname: "/login" }} />
        )
      }
    />
  );
};

export default PrivateRoute;
