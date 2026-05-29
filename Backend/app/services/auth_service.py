# services/auth_service.py - Servicio de autenticación
# AuthService gestiona registro (con verificación de email único + hash)
# y login (verifica credenciales, genera JWT, lo setea como cookie httponly).

from fastapi import HTTPException, Response, status
from sqlmodel import Session, select
from app.core.uow import UnitOfWork
from app.core.security import hash_password, verify_password, create_access_token
from app.models.usuario import Usuario
from app.models.usuario_rol import UsuarioRol
from app.models.rol import Rol
from app.schemas.auth import AuthRegister, AuthLogin


class AuthService:
    """Servicio de autenticación: registro y login con JWT."""

    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def register(self, data: AuthRegister) -> Usuario:
        """Registra un nuevo usuario.
        Recibe: AuthRegister con email, nombre, password.
        Retorna: Usuario creado (con rol CLIENT asignado automáticamente).
        Lanza: 409 si el email ya está registrado."""
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
        """Autentica un usuario y setea cookie JWT.
        Recibe: AuthLogin (email, password), Response de FastAPI.
        Retorna: Usuario autenticado.
        Lanza: 401 si credenciales inválidas o usuario inactivo/eliminado.
        Setea: cookie 'access_token' httponly en la response."""
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
