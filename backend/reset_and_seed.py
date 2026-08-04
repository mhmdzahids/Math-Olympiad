"""
Script Reset & Seeding Data Lengkap Database Math Olympiad (~50 User).
Menghapus seluruh tabel lama, membuat ulang tabel, dan memasukkan data dummy realistis:
- Babak Penyisihan 1 (status: ditutup): Seluruh 50 peserta memiliki skor Penyisihan 1.
- Babak Penyisihan 2 (status: aktif): Hanya peserta yang lolos (Top 10) yang memiliki skor Penyisihan 2.
- Babak Final (status: belum_dibuka): Babak belum dimulai, BELUM ADA sesi/skor kuis untuk Final.
"""
import sys
import os
import random
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
import app.models as models
from app.models import (
    User, Participant, Round, Question, UserRole, Category,
    RoundMode, RoundStatus, QualificationStatus, Qualification,
    QuizSession, SessionStatus, Answer, TabSwitchLog, QuestionImport
)
from app.security import hash_password


def reset_and_seed():
    db = None
    try:
        random.seed(42)  # Seed deterministik agar data konsisten setiap reset

        print("[RESET] Menghapus seluruh tabel lama...")
        Base.metadata.drop_all(bind=engine)
        print("[CREATE] Membuat ulang seluruh tabel database...")
        Base.metadata.create_all(bind=engine)

        db = SessionLocal()
        print("[SEED] Memulai proses seeding data dummy (~50 user & data pengujian)...")

        # -------------------------------------------------------------
        # 1. HASH PASSWORDS
        # -------------------------------------------------------------
        admin_password_hash = hash_password("admin123")
        participant_password_hash = hash_password("peserta123")

        # -------------------------------------------------------------
        # 2. ADMIN USERS
        # -------------------------------------------------------------
        admin_users_data = [
            {
                "email": "admin@matholympiad.id",
                "full_name": "Panitia Admin Utama",
                "school": "Sekretariat Math Olympiad Indonesia",
                "category": Category.sma,
                "grade": "Admin",
                "phone": "081234567890",
            },
            {
                "email": "panitia@matholympiad.id",
                "full_name": "Siti Admin Panitia",
                "school": "Sekretariat Math Olympiad Indonesia",
                "category": Category.sma,
                "grade": "Admin",
                "phone": "081299887766",
            },
        ]

        admin_objs = []
        for a in admin_users_data:
            u_obj = User(
                email=a["email"],
                password_hash=admin_password_hash,
                role=UserRole.admin,
            )
            db.add(u_obj)
            db.flush()

            p_obj = Participant(
                user_id=u_obj.id,
                full_name=a["full_name"],
                school_name=a["school"],
                category=a["category"],
                grade=a["grade"],
                phone=a["phone"],
            )
            db.add(p_obj)
            admin_objs.append(u_obj)
            print(f"  [OK] Admin dibuat: {a['email']}")

        # -------------------------------------------------------------
        # 3. GENERATE 50 PARTICIPANTS (SD, SMP, SMA)
        # -------------------------------------------------------------
        first_names = [
            "Ahmad", "Siti", "Budi", "Dewi", "Andi", "Citra", "Eka", "Fajar",
            "Gita", "Hadi", "Indah", "Joko", "Kartika", "Lestari", "Muhammad",
            "Nabila", "Oscar", "Putri", "Rian", "Salsa", "Taufik", "Utami",
            "Vina", "Wahyu", "Yusuf", "Zahra", "Dimas", "Rizky", "Anisa", "Farhan"
        ]
        last_names = [
            "Wijaya", "Santoso", "Lestari", "Pratama", "Kusuma", "Hidayat",
            "Saputra", "Nugroho", "Utomo", "Firmansyah", "Ramadhan", "Wibowo",
            "Setiawan", "Suryani", "Putra", "Hidayanti", "Kurniawan", "Sihombing"
        ]

        schools_sd = [
            "SD N 1 Jakarta", "SD Al-Azhar 1", "SD N 3 Surabaya", "SD Santa Ursula",
            "SD N 5 Bandung", "SD Muhammadiyah 1", "SD N 2 Semarang", "SD Islam Terpadu"
        ]
        schools_smp = [
            "SMP N 1 Jakarta", "SMP N 2 Bandung", "SMP N 5 Yogyakarta", "SMP Labschool Jakarta",
            "SMP N 3 Semarang", "SMP Al-Azhar 9", "SMP N 1 Surabaya", "SMP Penabur"
        ]
        schools_sma = [
            "SMA N 1 Jakarta", "SMA N 3 Bandung", "SMA N 8 Jakarta", "SMA N 1 Yogyakarta",
            "SMA N 5 Surabaya", "SMA N 2 Semarang", "SMA Taruna Nusantara", "SMA Al-Azhar 1"
        ]

        demo_participants = [
            {"email": "andi@sekolah.sch.id", "full_name": "Andi Wijaya", "school": "SMA Negeri 1 Jakarta", "category": Category.sma, "grade": "Kelas 11", "phone": "081987654321"},
            {"email": "budi@smp.sch.id", "full_name": "Budi Santoso", "school": "SMP Negeri 2 Bandung", "category": Category.smp, "grade": "Kelas 8", "phone": "081223344556"},
            {"email": "citra@sd.sch.id", "full_name": "Citra Lestari", "school": "SD IT Al-Azhar Surabaya", "category": Category.sd, "grade": "Kelas 5", "phone": "085667788990"},
        ]

        participants_data = list(demo_participants)
        categories_target = [Category.sd] * 15 + [Category.smp] * 16 + [Category.sma] * 16

        for idx, cat in enumerate(categories_target, start=4):
            fn = first_names[idx % len(first_names)]
            ln = last_names[(idx * 3) % len(last_names)]
            name = f"{fn} {ln}"
            
            if cat == Category.sd:
                sch = schools_sd[idx % len(schools_sd)]
                grd = f"Kelas {random.choice([4, 5, 6])}"
                email = f"peserta.sd.{idx}@sekolah.sch.id"
            elif cat == Category.smp:
                sch = schools_smp[idx % len(schools_smp)]
                grd = f"Kelas {random.choice([7, 8, 9])}"
                email = f"peserta.smp.{idx}@sekolah.sch.id"
            else:
                sch = schools_sma[idx % len(schools_sma)]
                grd = f"Kelas {random.choice([10, 11, 12])}"
                email = f"peserta.sma.{idx}@sekolah.sch.id"

            participants_data.append({
                "email": email,
                "full_name": name,
                "school": sch,
                "category": cat,
                "grade": grd,
                "phone": f"081{random.randint(10000000, 99999999)}"
            })

        participants_by_cat = {Category.sd: [], Category.smp: [], Category.sma: []}
        all_participant_objs = []

        for p_data in participants_data:
            u_obj = User(
                email=p_data["email"],
                password_hash=participant_password_hash,
                role=UserRole.participant,
            )
            db.add(u_obj)
            db.flush()

            part_obj = Participant(
                user_id=u_obj.id,
                full_name=p_data["full_name"],
                school_name=p_data["school"],
                category=p_data["category"],
                grade=p_data["grade"],
                phone=p_data["phone"],
            )
            db.add(part_obj)
            db.flush()

            participants_by_cat[p_data["category"]].append(part_obj)
            all_participant_objs.append(part_obj)

        print(f"  [OK] 50 Peserta dibuat (SD: {len(participants_by_cat[Category.sd])}, SMP: {len(participants_by_cat[Category.smp])}, SMA: {len(participants_by_cat[Category.sma])})")

        # -------------------------------------------------------------
        # 4. ROUNDS (STATUS BABAK REALISTIS)
        # -------------------------------------------------------------
        rounds_list = [
            # SD
            {"name": "Babak Penyisihan 1 (SD)", "order_index": 1, "mode": RoundMode.online, "category": Category.sd, "status": RoundStatus.ditutup, "duration_minutes": 60, "question_count": 5, "tab_switch_limit": 3},
            {"name": "Babak Penyisihan 2 (SD)", "order_index": 2, "mode": RoundMode.online, "category": Category.sd, "status": RoundStatus.aktif, "duration_minutes": 60, "question_count": 5, "tab_switch_limit": 3},
            {"name": "Babak Final (SD)", "order_index": 3, "mode": RoundMode.offline, "category": Category.sd, "status": RoundStatus.belum_dibuka, "duration_minutes": 120, "question_count": 5, "tab_switch_limit": 0},
            # SMP
            {"name": "Babak Penyisihan 1 (SMP)", "order_index": 1, "mode": RoundMode.online, "category": Category.smp, "status": RoundStatus.ditutup, "duration_minutes": 60, "question_count": 5, "tab_switch_limit": 3},
            {"name": "Babak Penyisihan 2 (SMP)", "order_index": 2, "mode": RoundMode.online, "category": Category.smp, "status": RoundStatus.aktif, "duration_minutes": 60, "question_count": 5, "tab_switch_limit": 3},
            {"name": "Babak Final (SMP)", "order_index": 3, "mode": RoundMode.offline, "category": Category.smp, "status": RoundStatus.belum_dibuka, "duration_minutes": 120, "question_count": 5, "tab_switch_limit": 0},
            # SMA
            {"name": "Babak Penyisihan 1 (SMA)", "order_index": 1, "mode": RoundMode.online, "category": Category.sma, "status": RoundStatus.ditutup, "duration_minutes": 60, "question_count": 5, "tab_switch_limit": 3},
            {"name": "Babak Penyisihan 2 (SMA)", "order_index": 2, "mode": RoundMode.online, "category": Category.sma, "status": RoundStatus.aktif, "duration_minutes": 90, "question_count": 5, "tab_switch_limit": 3},
            {"name": "Babak Final (SMA)", "order_index": 3, "mode": RoundMode.offline, "category": Category.sma, "status": RoundStatus.belum_dibuka, "duration_minutes": 120, "question_count": 5, "tab_switch_limit": 0},
        ]

        created_rounds = {}
        for r in rounds_list:
            r_obj = Round(**r)
            db.add(r_obj)
            db.flush()
            created_rounds[r["name"]] = r_obj

        print(f"  [OK] {len(created_rounds)} Babak olimpiade berhasil dibuat")

        # -------------------------------------------------------------
        # 5. BANK SOAL (QUESTIONS)
        # -------------------------------------------------------------
        sample_questions_sd = [
            {
                "question_text": "Berapakah hasil dari 12 + 35 × 2 - 10?",
                "options": [{"key": "A", "text": "72"}, {"key": "B", "text": "84"}, {"key": "C", "text": "62"}, {"key": "D", "text": "90"}],
                "correct_answer": "C",
            },
            {
                "question_text": "Sebuah persegi panjang memiliki panjang 15 cm dan lebar 8 cm. Berapakah keliling persegi panjang tersebut?",
                "options": [{"key": "A", "text": "46 cm"}, {"key": "B", "text": "120 cm"}, {"key": "C", "text": "30 cm"}, {"key": "D", "text": "52 cm"}],
                "correct_answer": "A",
            },
            {
                "question_text": "Pecahan senilai dari 3/4 yang memiliki penyebut 20 adalah...",
                "options": [{"key": "A", "text": "12/20"}, {"key": "B", "text": "15/20"}, {"key": "C", "text": "16/20"}, {"key": "D", "text": "10/20"}],
                "correct_answer": "B",
            },
            {
                "question_text": "KPK dari 12 dan 18 adalah...",
                "options": [{"key": "A", "text": "36"}, {"key": "B", "text": "24"}, {"key": "C", "text": "72"}, {"key": "D", "text": "6"}],
                "correct_answer": "A",
            },
            {
                "question_text": "Berapakah 15% dari 200?",
                "options": [{"key": "A", "text": "20"}, {"key": "B", "text": "25"}, {"key": "C", "text": "35"}, {"key": "D", "text": "30"}],
                "correct_answer": "D",
            },
        ]

        sample_questions_smp = [
            {
                "question_text": "Jika 3x + 7 = 22, maka nilai dari 2x - 5 adalah...",
                "options": [{"key": "A", "text": "5"}, {"key": "B", "text": "10"}, {"key": "C", "text": "15"}, {"key": "D", "text": "20"}],
                "correct_answer": "A",
            },
            {
                "question_text": "Sebuah segitiga siku-siku memiliki panjang alas 6 cm dan tinggi 8 cm. Panjang sisi miringnya adalah...",
                "options": [{"key": "A", "text": "10 cm"}, {"key": "B", "text": "12 cm"}, {"key": "C", "text": "14 cm"}, {"key": "D", "text": "9 cm"}],
                "correct_answer": "A",
            },
            {
                "question_text": "Hasil perkalian dari (2x + 3)(x - 4) adalah...",
                "options": [{"key": "A", "text": "2x^2 - 5x - 12"}, {"key": "B", "text": "2x^2 + 5x - 12"}, {"key": "C", "text": "2x^2 - 11x - 12"}, {"key": "D", "text": "2x^2 - 5x + 12"}],
                "correct_answer": "A",
            },
            {
                "question_text": "Rata-rata nilai matematika 5 siswa adalah 80. Jika ditambah nilai Budi, rata-ratanya menjadi 82. Nilai Budi adalah...",
                "options": [{"key": "A", "text": "92"}, {"key": "B", "text": "88"}, {"key": "C", "text": "90"}, {"key": "D", "text": "86"}],
                "correct_answer": "A",
            },
            {
                "question_text": "Nilai dari (-2)^4 + 3^3 adalah...",
                "options": [{"key": "A", "text": "35"}, {"key": "B", "text": "41"}, {"key": "C", "text": "43"}, {"key": "D", "text": "45"}],
                "correct_answer": "C",
            },
        ]

        sample_questions_sma = [
            {
                "question_text": "Diketahui f(x) = 2x^2 - 3x + 5. Turunan pertama f'(x) adalah...",
                "options": [{"key": "A", "text": "4x - 3"}, {"key": "B", "text": "2x - 3"}, {"key": "C", "text": "4x + 5"}, {"key": "D", "text": "4x^2 - 3"}],
                "correct_answer": "A",
            },
            {
                "question_text": "Hasil dari Integral (3x^2 + 4x - 1) dx adalah...",
                "options": [{"key": "A", "text": "x^3 + 2x^2 - x + C"}, {"key": "B", "text": "3x^3 + 2x^2 - x + C"}, {"key": "C", "text": "x^3 + 4x^2 - x + C"}, {"key": "D", "text": "6x + 4 + C"}],
                "correct_answer": "A",
            },
            {
                "question_text": "Nilai dari log2(16) + log3(27) adalah...",
                "options": [{"key": "A", "text": "7"}, {"key": "B", "text": "6"}, {"key": "C", "text": "12"}, {"key": "D", "text": "5"}],
                "correct_answer": "A",
            },
            {
                "question_text": "Dalam sebuah himpunan 10 orang, berapa banyak cara memilih ketua, sekretaris, dan bendahara?",
                "options": [{"key": "A", "text": "720"}, {"key": "B", "text": "120"}, {"key": "C", "text": "504"}, {"key": "D", "text": "210"}],
                "correct_answer": "A",
            },
            {
                "question_text": "Persamaan kuadrat x^2 - 5x + 6 = 0 memiliki akar x1 dan x2. Nilai x1 + x2 adalah...",
                "options": [{"key": "A", "text": "6"}, {"key": "B", "text": "5"}, {"key": "C", "text": "-5"}, {"key": "D", "text": "-6"}],
                "correct_answer": "B",
            },
        ]

        questions_by_round = {}

        def insert_questions(round_obj, questions_list):
            q_objs = []
            for idx, q in enumerate(questions_list):
                q_obj = Question(
                    round_id=round_obj.id,
                    category=round_obj.category,
                    question_text=q["question_text"],
                    options=q["options"],
                    correct_answer=q["correct_answer"],
                    order_index=idx + 1
                )
                db.add(q_obj)
                db.flush()
                q_objs.append(q_obj)
            questions_by_round[round_obj.id] = q_objs

        for cat_str, q_list in [("SD", sample_questions_sd), ("SMP", sample_questions_smp), ("SMA", sample_questions_sma)]:
            insert_questions(created_rounds[f"Babak Penyisihan 1 ({cat_str})"], q_list)
            insert_questions(created_rounds[f"Babak Penyisihan 2 ({cat_str})"], q_list)
            insert_questions(created_rounds[f"Babak Final ({cat_str})"], q_list)

        print("  [OK] Soal-soal olimpiade berhasil dimasukkan")

        # -------------------------------------------------------------
        # 6. QUIZ SESSIONS REALISTIS
        # -------------------------------------------------------------
        now = datetime.now(timezone.utc)
        admin_user = admin_objs[0]

        def create_session(part, round_obj, started_base, perf_ratio):
            questions = questions_by_round[round_obj.id]
            started = started_base - timedelta(hours=random.randint(1, 12), minutes=random.randint(0, 50))
            ends = started + timedelta(minutes=round_obj.duration_minutes)

            rand_val = random.random()
            if rand_val < 0.85:
                status = SessionStatus.completed
                submitted_at = started + timedelta(minutes=random.randint(20, round_obj.duration_minutes - 5))
                tab_switches = random.choice([0, 0, 0, 1, 2])
            elif rand_val < 0.93:
                status = SessionStatus.force_ended_timeout
                submitted_at = ends
                tab_switches = random.choice([0, 1, 2])
            else:
                status = SessionStatus.force_ended_tabswitch
                submitted_at = started + timedelta(minutes=random.randint(15, 30))
                tab_switches = 3

            session = QuizSession(
                participant_id=part.id,
                round_id=round_obj.id,
                started_at=started,
                ends_at=ends,
                submitted_at=submitted_at,
                status=status,
                tab_switch_count=tab_switches,
                score=None,
            )
            db.add(session)
            db.flush()

            if tab_switches > 0:
                for ts_i in range(tab_switches):
                    ts_time = started + timedelta(minutes=(ts_i + 1) * 6)
                    db.add(TabSwitchLog(session_id=session.id, occurred_at=ts_time))

            correct_count = 0
            total_q = len(questions)
            for q_i, q in enumerate(questions):
                is_correct = (random.random() < perf_ratio)
                if is_correct:
                    chosen = q.correct_answer
                    correct_count += 1
                else:
                    wrong_options = [opt["key"] for opt in q.options if opt["key"] != q.correct_answer]
                    chosen = random.choice(wrong_options) if wrong_options else "A"

                db.add(Answer(
                    session_id=session.id,
                    question_id=q.id,
                    selected_answer=chosen,
                    is_flagged=(random.random() < 0.10),
                    answered_at=started + timedelta(minutes=(q_i + 1) * 4)
                ))

            calculated_score = round((correct_count / total_q) * 100, 2)
            session.score = calculated_score
            return session, calculated_score

        # --- A. BABAK PENYISIHAN 1 (Semua 50 Peserta Memiliki Skor P1) ---
        scores_p1 = {Category.sd: [], Category.smp: [], Category.sma: []}

        for cat, participants in participants_by_cat.items():
            round_p1 = created_rounds[f"Babak Penyisihan 1 ({cat.value.upper()})"]

            for p_idx, part in enumerate(participants):
                # Variasi performa Babak 1
                if p_idx % 4 == 0:
                    perf = 1.0  # Skor 100
                elif p_idx % 4 == 1:
                    perf = 0.8  # Skor 80
                elif p_idx % 4 == 2:
                    perf = 0.6  # Skor 60
                else:
                    perf = 0.4  # Skor 40

                session, score = create_session(part, round_p1, now - timedelta(days=5), perf)
                scores_p1[cat].append((part, score))

        print("  [OK] Babak Penyisihan 1: 50 Quiz Sessions diisi (Selesai/Ditutup)")

        # --- B. BABAK PENYISIHAN 2 (Hanya Top 10 Lolos & Memiliki Skor P2 yang Berbeda) ---
        scores_p2 = {Category.sd: [], Category.smp: [], Category.sma: []}

        for cat, part_scores in scores_p1.items():
            part_scores.sort(key=lambda x: x[1], reverse=True)
            round_p2 = created_rounds[f"Babak Penyisihan 2 ({cat.value.upper()})"]

            for rank, (part, score_p1) in enumerate(part_scores, start=1):
                if rank <= 10:
                    qual_status = QualificationStatus.lolos
                    # Performa P2 yang independen agar skor P2 berbeda dari P1!
                    p2_perf = random.choice([0.6, 0.8, 1.0])
                    session, score_p2_val = create_session(part, round_p2, now - timedelta(days=1), p2_perf)
                    scores_p2[cat].append((part, score_p2_val))
                elif rank <= 13:
                    qual_status = QualificationStatus.belum_ditentukan
                else:
                    qual_status = QualificationStatus.tidak_lolos

                db.add(Qualification(
                    participant_id=part.id,
                    round_id=round_p2.id,
                    status=qual_status,
                    decided_by_admin_id=admin_user.id if qual_status != QualificationStatus.belum_ditentukan else None,
                    decided_at=now - timedelta(days=3) if qual_status != QualificationStatus.belum_ditentukan else None,
                ))

        print("  [OK] Babak Penyisihan 2: 30 Quiz Sessions diisi untuk Top 10 yang Lolos")

        # --- C. BABAK FINAL (BELUM DIBUKA — TIDAK ADA QUIZ SESSION MAUPUN SKOR) ---
        for cat, part_scores_p2 in scores_p2.items():
            part_scores_p2.sort(key=lambda x: x[1], reverse=True)
            round_final = created_rounds[f"Babak Final ({cat.value.upper()})"]

            # Kualifikasi Final: Top 4 dari P2 berstatus 'lolos' ke Final, tetapi BELUM PUNYA SKOR karena Babak Final belum dibuka!
            for rank, (part, score_p2) in enumerate(part_scores_p2, start=1):
                if rank <= 4:
                    qual_status = QualificationStatus.lolos
                elif rank <= 6:
                    qual_status = QualificationStatus.belum_ditentukan
                else:
                    qual_status = QualificationStatus.tidak_lolos

                db.add(Qualification(
                    participant_id=part.id,
                    round_id=round_final.id,
                    status=qual_status,
                    decided_by_admin_id=admin_user.id if qual_status != QualificationStatus.belum_ditentukan else None,
                    decided_at=now - timedelta(hours=12) if qual_status != QualificationStatus.belum_ditentukan else None,
                ))

        print("  [OK] Babak Final: Kualifikasi diisi (Status babak 'belum_dibuka', 0 Sesi Kuis)")

        db.commit()
        print("\n==================================================")
        print("RESET DATABASE & SEEDING REALISTIS BERHASIL 100%!")
        print("==================================================")

    except Exception as e:
        if db:
            db.rollback()
        print(f"[ERROR] Gagal melakukan reset & seed database: {e}")
        sys.exit(1)
    finally:
        if db:
            db.close()
        engine.dispose()


if __name__ == "__main__":
    reset_and_seed()
