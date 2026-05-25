import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const totalItems = useCartStore((s) =>
    s.items.reduce((acc, i) => acc + i.cantidad, 0)
  );
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface shadow-sm h-20">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/logo2.png" alt="ROST" className="h-12" />
        </Link>

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full bg-surface-container-low rounded-lg pl-10 pr-4 py-2.5 font-body text-body-md text-on-surface placeholder:text-on-surface-variant/60 border-none outline-none focus:ring-2 focus:ring-primary/30"
            />
          </form>
        </div>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="font-body text-body-md text-on-surface-variant hover:text-primary transition-colors"
          >
            Tienda
          </Link>
          <Link
            to="/mis-pedidos"
            className="font-body text-body-md text-on-surface-variant hover:text-primary transition-colors"
          >
            Mis Pedidos
          </Link>
          <Link to="/carrito" className="relative p-1">
            <span className="material-symbols-outlined text-on-surface text-2xl hover:text-primary transition-colors">
              shopping_cart
            </span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-tertiary text-on-tertiary text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold px-1">
                {totalItems}
              </span>
            )}
          </Link>
          <Link
            to="/perfil"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="Mi perfil"
          >
            {usuario ? (
              <>
                <span className="hidden md:block font-body text-body-md text-on-surface-variant hover:text-primary transition-colors">
                  {usuario.nombre}
                </span>
                <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-white text-sm font-bold">
                  {usuario.nombre?.charAt(0).toUpperCase() ?? 'U'}
                </div>
              </>
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-lg">
                  person
                </span>
              </div>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
