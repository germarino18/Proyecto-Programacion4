# services/ingrediente_service.py - Servicio de ingredientes
# Hereda BaseService. Agrega:
# - get_all con filtro textual y por tipo de alérgeno

from typing import List, Optional
from sqlmodel import Session, select
from app.core.uow import UnitOfWork
from app.models.ingrediente import Ingrediente
from app.schemas.ingrediente import IngredienteCreate, IngredienteUpdate
from app.services.base import BaseService


class IngredienteService(BaseService[Ingrediente, IngredienteCreate, IngredienteUpdate]):
    """Servicio de ingredientes. Hereda BaseService con filtro textual y por alérgeno."""

    def __init__(self, uow: UnitOfWork):
        super().__init__(uow, Ingrediente)

    def get_all(
        self, q: Optional[str] = None, es_alergeno: Optional[bool] = None
    ) -> List[Ingrediente]:
        session: Session = self.uow.session
        stmt = select(Ingrediente)
        if q:
            stmt = stmt.where(Ingrediente.nombre.ilike(f"%{q}%"))
        if es_alergeno is not None:
            stmt = stmt.where(Ingrediente.es_alergeno == es_alergeno)
        result = session.exec(stmt).all()
        return list(result)
