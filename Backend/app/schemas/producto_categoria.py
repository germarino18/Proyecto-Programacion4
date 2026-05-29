# schemas/producto_categoria.py - Schemas para tablas intermedias
# ProductoCategoria*: relación producto ↔ categoría
# ProductoIngrediente*: relación producto ↔ ingrediente (con cantidad y unidad)

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

from app.schemas.categoria import CategoriaRead
from app.schemas.ingrediente import IngredienteRead
from app.schemas.unidad_medida import UnidadMedidaRead


class ProductoCategoriaCreate(BaseModel):
    categoria_id: int
    es_principal: Optional[bool] = False


class ProductoCategoriaUpdate(BaseModel):
    es_principal: Optional[bool] = None


class ProductoCategoriaRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    producto_id: int
    categoria_id: int
    es_principal: Optional[bool] = None
    created_at: Optional[datetime] = None
    categoria: Optional[CategoriaRead] = None


class ProductoIngredienteCreate(BaseModel):
    ingrediente_id: int
    cantidad: Optional[float] = None
    unidad_medida_id: int
    es_removible: Optional[bool] = False


class ProductoIngredienteUpdate(BaseModel):
    cantidad: Optional[float] = None
    unidad_medida_id: Optional[int] = None
    es_removible: Optional[bool] = None


class ProductoIngredienteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    producto_id: int
    ingrediente_id: int
    cantidad: Optional[float] = None
    unidad_medida_id: int
    es_removible: Optional[bool] = None
    created_at: Optional[datetime] = None
    ingrediente: Optional[IngredienteRead] = None
    unidad_medida: Optional[UnidadMedidaRead] = None
