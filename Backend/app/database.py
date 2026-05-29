# database.py - Configuración de la base de datos PostgreSQL
# Define el engine de SQLModel usando DATABASE_URL desde .env.
# get_session: generador que provee sesiones para las dependencias de FastAPI.
# init_db: crea todas las tablas definidas por los modelos SQLModel.

from dotenv import load_dotenv
import os
from sqlmodel import SQLModel, Session, create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:cementista@localhost:5432/parcial_db")
engine = create_engine(DATABASE_URL, echo=True)


def get_session():
    """Generador de sesiones SQLModel para inyección en dependencias FastAPI."""
    with Session(engine) as session:
        yield session


def init_db():
    """Crea todas las tablas en la DB según los modelos SQLModel importados."""
    SQLModel.metadata.create_all(engine)
