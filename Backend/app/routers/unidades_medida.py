from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session
from app.database import get_session
from app.core.uow import UnitOfWork
from app.schemas.unidad_medida import UnidadMedidaCreate, UnidadMedidaRead, UnidadMedidaUpdate
from app.services.unidad_medida_service import UnidadMedidaService

# routers/unidades_medida.py - Endpoints CRUD de unidades de medida
# GET   /api/v1/unidades-medida → Lista unidades (público, filtro: tipo)
# GET   /api/v1/unidades-medida/{id} → Obtiene unidad por ID (público)
# POST  /api/v1/unidades-medida → Crea unidad (público)
# PATCH /api/v1/unidades-medida/{id} → Actualiza unidad (público)
# DELETE /api/v1/unidades-medida/{id} → Elimina unidad (público)

router = APIRouter(prefix="/api/v1/unidades-medida", tags=["Unidades de Medida"])


def get_service(session: Session = Depends(get_session)) -> UnidadMedidaService:
    """Inyecta UnidadMedidaService con UnitOfWork."""
    uow = UnitOfWork(session)
    return UnidadMedidaService(uow)


@router.get("", response_model=List[UnidadMedidaRead])
def listar_unidades(
    tipo: Optional[str] = Query(None, description="Filtrar por tipo"),
    service: UnidadMedidaService = Depends(get_service),
):
    """GET /api/v1/unidades-medida - Lista unidades de medida (público).
    Filtro: tipo (masa, volumen, unidad, area)."""


@router.get("/{id}", response_model=UnidadMedidaRead)
def obtener_unidad(id: int, service: UnidadMedidaService = Depends(get_service)):
    """GET /api/v1/unidades-medida/{id} - Obtiene unidad por ID (público)."""


@router.post("", response_model=UnidadMedidaRead, status_code=status.HTTP_201_CREATED)
def crear_unidad(
    data: UnidadMedidaCreate,
    service: UnidadMedidaService = Depends(get_service),
):
    """POST /api/v1/unidades-medida - Crea una nueva unidad de medida."""


@router.patch("/{id}", response_model=UnidadMedidaRead)
def actualizar_unidad(
    id: int,
    data: UnidadMedidaUpdate,
    service: UnidadMedidaService = Depends(get_service),
):
    """PATCH /api/v1/unidades-medida/{id} - Actualiza parcialmente una unidad."""


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_unidad(id: int, service: UnidadMedidaService = Depends(get_service)):
    """DELETE /api/v1/unidades-medida/{id} - Elimina una unidad de medida."""
