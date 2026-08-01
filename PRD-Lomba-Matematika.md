# Product Requirements Document (PRD)
## Platform Lomba Matematika Online

**Versi:** 1.3 — babak menjadi jumlah fleksibel (bukan fixed 3) dengan auto-labeling "Final" pada babak terakhir; menambahkan FR-A10 (randomize soal) dan `is_randomized` di data model
**Tanggal:** 1 Agustus 2026
**Status:** Draft

---

## 1. Ringkasan Produk

### 1.1 Latar Belakang
Lomba matematika membutuhkan platform digital untuk mengelola pendaftaran peserta, penyajian soal, pengerjaan quiz dengan batas waktu, dan penilaian hasil secara otomatis, berjalan lintas **beberapa babak/sesi** kompetisi yang jumlahnya bisa disesuaikan panitia. Platform ini menggantikan proses manual (kertas/Google Form) dengan sistem yang bisa mendeteksi kecurangan dasar (berpindah tab) dan memberi admin visibilitas penuh atas jalannya lomba di setiap babak.

### 1.2 Tujuan
- Menyediakan sistem ujian online yang adil, sulit dicurangi, dan mudah dipakai peserta dari berbagai jenjang (SD-SMP dan SMA).
- Memberi panitia (admin) kontrol penuh: memonitor peserta real-time, menilai otomatis, mengelola kelulusan antar babak, dan mengekspor data hasil.
- Mendukung struktur **babak berjenjang dengan jumlah fleksibel** — admin bisa menambah, menghapus, dan mengurutkan ulang babak sesuai kebutuhan lomba (tidak dihardcode ke jumlah tertentu). Contoh konfigurasi tipikal:
  1. **Babak Penyisihan 1** — online (peserta dari lokasi masing-masing)
  2. **Babak Penyisihan 2** — online (peserta dari lokasi masing-masing)
  3. *(opsional, bisa ditambah lebih banyak babak penyisihan sesuai kebutuhan)*
  4. **Babak Final** — babak paling terakhir dalam urutan, mode-nya (online/offline) ditentukan admin (tipikal: offline, seluruh peserta dalam satu venue/jaringan)
- **Babak yang berada di posisi terakhir dalam urutan otomatis diberi label "Final"** oleh sistem — admin tidak perlu mengetik nama ini manual, dan label ini otomatis berpindah kalau admin menambah/menghapus/menggeser urutan babak.
- Hanya peserta yang **lolos** dari babak sebelumnya yang bisa mengakses babak berikutnya.

### 1.3 Target Pengguna
| Peran | Deskripsi |
|---|---|
| Peserta | Siswa SD-SMP atau SMA yang mendaftar dan mengerjakan quiz di tiap babak sesuai status kelulusannya |
| Admin/Panitia | Mengelola soal per babak, memonitor peserta, menilai, menentukan kelulusan antar babak, mengatur jumlah & urutan babak, dan mengekspor data |

### 1.4 Skala & Asumsi
- Estimasi hingga **100 peserta bersamaan** dalam satu babak (jumlah peserta menyusut di babak lanjutan karena sistem gugur).
- Jumlah babak **tidak tetap** — ditentukan admin per pelaksanaan lomba (minimal 1 babak, tidak ada batas atas yang di-hardcode, meski secara praktis wajar berkisar 2-5 babak).
- Babak selain yang terakhir (Penyisihan 1, 2, dst.) tipikalnya online: peserta tersebar dari berbagai jaringan/lokasi.
- Babak Final (posisi terakhir dalam urutan) tipikalnya offline: peserta berada dalam satu jaringan (WiFi/venue), sehingga bisa berbagi IP publik yang sama. Namun mode babak (online/offline) tetap dikonfigurasi eksplisit oleh admin per babak, bukan diasumsikan otomatis dari posisi.
- **Asumsi kelulusan** (perlu dikonfirmasi — lihat Open Questions): kelulusan antar babak ditentukan **manual oleh admin** berdasarkan ranking skor per kategori, bukan otomatis oleh sistem. Sistem hanya menyediakan data ranking; keputusan akhir "siapa yang lolos" tetap keputusan panitia (misalnya karena ada pertimbangan non-skor).
- Setiap babak punya bank soal, durasi, dan (berpotensi) aturan tab-switch tersendiri — dikonfigurasi terpisah oleh admin.

