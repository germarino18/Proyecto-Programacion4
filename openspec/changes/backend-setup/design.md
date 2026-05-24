## Context

Backend para sistema de catálogo de productos. Se implementa desde cero con FastAPI + SQLModel + PostgreSQL. El modelo de datos incluye relaciones complejas (auto-referencia en Categoria, N:N con atributos en tablas link) y soft-delete. Se requiere Unit of Work para manejo transaccional.

## Goals / Non-Goals

**Goals:**
- Backend RESTful completo con FastAPI
- Modelos SQLModel con todas las relaciones del UML (Categoria, Producto, Ingrediente, UnidadMedida, ProductoCategoria, ProductoIngrediente)
- Unit of Work pattern para transacciones atómicas
- Schemas Pydantic segregados (Create/Update/Read con `from_attributes=True`)
- CRUD completo con códigos HTTP correctos (201, 204, 404)
- Seed obligatorio de UnidadMedida + datos de prueba
- Filtros con `Annotated` y `Query` en endpoints GET

**Non-Goals:**
- Autenticación/autorización (fuera del alcance del parcial)
- Frontend (se implementa por separado)
- Tests automatizados (no requeridos en la rúbrica)
- Migraciones líquidas (SQLModel crea tablas con `create_all`)

## Decisions

| Decisión | Opción Elegida | Alternativas | Razón |
|----------|---------------|--------------|-------|
| ORM | SQLModel | SQLAlchemy puro, Tortoise | SQLModel combina Pydantic + SQLAlchemy. Menos boilerplate. Requisito explícito de la rúbrica. |
| Conexión DB | `create_engine` + `sessionmaker` con `yield` | Dependencia directa | Patrón estándar FastAPI. Cleanup automático de sesiones. |
| Unit of Work | Clase `UnitOfWork` con context manager | Repositorio puro, Transaction per request | Encapsula transacciones. Permite operaciones multi-entidad atómicas. Rollback automático en errores. |
| Soft Delete | Campo `deleted_at` TIMESTAMPTZ nullable | Borrado físico | Trazabilidad. Consultas filtran `WHERE deleted_at IS NULL`. |
| IDs | BIGSERIAL (autoincrement) | UUID | Simplicidad. Requisito explícito del UML. |
| Fechas | TIMESTAMPTZ con UTC | TIMESTAMP sin TZ | Consistencia multi-zona horaria. |
| Fetching Frontend | fetch nativo | axios | Sin dependencia extra. El frontend puede migrar después si se desea. |
| Estructura | modular (models/schemas/services/routers) | Monolítico en main.py | Separación de concerns. Escalable. Cada capa tiene responsabilidad única. |

## Estructura de Archivos

```
Backend/
├── .env
├── .venv/
├── requirements.txt
└── app/
    ├── __init__.py
    ├── main.py                  # Punto de entrada + CORS + routers
    ├── database.py              # Engine y get_session
    ├── models/
    │   ├── __init__.py
    │   ├── unidad_medida.py
    │   ├── categoria.py
    │   ├── producto.py
    │   ├── ingrediente.py
    │   ├── producto_categoria.py
    │   └── producto_ingrediente.py
    ├── schemas/
    │   ├── __init__.py
    │   ├── unidad_medida.py
    │   ├── categoria.py
    │   ├── producto.py
    │   ├── ingrediente.py
    │   ├── producto_categoria.py
    │   └── producto_ingrediente.py
    ├── services/
    │   ├── __init__.py
    │   ├── base.py              # BaseService genérico
    │   ├── categoria_service.py
    │   ├── producto_service.py
    │   ├── ingrediente_service.py
    │   └── unidad_medida_service.py
    ├── routers/
    │   ├── __init__.py
    │   ├── categorias.py
    │   ├── productos.py
    │   ├── ingredientes.py
    │   └── unidades_medida.py
    ├── db/
    │   ├── __init__.py
    │   └── seed.py
    └── core/
        ├── __init__.py
        └── uow.py               # Unit of Work
```

## Componentes

### `app/database.py`
- `create_engine` con `DATABASE_URL` desde `.env`
- `get_session` como generator con `yield` para FastAPI dependency injection
- `init_db()` que llama a `SQLModel.metadata.create_all()`

### `app/core/uow.py`
- Clase `UnitOfWork` que recibe `Session` de SQLModel
- Método `__enter__`/`__exit__` para context manager
- Métodos: `commit()`, `rollback()`, `add()`, `delete()`
- Atributo `session` expuesto para queries directas
- Propiedades `categorias`, `productos`, `ingredientes`, `unidades_medida` que retornan repositorios específicos

### `app/services/base.py`
- `BaseService[T]` genérico con CRUD base
- Métodos: `get_all()`, `get_by_id()`, `create()`, `update()`, `delete()`
- Servicios específicos heredan de BaseService y agregan lógica de negocio

### Models (SQLModel)

Cada modelo en `app/models/`:
- Usa `table=True` para tablas
- `Relationship` con `back_populates` en todas las direcciones
- `sa_relationship_kwargs` para lazy loading
- Soft-delete con `deleted_at: Optional[datetime] = None`

### Routers (FastAPI APIRouter)
- 4 routers: categorías, productos, ingredientes, unidades de medida
- Endpoints: `GET /`, `GET /{id}`, `POST /`, `PATCH /{id}`, `DELETE /{id}`
- Filtros con `Annotated` + `Query` en GET
- `response_model` con schemas Read
- `HTTPException(404)` para recursos no encontrados

## Data Model

