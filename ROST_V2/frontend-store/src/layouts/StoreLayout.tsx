/**
 * StoreLayout.tsx — Layout principal de la tienda.
 * Renderiza Navbar + <Outlet /> (contenido de la ruta hija) + Footer.
 *
 * Este layout se usa como element de una Route padre sin path:
 * ```tsx
 * <Route element={<StoreLayout />}>
 *   <Route path="/" element={<HomePage />} />
 *   <Route path="/carrito" element={<CartPage />} />
 * </Route>
 * ```
 *
 * Ventajas:
 * - Navbar y Footer se mantienen montados al navegar entre rutas hijas
 * - No se repite código de layout en cada página
 * - React Router optimiza los rerenders
 */

import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/**
 * StoreLayout — Layout de la tienda con Navbar y Footer fijos.
 *
 * @returns {JSX.Element} Navbar + contenido + Footer
 */
export default function StoreLayout() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
