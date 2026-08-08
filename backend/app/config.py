"""
Konfigurasi aplikasi, dibaca dari environment variables (.env).
Kenapa begini: supaya secret (password DB, JWT secret) tidak pernah nge-hardcode
di kode dan ke-commit ke Git.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # Contoh: postgresql://user:password@localhost:5432/math_olympiad
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/math_olympiad"
    )

    # WAJIB diganti dengan string acak panjang di production.
    # Generate dengan: python -c "import secrets; print(secrets.token_hex(32))"
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "ganti-ini-sebelum-deploy")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

    # Origin frontend yang boleh akses API ini (CORS)
    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173"
    ).split(",")
    
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")


settings = Settings()

if settings.ENVIRONMENT != "development" and (not os.getenv("JWT_SECRET_KEY") or settings.JWT_SECRET_KEY == "ganti-ini-sebelum-deploy"):
    raise Exception("JWT_SECRET_KEY belum diatur atau masih nilai default. Set environment variable ini sebelum menjalankan aplikasi.")
