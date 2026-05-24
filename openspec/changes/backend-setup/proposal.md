## Why

Implementar el backend completo para el sistema de catálogo de productos del primer parcial. El backend debe soportar persistencia en PostgreSQL con modelos relacionales complejos (1:N, N:N), Unit of Work pattern, y una API RESTful completa con FastAPI.

## What Changes

- Crear proyecto FastAPI con estructura modular (`models/`, `schemas/`, `services/`, `routers/`)
- Configurar conexión a PostgreSQL usando SQLModel + `create_engine` con session factory
- Implementar modelo de datos completo según el UML del parcial:
  - `UnidadMedida` (catálogo con seed obligatorio)
  - `Categoria` (auto-referencia con parent_id, soft-delete)
  - `Producto` (con FK a UnidadMedida, soft-delete)
  - `Ingrediente` (global, con flag es_alergeno)
  - `ProductoCategoria` (N:N entre Producto y Categoria)
  - `ProductoIngrediente` (N:N entre Producto e Ingrediente, con cantidad y unidad)
- Implementar pattern Unit of Work (UoW) para manejo de transacciones
- Schemas Pydantic de entrada/salida (Create, Update, Read) para cada entidad
- Services CRUD con operaciones completas
- Routers REST con `APIRouter`, usando `Annotated` y `Query` para filtros
- Códigos HTTP correctos (201 POST, 204 DELETE, 404 not found)
- Seed obligatorio de `UnidadMedida` y datos de prueba en `app/db/seed.py`
- Middleware CORS habilitado para `http://localhost:5173`
- Archivos de entrega: `requirements.txt`

## Capabilities

### New Capabilities
- `catalog-api`: API RESTful para gestión de catálogo de productos (categorías, productos, ingredientes, unidades de medida)
- `product-catalog-models`: Modelos de dominio con SQLModel para el catálogo de productos
- `uow-pattern`: Unit of Work pattern para manejo de transacciones en base de datos

### Modified Capabilities
- *(ninguna — primer cambio en el proyecto)*

## Impact

- **Backend**: Nuevo proyecto FastAPI en `Backend/`
- **Base de datos**: Nueva base PostgreSQL `parcial_db` con 6 tablas
- **Dependencias**: `fastapi`, `sqlmodel`, `psycopg2-binary`, `uvicorn`, `python-dotenv`
- No afecta frontends existentes (aún no creados)
