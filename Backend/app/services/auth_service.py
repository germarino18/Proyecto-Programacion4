from fastapi import HTTPException, Response, status
from sqlmodel import Session, select
from app.core.uow import UnitOfWork
from app.core.security import hash_password, verify_password, create_access_token
from app.models.usuario import Usuario
from app.models.usuario_rol import UsuarioRol
from app.models.rol import Rol
from app.schemas.auth import AuthRegister, AuthLogin


class AuthService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def register(self, data: AuthRegister) -> Usuario:
        session: Session = self.uow.session
        existing = session.exec(
            select(Usuario).where(Usuario.email == data.email)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El email ya está registrado",
            )
        user = Usuario(
            email=data.email,
            nombre=data.nombre,
            password_hash=hash_password(data.password),
        )
        session.add(user)
        session.flush()

        cliente_rol = session.exec(
            select(Rol).where(Rol.codigo == "CLIENT")
        ).first()
        if cliente_rol:
            session.add(UsuarioRol(usuario_id=user.id, rol_codigo=cliente_rol.codigo))

        session.flush()
        session.refresh(user)
        self.uow.commit()
        return user

    def login(self, data: AuthLogin, response: Response) -> Usuario:
        session: Session = self.uow.session
        user = session.exec(
            select(Usuario).where(Usuario.email == data.email)
        ).first()
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas",
            )
        if not user.activo or user.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario inactivo o eliminado",
            )
        token = create_access_token({"user_id": user.id})
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            max_age=1800,
            samesite="lax",
        )
        return user
