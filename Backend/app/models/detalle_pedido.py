from datetime import datetime
from decimal import Decimal
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime, func, DECIMAL, JSON
from typing import TYPE_CHECKING, Any, Dict, Optional

if TYPE_CHECKING:
    from app.models.pedido import Pedido
    from app.models.producto import Producto


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalles_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", nullable=False)
    producto_id: int = Field(foreign_key="productos.id", nullable=False)
    cantidad: int = Field(nullable=False)
    precio_snapshot: Optional[Decimal] = Field(
        default=None, sa_column=Column(DECIMAL(10, 2))
    )
    nombre_snapshot: str = Field(max_length=200, nullable=False)
    personalizacion: Optional[Dict[str, Any]] = Field(
        default=None, sa_column=Column(JSON)
    )
    created_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )

    pedido: "Pedido" = Relationship(back_populates="detalles")
    producto: "Producto" = Relationship(back_populates="detalles_pedido")
