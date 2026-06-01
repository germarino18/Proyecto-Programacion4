## Context

El panel de gestión de pedidos (`CajeroPedidosPage.tsx`) muestra todos los pedidos como una lista vertical. Los operadores de cocina/restaurante necesitan un tablero visual tipo Kanban para gestionar el flujo: ver qué pedidos están pendientes, cuáles se están preparando y cuáles ya se entregaron.

El backend actual tiene una máquina de estados con 6 estados (`PENDIENTE → CONFIRMADO → EN_PREP → EN_CAMINO → ENTREGADO`), pero para el flujo de cocina solo se necesitan 3.

## Goals / Non-Goals

**Goals:**
- Tablero Kanban con 3 columnas: Pendientes, En preparación, Entregado
- Simplificar la máquina de estados del backend de 6 a 3 estados
- Cada tarjeta de pedido muestra: número, tiempo transcurrido, items, total
- Botón "Preparar" en columna Pendientes → mueve a En preparación
- Botón "Entregar" en columna En preparación → mueve a Entregado
- Botón "Cancelar" en columna Pendientes
- Auto-refetch cada 15s
- Manejar pedidos existentes con estados CONFIRMADO o EN_CAMINO

**Non-Goals:**
- No se modifica el modelo de datos (Pedido, DetallePedido, HistorialEstadoPedido)
- No se modifican los endpoints de la API
- No se agregan websockets ni real-time (solo polling)
- No se implementa drag & drop

## Decisions

### 1. Simplificación de la máquina de estados

| Estado actual | Nuevo estado |
|---|---|
| PENDIENTE | PENDIENTE (se conserva) |
| CONFIRMADO | Se elimina del flujo activo (se mapea a Pendientes en frontend) |
| EN_PREP | EN_PREP (se conserva) |
| EN_CAMINO | Se elimina del flujo activo (se mapea a En preparación en frontend) |
| ENTREGADO | ENTREGADO (se conserva) |

**Razón**: El flujo de cocina solo necesita 3 estados. Los estados intermedios (CONFIRMADO, EN_CAMINO) agregan complejidad innecesaria para el operador.

**Transiciones actualizadas:**
```python
TRANSICIONES_VALIDAS = {
    "PENDIENTE": ["EN_PREP", "CANCELADO"],
    "CONFIRMADO": ["EN_PREP", "CANCELADO"],  # para pedidos existentes
    "EN_PREP": ["ENTREGADO"],
    "EN_CAMINO": ["ENTREGADO"],  # para pedidos existentes
    "ENTREGADO": [],
    "CANCELADO": [],
}
```

### 2. Mapeo columnas → estados

| Columna | Estados incluidos | Avance posible |
|---|---|---|
| Pendientes | PENDIENTE, CONFIRMADO | → EN_PREP o CANCELAR |
| En preparación | EN_PREP, EN_CAMINO | → ENTREGADO |
| Entregado | ENTREGADO | (ninguno) |

### 3. Frontend: componente Kanban

Se reemplaza `CajeroPedidosPage.tsx` por `PedidosKanbanPage.tsx`.

**Estructura de componentes:**
```
PedidosKanbanPage
  ├── Cabecera (título + contador total)
  ├── Tablero Kanban (flex row, 3 columnas)
  │   ├── Columna "Pendientes"
  │   │   ├── Header (título + badge con count)
  │   │   └── Lista de tarjetas (scroll)
  │   │       └── TarjetaPedido (× N)
  │   ├── Columna "En preparación"
  │   │   └── ...
  │   └── Columna "Entregados"
  │       └── ...
  └── Modal de confirmación (para cancelar)
```

**TarjetaPedido:**
```
┌──────────────────────────┐
│ Pedido #ID               │
│ 🕐 10:35 (hace 15 min)  │
│                          │
│ 🥪 2x Sandwich           │
│ ☕ 1x Café latte          │
│                          │
│ Total: $4,520.00         │
│                          │
│ [Preparar]  [Cancelar]   │
└──────────────────────────┘
```

### 4. API Client

Se crea `api/pedidos.ts` con funciones tipadas:
- `getPedidos()` → GET `/pedidos`
- `avanzarEstado(pedidoId, nuevoEstado)` → PATCH `/pedidos/{id}/estado`

### 5. Tipos compartidos

Se agregan al `types/index.ts`:
- `Pedido`: interfaz completa del pedido
- `DetallePedido`: línea de detalle
- `HistorialEstado`: registro de cambio de estado

### 6. Colors de estados

| Estado | Color | Icono |
|---|---|---|
| PENDIENTE | warning (ámbar) | schedule |
| EN_PREP | accent (púrpura) | local_dining |
| ENTREGADO | success (verde) | verified |
| CANCELADO | error (rojo) | cancel |

## Risks / Trade-offs

- **Pedidos existentes con CONFIRMADO/EN_CAMINO**: Se manejan explícitamente en las transiciones y en el mapeo de columnas. Riesgo bajo.
- **Polling cada 15s vs websockets**: Polling es más simple de implementar y suficiente para este volumen de datos. Si el volumen crece, se puede migrar a Server-Sent Events.
- **Sin drag & drop**: Se implementa con botones explícitos. Drag & drop es más complejo y no agrega valor significativo para el flujo de cocina.
