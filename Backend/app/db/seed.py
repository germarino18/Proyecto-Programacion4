from sqlmodel import Session, select
from app.models.unidad_medida import UnidadMedida
from app.models.categoria import Categoria
from app.models.ingrediente import Ingrediente
from app.models.producto import Producto
from app.models.producto_categoria import ProductoCategoria
from app.models.producto_ingrediente import ProductoIngrediente


def run_seed(session: Session):
    existing = session.exec(select(UnidadMedida).limit(1)).first()
    if existing:
        return

    # Unidades de Medida
    kg = UnidadMedida(nombre="kilogramo", simbolo="kg", tipo="masa")
    g = UnidadMedida(nombre="gramo", simbolo="g", tipo="masa")
    l = UnidadMedida(nombre="litro", simbolo="L", tipo="volumen")
    ml = UnidadMedida(nombre="mililitro", simbolo="mL", tipo="volumen")
    u = UnidadMedida(nombre="pieza", simbolo="u", tipo="unidad")
    doc = UnidadMedida(nombre="docena", simbolo="doc", tipo="unidad")
    m2 = UnidadMedida(nombre="metro cuadrado", simbolo="m²", tipo="area")
    session.add_all([kg, g, l, ml, u, doc, m2])
    session.flush()

    # Categorías
    bebidas = Categoria(nombre="Bebidas", descripcion="Bebidas en general")
    lacteos = Categoria(nombre="Lácteos", descripcion="Productos lácteos")
    panaderia = Categoria(nombre="Panadería", descripcion="Pan y productos de panadería")
    session.add_all([bebidas, lacteos, panaderia])
    session.flush()

    # Ingredientes
    harina = Ingrediente(nombre="Harina", descripcion="Harina de trigo")
    azucar = Ingrediente(nombre="Azúcar", descripcion="Azúcar refinada")
    leche = Ingrediente(nombre="Leche", descripcion="Leche entera")
    huevo = Ingrediente(nombre="Huevo", descripcion="Huevo de gallina", es_alergeno=True)
    sal = Ingrediente(nombre="Sal", descripcion="Sal fina")
    mantequilla = Ingrediente(nombre="Mantequilla", descripcion="Mantequilla sin sal")
    session.add_all([harina, azucar, leche, huevo, sal, mantequilla])
    session.flush()

    # Productos
    pan_frances = Producto(
        nombre="Pan Francés",
        descripcion="Pan tradicional francés",
        precio_base=2.50,
        stock_cantidad=50,
        disponible=True,
        unidad_venta_id=u.id,
    )
    pastel_chocolate = Producto(
        nombre="Pastel de Chocolate",
        descripcion="Pastel con cobertura de chocolate",
        precio_base=15.00,
        stock_cantidad=10,
        disponible=True,
        unidad_venta_id=u.id,
    )
    leche_entera = Producto(
        nombre="Leche Entera 1L",
        descripcion="Leche entera pasteurizada",
        precio_base=1.20,
        stock_cantidad=100,
        disponible=True,
        unidad_venta_id=l.id,
    )
    session.add_all([pan_frances, pastel_chocolate, leche_entera])
    session.flush()

    # Producto-Categoría
    session.add_all([
        ProductoCategoria(producto_id=pan_frances.id, categoria_id=panaderia.id, es_principal=True),
        ProductoCategoria(producto_id=pastel_chocolate.id, categoria_id=panaderia.id, es_principal=True),
        ProductoCategoria(producto_id=leche_entera.id, categoria_id=lacteos.id, es_principal=True),
    ])

    # Producto-Ingrediente
    session.add_all([
        ProductoIngrediente(
            producto_id=pan_frances.id,
            ingrediente_id=harina.id,
            cantidad=0.500,
            unidad_medida_id=kg.id,
            es_removible=False,
        ),
        ProductoIngrediente(
            producto_id=pan_frances.id,
            ingrediente_id=sal.id,
            cantidad=10.000,
            unidad_medida_id=g.id,
            es_removible=False,
        ),
        ProductoIngrediente(
            producto_id=pastel_chocolate.id,
            ingrediente_id=harina.id,
            cantidad=0.300,
            unidad_medida_id=kg.id,
            es_removible=False,
        ),
        ProductoIngrediente(
            producto_id=pastel_chocolate.id,
            ingrediente_id=azucar.id,
            cantidad=0.200,
            unidad_medida_id=kg.id,
            es_removible=False,
        ),
        ProductoIngrediente(
            producto_id=pastel_chocolate.id,
            ingrediente_id=huevo.id,
            cantidad=4.000,
            unidad_medida_id=u.id,
            es_removible=True,
        ),
    ])

    session.commit()