---

## 2. Ruang Lingkup

### 2.1 Termasuk Dalam Scope (v1)
- Registrasi & login peserta
- Pembagian kategori: SD-SMP dan SMA
- **Struktur babak dengan jumlah fleksibel** (bukan hardcode 3) — admin bisa tambah/hapus/urutkan babak, dengan bank soal & konfigurasi terpisah per babak
- **Auto-labeling "Final"** pada babak di posisi terakhir dalam urutan, otomatis berpindah saat urutan babak berubah
- **Status kelulusan per peserta per babak** (lolos / tidak lolos / belum ditentukan)
- **Gerbang akses babak**: peserta hanya bisa mengerjakan babak yang sedang aktif DAN yang mereka lolos untuk mengikutinya
- **Import soal dari file Word (.docx)** per kategori & per babak, dengan tahap preview sebelum soal masuk ke bank soal aktif
- Pengerjaan quiz dengan timer per kategori & per babak
- Navigasi bebas antar soal (skip, tandai/flag soal)
- Deteksi tab-switch/window-blur dengan auto-submit setelah batas tertentu
- Dashboard admin: ringkasan peserta per babak, detail per peserta, skor, jumlah tab-switch
- **Panel kelulusan admin**: melihat ranking per kategori per babak, menandai peserta lolos/tidak ke babak berikutnya
- Export data ke CSV (per babak & gabungan)

### 2.2 Di Luar Scope (v1)
- Pembayaran/biaya pendaftaran
- Notifikasi email/SMS otomatis (termasuk notifikasi otomatis "Anda lolos ke babak berikutnya" — pengumuman tetap manual oleh panitia di luar sistem untuk v1)
- Aplikasi mobile native (cukup web responsive)
- Proctoring via kamera/AI (hanya deteksi tab-switch, bukan face detection) — termasuk untuk babak final offline
- Soal berbentuk essay/upload file (asumsi: pilihan ganda di semua babak)
- Multi-bahasa
- Penentuan kelulusan otomatis berbasis threshold skor (v1 tetap keputusan manual admin, lihat 1.4)
- OCR/parsing dari file scan (PDF hasil scan, foto soal) — import soal hanya mendukung file **.docx** dengan struktur teks yang bisa dibaca langsung, bukan gambar/scan
- Editor rumus matematika (LaTeX/MathML) built-in — rumus dalam soal ditangani sebagai gambar (lihat FR-A9)

---

## 3. User Roles & Permissions

| Aksi | Peserta | Admin |
|---|:---:|:---:|
| Register akun sendiri | ✅ | ❌ (dibuat manual/pre-provisioned) |
| Login | ✅ | ✅ |
| Mengerjakan quiz | ✅ | ❌ |
| Melihat soal & jawaban benar sebelum submit | ❌ | ❌ |
| Melihat dashboard peserta | ❌ | ✅ |
| Melihat skor & detail semua peserta | ❌ | ✅ |
| Export CSV | ❌ | ✅ |
| Kelola bank soal per babak | ❌ | ✅ |
| Buka/tutup babak (aktifkan sesi) | ❌ | ✅ |
| Tentukan kelulusan peserta antar babak | ❌ | ✅ |

> **Catatan:** Admin **tidak** memiliki jalur registrasi publik untuk mencegah penyalahgunaan. Akun admin dibuat manual oleh pemilik sistem.

---

## 4. Functional Requirements — Peserta

### FR-P1: Registrasi & Login
- Peserta mendaftar dengan: nama lengkap, email, password, asal sekolah, kategori (SD-SMP / SMA), kelas.
- Validasi: email unik, password minimal 8 karakter.
- **Untuk sesi offline**, disediakan opsi *pre-provisioned account* (dibuat admin di muka, peserta tinggal login) untuk menghindari isu rate-limit saat banyak peserta mendaftar dari IP/jaringan yang sama secara bersamaan.

