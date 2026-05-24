from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session
from app.database import get_session
from app.core.uow import UnitOfWork
from app.schemas.producto import ProductoCreate, ProductoRead, ProductoUpdate
from app.services.producto_service import ProductoService

router = APIRouter(prefix="/api/v1/productos", tags=["Productos"])


def get_service(session: Session = Depends(get_session)) -> ProductoService:
    uow = UnitOfWork(session)
    return ProductoService(uow)


@router.get("", response_model=List[ProductoRead])
def listar_productos(
    q: Optional[str] = Query(None, description="Buscar por nombre"),
    categoria_id: Optional[int] = Query(None, description="Filtrar por categoría"),
    disponible: Optional[bool] = Query(None, description="Filtrar por disponibilidad"),
    service: ProductoService = Depends(get_service),
):
    return service.get_all(q=q, categoria_id=categoria_id, disponible=disponible)


@router.get("/{id}", response_model=ProductoRead)
def obtener_producto(id: int, service: ProductoService = Depends(get_service)):
    return service.get_by_id(id)


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(
    data: ProductoCreate,
    service: ProductoService = Depends(get_service),
):
    return service.create(data)


@router.patch("/{id}", response_model=ProductoRead)
def actualizar_producto(
    id: int,
    data: ProductoUpdate,
    service: ProductoService = Depends(get_service),
):
    return service.update(id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(id: int, service: ProductoService = Depends(get_service)):
    service.delete(id)
