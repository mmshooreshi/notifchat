import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./app.css";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(console.error);
}
