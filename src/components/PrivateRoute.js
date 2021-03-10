import React from 'react';
import { Redirect, Route } from 'react-router-dom';
//import { useAuth } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ component: RouteComponent, ...rest}) => {
    const auth = useAuth();
    setTimeout(() => console.log(auth.user), 5000);
    return (
        <Route
            {...rest}
            render={ routeProps => auth.user ? (<RouteComponent {...routeProps}/>) : (<Redirect to={{pathname: "/login"}}/>) }/>
    );
};

export default PrivateRoute;
