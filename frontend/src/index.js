import React from "react";
import ReactDOM from "react-dom/client"; // Assurez-vous d'importer depuis "react-dom/client"
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

// Remplace render() par createRoot
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
