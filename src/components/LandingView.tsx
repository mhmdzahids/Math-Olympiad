import React, { useState } from 'react';
import { ScreenView } from '../types';
import { ASSET_IMAGES } from '../data/mockData';

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
        {/* Hero Section - 100dvh view */}
        <div className="min-h-[calc(100dvh-72px)] flex flex-col justify-center py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              {/* Enrollment Open Pill */}
              <div className="inline-flex items-center gap-2 bg-[#f2ede4] border border-[#0a0a0a]/10 px-3.5 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-[#ff6b5a] text-[18px]">school</span>
                <span className="text-xs font-bold tracking-widest text-[#0a0a0a] uppercase">
                  DIBUKA PENDAFTARAN
                </span>
              </div>

              {/* Display Title */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-[#0a0a0a] tracking-tight leading-[1.05]">
                Olimpiade <br /> Prestasi <br />
                <span className="italic text-[#ff6b5a] font-serif font-normal">Matematika</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#6a6a6a] max-w-xl font-normal leading-relaxed">
                Bergabunglah dengan ribuan siswa dalam ajang kompetisi matematika digital terbaik untuk kategori SD-SMP dan SMA. Kuasai konsep-konsep rumit melalui pembelajaran interaktif dan tantangan kompetitif.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate(isLoggedIn ? 'student-dashboard' : 'register')}
                  className="bg-[#0a0a0a] hover:bg-[#0a0a0a]/90 text-white font-semibold px-8 py-3.5 rounded-full flex items-center gap-2 clay-shadow clay-button-active transition-all"
                >
                  <span>{isLoggedIn ? 'Dashboard' : 'Daftar Sekarang'}</span>
                  <span className="material-symbols-outlined text-sm">{isLoggedIn ? 'dashboard' : 'arrow_forward'}</span>
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('schedule-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#f5f0e0] hover:bg-[#ebe6d6] text-[#0a0a0a] font-semibold px-8 py-3.5 rounded-full clay-shadow-sm clay-button-active transition-all border border-[#0a0a0a]/10"
                >
                  Lihat Jadwal
                </button>
              </div>
            </div>

            {/* Hero Right Banner Image */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-32 h-32 bg-[#ffb084] rounded-full blur-0 opacity-90 z-0 hidden sm:block" />
              <div className="relative z-10 w-full max-w-md rounded-3xl overflow-hidden border-4 border-[#feaf83] shadow-2xl bg-[#fffaf0] p-2 transform hover:rotate-1 transition-transform">
                <img 
                  src={ASSET_IMAGES.landingBanner} 
                  alt="Olimpiade Prestasi Matematika Banner" 
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
            Jadwal Pelaksanaan
          </h2>
          <p className="text-[#6a6a6a] max-w-xl mx-auto text-sm sm:text-base mb-12">
            Catat tanggal-tanggal penting dalam agenda Olimpiade Prestasi Matematika 2024.
          </p>

          {/* Timeline Container */}
          <div className="relative max-w-4xl mx-auto py-6 px-2 sm:px-0">
            {/* Vertical Line */}
            <div className="absolute left-6 sm:left-1/2 top-4 bottom-4 w-1 bg-[#0a0a0a]/15 -translate-x-1/2 rounded-full hidden sm:block" />
            <div className="absolute left-6 top-4 bottom-4 w-1 bg-[#0a0a0a]/15 -translate-x-1/2 rounded-full sm:hidden" />

            <div className="space-y-10 sm:space-y-12">
              {/* Timeline Item 1 - Registration Deadline */}
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center group">
                {/* Center Circle Node */}
                <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-[#ff4d8b] text-white flex items-center justify-center font-bold text-xl clay-shadow border-2 border-white z-10 shrink-0">
                  <span className="material-symbols-outlined text-2xl">event_available</span>
                </div>

                {/* Left Side Content (Desktop) */}
                <div className="pl-16 sm:pl-0 sm:w-1/2 sm:pr-12 text-left w-full">
                  <div className="bg-white p-6 sm:p-7 rounded-[28px] clay-shadow border-2 border-[#ff4d8b]/30 relative hover:-translate-y-1 transition-transform">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-[#ff4d8b] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
                        TAHAP 1
                      </span>
                      <span className="text-[11px] font-extrabold uppercase text-[#ff4d8b] bg-[#ff4d8b]/10 px-2.5 py-0.5 rounded-full">
                        Pendaftaran Dibuka
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-[#0a0a0a] mb-1">
                      Batas Akhir Pendaftaran
                    </h3>

                    <div className="flex items-center gap-1.5 text-[#ff4d8b] font-extrabold text-xs mb-3">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      <span>25 Agustus 2024 • 23:59 WIB</span>
                    </div>

                    <p className="text-sm text-[#6a6a6a] leading-relaxed">
                      Batas waktu pendaftaran peserta, verifikasi sekolah, dan kelengkapan administrasi untuk kategori SD-SMP & SMA.
                    </p>
                  </div>
                </div>

                {/* Empty Space for Right Side in Alternating Layout */}
                <div className="hidden sm:block sm:w-1/2" />
              </div>

              {/* Timeline Item 2 - First Session */}
              <div className="relative flex flex-col sm:flex-row-reverse items-start sm:items-center group">
                {/* Center Circle Node */}
                <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-[#a4d4c5] text-[#0a0a0a] flex items-center justify-center font-bold text-xl clay-shadow border-2 border-white z-10 shrink-0">
                  <span className="material-symbols-outlined text-2xl">quiz</span>
                </div>

                {/* Right Side Content (Desktop) */}
                <div className="pl-16 sm:pl-0 sm:w-1/2 sm:pl-12 text-left w-full">
                  <div className="bg-white p-6 sm:p-7 rounded-[28px] clay-shadow border-2 border-[#a4d4c5] relative hover:-translate-y-1 transition-transform">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-[#a4d4c5] text-[#0a0a0a] text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
                        TAHAP 2
                      </span>
                      <span className="text-[11px] font-extrabold uppercase text-[#2c7a65] bg-[#a4d4c5]/25 px-2.5 py-0.5 rounded-full">
                        Penyisihan Daring
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-[#0a0a0a] mb-1">
                      Sesi Penyisihan
                    </h3>

                    <div className="flex items-center gap-1.5 text-[#2c7a65] font-extrabold text-xs mb-3">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      <span>5 September 2024 • 09:00 - 11:30 WIB</span>
                    </div>

                    <p className="text-sm text-[#6a6a6a] leading-relaxed">
                      Ujian penyisihan online berisi 30 soal pilihan ganda & penalaran logika melalui portal kuis terpercaya.
                    </p>
                  </div>
                </div>

                {/* Empty Space for Left Side in Alternating Layout */}
                <div className="hidden sm:block sm:w-1/2" />
              </div>

              {/* Timeline Item 3 - Final Session */}
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center group">
                {/* Center Circle Node */}
                <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-[#e8b94a] text-[#0a0a0a] flex items-center justify-center font-bold text-xl clay-shadow border-2 border-white z-10 shrink-0">
                  <span className="material-symbols-outlined text-2xl">emoji_events</span>
                </div>

                {/* Left Side Content (Desktop) */}
                <div className="pl-16 sm:pl-0 sm:w-1/2 sm:pr-12 text-left w-full">
                  <div className="bg-white p-6 sm:p-7 rounded-[28px] clay-shadow border-2 border-[#e8b94a] relative hover:-translate-y-1 transition-transform">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-[#e8b94a] text-[#0a0a0a] text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
                        BABAK FINAL
                      </span>
                      <span className="text-[11px] font-extrabold uppercase text-[#8c6508] bg-[#e8b94a]/25 px-2.5 py-0.5 rounded-full">
                        Tingkat Nasional
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-[#0a0a0a] mb-1">
                      Sesi Grand Final
                    </h3>

                    <div className="flex items-center gap-1.5 text-[#8c6508] font-extrabold text-xs mb-3">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      <span>20 September 2024 • 08:30 - 14:00 WIB</span>
                    </div>

                    <p className="text-sm text-[#6a6a6a] leading-relaxed">
                      50 finalis terbaik per kategori berkompetisi di babak final langsung, dilanjutkan acara penyerahan penghargaan nasional.
                    </p>
                  </div>
                </div>

                {/* Empty Space for Right Side in Alternating Layout */}
                <div className="hidden sm:block sm:w-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* Competition Categories Section */}
        <div id="categories-section" className="text-center mb-16 pt-6 scroll-mt-24 max-w-3xl mx-auto px-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a] tracking-tight mb-2">
            Liga SD-SMP & SMA
          </h2>
          <p className="text-[#6a6a6a] max-w-md mx-auto text-xs sm:text-sm mb-6">
            Pilih jenjang pendidikan Anda untuk melihat cakupan materi, alokasi waktu, dan pedoman kompetisi.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
            {/* SD-SMP Category Card */}
            <div className="bg-[#ffb084] text-[#0a0a0a] p-5 sm:p-6 rounded-[22px] clay-shadow hover:-translate-y-1 transition-transform flex flex-col justify-between border-2 border-[#0a0a0a] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -mr-6 -mt-6 pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-[#0a0a0a] text-white text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                    LIGA JUNIOR
                  </span>
                  <span className="bg-white/60 text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#0a0a0a]/10">
                    Kelas 5 – 9 (SD/SMP)
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-[#0a0a0a] mb-1">
                  Kategori SD - SMP
                </h3>
                <p className="text-[11px] text-[#0a0a0a]/80 leading-relaxed mb-3.5">
                  Kompetisi tingkat SD & SMP untuk melatih penalaran matematis, kemampuan berpikir spasial, dan penalaran logika.
                </p>

                {/* Compact Quick Stats Bar */}
                <div className="grid grid-cols-3 gap-1.5 mb-4">
                  <div className="bg-white/60 rounded-lg p-1.5 border border-[#0a0a0a]/10 text-center">
                    <span className="material-symbols-outlined text-[#0a0a0a] text-sm block">timer</span>
                    <span className="text-[11px] font-black block mt-0.5">90 Menit</span>
                    <span className="text-[8px] text-[#5a5a5a] uppercase font-bold tracking-wider">Durasi</span>
                  </div>
                  <div className="bg-white/60 rounded-lg p-1.5 border border-[#0a0a0a]/10 text-center">
                    <span className="material-symbols-outlined text-[#0a0a0a] text-sm block">format_list_numbered</span>
                    <span className="text-[11px] font-black block mt-0.5">25 Soal</span>
                    <span className="text-[8px] text-[#5a5a5a] uppercase font-bold tracking-wider">Soal</span>
                  </div>
                  <div className="bg-white/60 rounded-lg p-1.5 border border-[#0a0a0a]/10 text-center">
                    <span className="material-symbols-outlined text-[#0a0a0a] text-sm block">military_tech</span>
                    <span className="text-[11px] font-black block mt-0.5">Rp 15 Juta</span>
                    <span className="text-[8px] text-[#5a5a5a] uppercase font-bold tracking-wider">Total Hadiah</span>
                  </div>
                </div>

                {/* Topics Pills */}
                <div className="mb-5">
                  <h4 className="text-[9px] font-extrabold uppercase tracking-wider text-[#0a0a0a]/70 mb-1.5">
                    Fokus Silabus:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-white/60 text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#0a0a0a]/10">
                      Aritmatika & Pola
                    </span>
                    <span className="bg-white/60 text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#0a0a0a]/10">
                      Geometri Dasar
                    </span>
                    <span className="bg-white/60 text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#0a0a0a]/10">
                      Teori Bilangan
                    </span>
                    <span className="bg-white/60 text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#0a0a0a]/10">
                      Teka-teki Logika
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate(isLoggedIn ? 'student-dashboard' : 'register')}
                className="w-full bg-[#0a0a0a] hover:bg-[#0a0a0a]/90 text-white font-bold py-2.5 rounded-lg clay-shadow clay-button-active transition-all text-xs flex items-center justify-center gap-1.5 mt-1"
              >
                <span>{isLoggedIn ? 'Buka Dashboard' : 'Daftar Kategori SD-SMP'}</span>
                <span className="material-symbols-outlined text-xs">{isLoggedIn ? 'dashboard' : 'arrow_forward'}</span>
              </button>
            </div>

            {/* SMA Category Card */}
            <div className="bg-[#e8b94a] text-[#0a0a0a] p-5 sm:p-6 rounded-[22px] clay-shadow hover:-translate-y-1 transition-transform flex flex-col justify-between border-2 border-[#0a0a0a] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -mr-6 -mt-6 pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-[#0a0a0a] text-white text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                    LIGA SENIOR
                  </span>
                  <span className="bg-white/60 text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#0a0a0a]/10">
                    Kelas 10 – 12 (SMA)
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-[#0a0a0a] mb-1">
                  Kategori SMA
                </h3>
                <p className="text-[11px] text-[#0a0a0a]/80 leading-relaxed mb-3.5">
                  Kompetisi tingkat SMA yang menguji pembuktian tingkat lanjut, aljabar, aritmatika modular & kombinatorika.
                </p>

                {/* Compact Quick Stats Bar */}
                <div className="grid grid-cols-3 gap-1.5 mb-4">
                  <div className="bg-white/60 rounded-lg p-1.5 border border-[#0a0a0a]/10 text-center">
                    <span className="material-symbols-outlined text-[#0a0a0a] text-sm block">timer</span>
                    <span className="text-[11px] font-black block mt-0.5">120 Menit</span>
                    <span className="text-[8px] text-[#5a5a5a] uppercase font-bold tracking-wider">Durasi</span>
                  </div>
                  <div className="bg-white/60 rounded-lg p-1.5 border border-[#0a0a0a]/10 text-center">
                    <span className="material-symbols-outlined text-[#0a0a0a] text-sm block">format_list_numbered</span>
                    <span className="text-[11px] font-black block mt-0.5">30 Soal</span>
                    <span className="text-[8px] text-[#5a5a5a] uppercase font-bold tracking-wider">Soal</span>
                  </div>
                  <div className="bg-white/60 rounded-lg p-1.5 border border-[#0a0a0a]/10 text-center">
                    <span className="material-symbols-outlined text-[#0a0a0a] text-sm block">military_tech</span>
                    <span className="text-[11px] font-black block mt-0.5">Rp 25 Juta</span>
                    <span className="text-[8px] text-[#5a5a5a] uppercase font-bold tracking-wider">Total Hadiah</span>
                  </div>
                </div>

                {/* Topics Pills */}
                <div className="mb-5">
                  <h4 className="text-[9px] font-extrabold uppercase tracking-wider text-[#0a0a0a]/70 mb-1.5">
                    Fokus Silabus:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-white/60 text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#0a0a0a]/10">
                      Aljabar Lanjutan
                    </span>
                    <span className="bg-white/60 text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#0a0a0a]/10">
                      Geometri Euklides
                    </span>
                    <span className="bg-white/60 text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#0a0a0a]/10">
                      Aritmatika Modular
                    </span>
                    <span className="bg-white/60 text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#0a0a0a]/10">
                      Kombinatorika
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate(isLoggedIn ? 'student-dashboard' : 'register')}
                className="w-full bg-[#0a0a0a] hover:bg-[#0a0a0a]/90 text-white font-bold py-2.5 rounded-lg clay-shadow clay-button-active transition-all text-xs flex items-center justify-center gap-1.5 mt-1"
              >
                <span>{isLoggedIn ? 'Buka Dashboard' : 'Daftar Kategori SMA'}</span>
                <span className="material-symbols-outlined text-xs">{isLoggedIn ? 'dashboard' : 'arrow_forward'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Competition Rules Section */}
        <div id="rules-section" className="text-center mb-16 pt-8 scroll-mt-24 max-w-4xl mx-auto px-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a] tracking-tight mb-2">
            Aturan & Pedoman Kompetisi
          </h2>
          <p className="text-[#6a6a6a] max-w-lg mx-auto text-xs sm:text-sm mb-8">
            Pelajari tata tertib, sistem penilaian, dan ketentuan pengawasan sesuai kategori Anda.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* SD-SMP Rules Card */}
            <div className="bg-white p-6 rounded-[24px] clay-shadow border-2 border-[#ff6b5a] flex flex-col justify-between hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff6b5a]/15 rounded-full -mr-8 -mt-8 pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-[#ff6b5a] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                    KATEGORI SD-SMP
                  </span>
                  <span className="material-symbols-outlined text-[#ff6b5a] text-xl">menu_book</span>
                </div>

                <h3 className="text-lg font-black text-[#0a0a0a] mb-2">
                  Aturan Kompetisi Junior
                </h3>
                
                <ul className="space-y-2.5 text-xs text-[#0a0a0a]/80 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#ff6b5a] text-base shrink-0 mt-0.5">timer</span>
                    <span><strong>Durasi & Format:</strong> 90 menit dialokasikan untuk 25 soal pilihan ganda & logika.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#ff6b5a] text-base shrink-0 mt-0.5">grade</span>
                    <span><strong>Sistem Penilaian:</strong> +4 poin untuk jawaban benar, 0 untuk tidak dijawab, -1 untuk jawaban salah.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#ff6b5a] text-base shrink-0 mt-0.5">calculate</span>
                    <span><strong>Alat Diizinkan:</strong> Kertas buram, pulpen/pensil, dan kalkulator non-program standar.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#ff6b5a] text-base shrink-0 mt-0.5">videocam</span>
                    <span><strong>Integritas & Pengawasan:</strong> Kamera depan (webcam) wajib aktif selama sesi ujian berlangsung.</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setRuleModalCategory('sd-smp')}
                className="w-full bg-[#f5f0e0] hover:bg-[#ebe6d6] text-[#0a0a0a] font-bold py-2.5 px-4 rounded-xl border border-[#0a0a0a]/15 transition-all text-xs flex items-center justify-center gap-1.5"
              >
                <span>Lihat Panduan Lengkap SD-SMP</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>

            {/* SMA Rules Card */}
            <div className="bg-white p-6 rounded-[24px] clay-shadow border-2 border-[#e8b94a] flex flex-col justify-between hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#e8b94a]/20 rounded-full -mr-8 -mt-8 pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-[#e8b94a] text-[#0a0a0a] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                    KATEGORI SMA
                  </span>
                  <span className="material-symbols-outlined text-[#b8860b] text-xl">verified_user</span>
                </div>

                <h3 className="text-lg font-black text-[#0a0a0a] mb-2">
                  Aturan Kompetisi Senior
                </h3>

                <ul className="space-y-2.5 text-xs text-[#0a0a0a]/80 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#b8860b] text-base shrink-0 mt-0.5">timer</span>
                    <span><strong>Durasi & Format:</strong> 120 menit dialokasikan untuk 30 soal isian singkat & pembuktian.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#b8860b] text-base shrink-0 mt-0.5">military_tech</span>
                    <span><strong>Sistem Penilaian:</strong> +5 poin per jawaban benar. Babak final memerlukan unggah berkas jawaban.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#b8860b] text-base shrink-0 mt-0.5">block</span>
                    <span><strong>Pembatasan Ketat:</strong> DILARANG menggunakan kalkulator, perangkat pintar, atau buku cetak luar.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#b8860b] text-base shrink-0 mt-0.5">shield</span>
                    <span><strong>Pengawasan:</strong> Lingkungan kamera ganda / rekaman layar diberlakukan secara ketat.</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setRuleModalCategory('sma')}
                className="w-full bg-[#f5f0e0] hover:bg-[#ebe6d6] text-[#0a0a0a] font-bold py-2.5 px-4 rounded-xl border border-[#0a0a0a]/15 transition-all text-xs flex items-center justify-center gap-1.5"
              >
                <span>Lihat Panduan Lengkap SMA</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Rules Modal */}
        {ruleModalCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#fef9ef] border-2 border-[#0a0a0a] rounded-[28px] max-w-2xl w-full p-6 sm:p-8 clay-shadow relative max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={() => setRuleModalCategory(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white border border-[#0a0a0a]/15 flex items-center justify-center hover:bg-[#ff6b5a] hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  ruleModalCategory === 'sd-smp' ? 'bg-[#ff6b5a] text-white' : 'bg-[#e8b94a] text-[#0a0a0a]'
                }`}>
                  {ruleModalCategory === 'sd-smp' ? 'Buku Panduan SD-SMP' : 'Buku Panduan SMA'}
                </span>
                <span className="text-xs text-[#6a6a6a] font-bold">Versi 2.4 • Resmi 2024</span>
              </div>

              <h2 className="text-2xl font-black text-[#0a0a0a] mb-4">
                {ruleModalCategory === 'sd-smp' ? 'Peraturan Resmi Kompetisi SD-SMP' : 'Peraturan Resmi Kompetisi SMA'}
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-[#0a0a0a]/85 leading-relaxed">
                <div className="bg-white p-4 rounded-2xl border border-[#0a0a0a]/10">
                  <h4 className="font-extrabold text-[#0a0a0a] mb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#ff6b5a] text-base">verified</span>
                    1. Syarat Peserta & Identifikasi
                  </h4>
                  <p className="text-xs text-[#6a6a6a]">
                    Peserta harus merupakan siswa aktif {ruleModalCategory === 'sd-smp' ? 'SD (Kelas 5-6) atau SMP (Kelas 7-9)' : 'SMA / SMK (Kelas 10-12)'}. Kartu Pelajar/KTP/Kartu Identitas Anak yang sah wajib diunggah sebelum pengerjaan ujian.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#0a0a0a]/10">
                  <h4 className="font-extrabold text-[#0a0a0a] mb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#ff6b5a] text-base">timer</span>
                    2. Lingkungan Ujian & Batas Waktu
                  </h4>
                  <p className="text-xs text-[#6a6a6a]">
                    Ujian berlangsung tepat selama {ruleModalCategory === 'sd-smp' ? '90 menit' : '120 menit'}. Setelah dimulai, penanda waktu tidak dapat dihentikan sementara. Gangguan koneksi lebih dari 5 menit tanpa konfirmasi pengawas dapat dianggap selesai.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#0a0a0a]/10">
                  <h4 className="font-extrabold text-[#0a0a0a] mb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#ff6b5a] text-base">security</span>
                    3. Protokol Pencegahan Kecurangan
                  </h4>
                  <p className="text-xs text-[#6a6a6a]">
                    {ruleModalCategory === 'sd-smp'
                      ? 'Kamera depan/webcam wajib aktif selama ujian. Kalkulator non-program dasar diizinkan, tetapi penggunaan mesin pencari, aplikasi percakapan, atau alat AI sangat dilarang.'
                      : 'Pengawasan kamera ganda (samping dan depan) serta perekaman layar diaktifkan. DILARANG menggunakan kalkulator, jam tangan pintar, catatan rumus luar, atau bantuan pihak ketiga.'}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#0a0a0a]/10">
                  <h4 className="font-extrabold text-[#0a0a0a] mb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#ff6b5a] text-base">grade</span>
                    4. Penilaian & Penentuan Pemenang
                  </h4>
                  <p className="text-xs text-[#6a6a6a]">
                    {ruleModalCategory === 'sd-smp'
                      ? 'Jawaban benar mendapatkan +4 poin, tidak dijawab 0 poin, dan jawaban salah -1 poin. Jika terdapat poin yang sama, durasi waktu penyelesaian menjadi penentu.'
                      : 'Setiap jawaban singkat benar mendapatkan +5 poin. Untuk babak final, soal pembuktian dinilai secara manual oleh juri nasional berdasarkan ketepatan logika matematis.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#0a0a0a]/10">
                <a
                  href={`#download-${ruleModalCategory}-rules`}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Mengunduh berkas Panduan Resmi ${ruleModalCategory.toUpperCase()} PDF!`);
                  }}
                  className="inline-flex items-center gap-2 bg-[#0a0a0a] hover:bg-[#0a0a0a]/80 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Unduh Panduan PDF Resmi</span>
                </a>

                <button
                  onClick={() => {
                    setRuleModalCategory(null);
                    onNavigate(isLoggedIn ? 'student-dashboard' : 'register');
                  }}
                  className="inline-flex items-center gap-1.5 bg-[#ff6b5a] hover:bg-[#e05646] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all"
                >
                  <span>{isLoggedIn ? 'Buka Dashboard' : 'Lanjut ke Pendaftaran'}</span>
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
