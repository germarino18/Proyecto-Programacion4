## Context

Mejoras en la UI de productos del panel admin. El backend ya soporta las relaciones entre Producto ↔ Categoria e Producto ↔ Ingrediente a nivel de modelo SQLModel, pero los schemas Pydantic de lectura no exponen los datos anidados. El frontend tiene el formulario de producto dentro de un Modal en la página de listado, y la vista detalle es una página aparte.

## Goals / Non-Goals

**Goals:**
- Que la vista detalle muestre el nombre de cada categoría del producto
- Que la vista detalle muestre la imagen del producto si tiene
- Que el formulario permita ingresar URL de imagen opcional
- Que el formulario permita seleccionar ingredientes con cantidad, unidad de medida y flag removible
- Evitar N+1 queries en listado de productos

**Non-Goals:**
- Subida de archivos de imagen (solo URL por ahora)
- Autenticación
- Cambios en el modelo de datos o base de datos

## Decisions

| Decisión | Opción Elegida | Alternativas | Razón |
|----------|---------------|--------------|-------|
| Relaciones anidadas en schema | `from_attributes=True` + `selectinload` | Lazy loading, joins | Lazy loading causa N+1. `selectinload` es eficiente para listas. |
| Input de imagen | Input de texto para URL | File upload | Sin backend de archivos todavía. La URL se guarda en `imagenes_url` (array). |
| Selector de ingredientes | Checkbox grid + inputs inline | Modal separado | Consistente con el diseño actual de categorías. Más rápido de implementar. |

## Estructura de Archivos Modificados

```
Backend/app/schemas/
└── producto_categoria.py          ← + nested read schemas

Backend/app/services/
└── producto_service.py            ← + eager loading

Frontend-admin/src/
├── types/index.ts                 ← + imagenes_url, categoria
├── pages/ProductoDetallePage.tsx  ← + category names, image
└── pages/ProductosPage.tsx        ← + image input, ingredients
```

## Componentes

### Backend: `schemas/producto_categoria.py`

**Antes:**
```python
class ProductoCategoriaRead(BaseModel):
    producto_id: int
    categoria_id: int
    es_principal: Optional[bool] = None
    created_at: Optional[datetime] = None

class ProductoIngredienteRead(BaseModel):
    producto_id: int
    ingrediente_id: int
    cantidad: Optional[float] = None
    unidad_medida_id: int
    es_removible: Optional[bool] = None
    created_at: Optional[datetime] = None
```

**Después:**
```python
class ProductoCategoriaRead(BaseModel):
    producto_id: int
    categoria_id: int
    es_principal: Optional[bool] = None
    created_at: Optional[datetime] = None
    categoria: Optional[CategoriaRead] = None       # NUEVO

class ProductoIngredienteRead(BaseModel):
    producto_id: int
    ingrediente_id: int
    cantidad: Optional[float] = None
    unidad_medida_id: int
    es_removible: Optional[bool] = None
    created_at: Optional[datetime] = None
    ingrediente: Optional[IngredienteRead] = None    # NUEVO
    unidad_medida: Optional[UnidadMedidaRead] = None  # NUEVO
```

### Backend: `services/producto_service.py`

En `get_all()`, agregar `options(selectinload(*))` para las relaciones:
- `Producto.productos_categoria`, `Producto.productos_ingredientes`, `Producto.unidad_venta`
- Y anidado: `ProductoCategoria.categoria`, `ProductoIngrediente.ingrediente`, `ProductoIngrediente.unidad_medida`

### Frontend: Vista Detalle

- Mostrar `categoria.nombre` en lugar de `"Categoría #{id}"`
- Si `imagenes_url` tiene elementos, mostrar la primera imagen como `<img>` con estilos responsivos

### Frontend: Formulario

- **Imagen**: Input de texto para URL, con previsualización si se ingresa una URL
- **Ingredientes**: 
  - Fetch de ingredientes y unidades de medida
  - Grid de ingredientes seleccionables (checkbox + inputs de cantidad, unidad, removible)
  - Inputs de cantidad con string state (mismo pattern que precio/stock)

## API Design

No hay nuevos endpoints. Solo cambia la respuesta de los existentes:

```json
// GET /api/v1/productos/:id  (respuesta actual + nuevo)
{
  "id": 1,
  "nombre": "Café latte",
  "imagenes_url": ["https://ejemplo.com/cafe.jpg"],
  "categorias": [
    {
      "categoria_id": 1,
      "es_principal": true,
      "categoria": {          // ← NUEVO
        "id": 1,
        "nombre": "Bebidas Calientes"
      }
    }
  ],
  "ingredientes": [
    {
      "ingrediente_id": 1,
      "cantidad": 200,
      "unidad_medida_id": 3,
      "ingrediente": {        // ← NUEVO (explícito)
        "id": 1,
        "nombre": "Leche"
      },
      "unidad_medida": {      // ← NUEVO (explícito)
        "id": 3,
        "nombre": "mililitro",
        "simbolo": "mL"
      }
    }
  ]
}
```

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| `selectinload` puede generar muchas queries si hay muchos productos | Para catálogos pequeños (<1000 prod) es aceptable. Para escalar usar paginación. |
| El formulario de ingredientes agrega complejidad al Modal | Se mantiene el mismo patrón de checkbox grid que categorías. |
| URL de imagen rota | El frontend mostrará la imagen con `onError` para ocultarla si falla la carga. |
