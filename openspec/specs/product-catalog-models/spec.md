## ADDED Requirements

### Requirement: Modelar UnidadMedida como catálogo
El sistema SHALL incluir una entidad `UnidadMedida` con los campos: `id` (BIGSERIAL PK), `nombre` (VARCHAR(50) UQ NN), `simbolo` (VARCHAR(10) UQ NN), `tipo` (VARCHAR(20) NN), `created_at` (TIMESTAMPTZ NN).

#### Scenario: Crear UnidadMedida
- **WHEN** se crea una unidad de medida con nombre "kilogramo", símbolo "kg" y tipo "masa"
- **THEN** el sistema la persiste con un ID autogenerado y fecha de creación

#### Scenario: Nombre único
- **WHEN** se intenta crear una unidad de medida con un nombre que ya existe
- **THEN** el sistema lanza un error de integridad (constraint UNIQUE)

#### Scenario: Seed obligatorio
- **WHEN** se ejecuta `seed.py`
- **THEN** el sistema crea 7 unidades de medida: kilogramo (kg), gramo (g), litro (L), mililitro (mL), pieza (u), docena (doc), metro cuadrado (m²)

### Requirement: Modelar Categoria con auto-referencia
El sistema SHALL incluir una entidad `Categoria` con: `id`, `parent_id` (FK auto-referencia nullable), `nombre` (VARCHAR(100) UQ NN), `descripcion`, `imagen_url`, `created_at`, `updated_at`, `deleted_at`. Soporta soft-delete.

#### Scenario: Crear categoría sin padre
- **WHEN** se crea una categoría "Bebidas" sin `parent_id`
- **THEN** el sistema la persiste como categoría raíz

#### Scenario: Crear subcategoría
- **WHEN** se crea una categoría "Gaseosas" con `parent_id` apuntando a "Bebidas"
- **THEN** el sistema la persiste como subcategoría de "Bebidas"

#### Scenario: Soft-delete categoría
- **WHEN** se elimina una categoría
- **THEN** el sistema asigna la fecha actual a `deleted_at` sin borrar el registro

#### Scenario: Listar solo activas
- **WHEN** se consultan categorías
- **THEN** el sistema excluye aquellas con `deleted_at` no nulo

### Requirement: Modelar Producto con relaciones
El sistema SHALL incluir una entidad `Producto` con: `id`, `unidad_venta_id` (FK a UnidadMedida nullable), `nombre` (VARCHAR(150) NN), `descripcion`, `precio_base` (DECIMAL(10,2) NN CHECK >= 0), `imagenes_url` (TEXT[]), `stock_cantidad` (INTEGER NN CHECK >= 0 DEFAULT 0), `disponible` (BOOLEAN NN DEFAULT true), `created_at`, `updated_at`, `deleted_at`.

#### Scenario: Crear producto válido
- **WHEN** se crea un producto con nombre "Pan Francés", precio_base 2.50, stock 100, disponible true
- **THEN** el sistema lo persiste correctamente

#### Scenario: Producto con precio negativo
- **WHEN** se intenta crear un producto con precio_base -10
- **THEN** el sistema rechaza la operación (CHECK constraint)

#### Scenario: Producto con unidad de venta
- **WHEN** se crea un producto con `unidad_venta_id` apuntando a "kilogramo"
- **THEN** el sistema asocia el producto con esa unidad de medida

### Requirement: Modelar Ingrediente como entidad global
El sistema SHALL incluir una entidad `Ingrediente` con: `id`, `nombre` (VARCHAR(100) UQ NN), `descripcion`, `es_alergeno` (BOOLEAN NN DEFAULT false), `created_at`, `updated_at`. Los ingredientes son globales (no se duplican por producto).

#### Scenario: Crear ingrediente no alérgeno
- **WHEN** se crea un ingrediente "Harina" con es_alergeno false
- **THEN** el sistema lo persiste como no alérgeno

#### Scenario: Crear ingrediente alérgeno
- **WHEN** se crea un ingrediente "Maní" con es_alergeno true
- **THEN** el sistema lo persiste con el flag activo

#### Scenario: Nombre único de ingrediente
- **WHEN** se intenta crear un ingrediente con nombre duplicado
- **THEN** el sistema rechaza la operación

### Requirement: Modelar ProductoCategoria como tabla link N:N
El sistema SHALL incluir una tabla intermedia `ProductoCategoria` con PK compuesta (`producto_id`, `categoria_id`), más `es_principal` (BOOLEAN NN DEFAULT false) y `created_at`.

#### Scenario: Asignar categoría a producto
- **WHEN** se asocia un producto con una categoría mediante ProductoCategoria
- **THEN** el sistema crea el registro con es_principal false por defecto

#### Scenario: Marcar categoría principal
- **WHEN** se asocia un producto con una categoría y es_principal=true
- **THEN** el sistema guarda la categoría como principal

### Requirement: Modelar ProductoIngrediente como tabla link N:N
El sistema SHALL incluir una tabla intermedia `ProductoIngrediente` con PK compuesta (`producto_id`, `ingrediente_id`), más `cantidad` (DECIMAL(10,3) NN CHECK > 0), `unidad_medida_id` (FK a UnidadMedida NN), `es_removible` (BOOLEAN NN DEFAULT false), y `created_at`.

#### Scenario: Asignar ingrediente con cantidad
- **WHEN** se asocia un ingrediente "Harina" con un producto "Pan" con cantidad=500 y unidad_medida_id=gramo
- **THEN** el sistema crea el registro con la cantidad y unidad especificadas

#### Scenario: Ingrediente removible
- **WHEN** se asocia un ingrediente con es_removible=true
- **THEN** el sistema permite que sea marcado como personalizable en UI

### Requirement: Relaciones bidireccionales con back_populates
El sistema SHALL configurar `Relationship` con `back_populates` en todos los modelos para navegación bidireccional.

#### Scenario: Navegar de Producto a Categorías
- **WHEN** se accede a `producto.categorias` a través de ProductoCategoria
- **THEN** el sistema retorna las categorías asociadas al producto

#### Scenario: Navegar de Categoría a Productos
- **WHEN** se accede a `categoria.productos` a través de ProductoCategoria
- **THEN** el sistema retorna los productos asociados a la categoría

#### Scenario: Navegar de Producto a Ingredientes
- **WHEN** se accede a `producto.ingredientes` a través de ProductoIngrediente
- **THEN** el sistema retorna los ingredientes con sus cantidades y unidades
