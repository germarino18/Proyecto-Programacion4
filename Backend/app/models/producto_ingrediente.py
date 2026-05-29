# models/producto_ingrediente.py - Modelo de la tabla "productos_ingredientes"
# Tabla intermedia para la relación M:N entre productos e ingredientes.
# PK compuesta: producto_id + ingrediente_id. Incluye cantidad, unidad de medida
# y flag es_removible (si el ingrediente puede quitarse del producto).

from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime, func, DECIMAL, CheckConstraint
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from app.models.producto import Producto
    from app.models.ingrediente import Ingrediente
    from app.models.unidad_medida import UnidadMedida


class ProductoIngrediente(SQLModel, table=True):
    """Tabla intermedia productos_ingredientes (M:N entre productos e ingredientes).
    PK compuesta: producto_id + ingrediente_id. Incluye cantidad, unidad_medida_id
    y flag es_removible para indicar si el ingrediente puede quitarse."""
    __tablename__ = "productos_ingredientes"

    producto_id: Optional[int] = Field(
        default=None, foreign_key="productos.id", primary_key=True
    )
    ingrediente_id: Optional[int] = Field(
        default=None, foreign_key="ingredientes.id", primary_key=True
    )
    cantidad: Optional[Decimal] = Field(
        default=None,
        sa_column=Column(DECIMAL(10, 3), CheckConstraint("cantidad > 0")),
    )
    unidad_medida_id: int = Field(foreign_key="unidades_medida.id", nullable=False)
    es_removible: Optional[bool] = Field(default=False)
    created_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )

    producto: "Producto" = Relationship(back_populates="productos_ingredientes")
    ingrediente: "Ingrediente" = Relationship(back_populates="productos_ingredientes")
    unidad_medida: "UnidadMedida" = Relationship(
        back_populates="productos_ingredientes"
    )
