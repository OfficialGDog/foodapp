import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import "bootstrap/dist/css/bootstrap.min.css";
import { FirebaseContext } from "./context/FirebaseContext";
import { firebase } from "./firebase/config";
import { ProvideAuth } from "./context/AuthContext";

ReactDOM.render(
  <React.StrictMode>
    <FirebaseContext.Provider value={{ firebase }}>
      <ProvideAuth>
        <App />
      </ProvideAuth>
    </FirebaseContext.Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
