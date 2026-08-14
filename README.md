# OPTIMA - MathQuest Digital Platform

OPTIMA (Olimpiade Prestasi Matematika) MathQuest adalah platform digital pelaksanaan dan manajemen kompetisi matematika berbasis web. Platform ini dikembangkan untuk mendukung rangkaian acara Dies Natalis Jurusan Matematika UIN Siber Syekh Nurjati Cirebon dengan mengusung tema **Mathematics and Talent Rising Through Innovation and Excellence (MATRIX)**.

Platform ini mencakup seluruh alur pelaksanaan olimpiade, mulai dari pendaftaran peserta, pengerjaan kuis dalam mode fokus aman dengan render rumus matematika LaTeX, hingga manajemen babak dan penentuan kualifikasi peserta oleh panitia/admin.

---

## Fitur Utama

### 1. Mode Ujian Fokus & Keamanan Anti-Cheat (Quiz Focus Mode)
- **Keamanan Anti-Cheat**: Membatasi dan mencatat setiap aktivitas perpindahan tab/jendela browser secara riil. Sesi akan otomatis dikumpulkan jika batas perpindahan tab terlampaui.
- **Proteksi Konten**: Mematikan fungsi klik kanan (context menu), copy, dan paste selama ujian berlangsung.
- **Render Rumus Matematika (LaTeX)**: Mengintegrasikan engine KaTeX untuk merender notasi matematika kompleks seperti pecahan, bentuk akar, limit, integral, matriks, dan eksponen secara sempurna.
- **Pewaktu Otomatis**: Alokasi waktu pengerjaan yang menghitung mundur secara presisi dengan penyerahan otomatis saat waktu habis.
- **Gambar & Diagram 3D**: Memuat diagram pendukung soal olimpiade secara responsif.

### 2. Manajemen Babak (Admin Round Manager)
- **Konfigurasi Babak**: Membuat, mengedit, dan mengurutkan babak kuis untuk jenjang SD/MI, SMP/MTs, dan SMA/SMK/MA.
- **Impor Soal Otomatis**: Mendukung pengunggahan dokumen Microsoft Word (.docx) dengan parser cerdas untuk mengurai teks soal, pilihan jawaban (A-D), dan kunci jawaban.
- **Dukungan Sesi Offline**: Opsi pengunggahan berkas presentasi PDF/PowerPoint (.pdf, .ppt) untuk babak final offline di proyektor kelas.
- **Pratinjau Langsung**: Menampilkan daftar soal terurai lengkap dengan render rumus matematika sebelum disimpan ke basis data.

### 3. Klasemen & Kualifikasi (Admin Leaderboard)
- **Pemantauan Riil**: Menampilkan peringkat, skor, jumlah perpindahan tab, dan status peserta per jenjang dan babak.
- **Kualifikasi Otomatis**: Fitur meloloskan 10 peserta terbaik (Top 10) secara otomatis berdasarkan kriteria nilai dan pelanggaran.
- **Ekspor Laporan**: Mengunduh rekapitulasi data klasemen peserta ke dalam format CSV.
- **Notifikasi Bubblechat**: Sistem notifikasi melayang (toast) berdesain terang yang muncul dengan animasi slide-up dari bawah layar untuk memberi umpan balik aksi admin.

### 4. Dasbor Peserta & Pendaftaran
- **Pendaftaran & Otentikasi**: Sistem registrasi akun peserta dan login berbasis JWT dengan pemisahan hak akses (Siswa / Admin).
- **Dasbor Siswa**: Menampilkan informasi babak aktif, petunjuk ujian, dan akses langsung ke mode fokus.
- **Desain Claymorphism**: Antarmuka modern tactile claymorphism dengan palet warna terkurasi, bayangan 3D (clay-shadow), dan mikro-interaksi yang responsif.

---

## Teknologi yang Digunakan

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: TailwindCSS v4, Vanilla CSS (Claymorphism Design System)
- **Math Rendering**: KaTeX 0.18 (`katex`)
- **Icons & Animation**: Motion 12, Material Symbols Outlined
- **Docx Parser**: Mammoth.js

