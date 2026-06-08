"""
check_user_roles.py — Muestra usuarios con sus roles.
Útil para diagnosticar por qué un usuario no puede acceder a ciertas secciones.

Uso: python scripts/check_user_roles.py
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlmodel import Session, select
from app.db.database import engine
from app.features.auth.models import Usuario


def main():
    with Session(engine) as session:
        users = session.exec(select(Usuario).where(Usuario.deleted_at.is_(None))).all()
        if not users:
            print("No hay usuarios activos.")
            return

        print(f"{'ID':<4} {'Nombre':<20} {'Email':<30} {'Roles'}")
        print("-" * 80)
        for u in users:
            roles_str = u.rol_codigo or "(sin roles)"
            print(f"{u.id:<4} {u.nombre:<20} {u.email:<30} {roles_str}")


if __name__ == "__main__":
    main()
