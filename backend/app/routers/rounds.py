"""
Router API FastAPI untuk Kelola Babak & Bank Soal Kuis (Rounds & Questions).
"""
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Round, Question, QuestionImport, User, Category, QuizSession,
    Participant, SessionStatus, TabSwitchLog, Qualification, QualificationStatus
)
from app.schemas import (
    RoundCreate,
    RoundUpdate,
    RoundOut,
    QuestionOut,
    QuestionStudentOut,
    ImportQuestionsRequest,
    QuizSessionStartOut,
)
import random
from app.security import require_admin, get_current_user, get_current_user_optional

router = APIRouter(prefix="/rounds", tags=["Rounds & Questions"])


class QualificationUpdateSchema(BaseModel):
    participant_id: str
    status: str  # "qualified" | "disqualified" | "pending"
    category: Optional[str] = None


@router.get("", response_model=List[RoundOut])
def get_rounds(
    category: Optional[Category] = None,
    db: Session = Depends(get_db)
):
    """Mendapatkan daftar seluruh babak lomba (dapat difilter berdasarkan kategori: sd, smp, sma)."""
    query = db.query(Round)
    if category:
        query = query.filter(Round.category == category)
    rounds = query.order_by(Round.category, Round.order_index, Round.created_at).all()
    return rounds


