import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";
  const totalItems = useCartStore((s) =>
    s.items.reduce((acc, i) => acc + i.cantidad, 0)
  );
  const { usuario } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.trim()) {
      setSearchParams({ search: value.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-surface shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/logo.png" alt="ROST" className="h-12" />
        </Link>

        {/* Desktop search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar productos..."
              className="w-full bg-surface-container-low rounded-lg pl-10 pr-10 py-2.5 font-body text-body-md text-on-surface placeholder:text-on-surface-variant/60 border-none outline-none focus:ring-2 focus:ring-primary/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchParams({}, { replace: true })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface transition-colors p-1"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
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
          {usuario && usuario.roles?.some(r => ['ADMIN', 'STOCK', 'PEDIDOS'].includes(r.rol_codigo)) && (
            <a
              href="http://localhost:5173/admin"
              className="font-body text-body-md text-tertiary hover:text-tertiary-container transition-colors font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
              Admin
            </a>
          )}
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
                <span className="font-body text-body-md text-on-surface-variant hover:text-primary transition-colors">
                  {usuario.nombre}
                </span>
                <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-white text-sm font-bold">
                  {usuario.nombre?.charAt(0).toUpperCase() ?? "U"}
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

        {/* Mobile: cart + avatar + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link to="/carrito" className="relative p-1">
            <span className="material-symbols-outlined text-on-surface text-2xl">
              shopping_cart
            </span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-tertiary text-on-tertiary text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold px-1">
                {totalItems}
              </span>
            )}
          </Link>
          <Link to="/perfil" title="Mi perfil">
            {usuario ? (
              <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-white text-sm font-bold">
                {usuario.nombre?.charAt(0).toUpperCase() ?? "U"}
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-lg">
                  person
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 text-on-surface hover:text-primary transition-colors"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <span className="material-symbols-outlined text-2xl">
              {isMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-surface border-t border-outline-variant/30 shadow-lg">
          <div className="px-6 py-4 space-y-1">
            <Link
              to="/"
              onClick={closeMenu}
              className="block font-body text-body-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors rounded-lg px-3 py-2.5"
            >
              Tienda
            </Link>
            <Link
              to="/mis-pedidos"
              onClick={closeMenu}
              className="block font-body text-body-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors rounded-lg px-3 py-2.5"
            >
              Mis Pedidos
            </Link>
            {usuario && usuario.roles?.some(r => ['ADMIN', 'STOCK', 'PEDIDOS'].includes(r.rol_codigo)) && (
              <a
                href="http://localhost:5174/admin"
                onClick={closeMenu}
                className="flex items-center gap-2 font-body text-body-md text-tertiary hover:text-tertiary-container hover:bg-surface-container-low transition-colors rounded-lg px-3 py-2.5 font-semibold"
              >
                <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                Panel Admin
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
