from fastapi import APIRouter, Depends, Request, Response, status
from sqlmodel import Session
from app.database import get_session
from app.core.uow import UnitOfWork
from app.core.dependencies import get_current_user
from app.schemas.auth import AuthRegister, AuthLogin, AuthUserRead
from app.services.auth_service import AuthService
from app.models.usuario import Usuario

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


def get_service(session: Session = Depends(get_session)) -> AuthService:
    uow = UnitOfWork(session)
    return AuthService(uow)


@router.post("/register", response_model=AuthUserRead, status_code=status.HTTP_201_CREATED)
def register(data: AuthRegister, service: AuthService = Depends(get_service)):
    return service.register(data)


@router.post("/login", response_model=AuthUserRead)
def login(
    data: AuthLogin,
    response: Response,
    session: Session = Depends(get_session),
):
    uow = UnitOfWork(session)
    service = AuthService(uow)
    return service.login(data, response)


@router.get("/me", response_model=AuthUserRead)
def get_me(current_user: Usuario = Depends(get_current_user)):
    return current_user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Sesión cerrada"}
