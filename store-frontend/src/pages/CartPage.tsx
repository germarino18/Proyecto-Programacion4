import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useCartStore } from "../store/cartStore";
import CartItemComponent from "../components/CartItem";
import type { DireccionRead, FormaPago } from "../types";

export default function CartPage() {
  const { items, updateCantidad, removeItem, clearCart, total } =
    useCartStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [direccionId, setDireccionId] = useState<number | "">("");
  const [formaPagoId, setFormaPagoId] = useState<number | "">("");

  // Fetch direcciones del usuario autenticado
  const { data: direcciones } = useQuery<DireccionRead[]>({
    queryKey: ["direcciones"],
    queryFn: () => api.get("/direcciones").then((r) => r.data),
  });

  // Fetch formas de pago
  const { data: formasPago } = useQuery<FormaPago[]>({
    queryKey: ["formas-pago"],
    queryFn: () => api.get("/formas-pago").then((r) => r.data),
  });

  const crearPedidoMutation = useMutation({
    mutationFn: (data: {
      direccion_id: number;
      forma_pago_id: number;
      items: { producto_id: number; cantidad: number }[];
    }) => api.post("/pedidos", data).then((r) => r.data),
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      navigate("/mis-pedidos");
    },
  });

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

  if (items.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold text-[#354867] mb-4">
          Tu carrito está vacío
        </h2>
        <p className="text-gray-500 mb-6">Agregá productos desde la tienda</p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#c8a97e] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#b8966a]"
        >
          Ir a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-[#354867] mb-6">Tu Carrito</h2>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        {items.map((item) => (
          <CartItemComponent
            key={item.producto.id}
            item={item}
            onUpdateCantidad={updateCantidad}
            onRemove={removeItem}
          />
        ))}

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <span className="text-lg text-gray-600">Total</span>
          <span className="text-2xl font-bold text-[#354867]">
            ${total().toFixed(2)}
          </span>
        </div>
      </div>

      {/* Selección de dirección */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <h3 className="font-semibold text-[#354867] mb-3">
          Dirección de entrega
        </h3>
        {direcciones && direcciones.length > 0 ? (
          <select
            value={direccionId}
            onChange={(e) => setDireccionId(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="">Seleccioná una dirección</option>
            {direcciones.map((d) => (
              <option key={d.id} value={d.id}>
                {d.alias} - {d.direccion}, {d.ciudad}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-gray-500">
            No tenés direcciones guardadas.{" "}
            <button
              onClick={() => navigate("/direcciones")}
              className="text-[#c8a97e] underline"
            >
              Agregá una
            </button>
          </p>
        )}
      </div>

      {/* Selección de forma de pago */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h3 className="font-semibold text-[#354867] mb-3">Forma de pago</h3>
        <select
          value={formaPagoId}
          onChange={(e) => setFormaPagoId(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg p-2"
        >
          <option value="">Seleccioná una forma de pago</option>
          {formasPago?.map((fp) => (
            <option key={fp.id} value={fp.id}>
              {fp.nombre}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleConfirmar}
        disabled={
          !direccionId || !formaPagoId || crearPedidoMutation.isPending
        }
        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {crearPedidoMutation.isPending
          ? "Creando pedido..."
          : "Confirmar Pedido"}
      </button>

      {crearPedidoMutation.isError && (
        <p className="text-red-500 text-center mt-4">
          Error al crear el pedido. ¿Estás autenticado?
        </p>
      )}
    </div>
  );
}
