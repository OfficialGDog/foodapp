import Rect from 'react'
import { Redirect, Route } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LOGIN as loginroute } from "./routes"

const PrivateRoute = ({ children, ...rest}) => {
    const { currentUser } = useAuth();
    return (
        <Route
            {...rest}
            render={({location}) => currentUser ? (children) : (<Redirect to={{pathname: loginroute, state: {location}}}/>) }/>
    );
};

export default PrivateRoute;
