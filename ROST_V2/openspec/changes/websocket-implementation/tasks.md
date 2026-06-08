## 1. Backend — ConnectionManager

- [x] 1.1 Crear `backend/app/core/websocket.py` con clase `ConnectionManager` que tenga: `active_connections: dict[str, list[WebSocket]]`, métodos `connect()`, `disconnect()`, `join_room()`, `leave_room()`, `broadcast_to_room()`
- [x] 1.2 Registrar `ConnectionManager` como singleton en `backend/app/core/__init__.py` o como dependencia FastAPI

## 2. Backend — WebSocket endpoint

- [x] 2.1 Crear `backend/app/features/pedido/websocket.py` con endpoint WebSocket `/api/v1/pedidos/ws` que: (a) lea cookie `access_token` del handshake, (b) valide el token JWT y obtenga el usuario, (c) lo una a `role:{rol_codigo}`, (d) mantenga la conexión activa escuchando `receive_text` (para futuros mensajes, por ahora solo keepalive)
- [x] 2.2 Agregar manejo de `websocket.disconnect` para limpiar la conexión del manager
- [x] 2.3 Integrar el websocket router en la app principal (`backend/app/main.py` o `features/pedido/__init__.py`)

## 3. Backend — Event emission desde PedidoService

- [x] 3.1 Modificar `backend/app/features/pedido/service.py`: en `ejecutar_accion()`, después del `uow.commit()` exitoso, serializar el pedido actualizado y emitir evento `order_updated` via `ConnectionManager.broadcast_to_room()`
- [x] 3.2 Determinar qué rooms notificar según la acción ejecutada (ej: CONFIRMAR → `role:COCINERO`, PREPARAR → `role:ADMIN`+`role:PEDIDOS`, LISTO → `role:CAJERO`, ENTREGAR → `role:ADMIN`+`role:PEDIDOS`)
- [x] 3.3 Emitir siempre a `order:{pedido.id}` para que cualquier cliente siguiendo ese pedido reciba el evento

## 4. Frontend-admin — Hook useWebSocket

- [x] 4.1 Crear `frontend-admin/src/hooks/useWebSocket.ts` con: conexión a `ws://localhost:5174/api/v1/pedidos/ws` (relativa, usando `window.location.protocol`), reconexión automática con backoff exponencial, `onOrderUpdated` callback registration
- [x] 4.2 El hook debe exponer: `isConnected: boolean`, `connect()`, `disconnect()`, estado de última reconexión

## 5. Frontend-admin — Vite proxy config

- [x] 5.1 Modificar `frontend-admin/vite.config.ts`: agregar `ws: true` a la configuración del proxy existente para `/api`
- [x] 5.2 Verificar que el proxy de frontend-store también tenga `ws: true` (opcional, preparatorio)

## 6. Frontend-admin — Kanban integration

- [x] 6.1 Modificar `PedidosKanbanPage.tsx`: eliminar `refetchInterval: 5000`, conectar `useWebSocket`, suscribirse a `onOrderUpdated`, actualizar el pedido en el estado local cuando llegue un evento
- [x] 6.2 Agregar indicador visual de conexión WebSocket en el Kanban (conectado/desconectado/reconectando)
- [x] 6.3 En caso de reconexión, hacer un `refetch()` completo del query para sincronizar estado

## 7. Verificación

- [x] 7.1 Iniciar backend y verificar que el endpoint WebSocket acepta conexiones con cookie válida
- [ ] 7.2 Iniciar frontend-admin, conectar WebSocket, y verificar que los cambios de estado se reflejan en tiempo real
- [ ] 7.3 Probar reconexión: matar el backend, esperar, reiniciarlo, verificar que el frontend reconecta y sincroniza
