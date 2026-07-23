import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

function renderReactApp(container: Element) {
  createRoot(container).render(<App />);
}

// Expose mount hook for LWC (loadScript runs in window scope).
declare global {
  interface Window {
    renderReactApp?: (container: Element) => void;
  }
  // eslint-disable-next-line no-var
  var renderReactApp: ((container: Element) => void) | undefined;
}

if (typeof globalThis !== "undefined") {
  globalThis.renderReactApp = renderReactApp;
}
if (typeof window !== "undefined") {
  window.renderReactApp = renderReactApp;
}

function mountStandaloneApp() {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(<App />);
  }
}

// index.html loads the bundle from <head>; #root is in <body> — wait for DOM.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountStandaloneApp);
} else {
  mountStandaloneApp();
}
