# real-time-orders Specification

## Purpose
TBD - created by archiving change websocket-implementation. Update Purpose after archive.
## Requirements
### Requirement: WebSocket connection with JWT auth
The system SHALL provide a WebSocket endpoint at `/api/v1/pedidos/ws` that authenticates via the `access_token` cookie.
The system SHALL reject unauthenticated connections with WebSocket close code 4001.
The system SHALL close connections when the user's session expires or the token is invalid.

#### Scenario: Successful connection
- **WHEN** a user connects to `/api/v1/pedidos/ws` with a valid `access_token` cookie
- **THEN** the connection SHALL be accepted and the user SHALL join the room for their role (`role:ADMIN`, `role:CAJERO`, etc.)

#### Scenario: Rejected connection
- **WHEN** a user connects without a valid `access_token` cookie
- **THEN** the connection SHALL be closed with code 4001

### Requirement: Order state change events
The system SHALL emit a WebSocket event after every successful order state change via `ejecutar_accion()`.
The event payload SHALL contain the full serialized order after the change.

#### Scenario: Event emitted to order room
- **WHEN** a user changes an order state (e.g., PREPARAR, LISTO, ENTREGAR)
- **THEN** a message `{"type": "order_updated", "data": <pedido>}` SHALL be broadcast to `order:{id}` room

#### Scenario: Event emitted to role rooms
- **WHEN** an order state change occurs
- **THEN** the event SHALL also be broadcast to the role rooms of roles that should be notified (e.g., when CAJERO marks LISTO, broadcast to `role:COCINERO` and `role:ADMIN`)

### Requirement: Frontend receives real-time updates
The admin panel SHALL receive WebSocket events and update the Kanban board in real time without polling.
The system SHALL NOT use `refetchInterval` when WebSocket is connected.

#### Scenario: Kanban updates on event
- **WHEN** the frontend receives an `order_updated` event via WebSocket
- **THEN** the Kanban board SHALL immediately update the corresponding order card without a page refresh

#### Scenario: Reconnection after disconnect
- **WHEN** the WebSocket connection drops
- **THEN** the frontend SHALL attempt to reconnect with exponential backoff (1s, 2s, 4s, max 30s)
- **THEN** after reconnection, the frontend SHALL re-fetch the full order list via REST to recover any missed events

### Requirement: Connection state feedback
The system SHALL show the WebSocket connection state in the UI so users know if updates are live or delayed.

#### Scenario: Connection indicator
- **WHEN** the WebSocket is connected
- **THEN** a green indicator SHALL appear in the Kanban header
- **WHEN** the WebSocket is disconnected or reconnecting
- **THEN** a yellow/red indicator SHALL appear and the board SHALL fall back to polling

