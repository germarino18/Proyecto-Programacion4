/**
 * App.tsx — Router principal de la aplicación.
 * Define todas las rutas del frontend. Envuelve todo con AuthProvider
 * para que cualquier página tenga acceso al contexto de autenticación.
 * Las rutas principales (/) renderizan Navbar y Footer comunes.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DireccionesPage from "./pages/DireccionesPage";
import ProfilePage from "./pages/ProfilePage";

/**
 * App — Componente raíz.
 * Envuelve toda la app con AuthProvider (contexto de usuario),
 * BrowserRouter (ruteo) y Routes con cada ruta definida.
 * Las rutas que muestran la tienda incluyen Navbar y Footer.
 *
 * @returns {JSX.Element} Árbol de rutas de la aplicación.
 */
export default function App() {
  return (
    // --- AuthProvider: expone usuario, login, logout y hasRole a toda la app
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/*
           * Ruta "/" — Página principal (HomePage)
           * Muestra Navbar + HomePage (con productos, hero, buscador) + Footer
           */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <HomePage />
                <Footer />
              </>
            }
          />
          {/*
           * Ruta "/carrito" — Carrito de compras
           * Muestra Navbar + CartPage (lista items, resumen, crear pedido) + Footer
           */}
          <Route
            path="/carrito"
            element={
              <>
                <Navbar />
                <CartPage />
                <Footer />
              </>
            }
          />
          {/*
           * Ruta "/mis-pedidos" — Historial de pedidos
           * Muestra Navbar + OrdersPage (lista pedidos con estados) + Footer
           */}
          <Route
            path="/mis-pedidos"
            element={
              <>
                <Navbar />
                <OrdersPage />
                <Footer />
              </>
            }
          />
          {/*
           * Ruta "/direcciones" — Gestión de direcciones
           * Muestra Navbar + DireccionesPage (CRUD direcciones) + Footer
           */}
          <Route
            path="/direcciones"
            element={
              <>
                <Navbar />
                <DireccionesPage />
                <Footer />
              </>
            }
          />
          {/*
           * Ruta "/perfil" — Perfil del usuario
           * Muestra Navbar + ProfilePage (datos usuario, direcciones) + Footer
           */}
          <Route
            path="/perfil"
            element={
              <>
                <Navbar />
                <ProfilePage />
                <Footer />
              </>
            }
          />
          {/*
           * Ruta "/login" — Inicio de sesión
           * SIN Navbar/Footer (pantalla completa centrada)
           */}
          <Route path="/login" element={<LoginPage />} />
          {/*
           * Ruta "/register" — Registro de usuario
           * SIN Navbar/Footer (pantalla completa centrada)
           */}
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
