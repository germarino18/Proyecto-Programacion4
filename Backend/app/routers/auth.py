from fastapi import APIRouter, Depends, Request, Response, status
from sqlmodel import Session
from app.database import get_session
from app.core.uow import UnitOfWork
from app.core.dependencies import get_current_user
from app.schemas.auth import AuthRegister, AuthLogin, AuthUserRead
from app.services.auth_service import AuthService
from app.models.usuario import Usuario

# routers/auth.py - Endpoints de autenticación
# POST /api/v1/auth/register → Registro de nuevo usuario (público)
# POST /api/v1/auth/login → Login, setea cookie JWT (público)
# GET  /api/v1/auth/me → Devuelve el usuario autenticado (requiere cookie)
# POST /api/v1/auth/logout → Elimina la cookie JWT

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


def get_service(session: Session = Depends(get_session)) -> AuthService:
    """Inyecta AuthService con UnitOfWork."""
    uow = UnitOfWork(session)
    return AuthService(uow)


@router.post("/register", response_model=AuthUserRead, status_code=status.HTTP_201_CREATED)
def register(data: AuthRegister, service: AuthService = Depends(get_service)):
    """POST /api/v1/auth/register - Registro público de nuevo usuario.
    Recibe: email, nombre, password. Retorna: datos del usuario creado."""
    return service.register(data)


@router.post("/login", response_model=AuthUserRead)
def login(
    data: AuthLogin,
    response: Response,
    session: Session = Depends(get_session),
):
    """POST /api/v1/auth/login - Inicia sesión.
    Recibe: email, password. Setea cookie httponly 'access_token'.
    Retorna: datos del usuario autenticado."""
    uow = UnitOfWork(session)
    service = AuthService(uow)
    return service.login(data, response)


@router.get("/me", response_model=AuthUserRead)
def get_me(current_user: Usuario = Depends(get_current_user)):
    """GET /api/v1/auth/me - Devuelve el usuario autenticado.
    Requiere: cookie 'access_token' válida."""
    return current_user


@router.post("/logout")
def logout(response: Response):
    """POST /api/v1/auth/logout - Cierra sesión eliminando la cookie."""
    response.delete_cookie(key="access_token")
    return {"message": "Sesión cerrada"}
