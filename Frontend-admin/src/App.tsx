import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import ProductosPage from './pages/ProductosPage';
import ProductoDetallePage from './pages/ProductoDetallePage';
import IngredientesPage from './pages/IngredientesPage';
import CategoriasPage from './pages/CategoriasPage';
import CajeroPedidosPage from './pages/CajeroPedidosPage';

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
            <Route index element={<Navigate to="productos" replace />} />
            <Route
              path="productos"
              element={
                <ProtectedRoute roles={['ADMIN']}>
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
