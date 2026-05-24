## ADDED Requirements

### Requirement: API RESTful para Categorías
El sistema SHALL exponer endpoints CRUD para categorías bajo `/api/v1/categorias`.

#### Scenario: Listar categorías
- **WHEN** se envía GET a `/api/v1/categorias`
- **THEN** el sistema retorna un array de categorías (excluyendo soft-delete)
- **THEN** el sistema soporta filtro por texto (`q`), `parent_id`, paginación (`page`, `size`)
- **THEN** el sistema usa `Annotated` y `Query` para los parámetros de filtro

#### Scenario: Obtener categoría por ID
- **WHEN** se envía GET a `/api/v1/categorias/{id}` con un ID existente
- **THEN** el sistema retorna la categoría con sus subcategorías

#### Scenario: Obtener categoría inexistente
- **WHEN** se envía GET a `/api/v1/categorias/{id}` con un ID que no existe
- **THEN** el sistema retorna HTTP 404

#### Scenario: Crear categoría
- **WHEN** se envía POST a `/api/v1/categorias` con datos válidos
- **THEN** el sistema retorna HTTP 201 con la categoría creada

#### Scenario: Actualizar categoría
- **WHEN** se envía PATCH a `/api/v1/categorias/{id}` con datos parciales
- **THEN** el sistema retorna la categoría actualizada

#### Scenario: Eliminar categoría (soft-delete)
- **WHEN** se envía DELETE a `/api/v1/categorias/{id}`
- **THEN** el sistema retorna HTTP 204 y marca `deleted_at`

### Requirement: API RESTful para Productos
El sistema SHALL exponer endpoints CRUD para productos bajo `/api/v1/productos`.

#### Scenario: Listar productos
- **WHEN** se envía GET a `/api/v1/productos`
- **THEN** el sistema retorna un array de productos (excluyendo soft-delete)
- **THEN** el sistema soporta filtros por texto (`q`), `categoria_id`, `disponible`, paginación

#### Scenario: Obtener producto por ID con relaciones
- **WHEN** se envía GET a `/api/v1/productos/{id}`
- **THEN** el sistema retorna el producto con sus categorías e ingredientes asociados

#### Scenario: Crear producto
- **WHEN** se envía POST a `/api/v1/productos` con datos válidos (incluyendo categorías e ingredientes)
- **THEN** el sistema retorna HTTP 201

#### Scenario: Actualizar producto
- **WHEN** se envía PATCH a `/api/v1/productos/{id}`
- **THEN** el sistema actualiza los campos y retorna el producto modificado

#### Scenario: Soft-delete producto
- **WHEN** se envía DELETE a `/api/v1/productos/{id}`
- **THEN** el sistema retorna HTTP 204

### Requirement: API RESTful para Ingredientes
El sistema SHALL exponer endpoints CRUD para ingredientes bajo `/api/v1/ingredientes`.

#### Scenario: Listar ingredientes
- **WHEN** se envía GET a `/api/v1/ingredientes`
- **THEN** el sistema retorna un array de ingredientes con filtros por texto (`q`) y `es_alergeno`

#### Scenario: Crear ingrediente
- **WHEN** se envía POST a `/api/v1/ingredientes` con datos válidos
- **THEN** el sistema retorna HTTP 201

#### Scenario: Eliminar ingrediente
- **WHEN** se envía DELETE a `/api/v1/ingredientes/{id}`
- **THEN** el sistema retorna HTTP 204

### Requirement: API RESTful para Unidades de Medida
El sistema SHALL exponer endpoints CRUD para unidades de medida bajo `/api/v1/unidades-medida`.

#### Scenario: Listar unidades por tipo
- **WHEN** se envía GET a `/api/v1/unidades-medida?tipo=masa`
- **THEN** el sistema retorna solo las unidades de tipo masa

#### Scenario: Obtener unidad por ID
- **WHEN** se envía GET a `/api/v1/unidades-medida/{id}`
- **THEN** el sistema retorna la unidad de medida

### Requirement: Validación con schemas Pydantic
El sistema SHALL usar schemas Pydantic segregados para cada entidad: `EntityCreate`, `EntityUpdate` (todos los campos Optional), `EntityRead` con `model_config = ConfigDict(from_attributes=True)`. Usar `response_model` en todos los endpoints.

#### Scenario: Schema de creación
- **WHEN** se crea un producto con POST
- **THEN** el sistema valida los campos requeridos usando ProductoCreate

#### Scenario: Schema de actualización parcial
- **WHEN** se actualiza con PATCH enviando solo algunos campos
- **THEN** el sistema trata los campos no enviados como no modificados (Optional)

#### Scenario: Schema de lectura con from_attributes
- **WHEN** el sistema retorna una entidad
- **THEN** usa el schema Read correspondiente con `from_attributes=True`

### Requirement: Códigos HTTP correctos
El sistema SHALL usar códigos HTTP estándar: 201 para creación, 204 para eliminación, 404 para recursos no encontrados.

#### Scenario: Código 201 en POST
- **WHEN** se crea un recurso exitosamente
- **THEN** el sistema retorna HTTP 201

#### Scenario: Código 204 en DELETE
- **WHEN** se elimina un recurso exitosamente
- **THEN** el sistema retorna HTTP 204 sin cuerpo

#### Scenario: Código 404 en GET inexistente
- **WHEN** se solicita un recurso que no existe
- **THEN** el sistema retorna HTTP 404 con mensaje de error

### Requirement: CORS habilitado
El sistema SHALL habilitar CORS para el origen `http://localhost:5173`.

#### Scenario: CORS permitido
- **WHEN** un frontend en localhost:5173 hace una solicitud
- **THEN** el sistema responde con los headers CORS adecuados
