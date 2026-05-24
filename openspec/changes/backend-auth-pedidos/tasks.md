## 1. Dependencias y Configuración

- [x] 1.1 Agregar bcrypt y PyJWT a requirements.txt
- [x] 1.2 Crear archivo de configuración JWT (app/core/config.py o .env: SECRET_KEY, JWT_EXPIRATION_MINUTES)
- [x] 1.3 Extender CORS en main.py para soportar localhost:5173 y localhost:5174

## 2. Modelos Nuevos

- [x] 2.1 Crear modelo Rol (app/models/rol.py) con PK semántica VARCHAR(20) codigo + descripcion
- [x] 2.2 Crear modelo Usuario (app/models/usuario.py) con id, email (unique), nombre, password_hash, activo, timestamps, soft-delete
- [x] 2.3 Crear modelo UsuarioRol (app/models/usuario_rol.py) con PK compuesta (usuario_id, rol_codigo)
- [x] 2.4 Crear modelo DireccionEntrega (app/models/direccion_entrega.py) con alias, direccion, ciudad, region, codigo_postal, es_principal, FK a usuario
- [x] 2.5 Crear modelo FormaPago (app/models/forma_pago.py) catálogo con PK BIGINT
- [x] 2.6 Crear modelo EstadoPedido (app/models/estado_pedido.py) catálogo con PK BIGINT
- [x] 2.7 Crear modelo Pedido (app/models/pedido.py) con FK a usuario, direccion_entrega, forma_pago, estado_actual desnormalizado, total, timestamps
- [x] 2.8 Crear modelo DetallePedido (app/models/detalle_pedido.py) con FK a pedido y producto, cantidad, precio_snapshot, nombre_snapshot, personalizacion JSON
- [x] 2.9 Crear modelo HistorialEstadoPedido (app/models/historial_estado_pedido.py) append-only con pedido_id, estado, cambiado_por, fecha
- [x] 2.10 Actualizar app/models/__init__.py con todos los modelos nuevos
- [x] 2.11 Agregar Relationship en Producto hacia DetallePedido

## 3. Seed de Datos Obligatorio

- [x] 3.1 Ampliar seed.py con seed idempotente de: roles (ADMIN, STOCK, PEDIDOS, CLIENT)
- [x] 3.2 Seed de FormaPago (Efectivo, Tarjeta crédito, Transferencia, Mercado Pago)
- [x] 3.3 Seed de EstadoPedido (PENDIENTE, CONFIRMADO, EN_PREP, EN_CAMINO, ENTREGADO, CANCELADO)
- [x] 3.4 Seed de usuario admin por defecto (admin@store.com / admin1234) con rol ADMIN

## 4. Auth System

- [x] 4.1 Crear dependencia get_current_user que verifica JWT cookie y devuelve Usuario
- [x] 4.2 Crear función hash_password y verify_password con bcrypt (cost factor 12)
- [x] 4.3 Crear funciones create_access_token y decode_access_token con PyJWT
- [x] 4.4 Crear router auth (app/routers/auth.py): POST /register, POST /login, GET /me, POST /logout
- [x] 4.5 Crear service de auth con lógica de registro y login
- [x] 4.6 Crear schemas de auth (AuthRegister, AuthLogin, AuthUserRead)
- [x] 4.7 Registrar router auth en main.py

## 5. RBAC / Role-Based Access Control

- [x] 5.1 Crear dependencia require_role(codigos: list[str]) que verifica el rol del usuario autenticado
- [x] 5.2 Crear dependencia require_admin como shorthand para require_role(["ADMIN"])
- [x] 5.3 Proteger endpoints existentes de catálogo según roles: POST/PUT/DELETE solo ADMIN, GET público
- [x] 5.4 Agregar PATCH /productos/{id}/disponibilidad accesible por ADMIN y STOCK

## 6. Pedidos con Máquina de Estados

- [x] 6.1 Crear service de pedidos (app/services/pedido_service.py) con validación de máquina de estados
- [x] 6.2 Crear schemas de pedidos (PedidoCreate, PedidoRead, PedidoUpdateEstado)
- [x] 6.3 Implementar crear_pedido con transacción atómica (UoW): insert Pedido + Detalles + Historial + actualizar stock
- [x] 6.4 Implementar avanzar_estado con validación de transiciones + historial append-only
- [x] 6.5 Implementar cancelar_pedido (solo CLIENT desde PENDIENTE o CONFIRMADO)
- [x] 6.6 Implementar listado de pedidos con filtro por usuario (CLIENT ve propios, ADMIN/PEDIDOS ven todos)
- [x] 6.7 Implementar obtención de pedido individual con historial incluido
- [x] 6.8 Crear router de pedidos (app/routers/pedidos.py) con todos los endpoints
- [x] 6.9 Registrar router de pedidos en main.py

## 7. Direcciones de Entrega

- [x] 7.1 Crear service de direcciones (app/services/direccion_service.py) con CRUD + lógica de principal
- [x] 7.2 Crear schemas de direcciones (DireccionCreate, DireccionRead, DireccionUpdate)
- [x] 7.3 Implementar endpoints CRUD + PATCH /principal en router direcciones
- [x] 7.4 Registrar router de direcciones en main.py

## 8. Admin Endpoints

- [x] 8.1 Crear router admin (app/routers/admin.py) con GET /usuarios (paginado + filtro por rol)
- [x] 8.2 Implementar PATCH /admin/usuarios/{id} para actualizar usuario
- [x] 8.3 Implementar POST /admin/usuarios/{id}/roles y DELETE /admin/usuarios/{id}/roles/{rol_codigo}
- [x] 8.4 Proteger todos los endpoints admin con require_admin
- [x] 8.5 Registrar router admin en main.py

## 9. Verificación

- [x] 9.1 Verificar que el seed no duplica datos al ejecutarse dos veces
- [x] 9.2 Verificar que auth (registro + login + /me) funciona en /docs
- [ ] 9.3 Verificar que CORS funciona con ambos frontends
- [ ] 9.4 Verificar máquina de estados: transiciones válidas e inválidas
