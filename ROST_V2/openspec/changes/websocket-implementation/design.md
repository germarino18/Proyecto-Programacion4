## Context

El panel Kanban de pedidos actualmente usa React Query con `refetchInterval: 5000` para refrescar el listado de pedidos cada 5 segundos. Esto genera peticiones HTTP constantes incluso cuando no hay cambios, y los usuarios ven los cambios con hasta 5 segundos de retraso. El código de ejemplo de los profesores (`websocket_nuevo_seguridad/`) implementa un `ConnectionManager` con soporte para rooms que sirve como referencia.

El backend ya está preparado para el cambio: ahora cada usuario tiene un `rol_codigo` único, lo que permite asignar rooms WebSocket por rol de forma determinística.

## Goals / Non-Goals

**Goals:**
- Implementar `ConnectionManager` con rooms por rol (`role:ADMIN`, `role:CAJERO`, `role:COCINERO`, `role:PEDIDOS`) y por pedido (`order:{id}`)
- Agregar endpoint WebSocket `/api/v1/pedidos/ws` autenticado vía cookie JWT (misma cookie HttpOnly que usa el resto de la API)
- Emitir evento `order_updated` desde `PedidoService.ejecutar_accion()` después de cada cambio de estado
- Reemplazar polling (`refetchInterval`) en `PedidosKanbanPage.tsx` por conexión WebSocket en vivo
- Crear hook `useWebSocket` reutilizable en frontend-admin
- Configurar Vite proxy con `ws: true` para desarrollo

**Non-Goals:**
- No se implementa WebSocket para frontend-store (clientes) en este change (puede agregarse después)
- No se implementa broadcast general (solo eventos de pedidos)
- No se agregan dependencias externas (se usa WebSocket nativo de Starlette/FastAPI)

## Decisions

### 1. ConnectionManager adaptado del código de los profesores
**Decisión**: Implementar `ConnectionManager` con `active_connections: dict[str, list[WebSocket]]` donde la clave es el nombre de la room. Métodos: `connect()`, `disconnect()`, `join_room()`, `leave_room()`, `broadcast_to_room()`.
**Por qué**: Es el patrón probado que los profesores usaron y se adapta perfectamente a nuestras rooms por rol y por pedido. El código de ejemplo está en `webSockets_front_y_back/websocket_nuevo_seguridad/app/core/websocket.py`.

### 2. Autenticación vía cookie JWT (misma que REST)
**Decisión**: En el handshake WebSocket, leer la cookie `access_token`, decodificarla, obtener el usuario, validar que existe y está activo. Rechazar conexión (código 4001) si no es válido.
**Por qué**: Reutiliza el sistema de auth existente. No requiere tokens especiales ni headers personalizados. La cookie HttpOnly se envía automáticamente en el handshake de WebSocket cuando se usa el mismo origen.
**Alternativa considerada**: Token de consulta (?token=...). Descartado porque expone el token en logs del servidor.

### 3. Rooms por rol y por pedido
**Decisión**: Al conectar, el usuario se une automáticamente a `role:{su_rol_codigo}` (ej: `role:COCINERO`). Además, cuando se emite un evento de pedido, se envía a `order:{pedido_id}` y a los roles relevantes según la acción.
**Por qué**: Los cocineros solo necesitan ver pedidos en estado PREPARANDO, los cajeros los pedidos LISTO, y los admins ven todo. Filtrar por rol evita sobrecargar clientes con datos irrelevantes.
**Ejemplo**: Cuando un cajero cambia un pedido a LISTO, el evento se emite a `role:COCINERO` (siguiente en la cadena) y `role:ADMIN`.

### 4. Event emission desde PedidoService
**Decisión**: Después de cada `ejecutar_accion()` exitoso, el servicio obtiene el `ConnectionManager` vía dependencia y emite un evento `order_updated` con el pedido serializado a la room `order:{id}` y a los roles que deberían reaccionar.
**Por qué**: Centraliza la lógica: no hay endpoints que "olviden" emitir. Cualquier cambio de estado → evento WebSocket.
**Implementación**: Se pasa `ConnectionManager` como dependencia opcional en el constructor de `PedidoService`. Si no está disponible (tests), no falla.

### 5. Hook useWebSocket en frontend-admin
**Decisión**: Hook React que: (a) conecta al WebSocket en la URL `/api/v1/pedidos/ws`, (b) maneja reconexión automática con backoff exponencial (1s, 2s, 4s, max 30s), (c) emite eventos tipados para que los componentes se suscriban.
**Por qué**: Separa la lógica de conexión WebSocket de la UI. El Kanban solo se suscribe a `onOrderUpdated` y actualiza el estado.
**Implementación**: Usar `useRef` para la conexión, `useState` para el estado de conexión, y un pattern de callback registration.

### 6. Proxy de Vite con ws: true
**Decisión**: En `vite.config.ts` de frontend-admin, agregar `ws: true` a la configuración del proxy existente. Esto hace que Vite enrute las conexiones WebSocket al backend.
**Por qué**: En desarrollo el frontend corre en :5174 y el backend en :8000. Sin `ws: true`, el navegador no puede conectar WebSocket cross-origin con cookies HttpOnly. El proxy resuelve ambos problemas.
**Alternativa**: Configurar CORS y conexión directa a `ws://localhost:8000/...`. Descartado porque las cookies HttpOnly no se envían en conexiones cross-origin.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|-----------|
| Perder conexión WebSocket (cierre de laptop, red) | Reconexión automática con backoff exponencial. El Kanban se reconstruye desde REST al reconectar. |
| Múltiples instancias del servidor (escalado horizontal) | Por ahora es single-instancia. Si escala, migrar a Redis PubSub para ConnectionManager compartido. |
| WebSocket bloquea el event loop | FastAPI usa `async` para WebSocket. Las operaciones de broadcast son rápidas (dict lookup + iteración). No hay IO bloqueante. |
| Cookie no se envía en handshake WS | Solo ocurre si el frontend no conecta desde el mismo origen. Con el proxy de Vite con `ws: true`, el origen es el mismo. |
| Cliente recibe eventos de pedidos que no debería ver | El backend solo emite a rooms de roles autorizados. El frontend no necesita filtrar. |

## Open Questions

- ¿Necesitamos heartbeat/ping para detectar conexiones muertas? FastAPI/Starlette no tiene ping automático. Podríamos agregar un ping cada 30s desde el servidor.
- ¿Frontend-store recibe eventos también? Por ahora no, pero la arquitectura de rooms lo soportaría fácilmente agregando `role:CLIENT`.
