/**
 * OrdersPage.tsx — Historial de pedidos del usuario autenticado.
 * Muestra:
 * - Lista de pedidos con ID, fecha, estado (badge con color)
 * - Detalles de cada pedido (productos, cantidades, precios)
 * - Botón "Cancelar pedido" solo si estado es PENDIENTE o CONFIRMADO
 * - Timeline expandible del historial de estados
 * - Actualización en tiempo real vía WebSocket
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

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axiosInstance";
import { useWebSocket } from "../../../hooks/useWebSocket";
import { getPago, crearPreference } from "../../../api/pagos";
import type { PedidoRead, PagoRead } from "../../../types";

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
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);

  // WebSocket para actualizaciones en tiempo real
  const { isConnected, lastReconnect } = useWebSocket({
    onOrderUpdated: (pedido) => {
      queryClient.setQueryData<PedidoRead[]>(["pedidos"], (old) => {
        if (!old) return [pedido];
        const idx = old.findIndex((p) => p.id === pedido.id);
        if (idx >= 0) {
          const updated = [...old];
          updated[idx] = { ...updated[idx], ...pedido };
          return updated;
        }
        return [pedido, ...old];
      });
    },
  });

  // Refetchear al reconectar (por si se perdieron eventos)
  useEffect(() => {
    if (lastReconnect) {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    }
  }, [lastReconnect, queryClient]);

  /**
   * Query: GET /pedidos
   * Obtiene todos los pedidos del usuario autenticado.
   * Cacheada con queryKey ["pedidos"].
   * Cuando el WebSocket está conectado, desactiva el polling.
   */
  const { data: pedidos, isLoading } = useQuery<PedidoRead[]>({
    queryKey: ["pedidos"],
    queryFn: () => api.get("/pedidos").then((r) => r.data),
    refetchInterval: isConnected ? false : 15000,
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
      setCancelandoId(null);
    },
    onError: () => {
      setCancelandoId(null);
    },
  });

  /**
   * Queries: GET /pagos/{pedido_id} por cada pedido con forma de pago.
   * Obtiene el estado del pago para pedidos que usan MercadoPago.
   * Se agrupan en un Map<pedido_id, PagoRead | null> para acceso fácil.
   */
  const pedidosConFormaPago = (pedidos || []).filter(
    (p) => p.forma_pago_id !== null
  );

  const pagoQueries = useQueries({
    queries: pedidosConFormaPago.map((p) => ({
      queryKey: ["pago", p.id],
      queryFn: () => getPago(p.id).catch(() => null),
      enabled: true,
      retry: false,
      staleTime: 30_000,
    })),
  });

  const pagosMap = new Map<number, PagoRead | null>();
  pedidosConFormaPago.forEach((p, idx) => {
    if (pagoQueries[idx]?.data !== undefined) {
      pagosMap.set(p.id, pagoQueries[idx].data ?? null);
    }
  });

  // Estado del badge según mp_status
  const PAGO_STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    in_process: "bg-blue-100 text-blue-700",
  };

  const PAGO_STATUS_LABELS: Record<string, string> = {
    pending: "Pago pendiente",
    approved: "Pago aprobado",
    rejected: "Pago rechazado",
    in_process: "Pago en proceso",
    cancelled: "Pago cancelado",
  };

  const confirmarCancelar = () => {
    if (cancelandoId !== null) {
      cancelarMutation.mutate(cancelandoId);
    }
  };

  /**
   * Mutation: POST /pagos/crear (reintento)
   * Genera una nueva preferencia de pago y redirige al checkout de MP.
   */
  const retryPagoMutation = useMutation({
    mutationFn: (pedidoId: number) => crearPreference(pedidoId),
    onSuccess: (data) => {
      window.location.href = data.init_point;
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#354867]">Mis Pedidos</h2>
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-yellow-500"
            }`}
            title={isConnected ? "Tiempo real" : "Reconectando..."}
          />
          <span className="text-xs text-gray-400">
            {isConnected ? "Tiempo real" : "Reconectando..."}
          </span>
        </div>
      </div>

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
                    onClick={() => setCancelandoId(pedido.id)}
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

              {/* Estado del pago (solo si hay información de pago) */}
              {pedido.forma_pago_id && pagosMap.has(pedido.id) && pagosMap.get(pedido.id) && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        PAGO_STATUS_COLORS[pagosMap.get(pedido.id)!.mp_status] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {PAGO_STATUS_LABELS[pagosMap.get(pedido.id)!.mp_status] ||
                        pagosMap.get(pedido.id)!.mp_status}
                    </span>
                    {pagosMap.get(pedido.id)!.mp_status === "pending" && (
                      <button
                        onClick={() => retryPagoMutation.mutate(pedido.id)}
                        disabled={retryPagoMutation.isPending}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                      >
                        {retryPagoMutation.isPending
                          ? "Redirigiendo..."
                          : "Reintentar pago"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación para cancelar pedido (mismo patrón que admin) */}
      {cancelandoId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCancelandoId(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="font-bold text-[#354867] text-lg mb-2">Cancelar pedido</h3>
            <p className="text-sm text-gray-500 mb-6">
              ¿Estás seguro de cancelar el pedido #{cancelandoId}? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelandoId(null)}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Volver
              </button>
              <button
                onClick={confirmarCancelar}
                disabled={cancelarMutation.isPending}
                className="px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelarMutation.isPending ? "Cancelando..." : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
