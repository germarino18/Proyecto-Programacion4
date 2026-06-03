## Context

El sistema ROST_V2 tiene una arquitectura basada en features con backend FastAPI y frontend React. Actualmente existen los roles ADMIN, STOCK, PEDIDOS y CLIENT, con una máquina de estados de pedidos simplificada a 3 estados (PENDIENTE → EN_PREP → ENTREGADO). El Kanban de pedidos implementado en el change `kanban-pedidos` muestra las 3 columnas pero sin diferenciación por rol.

Se necesita agregar los roles operativos CAJERO y COCINERO, redefinir la máquina de estados para que valide permisos por acción, y agregar un dashboard de estadísticas para el ADMIN.

## Goals / Non-Goals

**Goals:**
- Agregar roles CAJERO y COCINERO al seed y al catálogo
- Agregar estado LISTO como paso intermedio entre EN_PREP y ENTREGADO
- Máquina de estados basada en acciones (no estados destino directos) con validación de roles
- ADMIN puede ejecutar cualquier acción sin restricción
- COCINERO solo puede: CONFIRMADO → PREPARAR → EN_PREP → LISTO
- CAJERO puede: PENDIENTE → CONFIRMAR, LISTO → ENTREGAR, y CANCELAR
- Kanban único que se adapta: muestra botones según los roles del usuario
- Columna "Listos" con botón "Entregar" que mueve el pedido al historial debajo
- Dashboard de estadísticas accesible solo por ADMIN
- Endpoint para que ADMIN cree usuarios con roles específicos

**Non-Goals:**
- No se modifican los modelos de datos existentes (Pedido, DetallePedido, HistorialEstadoPedido)
- No se agregan websockets ni real-time (sigue polling de 15s)
- No se implementa drag & drop en el Kanban
- No se modifican los roles existentes (ADMIN, STOCK, PEDIDOS, CLIENT)
- No se agregan gráficos interactivos al dashboard (solo datos tabulares y resúmenes)

## Decisions

### 1. Máquina de estados: acciones en lugar de transiciones directas

| Alternativa | Veredicto |
|-------------|-----------|
| **✅ Acciones con roles** | El frontend envía `{"accion": "CONFIRMAR"}` y el backend resuelve estado destino + valida roles |
| ❌ Transiciones libres (como hoy) | El frontend enviaba `{"nuevo_estado": "EN_PREP"}` y cualquiera podía saltar a cualquier estado |

**Razón**: Centraliza la lógica de permisos en el backend. El frontend nunca dice "pasar a EN_PREP" sino "ejecutar PREPARAR". Si en el futuro se agregan más roles o restricciones, solo se toca un diccionario.

**Estructura:**
```python
ACCIONES = {
    "CONFIRMAR": { "origen": "PENDIENTE",  "destino": "CONFIRMADO", "roles": ["ADMIN","PEDIDOS","CAJERO"] },
    "PREPARAR":  { "origen": "CONFIRMADO", "destino": "EN_PREP",    "roles": ["ADMIN","COCINERO"] },
    "LISTO":     { "origen": "EN_PREP",    "destino": "LISTO",      "roles": ["ADMIN","COCINERO"] },
    "ENTREGAR":  { "origen": "LISTO",      "destino": "ENTREGADO",  "roles": ["ADMIN","PEDIDOS","CAJERO"] },
    "CANCELAR":  { "origen": "PENDIENTE|CONFIRMADO", "destino": "CANCELADO", "roles": ["ADMIN","PEDIDOS","CAJERO"] },
}
```

### 2. Endpoint único de acción

Se reemplaza `PATCH /pedidos/{id}/estado` por `PATCH /pedidos/{id}/accion` con body `{"accion": "PREPARAR"}`. El servicio recibe la acción, busca en ACCIONES, verifica que el estado actual coincida con `origen`, verifica los roles del usuario, y ejecuta la transición.

ADMIN se valida con un `if "ADMIN" in roles` que salta cualquier restricción.

### 3. Kanban adaptativo por rol (una sola página)

| Alternativa | Veredicto |
|-------------|-----------|
| **✅ Una página Kanban que se adapta** | `PedidosKanbanPage.tsx` consulta `hasRole()` y muestra botones según el rol |
| ❌ Vista separada para COCINERO | Duplica lógica, layout y fetch. Más mantenimiento. |

**Razón**: El COCINERO y el CAJERO necesitan ver el mismo tablero completo para entender el flujo. Solo cambian los botones disponibles.

**Lógica de botones:**
| Columna | Estado | Botón | Visible para |
|---------|--------|-------|------------|
| Pendientes | PENDIENTE | Confirmar | ADMIN, PEDIDOS, CAJERO |
| Pendientes | PENDIENTE | Cancelar | ADMIN, PEDIDOS, CAJERO |
| Pendientes | CONFIRMADO | Preparar | ADMIN, COCINERO |
| En preparación | EN_PREP | Listo | ADMIN, COCINERO |
| Listos | LISTO | Entregar | ADMIN, PEDIDOS, CAJERO |

Los pedidos en LISTO con botón "Entregar". Al clickear "Entregar", el pedido se mueve a ENTREGADO y desaparece de las 3 columnas, apareciendo en el historial debajo.

### 4. Dashboard de estadísticas

**Endpoint único:** `GET /api/v1/admin/estadisticas` que devuelve un objeto con:
```json
{
  "pedidos_hoy": 45,
  "ingresos_hoy": 125000.00,
  "pedidos_semana": 280,
  "ingresos_semana": 780000.00,
  "pedidos_por_estado": { "PENDIENTE": 5, "CONFIRMADO": 3, "EN_PREP": 2, "LISTO": 8, "ENTREGADO": 27 },
  "productos_mas_vendidos": [ { "nombre": "Expresso", "cantidad": 120 }, ... ],
  "stock_bajo": [ { "nombre": "Café en granos", "stock": 3 }, ... ],
  "pedidos_ultimos_7_dias": [ { "fecha": "2026-05-28", "total": 8 }, ... ]
}
```

Se implementa como una nueva feature `estadisticas/` con service que hace consultas agregadas (COUNT, SUM, GROUP BY) sobre las tablas existentes.

### 5. Creación de usuarios desde admin

Nuevo endpoint: `POST /api/v1/admin/usuarios`
```json
Body: { "email": "...", "nombre": "...", "password": "...", "roles": ["CAJERO", "COCINERO"] }
```

El servicio:
1. Verifica email único
2. Hashea password
3. Crea usuario
4. Asigna los roles especificados (NO asigna CLIENT automáticamente como en registro público)
5. Retorna usuario con roles

### 6. Sidebar adaptable

Los nav items del `AdminLayout.tsx` se filtran según `usuario.roles`:
- **Dashboard**: solo ADMIN
- **Productos**: ADMIN, STOCK
- **Categorías**: solo ADMIN
- **Ingredientes**: solo ADMIN
- **Pedidos**: ADMIN, PEDIDOS, CAJERO, COCINERO
- **Usuarios**: solo ADMIN

## Risks / Trade-offs

- **Pedidos existentes con estados CONFIRMADO o EN_CAMINO**: Se mapean en el seed de transiciones legacy. Riesgo bajo.
- **COCINERO ve botones que no puede usar**: No se muestran botones que no corresponden a su rol, así que no hay riesgo de confusión.
- **ADMIN ve todo**: Si ADMIN hace click en "Preparar" salta directo de CONFIRMADO a EN_PREP sin pasar por cocina física — es intencional, ADMIN tiene ese poder.
- **El historial puede crecer mucho**: Se puede agregar paginación si es necesario, pero para el volumen de un restaurante no debería ser problema.
