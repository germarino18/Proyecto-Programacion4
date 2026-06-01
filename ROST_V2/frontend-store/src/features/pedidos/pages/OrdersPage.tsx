/**
 * OrdersPage.tsx — Historial de pedidos del usuario autenticado.
 * Muestra:
 * - Lista de pedidos con ID, fecha, estado (badge con color)
 * - Detalles de cada pedido (productos, cantidades, precios)
 * - Botón "Cancelar pedido" solo si estado es PENDIENTE o CONFIRMADO
 * - Timeline expandible del historial de estados
 *
 * Queries y Mutations de TanStack Query:
 * - GET /pedidos → fetch de todos los pedidos del usuario
 * - PATCH /pedidos/:id/cancelar → cancelar un pedido
 *
 * Estados:
 * - LOADING: mensaje "Cargando pedidos..."
 * - EMPTY: "No tenés pedidos aún"
 * - CON DATOS: lista de pedidos con estados coloreados
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axiosInstance";
import type { PedidoRead } from "../../../types";

/**
 * Mapa de colores para los badges de estado del pedido.
 * Cada estado tiene un color de fondo y texto diferente.
 */
const ESTADOS_COLORS: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-700",
  CONFIRMADO: "bg-blue-100 text-blue-700",
  EN_PREP: "bg-purple-100 text-purple-700",
  EN_CAMINO: "bg-orange-100 text-orange-700",
  ENTREGADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-700",
};

/**
 * OrdersPage — Página de historial de pedidos del usuario.
 *
 * @returns {JSX.Element} Lista de pedidos con detalles, estados y acciones
 */
export default function OrdersPage() {
  const queryClient = useQueryClient();

  /**
   * Query: GET /pedidos
   * Obtiene todos los pedidos del usuario autenticado.
   * Cacheada con queryKey ["pedidos"].
   */
  const { data: pedidos, isLoading } = useQuery<PedidoRead[]>({
    queryKey: ["pedidos"],
    queryFn: () => api.get("/pedidos").then((r) => r.data),
  });

  /**
   * Mutation: PATCH /pedidos/:id/cancelar
   * Cancela un pedido si está en estado PENDIENTE o CONFIRMADO.
   * On success: invalida la query de pedidos para refrescar.
   */
  const cancelarMutation = useMutation({
    mutationFn: (pedidoId: number) =>
      api.patch(`/pedidos/${pedidoId}/cancelar`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });

  // --- Estado LOADING
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Cargando pedidos...</p>
      </div>
    );
  }

  /**
   * puedeCancelar — Verifica si un pedido puede cancelarse.
   * Solo se puede cancelar si está PENDIENTE o CONFIRMADO.
   *
   * @param estado - Estado actual del pedido
   * @returns true si se puede cancelar
   */
  const puedeCancelar = (estado: string) =>
    estado === "PENDIENTE" || estado === "CONFIRMADO";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-[#354867] mb-6">Mis Pedidos</h2>

      {!pedidos || pedidos.length === 0 ? (
        // --- Estado EMPTY: sin pedidos
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No tenés pedidos aún</p>
        </div>
      ) : (
        // --- Estado CON DATOS: lista de pedidos
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              {/* Header: ID + fecha + badge de estado */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-gray-500">
                    Pedido #{pedido.id}
                  </span>
                  <span className="mx-2 text-gray-300">·</span>
                  <span className="text-sm text-gray-500">
                    {new Date(pedido.created_at).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {/* Badge con color según estado */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    ESTADOS_COLORS[pedido.estado_actual] || "bg-gray-100"
                  }`}
                >
                  {pedido.estado_actual}
                </span>
              </div>

              {/* Detalles del pedido: productos comprados */}
              <div className="space-y-2 mb-4">
                {pedido.detalles?.map((det) => (
                  <div
                    key={det.id}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {det.cantidad}x {det.nombre_snapshot}
                    </span>
                    <span className="text-gray-600">
                      ${(det.precio_snapshot * det.cantidad).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer: total + botón cancelar */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="font-bold text-[#354867]">
                  Total: ${Number(pedido.total).toFixed(2)}
                </span>
                {puedeCancelar(pedido.estado_actual) && (
                  <button
                    onClick={() => cancelarMutation.mutate(pedido.id)}
                    disabled={cancelarMutation.isPending}
                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                  >
                    Cancelar pedido
                  </button>
                )}
              </div>

              {/* Timeline expandible del historial de estados */}
              {pedido.historial && pedido.historial.length > 0 && (
                <details className="mt-3 text-xs text-gray-400">
                  <summary className="cursor-pointer hover:text-gray-600">
                    Ver historial de estados
                  </summary>
                  <div className="mt-2 space-y-1">
                    {pedido.historial.map((h) => (
                      <div key={h.id} className="flex gap-2">
                        <span className="font-medium">{h.estado}</span>
                        <span>·</span>
                        <span>
                          {new Date(h.fecha).toLocaleString("es-AR")}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
