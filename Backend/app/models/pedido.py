# models/pedido.py - Modelo de la tabla "pedidos"
# Representa un pedido realizado por un usuario. Contiene FK a usuario,
# dirección de entrega, forma de pago, y el estado actual del pedido.
# Se relaciona con detalles (líneas del pedido) e historial de cambios de estado.

from datetime import datetime
from decimal import Decimal
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime, func, DECIMAL
from typing import TYPE_CHECKING, List, Optional

if TYPE_CHECKING:
    from app.models.usuario import Usuario
    from app.models.direccion_entrega import DireccionEntrega
    from app.models.forma_pago import FormaPago
    from app.models.detalle_pedido import DetallePedido
    from app.models.historial_estado_pedido import HistorialEstadoPedido


class Pedido(SQLModel, table=True):
    """Tabla pedidos: cabecera del pedido. FK a usuario, dirección de entrega
    y forma de pago. Contiene el estado actual y el total calculado.
    Relaciones: detalles (líneas del pedido), historial (cambios de estado)."""
    __tablename__ = "pedidos"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id", nullable=False)
    direccion_entrega_id: Optional[int] = Field(
        default=None, foreign_key="direcciones_entrega.id", nullable=True
    )
    forma_pago_id: Optional[int] = Field(
        default=None, foreign_key="formas_pago.id", nullable=True
    )
    estado_actual: str = Field(max_length=20, nullable=False)
    total: Optional[Decimal] = Field(
        default=None, sa_column=Column(DECIMAL(12, 2))
    )
    created_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
        ),
    )

    usuario: "Usuario" = Relationship(back_populates="pedidos")
    direccion_entrega: "DireccionEntrega" = Relationship()
    forma_pago: "FormaPago" = Relationship()
    detalles: List["DetallePedido"] = Relationship(back_populates="pedido")
    historial: List["HistorialEstadoPedido"] = Relationship(back_populates="pedido")
