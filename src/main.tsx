import React from "react";
import { createRoot } from "react-dom/client";
// Fix: Use the path alias '@' from your vite.config.ts
// This helps the bundler resolve the files from the 'src' root.
import App from "@/App.tsx";
import "@/index.css";

// Render the main App component.
// The <App /> component (from App.tsx) already contains
// all the necessary providers like BrowserRouter and HelmetProvider.
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


