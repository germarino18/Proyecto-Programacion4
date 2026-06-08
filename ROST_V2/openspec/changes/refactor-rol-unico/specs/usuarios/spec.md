# Usuarios

## ADDED Requirements

### Requirement: Usuario tiene un solo rol
El sistema SHALL asignar exactamente un rol por usuario.
El rol SHALL almacenarse como FK directa (`rol_codigo`) en la tabla `usuarios`.
El sistema SHALL eliminar la tabla intermedia `usuarios_roles`.

#### Scenario: Crear usuario con rol
- **WHEN** se crea un usuario via API con un `rol_codigo` válido
- **THEN** el usuario queda asociado a ese único rol

#### Scenario: Usuario sin rol no tiene acceso
- **WHEN** un usuario tiene `rol_codigo = NULL`
- **THEN** cualquier endpoint protegido con `require_role()` SHALL rechazar la solicitud con 403

#### Scenario: Cambiar rol de usuario
- **WHEN** se actualiza el `rol_codigo` de un usuario existente
- **THEN** el usuario inmediatamente cambia su rol (no hay período de solapamiento)

### Requirement: Roles disponibles
El sistema SHALL mantener los mismos roles que en el modelo anterior: `ADMIN`, `STOCK`, `PEDIDOS`, `CLIENT`, `CAJERO`, `COCINERO`.
La tabla `roles` SHALL permanecer inalterada.

#### Scenario: Listar roles
- **WHEN** se consulta la lista de roles via API
- **THEN** se devuelven exactamente los 6 roles existentes

### Requirement: require_role verifica rol único
La dependency `require_role(rol_codigo: str)` SHALL verificar que `current_user.rol_codigo == rol_codigo`.

#### Scenario: Acceso permitido
- **WHEN** un usuario con `rol_codigo = "ADMIN"` accede a un endpoint decorado con `require_role("ADMIN")`
- **THEN** el acceso es concedido

#### Scenario: Acceso denegado por rol incorrecto
- **WHEN** un usuario con `rol_codigo = "CLIENT"` accede a un endpoint decorado con `require_role("ADMIN")`
- **THEN** el acceso es rechazado con 403 Forbidden

#### Scenario: Acceso denegado por rol nulo
- **WHEN** un usuario con `rol_codigo = NULL` accede a cualquier endpoint con `require_role()`
- **THEN** el acceso es rechazado con 403 Forbidden
