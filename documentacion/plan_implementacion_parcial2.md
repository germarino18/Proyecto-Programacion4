# Plan de Implementación — Parcial 2
## Programación IV | FastAPI + React (UTN TUP)

> **Fecha de entrega:** 25/05/26  
> **Stack:** FastAPI + PostgreSQL (backend) · React + Zustand + TanStack Query (2 frontends)  
> **Base:** El Parcial 1 (Producto, Categoría, Ingrediente) ya debe estar funcionando.

---

## FASE 1 — BACKEND: Modelos nuevos + Seed

### 1.1 Crear los nuevos modelos SQLModel

Crear los siguientes archivos en `app/models/`:

**`usuario.py`**
```python
class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    email: str = Field(unique=True, max_length=150)
    password_hash: str
    activo: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None
    roles: list["UsuarioRol"] = Relationship(back_populates="usuario")
    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
    direcciones: list["DireccionEntrega"] = Relationship(back_populates="usuario")
```

**`rol.py`**
```python
class Rol(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    codigo: str = Field(unique=True, max_length=20)  # 'ADMIN', 'CLIENT', etc.
    descripcion: Optional[str] = None
    usuario_links: list["UsuarioRol"] = Relationship(back_populates="rol")
```

**`usuario_rol.py`** (tabla N:N)
```python
class UsuarioRol(SQLModel, table=True):
    usuario_id: int = Field(foreign_key="usuario.id", primary_key=True)
    rol_id: int = Field(foreign_key="rol.id", primary_key=True)
    usuario: Optional[Usuario] = Relationship(back_populates="roles")
    rol: Optional[Rol] = Relationship(back_populates="usuario_links")
```

**`forma_pago.py`**
```python
class FormaPago(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=50)
    activo: bool = Field(default=True)
```

**`estado_pedido.py`** (catálogo de estados válidos)
```python
class EstadoPedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    codigo: str = Field(unique=True, max_length=20)
    # Valores: PENDIENTE, CONFIRMADO, EN_PREP, EN_CAMINO, ENTREGADO, CANCELADO
```

**`direccion_entrega.py`**
```python
class DireccionEntrega(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    alias: str = Field(max_length=50)  # "Casa", "Trabajo"
    calle: str
    numero: str
    ciudad: str
    es_principal: bool = Field(default=False)
    deleted_at: Optional[datetime] = None
    usuario: Optional["Usuario"] = Relationship(back_populates="direcciones")
```

**`pedido.py`**
```python
class Pedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    direccion_id: int = Field(foreign_key="direccionentrega.id")
    forma_pago_id: int = Field(foreign_key="formapago.id")
    estado_actual: str = Field(default="PENDIENTE")
    total: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None
    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")
    detalles: list["DetallePedido"] = Relationship(back_populates="pedido")
    historial: list["HistorialEstadoPedido"] = Relationship(back_populates="pedido")
```

**`detalle_pedido.py`** (con Snapshot Pattern)
```python
class DetallePedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(ge=1)
    precio_snapshot: float   # INMUTABLE: copiado al crear el pedido
    nombre_snapshot: str     # INMUTABLE: copiado al crear el pedido
    pedido: Optional["Pedido"] = Relationship(back_populates="detalles")
    producto: Optional["Producto"] = Relationship()
```

**`historial_estado_pedido.py`** (Audit Trail — solo INSERTs, nunca UPDATE/DELETE)
```python
class HistorialEstadoPedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id")
    estado: str
    cambiado_por: int = Field(foreign_key="usuario.id")
    fecha: datetime = Field(default_factory=datetime.utcnow)
    pedido: Optional["Pedido"] = Relationship(back_populates="historial")
```

### 1.2 Registrar todos los modelos en el `__init__.py` de modelos y en la creación de tablas

Asegurarse de que `SQLModel.metadata.create_all(engine)` los incluya.

### 1.3 Crear el Seed obligatorio

Crear `app/db/seed.py`:

```python
from sqlmodel import Session, select
from ..database import engine
from ..models.rol import Rol
from ..models.usuario import Usuario
from ..models.usuario_rol import UsuarioRol
from ..models.forma_pago import FormaPago
from ..models.estado_pedido import EstadoPedido
from ..utils.security import hash_password

def seed():
    with Session(engine) as session:
        # Roles (idempotente: no duplica si ya existen)
        for codigo, desc in [
            ("ADMIN", "Administrador"),
            ("STOCK", "Gestor de Stock"),
            ("PEDIDOS", "Gestor de Pedidos"),
            ("CLIENT", "Cliente"),
        ]:
            if not session.exec(select(Rol).where(Rol.codigo == codigo)).first():
                session.add(Rol(codigo=codigo, descripcion=desc))

        # Formas de pago
        for nombre in ["Efectivo", "Tarjeta de crédito", "Transferencia", "Mercado Pago"]:
            if not session.exec(select(FormaPago).where(FormaPago.nombre == nombre)).first():
                session.add(FormaPago(nombre=nombre))

        # Estados de pedido
        for codigo in ["PENDIENTE", "CONFIRMADO", "EN_PREP", "EN_CAMINO", "ENTREGADO", "CANCELADO"]:
            if not session.exec(select(EstadoPedido).where(EstadoPedido.codigo == codigo)).first():
                session.add(EstadoPedido(codigo=codigo))

        session.commit()

        # Usuario admin por defecto
        if not session.exec(select(Usuario).where(Usuario.email == "admin@store.com")).first():
            admin = Usuario(
                nombre="Admin",
                email="admin@store.com",
                password_hash=hash_password("admin1234")
            )
            session.add(admin)
            session.flush()
            rol_admin = session.exec(select(Rol).where(Rol.codigo == "ADMIN")).first()
            session.add(UsuarioRol(usuario_id=admin.id, rol_id=rol_admin.id))
            session.commit()

        print("Seed completado correctamente.")

if __name__ == "__main__":
    seed()
```

**Ejecutar con:** `python -m app.db.seed`

**Verificar en pgAdmin/DBeaver** que existan las tablas y los datos del seed.

---

## FASE 2 — BACKEND: Autenticación (Auth)

### 2.1 Utilidades de seguridad

Crear `app/utils/security.py`:

```python
import bcrypt
import jwt
from datetime import datetime, timedelta
import os

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey")
ALGORITHM = "HS256"
EXPIRE_MINUTES = 30

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt(rounds=12)).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=EXPIRE_MINUTES)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Token inválido")
```

### 2.2 Repository de Usuario

Crear `app/repositories/usuario_repository.py` extendiendo `BaseRepository`:

```python
class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session: Session):
        super().__init__(Usuario, session)

    def get_by_email(self, email: str) -> Optional[Usuario]:
        return self.session.exec(
            select(Usuario).where(Usuario.email == email)
        ).first()
```

### 2.3 Dependencias de autenticación

Crear `app/dependencies/auth.py`:

```python
def get_current_user(request: Request, session=Depends(get_session)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(401, "No autenticado")
    payload = decode_token(token)
    user_id = int(payload["sub"])
    usuario = session.get(Usuario, user_id)
    if not usuario or not usuario.activo:
        raise HTTPException(401, "Usuario inactivo o no existe")
    return usuario

def require_rol(*roles: str):
    def checker(usuario=Depends(get_current_user)):
        codigos = {ur.rol.codigo for ur in usuario.roles}
        if not codigos.intersection(roles):
            raise HTTPException(403, "Sin permisos para esta acción")
        return usuario
    return checker
```

### 2.4 Router de Auth

Crear `app/routers/auth.py` con los endpoints:

- `POST /api/v1/auth/registro` → registra usuario, asigna rol CLIENT automáticamente, status 201
- `POST /api/v1/auth/login` → verifica credenciales, genera JWT, setea cookie HttpOnly (max_age=1800, samesite="lax")
- `GET /api/v1/auth/me` → devuelve usuario autenticado (requiere `Depends(get_current_user)`)
- `POST /api/v1/auth/logout` → elimina la cookie

**Verificar en `/docs`** que registro y login funcionen y que la cookie `access_token` aparezca en las DevTools del browser.

---

## FASE 3 — BACKEND: RBAC en endpoints existentes + Unit of Work + Repository Pattern

### 3.1 Unit of Work