### FR-P2: Status Babak & Gerbang Akses
- Setelah login, peserta melihat **halaman status babak** yang menunjukkan salah satu kondisi berikut untuk babak yang sedang berjalan:
  - **Belum dibuka** — babak belum diaktifkan admin, tombol mulai disabled dengan info jadwal (jika tersedia)
  - **Bisa dikerjakan** — peserta lolos ke babak ini (atau ini Babak Penyisihan 1, yang terbuka untuk semua peserta terdaftar) dan babak sedang aktif
  - **Tidak lolos** — peserta tidak lolos dari babak sebelumnya, tidak bisa mengakses babak ini, ditampilkan pesan yang jelas ("Anda tidak lolos ke babak berikutnya")
  - **Sudah selesai** — peserta sudah mengerjakan babak ini, menampilkan ringkasan (bukan skor, lihat FR-P6)
- Peserta **tidak bisa** mengakses babak manapun yang belum menjadi babak aktif saat itu, walau URL-nya diketik langsung (validasi di server, bukan hanya disembunyikan di UI).

### FR-P3: Mulai Quiz
- Peserta melihat halaman "Mulai Quiz" sesuai kategori yang terdaftar (tidak bisa pilih kategori lain) dan babak yang sedang aktif serta ia berhak ikuti.
- Peserta hanya bisa memulai **satu kali per babak** — jika sudah pernah memulai babak tsb dan belum selesai, sistem redirect ke sesi yang sedang berjalan (bukan mulai dari awal).
- Begitu tombol "Mulai" ditekan, timer server mulai berjalan dan tidak bisa direset dengan refresh/tutup browser.

### FR-P4: Timer
| Kategori | Durasi default |
|---|---|
| SD-SMP | 60 menit |
| SMA | 90 menit |

- Durasi dikonfigurasi **per babak** oleh admin (nilai di atas adalah default; babak final berpotensi punya durasi berbeda — lihat Open Questions).
- Timer dihitung dan divalidasi di **server** (bukan hanya client-side), untuk mencegah manipulasi lewat DevTools atau ubah jam sistem.
- Saat waktu habis, sistem otomatis submit jawaban yang sudah terisi dan mengunci sesi (status: `force_ended_timeout`).
- Peserta melihat countdown visual yang disinkronkan dari waktu server.

### FR-P5: Navigasi Soal
- Peserta bisa berpindah ke soal nomor berapa pun secara bebas (tidak linear).
- Peserta bisa menandai (flag) soal yang ingin ditinjau ulang.
- Tersedia panel navigasi yang menunjukkan status tiap soal: **belum dijawab / sudah dijawab / ditandai**.
- Jawaban tersimpan otomatis (auto-save) setiap kali peserta memilih opsi — tidak bergantung pada tombol submit di akhir.

### FR-P6: Deteksi Tab-Switch / Keluar Window
- Sistem mendeteksi setiap kali peserta berpindah tab atau meng-*minimize*/kehilangan fokus jendela browser (`visibilitychange` + `window blur`).
- Setiap kejadian dicatat dan dihitung di server, **per sesi babak** (counter reset di setiap babak baru — pelanggaran di Penyisihan 1 tidak terbawa ke Penyisihan 2).
- **Jika jumlah kejadian ≥ 3 kali**, sesi babak tsb otomatis diakhiri (status: `force_ended_tabswitch`), jawaban yang sudah terisi tersimpan sebagai hasil akhir.
- Peserta mendapat peringatan visual setiap kali terdeteksi (misal: "Peringatan 1/3 — jangan berpindah tab").
- Ambang batas (default 3x) dapat dikonfigurasi berbeda per babak oleh admin — misalnya babak final offline berpotensi punya kebijakan lebih ketat karena ada pengawasan fisik tambahan di venue (lihat Open Questions).

