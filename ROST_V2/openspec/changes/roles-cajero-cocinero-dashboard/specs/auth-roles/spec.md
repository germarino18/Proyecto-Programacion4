## ADDED Requirements

### Requirement: Catálogo de roles
El sistema SHALL mantener un catálogo de roles con los siguientes códigos:
- `ADMIN`: Administrador con acceso total al sistema
- `STOCK`: Gestor de stock, puede administrar productos
- `PEDIDOS`: Gestor de pedidos, puede confirmar, entregar y cancelar pedidos
- `CAJERO`: Operador de mostrador, puede confirmar, entregar y cancelar pedidos
- `COCINERO`: Personal de cocina, puede preparar y marcar pedidos como listos
- `CLIENT`: Usuario final que realiza pedidos desde la tienda

#### Scenario: Seed de roles
- **WHEN** el sistema se inicializa con `run_seed()`
- **THEN** los 6 roles deben existir en la tabla `roles` con sus descripciones

#### Scenario: Listar roles
- **WHEN** un usuario autenticado con rol ADMIN hace GET a `/api/v1/admin/roles`
- **THEN** el sistema retorna la lista completa de roles del catálogo

### Requirement: Asignación de roles a usuarios
El sistema SHALL permitir asignar uno o más roles a un usuario existente.
El sistema SHALL permitir remover roles de un usuario.
Un usuario PUEDE tener múltiples roles simultáneamente.

#### Scenario: Asignar rol a usuario
- **WHEN** un ADMIN hace POST a `/api/v1/admin/usuarios/{id}/roles` con `{"rol_codigo": "COCINERO"}`
- **THEN** el sistema asigna el rol COCINERO al usuario y retorna mensaje de éxito

#### Scenario: Remover rol de usuario
- **WHEN** un ADMIN hace DELETE a `/api/v1/admin/usuarios/{id}/roles/COCINERO`
- **THEN** el sistema remueve el rol COCINERO del usuario

#### Scenario: Asignar rol duplicado
- **WHEN** un ADMIN intenta asignar un rol que el usuario ya tiene
- **THEN** el sistema no crea duplicado y retorna mensaje de éxito igualmente

#### Scenario: Remover rol inexistente
- **WHEN** un ADMIN intenta remover un rol que el usuario no tiene
- **THEN** el sistema retorna error 404

### Requirement: Creación de usuarios por ADMIN
El sistema SHALL exponer un endpoint `POST /api/v1/admin/usuarios` para que usuarios con rol ADMIN creen nuevos usuarios.
El cuerpo de la solicitud SHALL incluir email, nombre, password y lista de roles a asignar.
El sistema NO SHALL asignar el rol CLIENT automáticamente cuando un ADMIN crea un usuario (el ADMIN decide qué roles asignar).

#### Scenario: Admin crea usuario con roles específicos
- **WHEN** un ADMIN hace POST a `/api/v1/admin/usuarios` con `{"email": "carlos@rost.com", "nombre": "Carlos", "password": "123456", "roles": ["CAJERO", "COCINERO"]}`
- **THEN** el sistema crea el usuario con los roles CAJERO y COCINERO, y retorna el usuario creado con sus roles

#### Scenario: Admin crea usuario con email duplicado
- **WHEN** un ADMIN intenta crear un usuario con un email ya registrado
- **THEN** el sistema retorna error 409 (Conflict)

### Requirement: Verificación de roles
El sistema SHALL verificar que un usuario tenga el rol requerido antes de ejecutar acciones protegidas.
El rol ADMIN SHALL tener acceso a todas las acciones sin restricción (skip de validación).

#### Scenario: Acceso denegado por rol insuficiente
- **WHEN** un usuario sin rol ADMIN intenta acceder a `/api/v1/admin/usuarios`
- **THEN** el sistema retorna error 403 (Forbidden)
