import type { Producto } from "../types";

interface Props {
  producto: Producto;
  onAddToCart: (p: Producto) => void;
}

export default function ProductCard({ producto, onAddToCart }: Props) {
  const sinStock = producto.stock_cantidad === 0;
  const noDisponible = !producto.disponible;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition hover:shadow-md ${
        noDisponible ? "opacity-60" : ""
      }`}
    >
      <div className="h-40 bg-[#354867]/10 flex items-center justify-center text-4xl">
        ☕
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-[#354867]">
          {producto.nombre}
        </h3>
        {producto.descripcion && (
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">
            {producto.descripcion}
          </p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-[#c8a97e]">
            ${producto.precio_base.toFixed(2)}
          </span>
          {producto.unidad_venta && (
            <span className="text-xs text-gray-400">
              / {producto.unidad_venta.simbolo}
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          {sinStock && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
              Sin stock
            </span>
          )}
          {noDisponible && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
              No disponible
            </span>
          )}
        </div>
        <button
          onClick={() => onAddToCart(producto)}
          disabled={noDisponible}
          className="mt-3 w-full bg-[#c8a97e] text-white py-2 rounded-lg font-medium hover:bg-[#b8966a] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {noDisponible ? "No disponible" : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );
}
