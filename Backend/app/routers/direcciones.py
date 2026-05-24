from typing import List
from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from app.database import get_session
from app.core.uow import UnitOfWork
from app.core.dependencies import get_current_user
from app.models.usuario import Usuario
from app.schemas.direccion import DireccionCreate, DireccionRead, DireccionUpdate
from app.services.direccion_service import DireccionService

router = APIRouter(prefix="/api/v1/direcciones", tags=["Direcciones"])


def get_service(session: Session = Depends(get_session)) -> DireccionService:
    uow = UnitOfWork(session)
    return DireccionService(uow)


@router.get("", response_model=List[DireccionRead])
def listar_direcciones(
    current_user: Usuario = Depends(get_current_user),
    service: DireccionService = Depends(get_service),
):
    return service.get_all(usuario_id=current_user.id)


@router.get("/{id}", response_model=DireccionRead)
def obtener_direccion(
    id: int,
    current_user: Usuario = Depends(get_current_user),
    service: DireccionService = Depends(get_service),
):
    return service.get_by_id(id, current_user.id)


@router.post("", response_model=DireccionRead, status_code=status.HTTP_201_CREATED)
def crear_direccion(
    data: DireccionCreate,
    current_user: Usuario = Depends(get_current_user),
    service: DireccionService = Depends(get_service),
):
    return service.create(data, current_user.id)


@router.put("/{id}", response_model=DireccionRead)
def actualizar_direccion(
    id: int,
    data: DireccionUpdate,
    current_user: Usuario = Depends(get_current_user),
    service: DireccionService = Depends(get_service),
):
    return service.update(id, data, current_user.id)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_direccion(
    id: int,
    current_user: Usuario = Depends(get_current_user),
    service: DireccionService = Depends(get_service),
):
    service.delete(id, current_user.id)


@router.patch("/{id}/principal", response_model=DireccionRead)
def marcar_principal(
    id: int,
    current_user: Usuario = Depends(get_current_user),
    service: DireccionService = Depends(get_service),
):
    return service.set_principal(id, current_user.id)
