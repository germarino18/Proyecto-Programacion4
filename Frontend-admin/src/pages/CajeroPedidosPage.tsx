import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

interface DetallePedido {
  id: number;
  producto_id: number;
  cantidad: number;
  precio_snapshot: number | null;
  nombre_snapshot: string;
}

interface HistorialEstado {
  id: number;
  estado: string;
  fecha: string | null;
}

interface Pedido {
  id: number;
  usuario_id: number;
  estado_actual: string;
  total: number | null;
  created_at: string;
  detalles: DetallePedido[];
  historial: HistorialEstado[];
}

const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  PENDIENTE: ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['EN_PREP', 'CANCELADO'],
  EN_PREP: ['EN_CAMINO'],
  EN_CAMINO: ['ENTREGADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

const ESTADOS_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  CONFIRMADO: 'bg-blue-100 text-blue-700',
  EN_PREP: 'bg-purple-100 text-purple-700',
  EN_CAMINO: 'bg-orange-100 text-orange-700',
  ENTREGADO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-red-100 text-red-700',
};

export default function CajeroPedidosPage() {
  const queryClient = useQueryClient();

  const { data: pedidos, isLoading, isError, error } = useQuery<Pedido[]>({
    queryKey: ['pedidos'],
    queryFn: () => api.get('/pedidos').then((r) => r.data),
    refetchInterval: 30000,
    retry: 1,
  });

  const avanzarMutation = useMutation({
    mutationFn: ({
      pedidoId,
      nuevoEstado,
    }: {
      pedidoId: number;
      nuevoEstado: string;
    }) =>
      api
        .patch(`/pedidos/${pedidoId}/estado`, { nuevo_estado: nuevoEstado })
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });

  if (isLoading) {
    return (
      <p className="text-on-surface-variant py-8">Cargando pedidos...</p>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-error font-semibold text-lg">Error al cargar pedidos</p>
        <p className="text-on-surface-variant text-sm mt-1">
          {(error as any)?.message || 'Verificá que el servidor esté corriendo'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary-container text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-headline text-2xl font-bold text-primary">
          Gestión de Pedidos
        </h2>
        <span className="text-sm text-on-surface-variant">
          {pedidos?.length ?? 0} pedidos
        </span>
      </div>

      {!pedidos || pedidos.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-12 text-center">
          <p className="text-on-surface-variant">No hay pedidos aún</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => {
            const sigEstados = TRANSICIONES_VALIDAS[pedido.estado_actual] ?? [];

            return (
              <div
                key={pedido.id}
                className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-headline font-bold text-primary text-lg">
                        Pedido #{pedido.id}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ESTADOS_COLORS[pedido.estado_actual] ?? 'bg-gray-100'
                        }`}
                      >
                        {pedido.estado_actual}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {new Date(pedido.created_at).toLocaleString('es-AR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      ${Number(pedido.total).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Detalles */}
                <div className="border-t border-outline-variant/10 pt-3 mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-on-surface-variant">
                        <th className="text-left py-1 font-medium">Producto</th>
                        <th className="text-center py-1 font-medium">
                          Cant.
                        </th>
                        <th className="text-right py-1 font-medium">Precio</th>
                        <th className="text-right py-1 font-medium">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedido.detalles?.map((det) => {
                        const precio = Number(det.precio_snapshot ?? 0);
                        return (
                        <tr key={det.id}>
                          <td className="py-1 text-primary">
                            {det.nombre_snapshot}
                          </td>
                          <td className="text-center py-1">{det.cantidad}</td>
                          <td className="text-right py-1">
                            ${precio.toFixed(2)}
                          </td>
                          <td className="text-right py-1 font-medium">
                            ${(precio * det.cantidad).toFixed(2)}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Acciones */}
                {sigEstados.length > 0 && (
                  <div className="flex gap-2">
                    {sigEstados.map((estado) => (
                      <button
                        key={estado}
                        onClick={() =>
                          avanzarMutation.mutate({
                            pedidoId: pedido.id,
                            nuevoEstado: estado,
                          })
                        }
                        disabled={avanzarMutation.isPending}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          estado === 'CANCELADO'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : estado === 'CONFIRMADO'
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-primary-container/20 text-primary hover:bg-primary-container/30'
                        } disabled:opacity-50`}
                      >
                        {estado === 'CANCELADO'
                          ? 'Cancelar'
                          : `Pasar a ${estado}`}
                      </button>
                    ))}
                  </div>
                )}

                {/* Historial expandible */}
                {pedido.historial && pedido.historial.length > 0 && (
                  <details className="mt-3">
                    <summary className="text-xs text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
                      Ver historial ({pedido.historial.length} registros)
                    </summary>
                    <div className="mt-2 space-y-1 text-xs text-on-surface-variant">
                      {pedido.historial.map((h) => (
                        <div key={h.id} className="flex gap-2">
                          <span className="font-medium text-primary">
                            {h.estado}
                          </span>
                          <span>·</span>
                          <span>
                            {h.fecha
                              ? new Date(h.fecha).toLocaleString('es-AR')
                              : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
