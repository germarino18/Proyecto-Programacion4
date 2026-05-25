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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
