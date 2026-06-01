/**
 * PedidosKanbanPage.tsx — Tablero Kanban de pedidos (estilo Trello)
 *
 * 3 columnas: Pendientes, En preparación, Entregado
 * Cada columna agrupa pedidos por estado y permite avanzarlos al siguiente.
 * Auto-refetch cada 15 segundos.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPedidos, avanzarEstado } from '../../../api/pedidos';
import type { Pedido } from '../../../types';

/* ─────────────────── Constantes ─────────────────── */

interface ColumnaInfo {
  key: string;
  titulo: string;
  incluye: string[];
  color: string;
  badge: string;
}

const COLUMNAS: ColumnaInfo[] = [
  {
    key: 'pendientes',
    titulo: 'Pendientes',
    incluye: ['PENDIENTE', 'CONFIRMADO'],
    color: 'border-l-4 border-l-[#F59E0B]',
    badge: 'bg-[#F59E0B]/10 text-[#B45309]',
  },
  {
    key: 'preparacion',
    titulo: 'En preparación',
    incluye: ['EN_PREP', 'EN_CAMINO'],
    color: 'border-l-4 border-l-[#8B5CF6]',
    badge: 'bg-[#8B5CF6]/10 text-[#6D28D9]',
  },
  {
    key: 'entregados',
    titulo: 'Entregados',
    incluye: ['ENTREGADO'],
    color: 'border-l-4 border-l-[#10B981]',
    badge: 'bg-[#10B981]/10 text-[#047857]',
  },
];

function tiempoRelativo(iso: string): string {
  const ahora = Date.now();
  const creacion = new Date(iso).getTime();
  const diffMin = Math.floor((ahora - creacion) / 60000);
  if (diffMin < 1) return 'recién';
  if (diffMin < 60) return `hace ${diffMin} min`;
  const horas = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  if (horas < 24) return `hace ${horas}h ${mins}min`;
  return new Date(iso).toLocaleDateString('es-AR');
}

function formatearHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

/* ─────────────────── Sub-componentes ─────────────────── */