### FR-P7: Submit & Selesai
- Peserta bisa submit manual sebelum waktu habis.
- Setelah submit (manual, timeout, atau force-ended tab-switch), peserta diarahkan ke halaman "Selesai [Nama Babak]" dan tidak bisa mengakses soal babak tsb lagi.
- Skor **tidak ditampilkan** ke peserta secara langsung (kebijakan bisa disesuaikan — lihat Open Questions).
- Peserta kembali ke **halaman status babak** (FR-P2) untuk menunggu babak berikutnya dibuka, bukan langsung tahu apakah ia lolos atau tidak.

---

## 5. Functional Requirements — Admin

### FR-A1: Login Admin
- Login terpisah dari peserta, akun dibuat manual (lihat FR-P1 note).

### FR-A2: Manajemen Babak
- Admin bisa melihat daftar babak (jumlahnya **fleksibel**, bukan hardcode 3) dengan status masing-masing: `belum_dibuka`, `aktif`, `ditutup`.
- Admin bisa **menambah babak baru** (kapan saja, tidak dibatasi harus di awal), **menghapus babak**, dan **mengubah urutan babak** (reorder), dengan konfirmasi tambahan jika babak yang akan dihapus sudah punya soal atau data peserta.
- **Auto-labeling "Final"**: babak yang berada di **posisi terakhir** dalam urutan otomatis diberi label/badge "Final" oleh sistem. Ini dihitung ulang otomatis setiap kali admin menambah, menghapus, atau menggeser urutan babak — admin tidak pernah mengetik nama "Final" secara manual. Babak selain yang terakhir tetap bisa diberi nama bebas oleh admin (misal "Babak Penyisihan 1", "Babak Penyisihan 2", dst.).
- Admin **membuka/menutup babak** secara manual — hanya satu babak yang boleh `aktif` per kategori pada satu waktu (sistem mencegah 2 babak aktif bersamaan untuk kategori yang sama, untuk menghindari kebingungan status peserta).
- Admin mengatur konfigurasi tiap babak: nama (kecuali babak terakhir, yang labelnya otomatis), mode (online/offline — dikonfigurasi eksplisit, tidak diasumsikan dari posisi), durasi timer, ambang batas tab-switch, bank soal yang dipakai.
- **Selector babak** tersedia di seluruh halaman admin (dashboard, daftar peserta, detail peserta) untuk berpindah konteks antar babak.

### FR-A3: Panel Kelulusan Antar Babak
- Setelah sebuah babak ditutup, admin melihat **ranking peserta per kategori** berdasarkan skor babak tsb.
- Admin memilih/menandai peserta mana yang **lolos** ke babak berikutnya (checkbox per peserta, atau aksi massal "loloskan top N" sebagai shortcut, tetap bisa disesuaikan manual satu-satu).
- Status kelulusan tersimpan per peserta per babak: `lolos`, `tidak_lolos`, `belum_ditentukan`.
- Keputusan ini yang menentukan gerbang akses peserta di FR-P2 pada babak berikutnya.

### FR-A4: Dashboard Ringkasan
- Ditampilkan **dalam konteks babak yang sedang dipilih** admin (lihat FR-A2 selector).
- Jumlah total peserta terdaftar (per kategori: SD-SMP / SMA) untuk babak tsb.
- Jumlah peserta yang sedang mengerjakan / sudah selesai / belum mulai / tidak lolos (tidak berhak ikut) pada babak tsb.
- Jumlah peserta yang di-force-end karena tab-switch.

### FR-A5: Detail Peserta
- Tabel/list peserta pada babak yang dipilih, dengan filter (kategori, status).
- Detail per peserta: identitas lengkap (nama, sekolah, kelas, email), **riwayat lintas seluruh babak** yang ada (skor & status kelulusan per babak, sesuai jumlah babak yang dikonfigurasi admin), status sesi babak aktif, waktu mulai/selesai, jumlah tab-switch, dan (opsional) log waktu setiap kejadian tab-switch.

### FR-A6: Penilaian
- Skor dihitung otomatis oleh sistem berdasarkan jawaban benar/salah (asumsi: pilihan ganda, tidak perlu penilaian manual), dihitung terpisah per babak.
- Admin bisa melihat breakdown jawaban per soal untuk setiap peserta di tiap babak (opsional, untuk audit).

