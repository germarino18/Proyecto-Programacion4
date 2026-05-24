from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from app.database import init_db, get_session
from app.db.seed import run_seed
from app.routers.unidades_medida import router as unidades_medida_router
from app.routers.categorias import router as categorias_router
from app.routers.productos import router as productos_router
from app.routers.ingredientes import router as ingredientes_router

app = FastAPI(title="Catálogo de Productos - API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(unidades_medida_router)
app.include_router(categorias_router)
app.include_router(productos_router)
app.include_router(ingredientes_router)


@app.on_event("startup")
def on_startup():
    init_db()
    session = next(get_session())
    try:
        run_seed(session)
    finally:
        session.close()


@app.get("/")
def root():
    return {"message": "Catálogo de Productos - API"}
