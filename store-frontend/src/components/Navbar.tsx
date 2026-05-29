/**
 * Navbar.tsx — Barra de navegación principal (sticky en el tope).
 * - Logo izquierdo enlaza a home
 * - Buscador desktop que actualiza searchParams (sincronizado con HomePage)
 * - Links desktop: Tienda, Mis Pedidos, Admin (solo si tiene rol), Carrito (con badge), Perfil (avatar)
 * - Versión mobile: carrito, avatar, menú hamburguesa desplegable
 */

import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuth } from "../context/AuthContext";

/**
 * Navbar — Componente de navegación.
 * Sticky en la parte superior con z-50 para superponerse al contenido.
 * Sincroniza el buscador con los searchParams de la URL para que HomePage filtre.
 *
 * @returns {JSX.Element} Navbar responsivo con buscador, links y avatar
 */
export default function Navbar() {
  // --- Search params de la URL para sincronizar búsqueda con HomePage
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";

  // --- Cantidad total de items en el carrito (para el badge)
  const totalItems = useCartStore((s) =>
    s.items.reduce((acc, i) => acc + i.cantidad, 0)
  );

  const { usuario } = useAuth();            // Usuario autenticado (o null)
  const [isMenuOpen, setIsMenuOpen] = useState(false);  // Mobile: menú hamburguesa abierto/cerrado

  /**
   * handleSearchChange — Actualiza searchParams al escribir en el buscador.
   * Si hay contenido, setea ?search=valor; si está vacío, limpia el parámetro.
   *
   * @param e - Evento de cambio del input
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.trim()) {
      setSearchParams({ search: value.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  /** closeMenu — Cierra el menú mobile al hacer click en un link */
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-surface shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo → Home */}
        <Link to="/" className="flex items-center">
          <img src="/logo.png" alt="ROST" className="h-12" />
        </Link>

        {/* Desktop: Buscador */}
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
              // Botón para limpiar la búsqueda
              <button
                onClick={() => setSearchParams({}, { replace: true })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface transition-colors p-1"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Desktop: Links de navegación */}
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
          {/* Admin: solo visible si el usuario tiene rol ADMIN, STOCK o PEDIDOS */}
          {usuario && usuario.roles?.some(r => ['ADMIN', 'STOCK', 'PEDIDOS'].includes(r.rol_codigo)) && (
            <a
              href="http://localhost:5174/admin"
              className="font-body text-body-md text-tertiary hover:text-tertiary-container transition-colors font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
              Admin
            </a>
          )}
          {/* Carrito con badge de cantidad */}
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
          {/* Avatar / Perfil */}
          <Link
            to="/perfil"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="Mi perfil"
          >
            {usuario ? (
              // Usuario autenticado: muestra nombre y letra inicial
              <>
                <span className="font-body text-body-md text-on-surface-variant hover:text-primary transition-colors">
                  {usuario.nombre}
                </span>
                <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-white text-sm font-bold">
                  {usuario.nombre?.charAt(0).toUpperCase() ?? "U"}
                </div>
              </>
            ) : (
              // Visitante no autenticado: icono persona
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-lg">
                  person
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Mobile: carrito + avatar + botón hamburguesa */}
        <div className="flex md:hidden items-center gap-2">
          {/* Carrito mobile */}
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
          {/* Avatar mobile */}
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
          {/* Botón hamburguesa */}
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

      {/* Mobile: Menú desplegable */}
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
            {/* Admin link en menú mobile */}
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
