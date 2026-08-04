"""
Pydantic schemas — mendefinisikan bentuk data yang masuk/keluar API.

Penting: ParticipantOut & UserOut TIDAK menyertakan password_hash.
Ini bukan kebetulan — Pydantic hanya serialize field yang didefinisikan
di sini, jadi field sensitif otomatis tidak pernah ke-expose walau
model SQLAlchemy-nya punya field itu.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.models import Category, UserRole, RoundMode, RoundStatus


# ---------- Auth: Register ----------

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, description="Minimal 8 karakter")
    full_name: str
    school_name: str
    category: Category
    grade: Optional[str] = None
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Output ----------

class ParticipantOut(BaseModel):
    id: str
    full_name: str
    school_name: str
    category: Category
    grade: Optional[str] = None

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: str
    email: EmailStr
    role: UserRole
    created_at: datetime
    participant: Optional[ParticipantOut] = None

    class Config:
        from_attributes = True


# ---------- Rounds & Questions ----------

class RoundCreate(BaseModel):
    name: str
    category: Category
    mode: Optional[RoundMode] = RoundMode.online
    status: Optional[RoundStatus] = RoundStatus.aktif
    duration_minutes: Optional[int] = 60
    question_count: Optional[int] = 25
    tab_switch_limit: Optional[int] = 3
    order_index: Optional[int] = 1
    start_date: Optional[str] = "2026-08-01"
    start_time: Optional[str] = "08:00"
    end_date: Optional[str] = "2026-08-10"
    end_time: Optional[str] = "18:00"


class RoundUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[Category] = None
    mode: Optional[RoundMode] = None
    status: Optional[RoundStatus] = None
    duration_minutes: Optional[int] = None
    question_count: Optional[int] = None
    tab_switch_limit: Optional[int] = None
    order_index: Optional[int] = None
    is_offline_started: Optional[bool] = None
    start_date: Optional[str] = None
    start_time: Optional[str] = None
    end_date: Optional[str] = None
    end_time: Optional[str] = None


class RoundOut(BaseModel):
    id: str
    name: str
    category: Category
    mode: RoundMode
    status: RoundStatus
    duration_minutes: int
    question_count: int
    tab_switch_limit: int
    order_index: int
    is_offline_started: bool
    start_date: Optional[str] = "2026-08-01"
    start_time: Optional[str] = "08:00"
    end_date: Optional[str] = "2026-08-10"
    end_time: Optional[str] = "18:00"
    created_at: datetime

    class Config:
        from_attributes = True


class QuestionOptionSchema(BaseModel):
    key: str
    text: str


class QuestionCreate(BaseModel):
    question_text: str
    options: list[QuestionOptionSchema]
    correct_key: str
    image_url: Optional[str] = None
    points: Optional[int] = 10


class QuestionOut(BaseModel):
    id: str
    round_id: str
    question_text: str
    options: list[QuestionOptionSchema]
    correct_key: str
    image_url: Optional[str] = None
    points: int = 10
    created_at: datetime

    class Config:
        from_attributes = True


class QuestionStudentOut(BaseModel):
    """Schema khusus untuk peserta: TANPA correct_key! Anti-Cheat."""
    id: str
    round_id: str
    question_text: str
    options: list[QuestionOptionSchema]
    image_url: Optional[str] = None
    points: int = 10

    class Config:
        from_attributes = True


class ImportQuestionsRequest(BaseModel):
    questions: list[QuestionCreate]
    filename: Optional[str] = None
    mode: Optional[str] = "replace"  # "replace" or "append"


class QuizSessionStartOut(BaseModel):
    session_id: str
    round_id: str
    started_at: datetime
    ends_at: datetime
    duration_minutes: int
    tab_switch_limit: int
    remaining_seconds: int
    tab_switch_count: int
    is_submitted: bool


