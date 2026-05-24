from sqlmodel import SQLModel, Field


class Rol(SQLModel, table=True):
    __tablename__ = "roles"

    codigo: str = Field(primary_key=True, max_length=20)
    descripcion: str = Field(max_length=100)
