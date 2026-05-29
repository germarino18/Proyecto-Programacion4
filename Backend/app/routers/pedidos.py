from typing import List
from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from app.database import get_session
from app.core.uow import UnitOfWork
from app.core.dependencies import get_current_user, require_role
from app.models.usuario import Usuario
from app.schemas.pedido import PedidoCreate, PedidoRead, PedidoUpdateEstado
from app.services.pedido_service import PedidoService

# routers/pedidos.py - Endpoints de pedidos
# GET   /api/v1/pedidos → Lista pedidos (CLIENT ve solo los suyos, ADMIN/PEDIDOS todos)
# GET   /api/v1/pedidos/{id} → Obtiene pedido (CLIENT solo si es suyo)
# POST  /api/v1/pedidos → Crea pedido (usuario autenticado)
# PATCH /api/v1/pedidos/{id}/estado → Avanza estado (requiere ADMIN o PEDIDOS)
# PATCH /api/v1/pedidos/{id}/cancelar → Cancela pedido (dueño del pedido)

router = APIRouter(prefix="/api/v1/pedidos", tags=["Pedidos"])


def get_service(session: Session = Depends(get_session)) -> PedidoService:
    """Inyecta PedidoService con UnitOfWork."""
    uow = UnitOfWork(session)
    return PedidoService(uow)


@router.get("", response_model=List[PedidoRead])
def listar_pedidos(
    current_user: Usuario = Depends(get_current_user),
    service: PedidoService = Depends(get_service),
    session: Session = Depends(get_session),
):
    """GET /api/v1/pedidos - Lista pedidos.
    CLIENT: solo sus pedidos. ADMIN/PEDIDOS: todos los pedidos."""
    # CLIENT ve solo sus pedidos; ADMIN/PEDIDOS ven todos
    from app.models.usuario_rol import UsuarioRol
    from sqlmodel import select
    user_roles = session.exec(
        select(UsuarioRol).where(UsuarioRol.usuario_id == current_user.id)
    ).all()
    role_codes = [ur.rol_codigo for ur in user_roles]
    if "ADMIN" in role_codes or "PEDIDOS" in role_codes:
        return service.get_all()
    return service.get_all(usuario_id=current_user.id)


@router.get("/{id}", response_model=PedidoRead)
def obtener_pedido(
    id: int,
    current_user: Usuario = Depends(get_current_user),
    service: PedidoService = Depends(get_service),
    session: Session = Depends(get_session),
):
    """GET /api/v1/pedidos/{id} - Obtiene pedido por ID.
    CLIENT: solo si es suyo. ADMIN/PEDIDOS: cualquier pedido."""
    pedido = service.get_by_id(id)
    # Verificar que el CLIENT solo vea sus pedidos
    from app.models.usuario_rol import UsuarioRol
    from sqlmodel import select
    user_roles = session.exec(
        select(UsuarioRol).where(UsuarioRol.usuario_id == current_user.id)
    ).all()
    role_codes = [ur.rol_codigo for ur in user_roles]
    if "ADMIN" not in role_codes and "PEDIDOS" not in role_codes:
        if pedido.usuario_id != current_user.id:
            from fastapi import HTTPException
            raise HTTPException(status_code=403, detail="No tienes acceso a este pedido")
    return pedido


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: PedidoCreate,
    current_user: Usuario = Depends(get_current_user),
    service: PedidoService = Depends(get_service),
):
    """POST /api/v1/pedidos - Crea un nuevo pedido (usuario autenticado).
    Recibe: items con producto_id y cantidad, más dirección y forma de pago.
    Descuenta stock automáticamente."""


@router.patch("/{id}/estado", response_model=PedidoRead)
def cambiar_estado(
    id: int,
    data: PedidoUpdateEstado,
    current_user: Usuario = Depends(get_current_user),
    service: PedidoService = Depends(get_service),
    _=Depends(require_role(["ADMIN", "PEDIDOS"])),
):
    """PATCH /api/v1/pedidos/{id}/estado - Avanza el estado del pedido.
    Requiere: ADMIN o PEDIDOS. Sigue la máquina de estados definida."""


@router.patch("/{id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    id: int,
    current_user: Usuario = Depends(get_current_user),
    service: PedidoService = Depends(get_service),
):
    """PATCH /api/v1/pedidos/{id}/cancelar - Cancela un pedido.
    Solo el dueño puede cancelar, y solo si está PENDIENTE o CONFIRMADO."""
