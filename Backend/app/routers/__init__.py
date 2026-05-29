# routers/__init__.py - Exporta los routers de la API
# Cada router se registra en main.py con su prefijo /api/v1/...

from app.routers.unidades_medida import router as unidades_medida_router
from app.routers.categorias import router as categorias_router
from app.routers.productos import router as productos_router
from app.routers.ingredientes import router as ingredientes_router

__all__ = [
    "unidades_medida_router",
    "categorias_router",
    "productos_router",
    "ingredientes_router",
]