### FR-A7: Export CSV
- Admin bisa mengekspor data per babak, atau gabungan seluruh babak (rekap akhir), ke file CSV.
- Minimal kolom: nama, sekolah, kategori, babak, skor, jumlah tab-switch, status kelulusan, waktu mulai, waktu selesai.
- Export dilakukan di server (streaming), tidak membebani browser admin untuk data besar.

### FR-A8: Admin Control
- Kelola bank soal per babak (tambah/edit/hapus soal per kategori per babak).
- Kemampuan untuk manual override status sesi peserta tertentu (misal: force-end karena masalah teknis di luar kendali peserta, atau reset sesi jika terjadi bug) — termasuk override status kelulusan jika ada koreksi.

### FR-A9: Import Soal dari File Word (.docx)
- Sebelum upload, admin **wajib memilih kategori** (SD-SMP / SMA) dan **babak** (dipilih dari daftar babak yang sudah dikonfigurasi di FR-A2, termasuk babak yang otomatis berlabel "Final") yang dituju — soal hasil import otomatis ter-tag ke kombinasi ini.
- Admin upload satu file `.docx` berisi kumpulan soal (format terstruktur — lihat asumsi format di bawah).
- Sistem mem-parsing dokumen dan menampilkan **halaman preview** berisi seluruh soal yang berhasil dideteksi (teks soal, 4 opsi jawaban, jawaban benar yang terdeteksi) — **belum masuk ke bank soal aktif** pada tahap ini.
- Soal yang gagal diparsing (format tidak sesuai/ambigu) ditandai jelas secara visual di preview, dengan opsi bagi admin untuk **edit manual langsung di preview** atau **skip** soal tsb.
- Admin meninjau preview, melakukan koreksi bila perlu, lalu klik "Konfirmasi & Simpan" untuk memasukkan seluruh soal yang sudah divalidasi ke bank soal.
- Tersedia juga **form tambah soal manual** satu-per-satu (bukan hanya lewat import file) sebagai pelengkap/fallback — untuk soal yang gagal parsing otomatis atau revisi soal individual.
- Soal yang mengandung gambar/diagram (termasuk rumus matematika kompleks yang di-Word ditulis sebagai gambar/equation object) diekstrak sebagai gambar dan ditampilkan apa adanya di preview & saat soal disajikan ke peserta — sistem tidak mengonversi rumus jadi teks/LaTeX.

### FR-A10: Konfigurasi Randomize Soal
- Saat admin menambah, mengedit, atau mengimpor soal ke dalam bank soal, tersedia opsi berupa checkbox "Randomize / Acak Urutan Soal" (atau tingkatannya disesuaikan: per babak / per set soal).
### Logika Sistem:
- Jika checkbox dicentang: Urutan soal (dan/atau opsi jawaban jika diperlukan) yang disajikan ke setiap peserta pada babak tersebut akan diacak secara independen per peserta.
- Jika checkbox tidak dicentang: Urutan soal disajikan secara fixed / statis sesuai nomor urut yang ada di bank soal.

**Asumsi format dokumen** (perlu dikonfirmasi dengan contoh file asli — lihat Open Questions):
- Setiap soal diawali penomoran urut (misal `1.`, `2.`, dst.)
- 4 opsi jawaban diberi label `A)` `B)` `C)` `D)` (atau `A.` `B.` dst.)
- Jawaban benar ditandai dengan formatting konsisten (misal: bold, atau simbol seperti `*` di depan opsi) — **cara penandaan ini krusial** dan harus sama persis di seluruh dokumen supaya parsing otomatis akurat

---

## 6. Non-Functional Requirements

### 6.1 Performa
- Sistem harus dapat menangani **100 peserta bersamaan** mengakses soal dan submit jawaban tanpa penurunan performa signifikan.
- Response time API untuk aksi umum (submit jawaban, ambil soal): < 500ms pada kondisi normal.

