# ROST Specialty Coffee — Catálogo de Productos

Sistema fullstack de gestión de catálogo de productos para **ROST Specialty Coffee**, construido con FastAPI + SQLModel + PostgreSQL (backend) y React + TypeScript + Tailwind 4 (frontend).

## Requisitos previos

| Herramienta | Versión |
|-------------|---------|
| Python | 3.13+ |
| Node.js | 22+ |
| PostgreSQL | 16+ |

---

## 1. Base de datos

### 1.1. Verificar que PostgreSQL está activo

```powershell
Get-Service postgresql*
```

### 1.2. Crear la base de datos

```powershell
# Ruta al psql (ajustar según versión instalada)
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE parcial_db;"
```

### 1.3. Crear el usuario de la aplicación

El archivo `.env` usa el usuario `cementista`. Crealo en PostgreSQL y dale permisos:

```powershell
# Crear el rol
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d parcial_db -c "CREATE ROLE cementista LOGIN;"

# Dar permisos sobre el schema public
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d parcial_db -c "GRANT USAGE ON SCHEMA public TO cementista; GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cementista; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cementista;"
```

> **Nota**: Si querés usar otro usuario, editá `Backend/.env` y cambiá la línea `DATABASE_URL`.

La app crea las tablas automáticamente al iniciar por primera vez.

---

## 2. Backend (FastAPI)

### 2.1. Entorno virtual e instalación

```powershell
cd Backend

# Crear entorno virtual (solo primera vez)
python -m venv .venv

# Activar
.venv\Scripts\activate

# Instalar dependencias (solo primera vez)
pip install -r requirements.txt
```

### 2.2. Variables de entorno

El archivo `.env` ya está configurado:

```
DATABASE_URL=postgresql://postgres@localhost/parcial_db
```

Si tu configuración de PostgreSQL es distinta, editá `.env`.

### 2.3. Iniciar el servidor

```powershell
cd Backend
.venv\Scripts\activate
uvicorn app.main:app --reload
```

La API se levanta en **http://localhost:8000**.

### 2.4. Verificar que funciona

```powershell
# Health check
curl http://localhost:8000/

# Listar productos (con seed data)
curl http://localhost:8000/api/v1/productos

# Documentación interactiva (abrir en navegador)
# http://localhost:8000/docs
```

> **Seed automático**: al iniciar por primera vez, se crean 7 unidades de medida, 3 categorías, 6 ingredientes y 3 productos de prueba.

---

## 3. Frontend (React + Vite)

### 3.1. Instalar dependencias

```powershell
cd Frontend-admin
npm install
```

### 3.2. Iniciar servidor de desarrollo

```powershell
cd Frontend-admin
npm run dev
```

El frontend se levanta en **http://localhost:5173**.

El proxy de Vite redirige automáticamente las llamadas a `/api/*` hacia el backend en `http://localhost:8000`, por lo que no hay problemas de CORS en desarrollo.

### 3.3. Build para producción

```powershell
cd Frontend-admin
npm run build
```

El output se genera en `Frontend-admin/dist/`.

---

## 4. Demo rápida

Para probar la app completa en unos segundos:

```powershell
# Terminal 1 — Backend
cd Backend
.venv\Scripts\activate
uvicorn app.main:app --reload

# Terminal 2 — Frontend
cd Frontend-admin
npm run dev
```

Luego abrir **http://localhost:5173** en el navegador.

La app tiene las siguientes rutas:

| Ruta | Descripción |
|------|-------------|
| `/admin/productos` | Lista de productos |
| `/admin/productos/:id` | Detalle de un producto |
| `/admin/ingredientes` | Gestión de ingredientes |
| `/admin/categorias` | Gestión de categorías |

---

## 5. Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/unidades-medida` | Listar unidades de medida |
| GET | `/api/v1/categorias` | Listar categorías |
| POST | `/api/v1/categorias` | Crear categoría |
| PUT | `/api/v1/categorias/{id}` | Actualizar categoría |
| DELETE | `/api/v1/categorias/{id}` | Eliminar categoría |
| GET | `/api/v1/ingredientes` | Listar ingredientes |
| POST | `/api/v1/ingredientes` | Crear ingrediente |
| PUT | `/api/v1/ingredientes/{id}` | Actualizar ingrediente |
| DELETE | `/api/v1/ingredientes/{id}` | Eliminar ingrediente |
| GET | `/api/v1/productos` | Listar productos |
| POST | `/api/v1/productos` | Crear producto |
| PUT | `/api/v1/productos/{id}` | Actualizar producto |
| DELETE | `/api/v1/productos/{id}` | Eliminar producto |

Filtros disponibles en listados: `q` (búsqueda), `categoria_id`, `es_alergeno`, `disponible`, `tipo`, `parent_id`.

---

## 6. Estructura del proyecto

```
Proyecto/
├── Backend/
│   ├── app/
│   │   ├── main.py              # Punto de entrada FastAPI
│   │   ├── core/
│   │   │   ├── database.py      # Conexión a PostgreSQL
│   │   │   └── uow.py           # Unit of Work (transacciones)
│   │   ├── models/              # Modelos SQLModel (6 entidades)
│   │   ├── schemas/             # Schemas Pydantic (Create/Update/Read)
│   │   ├── services/            # Servicios CRUD
│   │   ├── routers/             # Routers REST (4 recursos)
│   │   └── db/
│   │       └── seed.py          # Seed de datos de prueba
│   ├── .env                     # Config de base de datos
│   └── requirements.txt
├── Frontend-admin/
│   ├── src/
│   │   ├── api/                 # Axios client + CRUDs
│   │   ├── components/          # Componentes reutilizables (Modal)
│   │   ├── layouts/             # AdminLayout con sidebar
│   │   ├── pages/               # Páginas (Productos, Ingredientes, Categorías, Detalle)
│   │   ├── types/               # Interfaces TypeScript
│   │   ├── App.tsx              # Router principal
│   │   └── main.tsx             # Entry point con TanStack Query
│   ├── index.html
│   ├── vite.config.ts           # Proxy /api → backend
│   └── package.json
├── documentacion/               # Plan de implementación, UML, PDFs
└── Identidad de marca/          # Guía de diseño ROST
```
