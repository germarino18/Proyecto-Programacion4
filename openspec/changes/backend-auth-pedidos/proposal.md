## Why

El segundo parcial requiere extender el backend con autenticación JWT, roles (RBAC), pedidos con máquina de estados, y direcciones de entrega. Esto permite tener un sistema completo donde clientes puedan registrarse, hacer pedidos, y empleados puedan gestionarlos — todo sobre la base del catálogo del Parcial 1.

## What Changes

- **Auth**: Registro de usuarios, login con JWT en cookie HttpOnly (30min), endpoint /me, logout
- **RBAC**: 4 roles (ADMIN, STOCK, PEDIDOS, CLIENT) con protección de endpoints por dependencias inyectables
- **Usuarios**: Modelo Usuario con soft-delete, relación muchos-a-muchos con roles vía UsuarioRol
- **Direcciones**: CRUD de direcciones de entrega por usuario autenticado, con marcado de dirección principal
- **Pedidos**: Creación atómica con Unit of Work, máquina de estados de 6 estados, historial append-only, snapshot de precio/nombre en DetallePedido
- **Admin**: Endpoints de gestión de usuarios y roles
- **Seed**: Datos obligatorios (roles, formas de pago, estados de pedido, admin por defecto)
- **CORS**: Extendido para soportar dos frontends (localhost:5173 y localhost:5174)
- **Dependencias**: bcrypt, PyJWT

## Capabilities

### New Capabilities
- `user-auth`: Registro, login, logout, JWT en cookie HttpOnly, endpoint /me, refresh de sesión
- `role-based-access`: RBAC con 4 roles, dependencias inyectables para proteger endpoints, verificación por código de rol
- `order-management`: CRUD de pedidos con máquina de estados finitos, creación atómica con UoW, historial append-only, snapshot pattern, transiciones validadas en servicio
- `delivery-addresses`: CRUD de direcciones de entrega por usuario autenticado, dirección principal (una por usuario), soft-delete
- `admin-panel`: Gestión de usuarios (listado paginado, filtro por rol, actualización, soft delete) y asignación de roles

### Modified Capabilities
- `catalog-api`: Nuevos guards de autenticación y roles en endpoints existentes de catálogo
- `uow-pattern`: Se consolida el patrón existente como la forma estándar de manejar transacciones

## Impact

- **Backend/**: Modelos nuevos, nueva carpeta `auth/`, dependencias nuevas (bcrypt, PyJWT)
- **Backend/app/main.py**: Nuevos routers y CORS extendido
- **Backend/app/db/seed.py**: Seed ampliado con datos obligatorios del segundo parcial
- **Backend/app/core/**: Posible extensión del UnitOfWork
- **Backend/requirements.txt**: Nuevas dependencias (bcrypt, PyJWT)
- **Frontend-admin**: Consumirá nuevos endpoints de auth
- **Frontend-store**: Nueva app que consumirá catálogo, auth y pedidos
