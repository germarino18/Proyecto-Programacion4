## ADDED Requirements

### Requirement: Relaciones anidadas en respuesta de productos

El sistema SHALL incluir los datos de categoría e ingrediente anidados en las respuestas de productos.

#### Scenario: ProductoCategoriaRead incluye datos de la categoría
- **WHEN** se obtiene un producto (GET `/api/v1/productos/{id}`)
- **THEN** cada elemento en `categorias` incluye un objeto `categoria` con `id`, `nombre`, `parent_id`, `descripcion`
- **AND** el campo `categoria` se obtiene via `from_attributes=True` desde la relación SQLModel

#### Scenario: ProductoIngredienteRead incluye datos del ingrediente
- **WHEN** se obtiene un producto
- **THEN** cada elemento en `ingredientes` incluye un objeto `ingrediente` con `id`, `nombre`, `es_alergeno`
- **AND** cada elemento incluye un objeto `unidad_medida` con `id`, `nombre`, `simbolo`

#### Scenario: Eager loading en listados
- **WHEN** se lista productos (GET `/api/v1/productos`)
- **THEN** las relaciones `productos_categoria`, `productos_ingredientes`, `unidad_venta`, y sus sub-relaciones se cargan con `selectinload`
- **AND** no hay N+1 queries por producto en el listado
