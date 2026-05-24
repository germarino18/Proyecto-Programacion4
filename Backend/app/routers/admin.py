from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session, select
from app.database import get_session
from app.core.uow import UnitOfWork
from app.core.dependencies import require_admin
from app.models.usuario import Usuario
from app.models.usuario_rol import UsuarioRol
from app.models.rol import Rol
from app.schemas.admin import AdminUserRead, AdminUserUpdate, AdminRolAsignar

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


@router.get("/usuarios", response_model=List[AdminUserRead])
def listar_usuarios(
    rol: Optional[str] = Query(None, description="Filtrar por rol"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session),
    _=Depends(require_admin),
):
    stmt = select(Usuario).where(Usuario.deleted_at.is_(None)).offset(skip).limit(limit)
    if rol:
        stmt = stmt.join(UsuarioRol).join(Rol).where(Rol.codigo == rol)
    users = session.exec(stmt).all()

    result = []
    for user in users:
        roles_stmt = select(UsuarioRol).where(UsuarioRol.usuario_id == user.id)
        user_roles = session.exec(roles_stmt).all()
        result.append(AdminUserRead(
            id=user.id,
            email=user.email,
            nombre=user.nombre,
            activo=user.activo,
            created_at=user.created_at,
            roles=[ur.rol_codigo for ur in user_roles],
        ))
    return result


@router.patch("/usuarios/{id}", response_model=AdminUserRead)
def actualizar_usuario(
    id: int,
    data: AdminUserUpdate,
    session: Session = Depends(get_session),
    _=Depends(require_admin),
):
    user = session.get(Usuario, id)
    if not user or user.deleted_at is not None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    session.add(user)
    session.flush()
    session.refresh(user)

    roles_stmt = select(UsuarioRol).where(UsuarioRol.usuario_id == user.id)
    user_roles = session.exec(roles_stmt).all()
    return AdminUserRead(
        id=user.id,
        email=user.email,
        nombre=user.nombre,
        activo=user.activo,
        created_at=user.created_at,
        roles=[ur.rol_codigo for ur in user_roles],
    )


@router.post("/usuarios/{id}/roles")
def asignar_rol(
    id: int,
    data: AdminRolAsignar,
    session: Session = Depends(get_session),
    _=Depends(require_admin),
):
    user = session.get(Usuario, id)
    if not user or user.deleted_at is not None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    rol = session.exec(select(Rol).where(Rol.codigo == data.rol_codigo)).first()
    if not rol:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Rol no encontrado")

    existing = session.exec(
        select(UsuarioRol).where(
            UsuarioRol.usuario_id == id,
            UsuarioRol.rol_codigo == data.rol_codigo,
        )
    ).first()
    if not existing:
        session.add(UsuarioRol(usuario_id=id, rol_codigo=data.rol_codigo))
        session.commit()

    return {"message": f"Rol {data.rol_codigo} asignado al usuario {id}"}


@router.delete("/usuarios/{id}/roles/{rol_codigo}")
def remover_rol(
    id: int,
    rol_codigo: str,
    session: Session = Depends(get_session),
    _=Depends(require_admin),
):
    ur = session.exec(
        select(UsuarioRol).where(
            UsuarioRol.usuario_id == id,
            UsuarioRol.rol_codigo == rol_codigo,
        )
    ).first()
    if not ur:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="El usuario no tiene ese rol")
    session.delete(ur)
    session.commit()
    return {"message": f"Rol {rol_codigo} removido del usuario {id}"}
