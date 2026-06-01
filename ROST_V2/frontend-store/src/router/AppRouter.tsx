/**
 * AppRouter.tsx — Router principal de la tienda.
 * Define todas las rutas usando layouts y guards:
 * - StoreLayout: Navbar + Footer + <Outlet />
 * - ProtectedRoute: verifica autenticación antes de renderizar rutas hijas
 *
 * Estructura:
 * - /login, /register: públicas, sin layout
 * - /* (Home, Carrito, etc.): con StoreLayout (Navbar + Footer)
 *   - /carrito, /mis-pedidos, /direcciones, /perfil: protegidas (requieren login)
 */

import { Routes, Route, Navigate } from "react-router-dom";
import StoreLayout from "../layouts/StoreLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import HomePage from "../features/home/pages/HomePage";
import CartPage from "../features/carrito/pages/CartPage";
import OrdersPage from "../features/pedidos/pages/OrdersPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import DireccionesPage from "../features/direccion/pages/DireccionesPage";
import ProfilePage from "../features/usuario/pages/ProfilePage";

/**
 * AppRouter — Configuración de rutas de la tienda.
 * No incluye providers (QueryClient, BrowserRouter) — esos van en App.tsx.
 *
 * @returns {JSX.Element} Árbol de rutas de React Router
 */
export default function AppRouter() {
  return (
    <Routes>
      {/* Rutas públicas SIN layout (sin Navbar/Footer) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas CON layout compartido (Navbar + Footer) */}
      <Route element={<StoreLayout />}>
        {/* Home: pública */}
        <Route path="/" element={<HomePage />} />

        {/* Rutas protegidas (requieren autenticación) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/mis-pedidos" element={<OrdersPage />} />
          <Route path="/direcciones" element={<DireccionesPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Catch-all: redirige a home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
