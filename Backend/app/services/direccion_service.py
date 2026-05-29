# services/direccion_service.py - Servicio de direcciones de entrega
# NO hereda BaseService. CRUD completo scoped por usuario (cada operación
# recibe usuario_id para asegurar que solo el dueño accede a sus direcciones).
# Además: set_principal desmarca la dirección principal anterior y marca la nueva.

from typing import List, Optional
from fastapi import HTTPException
from sqlmodel import Session, select
from app.core.uow import UnitOfWork
from app.models.direccion_entrega import DireccionEntrega
from app.schemas.direccion import DireccionCreate, DireccionUpdate


class DireccionService:
    """Servicio de direcciones de entrega. NO hereda BaseService.
    CRUD scoped por usuario: cada operación recibe usuario_id para asegurar
    que el usuario solo acceda/modifique sus propias direcciones."""

    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def get_all(self, usuario_id: int) -> List[DireccionEntrega]:
        """Lista direcciones activas de un usuario, ordenadas: principal primero,
        luego por fecha de creación descendente."""
        session: Session = self.uow.session
        stmt = (
            select(DireccionEntrega)
            .where(
                DireccionEntrega.usuario_id == usuario_id,
                DireccionEntrega.deleted_at.is_(None),
            )
            .order_by(DireccionEntrega.es_principal.desc(), DireccionEntrega.created_at.desc())
        )
        return list(session.exec(stmt).all())

    def get_by_id(self, id: int, usuario_id: int) -> DireccionEntrega:
        """Obtiene dirección por ID, validando que pertenezca al usuario.
        Lanza: 404 si no existe o no pertenece al usuario."""
        session: Session = self.uow.session
        direccion = session.exec(
            select(DireccionEntrega).where(
                DireccionEntrega.id == id,
                DireccionEntrega.usuario_id == usuario_id,
                DireccionEntrega.deleted_at.is_(None),
            )
        ).first()
        if not direccion:
            raise HTTPException(status_code=404, detail="Dirección no encontrada")
        return direccion

    def create(self, data: DireccionCreate, usuario_id: int) -> DireccionEntrega:
        """Crea una nueva dirección para el usuario."""
        session: Session = self.uow.session
        direccion = DireccionEntrega(**data.model_dump(), usuario_id=usuario_id)
        session.add(direccion)
        session.flush()
        session.refresh(direccion)
        self.uow.commit()
        return direccion

    def update(self, id: int, data: DireccionUpdate, usuario_id: int) -> DireccionEntrega:
        """Actualiza parcialmente una dirección, validando propiedad del usuario."""
        session: Session = self.uow.session
        direccion = self.get_by_id(id, usuario_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(direccion, key, value)
        session.add(direccion)
        session.flush()
        session.refresh(direccion)
        self.uow.commit()
        return direccion

    def delete(self, id: int, usuario_id: int) -> None:
        """Soft delete de dirección, validando propiedad del usuario."""
        session: Session = self.uow.session
        direccion = self.get_by_id(id, usuario_id)
        from datetime import datetime, timezone
        direccion.deleted_at = datetime.now(timezone.utc)
        session.add(direccion)
        session.flush()
        self.uow.commit()

    def set_principal(self, id: int, usuario_id: int) -> DireccionEntrega:
        """Marca una dirección como principal.
        Desmarca cualquier otra dirección principal del mismo usuario primero."""
        session: Session = self.uow.session
        # Unset all principal for this user
        session.exec(
            select(DireccionEntrega).where(
                DireccionEntrega.usuario_id == usuario_id,
                DireccionEntrega.es_principal == True,
            )
        ).all()
        # We need to update individually since SQLModel doesn't support bulk update easily
        current_principal = session.exec(
            select(DireccionEntrega).where(
                DireccionEntrega.usuario_id == usuario_id,
                DireccionEntrega.es_principal == True,
                DireccionEntrega.deleted_at.is_(None),
            )
        ).all()
        for addr in current_principal:
            addr.es_principal = False
            session.add(addr)

        direccion = self.get_by_id(id, usuario_id)
        direccion.es_principal = True
        session.add(direccion)
        session.flush()
        session.refresh(direccion)
        self.uow.commit()
        return direccion
