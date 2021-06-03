import React, { useState, useEffect, useContext, createContext } from "react";
import { FirebaseContext } from "./FirebaseContext";
import Firebase from "firebase/app";
import { firestore } from "../firebase/config";

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
    signInFlow: "popup",
    // We will display Google and Facebook as auth providers.
    signInSuccessUrl: "/",

    signInOptions: [
      Firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      Firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    ],
  };

  const singleSignIn = () => {
    return firebase.auth();
  };

  const login = ({ email, password }) => {
    return firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(({ user }) => {
        if (!user.emailVerified) return user; // Safe guard to prevent unverified users from logging in
        user = { ...user, ...setUserData(user).then((v) => v) };
        setUser(user);
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
    return firebase.auth().currentUser.sendEmailVerification();
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

  const setUserData = async (user, newData) => {
    try {
      if (!(typeof newData === "object")) newData = {};

      const userRef = firestore.doc(`users/${user.uid}`);

      const snapshot = await userRef.get();

      const { email } = user;

      let data = { email, isNew: true };

      if (snapshot.exists) {
        const snapdata = await snapshot.data();
        data = { ...data, ...snapdata, ...newData };
      }

      setUser((user) => ({ ...user, ...data, ...newData }));

      await userRef.set({ ...data }, { merge: true });

      return { ...data };
    } catch (error) {
      console.error(error);
    }
  };

  /* 
        Subscribe to user on mount
        Because this sets state in the callback it will cause any
        component that utilizes this hook to re-render with the
        latest auth object.
    */

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      // Is the user logged in?
      if (user) {
        // Enable Facebook logins
        user.providerData.map((data) => {
          switch (data.providerId) {
            case "facebook.com":
              user = { ...user, emailVerified: true };
              break;
          }
        });

        setUserData(user)
          .then((data) => {
            user = {
              ...user,
              ...data, // Here we add the 'isNew' property and snapshot data to the currently logged in user.
            };
          })
          .catch((error) => console.log(error))
          .finally(() => setUser(user));
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
    singleSignIn,
    setUserData,
    uiConfig,
  };
}
