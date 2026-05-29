# models/unidad_medida.py - Modelo de la tabla "unidades_medida"
# Catálogo de unidades de medida (kg, g, L, mL, unidades, etc.)
# con nombre, símbolo y tipo (masa, volumen, unidad, area).
# Se relaciona con productos (unidad de venta) y productos_ingredientes.

from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime, func
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

if TYPE_CHECKING:
    from app.models.producto import Producto
    from app.models.producto_ingrediente import ProductoIngrediente


class UnidadMedida(SQLModel, table=True):
    """Catálogo de unidades de medida (kg, g, L, mL, u, doc, m²).
    Cada unidad tiene nombre, símbolo único y tipo (masa, volumen, unidad, area).
    Relaciones: productos (como unidad de venta) y productos_ingredientes."""
    __tablename__ = "unidades_medida"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=50, unique=True, nullable=False)
    simbolo: str = Field(max_length=10, unique=True, nullable=False)
    tipo: str = Field(max_length=20, nullable=False)
    created_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )

    productos: List["Producto"] = Relationship(back_populates="unidad_venta")
    productos_ingredientes: List["ProductoIngrediente"] = Relationship(
        back_populates="unidad_medida"
    )
