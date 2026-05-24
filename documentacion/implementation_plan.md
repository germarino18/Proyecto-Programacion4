# Plan de Implementación: Primer Parcial (Fullstack FastAPI + React)

> **Objetivo:** Demostrar el funcionamiento de una aplicación Fullstack (FastAPI + React) que integre persistencia de datos, relaciones complejas, gestión de estado de servidor y navegación.

Este plan está basado en el análisis completo de `parcial.pdf`, `parcial1_UML.svg` y los criterios de evaluación. Se ignoran los requisitos del video de presentación.

---

## Criterios de Evaluación (Rúbrica)

| Criterio | Logrado (1.5–2.0 pts) | En Proceso (0.5–1.4 pts) | No Logrado (0–0.4 pts) |
|---|---|---|---|
| **Arquitectura Backend** (FastAPI & SQLModel) | Modelos con `Relationship` (1:N y N:N), validaciones con `Annotated/Query` | Modelos planos o relaciones mal vinculadas | Sin SQLModel, sin relaciones, API no funciona |
| **Persistencia y CRUD** (PostgreSQL) | CRUD completo contra DB, `response_model` correcto, códigos 201/204/404 | CRUD parcial o sin segregar modelos entrada/salida | Solo en memoria o DB falla |
| **Frontend y Estado** (React & TanStack) | `useQuery` + `useMutation` + invalidación de caché, tipado TS sin errores | `fetch` manual o tipado inconsistente (abuso de `any`) | Sin integración con API |
| **Navegación y UI** (Router & Tailwind) | SPA con rutas dinámicas (`useParams`), diseño limpio y responsive con Tailwind 4 | Navegación errática o diseño pobre | Sin React Router o sin Tailwind |

**Guía de Puntuación:**
- 9–10 (Excelente): Todos los criterios logrados. Código modularizado, demo impecable.
- 7–8 (Muy Bueno): Funcional, puede tener detalles de estilo o validación faltante.
- 4–6 (Aprobado): CRUD y persistencia básica, falla en relaciones complejas o TanStack avanzado.
- 1–3 (Insuficiente): Proyecto incompleto.

---

## Módulos Requeridos

### Backend
- `Categoria`, `ProductoCategoria`, `Producto`, `Ingrediente`, `ProductoIngrediente`
- (más `UnidadMedida` — requerida por el UML, con seed obligatorio)

### Frontend
- Página de **Categorías** (tabla + modal crear/editar)
- Página de **Ingredientes** (tabla + modal crear/editar)
- Página de **Productos** (tabla + modal crear/editar)
- Página de **Detalle de Producto** (ruta dinámica `/productos/:id`)

---

## Parte 1: Setup Inicial y Entorno

### 1.1 Backend Setup (FastAPI)
- [ ] Crear el entorno virtual (`.venv`).
- [ ] Crear `requirements.txt` con: `fastapi`, `uvicorn[standard]`, `sqlmodel`, `psycopg2-binary`, `python-dotenv`.
- [ ] Crear la estructura de carpetas: `app/models`, `app/schemas`, `app/routers`, `app/services`.
- [ ] Configurar conexión a PostgreSQL en `app/database.py` usando `create_engine` y `get_session` (con `yield`).
- [ ] Crear punto de entrada en `app/main.py` con CORS habilitado para `http://localhost:5173`.

### 1.2 Frontend Setup (React + Vite)
- [ ] Inicializar proyecto: `npm create vite@latest frontend -- --template react-ts`.
- [ ] Instalar: `@tanstack/react-query`, `react-router-dom`, `tailwindcss`, `@tailwindcss/vite`.
- [ ] Configurar **Tailwind CSS v4** en `vite.config.ts` y en `index.css`.
- [ ] Crear estructura: `src/api`, `src/types`, `src/pages`, `src/components`.
- [ ] Configurar `QueryClientProvider` y `BrowserRouter` en `main.tsx`.

---

