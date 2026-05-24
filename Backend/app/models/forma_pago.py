from sqlmodel import SQLModel, Field
from typing import Optional


class FormaPago(SQLModel, table=True):
    __tablename__ = "formas_pago"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100, nullable=False, unique=True)
