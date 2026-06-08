## Why

Actualmente el sistema maneja roles múltiples por usuario mediante una tabla intermedia `UsuarioRol` (M:N), lo que agrega complejidad innecesaria: el negocio no requiere que un usuario tenga más de un rol. Esta complejidad extra se arrastra a todos los niveles (modelos, queries, dependencies, frontends) y es un bloqueante directo para implementar WebSockets — donde los rooms se asignan por rol único. Simplificar a un solo rol por usuario reduce código, elimina joins innecesarios y prepara el terreno para la implementación de WebSockets.

## What Changes

- **BREAKING**: Se elimina la tabla `usuarios_roles` y el modelo `UsuarioRol`
- Se agrega `rol_codigo` como FK directa en el modelo `Usuario`
- Se cambia el tipo de `Usuario.rol` de `list[Rol]` a `Rol | None`
- Se simplifica `require_role()` en `dependencies.py` para recibir un solo rol string
- Se actualizan todos los routers que verifican roles (`pedido`, `usuario`, `auth`, `estadisticas`, `producto`)
- Se actualiza `seed.py` para asignar un solo rol por usuario
- Se actualiza `frontend-admin`: `AuthContext`, `ProtectedRoute`, `AdminLayout`, `AdminIndexRedirect`, `UsuariosPage`, `PedidosKanbanPage`
- Se actualiza `frontend-store`: `authStore`, tipos
- Se limpian migraciones (squash o migración nueva que refleje el cambio de schema)

## Capabilities

### New Capabilities
*(ninguna — no se introducen nuevas capacidades)*

### Modified Capabilities
*(ninguna — no existen specs previas. Es un refactor de implementation que no cambia requisitos externos)*

## Impact

- **Backend**: `Usuario` model, `UsuarioRol` model (eliminado), `dependencies.py`, `pedido/router.py`, `pedido/service.py`, `auth/service.py`, `auth/schemas.py`, `usuario/router.py`, `usuario/service.py`, `usuario/repository.py`, `usuario/schemas.py`, `seed.py`, migraciones Alembic
- **Frontend-admin**: `AuthContext.tsx`, `ProtectedRoute.tsx`, `AdminLayout.tsx`, `AdminIndexRedirect.tsx`, `UsuariosPage.tsx`, `PedidosKanbanPage.tsx`
- **Frontend-store**: `authStore.ts`, `types.ts`
- **Datos**: Migración de base de datos que mueve el rol de `usuarios_roles` a `usuario.rol_codigo`
