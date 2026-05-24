## Context

Backend actual tiene catálogo de productos (Categoría, Producto, Ingrediente, UnidadMedida) con UnitOfWork, servicios CRUD, soft-delete, y routers REST. El segundo parcial agrega autenticación, roles, pedidos y direcciones sobre la misma arquitectura.

## Goals / Non-Goals

**Goals:**
- Autenticación stateless con JWT en cookie HttpOnly (30min de expiración)
- RBAC con 4 roles (ADMIN, STOCK, PEDIDOS, CLIENT) protegido por dependencias inyectables de FastAPI
- CRUD de pedidos con máquina de estados finitos (6 estados, transiciones validadas en servicio)
- Historial append-only de cambios de estado (solo INSERTs)
- Snapshot pattern: precio y nombre del producto se copian inmutables al DetallePedido
- Direcciones de entrega por usuario con marcado de principal
- Seed idempotente con datos obligatorios (roles, formas de pago, estados, admin default)
- Endpoints de admin para gestión de usuarios

**Non-Goals:**
- Pasarela de pago real (solo registro del método de pago)
- Refresh token rotation (por ahora un solo token por sesión)
- Notificaciones en tiempo real (WebSockets)
- Dashboard de métricas o reportes

## Decisions

1. **JWT en cookie HttpOnly vs localStorage**: Cookie HttpOnly. No accesible desde JS, mitiga XSS. El frontend envía withCredentials: true en Axios.

2. **Rol con PK semántica (VARCHAR codigo) vs BIGINT surrogate**: El UML especifica PK semántica (codigo como 'ADMIN', 'CLIENT'). Esto hace que las dependencias (UsuarioRol, endpoints) sean legibles sin joins. Seedable con INSERT idempotente.

3. **EstadoActual como campo desnormalizado en Pedido**: Se almacena estado_actual directamente en la tabla Pedido para consultas eficientes. El HistorialEstadoPedido es el source of truth para auditoría. Ambos se actualizan en la misma transacción.

4. **Transición de estados validada en Service layer**: La máquina de estados vive en el servicio (nunca en el router). Esto permite reutilizar la validación desde diferentes entry points (API, tests, futuro CLI).

5. **Snapshot pattern en DetallePedido**: precio_snapshot y nombre_snapshot se copian del producto al crear el DetallePedido. Inmutables. El producto puede cambiar su precio después sin afectar pedidos históricos.

6. **UnitOfWork existente como gestor transaccional**: Se reutiliza el UoW existente para todas las operaciones que requieren atomicidad (creación de pedido con detalles + historial + actualización de stock).

7. **bcrypt con cost factor 12**: Suficiente para hash de contraseñas. PyJWT para creación/verificación de tokens.

## Risks / Trade-offs

- [Riesgo] Cookie JWT expirada en medio del flujo de pedido → El frontend debe manejar 401 con redirección suave al login sin perder el carrito (Zustand persist en localStorage)
- [Riesgo] Seed no idempotente duplica datos → Cada INSERT verifica existencia previa con SELECT
- [Riesgo] Estado inconsistente entre estado_actual e HistorialEstadoPedido → Se actualizan en la misma transacción UoW. Si algo falla, rollback de ambos
- [Trade-off] PK semántica en Rol es menos eficiente que BIGINT para joins grandes, pero para 4-5 roles es irrelevante y mejora legibilidad
