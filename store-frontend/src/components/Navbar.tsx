import { Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";

export default function Navbar() {
  const totalItems = useCartStore((s) =>
    s.items.reduce((acc, i) => acc + i.cantidad, 0)
  );

  return (
    <nav className="bg-[#354867] text-white px-6 py-4 flex items-center justify-between shadow-md">
      <Link to="/" className="flex items-center">
        <img src="/logo2.png" alt="ROST" className="h-10" />
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/" className="hover:text-[#c8a97e] transition-colors">
          Tienda
        </Link>
        <Link to="/mis-pedidos" className="hover:text-[#c8a97e] transition-colors">
          Mis Pedidos
        </Link>
        <Link to="/carrito" className="relative hover:text-[#c8a97e] transition-colors">
          🛒 Carrito
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
