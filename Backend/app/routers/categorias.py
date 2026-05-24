from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session
from app.database import get_session
from app.core.uow import UnitOfWork
from app.schemas.categoria import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.services.categoria_service import CategoriaService

router = APIRouter(prefix="/api/v1/categorias", tags=["Categorías"])


def get_service(session: Session = Depends(get_session)) -> CategoriaService:
    uow = UnitOfWork(session)
    return CategoriaService(uow)


@router.get("", response_model=List[CategoriaRead])
def listar_categorias(
    q: Optional[str] = Query(None, description="Buscar por nombre"),
    parent_id: Optional[int] = Query(None, description="Filtrar por categoría padre"),
    service: CategoriaService = Depends(get_service),
):
    return service.get_all(q=q, parent_id=parent_id)


@router.get("/{id}", response_model=CategoriaRead)
def obtener_categoria(id: int, service: CategoriaService = Depends(get_service)):
    return service.get_by_id(id)


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(
    data: CategoriaCreate,
    service: CategoriaService = Depends(get_service),
):
    return service.create(data)


@router.patch("/{id}", response_model=CategoriaRead)
def actualizar_categoria(
    id: int,
    data: CategoriaUpdate,
    service: CategoriaService = Depends(get_service),
):
    return service.update(id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(id: int, service: CategoriaService = Depends(get_service)):
    service.delete(id)
