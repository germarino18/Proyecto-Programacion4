## ADDED Requirements

### Requirement: Tablero Kanban de pedidos

El sistema de gestión de pedidos del panel admin SHALL mostrar un tablero Kanban con 3 columnas: Pendientes, En preparación y Entregado.

#### Scenario: Visualización de columnas
- **WHEN** un usuario con rol ADMIN o PEDIDOS navega a /admin/pedidos
- **THEN** el sistema muestra 3 columnas tituladas "Pendientes", "En preparación" y "Entregado"
- **THEN** cada columna muestra la cantidad de pedidos en ese estado

#### Scenario: Agrupación por estado
- **WHEN** existen pedidos con diferentes estados
- **THEN** los pedidos PENDIENTE se muestran en la columna "Pendientes"
- **THEN** los pedidos EN_PREP se muestran en la columna "En preparación"
- **THEN** los pedidos ENTREGADO se muestran en la columna "Entregado"

#### Scenario: Auto-refetch
- **WHEN** el tablero está abierto
- **THEN** los datos se actualizan automáticamente cada 15 segundos

### Requirement: Tarjeta de pedido

Cada pedido en el tablero SHALL mostrar: número de pedido, hora de creación, tiempo transcurrido, lista de items con cantidad y nombre, y total.

#### Scenario: Contenido de tarjeta
- **WHEN** se renderiza un pedido en cualquier columna
- **THEN** la tarjeta SHALL mostrar "Pedido #{id}"
- **THEN** la tarjeta SHALL mostrar la hora de creación y el tiempo transcurrido
- **THEN** la tarjeta SHALL mostrar cada item como "{cantidad}x {nombre_snapshot}"
- **THEN** la tarjeta SHALL mostrar el total formateado

### Requirement: Avance de estado desde columna Pendientes

La columna Pendientes SHALL permitir avanzar pedidos a "En preparación" o cancelarlos.

#### Scenario: Preparar pedido
- **WHEN** el usuario hace clic en "Preparar" en un pedido PENDIENTE
- **THEN** el sistema cambia el estado a EN_PREP
- **THEN** el pedido se mueve visualmente a la columna "En preparación"

#### Scenario: Cancelar pedido
- **WHEN** el usuario hace clic en "Cancelar" en un pedido PENDIENTE
- **THEN** el sistema cambia el estado a CANCELADO
- **THEN** el pedido desaparece del tablero

### Requirement: Avance de estado desde columna En preparación

La columna En preparación SHALL permitir marcar pedidos como entregados.

#### Scenario: Entregar pedido
- **WHEN** el usuario hace clic en "Entregar" en un pedido EN_PREP
- **THEN** el sistema cambia el estado a ENTREGADO
- **THEN** el pedido se mueve visualmente a la columna "Entregado"

### Requirement: Simplificación de máquina de estados

El backend SHALL actualizar las transiciones válidas al flujo: PENDIENTE → EN_PREP → ENTREGADO.

#### Scenario: Transición PENDIENTE a EN_PREP
- **WHEN** se envía PATCH /api/v1/pedidos/{id}/estado con nuevo_estado="EN_PREP"
- **AND** el pedido está en estado PENDIENTE
- **THEN** el sistema cambia el estado del pedido a EN_PREP

#### Scenario: Transición EN_PREP a ENTREGADO
- **WHEN** se envía PATCH /api/v1/pedidos/{id}/estado con nuevo_estado="ENTREGADO"
- **AND** el pedido está en estado EN_PREP
- **THEN** el sistema cambia el estado del pedido a ENTREGADO

#### Scenario: Transición inválida
- **WHEN** se envía PATCH /api/v1/pedidos/{id}/estado con nuevo_estado="ENTREGADO"
- **AND** el pedido está en estado PENDIENTE
- **THEN** el sistema responde con error 422
