## 1. Backend — Seed: roles y estados

- [x] 1.1 Agregar rol `CAJERO` y `COCINERO` en `_seed_roles()` de `db/seed.py`
- [x] 1.2 Agregar estado `LISTO` en `_seed_estados_pedido()` de `db/seed.py`

## 2. Backend — Máquina de estados basada en acciones

- [x] 2.1 Reemplazar `TRANSICIONES_VALIDAS` por `ACCIONES` en `features/pedido/service.py` con el diccionario de acciones (origen, destino, roles)
- [x] 2.2 Modificar `ejecutar_accion()` para que reciba una acción (`{"accion": "CONFIRMAR"}`) en lugar de un estado destino, y valide estado origen + roles
- [x] 2.3 Agregar lógica: si el usuario tiene rol ADMIN, saltar toda validación de roles
- [x] 2.4 Crear nuevo endpoint `PATCH /api/v1/pedidos/{id}/accion` en `features/pedido/router.py` que use el nuevo sistema de acciones
- [x] 2.5 Mantener compatibilidad con pedidos existentes en estados CONFIRMADO y EN_CAMINO (legacy)

## 3. Backend — Creación de usuarios por ADMIN

- [x] 3.1 Agregar schema `AdminUserCreate` en `features/usuario/schemas.py` con email, nombre, password y roles
- [x] 3.2 Agregar método `crear_usuario()` en `features/usuario/service.py` (verifica email único, hashea password, asigna roles específicos)
- [x] 3.3 Agregar endpoint `POST /api/v1/admin/usuarios` en `features/usuario/router.py` con dependencia `require_admin`

## 4. Backend — Dashboard de estadísticas

- [x] 4.1 Crear `features/estadisticas/` con `__init__.py`
- [x] 4.2 Crear `features/estadisticas/schemas.py` con `DashboardRead`
- [x] 4.3 Crear `features/estadisticas/service.py` con consultas agregadas (COUNT, SUM, GROUP BY, TOP 5)
- [x] 4.4 Crear `features/estadisticas/router.py` con `GET /api/v1/admin/estadisticas` protegido por `require_admin`
- [x] 4.5 Registrar el router en `main.py`

## 5. Frontend Admin — Kanban adaptativo por rol

- [x] 5.1 Refactorizar `PedidosKanbanPage.tsx` para que oculte/muestre botones según `hasRole()`:
  - Confirmar y Cancelar: ADMIN, PEDIDOS, CAJERO
  - Preparar y Listo: ADMIN, COCINERO
  - Entregar: ADMIN, PEDIDOS, CAJERO
- [x] 5.2 Cambiar la columna "Entregados" a "Listos" con botón "Entregar" que ejecuta la acción ENTREGAR
- [x] 5.3 Agregar sección "Historial" debajo de las 3 columnas con pedidos en estado ENTREGADO
- [x] 5.4 Actualizar llamadas API de `avanzarEstado` a `ejecutarAccion` (PATCH /pedidos/{id}/accion)
- [x] 5.5 Auto-refetch de 15s funcionando con `refetchInterval: 15000`

## 6. Frontend Admin — Dashboard de estadísticas

- [x] 6.1 Crear `api/estadisticas.ts` con `getDashboard()` usando TanStack Query
- [x] 6.2 Crear `DashboardPage.tsx` con cards resumen + barras por estado + top productos + stock bajo + últimos 7 días
- [x] 6.3 Agregar ruta `/admin/dashboard` en `AppRouter.tsx` (protegida solo ADMIN) + nav item en sidebar

## 7. Frontend Admin — Creación de usuarios

- [x] 7.1 Agregar botón "+ Nuevo Usuario" en `UsuariosPage.tsx`
- [x] 7.2 Modal de creación inline en `UsuariosPage.tsx` con email, nombre, password y checkboxes de roles
- [x] 7.3 Llamada a `POST /api/v1/admin/usuarios` + refresh de tabla + reset de formulario

## 8. Frontend Admin — Sidebar adaptable

- [x] 8.1 Nav item "Dashboard" en `AdminLayout.tsx` visible solo para ADMIN
- [x] 8.2 Nav item "Pedidos" visible también para COCINERO y CAJERO
- [x] 8.3 Filtro por rol existente con `.some()` → funciona correctamente
