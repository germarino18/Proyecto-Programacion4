from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime, func, DECIMAL, Integer, ARRAY, String, CheckConstraint
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

if TYPE_CHECKING:
    from app.models.unidad_medida import UnidadMedida
    from app.models.producto_categoria import ProductoCategoria
    from app.models.producto_ingrediente import ProductoIngrediente


class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: Optional[int] = Field(default=None, primary_key=True)
    unidad_venta_id: Optional[int] = Field(
        default=None, foreign_key="unidades_medida.id", nullable=True
    )
    nombre: str = Field(max_length=200, nullable=False)
    descripcion: Optional[str] = Field(default=None, max_length=1000)
    precio_base: Optional[Decimal] = Field(
        default=None,
        sa_column=Column(DECIMAL(10, 2), CheckConstraint("precio_base >= 0")),
    )
    imagenes_url: Optional[List[str]] = Field(
        default=None, sa_column=Column(ARRAY(String))
    )
    stock_cantidad: Optional[int] = Field(
        default=0,
        sa_column=Column(Integer, CheckConstraint("stock_cantidad >= 0")),
    )
    disponible: Optional[bool] = Field(default=True)
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
    deleted_at: Optional[datetime] = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True)
    )

    unidad_venta: Optional["UnidadMedida"] = Relationship(
        back_populates="productos"
    )
    productos_categoria: List["ProductoCategoria"] = Relationship(
        back_populates="producto"
    )
    productos_ingredientes: List["ProductoIngrediente"] = Relationship(
        back_populates="producto"
    )
