## 1. Setup del Entorno Backend

- [x] 1.1 Crear carpeta `Backend/` con estructura de directorios: `app/`, `app/models/`, `app/schemas/`, `app/services/`, `app/routers/`, `app/db/`, `app/core/`
- [x] 1.2 Crear entorno virtual `.venv` en `Backend/`
- [x] 1.3 Crear `requirements.txt` con fastapi, uvicorn[standard], sqlmodel, psycopg2-binary, python-dotenv
- [x] 1.4 Crear `.env` con DATABASE_URL para PostgreSQL (parcial_db, localhost, postgres user)
- [x] 1.5 Instalar dependencias del requirements.txt

## 2. Capa de Base de Datos

- [x] 2.1 Crear `app/database.py` con create_engine, get_session (yield), e init_db()
- [x] 2.2 Crear `app/core/uow.py` con clase UnitOfWork (context manager, commit, rollback, session expuesta)

## 3. Modelos SQLModel

- [x] 3.1 Crear `app/models/unidad_medida.py` (id, nombre, simbolo, tipo, created_at)
- [x] 3.2 Crear `app/models/categoria.py` (con parent_id auto-referencia, soft-delete)
- [x] 3.3 Crear `app/models/producto.py` (con unidad_venta_id FK, soft-delete)
- [x] 3.4 Crear `app/models/ingrediente.py` (con es_alergeno)
- [x] 3.5 Crear `app/models/producto_categoria.py` (PK compuesta, es_principal)
- [x] 3.6 Crear `app/models/producto_ingrediente.py` (PK compuesta, cantidad, unidad_medida_id, es_removible)
- [x] 3.7 Configurar Relationship con back_populates en todos los modelos
- [x] 3.8 Crear `app/models/__init__.py` con imports de todos los modelos

## 4. Schemas Pydantic

- [x] 4.1 Crear schemas para UnidadMedida (Create, Update, Read)
- [x] 4.2 Crear schemas para Categoria (Create, Update, Read)
- [x] 4.3 Crear schemas para Producto (Create, Update, Read)
- [x] 4.4 Crear schemas para Ingrediente (Create, Update, Read)
- [x] 4.5 Crear schemas para ProductoCategoria y ProductoIngrediente
- [x] 4.6 Crear `app/schemas/__init__.py`

## 5. Services CRUD

- [x] 5.1 Crear `app/services/base.py` con BaseService genérico (get_all, get_by_id, create, update, delete)
- [x] 5.2 Crear `app/services/unidad_medida_service.py`
- [x] 5.3 Crear `app/services/categoria_service.py`
- [x] 5.4 Crear `app/services/producto_service.py`
- [x] 5.5 Crear `app/services/ingrediente_service.py`
- [x] 5.6 Crear `app/services/__init__.py`

## 6. Routers API

- [x] 6.1 Crear `app/routers/unidades_medida.py` (GET /, GET /{id}, POST, PATCH /{id}, DELETE /{id})
- [x] 6.2 Crear `app/routers/categorias.py` (con filtros Annotated/Query)
- [x] 6.3 Crear `app/routers/productos.py` (con filtros, incluye relaciones)
- [x] 6.4 Crear `app/routers/ingredientes.py` (con filtros)
- [x] 6.5 Crear `app/routers/__init__.py`

## 7. Seed y Punto de Entrada

- [x] 7.1 Crear `app/db/seed.py` con seed de UnidadMedida (7 registros obligatorios) + datos de prueba
- [x] 7.2 Crear `app/main.py` con CORS habilitado, inclusión de routers, y evento startup para init_db() + seed
- [x] 7.3 Crear `app/__init__.py`, `app/db/__init__.py`, `app/core/__init__.py`
- [x] 7.4 Verificar que el servidor arranca: `uvicorn app.main:app --reload`

## 8. Verificación

- [x] 8.1 Probar CRUD de Categorías (crear, listar, obtener, actualizar, eliminar)
- [x] 8.2 Probar CRUD de Productos (crear con categorías e ingredientes)
- [x] 8.3 Probar CRUD de Ingredientes
- [x] 8.4 Probar CRUD de Unidades de Medida
- [x] 8.5 Verificar que el seed pobló la base de datos
- [x] 8.6 Verificar códigos HTTP (201, 204, 404)
- [x] 8.7 Verificar filtros con Annotated/Query
