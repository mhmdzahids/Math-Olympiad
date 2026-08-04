"""
Script seed data awal untuk database math_olympiad.
Membuat akun admin default, peserta sampel, dan babak lomba initial.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
import app.models as models
from app.models import User, Participant, Round, Question, UserRole, Category, RoundMode, RoundStatus
from app.security import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Admin User
        admin_email = "admin@matholympiad.id"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if not existing_admin:
            admin_user = User(
                email=admin_email,
                password_hash=hash_password("admin123"),
                role=UserRole.admin,
            )
            db.add(admin_user)
            db.flush()

            admin_part = Participant(
                user_id=admin_user.id,
                full_name="Panitia Admin Utama",
                school_name="Panitia MathOlympiad",
                category=Category.sma,
                grade="Admin",
                phone="081234567890",
            )
            db.add(admin_part)
            print(f"[SEED] Akun Admin dibuat: {admin_email} / admin123")
        else:
            print(f"[SEED] Akun Admin sudah ada: {admin_email}")

        # 2. Sample Participant
        student_email = "andi@sekolah.sch.id"
        existing_student = db.query(User).filter(User.email == student_email).first()
        if not existing_student:
            student_user = User(
                email=student_email,
                password_hash=hash_password("peserta123"),
                role=UserRole.participant,
            )
            db.add(student_user)
            db.flush()

            student_part = Participant(
                user_id=student_user.id,
                full_name="Andi Wijaya",
                school_name="SMA Negeri 1 Jakarta",
                category=Category.sma,
                grade="Kelas 11",
                phone="081987654321",
            )
            db.add(student_part)
            print(f"[SEED] Akun Peserta Sampel dibuat: {student_email} / peserta123")
        else:
            print(f"[SEED] Akun Peserta Sampel sudah ada: {student_email}")

        # 3. Initial Rounds
        rounds_data = [
            {"name": "Babak Penyisihan 1 (SMA)", "order_index": 1, "mode": RoundMode.online, "category": Category.sma, "status": RoundStatus.aktif, "duration_minutes": 60, "question_count": 30},
            {"name": "Babak Penyisihan 2 (SMA)", "order_index": 2, "mode": RoundMode.online, "category": Category.sma, "status": RoundStatus.belum_dibuka, "duration_minutes": 90, "question_count": 30},
            {"name": "Babak Final (SMA)", "order_index": 3, "mode": RoundMode.offline, "category": Category.sma, "status": RoundStatus.belum_dibuka, "duration_minutes": 120, "question_count": 10},
            {"name": "Babak Penyisihan 1 (SMP)", "order_index": 1, "mode": RoundMode.online, "category": Category.smp, "status": RoundStatus.aktif, "duration_minutes": 60, "question_count": 25},
            {"name": "Babak Penyisihan 1 (SD)", "order_index": 1, "mode": RoundMode.online, "category": Category.sd, "status": RoundStatus.aktif, "duration_minutes": 60, "question_count": 25},
        ]

        for r_info in rounds_data:
            existing_r = db.query(Round).filter(
                Round.name == r_info["name"],
                Round.category == r_info["category"]
            ).first()
            if not existing_r:
                r_obj = Round(**r_info)
                db.add(r_obj)
                print(f"[SEED] Babak dibuat: {r_info['name']}")

        db.commit()
        print("[SEED] Seeding selesai dengan sukses!")
    except Exception as e:
        db.rollback()
        print(f"[SEED ERROR] Failed seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
