## Why

El frontend de productos tiene tres carencias que afectan la experiencia de uso:

1. **Vista detalle**: las categorías del producto se muestran como "Categoría #ID" en lugar del nombre real de la categoría. Los ingredientes dependen de lazy loading que puede fallar si la sesión de BD se cierra.
2. **Formulario de producto**: no permite cargar una imagen opcional ni seleccionar los ingredientes que lleva el producto.
3. **Vista detalle**: si el producto tiene imagen, no se muestra visualmente.

## What Changes

### Backend
- **`app/schemas/producto_categoria.py`**: Agregar `CategoriaRead` anidado a `ProductoCategoriaRead` y `IngredienteRead`/`UnidadMedidaRead` anidados a `ProductoIngredienteRead`
- **`app/services/producto_service.py`**: Agregar eager loading (`selectinload`) en `get_all()` para evitar N+1 queries en las relaciones

### Frontend — Types
- **`src/types/index.ts`**: Agregar `imagenes_url` opcional a `ProductoCreate`, agregar `categoria` opcional a `ProductoCategoria`

### Frontend — Vista detalle
- **`src/pages/ProductoDetallePage.tsx`**: Mostrar `categoria.nombre` en lugar de "Categoría #ID"; mostrar imagen del producto si existe

### Frontend — Formulario en lista
- **`src/pages/ProductosPage.tsx`**: Agregar campo para URL de imagen opcional; agregar selector de ingredientes (lista de ingredientes existentes con cantidad, unidad de medida y flag removible)

## Capabilities

### Modified Capabilities
- `catalog-api`: Los schemas de respuesta ahora incluyen datos anidados de categorías e ingredientes
- `product-catalog-models`: Sin cambios en los modelos

## Impact

- **Backend**: Solo schemas de lectura — no hay cambios en la lógica de negocio ni en la BD
- **Frontend**: Se modifican 3 archivos — no hay cambios estructurales mayores
- No requiere migraciones ni cambios en la base de datos
