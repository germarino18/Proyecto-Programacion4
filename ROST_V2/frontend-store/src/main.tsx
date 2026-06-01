/**
 * main.tsx — Entry point de la aplicación.
 * Carga authStore.checkSession() para restaurar la sesión al iniciar.
 * Monta la app con StrictMode.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { useAuthStore } from "./features/auth/store/authStore";
import "./index.css";

// --- Restaurar sesión al iniciar la app (antes del primer render)
useAuthStore.getState().checkSession();

// --- Render: monta la app con StrictMode
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
