## ADDED Requirements

### Requirement: Dashboard de estadísticas
El sistema SHALL exponer un endpoint `GET /api/v1/admin/estadisticas` accesible solo por usuarios con rol ADMIN.
El endpoint SHALL retornar un objeto JSON con las siguientes métricas del negocio.

#### Scenario: Acceso al dashboard
- **WHEN** un ADMIN hace GET a `/api/v1/admin/estadisticas`
- **THEN** el sistema retorna un objeto con las métricas del negocio

#### Scenario: Acceso denegado sin rol ADMIN
- **WHEN** un usuario sin rol ADMIN intenta acceder a `/api/v1/admin/estadisticas`
- **THEN** el sistema retorna error 403

### Requirement: Métricas incluidas
El endpoint SHALL incluir al menos las siguientes métricas:

#### Scenario: Pedidos del día
- **WHEN** se consultan las estadísticas
- **THEN** el sistema retorna `pedidos_hoy` (cantidad de pedidos creados hoy) e `ingresos_hoy` (suma de totales de pedidos creados hoy)

#### Scenario: Pedidos de la semana
- **WHEN** se consultan las estadísticas
- **THEN** el sistema retorna `pedidos_semana` e `ingresos_semana` (últimos 7 días)

#### Scenario: Pedidos por estado
- **WHEN** se consultan las estadísticas
- **THEN** el sistema retorna `pedidos_por_estado` con un conteo agrupado por `estado_actual`

#### Scenario: Productos más vendidos
- **WHEN** se consultan las estadísticas
- **THEN** el sistema retorna `productos_mas_vendidos` con los top 5 productos por cantidad vendida (suma de cantidades en detalles_pedido)

#### Scenario: Stock bajo
- **WHEN** se consultan las estadísticas
- **THEN** el sistema retorna `stock_bajo` con los productos cuyo `stock_cantidad` es menor o igual a 5

#### Scenario: Pedidos últimos 7 días
- **WHEN** se consultan las estadísticas
- **THEN** el sistema retorna `pedidos_ultimos_7_dias` con un array de {fecha, total} para cada uno de los últimos 7 días

### Requirement: Vista de dashboard en frontend
El frontend admin SHALL tener una página Dashboard accesible desde `/admin` que muestre las estadísticas en un grid de tarjetas.
Solo usuarios con rol ADMIN SHALL poder ver esta página.

#### Scenario: Visualización del dashboard
- **WHEN** un ADMIN navega a `/admin`
- **THEN** ve un grid con tarjetas que muestran: pedidos hoy, ingresos hoy, pedidos por estado, productos más vendidos, stock bajo
