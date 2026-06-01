/**
 * App.tsx — Componente raíz de la aplicación.
 * Solo contiene providers.
 * No incluye AuthProvider porque auth ahora vive en Zustand (authStore).
 *
 * Providers:
 * - QueryClientProvider: TanStack Query para data fetching
 * - BrowserRouter: React Router para navegación
 * - AppRouter: rutas definidas en router/AppRouter.tsx
 */

import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRouter from "./router/AppRouter";

// --- QueryClient: instancia única que maneja caché y fetching de TanStack Query
const queryClient = new QueryClient();

/**
 * App — Componente raíz.
 * Envuelve toda la app con los providers necesarios.
 * Sin AuthProvider porque authStore usa Zustand y no requiere Provider.
 *
 * @returns {JSX.Element} Árbol de providers + router
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
