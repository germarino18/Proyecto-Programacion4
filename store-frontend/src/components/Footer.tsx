import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-container-high border-t border-outline-variant/30 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <img src="/logo.png" alt="ROST" className="h-10 mb-4" />
            <p className="font-body text-body-sm text-on-surface-variant leading-relaxed">
              Café de especialidad tostado en Argentina. Cada taza cuenta una
              historia.
            </p>
          </div>

          {/* Navigation */}
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

          {/* Contact */}
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

        {/* Copyright */}
        <div className="border-t border-outline-variant/30 mt-8 pt-8 text-center">
          <p className="font-body text-body-sm text-on-surface-variant">
            &copy; {year} ROST Specialty Coffee. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
