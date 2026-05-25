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

const ESTADOS_ICONS: Record<string, string> = {
  PENDIENTE: 'schedule',
  CONFIRMADO: 'check_circle',
  EN_PREP: 'local_dining',
  EN_CAMINO: 'local_shipping',
  ENTREGADO: 'verified',
  CANCELADO: 'cancel',
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
                      <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-[22px] text-primary">receipt_long</span>
                      </div>
                      <div>
                        <span className="font-headline font-bold text-primary text-lg">
                          Pedido #{pedido.id}
                        </span>
                        <span
                          className={`ml-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            ESTADOS_COLORS[pedido.estado_actual] ?? 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">{ESTADOS_ICONS[pedido.estado_actual] ?? 'circle'}</span>
                          {pedido.estado_actual}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-on-surface-variant mt-1 ml-[52px]">
                      {new Date(pedido.created_at).toLocaleString('es-AR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      ${Number(pedido.total).toFixed(2)}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Total</p>
                  </div>
                </div>

                {/* Detalles */}
                <div className="border-t border-outline-variant/10 pt-4 mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-on-surface-variant/70 border-b border-outline-variant/10">
                        <th className="text-left pb-2 font-body font-semibold text-xs uppercase tracking-wider">Producto</th>
                        <th className="text-center pb-2 font-body font-semibold text-xs uppercase tracking-wider">
                          Cant.
                        </th>
                        <th className="text-right pb-2 font-body font-semibold text-xs uppercase tracking-wider">Precio</th>
                        <th className="text-right pb-2 font-body font-semibold text-xs uppercase tracking-wider">
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
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          estado === 'CANCELADO'
                            ? 'bg-red-50 text-red-700 hover:bg-red-100 hover:shadow-sm'
                            : estado === 'CONFIRMADO'
                            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-sm'
                            : 'bg-primary-fixed text-primary hover:bg-primary-fixed-dim hover:shadow-sm'
                        } disabled:opacity-50 active:scale-[0.98]`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {estado === 'CANCELADO' ? 'block' : estado === 'CONFIRMADO' ? 'how_to_reg' : 'arrow_forward'}
                        </span>
                        {estado === 'CANCELADO'
                          ? 'Cancelar'
                          : `Pasar a ${estado}`}
                      </button>
                    ))}
                  </div>
                )}

                {/* Historial expandible */}
                {pedido.historial && pedido.historial.length > 0 && (
                  <details className="mt-4 group">
                    <summary className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant cursor-pointer hover:text-primary transition-colors font-body font-semibold">
                      <span className="material-symbols-outlined text-[16px] group-open:rotate-90 transition-transform">chevron_right</span>
                      Ver historial ({pedido.historial.length} registro{pedido.historial.length !== 1 ? 's' : ''})
                    </summary>
                    <div className="mt-3 space-y-2 text-xs">
                      {pedido.historial.map((h) => (
                        <div key={h.id} className="flex items-center gap-3 bg-surface-container-high/50 rounded-lg px-3 py-2">
                          <div className={`w-2 h-2 rounded-full ${
                            ESTADOS_COLORS[h.estado]?.split(' ')[0] ?? 'bg-gray-300'
                          }`} />
                          <span className="font-semibold text-primary uppercase text-[11px] tracking-wider">
                            {h.estado}
                          </span>
                          <span className="text-on-surface-variant/50">·</span>
                          <span className="text-on-surface-variant">
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
