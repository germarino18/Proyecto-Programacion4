from typing import List
from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from app.database import get_session
from app.core.uow import UnitOfWork
from app.core.dependencies import get_current_user, require_role
from app.models.usuario import Usuario
from app.schemas.pedido import PedidoCreate, PedidoRead, PedidoUpdateEstado
from app.services.pedido_service import PedidoService

router = APIRouter(prefix="/api/v1/pedidos", tags=["Pedidos"])


def get_service(session: Session = Depends(get_session)) -> PedidoService:
    uow = UnitOfWork(session)
    return PedidoService(uow)


@router.get("", response_model=List[PedidoRead])
def listar_pedidos(
    current_user: Usuario = Depends(get_current_user),
    service: PedidoService = Depends(get_service),
    session: Session = Depends(get_session),
):
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
    return service.create(data, usuario_id=current_user.id)


@router.patch("/{id}/estado", response_model=PedidoRead)
def cambiar_estado(
    id: int,
    data: PedidoUpdateEstado,
    current_user: Usuario = Depends(get_current_user),
    service: PedidoService = Depends(get_service),
    _=Depends(require_role(["ADMIN", "PEDIDOS"])),
):
    return service.avanzar_estado(id, data.nuevo_estado, current_user.id)


@router.patch("/{id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    id: int,
    current_user: Usuario = Depends(get_current_user),
    service: PedidoService = Depends(get_service),
):
    return service.cancelar_pedido(id, current_user.id)
