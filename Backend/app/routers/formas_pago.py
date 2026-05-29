from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models.forma_pago import FormaPago
from pydantic import BaseModel


class FormaPagoRead(BaseModel):
    """Schema de lectura para forma de pago."""
    id: int
    nombre: str

    model_config = {"from_attributes": True}


# routers/formas_pago.py - Endpoints de formas de pago
# GET /api/v1/formas-pago → Lista formas de pago disponibles (público)

router = APIRouter(prefix="/api/v1/formas-pago", tags=["Formas de Pago"])


@router.get("", response_model=List[FormaPagoRead])
def listar_formas_pago(session: Session = Depends(get_session)):
    """GET /api/v1/formas-pago - Lista formas de pago disponibles (público)."""
