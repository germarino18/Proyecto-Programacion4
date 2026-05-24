import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Producto } from "../types";

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (producto: Producto) => void;
  removeItem: (productoId: number) => void;
  updateCantidad: (productoId: number, cantidad: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (producto) =>
        set((state) => {
          const existe = state.items.find(
            (i) => i.producto.id === producto.id
          );
          if (existe) {
            return {
              items: state.items.map((i) =>
                i.producto.id === producto.id
                  ? { ...i, cantidad: i.cantidad + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { producto, cantidad: 1 }] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.producto.id !== id),
        })),
      updateCantidad: (id, cantidad) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.producto.id === id ? { ...i, cantidad } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      total: () =>
        get().items.reduce(
          (acc, item) => acc + item.producto.precio_base * item.cantidad,
          0
        ),
    }),
    { name: "cart-storage" }
  )
);
