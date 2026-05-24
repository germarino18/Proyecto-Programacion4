from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime, func
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from app.models.producto import Producto
    from app.models.categoria import Categoria


class ProductoCategoria(SQLModel, table=True):
    __tablename__ = "productos_categorias"

    producto_id: Optional[int] = Field(
        default=None, foreign_key="productos.id", primary_key=True
    )
    categoria_id: Optional[int] = Field(
        default=None, foreign_key="categorias.id", primary_key=True
    )
    es_principal: Optional[bool] = Field(default=False)
    created_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )

    producto: "Producto" = Relationship(back_populates="productos_categoria")
    categoria: "Categoria" = Relationship(back_populates="productos_categoria")
