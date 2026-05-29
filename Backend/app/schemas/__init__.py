# schemas/__init__.py - Exporta los schemas Pydantic para validación/serialización
# Cada grupo tiene Create, Update y Read para operaciones CRUD.

from app.schemas.unidad_medida import UnidadMedidaCreate, UnidadMedidaUpdate, UnidadMedidaRead
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate, CategoriaRead
from app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoRead
from app.schemas.ingrediente import IngredienteCreate, IngredienteUpdate, IngredienteRead
from app.schemas.producto_categoria import (
    ProductoCategoriaCreate,
    ProductoCategoriaUpdate,
    ProductoCategoriaRead,
    ProductoIngredienteCreate,
    ProductoIngredienteUpdate,
    ProductoIngredienteRead,
)

__all__ = [
    "UnidadMedidaCreate",
    "UnidadMedidaUpdate",
    "UnidadMedidaRead",
    "CategoriaCreate",
    "CategoriaUpdate",
    "CategoriaRead",
    "ProductoCreate",
    "ProductoUpdate",
    "ProductoRead",
    "IngredienteCreate",
    "IngredienteUpdate",
    "IngredienteRead",
    "ProductoCategoriaCreate",
    "ProductoCategoriaUpdate",
    "ProductoCategoriaRead",
    "ProductoIngredienteCreate",
    "ProductoIngredienteUpdate",
    "ProductoIngredienteRead",
]
