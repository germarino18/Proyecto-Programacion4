from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime, func
from typing import TYPE_CHECKING, List, Optional

if TYPE_CHECKING:
    from app.models.usuario_rol import UsuarioRol
    from app.models.direccion_entrega import DireccionEntrega
    from app.models.pedido import Pedido


class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(max_length=255, unique=True, nullable=False)
    nombre: str = Field(max_length=100, nullable=False)
    password_hash: str = Field(max_length=255, nullable=False)
    activo: bool = Field(default=True)
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

    roles: List["UsuarioRol"] = Relationship(back_populates="usuario")
    direcciones: List["DireccionEntrega"] = Relationship(back_populates="usuario")
    pedidos: List["Pedido"] = Relationship(back_populates="usuario")
