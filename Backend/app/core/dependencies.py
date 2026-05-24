from typing import List, Optional
from fastapi import Depends, HTTPException, Request, status
from sqlmodel import Session, select
from app.database import get_session
from app.core.uow import UnitOfWork
from app.core.security import decode_access_token
from app.models.usuario import Usuario
from app.models.usuario_rol import UsuarioRol


async def get_current_user(
    request: Request,
    session: Session = Depends(get_session),
) -> Usuario:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
        )
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
        )
    user = session.get(Usuario, user_id)
    if not user or user.deleted_at is not None or not user.activo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o inactivo",
        )
    return user


def require_role(roles: List[str]):
    async def role_checker(
        current_user: Usuario = Depends(get_current_user),
        session: Session = Depends(get_session),
    ):
        user_roles = session.exec(
            select(UsuarioRol).where(UsuarioRol.usuario_id == current_user.id)
        ).all()
        user_role_codes = [ur.rol_codigo for ur in user_roles]
        for required in roles:
            if required in user_role_codes:
                return current_user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para esta acción",
        )
    return role_checker


require_admin = require_role(["ADMIN"])
