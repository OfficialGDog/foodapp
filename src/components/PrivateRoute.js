import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LOGIN as loginroute } from "./routes";

const PrivateRoute = ({ children, ...rest}) => {
    const auth = useAuth();
    return (
        <Route
            {...rest}
            render={({location}) => auth.user ? (children) : (<Redirect to={{pathname: loginroute, state: { location }}}/>) }/>
    );
};

export default PrivateRoute;