Crear `app/uow.py`:

```python
from contextlib import contextmanager
from sqlmodel import Session
from .database import engine

class UnitOfWork:
    def __init__(self):
        self.session: Session = Session(engine)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.session.rollback()
        else:
            self.session.commit()
        self.session.close()
```

> **Regla clave:** El Service NUNCA llama a `session.commit()` directamente. Solo el UoW lo hace.

### 3.2 BaseRepository genérico

Crear `app/repositories/base_repository.py`:

```python
class BaseRepository(Generic[T]):
    def __init__(self, model: Type[T], session: Session):
        self.model = model
        self.session = session

    def get_by_id(self, id: int) -> Optional[T]:
        return self.session.get(self.model, id)

    def get_all(self, skip: int = 0, limit: int = 20) -> list[T]:
        return self.session.exec(select(self.model).offset(skip).limit(limit)).all()

    def add(self, obj: T) -> T:
        self.session.add(obj)
        self.session.flush()  # genera el ID sin hacer commit
        self.session.refresh(obj)
        return obj

    def delete(self, obj: T) -> None:
        self.session.delete(obj)
```

> **Importante:** `flush()` aplica el SQL en la transacción actual (para tener el ID disponible como FK) pero no hace commit. El commit lo hace el UoW.

### 3.3 Aplicar RBAC a endpoints del Parcial 1

En los routers de Categoría, Producto, Ingrediente, agregar `Depends(require_rol(...))`:

```python
# Solo ADMIN puede crear/editar/eliminar
@router.post("/", dependencies=[Depends(require_rol("ADMIN"))])
@router.put("/{id}", dependencies=[Depends(require_rol("ADMIN"))])
@router.delete("/{id}", dependencies=[Depends(require_rol("ADMIN"))])

# ADMIN y STOCK pueden cambiar disponibilidad
@router.patch("/{id}/disponibilidad", dependencies=[Depends(require_rol("ADMIN", "STOCK"))])

# Listados son públicos (sin dependencia de auth)
@router.get("/")  # público
```

---

## FASE 4 — BACKEND: Endpoints de Pedidos

### 4.1 Máquina de estados

Definir en `app/services/pedido_service.py`:

```python
TRANSICIONES_VALIDAS = {
    "PENDIENTE": ["CONFIRMADO", "CANCELADO"],
    "CONFIRMADO": ["EN_PREP", "CANCELADO"],
    "EN_PREP": ["EN_CAMINO"],
    "EN_CAMINO": ["ENTREGADO"],
    "ENTREGADO": [],
    "CANCELADO": [],
}
```

- La validación de transición va siempre en el **Service**, nunca en el router.
- Al avanzar estado: actualizar `pedido.estado_actual` Y hacer un INSERT en `HistorialEstadoPedido`.

### 4.2 Crear pedido (transacción atómica con UoW)

```python
def crear_pedido(data: PedidoCreate, user_id: int):
    with UnitOfWork() as uow:
        pedido = Pedido(usuario_id=user_id, ...)
        uow.session.add(pedido)
        uow.session.flush()  # necesitamos pedido.id para los detalles

        for item in data.items:
            producto = uow.session.get(Producto, item.producto_id)
            detalle = DetallePedido(
                pedido_id=pedido.id,
                producto_id=item.producto_id,
                cantidad=item.cantidad,
                precio_snapshot=producto.precio_base,  # SNAPSHOT
                nombre_snapshot=producto.nombre,       # SNAPSHOT
            )
            uow.session.add(detalle)

        # Primer registro del historial
        uow.session.add(HistorialEstadoPedido(
            pedido_id=pedido.id,
            estado="PENDIENTE",
            cambiado_por=user_id
        ))
        # El commit lo hace el UoW al salir del bloque
```

### 4.3 Endpoints del router de Pedidos

Crear `app/routers/pedidos.py` (`/api/v1/pedidos/`):

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| POST | `/` | CLIENT | Crear pedido desde carrito |
| GET | `/` | CLIENT, ADMIN, PEDIDOS | CLIENT ve solo los suyos; ADMIN/PEDIDOS ven todos |
| GET | `/{id}` | CLIENT, ADMIN, PEDIDOS | Detalle con historial |
| PATCH | `/{id}/estado` | ADMIN, PEDIDOS | Avanzar estado (máquina de estados) |
| POST | `/{id}/cancelar` | CLIENT | Cancelar (solo desde PENDIENTE o CONFIRMADO) |

