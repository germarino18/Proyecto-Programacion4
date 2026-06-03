## ADDED Requirements

### Requirement: Kanban adaptativo por rol
El sistema SHALL mostrar un tablero Kanban de 3 columnas que se adapte según los roles del usuario autenticado.
Las columnas SHALL ser: "Pendientes", "En preparación", "Listos".
Debajo de las 3 columnas SHALL haber una sección "Historial" con los pedidos entregados.

#### Scenario: Visualización del Kanban
- **WHEN** cualquier usuario con rol ADMIN, PEDIDOS, CAJERO o COCINERO accede a la página de pedidos
- **THEN** ve las 3 columnas con los pedidos agrupados por estado y el historial debajo

### Requirement: Botones por columna y rol
Los botones disponibles en cada columna SHALL depender del rol del usuario:

| Columna | Estado | Botón | Roles |
|---------|--------|-------|-------|
| Pendientes | PENDIENTE | Confirmar | ADMIN, PEDIDOS, CAJERO |
| Pendientes | PENDIENTE | Cancelar | ADMIN, PEDIDOS, CAJERO |
| Pendientes | CONFIRMADO | Preparar | ADMIN, COCINERO |
| En preparación | EN_PREP | Listo | ADMIN, COCINERO |
| Listos | LISTO | Entregar | ADMIN, PEDIDOS, CAJERO |

#### Scenario: CAJERO ve botones de confirmar y entregar
- **WHEN** un CAJERO ve el Kanban
- **THEN** ve botón "Confirmar" en pedidos PENDIENTE, botón "Cancelar" en PENDIENTE, y botón "Entregar" en pedidos LISTO
- **THEN** NO ve botón "Preparar" ni "Listo"

#### Scenario: COCINERO ve botones de preparar y listo
- **WHEN** un COCINERO ve el Kanban
- **THEN** ve botón "Preparar" en pedidos CONFIRMADO y botón "Listo" en pedidos EN_PREP
- **THEN** NO ve botón "Confirmar", "Entregar" ni "Cancelar"

#### Scenario: ADMIN ve todos los botones
- **WHEN** un ADMIN ve el Kanban
- **THEN** ve todos los botones: Confirmar, Cancelar, Preparar, Listo, Entregar

### Requirement: Acción "Entregar" mueve al historial
Cuando se ejecuta la acción "Entregar" sobre un pedido en LISTO, el pedido SHALL:
1. Cambiar a estado ENTREGADO
2. Desaparecer de la columna "Listos"
3. Aparecer en la sección de Historial debajo del Kanban

#### Scenario: Entrega de pedido
- **WHEN** un ADMIN, PEDIDOS o CAJERO hace clic en "Entregar" sobre un pedido en LISTO
- **THEN** el pedido desaparece de la columna Listos y aparece en el historial con fecha y quién lo entregó

### Requirement: Auto-refetch cada 15 segundos
El Kanban SHALL actualizar los pedidos automáticamente cada 15 segundos mediante polling.

#### Scenario: Auto-actualización
- **WHEN** el Kanban está abierto
- **THEN** cada 15 segundos se refetcha la lista de pedidos
