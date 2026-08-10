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
from app.schemas import RegisterRequest, TokenResponse, UserOut, RegisterCollectiveRequest, AdminRegisterRequest
from app.security import hash_password, verify_password, create_access_token, get_current_user
from app.limiter import limiter
from app.config import settings

import resend
import random
import string
import re
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


@router.post("/admin/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def register_admin(request: Request, payload: AdminRegisterRequest, db: Session = Depends(get_db)):
    if payload.pin_code != "060510":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="PIN Code tidak valid. Akses ditolak.",
        )

    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email sudah terdaftar. Gunakan email lain.",
        )

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=UserRole.admin,
    )
    # Admin tidak dimasukkan ke tabel Participant (mengikuti instruksi)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/register_collective", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register_collective(request: Request, payload: RegisterCollectiveRequest, db: Session = Depends(get_db)):
    if not settings.RESEND_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Konfigurasi API email belum diatur (RESEND_API_KEY).",
        )
        
    resend.api_key = settings.RESEND_API_KEY
    
    created_students = []
    
    for student in payload.students:
        # Generate credentials
        random_4_digit = random.randint(1000, 9999)
        base_name = re.sub(r'[^a-z0-9]', '', student.name.lower())
        if not base_name:
            base_name = "siswa"
            
        mock_email = f"{base_name}_{random_4_digit}@optima.ac.id"
        mock_password = ''.join(random.choices(string.ascii_lowercase, k=3)) + ''.join(random.choices(string.digits, k=7))
        
        # Check existing (unlikely, but just in case)
        existing = db.query(User).filter(User.email == mock_email).first()
        if existing:
            mock_email = f"{base_name}_{random.randint(10000, 99999)}@optima.ac.id"
            
        user = User(
            email=mock_email,
            password_hash=hash_password(mock_password),
            role=UserRole.participant,
        )
        db.add(user)
        db.flush()
        
        participant = Participant(
            user_id=user.id,
            full_name=student.name,
            school_name=payload.school_name,
            category=student.category,
            grade=student.grade,
        )
        db.add(participant)
        
        created_students.append({
            "name": student.name,
            "category": student.category.value,
            "grade": student.grade,
            "email": mock_email,
            "password": mock_password
        })
        
    db.commit()
    
    # Generate email HTML
    html_content = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0a0a0a; padding: 20px; text-align: center;">
            <h2 style="color: #e8b94a; margin: 0; font-size: 24px; letter-spacing: 1px;">OPTIMA MATRIX 2026</h2>
            <p style="color: #fffaf0; margin: 5px 0 0 0; font-size: 14px;">Olimpiade Pelajar Matematika Se-Pulau Jawa</p>
        </div>
        
        <div style="padding: 30px;">
            <h3 style="color: #0a0a0a; margin-top: 0;">Pendaftaran Kolektif Berhasil</h3>
            <p>Yth. Bapak/Ibu <strong>{payload.teacher_name}</strong>,</p>
            <p>Terima kasih atas partisipasi dan antusiasme Anda mendaftarkan peserta didik dari <strong>{payload.school_name}</strong> pada kompetisi bergengsi OPTIMA MATRIX 2026.</p>
            
            <div style="background-color: #f8f3e9; border-left: 4px solid #e8b94a; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Catatan Penting:</strong> Untuk kenyamanan Anda melihat data dari layar *handphone*, daftar lengkap kredensial akun peserta (<i>username</i> dan <i>password</i>) telah kami lampirkan dalam bentuk <strong>file CSV</strong> pada email ini.</p>
            </div>
            
            <p>Harap menginstruksikan peserta didik Anda untuk menyimpan informasi kredensial yang terlampir dengan aman. Kredensial tersebut akan digunakan untuk mengakses <a href="https://joinoptima.my.id" style="color: #2c7a65; font-weight: bold; text-decoration: none;">Portal Peserta (CBT)</a> saat babak kompetisi dimulai.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0;">Salam hormat,</p>
                <p style="font-weight: bold; margin: 5px 0 0 0;">Panitia Pusat OPTIMA MATRIX 2026</p>
            </div>
        </div>
        
        <div style="background-color: #f2f2f2; padding: 15px; text-align: center; font-size: 12px; color: #888;">
            <p style="margin: 0;">Pesan ini dihasilkan dan dikirim secara otomatis oleh sistem. Harap tidak membalas email ini.</p>
        </div>
    </div>
    """
    
    # Generate CSV Attachment
    csv_content = "Nama Siswa,Kategori,Email (Username),Password\n"
    for s in created_students:
        csv_content += f"{s['name']},{s['category'].upper()},{s['email']},{s['password']}\n"
    
    csv_bytes = list(csv_content.encode("utf-8"))
    
    # Send email
    try:
        resend.Emails.send({
            "from": f"Panitia OPTIMA MATRIX 2026 <{settings.RESEND_FROM_EMAIL}>",
            "to": payload.teacher_email,
            "subject": f"Kredensial Akun Peserta - {payload.school_name} | OPTIMA MATRIX 2026",
            "html": html_content,
            "attachments": [
                {
                    "filename": "kredensial_peserta_optima.csv",
                    "content": csv_bytes
                }
            ]
        })
        return {"message": "Pendaftaran berhasil, email kredensial telah dikirim.", "students_count": len(created_students)}
    except Exception as e:
        print("Failed to send email:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Akun berhasil dibuat, tetapi gagal mengirim email ke guru. Pastikan API Key Resend Anda sudah benar dan aktif.",
        )



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
