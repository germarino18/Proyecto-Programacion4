from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session
from app.database import get_session
from app.core.uow import UnitOfWork
from app.schemas.unidad_medida import UnidadMedidaCreate, UnidadMedidaRead, UnidadMedidaUpdate
from app.services.unidad_medida_service import UnidadMedidaService

router = APIRouter(prefix="/api/v1/unidades-medida", tags=["Unidades de Medida"])


def get_service(session: Session = Depends(get_session)) -> UnidadMedidaService:
    uow = UnitOfWork(session)
    return UnidadMedidaService(uow)


@router.get("", response_model=List[UnidadMedidaRead])
def listar_unidades(
    tipo: Optional[str] = Query(None, description="Filtrar por tipo"),
    service: UnidadMedidaService = Depends(get_service),
):
    return service.get_all(tipo=tipo)


@router.get("/{id}", response_model=UnidadMedidaRead)
def obtener_unidad(id: int, service: UnidadMedidaService = Depends(get_service)):
    return service.get_by_id(id)


@router.post("", response_model=UnidadMedidaRead, status_code=status.HTTP_201_CREATED)
def crear_unidad(
    data: UnidadMedidaCreate,
    service: UnidadMedidaService = Depends(get_service),
):
    return service.create(data)


@router.patch("/{id}", response_model=UnidadMedidaRead)
def actualizar_unidad(
    id: int,
    data: UnidadMedidaUpdate,
    service: UnidadMedidaService = Depends(get_service),
):
    return service.update(id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_unidad(id: int, service: UnidadMedidaService = Depends(get_service)):
    service.delete(id)
