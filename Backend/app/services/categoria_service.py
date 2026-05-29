# services/categoria_service.py - Servicio de categorías
# Hereda BaseService. Agrega:
# - get_all con filtro textual y por categoría padre
# - get_by_id que verifica soft delete
# - delete: soft delete (deleted_at)

from datetime import datetime, timezone
from typing import List, Optional
from sqlmodel import Session, select, or_
from app.core.uow import UnitOfWork
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate
from app.services.base import BaseService


class CategoriaService(BaseService[Categoria, CategoriaCreate, CategoriaUpdate]):
    """Servicio de categorías. Hereda BaseService con filtros y soft delete."""

    def __init__(self, uow: UnitOfWork):
        super().__init__(uow, Categoria)

    def get_all(self, q: Optional[str] = None, parent_id: Optional[int] = None) -> List[Categoria]:
        """Lista categorías activas con filtros opcionales.
        Recibe: q (búsqueda por nombre), parent_id (filtrar por padre)."""
        session: Session = self.uow.session
        stmt = select(Categoria).where(Categoria.deleted_at.is_(None))
        if q:
            stmt = stmt.where(Categoria.nombre.ilike(f"%{q}%"))
        if parent_id is not None:
            stmt = stmt.where(Categoria.parent_id == parent_id)
        result = session.exec(stmt).all()
        return list(result)

    def get_by_id(self, id: int) -> Categoria:
        """Obtiene categoría por ID. Lanza 404 si está eliminada (soft delete)."""
        obj = super().get_by_id(id)
        if obj.deleted_at is not None:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Categoria not found")
        return obj

    def update(self, id: int, schema: CategoriaUpdate) -> Categoria:
        session: Session = self.uow.session
        obj = self.get_by_id(id)
        data = schema.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(obj, key, value)
        obj.updated_at = datetime.now(timezone.utc)
        session.add(obj)
        session.flush()
        session.refresh(obj)
        self.uow.commit()
        return obj

    def delete(self, id: int) -> None:
        """Soft delete: marca deleted_at en lugar de eliminar el registro."""
        session: Session = self.uow.session
        obj = self.get_by_id(id)
        obj.deleted_at = datetime.now(timezone.utc)
        session.add(obj)
        session.flush()
        self.uow.commit()
