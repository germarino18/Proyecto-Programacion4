## Context

Actualmente ROST_V2 modela roles mediante una relación M:N entre `Usuario` y `Rol` a través de la tabla intermedia `usuarios_roles` (modelo `UsuarioRol`). Esto obliga a hacer joins en cada verificación de permisos, duplica lógica en los frontends (que reciben arrays de 1 elemento) y es un bloqueante para la implementación de WebSockets — donde los rooms se asignan por rol único. El negocio no requiere que un usuario tenga múltiples roles simultáneamente.

## Goals / Non-Goals

**Goals:**
- Eliminar la tabla intermedia `UsuarioRol` y su modelo SQLAlchemy
- Agregar `rol_codigo` como columna directa con FK en `Usuario`
- Simplificar `require_role()` a un solo rol
- Actualizar todos los routers, services, repositories y schemas
- Adaptar ambos frontends (admin y store)
- Migrar datos existentes de `usuarios_roles` a `usuario.rol_codigo`
- Mantener exactamente los mismos roles existentes (`ADMIN`, `STOCK`, `PEDIDOS`, `CLIENT`, `CAJERO`, `COCINERO`)

**Non-Goals:**
- No se agregan ni eliminan roles del sistema
- No se cambia la lógica de negocio de pedidos (las transiciones de estado y acciones permitidas se mantienen idénticas)
- No se implementa WebSocket aún (es el siguiente change)
- No se cambia el sistema de autenticación (JWT, cookies, etc.)

## Decisions

### 1. Columna directa con FK en vez de tabla intermedia
**Decisión**: Agregar `rol_codigo: Mapped[str]` con `ForeignKey("roles.codigo")` en `Usuario`, eliminar `UsuarioRol`.
**Por qué**: Es la opción más simple y directa. Elimina joins innecesarios, simplifica queries, y se alinea con el requerimiento de 1 rol por usuario.
**Alternativa considerada**: Mantener `UsuarioRol` pero forzar lógicamente 1 rol. Descartado porque el código seguiría teniendo complejidad innecesaria.

### 2. Relación `usuario.rol` como objeto `Rol` en vez de string
**Decisión**: Mantener `rol: Mapped["Rol"] = relationship(...)` en `Usuario`, apuntando a `rol_codigo`.
**Por qué**: El ORM resuelve automáticamente el objeto `Rol` relacionado, permitiendo acceder a `usuario.rol.codigo` y `usuario.rol.nombre`. La serialización se simplifica porque el rol viene resuelto.
**Alternativa considerada**: Usar solo el string `rol_codigo` y resolver manualmente. Descartado porque perderíamos la navegación del ORM.

### 3. Migración en dos pasos (data + schema)
**Decisión**: Migración Alembic que:
1. Agrega `rol_codigo` como nullable
2. Migra datos: `UPDATE usuario SET rol_codigo = (SELECT rol_codigo FROM usuarios_roles WHERE usuario_id = usuario.id LIMIT 1)`
3. Hace `rol_codigo` NOT NULL
4. Agrega FK constraint
5. Elimina tabla `usuarios_roles`
**Por qué**: Es segura — los pasos intermedios permiten rollback. Si un usuario tuviera múltiples roles (no debería, pero por si acaso), toma el primero.
**Rollback**: La migración down recrea `usuarios_roles` y mueve los datos de vuelta.

### 4. `require_role` simplificado a un solo rol
**Decisión**: El decorador/dependency `require_role(rol_codigo: str)` recibe un string en vez de lista.
**Por qué**: Simplifica la API — ahora toda verificación es `require_role("ADMIN")` en vez de `require_role(["ADMIN"])`. Si en el futuro hiciera falta multi-rol, se puede extender.
**Compatibilidad**: Se actualizan todas las llamadas existentes en routers.

### 5. Frontend: tipos y componentes simplificados
**Decisión**: En ambos frontends, `Usuario.rol` pasa de `string[]` / `Rol[]` a `string | null` o `Rol | null`.
**Por qué**: Refleja el modelo del backend. Los componentes que verificaban `roles.includes("ADMIN")` pasan a `rol === "ADMIN"`. Simplifica guard clauses y condiciones.
**Componentes afectados**: `AuthContext` (tipo del usuario), `ProtectedRoute` (verificación), `AdminLayout` (filtro), `AdminIndexRedirect` (redirect), `UsuariosPage` (selector), `PedidosKanbanPage` (filtros).

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|-----------|
| Un usuario con múltiples roles en producción | La migración toma el primer rol con `LIMIT 1`, no pierde datos. Queda log para auditoría. |
| Frontend admin espera `roles: string[]` y rompe | Se actualizan todos los consumidores en el mismo change. El type checker (tsc) detecta usos no migrados. |
| Dependencias externas o integraciones que usen `usuarios_roles` | Se audita el código: no hay integraciones externas. La tabla solo se usa internamente. |
| Migración falla por datos inconsistentes | Migración en pasos con validación intermedia. Se puede hacer rollback completo. |
