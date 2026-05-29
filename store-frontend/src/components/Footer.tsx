/**
 * Footer.tsx — Pie de página de la aplicación.
 * - Columna 1: Logo + descripción de la marca
 * - Columna 2: Links de navegación (Tienda, Mis Pedidos, Carrito, Perfil)
 * - Columna 3: Información de contacto (ubicación, email)
 * - Copyright con año dinámico
 */

import { Link } from "react-router-dom";

/**
 * Footer — Componente de pie de página con 3 columnas responsivas.
 * El año del copyright se calcula automáticamente con new Date().getFullYear().
 *
 * @returns {JSX.Element} Footer completo
 */
export default function Footer() {
  const year = new Date().getFullYear();  // Año actual para copyright dinámico

  return (
    <footer className="bg-surface-container-high border-t border-outline-variant/30 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna 1: Brand — Logo + descripción de la marca */}
          <div>
            <img src="/logo.png" alt="ROST" className="h-10 mb-4" />
            <p className="font-body text-body-sm text-on-surface-variant leading-relaxed">
              Café de especialidad tostado en Argentina. Cada taza cuenta una
              historia.
            </p>
          </div>

          {/* Columna 2: Navegación — Links principales */}
          <div>
            <h3 className="font-headline text-headline-sm font-semibold text-on-surface mb-4">
              Navegación
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="font-body text-body-md text-on-surface-variant hover:text-primary transition-colors"
                >
                  Tienda
                </Link>
              </li>
              <li>
                <Link
                  to="/mis-pedidos"
                  className="font-body text-body-md text-on-surface-variant hover:text-primary transition-colors"
                >
                  Mis Pedidos
                </Link>
              </li>
              <li>
                <Link
                  to="/carrito"
                  className="font-body text-body-md text-on-surface-variant hover:text-primary transition-colors"
                >
                  Carrito
                </Link>
              </li>
              <li>
                <Link
                  to="/perfil"
                  className="font-body text-body-md text-on-surface-variant hover:text-primary transition-colors"
                >
                  Mi Perfil
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Contacto — Ubicación y email */}
          <div>
            <h3 className="font-headline text-headline-sm font-semibold text-on-surface mb-4">
              Contacto
            </h3>
            <p className="font-body text-body-sm text-on-surface-variant leading-relaxed">
              Mendoza, Argentina
            </p>
            <p className="font-body text-body-sm text-on-surface-variant leading-relaxed mt-1">
              rostcoffee@gmail.com
            </p>
          </div>
        </div>

        {/* Copyright dinámico */}
        <div className="border-t border-outline-variant/30 mt-8 pt-8 text-center">
          <p className="font-body text-body-sm text-on-surface-variant">
            &copy; {year} ROST Specialty Coffee. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