### 6.2 Keamanan
- Jawaban benar (`correct_answer`) tidak boleh pernah dikirim ke client sebelum sesi selesai.
- Semua validasi kritis (timer habis, tab-switch ≥ 3, sesi selesai) harus divalidasi ulang di **server**, tidak boleh hanya mengandalkan logika client.
- Password disimpan ter-hash (bcrypt/argon2), bukan plaintext.
- Mencegah satu akun login di lebih dari satu tab/device secara bersamaan pada sesi quiz yang sama.

### 6.3 Reliabilitas
- Jika koneksi peserta putus di tengah quiz, progress (jawaban yang sudah terisi + timer) tidak boleh hilang — state sepenuhnya bersumber dari server.
- Backup data manual dijadwalkan sebelum dan sesudah pelaksanaan lomba.

### 6.4 Skalabilitas Infrastruktur
- Direkomendasikan VPS dengan spesifikasi minimal 2 vCPU / 2GB RAM untuk menangani ±100 peserta bersamaan, dengan stack ringan (Postgres + backend framework, tanpa layanan realtime yang tidak perlu).
- Rate-limiting berbasis IP (jika ada) harus dikonfigurasi agar tidak memblokir peserta sesi offline yang berbagi satu jaringan/IP publik.

### 6.5 Kompatibilitas
- Berjalan baik di browser modern desktop (Chrome, Firefox, Edge). Mobile browser didukung sebagai fallback, namun pengalaman utama dioptimalkan untuk desktop/laptop (asumsi: lomba dikerjakan di komputer/laptop, bukan HP).

---

## 7. Data Model (Ringkasan)

| Entitas | Deskripsi Singkat |
|---|---|
| `users` | Akun login (peserta/admin), email, password hash, role |
| `participants` | Data identitas peserta: nama, sekolah, kategori, kelas |
| `rounds` | **Baru** — Babak lomba, jumlah fleksibel (bukan hardcode 3): `name` (nullable untuk babak terakhir — lihat catatan di bawah), `order_index` (menentukan urutan & babak mana yang "terakhir"), mode (online/offline), status (belum_dibuka/aktif/ditutup), durasi timer, ambang batas tab-switch, per kategori |
| `qualifications` | **Baru** — Status kelulusan peserta per babak: `participant_id`, `round_id`, `status` (lolos/tidak_lolos/belum_ditentukan), `decided_by_admin_id`, `decided_at` |
| `questions` | Bank soal, terikat ke `round_id` + kategori, opsi jawaban, kunci jawaban, `image_url` (opsional, untuk soal bergambar/rumus kompleks), is_randomized (boolean) untuk soal apakah di acak apa tidak |
| `quiz_sessions` | Satu sesi pengerjaan quiz **per babak**: `participant_id`, `round_id`, waktu mulai/selesai, status, skor, jumlah tab-switch |
| `answers` | Jawaban peserta per soal (dalam konteks satu `quiz_session`), status flag, waktu jawab |
| `tab_switch_logs` | Log waktu setiap kejadian tab-switch per `quiz_session` (audit trail) |
| `question_imports` | **Baru** — Log tiap proses import file soal: nama file asli, `round_id`, kategori, jumlah soal berhasil/gagal parsing, admin yang mengimpor, waktu import (audit trail, bukan fungsi kritis) |

**Perubahan kunci dari v1.0:** `quiz_sessions` dan `questions` sekarang terikat ke `round_id`, bukan cuma kategori — satu peserta akan punya sejumlah `quiz_sessions` sebanyak babak yang ia lolos ikuti (jumlahnya mengikuti berapa babak yang dikonfigurasi admin, tidak lagi tetap 3). Tabel `qualifications` baru menjadi gerbang penentu apakah peserta boleh membuat `quiz_session` baru di babak tertentu.

**Catatan label "Final" (v1.3):** Nama babak terakhir **tidak disimpan sebagai teks statis** di kolom `name` — melainkan dihitung di level aplikasi (atau view/query) berdasarkan `order_index` tertinggi per kategori: babak dengan `order_index` terbesar untuk kategori tsb otomatis ditampilkan dengan label "Final", terlepas dari apa isi kolom `name`-nya. Ini memastikan label selalu konsisten walau admin menambah/menghapus/reorder babak, tanpa perlu batch-update manual ke banyak row saat urutan berubah.

