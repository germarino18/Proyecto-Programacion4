# services/pedido_service.py - Servicio de pedidos
# NO hereda BaseService. Implementa:
# - create: crea pedido con transacción, descuenta stock, calcula total,
#   registra historial de estado inicial (PENDIENTE)
# - avanzar_estado: máquina de estados (PENDIENTE→CONFIRMADO→EN_PREP→EN_CAMINO→ENTREGADO)
# - cancelar_pedido: solo permite cancelar si está PENDIENTE o CONFIRMADO
# - Verifica stock disponible antes de crear el pedido

from typing import List, Optional
from fastapi import HTTPException, status
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from app.core.uow import UnitOfWork
from app.models.pedido import Pedido
from app.models.detalle_pedido import DetallePedido
from app.models.historial_estado_pedido import HistorialEstadoPedido
from app.models.producto import Producto
from app.schemas.pedido import PedidoCreate, PedidoUpdateEstado

TRANSICIONES_VALIDAS = {
    "PENDIENTE": ["CONFIRMADO", "CANCELADO"],
    "CONFIRMADO": ["EN_PREP", "CANCELADO"],
    "EN_PREP": ["EN_CAMINO"],
    "EN_CAMINO": ["ENTREGADO"],
    "ENTREGADO": [],
    "CANCELADO": [],
}

_pedido_loads = (
    selectinload(Pedido.detalles),
    selectinload(Pedido.historial),
)


class PedidoService:
    """Servicio de pedidos. NO hereda BaseService.
    Gestiona: creación con transacción y descuento de stock,
    máquina de estados (avanzar_estado), y cancelación."""

    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def get_all(self, usuario_id: Optional[int] = None) -> List[Pedido]:
        """Lista pedidos. Si usuario_id está presente, filtra por ese usuario.
        Ordena por created_at descendente. Precarga detalles e historial."""
        session: Session = self.uow.session
        stmt = select(Pedido).options(*_pedido_loads)
        if usuario_id is not None:
            stmt = stmt.where(Pedido.usuario_id == usuario_id)
        stmt = stmt.order_by(Pedido.created_at.desc())
        return list(session.exec(stmt).all())

    def get_by_id(self, id: int) -> Pedido:
        """Obtiene pedido por ID con detalles e historial precargados.
        Lanza: 404 si no existe."""
        session: Session = self.uow.session
        pedido = session.exec(
            select(Pedido)
            .where(Pedido.id == id)
            .options(*_pedido_loads)
        ).first()
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
        return pedido

    def create(self, data: PedidoCreate, usuario_id: int) -> Pedido:
        """Crea un pedido con todos sus detalles en una transacción.
        - Crea el pedido con estado PENDIENTE
        - Por cada item: verifica stock, descuenta, crea DetallePedido con snapshot
        - Calcula el total
        - Registra el historial de estado inicial
        Lanza: 404 si producto no existe, 422 si stock insuficiente."""
        session: Session = self.uow.session

        # Crear pedido
        pedido = Pedido(
            usuario_id=usuario_id,
            direccion_entrega_id=data.direccion_entrega_id,
            forma_pago_id=data.forma_pago_id,
            estado_actual="PENDIENTE",
            total=0,
        )
        session.add(pedido)
        session.flush()

        total = 0
        for item in data.items:
            producto = session.get(Producto, item.producto_id)
            if not producto:
                raise HTTPException(
                    status_code=404,
                    detail=f"Producto {item.producto_id} no encontrado",
                )
            if producto.stock_cantidad is not None and item.cantidad > producto.stock_cantidad:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Stock insuficiente para {producto.nombre}: solicitado {item.cantidad}, disponible {producto.stock_cantidad}",
                )

            detalle = DetallePedido(
                pedido_id=pedido.id,
                producto_id=item.producto_id,
                cantidad=item.cantidad,
                precio_snapshot=producto.precio_base,
                nombre_snapshot=producto.nombre,
            )
            session.add(detalle)

            if producto.stock_cantidad is not None:
                producto.stock_cantidad -= item.cantidad
                session.add(producto)

            if producto.precio_base:
                total += float(producto.precio_base) * item.cantidad

        pedido.total = total
        session.add(pedido)
        session.flush()

        # Primer historial
        historial = HistorialEstadoPedido(
            pedido_id=pedido.id,
            estado="PENDIENTE",
            cambiado_por=usuario_id,
        )
        session.add(historial)

        session.flush()
        session.refresh(pedido)
        self.uow.commit()
        return pedido

    def avanzar_estado(
        self, pedido_id: int, nuevo_estado: str, usuario_id: int
    ) -> Pedido:
        """Avanza el estado de un pedido según la máquina de estados.
        Transiciones válidas:
          PENDIENTE → CONFIRMADO, CANCELADO
          CONFIRMADO → EN_PREP, CANCELADO
          EN_PREP → EN_CAMINO
          EN_CAMINO → ENTREGADO
        Registra cada cambio en el historial.
        Lanza: 422 si la transición no es válida."""
        session: Session = self.uow.session
        pedido = session.get(Pedido, pedido_id)
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")

        if nuevo_estado not in TRANSICIONES_VALIDAS.get(pedido.estado_actual, []):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"No se puede pasar de {pedido.estado_actual} a {nuevo_estado}",
            )

        pedido.estado_actual = nuevo_estado
        session.add(pedido)

        historial = HistorialEstadoPedido(
            pedido_id=pedido_id,
            estado=nuevo_estado,
            cambiado_por=usuario_id,
        )
        session.add(historial)

        session.flush()
        session.refresh(pedido)
        self.uow.commit()
        return pedido

    def cancelar_pedido(self, pedido_id: int, usuario_id: int) -> Pedido:
        """Cancela un pedido. Solo permite cancelar si el estado actual
        es PENDIENTE o CONFIRMADO. Verifica que el pedido pertenezca al usuario.
        Lanza: 403 si no es el dueño, 422 si el estado no permite cancelación."""
        session: Session = self.uow.session
        pedido = session.get(Pedido, pedido_id)
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")

        if pedido.usuario_id != usuario_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No puedes cancelar un pedido que no te pertenece",
            )

        if pedido.estado_actual not in ("PENDIENTE", "CONFIRMADO"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"No se puede cancelar un pedido en estado {pedido.estado_actual}",
            )

        pedido.estado_actual = "CANCELADO"
        session.add(pedido)

        historial = HistorialEstadoPedido(
            pedido_id=pedido_id,
            estado="CANCELADO",
            cambiado_por=usuario_id,
        )
        session.add(historial)

        session.flush()
        session.refresh(pedido)
        self.uow.commit()
        return pedido