### 4.4 Endpoints de Direcciones de Entrega

Crear `app/routers/direcciones.py` (`/api/v1/direcciones/`):

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar mis direcciones (usuario autenticado) |
| POST | `/` | Crear dirección |
| PUT | `/{id}` | Editar dirección |
| DELETE | `/{id}` | Soft delete |
| PATCH | `/{id}/principal` | Marcar como dirección principal (desactiva la anterior) |

### 4.5 Panel de Admin — Gestión de usuarios

Crear `app/routers/admin.py` (`/api/v1/admin/`):

- `GET /usuarios` → listado paginado con filtro por rol (solo ADMIN). Usar `Annotated` y `Query` para los parámetros de filtro.
- `PUT /usuarios/{id}` → actualizar usuario
- `DELETE /usuarios/{id}` → soft delete
- `POST /usuarios/{id}/roles` → asignar/quitar roles

### 4.6 CORS para dos frontends

En `main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,  # CRÍTICO para que funcionen las cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
```

> **Importante:** Con `allow_credentials=True` no se puede usar `"*"` en `allow_origins`. Deben ser URLs exactas.

---

## FASE 5 — FRONTEND STORE (Zustand + Carrito + TanStack Query)

### 5.1 Crear el proyecto

```bash
npm create vite@latest store-frontend -- --template react-ts
cd store-frontend
npm install axios zustand @tanstack/react-query react-router-dom
```

### 5.2 Estructura de carpetas

```
store-frontend/src/
├── api/
│   └── axiosInstance.ts
├── store/
│   └── cartStore.ts
├── pages/
│   ├── HomePage.tsx
│   ├── CartPage.tsx
│   └── OrdersPage.tsx
├── components/
│   ├── ProductCard.tsx
│   └── CartItem.tsx
├── types/
│   └── index.ts
└── App.tsx
```

### 5.3 Instancia de Axios con interceptores

Crear `src/api/axiosInstance.ts`:

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true, // CRÍTICO: envía la cookie HttpOnly en cada request
});

// Interceptor de request: antes de cada petición
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response: manejo global de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 5.4 Carrito con Zustand + persist

Crear `src/store/cartStore.ts`:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  producto: Producto;
  cantidad: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (producto: Producto) => void;
  removeItem: (productoId: number) => void;
  updateCantidad: (productoId: number, cantidad: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (producto) =>
        set((state) => {
          const existe = state.items.find((i) => i.producto.id === producto.id);
          if (existe) {
            return {
              items: state.items.map((i) =>
                i.producto.id === producto.id
                  ? { ...i, cantidad: i.cantidad + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { producto, cantidad: 1 }] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.producto.id !== id),
        })),
      updateCantidad: (id, cantidad) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.producto.id === id ? { ...i, cantidad } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      total: () =>
        get().items.reduce(
          (acc, item) => acc + item.producto.precio_base * item.cantidad,
          0
        ),
    }),
    { name: "cart-storage" } // key en localStorage
  )
);
```

### 5.5 Rutas en App.tsx

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/mis-pedidos" element={<OrdersPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 5.6 HomePage con useQuery

```typescript
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosInstance";

export default function HomePage() {
  const { data: productos, isLoading } = useQuery({
    queryKey: ["productos"],
    queryFn: () => api.get("/productos").then((r) => r.data),
  });

  if (isLoading) return <div>Cargando productos...</div>;

  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      {productos?.map((p: any) => (
        <ProductCard key={p.id} producto={p} />
      ))}
    </div>
  );
}
```

### 5.7 CartPage con useMutation para crear pedido

```typescript
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import api from "../api/axiosInstance";

