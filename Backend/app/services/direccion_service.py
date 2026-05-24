from typing import List, Optional
from fastapi import HTTPException
from sqlmodel import Session, select
from app.core.uow import UnitOfWork
from app.models.direccion_entrega import DireccionEntrega
from app.schemas.direccion import DireccionCreate, DireccionUpdate


class DireccionService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def get_all(self, usuario_id: int) -> List[DireccionEntrega]:
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
        session: Session = self.uow.session
        direccion = DireccionEntrega(**data.model_dump(), usuario_id=usuario_id)
        session.add(direccion)
        session.flush()
        session.refresh(direccion)
        self.uow.commit()
        return direccion

    def update(self, id: int, data: DireccionUpdate, usuario_id: int) -> DireccionEntrega:
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
        session: Session = self.uow.session
        direccion = self.get_by_id(id, usuario_id)
        from datetime import datetime, timezone
        direccion.deleted_at = datetime.now(timezone.utc)
        session.add(direccion)
        session.flush()
        self.uow.commit()

    def set_principal(self, id: int, usuario_id: int) -> DireccionEntrega:
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
