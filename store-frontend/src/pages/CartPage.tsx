/**
 * CartPage.tsx — Página del carrito de compras.
 * Muestra:
 * - Lista de CartItem con controles de cantidad y eliminar
 * - Resumen del pedido: subtotal, envío, IVA, total
 * - Selector de dirección de entrega (fetch GET /direcciones)
 * - Selector de forma de pago (fetch GET /formas-pago)
 * - Botón "Confirmar Pedido" (mutation POST /pedidos)
 *
 * Estados:
 * - Carrito vacío: mensaje + botón "Ir a la tienda"
 * - Carrito con items: formulario completo + resumen
 * - Error en mutation: mensaje de error
 */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useCartStore } from "../store/cartStore";
import CartItemComponent from "../components/CartItem";
import type { DireccionRead, FormaPago } from "../types";

/**
 * CartPage — Página principal del carrito.
 * Integra el store Zustand (cartStore) con queries de TanStack Query
 * para direcciones y formas de pago.
 *
 * @returns {JSX.Element} Vista del carrito con items y resumen
 */
export default function CartPage() {
  // --- Store del carrito: items, acciones y cálculo de total
  const { items, updateCantidad, removeItem, clearCart, total } =
    useCartStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- Estado local del formulario: dirección y forma de pago seleccionadas
  const [direccionId, setDireccionId] = useState<number | "">("");
  const [formaPagoId, setFormaPagoId] = useState<number | "">("");

  /**
   * Query: GET /direcciones
   * Obtiene las direcciones del usuario autenticado.
   * Cacheada con queryKey ["direcciones"].
   */
  const { data: direcciones } = useQuery<DireccionRead[]>({
    queryKey: ["direcciones"],
    queryFn: () => api.get("/direcciones").then((r) => r.data),
  });

  /**
   * Query: GET /formas-pago
   * Obtiene las formas de pago disponibles.
   * Cacheada con queryKey ["formas-pago"].
   */
  const { data: formasPago } = useQuery<FormaPago[]>({
    queryKey: ["formas-pago"],
    queryFn: () => api.get("/formas-pago").then((r) => r.data),
  });

  /**
   * Mutation: POST /pedidos
   * Crea un nuevo pedido con: dirección, forma de pago e items del carrito.
   * On success: limpia el carrito, invalida query de pedidos y redirige.
   */
  const crearPedidoMutation = useMutation({
    mutationFn: (data: {
      direccion_id: number;
      forma_pago_id: number;
      items: { producto_id: number; cantidad: number }[];
    }) => api.post("/pedidos", data).then((r) => r.data),
    onSuccess: () => {
      clearCart();                                             // Vacía el carrito
      queryClient.invalidateQueries({ queryKey: ["pedidos"] }); // Refresca pedidos
      navigate("/mis-pedidos");                                // Redirige a pedidos
    },
  });

  /**
   * handleConfirmar — Valida y envía el pedido al backend.
   * Si falta dirección o forma de pago, no hace nada.
   */
  const handleConfirmar = () => {
    if (!direccionId || !formaPagoId) return;
    crearPedidoMutation.mutate({
      direccion_id: Number(direccionId),
      forma_pago_id: Number(formaPagoId),
      items: items.map((i) => ({
        producto_id: i.producto.id,
        cantidad: i.cantidad,
      })),
    });
  };

  // --- Estado EMPTY: carrito sin items
  if (items.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center py-20">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">
          shopping_cart
        </span>
        <h2 className="font-headline text-headline-lg text-primary font-bold mb-4">
          Tu carrito está vacío
        </h2>
        <p className="font-body text-body-md text-on-surface-variant mb-8">
          Agregá productos desde la tienda
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-primary text-on-primary px-8 py-3 rounded-lg font-body text-body-md font-bold hover:bg-primary-container transition-colors"
        >
          Ir a la tienda
        </button>
      </div>
    );
  }

  // --- Cálculos del resumen
  const subtotal = total();
  const envioDisplay = subtotal > 50 ? 0 : 5.99;   // Envío gratis > $50
  const impuestoDisplay = subtotal * 0.21;           // IVA 21%
  const totalConEnvio = subtotal + envioDisplay + impuestoDisplay;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="font-headline text-headline-lg text-primary font-bold mb-8">
        Tu Carrito de Compra
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Columna izquierda: Items del carrito */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <CartItemComponent
              key={item.producto.id}
              item={item}
              onUpdateCantidad={updateCantidad}
              onRemove={removeItem}
            />
          ))}
        </div>

        {/* Columna derecha: Resumen del pedido (sticky) */}
        <div className="lg:col-span-1 sticky top-24">
          <div className="bg-surface-container-high rounded-xl p-8 shadow-sm border border-outline-variant/10">
            <h3 className="font-headline text-headline-sm text-primary font-bold mb-6">
              Resumen del pedido
            </h3>

            {/* Subtotal */}
            <div className="flex justify-between items-center mb-3">
              <span className="font-body text-body-md text-on-surface-variant">Subtotal</span>
              <span className="font-body text-body-md text-on-surface font-semibold">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            {/* Envío (Gratis si subtotal > $50) */}
            <div className="flex justify-between items-center mb-3">
              <span className="font-body text-body-md text-on-surface-variant">Envío</span>
              <span className="font-body text-body-md text-on-surface font-semibold">
                {envioDisplay === 0 ? "Gratis" : `$${envioDisplay.toFixed(2)}`}
              </span>
            </div>
            {/* IVA 21% */}
            <div className="flex justify-between items-center mb-3">
              <span className="font-body text-body-md text-on-surface-variant">Impuestos (21%)</span>
              <span className="font-body text-body-md text-on-surface font-semibold">
                ${impuestoDisplay.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-outline-variant/20 my-5" />

            {/* Método de entrega */}
            <div className="mb-6">
              <p className="font-body text-label-md text-on-surface-variant mb-3 uppercase tracking-wider">
                Método de entrega
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                  <span className="material-symbols-outlined text-primary text-sm">radio_button_checked</span>
                  <span className="font-body text-body-md text-on-surface">Envío a Domicilio</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20 opacity-50">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">radio_button_unchecked</span>
                  <span className="font-body text-body-md text-on-surface-variant">Recogida en Tienda</span>
                </div>
              </div>
            </div>

            {/* Selector de dirección */}
            <div className="mb-4">
              <p className="font-body text-label-md text-on-surface-variant mb-2 uppercase tracking-wider">
                Dirección de entrega
              </p>
              {direcciones && direcciones.length > 0 ? (
                /* Estado CON DATOS: dropdown de direcciones */
                <select
                  value={direccionId}
                  onChange={(e) => setDireccionId(Number(e.target.value))}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 font-body text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Seleccioná una dirección</option>
                  {direcciones.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.alias} - {d.direccion}, {d.ciudad}
                    </option>
                  ))}
                </select>
              ) : (
                /* Estado EMPTY: sin direcciones guardadas */
                <p className="font-body text-body-sm text-on-surface-variant">
                  No tenés direcciones guardadas.{" "}
                  <button
                    onClick={() => navigate("/direcciones")}
                    className="text-primary underline"
                  >
                    Agregá una
                  </button>
                </p>
              )}
            </div>

            {/* Selector de forma de pago */}
            <div className="mb-6">
              <p className="font-body text-label-md text-on-surface-variant mb-2 uppercase tracking-wider">
                Forma de pago
              </p>
              <select
                value={formaPagoId}
                onChange={(e) => setFormaPagoId(Number(e.target.value))}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 font-body text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Seleccioná una forma de pago</option>
                {formasPago?.map((fp) => (
                  <option key={fp.id} value={fp.id}>
                    {fp.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-outline-variant/20 my-5" />

            {/* Total final */}
            <div className="flex justify-between items-center mb-6">
              <span className="font-headline text-headline-sm text-on-surface font-bold">Total</span>
              <span className="font-headline text-headline-md text-primary font-bold">
                ${totalConEnvio.toFixed(2)}
              </span>
            </div>

            {/* Botón confirmar pedido */}
            <button
              onClick={handleConfirmar}
              disabled={
                !direccionId || !formaPagoId || crearPedidoMutation.isPending
              }
              className="w-full bg-primary-container text-on-primary py-4 rounded-lg font-body text-body-md font-bold hover:brightness-110 transition-all disabled:bg-outline-variant disabled:cursor-not-allowed shadow-sm"
            >
              {crearPedidoMutation.isPending
                ? "Creando pedido..."
                : "Confirmar Pedido"}
            </button>

            {/* Badges de seguridad */}
            <div className="flex items-center justify-center gap-6 pt-6 text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span className="font-body text-label-sm">Pago seguro</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span className="font-body text-label-sm">Datos protegidos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">autorenew</span>
                <span className="font-body text-label-sm">Devoluciones</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estado ERROR en la mutation */}
      {crearPedidoMutation.isError && (
        <p className="font-body text-body-md text-error text-center mt-6">
          Error al crear el pedido. ¿Estás autenticado?
        </p>
      )}
    </div>
  );
}
