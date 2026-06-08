## 1. Backend — Modelo y Base de Datos

- [x] 1.1 Agregar `rol_codigo` como columna FK en `Usuario` (`auth/models.py`): `rol_codigo: Mapped[str | None]` con `ForeignKey("roles.codigo")`, más relationship `rol: Mapped["Rol"] = Relationship(...)` apuntando a `rol_codigo`
- [x] 1.2 Eliminar modelo `UsuarioRol` de `usuario/usuario_rol.py` (el archivo completo se puede eliminar o dejar como stub comentado)
- [x] 1.3 Crear script de migración `backend/scripts/migrate_roles.py` que: (a) agregue columna `rol_codigo` a `usuarios`, (b) migre datos desde `usuarios_roles`, (c) agregue FK constraint, (d) elimine tabla `usuarios_roles`
- [x] 1.4 Actualizar `usuario/models.py` (barrel): eliminar re-export de `UsuarioRol`, mantener solo `Rol`
- [x] 1.5 Actualizar `app/__init__.py`: eliminar import de `UsuarioRol`

## 2. Backend — Dependencies

- [x] 2.1 Simplificar `require_role()` en `core/dependencies.py`: cambiar firma a `require_role(rol_codigo: str)`, verificar `current_user.rol_codigo == rol_codigo`, eliminar import de `UsuarioRol`
- [x] 2.2 Actualizar `require_admin`: cambiar a `require_role("ADMIN")`

## 3. Backend — Auth (registro/login)

- [x] 3.1 Actualizar `auth/service.py`: en `register()`, asignar `usuario.rol_codigo = cliente_rol.codigo` en vez de crear `UsuarioRol`
- [x] 3.2 Actualizar `auth/schemas.py`: simplificar `AuthUserRead` — eliminar `roles: list[UsuarioRolRead]`, agregar `rol: RolRead | None`

## 4. Backend — Pedido (router + service)

- [x] 4.1 Actualizar `pedido/router.py`: eliminar los 4 queries manuales a `UsuarioRol`, usar `current_user.rol_codigo` directamente. `listar_pedidos()` y `obtener_pedido()` verifican `current_user.rol_codigo in ("ADMIN", "PEDIDOS", "CAJERO", "COCINERO")` para scoping. `ejecutar_accion()` y `cancelar_pedido()` pasan `[current_user.rol_codigo]` al service.
- [x] 4.2 Actualizar `pedido/service.py`: `ejecutar_accion()` recibe `roles_usuario: list[str]` (con un solo elemento). La lógica "ADMIN in roles" y el lookup en ACCIONES funciona igual porque la lista tiene un solo elemento.

## 5. Backend — Usuario (admin CRUD)

- [x] 5.1 Actualizar `usuario/schemas.py`: `AdminUserRead.roles` pasa de `List[str]` a `rol_codigo: str | None`. `AdminUserCreate.roles` pasa a `rol_codigo: str`. Eliminar `AdminRolAsignar`.
- [x] 5.2 Actualizar `usuario/repository.py`: eliminar `get_roles_by_user_id()`, `get_user_role_by_codes()`, `assign_role()`, `remove_role()`. Mantener `get_rol_by_codigo()` y `get_all_roles()`. Simplificar `get_all_paginated()`: filtrar por `Usuario.rol_codigo` directamente sin JOIN a `UsuarioRol`.
- [x] 5.3 Actualizar `usuario/service.py`: `listar_usuarios()` lee `usuario.rol_codigo` directamente. `crear_usuario()` asigna `data.rol_codigo` al usuario. Eliminar `asignar_rol()` y `remover_rol()`.
- [x] 5.4 Actualizar `usuario/router.py`: eliminar endpoints `POST /admin/usuarios/{id}/roles` y `DELETE /admin/usuarios/{id}/roles/{rol_codigo}`. El rol se asigna al crear usuario.

## 6. Backend — Otros routers (require_role calls)

