# Plan de Implementación — Migración a ROST_V2

> **Objetivo**: Migrar el código funcional de los proyectos fuente (`Backend/`, `Frontend-admin/`, `store-frontend/`) a la nueva estructura basada en features dentro de `ROST_V2/`, corrigiendo los problemas arquitectónicos detectados.

---

## Índice

1. [Backend — FastAPI](#1-backend--fastapi)
2. [Frontend Admin — React](#2-frontend-admin--react)
3. [Frontend Store — React](#3-frontend-store--react)
4. [Orden de Implementación Global](#4-orden-de-implementación-global)

---

## 1. Backend — FastAPI

### Problemas a corregir

| # | Problema | Impacto |
|---|----------|---------|
| P1 | `session.commit()` manuales fuera del patrón Unit of Work | Transacciones inconsistentes, riesgo de datos parciales en errores |
| P2 | Consultas SQL/ORM directamente en servicios (`session.exec()`, `session.add()`) | Acoplamiento servicio-base de datos, imposible testear lógica de negocio sin DB |
| P3 | Falta capa Repository completa para algunos módulos | No hay abstracción entre datos y negocio; `BaseService` mezcla ambas responsabilidades |
| P4 | Modelos, esquemas, servicios y routers en carpetas planas (`models/`, `schemas/`, etc.) | Dificulta el mantenimiento al escalar; el target exige organización por feature |

### Estructura destino

```
backend/
├── app/
│   ├── main.py                      ← Entry point (registra routers, CORS, startup)
│   ├── core/
│   │   ├── config.py                ← Settings (JWT, DB, etc.)
│   │   ├── dependencies.py          ← FastAPI Depends (get_current_user, require_role)
│   │   ├── repository.py            ← BaseRepository genérico (CRUD abstracto)
│   │   ├── security.py              ← Hashing + JWT
│   │   └── uow.py                   ← Unit of Work (commit/rollback automático)
│   ├── db/
│   │   ├── database.py              ← Engine, session factory, init_db
│   │   └── seed.py                  ← Datos iniciales (roles, productos, etc.)
│   └── features/
│       ├── auth/
│       │   ├── models.py            ← Usuario, UsuarioRol (o referencias cruzadas)
│       │   ├── schemas.py           ← Register, Login, UserRead
│       │   ├── repository.py        ← AuthRepository (consultas específicas de auth)
│       │   ├── service.py           ← AuthService (register, login, logout)
│       │   └── router.py            ← POST /register, /login, /logout, GET /me
│       ├── categoria/
│       │   ├── models.py            ← Categoria
│       │   ├── schemas.py           ← CategoriaCreate/Update/Read
│       │   ├── repository.py        ← CategoriaRepository
│       │   ├── service.py           ← CategoriaService (con soft-delete)
│       │   └── router.py            ← CRUD /categorias
│       └── usuario/
│           ├── models.py            ← Usuario, UsuarioRol, Rol
│           ├── schemas.py           ← AdminUserUpdate, AdminUserRead
│           ├── repository.py        ← UsuarioRepository
│           ├── service.py           ← AdminService (gestión de usuarios + roles)
│           └── router.py            ← GET/PATCH /admin/usuarios, roles
```

### Pasos

#### Paso B.1 — Crear `core/repository.py` con `BaseRepository` genérico

**Archivos afectados**: `ROST_V2/backend/app/core/repository.py` (nuevo)

**Tarea**: Implementar una clase abstracta `BaseRepository[ModelT]` que exponga:
- `get_all(session, **filters)` → `list[ModelT]`
- `get_by_id(session, id)` → `ModelT | None`
- `create(session, **data)` → `ModelT`
- `update(session, instance, **data)` → `ModelT`
- `delete(session, instance)` → `None`

**Justificación**: Separa el acceso a datos de la lógica de negocio. Los servicios ya no llaman `session.exec(select(...))` directamente sino que delegan en el repositorio. Esto permite testear servicios con repositorios mock sin base de datos.

---

#### Paso B.2 — Migrar modelos a `features/*/models.py`

**Archivos afectados**:
- `ROST_V2/backend/app/features/auth/models.py` (nuevo) ← Usuario, UsuarioRol
- `ROST_V2/backend/app/features/categoria/models.py` (nuevo) ← Categoria
- `ROST_V2/backend/app/features/usuario/models.py` (nuevo) ← Usuario, UsuarioRol, Rol
- `ROST_V2/backend/app/features/usuario/rol.py` (nuevo) ← Rol
- `ROST_V2/backend/app/features/usuario/usuario_rol.py` (nuevo) ← UsuarioRol

**Tarea**: Mover cada modelo SQLModel desde `Backend/app/models/` a su feature correspondiente. Los modelos transversales (Producto, Pedido, etc.) deben ir en la feature que los gestiona o en un módulo compartido si son usados por múltiples features. Como el target solo tiene auth, categoria y usuario como features, los modelos restantes (producto, ingrediente, pedido, etc.) vivirán temporalmente en la feature que corresponda o se añadirán nuevas features según se implementen.

**Justificación**: La organización por feature agrupa todo lo relacionado a un dominio en un solo lugar. Al abrir `features/auth/` encuentras modelo, esquemas, repositorio, servicio y ruta.

---

#### Paso B.3 — Migrar schemas a `features/*/schemas.py`

**Archivos afectados**:
- `ROST_V2/backend/app/features/auth/schemas.py` (nuevo) ← auth.py
- `ROST_V2/backend/app/features/categoria/schemas.py` (nuevo) ← categoria.py
- `ROST_V2/backend/app/features/usuario/schemas.py` (nuevo) ← admin.py

**Tarea**: Mover cada schema Pydantic desde `Backend/app/schemas/` a su feature. Mantener la estructura de tres esquemas por entidad: Create, Update, Read.

**Justificación**: Cada feature es autocontenida. Un cambio en los schemas de auth no requiere tocar archivos fuera de `features/auth/`.

---

#### Paso B.4 — Crear `Repository` concreto por feature

**Archivos afectados** (nuevos):
- `ROST_V2/backend/app/features/auth/repository.py`
- `ROST_V2/backend/app/features/categoria/repository.py`
- `ROST_V2/backend/app/features/usuario/repository.py`

**Tarea**: Crear clases que hereden de `BaseRepository` y agreguen métodos específicos:
- `AuthRepository`: `get_by_email()`, `get_roles()`
- `CategoriaRepository`: `get_by_name()`, `get_with_parent()`, `soft_delete()`
- `UsuarioRepository`: `get_by_email()`, `get_with_roles()`, `get_paginated()`

**Justificación**: Centraliza todas las consultas ORM en un solo lugar. Si cambia SQLModel o se migra a otro ORM, solo se tocan los repositorios.

---

#### Paso B.5 — Refactorizar servicios para usar repositorios + UoW

**Archivos afectados**:
- `ROST_V2/backend/app/features/auth/service.py` (nuevo) ← basado en `Backend/app/services/auth_service.py`
- `ROST_V2/backend/app/features/categoria/service.py` (nuevo) ← basado en `Backend/app/services/categoria_service.py`
- `ROST_V2/backend/app/features/usuario/service.py` (nuevo) ← basado en `Backend/app/services/` (admin)

**Tarea**: Reescribir los servicios para que:
1. Reciban el repositorio por inyección de dependencias (o lo instancien internamente)
2. Usen `UnitOfWork` como context manager para todas las operaciones de escritura
3. No contengan NI UNA llamada directa a `session.exec()`, `session.add()`, `session.commit()`
4. Solo contengan lógica de negocio pura (validaciones, reglas, transformaciones)

**Ejemplo de contrato**:
```python
# Antes (en servicio):
def create(self, schema):
    with UnitOfWork(self.session) as uow:
        db_obj = self.model(**schema.model_dump())
        uow.session.add(db_obj)   # ← Esto debe ir en el repositorio
        uow.commit()
    return db_obj

# Después:
def create(self, schema):
    data = schema.model_dump()
    return self.repository.create(self.session, **data)
```

**Justificación**: Elimina P1 (commits manuales fuera de UoW) y P2 (ORM en servicios). Los servicios ahora son puramente lógica de negocio y pueden testearse con repositorios mock.

---

#### Paso B.6 — Migrar routers a `features/*/router.py`

**Archivos afectados**:
- `ROST_V2/backend/app/features/auth/router.py` (nuevo)
- `ROST_V2/backend/app/features/categoria/router.py` (nuevo)
- `ROST_V2/backend/app/features/usuario/router.py` (nuevo)

**Tarea**: Copiar cada router desde `Backend/app/routers/` a su feature. Ajustar las importaciones para que apunten al service y schemas de la feature. Mantener los mismos decoradores y dependencias.

**Justificación**: Cada feature expone su propia API. El `main.py` solo importa routers desde cada feature.

---

#### Paso B.7 — Implementar `main.py` y configuración de proyecto

**Archivos afectados**:
- `ROST_V2/backend/app/__init__.py` (nuevo, vacío o con importaciones)
- `ROST_V2/backend/app/core/__init__.py` (nuevo)
- `ROST_V2/backend/app/core/config.py` (← de `Backend/app/core/config.py`)
- `ROST_V2/backend/app/core/security.py` (← de `Backend/app/core/security.py`)
- `ROST_V2/backend/app/core/dependencies.py` (← de `Backend/app/core/dependencies.py`)
- `ROST_V2/backend/app/core/uow.py` (← de `Backend/app/core/uow.py`)
- `ROST_V2/backend/app/db/database.py` (← de `Backend/app/database.py`)
- `ROST_V2/backend/app/db/seed.py` (← de `Backend/app/db/seed.py`)
- `ROST_V2/backend/app/main.py` (reescrito)

**Tarea**:
1. Copiar los archivos de core, db y config a sus nuevas ubicaciones
2. En `main.py`, importar los routers desde cada feature y registrarlos bajo `/api/v1/`
3. Configurar CORS, startup events (init_db + seed), y middleware

**Justificación**: Integra todos los módulos en una aplicación ejecutable. El `main.py` es el pegamento que une las features.

---

#### Paso B.8 — Migrar modelos restantes (Producto, Pedido, Ingrediente, etc.)

**Archivos afectados**: Nuevas features a crear según el dominio:
- `features/producto/`
- `features/ingrediente/`
- `features/pedido/`
- `features/direccion/`
- `features/unidad_medida/`
- `features/forma_pago/`

**Tarea**: Para cada feature faltante, replicar el patrón de los pasos B.2 a B.6: crear la carpeta, mover modelo/schemas, crear repositorio, refactorizar servicio, migrar router.

**Justificación**: El target de 3 features (auth, categoria, usuario) es el mínimo. Para que la API funcione completamente, se necesita migrar todos los módulos del backend original.

---

## 2. Frontend Admin — React

### Problemas a corregir

| # | Problema | Impacto |
|---|----------|---------|
| P5 | Las páginas están en una carpeta plana `pages/` | No hay separación por dominio; al crecer el proyecto es difícil encontrar código relacionado |
| P6 | El `AppRouter` está inline dentro de `App.tsx` | Mezcla responsabilidades: `App.tsx` debería ser solo el providers wrapper |
| P7 | `ProtectedRoute` usado como wrapper de elementos en cada ruta hija, no como layout | Cada ruta redefine el guard, forzando rerenders al navegar entre rutas con diferentes roles |

### Estructura destino

```
frontend-admin/src/
├── api/
│   ├── client.ts                 ← Axios instance (baseURL, withCredentials)
│   ├── auth.ts                   ← login, logout, getMe
│   ├── productos.ts
│   ├── categorias.ts
│   ├── ingredientes.ts
│   └── unidadesMedida.ts
├── components/
│   ├── ErrorBoundary.tsx
│   ├── Modal.tsx
│   └── ProtectedRoute.tsx        ← Refactorizado para usarse como layout
├── features/
│   ├── auth/
│   │   ├── context/              ← AuthContext (provider + useAuth hook)
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── UnauthorizedPage.tsx
│   │   ├── services/
│   │   │   └── authService.ts
│   │   └── types/
│   │       └── index.ts
│   ├── categorias/
│   │   ├── components/
│   │   │   └── CategoriaForm.tsx
│   │   ├── pages/
│   │   │   └── CategoriasPage.tsx
│   │   └── hooks/
│   │       └── useCategorias.ts
│   ├── ingredientes/
│   │   ├── components/
│   │   ├── pages/
│   │   │   └── IngredientesPage.tsx
│   │   └── hooks/
│   │       └── useIngredientes.ts
│   ├── pedidos/
│   │   ├── components/
│   │   ├── pages/
│   │   │   └── CajeroPedidosPage.tsx
│   │   └── hooks/
│   │       └── usePedidos.ts
│   └── productos/
│       ├── components/
│       │   └── ProductoForm.tsx
│       ├── pages/
│       │   ├── ProductosPage.tsx
│       │   └── ProductoDetallePage.tsx
│       ├── services/
│       │   └── productosService.ts
│       └── hooks/
│           └── useProductos.ts
├── layouts/
│   └── AdminLayout.tsx           ← Sidebar + Header + <Outlet />
├── router/
│   ├── AppRouter.tsx             ← Definición de rutas (exporta <Routes>)
│   ├── AdminIndexRedirect.tsx    ← Redirección según rol del usuario
│   └── routes.ts                ← Constantes de rutas
├── types/
│   └── index.ts                  ← Interfaces globales (Producto, Categoria, etc.)
├── App.tsx                       ← Solo providers (<AuthProvider> + <QueryClient> + <AppRouter>)
├── main.tsx                      ← Entry point (createRoot)
└── index.css                     ← Tailwind + design system
```

### Pasos

#### Paso FA.1 — Refactorizar `ProtectedRoute` para usarse como layout route

**Archivos afectados**:
- `Frontend-admin/src/components/ProtectedRoute.tsx` → `ROST_V2/frontend-admin/src/components/ProtectedRoute.tsx`

**Tarea**: Modificar `ProtectedRoute` para que funcione como un **layout de guardia**. En lugar de ser un wrapper que recibe `children`, debe renderizar `<Outlet />` cuando el acceso es concedido. Esto permite colocarlo como element de una ruta padre y que todas las rutas hijas hereden la protección.

```tsx
// Nuevo patrón:
<Route element={<ProtectedRoute roles={["ADMIN"]} />}>
  <Route path="productos" element={<ProductosPage />} />
  <Route path="categorias" element={<CategoriasPage />} />
</Route>
```

En lugar del patrón actual:
```tsx
// Viejo patrón:
<Route path="productos" element={<ProtectedRoute roles={["ADMIN"]}><ProductosPage /></ProtectedRoute>} />
```

**Justificación**: Elimina P7. Layout routes evitan rerenders innecesarios al navegar entre rutas hijas porque React Router preserva el elemento padre. Además, el código es más limpio y escalable.

---

#### Paso FA.2 — Migrar `AuthContext` a `features/auth/context/`

**Archivos afectados**:
- `Frontend-admin/src/context/AuthContext.tsx` → `ROST_V2/frontend-admin/src/features/auth/context/AuthContext.tsx`

**Tarea**: Copiar el AuthContext (provider, hook `useAuth`, lógica de login/logout/me) a su nueva ubicación. Mantener exactamente la misma API pública.

**Justificación**: El contexto de autenticación pertenece al feature auth, no a una carpeta `context/` genérica.

---

#### Paso FA.3 — Migrar páginas planas a `features/*/pages/`

**Archivos afectados** (origen → destino):
| Origen | Destino |
|--------|---------|
| `pages/LoginPage.tsx` | `features/auth/pages/LoginPage.tsx` (o se mantiene Login separado por ser página pública) |
| *No existe* | `features/auth/pages/UnauthorizedPage.tsx` (extraer el inline de App.tsx) |
| `pages/ProductosPage.tsx` | `features/productos/pages/ProductosPage.tsx` |
| `pages/ProductoDetallePage.tsx` | `features/productos/pages/ProductoDetallePage.tsx` |
| `pages/CategoriasPage.tsx` | `features/categorias/pages/CategoriasPage.tsx` |
| `pages/IngredientesPage.tsx` | `features/ingredientes/pages/IngredientesPage.tsx` |
| `pages/CajeroPedidosPage.tsx` | `features/pedidos/pages/CajeroPedidosPage.tsx` |
| `pages/UsuariosPage.tsx` | `features/usuario/pages/UsuariosPage.tsx` (requiere crear feature usuario) |

**Tarea**: Para cada página, mover el archivo a su feature correspondiente y actualizar importaciones (rutas relativas al nuevo contexto).

**Justificación**: Elimina P5. Cada feature es autocontenida: al trabajar en "productos", solo ves los archivos de productos.

---

#### Paso FA.4 — Extraer componentes y hooks por feature

**Archivos afectados**: Las carpetas `*/components/` y `*/hooks/` dentro de cada feature.

**Tarea**: Identificar si las páginas tienen lógica extraíble:
- Si una página tiene JSX complejo reutilizable → crear `features/*/components/Componente.tsx`
- Si una página tiene lógica de data-fetching → crear `features/*/hooks/useRecurso.ts`
- Si una página tiene lógica de API → crear `features/*/services/recursoService.ts`

Del análisis del código fuente:
- `ProductosPage.tsx` tiene un modal de formulario inline → extraer a `features/productos/components/ProductoForm.tsx`
- `CategoriasPage.tsx` tiene selector de categoría padre → extraer a `features/categorias/components/CategoriaForm.tsx`
- Los hooks de TanStack Query (useQuery, useMutation) están inline en las páginas → extraerlos a `features/*/hooks/`

**Justificación**: Separa responsabilidades y permite reutilizar componentes entre páginas del mismo feature.

---

#### Paso FA.5 — Crear `router/AppRouter.tsx` y extraer la lógica de rutas de `App.tsx`

**Archivos afectados**:
- `ROST_V2/frontend-admin/src/router/AppRouter.tsx` (nuevo)
- `ROST_V2/frontend-admin/src/router/routes.ts` (nuevo, opcional)
- `ROST_V2/frontend-admin/src/App.tsx` (simplificado)

**Tarea**:
1. Crear `AppRouter.tsx` con toda la configuración de `<Routes>` y `<Route>` (que actualmente está en `App.tsx`)
2. Extraer `AdminIndexRedirect` a su propio archivo o mantenerlo dentro del router
3. Refactorizar el árbol de rutas para usar `ProtectedRoute` como layout (Paso FA.1), con un solo guard envuelve las rutas hijas

**Estructura de rutas refactorizada**:
```tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/no-autorizado" element={<UnauthorizedPage />} />

  <Route element={<ProtectedRoute />}>                     ← Verifica que hay sesión
    <Route element={<AdminLayout />}>                       ← Sidebar + <Outlet />
      <Route index element={<AdminIndexRedirect />} />

      <Route element={<ProtectedRoute roles={["ADMIN","STOCK"]} />}>
        <Route path="productos" element={<ProductosPage />} />
        <Route path="productos/:id" element={<ProductoDetallePage />} />
      </Route>

      <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
        <Route path="categorias" element={<CategoriasPage />} />
        <Route path="ingredientes" element={<IngredientesPage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={["ADMIN","PEDIDOS"]} />}>
        <Route path="pedidos" element={<CajeroPedidosPage />} />
      </Route>
    </Route>
  </Route>

  <Route path="*" element={<Navigate to="/admin" replace />} />
</Routes>
```

4. Simplificar `App.tsx` para que solo contenga:
```tsx
<AuthProvider>
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </QueryClientProvider>
</AuthProvider>
```

**Justificación**: Elimina P6. `App.tsx` es solo el root con providers; el router vive en su propio archivo. Esto facilita la lectura, testing y futuras modificaciones.

---

#### Paso FA.6 — Migrar API layer a `api/`

**Archivos afectados**:
- `Frontend-admin/src/api/*` → `ROST_V2/frontend-admin/src/api/*`

**Tarea**: Copiar los archivos de API (client.ts, productos.ts, categorias.ts, ingredientes.ts, unidadesMedida.ts) a la nueva ubicación. En la estructura destino ya existe `api/` así que solo es copiar.

**Justificación**: La capa de comunicación con el backend es un servicio transversal que no pertenece a una feature específica.

---

#### Paso FA.7 — Migrar `App.tsx` y configurar entry point

**Archivos afectados**:
- `ROST_V2/frontend-admin/src/main.tsx` (actualizar)
- `ROST_V2/frontend-admin/src/App.tsx` (reescribir)

**Tarea**: Actualizar `main.tsx` y `App.tsx` para que reflejen la nueva estructura con imports correctos a `router/AppRouter` y `features/auth/context/AuthContext`.

**Justificación**: Sin esto, la aplicación no arranca. Es el paso final que une todo.

---

## 3. Frontend Store — React

### Problemas a corregir

| # | Problema | Impacto |
|---|----------|---------|
| P8 | Los 3 repositorios del parcial anterior están combinados en uno solo | Código mezclado sin separación clara entre proyectos |
| P9 | El `AppRouter` está inline dentro de `App.tsx` | Igual que P6 en admin |
| P10 | No hay estructura de features | Igual que P5 en admin |
| P11 | La protección de rutas no está encapsulada (cada página verifica auth manualmente) | Código duplicado en cada página, propenso a errores si se olvida verificar |
| P12 | El estado de autenticación usa React Context (`AuthContext`) en lugar de Zustand | Inconsistencia: el carrito usa Zustand pero auth usa Context. Además, Context causa rerenders en todo el árbol |

### Estructura destino

```
frontend-store/src/
├── api/
│   ├── axiosInstance.ts           ← Axios con baseURL, withCredentials
│   ├── auth.ts                    ← login, logout, getMe
│   ├── productos.ts
│   ├── categorias.ts
│   ├── direcciones.ts
│   ├── formasPago.ts
│   └── pedidos.ts
├── components/
│   ├── CartItem.tsx
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   ├── ProductCard.tsx
│   ├── ProtectedRoute.tsx         ← NUEVO: layout de guardia
│   └── RoleGuard.tsx              ← NUEVO: guardia por rol (opcional)
├── features/
│   ├── auth/
│   │   ├── store/                 ← authStore (Zustand)
│   │   │   └── authStore.ts
│   │   └── pages/
│   │       ├── LoginPage.tsx
│   │       └── RegisterPage.tsx
│   ├── carrito/
│   │   ├── components/
│   │   │   ├── CartItem.tsx       ← (mover de src/components/)
│   │   │   └── CartSummary.tsx
│   │   ├── store/
│   │   │   └── cartStore.ts       ← (mover de src/store/)
│   │   └── pages/
│   │       └── CartPage.tsx
│   ├── home/
│   │   ├── components/
│   │   │   ├── HeroBanner.tsx
│   │   │   └── ProductGrid.tsx
│   │   ├── pages/
│   │   │   └── HomePage.tsx
│   │   └── hooks/
│   │       └── useProducts.ts
│   └── pedidos/
│       ├── components/
│       │   └── OrderHistory.tsx
│       ├── pages/
│       │   └── OrdersPage.tsx
│       └── hooks/
│           └── usePedidos.ts
├── layouts/
│   └── StoreLayout.tsx            ← NUEVO: Navbar + <Outlet /> + Footer
├── router/
│   ├── AppRouter.tsx              ← Definición de rutas
│   └── routes.ts                  ← Constantes de rutas
├── types/
│   └── index.ts                   ← Interfaces globales
├── App.tsx                        ← Solo providers
├── main.tsx                       ← Entry point
└── index.css                      ← Tailwind + design system
```

### Pasos

#### Paso FS.1 — Migrar tipos globales a `types/index.ts`

**Archivos afectados**: `store-frontend/src/types/index.ts` → `ROST_V2/frontend-store/src/types/index.ts`

**Tarea**: Copiar el archivo de tipos. Verificar que todas las interfaces (Producto, Categoria, Ingrediente, Pedido, Direccion, UsuarioAuth, etc.) estén completas.

**Justificación**: Los tipos son la base de todo el frontend. Deben estar definidos antes que cualquier componente o servicio.

---

#### Paso FS.2 — Migrar API layer a `api/`

**Archivos afectados**:
- `store-frontend/src/api/axiosInstance.ts` → `ROST_V2/frontend-store/src/api/axiosInstance.ts`
- Crear nuevos archivos API por recurso si no existen: `auth.ts`, `productos.ts`, `categorias.ts`, `direcciones.ts`, `formasPago.ts`, `pedidos.ts`

**Tarea**: Copiar `axiosInstance.ts` y crear módulos API separados para cada recurso, siguiendo el mismo patrón del frontend admin (funciones exportadas por recurso).

**Justificación**: Centralizar las llamadas HTTP permite cambiar la implementación (ej: de axios a fetch) en un solo lugar.

---

#### Paso FS.3 — Migrar `cartStore` a `features/carrito/store/cartStore.ts`

**Archivos afectados**:
- `store-frontend/src/store/cartStore.ts` → `ROST_V2/frontend-store/src/features/carrito/store/cartStore.ts`

**Tarea**: Mover el store de Zustand del carrito a su feature. Mantener la persistencia en localStorage y la misma API pública.

**Justificación**: El carrito es un feature de dominio, no una carpeta `store/` genérica.

---

#### Paso FS.4 — Crear `authStore` con Zustand (reemplazar AuthContext)

**Archivos afectados**:
- `ROST_V2/frontend-store/src/features/auth/store/authStore.ts` (nuevo)
- `store-frontend/src/context/AuthContext.tsx` → se elimina/refactoriza

**Tarea**: Crear un store Zustand para la autenticación con el siguiente estado y acciones:
```typescript
interface AuthState {
  usuario: UsuarioAuth | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  hasRole: (rol: string) => boolean;
}
```

**Justificación**: Elimina P12. Usar Zustand para auth tiene tres ventajas:
1. **Consistencia**: el carrito ya usa Zustand, ahora ambos usan el mismo patrón.
2. **Rendimiento**: los selectores de Zustand (`useAuthStore(s => s.usuario)`) evitan rerenders en componentes que no usan auth.
3. **Simplicidad**: no necesita `Provider`, se usa directamente con `useAuthStore()`.

---

#### Paso FS.5 — Crear `ProtectedRoute` como componente reutilizable

**Archivos afectados**:
- `ROST_V2/frontend-store/src/components/ProtectedRoute.tsx` (nuevo)

**Tarea**: Implementar un componente `ProtectedRoute` que:
- Use `useAuthStore` para obtener `usuario` e `isLoading`
- Mientras carga: muestre un spinner o "Cargando..."
- Si no hay sesión: redirija a `/login` con `Navigate` de react-router
- Si hay sesión: renderice `<Outlet />`

Opcional: crear `RoleGuard` como variante que además verifique roles específicos.

**Justificación**: Elimina P11. Cada página actualmente repite la verificación manual de `usuario`. Con `ProtectedRoute` como layout, todas las rutas protegidas heredan la guardia automáticamente.

---

#### Paso FS.6 — Crear `StoreLayout` con Navbar + Outlet + Footer

**Archivos afectados**:
- `ROST_V2/frontend-store/src/layouts/StoreLayout.tsx` (nuevo)

**Tarea**: Crear un layout que renderice `<Navbar />`, luego `<Outlet />`, luego `<Footer />`. Este layout se usará como element de una ruta padre, y todas las rutas hijas heredarán la estructura sin repetir código.

**Justificación**: Elimina el problema de Navbar/Footer repetidos. Actualmente en `App.tsx` cada ruta envuelve su página con `<Navbar/>` y `<Footer/>`. Con un layout, se definen una sola vez y React Router se encarga de mantenerlos montados al navegar entre rutas hijas, evitando rerenders innecesarios.

---

#### Paso FS.7 — Migrar páginas planas a `features/*/pages/`

**Archivos afectados** (origen → destino):
| Origen | Destino |
|--------|---------|
| `pages/HomePage.tsx` | `features/home/pages/HomePage.tsx` |
| `pages/CartPage.tsx` | `features/carrito/pages/CartPage.tsx` |
| `pages/OrdersPage.tsx` | `features/pedidos/pages/OrdersPage.tsx` |
| `pages/LoginPage.tsx` | `features/auth/pages/LoginPage.tsx` |
| `pages/RegisterPage.tsx` | `features/auth/pages/RegisterPage.tsx` |
| `pages/ProfilePage.tsx` | `features/usuario/pages/ProfilePage.tsx` (si se crea feature) |
| `pages/DireccionesPage.tsx` | `features/direccion/pages/DireccionesPage.tsx` (si se crea feature) |

**Tarea**: Para cada página:
1. Mover el archivo a su feature
2. Actualizar importaciones (tipos, stores, API, componentes compartidos)
3. Eliminar el ya no necesario `isLoading` o `!usuario` checks manuales en páginas protegidas (ahora lo maneja `ProtectedRoute` en el layout)
4. Eliminar los wrappers de `<Navbar/>` y `<Footer/>` dentro de cada página (ahora lo maneja `StoreLayout`)

**Justificación**: Elimina P10. Pages organizadas por dominio.

---

#### Paso FS.8 — Extraer componentes y hooks por feature

**Archivos afectados**: Dentro de cada feature (`features/*/components/`, `features/*/hooks/`)

**Tarea**: Siguiendo el mismo criterio que en admin (FA.4), extraer de las páginas:
- Componentes reutilizables → `features/*/components/`
- Lógica de TanStack Query → `features/*/hooks/`

Del análisis del código fuente:
- `CartPage.tsx` tiene lógica de items → extraer `CartSummary.tsx`
- `HomePage.tsx` tiene lógica de productos y categorías → extraer hooks `useProducts`, `useCategories`
- `OrdersPage.tsx` tiene lógica de pedidos → extraer `usePedidos`
- Components compartidos (ProductCard, CartItem, Footer, Navbar) se mantienen en `components/` global porque son usados por múltiples features

**Justificación**: Separa responsabilidades y permite reutilizar lógica entre componentes del mismo feature.

---

#### Paso FS.9 — Crear `router/AppRouter.tsx`

**Archivos afectados**:
- `ROST_V2/frontend-store/src/router/AppRouter.tsx` (nuevo)
- `ROST_V2/frontend-store/src/App.tsx` (simplificar)

**Tarea**: Extraer la configuración de rutas de `App.tsx` a `router/AppRouter.tsx`. El árbol de rutas refactorizado debe usar:
- `StoreLayout` para las rutas que necesitan Navbar + Footer
- `ProtectedRoute` para las rutas que requieren autenticación

**Estructura de rutas refactorizada**:
```tsx
<Routes>
  {/* Rutas públicas sin layout */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />

  {/* Rutas con layout compartido (Navbar + Footer) */}
  <Route element={<StoreLayout />}>
    <Route path="/" element={<HomePage />} />

    {/* Rutas que requieren autenticación */}
    <Route element={<ProtectedRoute />}>
      <Route path="/carrito" element={<CartPage />} />
      <Route path="/mis-pedidos" element={<OrdersPage />} />
      <Route path="/direcciones" element={<DireccionesPage />} />
      <Route path="/perfil" element={<ProfilePage />} />
    </Route>
  </Route>

  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

**Justificación**: Elimina P9. El router vive en su propio archivo y `App.tsx` solo contiene providers. Adicionalmente, el uso de layouts elimina la repetición de Navbar/Footer.

---

#### Paso FS.10 — Simplificar `App.tsx` y configurar entry point

**Archivos afectados**:
- `ROST_V2/frontend-store/src/main.tsx` (actualizar)
- `ROST_V2/frontend-store/src/App.tsx` (reescribir)

**Tarea**: Configurar `App.tsx` como contenedor de providers:
```tsx
<QueryClientProvider client={queryClient}>
  <BrowserRouter>
    <AppRouter />
  </BrowserRouter>
</QueryClientProvider>
```

Notar que **no se necesita `AuthProvider`** porque el estado de auth ahora vive en Zustand (`useAuthStore`) y no requiere un Provider en el árbol.

**Justificación**: Sin esto la app no arranca. Es el paso final que une todos los módulos.

---

## 4. Orden de Implementación Global

### Principios

1. **Backend primero**: Ambos frontends dependen de la API. Tener el backend funcionando permite probar los frontends contra datos reales.
2. **Frontend Admin antes que Store**: El admin tiene menos features y es más simple. Sirve como ensayo para la migración más compleja del store.
3. **Dentro de cada proyecto, primero lo fundamental (tipos → API → stores → features → router → App)**: Cada capa depende de la anterior.

### Secuencia global

```
Fase 0 — Preparación
─────────────────────
  0.1  Instalar dependencias en ROST_V2/ (pnpm install en frontends, pip install en backend)
  0.2  Verificar que los archivos .env, requirements.txt, package.json están completos
  0.3  Confirmar que la base de datos PostgreSQL está accesible

Fase 1 — Backend (ROST_V2/backend/)
────────────────────────────────────
  1.1  B.1 — BaseRepository en core/repository.py
  1.2  B.2 — Migrar modelos a features/
  1.3  B.3 — Migrar schemas a features/
  1.4  B.4 — Repositorios concretos por feature
  1.5  B.5 — Refactorizar servicios (UoW + repositorios)
  1.6  B.6 — Migrar routers a features/
  1.7  B.7 — main.py, core, db (copia directa con ajustes de imports)
  1.8  B.8 — Features restantes (producto, pedido, ingrediente, etc.)
  1.9  [VERIFICAR] La API arranca con uvicorn y responde endpoints

Fase 2 — Frontend Admin (ROST_V2/frontend-admin/)
──────────────────────────────────────────────────
  2.1  FA.6 — Migrar API layer (api/)
  2.2  FA.2 — Migrar AuthContext a features/auth/context/
  2.3  FA.1 — Refactorizar ProtectedRoute como layout
  2.4  FA.3 — Migrar páginas a features/*/pages/
  2.5  FA.4 — Extraer componentes y hooks por feature
  2.6  FA.5 — Crear router/AppRouter.tsx
  2.7  FA.7 — Simplificar App.tsx y main.tsx
  2.8  [VERIFICAR] La app compila con pnpm build y navega correctamente

Fase 3 — Frontend Store (ROST_V2/frontend-store/)
──────────────────────────────────────────────────
  3.1  FS.1 — Migrar tipos globales (types/index.ts)
  3.2  FS.2 — Migrar API layer (api/)
  3.3  FS.3 — Migrar cartStore a features/carrito/store/
  3.4  FS.4 — Crear authStore con Zustand
  3.5  FS.5 — Crear ProtectedRoute
  3.6  FS.6 — Crear StoreLayout (Navbar + Outlet + Footer)
  3.7  FS.7 — Migrar páginas a features/*/pages/
  3.8  FS.8 — Extraer componentes y hooks por feature
  3.9  FS.9 — Crear router/AppRouter.tsx
  3.10 FS.10 — Simplificar App.tsx y main.tsx
  3.11 [VERIFICAR] La app compila y navega correctamente

Fase 4 — Integración y verificación
────────────────────────────────────
  4.1  Verificar que admin se comunica con backend (login, CRUD productos)
  4.2  Verificar que store se comunica con backend (login, home, carrito, pedidos)
  4.3  Verificar que Navbar/Footer en store no se rerenderizan al navegar entre rutas
  4.4  Verificar que ProtectedRoute en ambos frontends redirige correctamente
  4.5  Verificar que el authStore con Zustand en store funciona (persistencia de sesión)
  4.6  Verificar que el UoW en backend lanza rollback si una operación falla
```

### Mapa de dependencias entre proyectos

```
Backend (Fase 1)
  │
  ├──► Frontend Admin (Fase 2)  ─── Depende de: API endpoints, CORS
  │
  └──► Frontend Store (Fase 3)  ─── Depende de: API endpoints, auth cookie
```

Ambos frontends son independientes entre sí y pueden migrarse en paralelo si se desea, aunque se recomienda hacer admin primero por ser más acotado.

---

## Resumen de problemas corregidos por paso

| Problema | Descripción | Pasos que lo resuelven |
|----------|-------------|------------------------|
| P1 | `session.commit()` manual fuera de UoW | B.5 |
| P2 | ORM queries directas en servicios | B.1, B.4, B.5 |
| P3 | Falta capa Repository | B.1, B.4 |
| P4 | Backend plano sin features | B.2, B.3, B.6, B.7 |
| P5 | Frontend sin features | FA.3, FA.4, FS.7, FS.8 |
| P6 | AppRouter inline en App.tsx | FA.5, FS.9 |
| P7 | ProtectedRoute como wrapper en cada ruta | FA.1, FA.5 |
| P8 | Repos combinados en uno | (Resuelto por la estructura ROST_V2) |
| P9 | (Ídem P6 para store) | FS.9 |
| P10 | (Ídem P5 para store) | FS.7, FS.8 |
| P11 | Protección de rutas no encapsulada | FS.5, FS.9 |
| P12 | Auth en Context en vez de Zustand | FS.4 |

---

*Documento generado el 31 de mayo de 2026 — ROST_V2 Migration Plan v1.0*
