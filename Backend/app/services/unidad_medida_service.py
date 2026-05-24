from typing import List, Optional
from app.core.uow import UnitOfWork
from app.models.unidad_medida import UnidadMedida
from app.schemas.unidad_medida import UnidadMedidaCreate, UnidadMedidaUpdate
from app.services.base import BaseService


class UnidadMedidaService(BaseService[UnidadMedida, UnidadMedidaCreate, UnidadMedidaUpdate]):
    def __init__(self, uow: UnitOfWork):
        super().__init__(uow, UnidadMedida)

    def get_all(self, tipo: Optional[str] = None) -> List[UnidadMedida]:
        return super().get_all(tipo=tipo)
