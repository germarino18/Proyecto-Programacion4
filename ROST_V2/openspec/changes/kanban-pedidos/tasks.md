## 1. Backend — Simplificar máquina de estados

- [x] 1.1 Actualizar `TRANSICIONES_VALIDAS` en `pedido/service.py`: dejar solo PENDIENTE → EN_PREP → ENTREGADO + transiciones legacy para CONFIRMADO/EN_CAMINO

## 2. Frontend — Tipos y API Client

- [x] 2.1 Agregar interfaces `Pedido`, `DetallePedido`, `HistorialEstado` a `frontend-admin/src/types/index.ts`
- [x] 2.2 Crear `frontend-admin/src/api/pedidos.ts` con funciones `getPedidos()` y `avanzarEstado()`

## 3. Frontend — Componente Kanban

- [x] 3.1 Crear `PedidosKanbanPage.tsx` con estructura de tablero de 3 columnas
- [x] 3.2 Implementar columna "Pendientes" con tarjetas y botón "Preparar"
- [x] 3.3 Implementar columna "En preparación" con tarjetas y botón "Entregar"
- [x] 3.4 Implementar columna "Entregados" con tarjetas (solo lectura)
- [x] 3.5 Agregar auto-refetch cada 15s
- [x] 3.6 Agregar botón "Cancelar" para pedidos Pendientes con confirmación

## 4. Frontend — Router

- [x] 4.1 Actualizar `AppRouter.tsx` para usar `PedidosKanbanPage` en reemplazo de `CajeroPedidosPage`
- [x] 4.2 Eliminar archivo `CajeroPedidosPage.tsx` (ya no se usa)
