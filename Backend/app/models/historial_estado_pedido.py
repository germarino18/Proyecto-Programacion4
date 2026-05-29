# models/historial_estado_pedido.py - Modelo de la tabla "historial_estados_pedido"
# Tabla append-only (sólo inserción) que registra cada cambio de estado
# de un pedido, incluyendo quién lo cambió y cuándo. Trazabilidad completa.

from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime, func
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from app.models.pedido import Pedido


class HistorialEstadoPedido(SQLModel, table=True):
    """Registro append-only de cambios de estado de un pedido.
    Cada entrada guarda el estado nuevo, quién lo cambió (cambiado_por)
    y la fecha. Trazabilidad completa del ciclo de vida del pedido."""
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
