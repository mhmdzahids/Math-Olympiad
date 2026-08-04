"""
Setup koneksi database. Semua router lain import `get_db` dari sini
sebagai dependency untuk dapat session database per-request.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Dependency FastAPI: buka session baru tiap request, tutup otomatis
    setelah request selesai (termasuk kalau ada error).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
