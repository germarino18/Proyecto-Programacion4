## Why

El panel Kanban de pedidos actualmente usa `refetchInterval` (polling cada 5s) para actualizar el estado de los pedidos. Esto es ineficiente (requests HTTP constantes), introduce latencia de hasta 5 segundos, y no escala cuando múltiples usuarios (cocinero, cajero, admin) necesitan ver cambios en tiempo real. WebSocket permite empujar cambios del servidor al cliente instantáneamente, eliminando el polling y dando una experiencia en vivo.

## What Changes

- **Nuevo**: `ConnectionManager` centralizado que maneja conexiones WebSocket con rooms por rol y por pedido
- **Nuevo**: Endpoint WebSocket en `/api/v1/pedidos/ws` con autenticación vía cookie JWT (misma que el resto de la API)
- **Modificado**: `PedidoService.ejecutar_accion()` emite eventos WebSocket después de cada cambio de estado
- **Modificado**: `PedidosKanbanPage.tsx` se conecta al WebSocket y actualiza en tiempo real (sin polling)
- **Nuevo**: Hook `useWebSocket.ts` en frontend-admin para manejar conexión, reconexión y despacho de eventos
- **Modificado**: Vite proxy configurado con `ws: true` para enrutar WebSocket a través del proxy de desarrollo
- **Nuevo**: Rooms por rol (`role:ADMIN`, `role:CAJERO`, `role:COCINERO`, `role:PEDIDOS`) y por pedido (`order:{id}`)

## Capabilities

### New Capabilities
- `real-time-orders`: El sistema SHALL notificar cambios de estado de pedidos en tiempo real vía WebSocket a los clientes conectados según su rol

### Modified Capabilities
*(ninguna — no existen specs previas)*

## Impact

- **Backend**: Nuevo `core/websocket.py` (ConnectionManager), nuevo `features/pedido/websocket.py` (endpoint WS), modificar `features/pedido/service.py` (emitir eventos), modificar `pedido/router.py` (registrar websocket router)
- **Frontend-admin**: Nuevo hook `useWebSocket.ts`, modificar `PedidosKanbanPage.tsx` (conectar WS, eliminar refetchInterval), modificar `vite.config.ts` (ws proxy)
- **Frontend-store**: Opcional — preparar para futuras notificaciones al cliente
- **Dependencias**: Ninguna nueva (WebSocket es nativo de FastAPI/Starlette)