*(Skema detail SQL tersedia terpisah dari diskusi teknis sebelumnya — perlu diperbarui mengikuti perubahan ini.)*

---

## 8. Alur Pengguna Utama (User Flow)

**Peserta (berulang untuk setiap babak yang ia lolos ikuti):**
1. Register/Login → 2. Halaman status babak (cek: babak aktif? lolos? sudah selesai?) → 3. Halaman "Mulai Quiz" (sesuai kategori + babak aktif) → 4. Timer mulai, soal pertama tampil → 5. Navigasi bebas antar soal, jawab/tandai/skip → 6. Submit manual **atau** auto-submit (timeout / tab-switch ≥3) → 7. Halaman "Selesai [Babak]" → kembali ke langkah 2, menunggu babak berikutnya dibuka & keputusan kelulusan

**Admin (berulang untuk setiap babak, jumlahnya sesuai konfigurasi):**
1. Login → 2. (Sekali di awal, atau kapan saja) Atur daftar babak: tambah/hapus/urutkan — babak terakhir otomatis berlabel "Final" → 3. Pilih/buka babak yang akan berjalan → 4. Dashboard ringkasan babak tsb → 5. Monitor peserta selama babak berlangsung → 6. Tutup babak setelah waktu berakhir → 7. Buka panel kelulusan, tinjau ranking, tandai peserta lolos/tidak → 8. Export CSV babak tsb → 9. Buka babak berikutnya (ulangi dari langkah 3) → 10. Setelah babak "Final" selesai, export rekap gabungan seluruh babak

---

## 9. Metrik Keberhasilan

- 100% sesi peserta tercatat dengan data timer dan tab-switch yang akurat (tidak ada data hilang akibat refresh/disconnect).
- 0 insiden peserta bisa melihat kunci jawaban sebelum submit.
- Admin dapat mengekspor data lengkap dalam < 5 detik untuk 100 peserta.
- Tidak ada peserta yang gagal login/register akibat rate-limit pada sesi offline.

---

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Peserta memanipulasi timer via client | Timer server-authoritative, validasi ulang di setiap endpoint |
| Kecurangan lewat multi-tab/device | Session token aktif tunggal per peserta |
| Rate-limit saat registrasi bersamaan (offline) | Pre-provisioned account, hindari self-service register saat hari-H |
| Kehilangan data saat koneksi putus | Auto-save jawaban per aksi, bukan submit sekali di akhir |
| Beban server saat start bersamaan (100 peserta) | Load-test sebelum hari-H, staggered start bila perlu |
| Kehilangan data karena tidak ada backup otomatis (VPS) | Backup manual terjadwal (`pg_dump`) sebelum & sesudah lomba |
| Peserta yang tidak lolos tetap bisa mengakses babak berikutnya lewat URL langsung | Validasi status kelulusan di **server** pada setiap request pembuatan `quiz_session`, bukan hanya disembunyikan di UI |
| Dua babak aktif bersamaan untuk kategori yang sama membuat peserta bingung harus mengerjakan yang mana | Sistem membatasi hanya 1 babak `aktif` per kategori pada satu waktu |
| Admin lupa menutup babak sebelumnya sebelum membuka babak berikutnya, sesi lama masih bisa diakses | Validasi status babak sebagai bagian dari FR-A2, beri konfirmasi eksplisit saat admin membuka babak baru |
| Parsing otomatis dari Word salah membaca soal/opsi/jawaban benar karena format dokumen tidak konsisten | Wajib tahap **preview** sebelum soal masuk bank aktif (FR-A9); soal gagal parsing ditandai jelas untuk dikoreksi manual, bukan diam-diam salah |
| Rumus matematika atau diagram dalam soal rusak/hilang saat proses import | Rumus/gambar diekstrak dan ditampilkan sebagai gambar apa adanya (bukan dikonversi ke teks), diverifikasi visual saat tahap preview |
| Admin menghapus/reorder babak yang sudah punya peserta aktif mengerjakan, menyebabkan sesi peserta jadi tidak valid | Konfirmasi eksplisit sebelum hapus/reorder babak yang punya `quiz_sessions` aktif (FR-A2); idealnya babak yang statusnya `aktif` atau sudah pernah `aktif` tidak bisa dihapus, hanya bisa diarsipkan |
| Label "Final" berpindah ke babak yang salah karena bug urutan (`order_index`) atau race condition saat reorder | Hitung ulang babak "terakhir" berbasis query `order_index` tertinggi secara real-time (bukan disimpan statis), lihat catatan Data Model |

