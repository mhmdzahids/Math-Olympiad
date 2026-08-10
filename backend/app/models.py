"""
Model database, mengikuti skema di PRD v1.2.

Catatan desain penting:
- `correct_answer` di Question TIDAK PERNAH boleh ikut ter-serialize ke response
  peserta. Ini di-enforce di schemas.py (Pydantic), bukan di sini.
- QuizSession terikat ke round_id, bukan cuma category -> satu peserta bisa
  punya sampai 3 QuizSession (satu per babak yang ia lolos ikuti).
- Qualification adalah gerbang: sebelum membuat QuizSession baru di suatu
  round, endpoint HARUS cek status qualification peserta untuk round itu.
"""
import enum
import uuid

from sqlalchemy import (
    Column, String, Boolean, Integer, Numeric, ForeignKey, Enum,
    DateTime, Text, JSON, UniqueConstraint,
)
from sqlalchemy.types import TypeDecorator
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class GUID(TypeDecorator):
    """
    Tipe GUID/UUID lintas-platform.
    Menggunakan UUID bawaan PostgreSQL jika di PostgreSQL,
    atau String(36) jika di database lain (seperti SQLite).
    """
    impl = String(36)
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=False))
        return dialect.type_descriptor(String(36))


def gen_uuid():
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    participant = "participant"
    admin = "admin"


class Category(str, enum.Enum):
    sd = "sd"
    smp = "smp"
    sma = "sma"


class RoundMode(str, enum.Enum):
    online = "online"
    offline = "offline"


class RoundStatus(str, enum.Enum):
    belum_dibuka = "belum_dibuka"
    aktif = "aktif"
    ditutup = "ditutup"


class QualificationStatus(str, enum.Enum):
    belum_ditentukan = "belum_ditentukan"
    lolos = "lolos"
    tidak_lolos = "tidak_lolos"


class SessionStatus(str, enum.Enum):
    in_progress = "in_progress"
    completed = "completed"
    force_ended_tabswitch = "force_ended_tabswitch"
    force_ended_timeout = "force_ended_timeout"


class User(Base):
    __tablename__ = "users"

    id = Column(GUID, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.participant)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    participant = relationship("Participant", back_populates="user", uselist=False)


class Participant(Base):
    __tablename__ = "participants"

    id = Column(GUID, primary_key=True, default=gen_uuid)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, unique=True)
    full_name = Column(String, nullable=False)
    school_name = Column(String, nullable=False)
    category = Column(Enum(Category), nullable=False)
    grade = Column(String, nullable=True)  # kelas
    phone = Column(String, nullable=True)
    is_active = Column(Boolean, nullable=False, default=False)  # Harus diaktivasi admin sebelum bisa quiz
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="participant")



class Round(Base):
    """Babak lomba: Penyisihan 1, Penyisihan 2, Final."""
    __tablename__ = "rounds"

    id = Column(GUID, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)  # "Babak Penyisihan 1", dst.
    order_index = Column(Integer, nullable=False)  # 1, 2, 3 -> urutan babak
    mode = Column(Enum(RoundMode), nullable=False)
    category = Column(Enum(Category), nullable=False)
    status = Column(Enum(RoundStatus), nullable=False, default=RoundStatus.belum_dibuka)
    duration_minutes = Column(Integer, nullable=False)
    question_count = Column(Integer, nullable=False, default=25)
    tab_switch_limit = Column(Integer, nullable=False, default=3)
    is_randomized = Column(Boolean, nullable=False, default=True)  # FR-A10: randomize order per student
    is_offline_started = Column(Boolean, nullable=False, default=False)
    start_date = Column(String, nullable=True, default="2026-08-01")
    start_time = Column(String, nullable=True, default="08:00")
    end_date = Column(String, nullable=True, default="2026-08-10")
    end_time = Column(String, nullable=True, default="18:00")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("name", "category", name="uq_round_name_category"),
    )


class Qualification(Base):
    """Status kelulusan peserta untuk satu round tertentu. Ini gerbang akses babak."""
    __tablename__ = "qualifications"

    id = Column(GUID, primary_key=True, default=gen_uuid)
    participant_id = Column(GUID, ForeignKey("participants.id"), nullable=False)
    round_id = Column(GUID, ForeignKey("rounds.id"), nullable=False)
    status = Column(Enum(QualificationStatus), nullable=False, default=QualificationStatus.belum_ditentukan)
    decided_by_admin_id = Column(GUID, ForeignKey("users.id"), nullable=True)
    decided_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint("participant_id", "round_id", name="uq_qualification_participant_round"),
    )


class Question(Base):
    __tablename__ = "questions"

    id = Column(GUID, primary_key=True, default=gen_uuid)
    round_id = Column(GUID, ForeignKey("rounds.id"), nullable=False)
    category = Column(Enum(Category), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False, default="PG")  # "PG" atau "ISIAN"
    options = Column(JSON, nullable=True)  # Nullable for ISIAN
    correct_answer = Column(String, nullable=False)  # "A", "B", atau teks jawaban isian
    image_url = Column(String, nullable=True)  # untuk soal bergambar/rumus kompleks
    order_index = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class QuizSession(Base):
    __tablename__ = "quiz_sessions"

    id = Column(GUID, primary_key=True, default=gen_uuid)
    participant_id = Column(GUID, ForeignKey("participants.id"), nullable=False)
    round_id = Column(GUID, ForeignKey("rounds.id"), nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    ends_at = Column(DateTime(timezone=True), nullable=False)  # started_at + durasi -> sumber kebenaran timer
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum(SessionStatus), nullable=False, default=SessionStatus.in_progress)
    tab_switch_count = Column(Integer, nullable=False, default=0)
    score = Column(Numeric, nullable=True)
    active_session_token = Column(String, nullable=True)  # cegah multi-tab/device
    question_order = Column(JSON, nullable=True)  # Array of question IDs e.g. ["uuid1", "uuid3", "uuid2"]

    __table_args__ = (
        UniqueConstraint("participant_id", "round_id", name="uq_session_participant_round"),
    )


class Answer(Base):
    __tablename__ = "answers"

    id = Column(GUID, primary_key=True, default=gen_uuid)
    session_id = Column(GUID, ForeignKey("quiz_sessions.id"), nullable=False)
    question_id = Column(GUID, ForeignKey("questions.id"), nullable=False)
    selected_answer = Column(String, nullable=True)  # NULL = belum dijawab
    is_flagged = Column(Boolean, nullable=False, default=False)
    answered_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint("session_id", "question_id", name="uq_answer_session_question"),
    )


class TabSwitchLog(Base):
    __tablename__ = "tab_switch_logs"

    id = Column(GUID, primary_key=True, default=gen_uuid)
    session_id = Column(GUID, ForeignKey("quiz_sessions.id"), nullable=False)
    occurred_at = Column(DateTime(timezone=True), server_default=func.now())


class QuestionImport(Base):
    """Audit trail untuk fitur import soal dari .docx (FR-A9)."""
    __tablename__ = "question_imports"

    id = Column(GUID, primary_key=True, default=gen_uuid)
    round_id = Column(GUID, ForeignKey("rounds.id"), nullable=False)
    category = Column(Enum(Category), nullable=False)
    original_filename = Column(String, nullable=False)
    imported_by_admin_id = Column(GUID, ForeignKey("users.id"), nullable=False)
    questions_success = Column(Integer, nullable=False, default=0)
    questions_failed = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
