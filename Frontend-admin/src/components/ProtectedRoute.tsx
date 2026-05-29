/**
 * ProtectedRoute.tsx — Guard de rutas protegidas
 *
 * Verifica que el usuario esté autenticado y, opcionalmente,
 * que tenga al menos uno de los roles requeridos.
 *
 * Props:
 *   - children: contenido a renderizar si pasa las verificaciones
 *   - roles: array opcional de códigos de rol (ej: ['ADMIN', 'STOCK'])
 *
 * Estados:
 *   - isLoading → muestra pantalla de "Cargando..." centrada
 *   - !usuario → redirige a la tienda (localhost:5173/login) para que inicie sesión
 *   - roles definidos y usuario sin permiso → redirige a /no-autorizado
 *   - todo ok → renderiza children
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  roles?: string[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { usuario, isLoading } = useAuth();

  /** Estado: cargando verificación de sesión */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-on-surface-variant text-lg">Cargando...</p>
      </div>
    );
  }

  /** Estado: no autenticado → redirigir a login de la tienda */
  if (!usuario) {
    window.location.href = 'http://localhost:5173/login';
    return null;
  }

  /** Estado: autenticado pero sin roles requeridos */
  if (roles) {
    const userRoles = usuario.roles?.map((ur) => ur.rol_codigo) ?? [];
    const hasAccess = roles.some((r) => userRoles.includes(r));
    if (!hasAccess) {
      return <Navigate to="/no-autorizado" replace />;
    }
  }

  /** Estado: autenticado y autorizado → renderizar hijos */
  return <>{children}</>;
}
