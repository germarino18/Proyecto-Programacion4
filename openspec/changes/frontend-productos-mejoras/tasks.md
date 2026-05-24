## 1. Backend — Schemas con relaciones anidadas

- [x] 1.1 Agregar `categoria: Optional[CategoriaRead]` a `ProductoCategoriaRead`
- [x] 1.2 Agregar `ingrediente: Optional[IngredienteRead]` y `unidad_medida: Optional[UnidadMedidaRead]` a `ProductoIngredienteRead`
- [x] 1.3 Agregar imports necesarios en `producto_categoria.py`

## 2. Backend — Eager loading en service

- [x] 2.1 Agregar `selectinload` para `productos_categoria`, `productos_ingredientes`, `unidad_venta` en `get_all()`
- [x] 2.2 Agregar `selectinload` anidado para `ProductoCategoria.categoria`, `ProductoIngrediente.ingrediente`, `ProductoIngrediente.unidad_medida`

## 3. Frontend — Types

- [x] 3.1 Agregar `imagenes_url?: string[]` a `ProductoCreate`
- [x] 3.2 Agregar `categoria?: Categoria` a `ProductoCategoria`

## 4. Frontend — Vista detalle de producto

- [x] 4.1 Mostrar `categoria.nombre` en lugar de "Categoría #ID"
- [x] 4.2 Mostrar primera imagen de `imagenes_url` si existe (con manejo de error si la URL falla)

## 5. Frontend — Formulario de producto (imagen)

- [x] 5.1 Agregar campo de texto para URL de imagen
- [x] 5.2 Mostrar preview de la imagen si se ingresa una URL válida

## 6. Frontend — Formulario de producto (ingredientes)

- [x] 6.1 Fetch de ingredientes y unidades de medida en el formulario
- [x] 6.2 Agregar grid de ingredientes seleccionables (checkbox + inputs de cantidad y unidad)
- [x] 6.3 Mostrar badge de alérgeno en cada ingrediente que corresponda
- [x] 6.4 Incluir flag removible como checkbox en cada ingrediente