```
UnidadMedida (Catalog)
├── id: BIGSERIAL PK
├── nombre: VARCHAR(50) {UQ, NN}
├── simbolo: VARCHAR(10) {UQ, NN}
├── tipo: VARCHAR(20) {NN}  (masa, volumen, unidad, area)
└── created_at: TIMESTAMPTZ {NN}

Categoria (Table)
├── id: BIGSERIAL PK
├── parent_id: BIGINT FK → Categoria.id (NULL)
├── nombre: VARCHAR(100) {UQ, NN}
├── descripcion: TEXT
├── imagen_url: TEXT
├── created_at: TIMESTAMPTZ {NN}
├── updated_at: TIMESTAMPTZ {NN}
└── deleted_at: TIMESTAMPTZ

Producto (Table)
├── id: BIGSERIAL PK
├── unidad_venta_id: BIGINT FK → UnidadMedida.id (NULL)
├── nombre: VARCHAR(150) {NN}
├── descripcion: TEXT
├── precio_base: DECIMAL(10,2) {NN, CHECK >= 0}
├── imagenes_url: TEXT[]
├── stock_cantidad: INTEGER {NN, CHECK >= 0, DEFAULT 0}
├── disponible: BOOLEAN {NN, DEFAULT true}
├── created_at: TIMESTAMPTZ {NN}
├── updated_at: TIMESTAMPTZ {NN}
└── deleted_at: TIMESTAMPTZ

Ingrediente (Table)
├── id: BIGSERIAL PK
├── nombre: VARCHAR(100) {UQ, NN}
├── descripcion: TEXT
├── es_alergeno: BOOLEAN {NN, DEFAULT false}
├── created_at: TIMESTAMPTZ {NN}
└── updated_at: TIMESTAMPTZ {NN}

ProductoCategoria (Link)
├── producto_id: BIGINT PK, FK → Producto.id
├── categoria_id: BIGINT PK, FK → Categoria.id
├── es_principal: BOOLEAN {NN, DEFAULT false}
└── created_at: TIMESTAMPTZ {NN}

ProductoIngrediente (Link)
├── producto_id: BIGINT PK, FK → Producto.id
├── ingrediente_id: BIGINT PK, FK → Ingrediente.id
├── cantidad: DECIMAL(10,3) {NN, CHECK > 0}
├── unidad_medida_id: BIGINT FK → UnidadMedida.id {NN}
├── es_removible: BOOLEAN {NN, DEFAULT false}
└── created_at: TIMESTAMPTZ {NN}
```

## API Endpoints

### Categorías
- `GET /api/v1/categorias` → listar (filtro: `q`, `parent_id`, `page`, `size`)
- `GET /api/v1/categorias/{id}` → detalle (con subcategorías)
- `POST /api/v1/categorias` → crear (201)
- `PATCH /api/v1/categorias/{id}` → actualizar
- `DELETE /api/v1/categorias/{id}` → soft-delete (204)

### Productos
- `GET /api/v1/productos` → listar (filtro: `q`, `categoria_id`, `disponible`, `page`, `size`)
- `GET /api/v1/productos/{id}` → detalle (con categorías e ingredientes)
- `POST /api/v1/productos` → crear (201)
- `PATCH /api/v1/productos/{id}` → actualizar
- `DELETE /api/v1/productos/{id}` → soft-delete (204)

### Ingredientes
- `GET /api/v1/ingredientes` → listar (filtro: `q`, `es_alergeno`, `page`, `size`)
- `GET /api/v1/ingredientes/{id}` → detalle
- `POST /api/v1/ingredientes` → crear (201)
- `PATCH /api/v1/ingredientes/{id}` → actualizar
- `DELETE /api/v1/ingredientes/{id}` → borrado (204)

### Unidades de Medida
- `GET /api/v1/unidades-medida` → listar (filtro: `tipo`)
- `GET /api/v1/unidades-medida/{id}` → detalle
- `POST /api/v1/unidades-medida` → crear (201) — solo admin
- `PATCH /api/v1/unidades-medida/{id}` → actualizar
- `DELETE /api/v1/unidades-medida/{id}` → borrado (204)

## Seed Data

Seed obligatorio en `app/db/seed.py`:

| tipo | nombre | simbolo |
|------|--------|---------|
| masa | kilogramo | kg |
| masa | gramo | g |
| volumen | litro | L |
| volumen | mililitro | mL |
| unidad | pieza | u |
| unidad | docena | doc |
| area | metro cuadrado | m² |

Además se crean datos de prueba: categorías (Bebidas, Lácteos, Panadería), ingredientes (Harina, Azúcar, Leche, Huevo como alérgeno), y productos de ejemplo.

## Unit of Work Pattern

```python
class UnitOfWork:
    def __init__(self, session: Session):
        self._session = session
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self._session.rollback()
        else:
            self._session.commit()
    
    def commit(self):
        self._session.commit()
    
    def rollback(self):
        self._session.rollback()
    
    @property
    def session(self) -> Session:
        return self._session
```

Uso: los servicios reciben `UnitOfWork` y realizan operaciones multi-entidad dentro del mismo contexto transaccional.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| SQLModel puede tener limitaciones con tablas compuestas PK | Usar `CompositeKey` o manejar manualmente las tablas link con `id` propio |
| Soft-delete requiere filtrar `deleted_at IS NULL` en cada query | Crear helper `active_where()` en BaseService para consistencia |
| `create_all` no soporta migraciones incrementales | Aceptable para el alcance del parcial. En producción usar Alembic. |
| Annotated + Query pueden hacer verbose los endpoints | Extraer a módulo `dependencies.py` los filtros reutilizables |
