## Why

El sistema actual tiene roles limitados (ADMIN, STOCK, PEDIDOS, CLIENT) que no reflejan la operación real de un restaurante. Falta un COCINERO que gestione la preparación de pedidos y un CAJERO que maneje el frente del mostrador. Además, no hay una vista de estadísticas que le dé al ADMIN visibilidad del negocio, ni la posibilidad de crear usuarios directamente desde el panel de control.

## What Changes

- **Nuevos roles**: Agregar `CAJERO` y `COCINERO` al catálogo de roles del sistema
- **Nuevo estado `LISTO`**: Agregar estado intermedio entre EN_PREP y ENTREGADO, con ENTREGADO moviéndose a un historial debajo del Kanban
- **Máquina de estados basada en acciones**: Reemplazar el sistema actual de transiciones libres por acciones con validación de roles (ADMIN puede todo, cada rol solo puede ejecutar sus acciones)
- **Kanban adaptativo por rol**: Una sola página Kanban que muestra botones según los roles del usuario logueado:
  - Columna "Pendientes": `CONFIRMAR` (ADMIN/PEDIDOS/CAJERO) y `PREPARAR` (ADMIN/COCINERO)
  - Columna "En preparación": `LISTO` (ADMIN/COCINERO)
  - Columna "Listos": `ENTREGAR` que mueve al historial debajo (ADMIN/PEDIDOS/CAJERO)
  - Historial de entregados debajo del Kanban
- **Dashboard de estadísticas**: Nueva feature con endpoint y vista de resumen del negocio (pedidos, ingresos, productos más vendidos, stock bajo)
- **Creación de usuarios desde admin**: Nuevo endpoint `POST /admin/usuarios` para que ADMIN cree usuarios con roles específicos (STOCK, PEDIDOS, CAJERO, COCINERO)
- **Sidebar adaptable**: Los nav items del admin se filtran por roles del usuario

## Capabilities

### New Capabilities
- `auth-roles`: Catálogo de roles del sistema (ADMIN, STOCK, PEDIDOS, CAJERO, COCINERO, CLIENT) con asignación y verificación por endpoint
- `pedidos-estados`: Máquina de estados con acciones y validación de roles (PENDIENTE → CONFIRMADO → EN_PREP → LISTO → ENTREGADO + CANCELADO)
- `kanban-pedidos`: Tablero Kanban de 3 columnas con botones adaptativos por rol e historial de entregados
- `estadisticas-admin`: Dashboard con métricas agregadas del negocio (pedidos, ingresos, productos, stock)

### Modified Capabilities
- *(ninguno — no hay specs existentes aún)*

## Impact

- **Backend**:
  - `db/seed.py`: Agregar roles CAJERO y COCINERO, estado LISTO
  - `features/pedido/service.py`: Reescribir máquina de estados con acciones + roles
  - `features/pedido/router.py`: Nuevo endpoint `PATCH /pedidos/{id}/accion`
  - `features/pedido/models.py`: Agregar estado LISTO al catálogo
  - `features/usuario/service.py`: Agregar método `crear_usuario()`
  - `features/usuario/router.py`: Agregar `POST /admin/usuarios`
  - `features/estadisticas/`: Nueva feature (service + schemas + router)
  - `core/dependencies.py`: Posible refinamiento para `require_role` con múltiples roles

- **Frontend Admin**:
  - `features/pedidos/pages/PedidosKanbanPage.tsx`: Refactorizar para ser role-aware, columna Listos con botón Entregar + historial
  - `features/estadisticas/`: Nueva carpeta con DashboardPage + hook
  - `features/usuarios/pages/UsuariosPage.tsx`: Agregar creación de usuarios con selector de roles
  - `router/AppRouter.tsx`: Agregar ruta para dashboard y posible ruta para cocina
  - `layouts/AdminLayout.tsx`: Agregar nav items para Dashboard y filtrado por roles
