from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session
from app.database import get_session
from app.core.uow import UnitOfWork
from app.core.dependencies import require_role
from app.schemas.categoria import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.services.categoria_service import CategoriaService

# routers/categorias.py - Endpoints CRUD de categorías
# GET   /api/v1/categorias → Lista categorías (público, filtros: q, parent_id)
# GET   /api/v1/categorias/{id} → Obtiene categoría por ID (público)
# POST  /api/v1/categorias → Crea categoría (requiere ADMIN)
# PATCH /api/v1/categorias/{id} → Actualiza categoría (requiere ADMIN)
# DELETE /api/v1/categorias/{id} → Soft delete (requiere ADMIN)

router = APIRouter(prefix="/api/v1/categorias", tags=["Categorías"])


def get_service(session: Session = Depends(get_session)) -> CategoriaService:
    """Inyecta CategoriaService con UnitOfWork."""
    uow = UnitOfWork(session)
    return CategoriaService(uow)


@router.get("", response_model=List[CategoriaRead])
def listar_categorias(
    q: Optional[str] = Query(None, description="Buscar por nombre"),
    parent_id: Optional[int] = Query(None, description="Filtrar por categoría padre"),
    service: CategoriaService = Depends(get_service),
):
    """GET /api/v1/categorias - Lista categorías activas (público).
    Filtros: q (nombre), parent_id (categoría padre)."""


@router.get("/{id}", response_model=CategoriaRead)
def obtener_categoria(id: int, service: CategoriaService = Depends(get_service)):
    """GET /api/v1/categorias/{id} - Obtiene categoría por ID (público)."""


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(
    data: CategoriaCreate,
    service: CategoriaService = Depends(get_service),
    _=Depends(require_role(["ADMIN"])),
):
    """POST /api/v1/categorias - Crea una nueva categoría.
    Requiere: rol ADMIN. Acepta parent_id para jerarquía."""


@router.patch("/{id}", response_model=CategoriaRead)
def actualizar_categoria(
    id: int,
    data: CategoriaUpdate,
    service: CategoriaService = Depends(get_service),
    _=Depends(require_role(["ADMIN"])),
):
    """PATCH /api/v1/categorias/{id} - Actualiza parcialmente una categoría.
    Requiere: rol ADMIN."""


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(id: int, service: CategoriaService = Depends(get_service),
    _=Depends(require_role(["ADMIN"])),):
    """DELETE /api/v1/categorias/{id} - Soft delete de categoría.
    Requiere: rol ADMIN."""
