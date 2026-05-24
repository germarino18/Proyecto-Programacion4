from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime, func
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from app.models.pedido import Pedido


class HistorialEstadoPedido(SQLModel, table=True):
    __tablename__ = "historial_estados_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", nullable=False)
    estado: str = Field(max_length=20, nullable=False)
    cambiado_por: int = Field(nullable=False)
    fecha: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )

    pedido: "Pedido" = Relationship(back_populates="historial")
