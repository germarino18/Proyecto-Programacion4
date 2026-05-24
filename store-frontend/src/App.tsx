import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DireccionesPage from "./pages/DireccionesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <HomePage />
            </>
          }
        />
        <Route
          path="/carrito"
          element={
            <>
              <Navbar />
              <CartPage />
            </>
          }
        />
        <Route
          path="/mis-pedidos"
          element={
            <>
              <Navbar />
              <OrdersPage />
            </>
          }
        />
        <Route
          path="/direcciones"
          element={
            <>
              <Navbar />
              <DireccionesPage />
            </>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}