- [x] 6.1 Actualizar `producto/router.py`: cambiar `require_role(["ADMIN"])` → `require_role("ADMIN")`, `require_role(["ADMIN", "STOCK"])` → `require_any_role("ADMIN", "STOCK")`
- [x] 6.2 Actualizar `ingrediente/router.py`: cambiar `require_role(["ADMIN"])` → `require_role("ADMIN")`
- [x] 6.3 Actualizar `categoria/router.py`: cambiar `require_role(["ADMIN"])` → `require_role("ADMIN")`
- [x] 6.4 `estadisticas/router.py`: ya usa `require_admin`, no necesita cambios (se actualiza automáticamente con el cambio en dependencies.py)

## 7. Backend — Seed y scripts

- [x] 7.1 Actualizar `db/seed.py`: asignar `usuario.rol_codigo = "ADMIN"` en vez de crear `UsuarioRol`
- [x] 7.2 Actualizar `scripts/check_user_roles.py`: consultar `Usuario.rol_codigo` en vez de `UsuarioRol`
- [x] 7.3 Evaluar `scripts/add_missing_roles.py`: ya no es necesario (era para la migración anterior)

## 8. Frontend-admin — Auth y tipos

- [x] 8.1 Actualizar `frontend-admin/src/types/index.ts`: `AdminUser.roles: string[]` → `AdminUser.rol_codigo: string | null`
- [x] 8.2 Actualizar `frontend-admin/src/features/auth/context/AuthContext.tsx`: simplificar `RolInfo` y `UsuarioAuth` — `roles: RolInfo[]` → `rol: { codigo: string; descripcion: string } | null`. Simplificar `hasRole()` a `usuario?.rol?.codigo === rol`.
- [x] 8.3 Actualizar `frontend-admin/src/components/ProtectedRoute.tsx`: prop `roles` simplificada. Verificación directa `usuario?.rol?.codigo` contra `roles.some()`.
- [x] 8.4 Actualizar `frontend-admin/src/router/AdminIndexRedirect.tsx`: leer `usuario?.rol?.codigo` directamente.
- [x] 8.5 Actualizar `frontend-admin/src/layouts/AdminLayout.tsx`: filtrar nav items con `usuario?.rol?.codigo` en vez de `some/map`.

## 9. Frontend-admin — Páginas

- [x] 9.1 Actualizar `frontend-admin/src/features/pedidos/pages/PedidosKanbanPage.tsx`: leer `usuario.rol?.codigo` en vez de `roles?.map(...)`.
- [x] 9.2 Actualizar `frontend-admin/src/features/usuarios/pages/UsuariosPage.tsx`: cambiar selector de roles a selector único. Renderizar `u.rol_codigo` en vez de `u.roles.map(...)`. Eliminar modal de toggle de roles. Agregar campo `rol_codigo` en el modal de crear usuario.

## 10. Frontend-store — Auth

- [x] 10.1 Actualizar `frontend-store/src/types/index.ts`: `UsuarioAuth.roles` → `UsuarioAuth.rol`
- [x] 10.2 Actualizar `frontend-store/src/features/auth/store/authStore.ts`: `hasRole()` usa `usuario?.rol?.codigo === rol`
- [x] 10.3 Actualizar `frontend-store/src/components/Navbar.tsx`: verificar `usuario.rol?.codigo` directamente

## 11. Backend — Limpieza

- [x] 11.1 Eliminar archivo `usuario/usuario_rol.py` (se vació con comentario)
- [x] 11.2 Ejecutar script de migración y verificar que los datos se migraron correctamente
- [x] 11.3 Iniciar servidor backend y probar: register, login, listar productos, crear pedido, ejecutar acción, listar usuarios
- [x] 11.4 Iniciar frontend-admin y verificar: login, navegación por roles, kanban, gestión de usuarios
- [x] 11.5 Iniciar frontend-store y verificar: login, navbar, órdenes como cliente
