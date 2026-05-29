/**
 * App.tsx — Router principal del Frontend Admin de ROST
 *
 * Define todas las rutas del panel admin con AuthProvider como wrapper global.
 * Las rutas hijas de /admin usan ProtectedRoute para verificar autenticación
 * y roles antes de renderizar cada página.
 *
 * Estructura de rutas:
 *   /login              → LoginPage (sesión cerrada, redirige a store)
 *   /admin              → AdminLayout con Outlet para sub-rutas
 *   /admin/productos    → ProductosPage (rol ADMIN o STOCK)
 *   /admin/productos/:id → ProductoDetallePage
 *   /admin/ingredientes → IngredientesPage (solo ADMIN)
 *   /admin/categorias   → CategoriasPage (solo ADMIN)
 *   /admin/pedidos      → CajeroPedidosPage (rol ADMIN o PEDIDOS, envuelto en ErrorBoundary)
 *   /admin/usuarios     → UsuariosPage (solo ADMIN)
 *   /no-autorizado      → Mensaje de "sin autorización"
 *   *                   → Redirige a /admin
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import ProductosPage from './pages/ProductosPage';
import ProductoDetallePage from './pages/ProductoDetallePage';
import IngredientesPage from './pages/IngredientesPage';
import CategoriasPage from './pages/CategoriasPage';
import CajeroPedidosPage from './pages/CajeroPedidosPage';
import UsuariosPage from './pages/UsuariosPage';

/** Redirige al primer módulo accesible según los roles del usuario */
function AdminIndexRedirect() {
  const { usuario, isLoading } = useAuth();
  if (isLoading) return null;
  const userRoles = usuario?.roles?.map((ur) => ur.rol_codigo) ?? [];
  if (userRoles.includes('ADMIN') || userRoles.includes('STOCK')) return <Navigate to="productos" replace />;
  if (userRoles.includes('PEDIDOS')) return <Navigate to="pedidos" replace />;
  return <Navigate to="/no-autorizado" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminIndexRedirect />} />
            <Route
              path="productos"
              element={
                <ProtectedRoute roles={['ADMIN', 'STOCK']}>
                  <ProductosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="productos/:id"
              element={<ProductoDetallePage />}
            />
            <Route
              path="ingredientes"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <IngredientesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="categorias"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <CategoriasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="pedidos"
              element={
                <ProtectedRoute roles={['ADMIN', 'PEDIDOS']}>
                  <ErrorBoundary>
                    <CajeroPedidosPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="usuarios"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <UsuariosPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/no-autorizado"
            element={
              <div className="min-h-screen flex items-center justify-center bg-[#ffeddb]">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-[#354867] mb-2">
                    Sin autorización
                  </h2>
                  <p className="text-gray-500">
                    No tenés permisos para ver esta página.
                  </p>
                </div>
              </div>
            }
          />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
