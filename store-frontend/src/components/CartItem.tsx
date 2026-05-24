import type { CartItem as CartItemType } from "../store/cartStore";

interface Props {
  item: CartItemType;
  onUpdateCantidad: (id: number, cantidad: number) => void;
  onRemove: (id: number) => void;
}

export default function CartItem({ item, onUpdateCantidad, onRemove }: Props) {
  const subtotal = item.producto.precio_base * item.cantidad;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-200">
      <div className="w-16 h-16 bg-[#354867]/10 rounded-lg flex items-center justify-center text-2xl">
        ☕
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-[#354867]">
          {item.producto.nombre}
        </h4>
        <p className="text-sm text-gray-500">
          ${item.producto.precio_base.toFixed(2)} c/u
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateCantidad(item.producto.id, item.cantidad - 1)}
          disabled={item.cantidad <= 1}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
        >
          −
        </button>
        <span className="w-8 text-center font-medium">{item.cantidad}</span>
        <button
          onClick={() => onUpdateCantidad(item.producto.id, item.cantidad + 1)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
        >
          +
        </button>
      </div>
      <div className="w-24 text-right font-semibold text-[#354867]">
        ${subtotal.toFixed(2)}
      </div>
      <button
        onClick={() => onRemove(item.producto.id)}
        className="text-red-400 hover:text-red-600 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
