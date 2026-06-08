"""
migrate_roles.py - Migracion de roles M:N a rol unico.

Elimina la tabla intermedia `usuarios_roles` y agrega `rol_codigo` como FK
directa en `usuarios`. Los datos existentes se migran automáticamente.

Compatible con PostgreSQL.

Uso: python scripts/migrate_roles.py
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlmodel import Session, text
from app.db.database import engine


def column_exists(session: Session) -> bool:
    """Verifica si la columna rol_codigo ya existe en usuarios (PostgreSQL)."""
    result = session.exec(text("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'usuarios' AND column_name = 'rol_codigo'
    """)).first()
    return result is not None


def table_exists(session: Session, table: str) -> bool:
    """Verifica si una tabla existe en PostgreSQL."""
    result = session.exec(text("""
        SELECT table_name FROM information_schema.tables
        WHERE table_name = :table
    """), params={"table": table}).first()
    return result is not None


def main():
    with Session(engine) as session:
        if column_exists(session):
            print("[OK] Columna rol_codigo ya existe, omitiendo ALTER TABLE")
        else:
            print("Agregando columna rol_codigo a usuarios...")
            session.exec(text("ALTER TABLE usuarios ADD COLUMN rol_codigo VARCHAR(20) REFERENCES roles(codigo)"))
            print("  [OK] Columna agregada")

        if not table_exists(session, "usuarios_roles"):
            print("[OK] Tabla usuarios_roles no existe, omitiendo migracion de datos")
        else:
            print("Migrando datos desde usuarios_roles...")
            session.exec(text("""
                UPDATE usuarios
                SET rol_codigo = (
                    SELECT rol_codigo FROM usuarios_roles
                    WHERE usuarios_roles.usuario_id = usuarios.id
                    LIMIT 1
                )
            """))

            migrated = session.exec(text("SELECT COUNT(*) FROM usuarios WHERE rol_codigo IS NOT NULL")).scalar()
            total = session.exec(text("SELECT COUNT(*) FROM usuarios WHERE deleted_at IS NULL")).scalar()
            print(f"  -> {migrated} de {total} usuarios activos tienen rol asignado")

            print("Eliminando tabla usuarios_roles...")
            session.exec(text("DROP TABLE IF EXISTS usuarios_roles"))
            print("  [OK] Tabla eliminada")

        session.commit()
        print("Migracion completada correctamente")


if __name__ == "__main__":
    main()
