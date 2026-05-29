# models/estado_pedido.py - Modelo de la tabla "estados_pedido"
# Catálogo de estados posibles de un pedido (PENDIENTE, CONFIRMADO,
# EN_PREP, EN_CAMINO, ENTREGADO, CANCELADO).

from sqlmodel import SQLModel, Field
from typing import Optional


class EstadoPedido(SQLModel, table=True):
    """Catálogo de estados de pedido: PENDIENTE, CONFIRMADO, EN_PREP,
    EN_CAMINO, ENTREGADO, CANCELADO."""
    __tablename__ = "estados_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    codigo: str = Field(max_length=20, nullable=False, unique=True)
