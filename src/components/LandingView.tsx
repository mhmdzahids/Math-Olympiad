import React, { useState } from 'react';
import { ScreenView } from '../types';
import { ASSET_IMAGES, COMPETITION_INFO } from '../data/mockData';

interface LandingViewProps {
  onNavigate: (screen: ScreenView) => void;
  onRegisterSuccess?: (userData: any) => void;
  isLoggedIn?: boolean;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigate,
  isLoggedIn = false
}) => {
  const [ruleModalCategory, setRuleModalCategory] = useState<'sd-smp' | 'sma' | null>(null);

  return (
    <div className="w-full bg-[#fef9ef] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="min-h-[calc(100dvh-72px)] flex flex-col justify-center py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              {/* Event Badge */}
              <div className="inline-flex flex-wrap items-center gap-2 bg-[#f2ede4] border border-[#0a0a0a]/10 px-3.5 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-[#ff6b5a] text-[18px]">workspace_premium</span>
                <span className="text-xs font-bold tracking-widest text-[#0a0a0a] uppercase">
                  DIES NATALIS 2026 • HIMATIKA UIN SSC
                </span>
              </div>

              {/* Display Title */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-[#0a0a0a] tracking-tight leading-[1.05]">
                Olimpiade <br /> Prestasi <br />
                <span className="italic text-[#ff6b5a] font-serif font-normal">Matematika</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#6a6a6a] max-w-xl font-normal leading-relaxed">
                Wadah kompetisi akademik resmi diselenggarakan oleh Himpunan Mahasiswa Matematika (HIMATIKA) UIN Siber Syekh Nurjati Cirebon untuk menumbuhkan berpikir logis, analitis, dan berintegritas.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate(isLoggedIn ? 'student-dashboard' : 'register')}
                  className="bg-[#0a0a0a] hover:bg-[#0a0a0a]/90 text-white font-semibold px-8 py-3.5 rounded-full flex items-center gap-2 clay-shadow clay-button-active transition-all"
                >
                  <span>{isLoggedIn ? 'Buka Dashboard' : 'Daftar OPTIMA 2026'}</span>
                  <span className="material-symbols-outlined text-sm">{isLoggedIn ? 'dashboard' : 'arrow_forward'}</span>
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('schedule-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#f5f0e0] hover:bg-[#ebe6d6] text-[#0a0a0a] font-semibold px-8 py-3.5 rounded-full clay-shadow-sm clay-button-active transition-all border border-[#0a0a0a]/10"
                >
                  Jadwal & Rulebook
                </button>
              </div>
            </div>

            {/* Hero Right Banner Image */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-32 h-32 bg-[#ffb084] rounded-full blur-0 opacity-90 z-0 hidden sm:block" />
              <div className="relative z-10 w-full max-w-md rounded-3xl overflow-hidden border-4 border-[#feaf83] shadow-2xl bg-[#fffaf0] p-2 transform hover:rotate-1 transition-transform">
                <img
                  src={ASSET_IMAGES.landingBanner}
                  alt="OPTIMA MATRIX 2026 Banner"
                  className="w-full h-auto object-cover rounded-2xl shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Competition Schedule Section */}
        <div id="schedule-section" className="text-center mb-16 pt-8 scroll-mt-24">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0a0a0a] tracking-tight mb-3">
            Jadwal Rangkaian OPTIMA 2026
          </h2>
          <p className="text-[#6a6a6a] max-w-2xl mx-auto text-sm sm:text-base mb-12">
            Rangkaian resmi Dies Natalis 2026 Jurusan Matematika HIMATIKA UIN Siber Syekh Nurjati Cirebon.
          </p>

          {/* Timeline Container */}
          <div className="relative max-w-4xl mx-auto py-6 px-2 sm:px-0">
            <div className="absolute left-6 sm:left-1/2 top-4 bottom-4 w-1 bg-[#0a0a0a]/15 -translate-x-1/2 rounded-full hidden sm:block" />
            <div className="absolute left-6 top-4 bottom-4 w-1 bg-[#0a0a0a]/15 -translate-x-1/2 rounded-full sm:hidden" />

            <div className="space-y-10 sm:space-y-12">
              {/* Timeline 1: Pendaftaran */}
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center group">
                <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-[#ff4d8b] text-white flex items-center justify-center font-bold text-xl clay-shadow border-2 border-white z-10 shrink-0">
                  <span className="material-symbols-outlined text-2xl">app_registration</span>
                </div>

                <div className="pl-16 sm:pl-0 sm:w-1/2 sm:pr-12 text-left w-full">
                  <div className="bg-white p-6 sm:p-7 rounded-[28px] clay-shadow border-2 border-[#ff4d8b]/30 relative hover:-translate-y-1 transition-transform">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-[#ff4d8b] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
                        TAHAP 1
                      </span>
                      <span className="text-[11px] font-extrabold uppercase text-[#ff4d8b] bg-[#ff4d8b]/10 px-2.5 py-0.5 rounded-full">
                        Pendaftaran
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-[#0a0a0a] mb-1">
                      Pendaftaran Gelombang I & II
                    </h3>

                    <div className="space-y-1 text-[#ff4d8b] font-extrabold text-xs mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">bolt</span>
                        <span>Gel. I (Early Bird): 05 – 15 Agustus 2026</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#0a0a0a]/70">
                        <span className="material-symbols-outlined text-base">event</span>
                        <span>Gel. II (Reguler): 24 Agustus – 05 September 2026</span>
                      </div>
                    </div>

                    <p className="text-sm text-[#6a6a6a] leading-relaxed">
                      Pengisian formulir pendaftaran, upload Kartu Pelajar, Surat Rekomendasi Sekolah, dan bukti transfer.
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block sm:w-1/2" />
              </div>

              {/* Timeline 2: Technical Meeting & Opening */}
              <div className="relative flex flex-col sm:flex-row-reverse items-start sm:items-center group">
                <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-[#b8a4ed] text-[#0a0a0a] flex items-center justify-center font-bold text-xl clay-shadow border-2 border-white z-10 shrink-0">
                  <span className="material-symbols-outlined text-2xl">groups</span>
                </div>

                <div className="pl-16 sm:pl-0 sm:w-1/2 sm:pl-12 text-left w-full">
                  <div className="bg-white p-6 sm:p-7 rounded-[28px] clay-shadow border-2 border-[#b8a4ed] relative hover:-translate-y-1 transition-transform">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-[#b8a4ed] text-[#0a0a0a] text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
                        TAHAP 2
                      </span>
                      <span className="text-[11px] font-extrabold uppercase text-[#5b3eb8] bg-[#b8a4ed]/25 px-2.5 py-0.5 rounded-full">
                        TM & Opening
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-[#0a0a0a] mb-1">
                      Technical Meeting & Opening
                    </h3>

                    <div className="space-y-1 text-[#5b3eb8] font-extrabold text-xs mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">video_camera_front</span>
                        <span>TM: Sabtu, 12 Sept 2026 (09.00 - 12.00 WIB via Zoom)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#0a0a0a]/70">
                        <span className="material-symbols-outlined text-base">campaign</span>
                        <span>Opening: Senin, 14 Sept 2026 (08.00 WIB di Auditorium Pascasarjana Lt. 3)</span>
                      </div>
                    </div>

                    <p className="text-sm text-[#6a6a6a] leading-relaxed">
                      Pengarahan teknis tata tertib ujian, pengawasan kamera, serta pembukaan resmi acara.
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block sm:w-1/2" />
              </div>

              {/* Timeline 3: Tahap Penyisihan Daring */}
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center group">
                <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-[#a4d4c5] text-[#0a0a0a] flex items-center justify-center font-bold text-xl clay-shadow border-2 border-white z-10 shrink-0">
                  <span className="material-symbols-outlined text-2xl">laptop_mac</span>
                </div>

                <div className="pl-16 sm:pl-0 sm:w-1/2 sm:pr-12 text-left w-full">
                  <div className="bg-white p-6 sm:p-7 rounded-[28px] clay-shadow border-2 border-[#a4d4c5] relative hover:-translate-y-1 transition-transform">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-[#a4d4c5] text-[#0a0a0a] text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
                        TAHAP 3
                      </span>
                      <span className="text-[11px] font-extrabold uppercase text-[#2c7a65] bg-[#a4d4c5]/25 px-2.5 py-0.5 rounded-full">
                        Penyisihan Daring
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-[#0a0a0a] mb-1">
                      Tahap Penyisihan Daring (Zoom)
                    </h3>

                    <div className="flex items-center gap-1.5 text-[#2c7a65] font-extrabold text-xs mb-3">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      <span>Senin, 14 September 2026 • 13.00 WIB</span>
                    </div>

                    <p className="text-sm text-[#6a6a6a] leading-relaxed">
                      SD & SMP (25 Soal PG • 60 Menit) | SMA (30 Soal PG & Isian • 90 Menit). Kamera pengawas disetting samping ±1 meter.
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block sm:w-1/2" />
              </div>

              {/* Timeline 4: Tahap Final Offline */}
              <div className="relative flex flex-col sm:flex-row-reverse items-start sm:items-center group">
                <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-[#e8b94a] text-[#0a0a0a] flex items-center justify-center font-bold text-xl clay-shadow border-2 border-white z-10 shrink-0">
                  <span className="material-symbols-outlined text-2xl">emoji_events</span>
                </div>

                <div className="pl-16 sm:pl-0 sm:w-1/2 sm:pl-12 text-left w-full">
                  <div className="bg-white p-6 sm:p-7 rounded-[28px] clay-shadow border-2 border-[#e8b94a] relative hover:-translate-y-1 transition-transform">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-[#e8b94a] text-[#0a0a0a] text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
                        BABAK FINAL
                      </span>
                      <span className="text-[11px] font-extrabold uppercase text-[#8c6508] bg-[#e8b94a]/25 px-2.5 py-0.5 rounded-full">
                        Offline Kampus UIN SSC
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-[#0a0a0a] mb-1">
                      Tahap Final & Presentasi
                    </h3>

                    <div className="flex items-center gap-1.5 text-[#8c6508] font-extrabold text-xs mb-3">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      <span>Rabu, 16 September 2026 • Kampus UIN SSC (Ruang FITK 401, 403, 405)</span>
                    </div>

                    <p className="text-sm text-[#6a6a6a] leading-relaxed">
                      10 finalis terbaik per jenjang bersaing di pengerjaan esai (SD/SMP: 10 esai; SMA: 3 esai + sesi presentasi & tanya jawab juri).
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block sm:w-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* Competition Categories & Pricing Section */}
        <div id="categories-section" className="text-center mb-16 pt-6 scroll-mt-24 max-w-5xl mx-auto px-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a] tracking-tight mb-2">
            Kategori & Biaya Pendaftaran
          </h2>
          <p className="text-[#6a6a6a] max-w-xl mx-auto text-xs sm:text-sm mb-8">
            Pendaftaran terbuka untuk jenjang SD/MI, SMP/MTs, dan SMA/SMK/MA sederajat se-Pulau Jawa.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* SD/MI Card */}
            <div className="bg-[#ffb084] text-[#0a0a0a] p-5 rounded-[22px] clay-shadow hover:-translate-y-1 transition-transform flex flex-col justify-between border-2 border-[#0a0a0a] relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-[#0a0a0a] text-white text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                    SD / MI
                  </span>
                  <span className="bg-white/60 text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#0a0a0a]/10">
                    Sederajat
                  </span>
                </div>

                <h3 className="text-lg font-black text-[#0a0a0a] mb-1">
                  Olimpiade SD / MI
                </h3>
                <p className="text-[11px] text-[#0a0a0a]/80 leading-relaxed mb-3.5">
                  Ujian penyisihan 25 soal pilihan ganda (60 menit) & final 10 esai (90 menit).
                </p>

                <div className="bg-white/70 rounded-xl p-3 border border-[#0a0a0a]/10 mb-4 space-y-1 text-xs font-bold">
                  <div className="flex justify-between">
                    <span className="text-[#6a6a6a]">Early Bird:</span>
                    <span className="text-[#0a0a0a]">Rp 35.000 / peserta</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6a6a6a]">Reguler:</span>
                    <span className="text-[#0a0a0a]">Rp 45.000 / peserta</span>
                  </div>
                </div>

                <div className="text-[10px] font-bold text-[#0a0a0a]/70">
                  Narahubung SD: Ade Lia (+62 895-4009-05511)
                </div>
              </div>

              <button
                onClick={() => onNavigate(isLoggedIn ? 'student-dashboard' : 'register')}
                className="w-full bg-[#0a0a0a] hover:bg-[#0a0a0a]/90 text-white font-bold py-2.5 rounded-lg clay-shadow transition-all text-xs flex items-center justify-center gap-1.5 mt-4"
              >
                <span>{isLoggedIn ? 'Buka Dashboard' : 'Daftar Kategori SD'}</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>

            {/* SMP/MTs Card */}
            <div className="bg-[#b8a4ed] text-[#0a0a0a] p-5 rounded-[22px] clay-shadow hover:-translate-y-1 transition-transform flex flex-col justify-between border-2 border-[#0a0a0a] relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-[#0a0a0a] text-white text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                    SMP / MTs
                  </span>
                  <span className="bg-white/60 text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#0a0a0a]/10">
                    Sederajat
                  </span>
                </div>

                <h3 className="text-lg font-black text-[#0a0a0a] mb-1">
                  Olimpiade SMP / MTs
                </h3>
                <p className="text-[11px] text-[#0a0a0a]/80 leading-relaxed mb-3.5">
                  Ujian penyisihan 25 soal pilihan ganda (60 menit) & final 10 esai (90 menit).
                </p>

                <div className="bg-white/70 rounded-xl p-3 border border-[#0a0a0a]/10 mb-4 space-y-1 text-xs font-bold">
                  <div className="flex justify-between">
                    <span className="text-[#6a6a6a]">Early Bird:</span>
                    <span className="text-[#0a0a0a]">Rp 50.000 / peserta</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6a6a6a]">Reguler:</span>
                    <span className="text-[#0a0a0a]">Rp 65.000 / peserta</span>
                  </div>
                </div>

                <div className="text-[10px] font-bold text-[#0a0a0a]/70">
                  Narahubung SMP: Alifah Nur (+62 896-7130-9905)
                </div>
              </div>

              <button
                onClick={() => onNavigate(isLoggedIn ? 'student-dashboard' : 'register')}
                className="w-full bg-[#0a0a0a] hover:bg-[#0a0a0a]/90 text-white font-bold py-2.5 rounded-lg clay-shadow transition-all text-xs flex items-center justify-center gap-1.5 mt-4"
              >
                <span>{isLoggedIn ? 'Buka Dashboard' : 'Daftar Kategori SMP'}</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>

            {/* SMA/SMK/MA Card */}
            <div className="bg-[#e8b94a] text-[#0a0a0a] p-5 rounded-[22px] clay-shadow hover:-translate-y-1 transition-transform flex flex-col justify-between border-2 border-[#0a0a0a] relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-[#0a0a0a] text-white text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                    SMA / SMK / MA
                  </span>
                  <span className="bg-white/60 text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#0a0a0a]/10">
                    Sederajat
                  </span>
                </div>

                <h3 className="text-lg font-black text-[#0a0a0a] mb-1">
                  Olimpiade SMA / SMK / MA
                </h3>
                <p className="text-[11px] text-[#0a0a0a]/80 leading-relaxed mb-3.5">
                  Penyisihan 30 soal PG & Isian (90 menit) & final esai + presentasi juri.
                </p>

                <div className="bg-white/70 rounded-xl p-3 border border-[#0a0a0a]/10 mb-4 space-y-1 text-xs font-bold">
                  <div className="flex justify-between">
                    <span className="text-[#6a6a6a]">Early Bird:</span>
                    <span className="text-[#0a0a0a]">Rp 75.000 / peserta</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6a6a6a]">Reguler:</span>
                    <span className="text-[#0a0a0a]">Rp 90.000 / peserta</span>
                  </div>
                </div>

                <div className="text-[10px] font-bold text-[#0a0a0a]/70">
                  Narahubung SMA: Naillatul Fitriah (+62 858-7258-3579)
                </div>
              </div>

              <button
                onClick={() => onNavigate(isLoggedIn ? 'student-dashboard' : 'register')}
                className="w-full bg-[#0a0a0a] hover:bg-[#0a0a0a]/90 text-white font-bold py-2.5 rounded-lg clay-shadow transition-all text-xs flex items-center justify-center gap-1.5 mt-4"
              >
                <span>{isLoggedIn ? 'Buka Dashboard' : 'Daftar Kategori SMA'}</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Competition Rules Section */}
        <div id="rules-section" className="text-center mb-16 pt-8 scroll-mt-24 max-w-4xl mx-auto px-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a] tracking-tight mb-2">
            Sistem Penilaian & Tata Tertib Resmi
          </h2>
          <p className="text-[#6a6a6a] max-w-lg mx-auto text-xs sm:text-sm mb-8">
            Ketentuan umum penyisihan online, pembagian skor, serta pengawasan kamera sesuai Rulebook OPTIMA 2026.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* SD & SMP Rules */}
            <div className="bg-white p-6 rounded-[24px] clay-shadow border-2 border-[#ff6b5a] flex flex-col justify-between hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-[#ff6b5a] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                    SD/MI & SMP/MTs
                  </span>
                  <span className="material-symbols-outlined text-[#ff6b5a] text-xl">menu_book</span>
                </div>

                <h3 className="text-lg font-black text-[#0a0a0a] mb-2">
                  Aturan Penilaian SD & SMP
                </h3>

                <ul className="space-y-2.5 text-xs text-[#0a0a0a]/80 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#ff6b5a] text-base shrink-0 mt-0.5">grade</span>
                    <span><strong>Skor Soal:</strong> Jawaban Benar = <strong>+4 Poin</strong>, Salah = <strong>-1 Poin</strong>, Kosong = <strong>0 Poin</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#ff6b5a] text-base shrink-0 mt-0.5">timer</span>
                    <span><strong>Durasi Penyisihan:</strong> 25 Soal Pilihan Ganda dikerjakan dalam waktu 60 Menit.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#ff6b5a] text-base shrink-0 mt-0.5">videocam</span>
                    <span><strong>Kamera Pengawas:</strong> Wajib Zoom off-camera / keluar room berakibat sanksi poin bertahap.</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setRuleModalCategory('sd-smp')}
                className="w-full bg-[#f5f0e0] hover:bg-[#ebe6d6] text-[#0a0a0a] font-bold py-2.5 px-4 rounded-xl border border-[#0a0a0a]/15 transition-all text-xs flex items-center justify-center gap-1.5"
              >
                <span>Lihat Detail Sanksi & Final SD/SMP</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>

            {/* SMA Rules */}
            <div className="bg-white p-6 rounded-[24px] clay-shadow border-2 border-[#e8b94a] flex flex-col justify-between hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-[#e8b94a] text-[#0a0a0a] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                    SMA / SMK / MA
                  </span>
                  <span className="material-symbols-outlined text-[#b8860b] text-xl">verified_user</span>
                </div>

                <h3 className="text-lg font-black text-[#0a0a0a] mb-2">
                  Aturan Penilaian SMA
                </h3>

                <ul className="space-y-2.5 text-xs text-[#0a0a0a]/80 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#b8860b] text-base shrink-0 mt-0.5">grade</span>
                    <span><strong>Pilihan Ganda:</strong> Benar = <strong>+3 Poin</strong>, Salah = <strong>-1 Poin</strong>, Kosong = 0.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#b8860b] text-base shrink-0 mt-0.5">edit_note</span>
                    <span><strong>Isian Singkat:</strong> Benar = <strong>+5 Poin</strong>, Salah/Kosong = 0 (Tanpa minus).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#b8860b] text-base shrink-0 mt-0.5">present_to_all</span>
                    <span><strong>Babak Final:</strong> 70% Bobot Nilai Esai + 30% Bobot Presentasi & Tanya Jawab Juri.</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setRuleModalCategory('sma')}
                className="w-full bg-[#f5f0e0] hover:bg-[#ebe6d6] text-[#0a0a0a] font-bold py-2.5 px-4 rounded-xl border border-[#0a0a0a]/15 transition-all text-xs flex items-center justify-center gap-1.5"
              >
                <span>Lihat Detail Sanksi & Final SMA</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Rules Modal */}
        {ruleModalCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#fef9ef] border-2 border-[#0a0a0a] rounded-[28px] max-w-2xl w-full p-6 sm:p-8 clay-shadow relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setRuleModalCategory(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white border border-[#0a0a0a]/15 flex items-center justify-center hover:bg-[#ff6b5a] hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>

              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${ruleModalCategory === 'sd-smp' ? 'bg-[#ff6b5a] text-white' : 'bg-[#e8b94a] text-[#0a0a0a]'
                  }`}>
                  {ruleModalCategory === 'sd-smp' ? 'Official Rulebook SD & SMP' : 'Official Rulebook SMA'}
                </span>
                <span className="text-xs text-[#6a6a6a] font-bold">OPTIMA MATRIX 2026</span>
              </div>

              <h2 className="text-2xl font-black text-[#0a0a0a] mb-4">
                Ketentuan & Sanksi Pelanggaran
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-[#0a0a0a]/85 leading-relaxed">
                <div className="bg-white p-4 rounded-2xl border border-[#0a0a0a]/10">
                  <h4 className="font-extrabold text-[#0a0a0a] mb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#ff6b5a] text-base">videocam</span>
                    1. Posisi Kamera Pengawas (Daring)
                  </h4>
                  <p className="text-xs text-[#6a6a6a]">
                    Kamera wajib ditempatkan jarak ±1 meter dari posisi peserta dengan sudut pengambilan gambar dari samping, sehingga wajah, layar laptop/HP, dan aktivitas terlihat jelas.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#0a0a0a]/10">
                  <h4 className="font-extrabold text-[#0a0a0a] mb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#ff6b5a] text-base">warning</span>
                    2. Akumulasi Sanksi Peringatan (Zoom/Off-camera)
                  </h4>
                  <ul className="text-xs text-[#6a6a6a] space-y-1 list-disc pl-4 mt-1">
                    <li><strong>Peringatan Ke-1:</strong> Pengurangan <strong>2 Poin</strong></li>
                    <li><strong>Peringatan Ke-2:</strong> Pengurangan <strong>5 Poin</strong></li>
                    <li><strong>Peringatan Ke-3:</strong> Pengurangan <strong>10 Poin</strong></li>
                    <li><strong>Peringatan Ke-4:</strong> Ujian dihentikan otomatis (Auto-submit) &amp; <strong>Diskualifikasi</strong></li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#0a0a0a]/10">
                  <h4 className="font-extrabold text-[#0a0a0a] mb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#ff6b5a] text-base">emoji_events</span>
                    3. Kualifikasi Babak Final
                  </h4>
                  <p className="text-xs text-[#6a6a6a]">
                    10 Peserta terbaik dengan nilai tertinggi per jenjang berhak lolos ke Babak Final secara offline di kampus UIN Siber Syekh Nurjati Cirebon pada Rabu, 16 September 2026.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#0a0a0a]/10">
                <button
                  onClick={() => {
                    setRuleModalCategory(null);
                    onNavigate(isLoggedIn ? 'student-dashboard' : 'register');
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#0a0a0a] hover:bg-[#0a0a0a]/90 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all"
                >
                  <span>{isLoggedIn ? 'Buka Dashboard' : 'Daftar Sekarang'}</span>
                  <span className="material-symbols-outlined text-sm">{isLoggedIn ? 'dashboard' : 'arrow_forward'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