---

## 11. Open Questions

- Apakah skor ditampilkan langsung ke peserta setelah submit, atau diumumkan admin secara terpisah?
- Apakah ada batas percobaan login (lupa password → reset via apa, jika tidak pakai email)?
- Apakah soal per kategori jumlahnya tetap (fixed set) atau diacak urutannya per peserta?
- Apakah dibutuhkan waktu jeda/istirahat di tengah sesi (misal untuk 90 menit SMA), atau timer berjalan terus tanpa jeda?
- Bagaimana kebijakan jika peserta force-ended karena tab-switch tapi ternyata karena alasan teknis (misal notifikasi sistem OS)? Apakah admin bisa override manual (lihat FR-A8)?
- **Kelulusan antar babak**: apakah berdasarkan kuota tetap (misal "20 besar per kategori lolos ke Final"), persentase, atau skor minimum (passing grade)? Ini menentukan apakah perlu fitur "loloskan top N otomatis" di panel kelulusan (FR-A3) atau cukup manual sepenuhnya.
- **Durasi & aturan Babak Final**: apakah durasi timer dan ambang batas tab-switch (3x) tetap sama seperti Penyisihan, atau berbeda karena konteksnya offline dengan pengawasan fisik tambahan?
- **Bank soal antar babak**: apakah soal Penyisihan 1 dan Penyisihan 2 dari pool yang sama (diacak ulang) atau harus benar-benar set soal berbeda per babak?
- Apakah skor dari Penyisihan 1 dan 2 **diakumulasi** ke Final (misal untuk penentuan juara akhir), atau tiap babak berdiri sendiri dan yang menentukan juara akhir murni skor Final?
- Untuk Babak Final (offline, satu venue): apakah tetap perlu login individual per peserta, atau ada mode "supervised" tambahan di mana admin/pengawas bisa melihat live status semua peserta di venue dari satu layar?
- **Format persis file Word soal kamu** (paling krusial untuk FR-A9): bagaimana penomoran soal ditulis, bagaimana opsi A-D diformat, dan yang terpenting — **bagaimana jawaban benar ditandai** di dalam dokumen (bold? warna? simbol seperti tanda bintang? atau kunci jawaban ditulis terpisah di akhir dokumen)? Contoh 2-3 soal asli dari file Word kamu akan sangat membantu memastikan parsing otomatis akurat sejak awal, bukan trial-and-error setelah dikembangkan.
- Apakah soal-soal kamu mengandung banyak rumus matematika/gambar diagram, atau sebagian besar teks biasa? Ini menentukan seberapa besar effort ekstraksi gambar yang perlu disiapkan.
- **Batas jumlah babak**: apakah perlu batas atas jumlah babak yang bisa dibuat admin (misal maksimal 6), atau benar-benar tanpa batas? Ini murni pencegahan human error (admin tidak sengaja bikin puluhan babak), bukan batasan teknis.
- **Babak minimum**: apakah sistem boleh berjalan dengan hanya 1 babak (yang otomatis langsung jadi "Final")? Kalau ya, berarti alur kelulusan (FR-A3) perlu menangani kasus "tidak ada babak sebelumnya untuk dibandingkan".
- Kalau admin **menghapus babak di tengah urutan** (bukan yang terakhir) setelah ada babak lain sudah berjalan, apakah `qualifications` yang sudah dibuat mengacu ke babak itu perlu ditangani khusus (misal: diarsipkan, bukan dihapus permanen)?

---

*Dokumen ini adalah draft awal dan dapat direvisi sesuai kebutuhan pelaksanaan lomba.*