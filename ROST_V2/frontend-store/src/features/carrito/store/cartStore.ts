/**
 * cartStore.ts — Estado global del carrito de compras con Zustand.
 * Persiste automáticamente en localStorage bajo la clave "cart-storage".
 *
 * Funciones disponibles via useCartStore():
 * - items: CartItem[] — lista de productos en el carrito
 * - addItem(producto): agrega un producto o incrementa cantidad si ya existe
 * - removeItem(productoId): elimina un item del carrito
 * - updateCantidad(productoId, cantidad): actualiza la cantidad de un item
 * - clearCart(): vacía el carrito
 * - total(): calcula el subtotal sumando precio_base * cantidad de cada item
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Producto } from "../../../types";

/**
 * CartItem — Item individual dentro del carrito.
 * producto: datos completos del producto (precio, nombre, imagen, etc.)
 * cantidad: unidades seleccionadas
 */
export interface CartItem {
  producto: Producto;
  cantidad: number;
}

// --- Tipo del store del carrito
interface CartStore {
  items: CartItem[];
  addItem: (producto: Producto) => void;
  removeItem: (productoId: number) => void;
  updateCantidad: (productoId: number, cantidad: number) => void;
  clearCart: () => void;
  total: () => number;
}

/**
 * useCartStore — Store Zustand con persistencia en localStorage.
 * Se usa como hook: const { items, addItem, total } = useCartStore()
 *
 * Persist middleware: guarda/restaura automáticamente en localStorage
 * bajo la clave "cart-storage".
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],  // Estado inicial: carrito vacío

      /**
       * addItem — Agrega un producto al carrito.
       * - Si el producto ya existe, incrementa su cantidad en 1.
       * - Si no existe, lo agrega con cantidad 1.
       *
       * @param producto - Producto a agregar (objeto completo)
       */
      addItem: (producto) =>
        set((state) => {
          const existe = state.items.find(
            (i) => i.producto.id === producto.id
          );
          if (existe) {
            // Ya está en el carrito → incrementa cantidad
            return {
              items: state.items.map((i) =>
                i.producto.id === producto.id
                  ? { ...i, cantidad: i.cantidad + 1 }
                  : i
              ),
            };
          }
          // No está en el carrito → agrega con cantidad 1
          return { items: [...state.items, { producto, cantidad: 1 }] };
        }),

      /**
       * removeItem — Elimina un producto del carrito por su ID.
       *
       * @param id - ID del producto a eliminar
       */
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.producto.id !== id),
        })),

      /**
       * updateCantidad — Actualiza la cantidad de un producto específico.
       * Permite tanto incrementar como decrementar.
       *
       * @param id - ID del producto
       * @param cantidad - Nueva cantidad (debe ser >= 1)
       */
      updateCantidad: (id, cantidad) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.producto.id === id ? { ...i, cantidad } : i
          ),
        })),

      /**
       * clearCart — Vacía el carrito completamente.
       * Se usa después de confirmar un pedido exitosamente.
       */
      clearCart: () => set({ items: [] }),

      /**
       * total — Calcula el subtotal del carrito.
       * Suma precio_base * cantidad de cada item.
       *
       * @returns {number} Subtotal total del carrito
       */
      total: () =>
        get().items.reduce(
          (acc, item) => acc + item.producto.precio_base * item.cantidad,
          0
        ),
    }),
    { name: "cart-storage" }  // Clave en localStorage
  )
);
