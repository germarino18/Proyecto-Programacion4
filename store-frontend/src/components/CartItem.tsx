import type { CartItem as CartItemType } from "../store/cartStore";

interface Props {
  item: CartItemType;
  onUpdateCantidad: (id: number, cantidad: number) => void;
  onRemove: (id: number) => void;
}

export default function CartItem({ item, onUpdateCantidad, onRemove }: Props) {
  const subtotal = item.producto.precio_base * item.cantidad;

  return (
    <div className="flex items-center gap-6 p-6 bg-surface-container-high rounded-lg border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-24 h-24 rounded-lg overflow-hidden bg-primary/5 flex-shrink-0 flex items-center justify-center">
        {item.producto.imagenes_url?.[0] ? (
          <img
            src={item.producto.imagenes_url[0]}
            alt={item.producto.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="material-symbols-outlined text-3xl text-primary/30">
            local_cafe
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-headline text-headline-sm text-primary truncate">
          {item.producto.nombre}
        </h4>
        <p className="font-body text-body-sm text-on-surface-variant mt-0.5">
          ${item.producto.precio_base.toFixed(2)} c/u
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdateCantidad(item.producto.id, item.cantidad - 1)}
          disabled={item.cantidad <= 1}
          className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container disabled:opacity-50 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">remove</span>
        </button>
        <span className="w-10 text-center font-headline text-headline-sm font-bold text-on-surface">
          {item.cantidad}
        </span>
        <button
          onClick={() => onUpdateCantidad(item.producto.id, item.cantidad + 1)}
          className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
        </button>
      </div>
      <div className="w-28 text-right">
        <span className="font-headline text-headline-sm text-primary font-bold">
          ${subtotal.toFixed(2)}
        </span>
      </div>
      <button
        onClick={() => onRemove(item.producto.id)}
        className="text-on-surface-variant hover:text-error transition-colors"
      >
        <span className="material-symbols-outlined text-xl">delete</span>
      </button>
    </div>
  );
}
