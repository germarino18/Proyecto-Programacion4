from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session
from app.database import get_session
from app.core.uow import UnitOfWork
from app.core.dependencies import require_role
from app.schemas.ingrediente import IngredienteCreate, IngredienteRead, IngredienteUpdate
from app.services.ingrediente_service import IngredienteService

router = APIRouter(prefix="/api/v1/ingredientes", tags=["Ingredientes"])


def get_service(session: Session = Depends(get_session)) -> IngredienteService:
    uow = UnitOfWork(session)
    return IngredienteService(uow)


@router.get("", response_model=List[IngredienteRead])
def listar_ingredientes(
    q: Optional[str] = Query(None, description="Buscar por nombre"),
    es_alergeno: Optional[bool] = Query(None, description="Filtrar por alérgeno"),
    service: IngredienteService = Depends(get_service),
):
    return service.get_all(q=q, es_alergeno=es_alergeno)


@router.get("/{id}", response_model=IngredienteRead)
def obtener_ingrediente(id: int, service: IngredienteService = Depends(get_service)):
    return service.get_by_id(id)


@router.post("", response_model=IngredienteRead, status_code=status.HTTP_201_CREATED)
def crear_ingrediente(
    data: IngredienteCreate,
    service: IngredienteService = Depends(get_service),
    _=Depends(require_role(["ADMIN"])),
):
    return service.create(data)


@router.patch("/{id}", response_model=IngredienteRead)
def actualizar_ingrediente(
    id: int,
    data: IngredienteUpdate,
    service: IngredienteService = Depends(get_service),
    _=Depends(require_role(["ADMIN"])),
):
    return service.update(id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_ingrediente(id: int, service: IngredienteService = Depends(get_service),
    _=Depends(require_role(["ADMIN"])),):
    service.delete(id)
