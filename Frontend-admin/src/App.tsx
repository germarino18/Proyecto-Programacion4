import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import ProductosPage from './pages/ProductosPage';
import ProductoDetallePage from './pages/ProductoDetallePage';
import IngredientesPage from './pages/IngredientesPage';
import CategoriasPage from './pages/CategoriasPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="productos" replace />} />
          <Route path="productos" element={<ProductosPage />} />
          <Route path="productos/:id" element={<ProductoDetallePage />} />
          <Route path="ingredientes" element={<IngredientesPage />} />
          <Route path="categorias" element={<CategoriasPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
