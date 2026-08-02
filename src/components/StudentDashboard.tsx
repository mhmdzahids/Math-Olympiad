import React, { useState, useEffect } from 'react';
import { ScreenView, CompetitionRound } from '../types';
import { ASSET_IMAGES, INITIAL_ROUNDS } from '../data/mockData';

interface StudentDashboardProps {
  onNavigate: (screen: ScreenView) => void;
  studentName?: string;
  studentCategory?: string;
  rounds?: CompetitionRound[];
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  studentName = 'Andi',
  studentCategory = 'SMA',
  rounds = INITIAL_ROUNDS
}) => {
  const normalizedCategory = studentCategory.includes('SD') || studentCategory.includes('SMP') ? 'SD-SMP' : 'SMA';
  const [selectedCategory, setSelectedCategory] = useState<'SD-SMP' | 'SMA'>(normalizedCategory as 'SD-SMP' | 'SMA');

  useEffect(() => {
    const norm = studentCategory.includes('SD') || studentCategory.includes('SMP') ? 'SD-SMP' : 'SMA';
    setSelectedCategory(norm as 'SD-SMP' | 'SMA');
  }, [studentCategory]);

  const displayedRounds = rounds.filter((r) => (r.category || 'SMA') === selectedCategory);

  return (
    <div className="w-full bg-[#fef9ef] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10">
        {/* Welcome Banner */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-bold text-[#0a0a0a] tracking-tight mb-2">
              Selamat datang kembali, {studentName}!
            </h1>
            <p className="text-base text-[#6a6a6a] max-w-2xl">
              Siap menghadapi tantangan berikutnya? Progres Anda sedang dicatat menuju kejuaraan nasional.
            </p>
          </div>

          <div className="bg-[#ebe6d6] border border-[#0a0a0a]/10 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <span className="material-symbols-outlined text-[#0a0a0a] text-xl">school</span>
            <div>
              <div className="text-[10px] font-bold uppercase text-[#6a6a6a]">Kategori Terdaftar</div>
              <div className="text-sm font-black text-[#0a0a0a]">{normalizedCategory}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Main Content: Competition Rounds */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0a0a0a] tracking-tight">
                Babak Kompetisi
              </h2>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-[#ebe6d6] p-1.5 rounded-2xl border border-[#0a0a0a]/10">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('SD-SMP')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === 'SD-SMP'
                      ? 'bg-[#ffb084] text-[#0a0a0a] shadow-2xs border border-[#0a0a0a]/20'
                      : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                  }`}
                >
                  <span>SD - SMP</span>
                  {normalizedCategory === 'SD-SMP' && (
                    <span className="bg-[#0a0a0a] text-white text-[9px] px-1.5 py-0.2 rounded-full font-extrabold">
                      Anda
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory('SMA')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === 'SMA'
                      ? 'bg-[#e8b94a] text-[#0a0a0a] shadow-2xs border border-[#0a0a0a]/20'
                      : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                  }`}
                >
                  <span>SMA</span>
                  {normalizedCategory === 'SMA' && (
                    <span className="bg-[#0a0a0a] text-white text-[9px] px-1.5 py-0.2 rounded-full font-extrabold">
                      Anda
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {displayedRounds.length === 0 ? (
                <div className="bg-[#f8f3e9] border border-[#0a0a0a]/10 rounded-2xl p-8 text-center space-y-2">
                  <span className="material-symbols-outlined text-4xl text-[#6a6a6a]">folder_off</span>
                  <p className="text-sm font-bold text-[#0a0a0a]">Belum Ada Babak untuk Kategori {selectedCategory}</p>
                  <p className="text-xs text-[#6a6a6a]">Silakan pilih kategori lain atau tunggu informasi dari panitia.</p>
                </div>
              ) : (
                displayedRounds.map((round, idx) => {
                const isOffline = round.executionMode === 'offline';

                if (round.status === 'submitted') {
                  return (
                    <div
                      key={round.id}
                      className="clay-card bg-[#f8f3e9] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 border border-[#e7e2d8]"
                    >
                      <div className="w-16 h-16 bg-[#e7e2d8] rounded-xl flex items-center justify-center relative shrink-0">
                        <span className="material-symbols-outlined text-[#6a6a6a] text-4xl">
                          check_circle
                        </span>
                        {/* 3D Mascot Peek */}
                        {idx === 0 && (
                          <div className="absolute -top-6 -left-4 w-12 h-12 pointer-events-none">
                            <img
                              src={ASSET_IMAGES.starPeek}
                              alt="Star Mascot"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-lg font-bold text-[#0a0a0a]">{round.title}</h3>
                          <span className="bg-[#ebe6d6] text-[#6a6a6a] px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase">
                            Selesai
                          </span>
                          {isOffline && (
                            <span className="bg-[#feaf83]/30 text-[#0a0a0a] px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase">
                              Sesi Offline
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#6a6a6a]">
                          Selesai pada 12 Okt 2024. Hasil Anda sedang diverifikasi oleh panitia.
                        </p>
                      </div>

                      <div className="text-left md:text-right shrink-0">
                        <span className="text-sm font-semibold text-[#6a6a6a]">Proses Penilaian</span>
                      </div>
                    </div>
                  );
                }

                if (round.status === 'active') {
                  const startDateStr = round.startDate || '2026-08-01';
                  const startTimeStr = round.startTime || '08:00';
                  const endDateStr = round.endDate || '2026-08-10';
                  const endTimeStr = round.endTime || '18:00';

                  const startDateTime = new Date(`${startDateStr}T${startTimeStr}:00`);
                  const endDateTime = new Date(`${endDateStr}T${endTimeStr}:00`);
                  const now = new Date();

                  const isNotStartedYet = now < startDateTime;
                  const isClosed = now > endDateTime;
                  const isWithinWindow = !isNotStartedYet && !isClosed;

                  return (
                    <div
                      key={round.id}
                      className="clay-card bg-[#ff4d8b] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-xl shadow-[#ff4d8b]/20 relative overflow-hidden text-white"
                    >
                      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                      <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center relative z-10 shrink-0">
                        <span className="material-symbols-outlined text-white text-4xl">
                          {isOffline ? 'co_present' : isNotStartedYet ? 'event_upcoming' : isClosed ? 'event_busy' : 'schedule'}
                        </span>
                      </div>

                      <div className="flex-grow relative z-10">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-xl font-extrabold text-white">{round.title}</h3>
                          {isNotStartedYet ? (
                            <span className="bg-amber-300 text-[#0a0a0a] px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wide">
                              Belum Dimulai
                            </span>
                          ) : isClosed ? (
                            <span className="bg-gray-800 text-white px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase">
                              Sudah Ditutup
                            </span>
                          ) : (
                            <span className="bg-white/20 text-white px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase">
                              Aktif & Tersedia
                            </span>
                          )}

                          {isOffline && (
                            <span className="bg-[#fef9ef] text-[#0a0a0a] px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold uppercase flex items-center gap-1 shadow-xs">
                              <span className="material-symbols-outlined text-[14px] text-[#ff4d8b]">co_present</span>
                              Sesi Offline
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/90 leading-relaxed">
                          {isOffline
                            ? `${round.durationMinutes} Menit | Sesi Tatap Muka (Soal Ditampilkan via 1 Proyektor)`
                            : `${round.durationMinutes} Menit | Batas Pindah Tab: ${round.tabSwitchLimit}x`}
                        </p>

                        {/* Schedule Badge */}
                        <div className="mt-2 text-xs bg-black/15 border border-white/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-amber-200">calendar_clock</span>
                          <span>Jadwal: <strong>{startDateStr} ({startTimeStr})</strong> s/d <strong>{endDateStr} ({endTimeStr})</strong></span>
                        </div>
                      </div>

                      <div className="relative z-10 shrink-0 w-full md:w-auto">
                        {isOffline ? (
                          <div className="bg-white/20 backdrop-blur-xs border border-white/40 p-3.5 rounded-xl text-white text-xs max-w-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-black uppercase tracking-wider text-amber-200">
                              <span className="material-symbols-outlined text-base">co_present</span>
                              <span>Proyektor Sesi Offline</span>
                            </div>
                            <p className="text-[11px] leading-snug opacity-95">
                              {round.isOfflineStarted
                                ? '🔴 Sesi Offline Sedang Berlangsung di Kelas. Soal ditayangkan via proyektor utama.'
                                : 'Ujian dilaksanakan secara offline di kelas. Soal akan ditayangkan via proyektor utama saat panitia memulai babak.'}
                            </p>
                          </div>
                        ) : isNotStartedYet ? (
                          <button
                            disabled
                            className="w-full md:w-auto bg-white/20 text-white cursor-not-allowed px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-white/30"
                          >
                            <span className="material-symbols-outlined text-base">lock_clock</span>
                            <span>Kuis Belum Dimulai</span>
                          </button>
                        ) : isClosed ? (
                          <button
                            disabled
                            className="w-full md:w-auto bg-black/30 text-white/70 cursor-not-allowed px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-white/10"
                          >
                            <span className="material-symbols-outlined text-base">event_busy</span>
                            <span>Sesi Kuis Ditutup</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onNavigate('quiz')}
                            className="w-full md:w-auto bg-white text-[#0a0a0a] hover:bg-gray-100 px-6 py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span>Mulai Kuis Sekarang</span>
                            <span className="material-symbols-outlined text-sm">play_arrow</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }

                // Locked Status
                return (
                  <div
                    key={round.id}
                    className="clay-card bg-[#f5f0e0] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 border border-[#e7e2d8] opacity-75"
                  >
                    <div className="w-16 h-16 bg-[#e7e2d8] rounded-xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#6a6a6a] text-4xl">
                        {isOffline ? 'co_present' : 'lock'}
                      </span>
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-bold text-[#0a0a0a]">{round.title}</h3>
                        <span className="bg-[#e8b94a]/20 text-[#e8b94a] px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase">
                          Terkunci
                        </span>
                        {isOffline && (
                          <span className="bg-[#feaf83]/30 text-[#0a0a0a] px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase">
                            Sesi Offline
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#6a6a6a]">
                        Terbuka setelah kelulusan babak sebelumnya.{' '}
                        {isOffline ? 'Dilaksanakan tatap muka dengan 1 proyektor.' : 'Dijadwalkan untuk babak mendatang.'}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <span className="bg-[#f2ede4] px-3 py-1 rounded-md text-[10px] font-black text-[#6a6a6a]/60 border border-[#6a6a6a]/20">
                        {round.isFinal ? 'FINAL' : 'REGULER'}
                      </span>
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Qualification Status Card */}
            <div className="bg-[#ffdbca] rounded-2xl p-6 shadow-lg relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#8b4f2b]">campaign</span>
                  <h2 className="font-bold text-base text-[#6e3816]">Status Kualifikasi</h2>
                </div>

                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/40 mb-4">
                  <p className="text-sm text-[#6e3816]">
                    Pengumuman resmi: <br />
                    <strong className="text-[#0a0a0a] font-black text-base">
                      "Anda lolos ke Penyisihan 2!"
                    </strong>
                  </p>
                </div>

                <p className="text-xs text-[#6e3816]/90 leading-relaxed">
                  Hasil Anda di babak sebelumnya menempatkan Anda di 15% peserta teratas. Pertahankan prestasi ini!
                </p>
              </div>
            </div>

            {/* Upcoming Dates Card */}
            <div className="bg-[#f5f0e0] rounded-2xl p-6 border border-[#e7e2d8]">
              <h3 className="font-bold text-base text-[#0a0a0a] mb-4">Agenda Mendatang</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-[#a4d4c5]/30 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-[#0a0a0a] shrink-0">
                    <span className="text-[10px] font-bold">OKT</span>
                    <span className="text-base font-black leading-none">28</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#0a0a0a]">Webinar Langsung</p>
                    <p className="text-xs text-[#6a6a6a]">Persiapan Kalkulus Lanjutan</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-[#b8a4ed]/30 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-[#0a0a0a] shrink-0">
                    <span className="text-[10px] font-bold">NOV</span>
                    <span className="text-base font-black leading-none">05</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#0a0a0a]">Batas Akhir Pendaftaran</p>
                    <p className="text-xs text-[#6a6a6a]">Pengumpulan Babak Final</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
