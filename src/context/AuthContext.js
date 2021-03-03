import React, { useState, useEffect, useContext, createContext } from 'react';
import { FirebaseContext } from "./FirebaseContext";

const AuthContext = createContext();

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export function ProvideAuth({children}) {
    const auth = useProvideAuth();
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    return useContext(AuthContext);
};

function useProvideAuth() {
    const [user, setUser] = useState(null);
    const { firebase } = useContext(FirebaseContext);

    const login = ({ email, password }) => {
        return firebase.auth().signInWithEmailAndPassword(email, password)
        .then((response) => {
            setUser(response.user);
            return response.user;
        });
    };

    const register = ({ email, password }) => {
        return firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((response) => {
            setUser(response.user);
            return response.user;
        });
    };

    const logout = () => {
        return firebase.auth().signOut().then(() => { setUser(false); });
    };

    const resetPassword = (email) => {
        return firebase.auth().sendPasswordResetEmail(email)
        .then(() => { 
            return true; 
        });
    };

    /* 
        Subscribe to user on mount
        Because this sets state in the callback it will cause any
        component that utilizes this hook to re-render with the
        latest auth object.
    */
   
    useEffect(() => {
        return firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(false);
            }
        });
    }, [])


    // Return the user object and auth methods
    return {
        user,
        login,
        register,
        logout,
        resetPassword
    };
}