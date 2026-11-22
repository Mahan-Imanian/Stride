import React from "react";
import ReactDOM from "react-dom/client";
import "./fonts.css";
import "./index.css";
import App, { ErrorBoundary } from "./ui/App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
