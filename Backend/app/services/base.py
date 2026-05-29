# services/base.py - Servicio base genérico con operaciones CRUD
# BaseService[ModelType, CreateSchemaType, UpdateSchemaType] implementa:
# - get_all: listar con filtros dinámicos por kwargs
# - get_by_id: obtener por PK, 404 si no existe
# - create: crear desde schema, commitea
# - update: actualizar parcialmente desde schema (exclude_unset)
# - delete: borrado físico directo

from typing import Any, Dict, Generic, List, Optional, Type, TypeVar
from fastapi import HTTPException
from sqlmodel import SQLModel, Session, select
from app.core.uow import UnitOfWork

ModelType = TypeVar("ModelType", bound=SQLModel)
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")


class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """Servicio genérico CRUD para cualquier modelo SQLModel.
    Type params: ModelType (modelo SQLModel), CreateSchemaType, UpdateSchemaType."""

    def __init__(self, uow: UnitOfWork, model: Type[ModelType]):
        self.uow = uow
        self.model = model

    def get_all(self, **filters) -> List[ModelType]:
        """Lista todas las entidades con filtros dinámicos.
        Recibe: kwargs donde clave = nombre del campo, valor = valor a filtrar.
        Los valores None se ignoran (no filtran).
        Retorna: lista de ModelType."""
        stmt = select(self.model)
        for key, value in filters.items():
            if value is not None:
                column = getattr(self.model, key, None)
                if column is not None:
                    stmt = stmt.where(column == value)
        session: Session = self.uow.session
        result = session.exec(stmt).all()
        return list(result)

    def get_by_id(self, id: int) -> ModelType:
        """Obtiene una entidad por su ID.
        Recibe: id (int).
        Retorna: ModelType si existe.
        Lanza: HTTPException 404 si no se encuentra."""
        session: Session = self.uow.session
        obj = session.get(self.model, id)
        if not obj:
            raise HTTPException(status_code=404, detail=f"{self.model.__name__} not found")
        return obj

    def create(self, schema: CreateSchemaType) -> ModelType:
        """Crea una nueva entidad desde el schema.
        Recibe: schema de creación (CreateSchemaType).
        Retorna: la entidad creada (ModelType) después de commit."""

        session: Session = self.uow.session
        data = schema.model_dump() if hasattr(schema, "model_dump") else schema.dict()
        obj = self.model(**data)
        session.add(obj)
        session.flush()
        session.refresh(obj)
        self.uow.commit()
        return obj

    def update(self, id: int, schema: UpdateSchemaType) -> ModelType:
        """Actualiza parcialmente una entidad (solo campos enviados).
        Recibe: id (int), schema de actualización (UpdateSchemaType).
        Retorna: la entidad actualizada después de commit."""

        session: Session = self.uow.session
        obj = self.get_by_id(id)
        data = schema.model_dump(exclude_unset=True) if hasattr(schema, "model_dump") else schema.dict(exclude_unset=True)
        for key, value in data.items():
            setattr(obj, key, value)
        session.add(obj)
        session.flush()
        session.refresh(obj)
        self.uow.commit()
        return obj

    def delete(self, id: int) -> None:
        """Elimina físicamente una entidad por su ID.
        Recibe: id (int).
        Lanza: HTTPException 404 si no existe."""
        session: Session = self.uow.session
        obj = self.get_by_id(id)
        session.delete(obj)
        session.flush()
        self.uow.commit()