### Backend
- **Framework**: Python FastAPI
- **Database**: PostgreSQL / SQLite (via SQLAlchemy ORM)
- **Autentikasi**: OAuth2 dengan Password Hashing (Passlib / Bcrypt) dan JWT Token (PyJWT)

---

## Struktur Direktori Project

```text
math_olympiad/
├── backend/                  # Kode sumber backend Python FastAPI
│   ├── app/
│   │   ├── config.py         # Konfigurasi aplikasi & variabel lingkungan
│   │   ├── database.py       # Koneksi database SQLAlchemy
│   │   ├── main.py           # Entrypoint utama FastAPI
│   │   ├── models.py         # Skema tabel database (User, Round, Participant, Question, QuizSession)
│   │   ├── schemas.py        # Pydantic data schemas
│   │   ├── security.py       # Hashing password & manipulasi token JWT
│   │   └── routers/          # Endpoint API (auth.py, rounds.py)
│   ├── reset_and_seed.py     # Script inisialisasi & pemulihan data awal
│   └── seed.py               # Script pembenihan data awal
├── src/                      # Kode sumber frontend React TypeScript
│   ├── assets/               # Gambar, logo, dan aset visual
│   ├── components/           # Komponen UI utama
│   │   ├── AdminLeaderboardView.tsx   # Layar klasemen & kualifikasi admin
│   │   ├── AdminRoundManagerView.tsx  # Layar manajer babak & impor soal
│   │   ├── Footer.tsx                 # Komponen kaki halaman
│   │   ├── LandingView.tsx            # Layar landing page utama
│   │   ├── MathText.tsx               # Komponen render rumus matematika KaTeX
│   │   ├── QuizExecutionView.tsx      # Layar mode fokus ujian kuis
│   │   ├── RegisterView.tsx           # Layar pendaftaran & login
│   │   ├── StudentDashboard.tsx       # Layar dasbor siswa
│   │   ├── Toast.tsx                  # Komponen overlay notifikasi bubblechat
│   │   └── TopNavbar.tsx              # Komponen bilah navigasi atas
│   ├── data/                 # Data simulasi & konfigurasi awal
│   ├── services/             # Klien API HTTP (api.ts)
│   ├── types.ts              # Definisi tipe TypeScript
│   ├── App.tsx               # Pengatur rute & state aplikasi utama
│   ├── index.css             # Desain sistem & utilitas animasi CSS
│   └── main.tsx              # Entrypoint React DOM
├── index.html                # Templat HTML utama
├── package.json              # Manifes dependensi Node.js
├── start.bat                 # Script peluncur otomatis Frontend & Backend
└── vite.config.ts            # Konfigurasi bundler Vite
```

---

## Panduan Instalasi & Jalankan Lokal

### Prasyarat
1. Node.js versi 18.x atau yang lebih baru.
2. Python versi 3.10 atau yang lebih baru.

### Langkah 1: Clone Repositori
```bash
git clone https://github.com/mhmdzahids/Math-Olympiad.git
cd Math-Olympiad
```

### Langkah 2: Instalasi Dependensi Frontend
```bash
npm install
```

### Langkah 3: Jalankan Aplikasi

#### Cara 1: Menggunakan Script Peluncur (Windows)
Jalankan file `start.bat` untuk memulihkan basis data, menjalankan server backend Python, dan memulai server dev frontend secara bersamaan:
```cmd
start.bat
```

#### Cara 2: Menjalankan Secara Manual

1. **Jalankan Backend (Terminal 1)**:
   ```bash
   python backend/reset_and_seed.py
   uvicorn backend.app.main:app --reload --port 8000
   ```

2. **Jalankan Frontend (Terminal 2)**:
   ```bash
   npm run dev
   ```

Aplikasi frontend dapat diakses melalui peramban web pada alamat `http://localhost:3000`.

---

## Pengujian Kualitas Kode (Linting)

Untuk memastikan keabsahan tipe TypeScript dan tidak adanya kesalahan sintaks pada kode:
```bash
npm run lint
```

---

## Hak Cipta & Penyelenggara

Diselenggarakan oleh **HIMATIKA Jurusan Matematika - UIN Siber Syekh Nurjati Cirebon**.
Sistem ini dikembangkan khusus untuk mendukung kompetisi olimpiade matematika OPTIMA 2026.