export default function CartPage() {
  const { items, total, clearCart } = useCartStore();
  const navigate = useNavigate();

  const crearPedidoMutation = useMutation({
    mutationFn: (pedidoData: any) =>
      api.post("/pedidos", pedidoData).then((r) => r.data),
    onSuccess: () => {
      clearCart();
      navigate("/mis-pedidos");
    },
  });

  const handleConfirmar = () => {
    crearPedidoMutation.mutate({
      items: items.map((i) => ({
        producto_id: i.producto.id,
        cantidad: i.cantidad,
      })),
      direccion_id: 1, // obtener de selector de direcciones
      forma_pago_id: 1, // obtener de selector de formas de pago
    });
  };

  return (
    <div className="p-6">
      {items.map((item) => (
        <CartItem key={item.producto.id} item={item} />
      ))}
      <div className="text-xl font-bold">Total: ${total()}</div>
      <button
        onClick={handleConfirmar}
        disabled={crearPedidoMutation.isPending}
        className="bg-green-600 text-white px-6 py-2 rounded"
      >
        Confirmar Pedido
      </button>
    </div>
  );
}
```

---

## FASE 6 — FRONTEND ADMIN (Auth + RBAC + Rutas Protegidas)

### 6.1 Crear el proyecto (puerto diferente al Store)

```bash
npm create vite@latest admin-frontend -- --template react-ts
cd admin-frontend
npm install axios @tanstack/react-query react-router-dom
```

> Este proyecto corre en el puerto 5174 (o el que asigne Vite). El Store corre en 5173.

### 6.2 Estructura de carpetas

```
admin-frontend/src/
├── api/
│   └── axiosInstance.ts   # misma lógica que el Store, mismo backend
├── context/
│   └── AuthContext.tsx
├── components/
│   └── ProtectedRoute.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── CategoriasPage.tsx   # del Parcial 1
│   ├── ProductosPage.tsx    # del Parcial 1
│   ├── IngredientesPage.tsx # del Parcial 1
│   └── CajeroPedidosPage.tsx # nuevo
└── App.tsx
```

### 6.3 AuthContext

Crear `src/context/AuthContext.tsx`:

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../api/axiosInstance";

interface AuthContextType {
  usuario: any | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (rol: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al montar, verifica si hay sesión activa (cookie válida)
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUsuario(res.data))
      .catch(() => setUsuario(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    await api.post("/auth/login", { username: email, password });
    const { data } = await api.get("/auth/me");
    setUsuario(data);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUsuario(null);
  };

  const hasRole = (rol: string) =>
    usuario?.roles?.some((ur: any) => ur.rol.codigo === rol) ?? false;

  return (
    <AuthContext.Provider value={{ usuario, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
```

### 6.4 ProtectedRoute

Crear `src/components/ProtectedRoute.tsx`:

```typescript
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: React.ReactNode;
  roles?: string[];
}

export function ProtectedRoute({ children, roles }: Props) {
  const { usuario, isLoading } = useAuth();

  if (isLoading) return <div>Cargando...</div>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (roles && !roles.some((r) => usuario.roles?.some((ur: any) => ur.rol.codigo === r))) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <>{children}</>;
}
```

### 6.5 Rutas en App.tsx (Admin)

