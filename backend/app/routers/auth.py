"""
Endpoint autentikasi peserta.

Catatan (dari diskusi kita sebelumnya soal rate-limit & sesi offline):
- Endpoint ini TIDAK menerapkan rate-limit per-IP secara internal — kalau
  nanti dipasang di belakang Nginx/Caddy, atur rate-limit di layer itu
  supaya bisa dikonfigurasi longgar khusus untuk sesi offline (banyak
  peserta share 1 IP venue).
- Registrasi admin SENGAJA tidak ada endpoint publiknya (sesuai PRD FR-P1
  note) — akun admin dibuat manual lewat script seed, lihat README.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Participant, UserRole
from app.schemas import RegisterRequest, TokenResponse, UserOut
from app.security import hash_password, verify_password, create_access_token, get_current_user
from app.limiter import limiter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
def register(request: Request, payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email sudah terdaftar. Gunakan email lain atau login.",
        )

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=UserRole.participant,
    )
    db.add(user)
    db.flush()  # supaya user.id sudah terisi sebelum dipakai di Participant

    participant = Participant(
        user_id=user.id,
        full_name=payload.full_name,
        school_name=payload.school_name,
        category=payload.category,
        grade=payload.grade,
        phone=payload.phone,
    )
    db.add(participant)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Pakai OAuth2PasswordRequestForm (field: username, password) supaya
    kompatibel langsung dengan Swagger UI "Authorize" button dan standar
    OAuth2 password flow. Di sini `username` diisi dengan email.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah.",
        )

    access_token = create_access_token(user_id=user.id, role=user.role.value)
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
