from sqlmodel import Session, select
from app.core.security import hash_password
from app.models.unidad_medida import UnidadMedida
from app.models.categoria import Categoria
from app.models.ingrediente import Ingrediente
from app.models.producto import Producto
from app.models.producto_categoria import ProductoCategoria
from app.models.producto_ingrediente import ProductoIngrediente
from app.models.rol import Rol
from app.models.usuario import Usuario
from app.models.usuario_rol import UsuarioRol
from app.models.forma_pago import FormaPago
from app.models.estado_pedido import EstadoPedido


def _seed_unidades_medida(session: Session):
    if session.exec(select(UnidadMedida).limit(1)).first():
        return
    items = [
        UnidadMedida(nombre="kilogramo", simbolo="kg", tipo="masa"),
        UnidadMedida(nombre="gramo", simbolo="g", tipo="masa"),
        UnidadMedida(nombre="litro", simbolo="L", tipo="volumen"),
        UnidadMedida(nombre="mililitro", simbolo="mL", tipo="volumen"),
        UnidadMedida(nombre="pieza", simbolo="u", tipo="unidad"),
        UnidadMedida(nombre="docena", simbolo="doc", tipo="unidad"),
        UnidadMedida(nombre="metro cuadrado", simbolo="m²", tipo="area"),
    ]
    session.add_all(items)
    session.flush()


def _seed_categorias(session: Session):
    if session.exec(select(Categoria).limit(1)).first():
        return
    items = [
        Categoria(nombre="Bebidas", descripcion="Bebidas en general"),
        Categoria(nombre="Lácteos", descripcion="Productos lácteos"),
        Categoria(nombre="Panadería", descripcion="Pan y productos de panadería"),
    ]
    session.add_all(items)
    session.flush()


def _seed_ingredientes(session: Session):
    if session.exec(select(Ingrediente).limit(1)).first():
        return
    items = [
        Ingrediente(nombre="Harina", descripcion="Harina de trigo"),
        Ingrediente(nombre="Azúcar", descripcion="Azúcar refinada"),
        Ingrediente(nombre="Leche", descripcion="Leche entera"),
        Ingrediente(nombre="Huevo", descripcion="Huevo de gallina", es_alergeno=True),
        Ingrediente(nombre="Sal", descripcion="Sal fina"),
        Ingrediente(nombre="Mantequilla", descripcion="Mantequilla sin sal"),
    ]
    session.add_all(items)
    session.flush()


def _seed_productos(session: Session):
    if session.exec(select(Producto).limit(1)).first():
        return
    kg = session.exec(select(UnidadMedida).where(UnidadMedida.simbolo == "kg")).first()
    l = session.exec(select(UnidadMedida).where(UnidadMedida.simbolo == "L")).first()
    u = session.exec(select(UnidadMedida).where(UnidadMedida.simbolo == "u")).first()
    g = session.exec(select(UnidadMedida).where(UnidadMedida.simbolo == "g")).first()
    panaderia = session.exec(select(Categoria).where(Categoria.nombre == "Panadería")).first()
    lacteos = session.exec(select(Categoria).where(Categoria.nombre == "Lácteos")).first()
    harina = session.exec(select(Ingrediente).where(Ingrediente.nombre == "Harina")).first()
    azucar = session.exec(select(Ingrediente).where(Ingrediente.nombre == "Azúcar")).first()
    sal = session.exec(select(Ingrediente).where(Ingrediente.nombre == "Sal")).first()
    huevo = session.exec(select(Ingrediente).where(Ingrediente.nombre == "Huevo")).first()

    pan_frances = Producto(
        nombre="Pan Francés", descripcion="Pan tradicional francés",
        precio_base=2.50, stock_cantidad=50, disponible=True, unidad_venta_id=u.id,
    )
    pastel_chocolate = Producto(
        nombre="Pastel de Chocolate", descripcion="Pastel con cobertura de chocolate",
        precio_base=15.00, stock_cantidad=10, disponible=True, unidad_venta_id=u.id,
    )
    leche_entera = Producto(
        nombre="Leche Entera 1L", descripcion="Leche entera pasteurizada",
        precio_base=1.20, stock_cantidad=100, disponible=True, unidad_venta_id=l.id,
    )
    session.add_all([pan_frances, pastel_chocolate, leche_entera])
    session.flush()

    session.add_all([
        ProductoCategoria(producto_id=pan_frances.id, categoria_id=panaderia.id, es_principal=True),
        ProductoCategoria(producto_id=pastel_chocolate.id, categoria_id=panaderia.id, es_principal=True),
        ProductoCategoria(producto_id=leche_entera.id, categoria_id=lacteos.id, es_principal=True),
    ])
    session.add_all([
        ProductoIngrediente(producto_id=pan_frances.id, ingrediente_id=harina.id, cantidad=0.500, unidad_medida_id=kg.id, es_removible=False),
        ProductoIngrediente(producto_id=pan_frances.id, ingrediente_id=sal.id, cantidad=10.000, unidad_medida_id=g.id, es_removible=False),
        ProductoIngrediente(producto_id=pastel_chocolate.id, ingrediente_id=harina.id, cantidad=0.300, unidad_medida_id=kg.id, es_removible=False),
        ProductoIngrediente(producto_id=pastel_chocolate.id, ingrediente_id=azucar.id, cantidad=0.200, unidad_medida_id=kg.id, es_removible=False),
        ProductoIngrediente(producto_id=pastel_chocolate.id, ingrediente_id=huevo.id, cantidad=4.000, unidad_medida_id=u.id, es_removible=True),
    ])


def _seed_roles(session: Session):
    if session.exec(select(Rol).limit(1)).first():
        return
    roles_data = [
        ("ADMIN", "Administrador"),
        ("STOCK", "Gestor de Stock"),
        ("PEDIDOS", "Gestor de Pedidos"),
        ("CLIENT", "Cliente"),
    ]
    for codigo, descripcion in roles_data:
        session.add(Rol(codigo=codigo, descripcion=descripcion))
    session.flush()


def _seed_formas_pago(session: Session):
    if session.exec(select(FormaPago).limit(1)).first():
        return
    for nombre in ["Efectivo", "Tarjeta de crédito", "Transferencia", "Mercado Pago"]:
        session.add(FormaPago(nombre=nombre))
    session.flush()


def _seed_estados_pedido(session: Session):
    if session.exec(select(EstadoPedido).limit(1)).first():
        return
    for codigo in ["PENDIENTE", "CONFIRMADO", "EN_PREP", "EN_CAMINO", "ENTREGADO", "CANCELADO"]:
        session.add(EstadoPedido(codigo=codigo))
    session.flush()


def _seed_admin_user(session: Session):
    if session.exec(select(Usuario).where(Usuario.email == "admin@store.com")).first():
        return
    admin = Usuario(
        nombre="Admin",
        email="admin@store.com",
        password_hash=hash_password("admin1234"),
    )
    session.add(admin)
    session.flush()
    admin_rol = session.exec(select(Rol).where(Rol.codigo == "ADMIN")).first()
    session.add(UsuarioRol(usuario_id=admin.id, rol_codigo=admin_rol.codigo))


def run_seed(session: Session):
    _seed_roles(session)
    _seed_formas_pago(session)
    _seed_estados_pedido(session)
    _seed_admin_user(session)
    _seed_unidades_medida(session)
    _seed_categorias(session)
    _seed_ingredientes(session)
    _seed_productos(session)
    session.commit()
