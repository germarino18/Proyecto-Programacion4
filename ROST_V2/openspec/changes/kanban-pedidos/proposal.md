## Why

El panel de gestión de pedidos actual muestra una lista vertical de pedidos que resulta poco práctica para el flujo de cocina/restaurante. Los operadores necesitan ver rápidamente qué pedidos están pendientes, cuáles se están preparando y cuáles ya se entregaron. Un tablero estilo Kanban con 3 columnas agiliza la gestión visual y reduce errores al tener un mapeo claro del estado de cada pedido.

## What Changes

- Simplificar la máquina de estados del backend de 6 estados a 3: `PENDIENTE → EN_PREP → ENTREGADO`
- Reemplazar la vista de lista `CajeroPedidosPage.tsx` por un tablero Kanban de 3 columnas (Pendientes, En preparación, Entregado)
- Agregar tipos e API client de pedidos en el frontend
- Cada columna contiene tarjetas de pedido con botón para avanzar al siguiente estado
- Auto-refetch cada 15 segundos para mantener el tablero actualizado

## Capabilities

### New Capabilities
- `kanban-pedidos`: Tablero Kanban de pedidos con 3 columnas (Pendientes, En preparación, Entregado) para gestión visual del flujo de cocina

### Modified Capabilities
- _(ninguno — no hay specs existentes)_

## Impact

- **Backend**: `app/features/pedido/service.py` — simplificar `TRANSICIONES_VALIDAS` a 3 estados
- **Frontend Admin**: 
  - Reemplazar `CajeroPedidosPage.tsx` por `PedidosKanbanPage.tsx`
  - Agregar tipos `Pedido`, `DetallePedido`, `HistorialEstado` al `types/index.ts`
  - Crear `api/pedidos.ts` para llamadas API con tipos
  - Actualizar `AppRouter.tsx` para usar el nuevo componente
