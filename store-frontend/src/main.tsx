/**
 * main.tsx — Entry point de la aplicación.
 * Crea el QueryClient de TanStack Query y monta la aplicación React
 * envuelta en StrictMode y QueryClientProvider para que todas las
 * queries y mutations funcionen en cualquier componente hijo.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

// --- QueryClient: instancia única que maneja caché y fetching de TanStack Query
const queryClient = new QueryClient();

// --- Render: monta la app con StrictMode (modo desarrollo) y QueryClientProvider
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);

