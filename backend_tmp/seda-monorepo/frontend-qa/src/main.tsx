
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/globals.css";

const root = createRoot(document.getElementById("root")!);
const isPrelaunchEnv = import.meta.env.VITE_PRELAUNCH === 'true';
const prelaunchOverride = (() => {
  try { return localStorage.getItem('prelaunch_override') === 'true'; } catch { return false; }
})();
const isPrelaunch = isPrelaunchEnv && !prelaunchOverride;

if (isPrelaunch) {
  // Avoid importing the full app (and Supabase) in prelaunch mode
  import("./PrelaunchApp").then(({ default: PrelaunchApp }) => {
    root.render(
      <StrictMode>
        <PrelaunchApp />
      </StrictMode>
    );
  });
} else {
  import("./App").then(({ default: App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
 
