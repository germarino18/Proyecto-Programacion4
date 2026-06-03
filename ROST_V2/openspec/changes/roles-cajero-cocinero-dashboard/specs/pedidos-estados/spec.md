## ADDED Requirements

### Requirement: Máquina de estados basada en acciones
El sistema SHALL reemplazar el sistema de transiciones libres por un sistema de acciones con estado origen, estado destino y roles permitidos.
Cada acción SHALL tener un estado origen válido, un estado destino, y una lista de roles que pueden ejecutarla.
ADMIN SHALL poder ejecutar cualquier acción independientemente de los roles definidos.

#### Escenario: Acciones definidas
- **WHEN** el sistema procesa pedidos
- **THEN** las siguientes acciones DEBEN estar disponibles:
  - `CONFIRMAR`: origen PENDIENTE → destino CONFIRMADO, roles: ADMIN, PEDIDOS, CAJERO
  - `PREPARAR`: origen CONFIRMADO → destino EN_PREP, roles: ADMIN, COCINERO
  - `LISTO`: origen EN_PREP → destino LISTO, roles: ADMIN, COCINERO
  - `ENTREGAR`: origen LISTO → destino ENTREGADO, roles: ADMIN, PEDIDOS, CAJERO
  - `CANCELAR`: origen PENDIENTE|CONFIRMADO → destino CANCELADO, roles: ADMIN, PEDIDOS, CAJERO

### Requirement: Validación de acción
El sistema SHALL validar que:
1. El estado actual del pedido coincida con el origen de la acción solicitada
2. El usuario autenticado tenga uno de los roles requeridos para la acción
3. Si el usuario es ADMIN, salta la validación de roles (punto 2)

#### Scenario: Acción exitosa
- **WHEN** un COCINERO hace PATCH a `/api/v1/pedidos/{id}/accion` con `{"accion": "PREPARAR"}` y el pedido está en CONFIRMADO
- **THEN** el sistema cambia el estado del pedido a EN_PREP y registra el historial

#### Scenario: Acción con estado incorrecto
- **WHEN** un COCINERO intenta PREPARAR un pedido que está en EN_PREP (no en CONFIRMADO)
- **THEN** el sistema retorna error 422

#### Scenario: Acción sin rol suficiente
- **WHEN** un CAJERO intenta PREPARAR un pedido
- **THEN** el sistema retorna error 403

#### Scenario: ADMIN fuerza cualquier acción
- **WHEN** un ADMIN hace PREPARAR, LISTO, CONFIRMAR, ENTREGAR o CANCELAR sobre cualquier pedido en cualquier estado válido
- **THEN** el sistema ejecuta la acción sin validar roles

### Requirement: Historial de estados
Cada cambio de estado SHALL registrarse en `historial_estados_pedido` con:
- pedido_id, estado nuevo, usuario que lo cambió (cambiado_por), fecha

#### Scenario: Registro de historial
- **WHEN** un COCINERO ejecuta PREPARAR sobre un pedido
- **THEN** el historial registra: `{estado: "EN_PREP", cambiado_por: <id_cocinero>}`

### Requirement: Estado LISTO
El sistema SHALL tener un estado `LISTO` que indica que el pedido fue preparado y está listo para entregar.
El estado LISTO SHALL ser el estado antes de ENTREGADO.
El estado ENTREGADO SHALL indicar que el pedido fue entregado al cliente y debe moverse al historial.

#### Scenario: Flujo completo de estados
- **WHEN** un pedido sigue el flujo normal
- **THEN** pasa por: PENDIENTE → CONFIRMADO → EN_PREP → LISTO → ENTREGADO
