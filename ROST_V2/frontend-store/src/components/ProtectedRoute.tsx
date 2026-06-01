/**
 * ProtectedRoute.tsx — Layout de guardia para rutas protegidas.
 * Usa useAuthStore para verificar si el usuario está autenticado.
 *
 * Modo de uso (como layout route):
 * ```tsx
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/carrito" element={<CartPage />} />
 * </Route>
 * ```
 *
 * Estados:
 * - LOADING: muestra spinner mientras se verifica la sesión
 * - NO AUTENTICADO: redirige a /login con Navigate
 * - AUTENTICADO: renderiza <Outlet /> con las rutas hijas
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../features/auth/store/authStore";

/**
 * ProtectedRoute — Componente de guardia que protege rutas hijas.
 * Se usa como element de una Route padre sin path.
 *
 * @returns {JSX.Element} Outlet si está autenticado, Navigate si no
 */
export default function ProtectedRoute() {
  const usuario = useAuthStore((s) => s.usuario);
  const isLoading = useAuthStore((s) => s.isLoading);

  // --- Estado LOADING: verificando sesión
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-body text-body-md text-on-surface-variant">
          Verificando sesión...
        </p>
      </div>
    );
  }

  // --- NO AUTENTICADO: redirige al login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // --- AUTENTICADO: renderiza rutas hijas
  return <Outlet />;
}
