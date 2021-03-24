import React, { useState, useEffect, useContext, createContext } from "react";
import { FirebaseContext } from "./FirebaseContext";
import Firebase from "firebase/app";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return (
    <AuthContext.Provider value={auth}>
      {auth.user != null && children}
    </AuthContext.Provider>
  );
}

function useProvideAuth() {
  const [user, setUser] = useState(null);
  const { firebase } = useContext(FirebaseContext);

  const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
    signInSuccessUrl: '/',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
      Firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      Firebase.auth.FacebookAuthProvider.PROVIDER_ID
    ]
  };

  const signIn = () => {
    return firebase.auth()
  };

  const login = ({ email, password }) => {
    return firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((response) => {
        setUser(response.user);
        return response.user;
      });
  };

  const register = ({ email, password }) => {
    return firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((response) => {
        setUser(response.user);
        return response.user;
      });
  };

  const verifyEmail = () => {
    return firebase.auth().currentUser.sendEmailVerification()
  };

  const logout = () => {
    return firebase
      .auth()
      .signOut()
      .then(() => {
        setUser(false);
      });
  };

  const resetPassword = (email) => {
    return firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        return true;
      });
  };

  const updateEmail = (email) => {
    return firebase.auth().currentUser.updateEmail(email);
  };

  const updatePassword = (password) => {
    return firebase.auth().currentUser.updatePassword(password);
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
    resetPassword,
    updateEmail,
    updatePassword,
    signIn,
    uiConfig
  };
}
