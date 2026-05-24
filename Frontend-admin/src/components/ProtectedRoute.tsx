import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  roles?: string[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { usuario, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-on-surface-variant text-lg">Cargando...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (roles) {
    const userRoles = usuario.roles?.map((ur) => ur.rol_codigo) ?? [];
    const hasAccess = roles.some((r) => userRoles.includes(r));
    if (!hasAccess) {
      return <Navigate to="/no-autorizado" replace />;
    }
  }

  return <>{children}</>;
}