@router.get("/leaderboard/all")
def get_leaderboard(
    category: Optional[Category] = None,
    round_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """[Admin/Public] Mendapatkan klasemen & kualifikasi peserta langsung dari database.
    
    Filter opsional:
    - category: 'sd' | 'smp' | 'sma'
    - round_id: UUID babak tertentu — jika diisi, skor diambil dari sesi babak ini saja
    """
    query = db.query(Participant)
    if category:
        query = query.filter(Participant.category == category)
    participants = query.all()

    # Resolve nama babak yang aktif
    selected_round = None
    if round_id:
        selected_round = db.query(Round).filter(Round.id == round_id).first()

    leaderboard = []
    for p in participants:
        if round_id:
            # Ambil sesi dari babak tertentu saja
            session = db.query(QuizSession).filter(
                QuizSession.participant_id == p.id,
                QuizSession.round_id == round_id
            ).order_by(QuizSession.started_at.desc()).first()
        else:
            # Fallback: ambil sesi terbaru dari semua babak
            session = db.query(QuizSession).filter(
                QuizSession.participant_id == p.id
            ).order_by(QuizSession.started_at.desc()).first()

        score = float(session.score) if (session and session.score is not None) else 0
        tab_switches = session.tab_switch_count if session else 0
        
        # Ambil status kualifikasi terbaru dari database berdasarkan decided_at
        qual_query = db.query(Qualification).filter(
            Qualification.participant_id == p.id
        )
        if round_id:
            qual_query = qual_query.filter(Qualification.round_id == round_id)
        qual = qual_query.order_by(Qualification.decided_at.desc().nullslast(), Qualification.id.desc()).first()

        db_status = None
        if qual:
            if qual.status == QualificationStatus.lolos:
                db_status = "qualified"
            elif qual.status == QualificationStatus.tidak_lolos:
                db_status = "disqualified"
            elif qual.status == QualificationStatus.belum_ditentukan:
                db_status = "pending"

        leaderboard.append({
            "id": p.id,
            "name": p.full_name,
            "school": p.school_name,
            "category": p.category.value if hasattr(p.category, "value") else str(p.category),
            "score": int(score),
            "tabSwitches": tab_switches,
            "status": db_status,
            "round_id": round_id,
            "round_name": selected_round.name if selected_round else None,
            "has_session": session is not None,
        })

    leaderboard.sort(key=lambda x: (-x["score"], x["tabSwitches"]))

    for idx, item in enumerate(leaderboard):
        item["rank"] = idx + 1
        # Jika belum ada record Qualification di DB, tentukan status bawaan: Top 10 = qualified, sisanya pending
        if item["status"] is None:
            item["status"] = "qualified" if idx < 10 else "pending"

    return leaderboard


@router.post("/qualification/update")
def update_participant_qualification(
    payload: QualificationUpdateSchema,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """[Admin] Memperbarui status kualifikasi peserta di database secara permanen."""
    participant = db.query(Participant).filter(Participant.id == payload.participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Peserta tidak ditemukan")

    status_map = {
        "qualified": QualificationStatus.lolos,
        "disqualified": QualificationStatus.tidak_lolos,
        "pending": QualificationStatus.belum_ditentukan
    }

    target_enum_status = status_map.get(payload.status)
    if not target_enum_status:
        raise HTTPException(status_code=400, detail="Status kualifikasi tidak valid")

    now = datetime.now(timezone.utc)

    # Update SELURUH record qualification peserta ini agar konsisten di seluruh babak
    quals = db.query(Qualification).filter(Qualification.participant_id == participant.id).all()

    if quals:
        for q in quals:
            q.status = target_enum_status
            q.decided_by_admin_id = admin_user.id
            q.decided_at = now
    else:
        # Jika belum ada record, buatkan satu untuk round kategori peserta ini
        next_round = db.query(Round).filter(Round.category == participant.category).first()
        if next_round:
            db.add(Qualification(
                participant_id=participant.id,
                round_id=next_round.id,
                status=target_enum_status,
                decided_by_admin_id=admin_user.id,
                decided_at=now
            ))

    db.commit()
    return {"message": "Status kualifikasi berhasil diperbarui", "status": payload.status}


@router.get("/sessions/me")
def get_my_quiz_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """[Peserta] Mendapatkan seluruh status sesi kuis milik peserta aktif."""
    participant = db.query(Participant).filter(Participant.user_id == current_user.id).first()
    participant_id = participant.id if participant else current_user.id
    
    sessions = db.query(QuizSession).filter(QuizSession.participant_id == participant_id).all()
    now = datetime.now(timezone.utc)
    out = []
    for s in sessions:
        rem = int((s.ends_at - now).total_seconds()) if s.ends_at else 0
        if rem < 0:
            rem = 0
        out.append({
            "id": s.id,
            "round_id": s.round_id,
            "status": s.status.value if hasattr(s.status, "value") else str(s.status),
            "started_at": s.started_at,
            "ends_at": s.ends_at,
            "remaining_seconds": rem,
            "tab_switch_count": s.tab_switch_count,
            "submitted_at": s.submitted_at,
            "score": s.score
        })
    return out


@router.post("", response_model=RoundOut, status_code=status.HTTP_201_CREATED)
def create_round(
    round_in: RoundCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """[Admin] Membuat babak lomba baru."""
    new_round = Round(
        name=round_in.name,
        category=round_in.category,
        mode=round_in.mode,
        status=round_in.status,
        duration_minutes=round_in.duration_minutes,
        question_count=round_in.question_count or 25,
        tab_switch_limit=round_in.tab_switch_limit,
        order_index=round_in.order_index or 1,
        is_randomized=round_in.is_randomized if round_in.is_randomized is not None else True,
        start_date=round_in.start_date,
        start_time=round_in.start_time,
        end_date=round_in.end_date,
        end_time=round_in.end_time,
    )
    db.add(new_round)
    db.commit()
    db.refresh(new_round)
    return new_round


@router.put("/{round_id}", response_model=RoundOut)
def update_round(
    round_id: str,
    round_in: RoundUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """[Admin] Memperbarui informasi/pengaturan babak lomba."""
    target_round = db.query(Round).filter(Round.id == round_id).first()
    if not target_round:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Babak tidak ditemukan.",
        )

    update_data = round_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(target_round, field, value)

    db.commit()
    db.refresh(target_round)
    return target_round


@router.delete("/{round_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_round(
    round_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """[Admin] Menghapus babak lomba dari database."""
    target_round = db.query(Round).filter(Round.id == round_id).first()
    if not target_round:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Babak tidak ditemukan.",
        )

    db.delete(target_round)
    db.commit()
    return None


@router.get("/{round_id}/questions", response_model=List[QuestionOut])
def get_round_questions(
    round_id: str,
    db: Session = Depends(get_db)
):
    """Mendapatkan seluruh daftar soal pada suatu babak."""
    target_round = db.query(Round).filter(Round.id == round_id).first()
    if not target_round:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Babak tidak ditemukan.",
        )

    questions = db.query(Question).filter(Question.round_id == round_id).order_by(Question.created_at).all()
    out = [
        QuestionOut(
            id=q.id,
            round_id=q.round_id,
            question_text=q.question_text,
            options=q.options,
            correct_key=q.correct_answer,
            image_url=q.image_url,
            points=10,
            created_at=q.created_at,
        )
        for q in questions
    ]
    return out


@router.post("/{round_id}/questions/import", status_code=status.HTTP_201_CREATED)
def import_questions_to_round(
    round_id: str,
    payload: ImportQuestionsRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """[Admin] Mengimpor dan menyimpan secara massal daftar soal ke database bank soal."""
    target_round = db.query(Round).filter(Round.id == round_id).first()
    if not target_round:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Babak tidak ditemukan.",
        )

    if payload.mode == "replace":
        db.query(Question).filter(Question.round_id == round_id).delete()
        existing_count = 0
    else:
        existing_count = db.query(Question).filter(Question.round_id == round_id).count()

    created_questions = []
    for idx, q_data in enumerate(payload.questions):
        opts = [o.dict() for o in q_data.options]
        q_obj = Question(
            round_id=round_id,
            category=target_round.category,
            question_text=q_data.question_text,
            options=opts,
            correct_answer=q_data.correct_key,
            image_url=q_data.image_url,
            order_index=existing_count + idx + 1,
        )
        db.add(q_obj)
        created_questions.append(q_obj)

    target_round.question_count = existing_count + len(payload.questions)

    # Record question import log
    q_import = QuestionImport(
        round_id=round_id,
        category=target_round.category,
        original_filename=payload.filename or "manual_entry.docx",
        imported_by_admin_id=admin.id,
        questions_success=len(payload.questions),
        questions_failed=0,
    )
    db.add(q_import)

    db.commit()
    mode_text = "mengganti seluruh" if payload.mode == "replace" else "menambahkan"
    return {
        "message": f"Berhasil {mode_text} {len(created_questions)} soal pada database babak {target_round.name}!",
        "count": len(created_questions),
    }


@router.get("/{round_id}/questions/student", response_model=List[QuestionStudentOut])
def get_round_questions_for_student(
    round_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """[Peserta] Mendapatkan daftar soal untuk pengerjaan kuis TANPA kunci jawaban (Anti-Cheat)."""
    target_round = db.query(Round).filter(Round.id == round_id).first()
    if not target_round:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Babak tidak ditemukan.",
        )

    questions = db.query(Question).filter(Question.round_id == round_id).order_by(Question.created_at).all()

    # If student is logged in and has an active QuizSession with randomized question_order
    if current_user:
        participant = db.query(Participant).filter(Participant.user_id == current_user.id).first()
        participant_id = participant.id if participant else current_user.id
        session = db.query(QuizSession).filter(
            QuizSession.participant_id == participant_id,
            QuizSession.round_id == round_id
        ).first()

        if session and session.question_order:
            order_map = {q_id: idx for idx, q_id in enumerate(session.question_order)}
            questions.sort(key=lambda q: order_map.get(q.id, 9999))

    out = [
        QuestionStudentOut(
            id=q.id,
            round_id=q.round_id,
            question_text=q.question_text,
            options=q.options,
            image_url=q.image_url,
            points=10,
        )
        for q in questions
    ]
    return out


@router.post("/{round_id}/quiz/start", response_model=QuizSessionStartOut)
def start_quiz_session(
    round_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """[Peserta] Memulai sesi kuis baru dan mendapatkan timestamp serta sisa waktu dari server."""
    target_round = db.query(Round).filter(Round.id == round_id).first()
    if not target_round:
        raise HTTPException(status_code=404, detail="Babak tidak ditemukan.")
    
    participant = db.query(Participant).filter(Participant.user_id == current_user.id).first()
    participant_id = participant.id if participant else current_user.id
    
    session = db.query(QuizSession).filter(
        QuizSession.participant_id == participant_id,
        QuizSession.round_id == round_id
    ).first()

    now = datetime.now(timezone.utc)
    if session and session.status != SessionStatus.in_progress:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quiz sudah selesai dikerjakan. Setiap peserta hanya memiliki 1 kali kesempatan pengerjaan."
        )

    if not session:
        duration_sec = target_round.duration_minutes * 60
        ends_at = now + timedelta(seconds=duration_sec)

        # FR-A10: Shuffle question order per student session if is_randomized is enabled
        all_q_objs = db.query(Question.id).filter(Question.round_id == round_id).order_by(Question.created_at).all()
        q_order = [q.id for q in all_q_objs]
        if target_round.is_randomized and q_order:
            random.shuffle(q_order)

        session = QuizSession(
            participant_id=participant_id,
            round_id=round_id,
            started_at=now,
            ends_at=ends_at,
            status=SessionStatus.in_progress,
            tab_switch_count=0,
            question_order=q_order if q_order else None
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    remaining = int((session.ends_at - now).total_seconds())
    if remaining < 0:
        remaining = 0
        if session.status == SessionStatus.in_progress:
            session.status = SessionStatus.completed
            db.commit()

    return QuizSessionStartOut(
        session_id=session.id,
        round_id=session.round_id,
        started_at=session.started_at,
        ends_at=session.ends_at,
        duration_minutes=target_round.duration_minutes,
        tab_switch_limit=target_round.tab_switch_limit,
        remaining_seconds=remaining,
        tab_switch_count=session.tab_switch_count,
        is_submitted=session.status != SessionStatus.in_progress
    )


@router.post("/{round_id}/quiz/log-violation")
def log_quiz_violation(
    round_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """[Peserta] Mencatat pelanggaran perpindahan tab secara atomik di database (Anti-Race Condition)."""
    participant = db.query(Participant).filter(Participant.user_id == current_user.id).first()
    participant_id = participant.id if participant else current_user.id
    
    session = db.query(QuizSession).filter(
        QuizSession.participant_id == participant_id,
        QuizSession.round_id == round_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Sesi kuis belum dimulai.")

    target_round = db.query(Round).filter(Round.id == round_id).first()
    max_switches = target_round.tab_switch_limit if target_round else 3

    # Atomic SQL Increment + RETURNING at PostgreSQL database level (Zero Race Condition)
    result = db.execute(
        text(
            """
            UPDATE quiz_sessions
            SET tab_switch_count = tab_switch_count + 1
            WHERE id = :session_id
            RETURNING tab_switch_count
            """
        ),
        {"session_id": session.id}
    ).fetchone()

    new_count = result[0] if result else session.tab_switch_count + 1

    is_force_ended = False
    if new_count >= max_switches:
        is_force_ended = True
        db.execute(
            text(
                """
                UPDATE quiz_sessions
                SET status = :status, submitted_at = :submitted_at
                WHERE id = :session_id AND status = :in_progress
                """
            ),
            {
                "status": SessionStatus.force_ended_tabswitch.value,
                "submitted_at": datetime.now(timezone.utc),
                "session_id": session.id,
                "in_progress": SessionStatus.in_progress.value
            }
        )

    log_entry = TabSwitchLog(session_id=session.id)
    db.add(log_entry)
    db.commit()

    return {
        "session_id": session.id,
        "tab_switch_count": new_count,
        "max_switches": max_switches,
        "is_submitted": is_force_ended or (session.status != SessionStatus.in_progress),
        "status": SessionStatus.force_ended_tabswitch.value if is_force_ended else session.status.value
    }


class QuizSubmitPayload(BaseModel):
    answers: dict


@router.post("/{round_id}/quiz/submit")
def submit_quiz_answers(
    round_id: str,
    payload: QuizSubmitPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """[Peserta] Mengumpulkan kuis & melakukan penilaian otomatis di sisi server (Server-Side Grading)."""
    participant = db.query(Participant).filter(Participant.user_id == current_user.id).first()
    participant_id = participant.id if participant else current_user.id
    
    session = db.query(QuizSession).filter(
        QuizSession.participant_id == participant_id,
        QuizSession.round_id == round_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Sesi kuis belum dimulai.")

    now = datetime.now(timezone.utc)
    max_ends_at = session.ends_at + timedelta(seconds=30)
    if now > max_ends_at and session.status == SessionStatus.in_progress:
        session.status = SessionStatus.force_ended_timeout

    # Server-Side Scoring
    questions = db.query(Question).filter(Question.round_id == round_id).all()
    score = 0
    total_points = len(questions) * 10 if questions else 100

    if questions:
        for idx, q in enumerate(questions):
            key_id = str(idx + 1)
            submitted_ans = payload.answers.get(key_id) or payload.answers.get(q.id)
            if submitted_ans and str(submitted_ans).upper() == str(q.correct_answer).upper():
                score += 10

    session.score = score
    if session.status == SessionStatus.in_progress:
        session.status = SessionStatus.completed
    session.submitted_at = now
    
    db.commit()

    return {
        "message": "Kuis berhasil dikumpulkan dan dinilai secara aman di server.",
        "score": score,
        "total_possible": total_points,
        "status": session.status,
        "tab_switch_count": session.tab_switch_count
    }