function TarjetaPedido({
  pedido,
  onAvanzar,
  onCancelar,
  isPending,
}: {
  pedido: Pedido;
  onAvanzar: () => void;
  onCancelar: () => void;
  isPending: boolean;
}) {
  const mostrarPreparar = ['PENDIENTE', 'CONFIRMADO'].includes(pedido.estado_actual);
  const mostrarEntregar = ['EN_PREP', 'EN_CAMINO'].includes(pedido.estado_actual);
  const mostrarCancelar = ['PENDIENTE', 'CONFIRMADO'].includes(pedido.estado_actual);
  const esTerminal = pedido.estado_actual === 'ENTREGADO';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-outline-variant/15 p-4 space-y-3 hover:shadow-md transition-shadow">
      {/* Header: ID + hora */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-headline font-bold text-primary text-base">
            Pedido #{pedido.id}
          </h3>
          <p className="text-[11px] text-on-surface-variant/60 mt-0.5">
            {formatearHora(pedido.created_at)} — {tiempoRelativo(pedido.created_at)}
          </p>
        </div>
        {esTerminal && (
          <span className="material-symbols-outlined text-[#10B981] text-[20px]">verified</span>
        )}
      </div>

      {/* Items */}
      <div className="space-y-1">
        {pedido.detalles?.map((det) => (
          <div key={det.id} className="flex items-center gap-2 text-sm text-on-surface">
            <span className="font-semibold text-primary/70 min-w-[2rem] text-right">{det.cantidad}x</span>
            <span className="truncate">{det.nombre_snapshot}</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-1 border-t border-outline-variant/10">
        <span className="text-xs text-on-surface-variant/60">Total</span>
        <span className="font-headline font-bold text-primary text-base">
          ${Number(pedido.total ?? 0).toFixed(2)}
        </span>
      </div>

      {/* Botones de acción */}
      {!esTerminal && (
        <div className="flex gap-2 pt-1">
          {mostrarPreparar && (
            <button
              onClick={onAvanzar}
              disabled={isPending}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#8B5CF6]/10 text-[#6D28D9] rounded-lg text-xs font-semibold hover:bg-[#8B5CF6]/20 transition-colors disabled:opacity-50 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[14px]">local_dining</span>
              Preparar
            </button>
          )}
          {mostrarEntregar && (
            <button
              onClick={onAvanzar}
              disabled={isPending}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#10B981]/10 text-[#047857] rounded-lg text-xs font-semibold hover:bg-[#10B981]/20 transition-colors disabled:opacity-50 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Entregar
            </button>
          )}
          {mostrarCancelar && (
            <button
              onClick={onCancelar}
              disabled={isPending}
              className="inline-flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 active:scale-[0.98]"
              title="Cancelar pedido"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Columna({
  columna,
  pedidos,
  onAvanzar,
  onCancelar,
  isPending,
}: {
  columna: ColumnaInfo;
  pedidos: Pedido[];
  onAvanzar: (p: Pedido) => void;
  onCancelar: (p: Pedido) => void;
  isPending: boolean;
}) {
  return (
    <div className="flex flex-col bg-[#F5E6D3]/40 rounded-2xl min-h-[60vh]">
      {/* Header de columna */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-outline-variant/10">
        <h3 className="font-headline font-bold text-on-surface text-base">{columna.titulo}</h3>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${columna.badge}`}>
          {pedidos.length}
        </span>
      </div>

      {/* Lista de tarjetas */}
      <div className="flex-1 space-y-3 p-4 overflow-y-auto max-h-[65vh]">
        {pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant/40">
            <span className="material-symbols-outlined text-[32px]">inbox</span>
            <p className="text-xs mt-2">Sin pedidos</p>
          </div>
        ) : (
          pedidos.map((pedido) => (
            <TarjetaPedido
              key={pedido.id}
              pedido={pedido}
              onAvanzar={() => onAvanzar(pedido)}
              onCancelar={() => onCancelar(pedido)}
              isPending={isPending}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ─────────────────── Página principal ─────────────────── */

export default function PedidosKanbanPage() {
  const queryClient = useQueryClient();
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);

  const { data: pedidos, isLoading, isError } = useQuery<Pedido[]>({
    queryKey: ['pedidos'],
    queryFn: getPedidos,
    refetchInterval: 15000,
    retry: 1,
  });

  const avanzarMutation = useMutation({
    mutationFn: ({ pedidoId, nuevoEstado }: { pedidoId: number; nuevoEstado: string }) =>
      avanzarEstado(pedidoId, nuevoEstado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });

  const cancelarMutation = useMutation({
    mutationFn: (pedidoId: number) =>
      avanzarEstado(pedidoId, 'CANCELADO'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      setCancelandoId(null);
    },
  });

  function handleAvanzar(pedido: Pedido) {
    const transicion: Record<string, string> = {
      PENDIENTE: 'EN_PREP',
      CONFIRMADO: 'EN_PREP',
      EN_PREP: 'ENTREGADO',
      EN_CAMINO: 'ENTREGADO',
    };
    const nuevoEstado = transicion[pedido.estado_actual];
    if (!nuevoEstado) return;
    avanzarMutation.mutate({ pedidoId: pedido.id, nuevoEstado });
  }

  function handleCancelar(pedido: Pedido) {
    setCancelandoId(pedido.id);
  }

  function confirmarCancelar() {
    if (cancelandoId !== null) {
      cancelarMutation.mutate(cancelandoId);
    }
  }

  // Agrupar pedidos por columna
  const pedidosPorColumna = COLUMNAS.map((col) => ({
    columna: col,
    pedidos: (pedidos ?? []).filter((p) => col.incluye.includes(p.estado_actual)),
  }));

  const totalPedidos = pedidos?.length ?? 0;

  if (isLoading) {
    return <p className="text-on-surface-variant py-8">Cargando pedidos...</p>;
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-error font-semibold text-lg">Error al cargar pedidos</p>
        <p className="text-on-surface-variant text-sm mt-1">Verificá que el servidor esté corriendo</p>
        <button onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary-container text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-headline text-2xl font-bold text-primary">Pedidos</h2>
          <span className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-semibold text-on-surface-variant">
            {totalPedidos} pedido{totalPedidos !== 1 ? 's' : ''}
          </span>
        </div>
        <span className="text-xs text-on-surface-variant/50">Auto-actualización cada 15s</span>
      </div>

      {/* Tablero Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {pedidosPorColumna.map(({ columna, pedidos: pedidosCol }) => (
          <Columna
            key={columna.key}
            columna={columna}
            pedidos={pedidosCol}
            onAvanzar={handleAvanzar}
            onCancelar={handleCancelar}
            isPending={avanzarMutation.isPending || cancelarMutation.isPending}
          />
        ))}
      </div>

      {/* Modal de confirmación para cancelar */}
      {cancelandoId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCancelandoId(null)} />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="font-headline font-bold text-primary text-lg mb-2">Cancelar pedido</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              ¿Estás seguro de cancelar el pedido #{cancelandoId}? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelandoId(null)}
                className="px-4 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant font-body text-sm font-semibold hover:bg-surface-container-high transition-colors"
              >
                Volver
              </button>
              <button
                onClick={confirmarCancelar}
                disabled={cancelarMutation.isPending}
                className="px-4 py-2.5 bg-error text-white rounded-lg font-body text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {cancelarMutation.isPending ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
