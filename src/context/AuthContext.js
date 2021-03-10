import React, { useState, useEffect, useContext, createContext } from 'react';
import { FirebaseContext } from "./FirebaseContext";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export function ProvideAuth({children}) {
    const auth = useProvideAuth();
    return <AuthContext.Provider value={auth}>{auth.user != null && children}</AuthContext.Provider>;
}

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

    const verifyEmail = (currentUser) => {
        return currentUser.sendEmailVerification();   
    }

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
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(false);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // Return the user object and auth methods
    return {
        user,
        login,
        register,
        verifyEmail,
        logout,
        resetPassword
    };
}