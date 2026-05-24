from sqlmodel import SQLModel, Field
from typing import Optional


class EstadoPedido(SQLModel, table=True):
    __tablename__ = "estados_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    codigo: str = Field(max_length=20, nullable=False, unique=True)
