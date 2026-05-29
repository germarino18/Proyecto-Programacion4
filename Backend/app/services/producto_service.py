# services/producto_service.py - Servicio de productos
# Hereda BaseService. Agrega:
# - get_all con filtros: búsqueda textual, categoría, disponibilidad
# - get_by_id con eager loading de relaciones
# - create con inserción de categorías e ingredientes (M:N)
# - update con reemplazo completo de relaciones M:N
# - delete: soft delete (deleted_at)
# - Regla de negocio: si stock = 0, disponible pasa a False

from datetime import datetime, timezone
from typing import List, Optional
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from app.core.uow import UnitOfWork
from app.models.producto import Producto
from app.models.producto_categoria import ProductoCategoria
from app.models.producto_ingrediente import ProductoIngrediente
from app.schemas.producto import ProductoCreate, ProductoUpdate
from app.services.base import BaseService


# Opciones de eager loading reutilizables para producto
_producto_loads = (
    selectinload(Producto.productos_categoria).selectinload(ProductoCategoria.categoria),
    selectinload(Producto.productos_ingredientes).selectinload(ProductoIngrediente.ingrediente),
    selectinload(Producto.productos_ingredientes).selectinload(ProductoIngrediente.unidad_medida),
    selectinload(Producto.unidad_venta),
)


class ProductoService(BaseService[Producto, ProductoCreate, ProductoUpdate]):
    """Servicio de productos. Hereda BaseService y agrega lógica de
    filtros, relaciones M:N, soft delete y regla stock=0 → no disponible."""

    def __init__(self, uow: UnitOfWork):
        super().__init__(uow, Producto)

    def get_all(
        self,
        q: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> List[Producto]:
        """Lista productos activos (sin soft delete) con filtros opcionales.
        Recibe: q (búsqueda por nombre ILIKE), categoria_id, disponible.
        Retorna: lista de Producto con relaciones precargadas (eager loading)."""
        session: Session = self.uow.session
        stmt = (
            select(Producto)
            .where(Producto.deleted_at.is_(None))
            .options(*_producto_loads)
        )
        if q:
            stmt = stmt.where(Producto.nombre.ilike(f"%{q}%"))
        if disponible is not None:
            stmt = stmt.where(Producto.disponible == disponible)
        if categoria_id is not None:
            stmt = stmt.join(ProductoCategoria).where(
                ProductoCategoria.categoria_id == categoria_id
            )
        result = session.exec(stmt).all()
        return list(result)

    def get_by_id(self, id: int) -> Producto:
        """Obtiene un producto activo por ID con relaciones precargadas.
        Lanza: 404 si no existe o está eliminado (soft delete)."""
        session: Session = self.uow.session
        obj = session.exec(
            select(Producto)
            .where(Producto.id == id, Producto.deleted_at.is_(None))
            .options(*_producto_loads)
        ).first()
        if not obj:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Producto not found")
        return obj

    def create(self, schema: ProductoCreate) -> Producto:
        """Crea un producto con sus relaciones (categorías e ingredientes).
        Si stock_cantidad = 0, fuerza disponible = False."""
        session: Session = self.uow.session
        data = schema.model_dump(exclude={"categorias", "ingredientes"}, exclude_unset=False)
        # Si stock es 0, forzar no disponible
        stock = data.get("stock_cantidad", 0)
        if stock is not None and stock == 0:
            data["disponible"] = False
        producto = Producto(**data)
        session.add(producto)
        session.flush()

        if schema.categorias:
            for cat_id in schema.categorias:
                pc = ProductoCategoria(producto_id=producto.id, categoria_id=cat_id)
                session.add(pc)

        if schema.ingredientes:
            for ing_data in schema.ingredientes:
                pi = ProductoIngrediente(
                    producto_id=producto.id,
                    ingrediente_id=ing_data["ingrediente_id"],
                    cantidad=ing_data.get("cantidad"),
                    unidad_medida_id=ing_data["unidad_medida_id"],
                    es_removible=ing_data.get("es_removible", False),
                )
                session.add(pi)

        session.flush()
        session.refresh(producto)
        self.uow.commit()
        return producto

    def update(self, id: int, schema: ProductoUpdate) -> Producto:
        """Actualiza un producto. Reemplaza completamente las relaciones
        de categorías e ingredientes si se envían. Si stock llega a 0,
        fuerza disponible = False."""
        session: Session = self.uow.session
        obj = self.get_by_id(id)

        data = schema.model_dump(exclude={"categorias", "ingredientes"}, exclude_unset=True)
        for key, value in data.items():
            setattr(obj, key, value)
        # Si stock llegó a 0, forzar no disponible
        if "stock_cantidad" in data and data["stock_cantidad"] is not None and data["stock_cantidad"] == 0:
            obj.disponible = False
        obj.updated_at = datetime.now(timezone.utc)
        session.add(obj)
        session.flush()

        if schema.categorias is not None:
            existing = session.exec(
                select(ProductoCategoria).where(ProductoCategoria.producto_id == id)
            ).all()
            for pc in existing:
                session.delete(pc)
            for cat_id in schema.categorias:
                pc = ProductoCategoria(producto_id=id, categoria_id=cat_id)
                session.add(pc)

        if schema.ingredientes is not None:
            existing_ing = session.exec(
                select(ProductoIngrediente).where(ProductoIngrediente.producto_id == id)
            ).all()
            for pi in existing_ing:
                session.delete(pi)
            for ing_data in schema.ingredientes:
                pi = ProductoIngrediente(
                    producto_id=id,
                    ingrediente_id=ing_data["ingrediente_id"],
                    cantidad=ing_data.get("cantidad"),
                    unidad_medida_id=ing_data["unidad_medida_id"],
                    es_removible=ing_data.get("es_removible", False),
                )
                session.add(pi)

        session.flush()
        session.refresh(obj)
        self.uow.commit()
        return obj

    def delete(self, id: int) -> None:
        """Soft delete: marca deleted_at en lugar de eliminar el registro."""
        session: Session = self.uow.session
        obj = self.get_by_id(id)
        obj.deleted_at = datetime.now(timezone.utc)
        session.add(obj)
        session.flush()
        self.uow.commit()
