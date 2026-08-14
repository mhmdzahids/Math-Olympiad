import sys
sys.path.insert(0, 'backend')
from app.database import SessionLocal
from app.models import User, Participant, Round, QuizSession, Qualification, Question, Answer, UserRole, TabSwitchLog
import json

db = SessionLocal()

try:
    # 1. Hapus semua sesi, kualifikasi, jawaban, pertanyaan, dan babak
    db.query(TabSwitchLog).delete()
    db.query(Answer).delete()
    db.query(QuizSession).delete()
    db.query(Qualification).delete()
    db.query(Question).delete()
    db.query(Round).delete()
    db.commit()

    # 2. Cari Admin
    admin = db.query(User).filter(User.role == UserRole.admin).first()
    
    # 3. Cari 1 SD, 1 SMP, 1 SMA
    sd_part = db.query(Participant).filter(Participant.category == 'sd').first()
    smp_part = db.query(Participant).filter(Participant.category == 'smp').first()
    sma_part = db.query(Participant).filter(Participant.category == 'sma').first()
    
    keep_participant_ids = []
    keep_user_ids = []
    
    if admin:
        keep_user_ids.append(admin.id)
    
    participants = {'sd': sd_part, 'smp': smp_part, 'sma': sma_part}
    
    for cat, p in participants.items():
        if p:
            keep_participant_ids.append(p.id)
            keep_user_ids.append(p.user_id)
            
    # 4. Hapus participant yang tidak di-keep
    db.query(Participant).filter(Participant.id.not_in(keep_participant_ids)).delete(synchronize_session=False)
    
    # 5. Hapus user yang tidak di-keep
    db.query(User).filter(User.id.not_in(keep_user_ids)).delete(synchronize_session=False)
    
    db.commit()
    
    # Ambil data akun yang tersisa
    accounts = []
    if admin:
        accounts.append({"role": "Admin", "email": admin.email, "name": "Admin", "password": "password123"})
        
    for cat, p in participants.items():
        if p:
            u = db.query(User).filter(User.id == p.user_id).first()
            if u:
                accounts.append({
                    "role": f"Peserta {cat.upper()}",
                    "email": u.email,
                    "name": p.full_name,
                    "password": "password123" # Default seeder password
                })
                
    print(json.dumps(accounts, indent=2))
    
except Exception as e:
    db.rollback()
    print("ERROR:", e)
finally:
    db.close()
