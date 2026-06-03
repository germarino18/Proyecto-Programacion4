"""
add_missing_roles.py — Agrega roles CAJERO y COCINERO si no existen.
Ejecutar después de actualizar el seed si la DB ya tenía datos previos.

Uso: python scripts/add_missing_roles.py
"""

import sys
import os

# Agregar backend/ al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlmodel import Session, select
from app.db.database import engine
from app.features.usuario.rol import Rol

MISSING_ROLES = [
    ("CAJERO", "Cajero"),
    ("COCINERO", "Cocinero"),
]


def main():
    with Session(engine) as session:
        added = 0
        for codigo, descripcion in MISSING_ROLES:
            existing = session.exec(select(Rol).where(Rol.codigo == codigo)).first()
            if not existing:
                session.add(Rol(codigo=codigo, descripcion=descripcion))
                print(f"  ✓ Rol '{codigo}' agregado")
                added += 1
            else:
                print(f"  - Rol '{codigo}' ya existe")
        if added > 0:
            session.commit()
            print(f"\n✅ {added} rol(es) agregado(s) correctamente")
        else:
            print("\n✓ No hay roles faltantes")


if __name__ == "__main__":
    main()
