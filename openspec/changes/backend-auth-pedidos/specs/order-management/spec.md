## ADDED Requirements

### Requirement: EstadoPedido catalog
The system SHALL have a EstadoPedido catalog with six states: PENDIENTE, CONFIRMADO, EN_PREP, EN_CAMINO, ENTREGADO, CANCELADO.

#### Scenario: Seed creates estados
- **WHEN** the seed runs
- **THEN** all six EstadoPedido records are created

### Requirement: FormaPago catalog
The system SHALL have a FormaPago catalog with at least: Efectivo, Tarjeta de crédito, Transferencia, Mercado Pago.

#### Scenario: Seed creates formas de pago
- **WHEN** the seed runs
- **THEN** the four FormaPago records are created

### Requirement: Create order with atomic transaction
The system SHALL create a Pedido with its DetallePedido items, initial HistorialEstadoPedido, and stock updates in a single atomic transaction using UnitOfWork.

#### Scenario: Successful order creation
- **WHEN** a cliente creates a pedido via POST /api/v1/pedidos with items, direccion_id, and forma_pago_id
- **THEN** the system creates the Pedido (estado_actual = "PENDIENTE"), inserts DetallePedido records with precio_snapshot and nombre_snapshot, inserts the first HistorialEstadoPedido, decrements stock_cantidad for each product, and returns 201

#### Scenario: Insufficient stock
- **WHEN** a cliente tries to order a product with cantidad > stock_cantidad
- **THEN** the system returns 422 Unprocessable Entity and rolls back the entire transaction

### Requirement: Order state machine
The system SHALL enforce a finite state machine for pedido transitions. Valid transitions: PENDIENTE → [CONFIRMADO, CANCELADO], CONFIRMADO → [EN_PREP, CANCELADO], EN_PREP → [EN_CAMINO], EN_CAMINO → [ENTREGADO], ENTREGADO → [], CANCELADO → [].

#### Scenario: Valid transition
- **WHEN** an authorized user requests PATCH /api/v1/pedidos/{id}/estado with a valid next state
- **THEN** the system updates estado_actual, inserts a HistorialEstadoPedido record, and returns the updated pedido

#### Scenario: Invalid transition
- **WHEN** an authorized user tries to transition from ENTREGADO to EN_PREP
- **THEN** the system returns 422 Unprocessable Entity

### Requirement: Client sees own orders
The system SHALL filter pedidos by the authenticated user when the role is CLIENT. ADMIN and PEDIDOS roles see all orders.

#### Scenario: CLIENT lists orders
- **WHEN** a CLIENT user requests GET /api/v1/pedidos
- **THEN** the system returns only that user's pedidos

#### Scenario: ADMIN lists all orders
- **WHEN** an ADMIN user requests GET /api/v1/pedidos
- **THEN** the system returns all pedidos

### Requirement: Client can cancel own order
The system SHALL allow a CLIENT to cancel their own pedido only from PENDIENTE or CONFIRMADO state.

#### Scenario: Client cancels own pending order
- **WHEN** a CLIENT requests PATCH /api/v1/pedidos/{id}/cancelar on their own pedido in PENDIENTE state
- **THEN** the system transitions to CANCELADO

#### Scenario: Client cannot cancel another's order
- **WHEN** a CLIENT requests cancel on a pedido belonging to another user
- **THEN** the system returns 403 Forbidden

### Requirement: Snapshot pattern on DetallePedido
The system SHALL copy precio_base and nombre from Producto into DetallePedido as precio_snapshot and nombre_snapshot at the moment of order creation. These fields SHALL be immutable.

#### Scenario: Snapshot values match product at order time
- **WHEN** a DetallePedido is created
- **THEN** precio_snapshot equals the product's precio_base and nombre_snapshot equals the product's nombre at that moment

### Requirement: Append-only historial
The system SHALL store estado transitions in HistorialEstadoPedido with INSERT-only semantics. The table SHALL have no UPDATE or DELETE operations in application code.

#### Scenario: Transition creates historial record
- **WHEN** a pedido transitions to a new estado
- **THEN** a new HistorialEstadoPedido record is inserted with pedido_id, estado, and cambiado_por (usuario_id)

### Requirement: Order detail includes historial
The system SHALL return the full transition history sorted by fecha when fetching a single pedido.

#### Scenario: Get pedido with historial
- **WHEN** a user requests GET /api/v1/pedidos/{id}
- **THEN** the response includes a historial array ordered by fecha ascending