## Parte 2: Dominio y Base de Datos (Backend)

Basado en el diagrama `parcial1_UML.svg`:

### Entidades Principales

- [ ] **UnidadMedida** (`«Catalog»`): `id` BIGSERIAL PK, `nombre` VARCHAR(50) {UQ, NN}, `simbolo` VARCHAR(10) {UQ, NN}, `tipo` VARCHAR(20) {NN}, `created_at` TIMESTAMPTZ {NN}.
  - Seed obligatorio en `app/db/seed.py`:
    - masa: kilogramo (kg), gramo (g)
    - volumen: litro (L), mililitro (mL)
    - unidad: pieza (u), docena (doc)
    - area: metro cuadrado (m²)

- [ ] **Categoria** (`«Table»`): `id` BIGSERIAL PK, `parent_id` BIGINT FK→Categoria.id (NULL, auto-referencia), `nombre` VARCHAR(100) {UQ, NN}, `descripcion` TEXT, `imagen_url` TEXT, `created_at`/`updated_at` TIMESTAMPTZ {NN}, `deleted_at` TIMESTAMPTZ.

- [ ] **Ingrediente** (`«Table»`): `id` BIGSERIAL PK, `nombre` VARCHAR(100) {UQ, NN}, `descripcion` TEXT, `es_alergeno` BOOLEAN {NN, DEFAULT false}, `created_at`/`updated_at` TIMESTAMPTZ {NN}.
  - Nota UML: `es_alergeno=true` → mostrar badge en UI (ProductoDetail y ProductCard).
  - Ingrediente es global (no duplicado por producto).

- [ ] **Producto** (`«Table»`): `id` BIGSERIAL PK, `unidad_venta_id` BIGINT FK→UnidadMedida.id (NULL), `nombre` VARCHAR(150) {NN}, `descripcion` TEXT, `precio_base` DECIMAL(10,2) {NN, CHECK >= 0}, `imagenes_url` TEXT[], `stock_cantidad` INTEGER {NN, CHECK >= 0, DEFAULT 0}, `disponible` BOOLEAN {NN, DEFAULT true}, `created_at`/`updated_at` TIMESTAMPTZ {NN}, `deleted_at` TIMESTAMPTZ.
  - Nota UML: `stock_cantidad` y `disponible` son flags INDEPENDIENTES:
    - `stock=0 + disponible=true` → badge "Sin stock" (UI)
    - `stock>0 + disponible=false` → deshabilitado por operador
  - `unidad_venta_id` resuelve ambigüedad de `precio_base` (ej: "S/. 12.50 / kg")

### Tablas Intermedias (N:N)

- [ ] **ProductoCategoria**: `producto_id` FK, `categoria_id` FK, `es_principal` BOOLEAN.
- [ ] **ProductoIngrediente**: `producto_id` FK, `ingrediente_id` FK, `cantidad` (numérico), `unidad_medida_id` FK→UnidadMedida, `es_removible` BOOLEAN.
  - Nota UML: `es_removible=true` → aparece en checkboxes de personalización.

- [ ] Configurar `Relationship` y `back_populates` en todas las clases.

---

## Parte 3: Capa Lógica y API (Backend)

### Checklist de la Rúbrica
- [ ] **Schemas (Pydantic/SQLModel):** Para cada entidad crear `EntityCreate`, `EntityUpdate` (campos `Optional`), `EntityRead` con `model_config = ConfigDict(from_attributes=True)`.
- [ ] **`response_model`:** Usar siempre para no filtrar datos sensibles o innecesarios. Códigos de estado correctos: `201` en POST, `204` en DELETE, `404` cuando no se encuentra.
- [ ] **Services:** Funciones CRUD en `services/` usando `session.exec(select(...))` y `session.add(...)`.
- [ ] **Routers (APIRouter):**
  - Endpoints: `GET /`, `GET /{id}`, `POST /`, `PATCH /{id}`, `DELETE /{id}`.
  - Usar `Annotated` y `Query` para filtros/paginación en `GET /` (requisito de rúbrica).
  - Manejar `HTTPException(status_code=404)` para recursos no encontrados.
