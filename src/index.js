import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Main from "./main";

// Load environment variables
const isMaintenance = "false"; // or this value could come from an environment variable like process.env.REACT_APP_IS_MAINTENANCE

const root = ReactDOM.createRoot(document.getElementById("root"));

if (isMaintenance === "true") {
  // Redirect to maintenance page
  window.location.href = "/maintenance.html";
} else {
  root.render(<Main />);
}