```typescript
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/categorias" element={<ProtectedRoute roles={["ADMIN"]}><CategoriasPage /></ProtectedRoute>} />
          <Route path="/productos" element={<ProtectedRoute roles={["ADMIN"]}><ProductosPage /></ProtectedRoute>} />
          <Route path="/ingredientes" element={<ProtectedRoute roles={["ADMIN"]}><IngredientesPage /></ProtectedRoute>} />
          <Route path="/pedidos" element={<ProtectedRoute roles={["ADMIN", "PEDIDOS"]}><CajeroPedidosPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

### 6.6 Modo Admin vs Modo Empleado en la UI

En cada página que tiene CRUD (Productos, Categorías, etc.), usar `hasRole` para mostrar/ocultar acciones:

```typescript
function ProductosPage() {
  const { hasRole } = useAuth();
  const esAdmin = hasRole("ADMIN");

  return (
    <div>
      {esAdmin && (
        <button onClick={() => setModalOpen(true)}>+ Nuevo Producto</button>
      )}
      <table>
        {/* ... */}
        <td>
          {esAdmin ? (
            <>
              <button>Editar</button>
              <button>Eliminar</button>
            </>
          ) : (
            <span className="text-gray-400 text-sm">Solo lectura</span>
          )}
        </td>
      </table>
    </div>
  );
}
```

### 6.7 Pantalla del Cajero (CajeroPedidosPage)

```typescript
const SIGUIENTES_ESTADOS: Record<string, string[]> = {
  PENDIENTE: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["EN_PREP", "CANCELADO"],
  EN_PREP: ["EN_CAMINO"],
  EN_CAMINO: ["ENTREGADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

function CajeroPedidosPage() {
  const queryClient = useQueryClient();

  const { data: pedidos } = useQuery({
    queryKey: ["pedidos"],
    queryFn: () => api.get("/pedidos").then((r) => r.data),
    refetchInterval: 30000, // refresca automáticamente cada 30s
  });

  const avanzarMutation = useMutation({
    mutationFn: ({ pedidoId, nuevoEstado }: { pedidoId: number; nuevoEstado: string }) =>
      api.patch(`/pedidos/${pedidoId}/estado`, { nuevo_estado: nuevoEstado }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["pedidos"] }), // invalida la caché
  });

  // ... render
}
```

---

## CHECKLIST FINAL (antes de grabar el video)

### Backend
- [ ] Seed corre sin errores y es idempotente (ejecutarlo 2 veces no duplica datos)
- [ ] Registro y login funcionan en `/docs` (Swagger UI)
- [ ] La cookie `access_token` se setea correctamente (verificar en DevTools → Application → Cookies)
- [ ] Endpoints de pedidos respetan la máquina de estados (probar transición inválida → debe dar 422)
- [ ] Tablas visibles en pgAdmin/DBeaver con datos del seed

### Frontend Store
- [ ] El carrito persiste al recargar la página (verificar en DevTools → Application → Local Storage → `cart-storage`)
- [ ] El catálogo carga productos reales del backend (no mock data)
- [ ] Flujo completo funciona: agregar al carrito → confirmar pedido → ver en "mis pedidos"

### Frontend Admin
- [ ] El login redirige al dashboard correctamente
- [ ] Ruta protegida sin sesión redirige a `/login`
- [ ] Logueado como ADMIN: se ven botones de editar/eliminar
- [ ] Logueado como PEDIDOS: solo ve lista (sin acciones de CRUD)
- [ ] El cajero puede avanzar estados y la lista se actualiza (invalidateQueries)

---

## ERRORES COMUNES Y CÓMO EVITARLOS

| Error | Causa | Solución |
|-------|-------|----------|
| Cookie no llega al backend | Falta `withCredentials: true` en Axios | Agregarlo en la instancia de Axios de ambos frontends |
| CORS error con credentials | `allow_origins="*"` con `allow_credentials=True` | Usar URLs exactas: `["http://localhost:5173", "http://localhost:5174"]` |
| `flush()` vs `commit()` | Commit dentro del service | Usar `flush()` para obtener IDs; el commit lo hace solo el UoW |
| Estado de pedido desincronizado | Actualizar solo `estado_actual` sin registrar en historial | Siempre hacer ambas operaciones en la misma transacción (UoW) |
| `/auth/me` crashea la app al expirar | El 401 no se maneja en el `useEffect` del AuthContext | El `.catch(() => setUsuario(null))` debe estar siempre |

---

## ORDEN DE IMPLEMENTACIÓN RECOMENDADO

```
1. Backend: modelos + seed + verificar en pgAdmin
2. Backend: auth (registro + login + /me) → verificar en /docs
3. Backend: RBAC + aplicar a endpoints del Parcial 1
4. Backend: UoW + Repository + endpoints de pedidos
5. Backend: endpoints de direcciones + admin/usuarios
6. Frontend Store: axiosInstance + cartStore (Zustand) + HomePage
7. Frontend Store: CartPage + flujo de pedido completo
8. Frontend Admin: axiosInstance + AuthContext + LoginPage
9. Frontend Admin: ProtectedRoute + rutas + portar páginas del Parcial 1
10. Frontend Admin: CajeroPedidosPage (cajero)
```

> Siempre backend primero. Cada bloque del backend desbloquea el siguiente del frontend.