- [ ] **`app/main.py`:** Incluir todos los routers con `app.include_router()`.
- [ ] **Estructura modular:** Código organizado en `routers/`, `schemas/`, `services/`, `models/`. El checklist del parcial también menciona `uow` (Unit of Work) — considerar incluirlo.

---

## Parte 4: Integración del Frontend

- [ ] **Tipos TypeScript (`src/types/`):** Interfaces `Ingrediente`, `IngredienteCreate`, `IngredienteUpdate`, `Categoria`, `CategoriaCreate`, `Producto`, `ProductoCreate`, etc. Sin `any` libre.
- [ ] **Capa API (`src/api/`):** Funciones de fetching para CRUD completo de cada recurso. Lanzar errores si la request falla.

---

## Parte 5: Interfaz de Usuario (Frontend)

### Requisito de Rúbrica: useQuery + useMutation + invalidateQueries

- [ ] **Páginas de Listado (`src/pages/`):**
  - `CategoriasPage`, `IngredientesPage`, `ProductosPage`.
  - `useQuery` para traer datos → renderizar en tabla.
  - Estados de `isLoading` ("Cargando...") y `isError` ("Error") visibles.
- [ ] **Componentes Modales (`src/components/`):**
  - Modales de formulario (ej. `IngredienteModal`) para Crear (reciben `null`) y Editar (reciben la entidad).
  - `useMutation` para alta y edición.
  - `invalidateQueries` en `onSuccess` para refrescar la tabla automáticamente.
- [ ] **Estado Local:** `useState` para manejo de formularios e UI interactiva (requisito del checklist).
- [ ] **Ruta de Detalle (Navegación dinámica):**
  - React Router en `App.tsx` con rutas estáticas + al menos una dinámica (`/productos/:id`).
  - `ProductoDetallePage` usando `useParams` + `useQuery` para buscar el producto.
  - Mostrar datos relacionados: categorías e ingredientes del producto (incluyendo badge de alérgeno y unidad de venta).

### Diseño (Tailwind CSS 4)
- [ ] Interfaz **íntegramente con clases de utilidad Tailwind 4** (requisito del checklist).
- [ ] Diseño limpio, responsive, con cards y formularios estructurados.

---

## Parte 6: Entrega y Verificación

### Archivos de Entrega
- [ ] **`CHECKLIST.md`:** En la raíz del repositorio, marcar con `[x]` los puntos completados.
- [ ] **`README.md`:** Nombre del proyecto + link de presentación + comandos para ejecutar backend (`uvicorn app.main:app --reload`) y frontend (`npm run dev`).
- [ ] **`requirements.txt`:** Incluido con todas las dependencias del backend.
- [ ] **Repositorio GitHub/GitLab:** Con README configurado.

### Pruebas Manuales
- [ ] Validar CRUD completo (Crear, Leer, Actualizar, Borrar) en los 3 módulos.
- [ ] Verificar que las tablas estén reflejadas en PostgreSQL (pgAdmin o DBeaver).
- [ ] Comprobar que no hay `any` libres en TypeScript.
- [ ] Probar datos inválidos → verificar que las validaciones de Pydantic y los mensajes de error en Frontend funcionan.
- [ ] Verificar que la UI muestra datos relacionados (categoría, ingredientes alérgenos) en la página de detalle.

---

## ⚠️ Preguntas Abiertas

- **Framework de Fetching:** ¿`fetch` nativo o `axios`?
- **Base de Datos:** ¿PostgreSQL ya corre localmente o se agrega Docker Compose?
- **Seed de Datos:** ¿Se incluye `seed.py` para poblar `UnidadMedida` y datos de prueba?
- **Unit of Work:** El checklist menciona `uow` en la estructura de módulos — ¿se implementa o se omite por simplicidad?
