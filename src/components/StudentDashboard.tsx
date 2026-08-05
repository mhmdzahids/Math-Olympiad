import React, { useState, useEffect } from 'react';
import { ScreenView, CompetitionRound } from '../types';
import { ASSET_IMAGES, INITIAL_ROUNDS, COMPETITION_INFO } from '../data/mockData';
import { apiService } from '../services/api';

interface StudentDashboardProps {
  onNavigate: (screen: ScreenView) => void;
  studentName?: string;
  studentCategory?: string;
  rounds?: CompetitionRound[];
  onStartQuiz?: (round: CompetitionRound) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  studentName = 'Andi',
  studentCategory = 'SMA',
  rounds = INITIAL_ROUNDS,
  onStartQuiz
}) => {
  const normalizedCategory = studentCategory.includes('SD') ? 'SD' : studentCategory.includes('SMP') ? 'SMP' : 'SMA';
  const [selectedCategory, setSelectedCategory] = useState<'SD' | 'SMP' | 'SMA'>(normalizedCategory as 'SD' | 'SMP' | 'SMA');
  const [myQuizSessionsList, setMyQuizSessionsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) setIsLoading(false);
    }, 1200); // Constant 1.2-second realistic skeleton loader after login

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const norm = studentCategory.includes('SD') ? 'SD' : studentCategory.includes('SMP') ? 'SMP' : 'SMA';
    setSelectedCategory(norm as 'SD' | 'SMP' | 'SMA');
  }, [studentCategory]);

  useEffect(() => {
    let isMounted = true;
    async function loadMySessions() {
      try {
        const list = await apiService.getMyQuizSessions();
        if (!isMounted) return;
        setMyQuizSessionsList(list || []);
      } catch {
        // Fallback if unauthenticated / offline
      }
    }
    loadMySessions();
    return () => {
      isMounted = false;
    };
  }, []);

  function getRoundScheduleInfo(round: CompetitionRound) {
    const sDate = round.startDate || '2026-08-01';
    const sTime = round.startTime || '08:00';
    const eDate = round.endDate || '2026-08-10';
    const eTime = round.endTime || '18:00';

    const startDt = new Date(`${sDate}T${sTime}:00`);
    const endDt = new Date(`${eDate}T${eTime}:00`);
    const now = new Date();

    const isBefore = now < startDt;
    const isAfter = now > endDt;
    const isOpen = !isBefore && !isAfter;

    return { isBefore, isAfter, isOpen, sDate, sTime, eDate, eTime };
  }

  function formatTanggalID(dateStr: string, timeStr: string): string {
    const bulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const parts = dateStr.split('-');
    if (parts.length !== 3) return `${dateStr}, ${timeStr.replace(':', '.')} WIB`;
    const [tahun, bln, hari] = parts;
    const namaBulan = bulan[parseInt(bln, 10) - 1] || bln;
    const jam = timeStr.replace(':', '.');
    return `${parseInt(hari, 10)} ${namaBulan} ${tahun}, ${jam} WIB`;
  }

  const displayedRounds = rounds.filter((r) => (r.category || 'SD') === selectedCategory);

  if (isLoading) {
    return (
      <div className="w-full bg-[#fef9ef] min-h-screen pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 space-y-10">
          {/* Welcome Banner Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
            <div className="space-y-3">
              <div className="w-48 h-4 rounded-md bg-[#ff6b5a]/20" />
              <div className="w-72 sm:w-[480px] h-10 rounded-2xl bg-[#0a0a0a]/15" />
              <div className="w-64 sm:w-96 h-4 rounded-md bg-[#0a0a0a]/10" />
            </div>
            <div className="w-40 h-16 rounded-2xl bg-[#ebe6d6] border border-[#0a0a0a]/10 shrink-0 self-start sm:self-auto" />
          </div>

          {/* Main 2-Column Layout Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column (2 Cols): Round Cards Stack */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section Title Skeleton */}
              <div className="w-64 h-8 rounded-xl bg-[#0a0a0a]/15 animate-pulse" />

              {/* Stacked Horizontal Round Cards Skeleton */}
              <div className="space-y-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-[#f5f0e0]/70 rounded-[24px] p-5 sm:p-6 border-2 border-[#0a0a0a]/10 clay-shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse"
                  >
                    <div className="flex items-start sm:items-center gap-4 flex-1">
                      {/* Left Square Icon Box */}
                      <div className="w-12 h-12 rounded-2xl bg-[#0a0a0a]/10 shrink-0" />
                      {/* Middle Information */}
                      <div className="space-y-2.5 flex-1">
                        <div className="w-48 sm:w-64 h-6 rounded-lg bg-[#0a0a0a]/15" />
                        <div className="w-36 h-5 rounded-full bg-[#a4d4c5]/40" />
                        <div className="w-56 sm:w-80 h-3.5 rounded-md bg-[#0a0a0a]/10" />
                      </div>
                    </div>
                    {/* Right Action Pill Button */}
                    <div className="w-full sm:w-44 h-11 rounded-2xl bg-[#0a0a0a]/15 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column (1 Col): Qualification Card & Agenda Card */}
            <div className="space-y-6">
              
              {/* Qualification Status Card Skeleton */}
              <div className="bg-[#ffdcd0]/70 rounded-[28px] p-6 border-2 border-[#0a0a0a]/10 clay-shadow-sm space-y-4 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#ff6b5a]/30" />
                  <div className="w-36 h-5 rounded-md bg-[#0a0a0a]/15" />
                </div>
                <div className="bg-white/80 rounded-2xl p-4 space-y-2 border border-[#0a0a0a]/5">
                  <div className="w-28 h-3.5 rounded-md bg-[#0a0a0a]/10" />
                  <div className="w-44 h-5 rounded-lg bg-[#0a0a0a]/15" />
                </div>
                <div className="w-full h-8 rounded-md bg-[#0a0a0a]/10" />
              </div>

              {/* Agenda OPTIMA Card Skeleton */}
              <div className="bg-[#f5f0e0]/70 rounded-[28px] p-6 border-2 border-[#0a0a0a]/10 clay-shadow-sm space-y-5 animate-pulse">
                <div className="w-44 h-6 rounded-md bg-[#0a0a0a]/15" />
                
                {/* 3 Agenda Items */}
                <div className="space-y-4 pt-1">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#a4d4c5]/40 shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="w-36 h-4 rounded-md bg-[#0a0a0a]/15" />
                        <div className="w-28 h-3 rounded-md bg-[#0a0a0a]/10" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#fef9ef] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10">
        {/* Welcome Banner */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase text-[#ff6b5a] tracking-wider block mb-1">
              OPTIMA MATRIX 2026 • PORTAL PESERTA
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold text-[#0a0a0a] tracking-tight mb-2">
              Selamat datang kembali, {studentName}!
            </h1>
            <p className="text-base text-[#6a6a6a] max-w-2xl">
              Siapkan diri Anda untuk mengikuti rangkaian babak Olimpiade Prestasi Matematika 2026 Se-Pulau Jawa.
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
                Babak Kompetisi OPTIMA 2026
              </h2>
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
                  const session = myQuizSessionsList.find((s) => s.round_id === round.id);
                  const { isBefore, isAfter, isOpen, sDate, sTime, eDate, eTime } = getRoundScheduleInfo(round);

                  const isCompletedSession = Boolean(
                    session && (
                      session.status === 'completed' ||
                      session.status === 'force_ended_tabswitch' ||
                      session.status === 'force_ended_timeout' ||
                      session.submitted_at
                    )
                  );

                  const isOngoingSession = Boolean(
                    session && session.status === 'in_progress' && session.remaining_seconds > 0
                  );

                  if (round.status === 'submitted' || isCompletedSession) {
                    return (
                      <div
                        key={round.id}
                        className="clay-card bg-[#f8f3e9] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 border border-[#e7e2d8]"
                      >
                        <div className="w-16 h-16 bg-[#e7e2d8] rounded-xl flex items-center justify-center relative shrink-0">
                          <span className="material-symbols-outlined text-[#6a6a6a] text-4xl">
                            check_circle
                          </span>
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
                            <span className="bg-[#a4d4c5] text-[#0a0a0a] px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase">
                              Selesai (1x Percobaan)
                            </span>
                            {isOffline && (
                              <span className="bg-[#feaf83]/30 text-[#0a0a0a] px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase">
                                Sesi Offline
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#6a6a6a]">
                            Jawaban Anda telah tersimpan dan dinilai oleh server. Setiap peserta hanya berhak 1x kesempatan pengerjaan.
                          </p>
                        </div>

                        <div className="text-left md:text-right shrink-0">
                          <button
                            type="button"
                            disabled
                            className="bg-[#0a0a0a]/10 text-[#6a6a6a] font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-not-allowed border border-[#0a0a0a]/10"
                          >
                            <span className="material-symbols-outlined text-sm text-[#0a0a0a]/60">check_circle</span>
                            <span>Quiz Sudah Selesai Dikerjakan</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (round.status === 'active') {
                    return (
                      <div
                        key={round.id}
                        className="clay-card bg-[#ffb084] text-[#0a0a0a] rounded-[28px] p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden border-2 border-[#0a0a0a] clay-shadow transition-transform hover:-translate-y-0.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#0a0a0a] text-white flex items-center justify-center font-black text-xl shrink-0 clay-shadow-sm">
                              <span className="material-symbols-outlined text-2xl text-[#a4d4c5]">quiz</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-2xs ${
                                  isAfter ? 'bg-[#ba1a1a]' : isBefore ? 'bg-[#6a6a6a]' : 'bg-[#0a0a0a]'
                                }`}>
                                  {isAfter ? 'BABAK DITUTUP' : isBefore ? 'BELUM DIMULAI' : 'BABAK AKTIF'}
                                </span>
                                {isOngoingSession && (
                                  <span className="bg-[#ba1a1a] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider animate-pulse shadow-2xs">
                                    SESI BERJALAN
                                  </span>
                                )}
                                {isOffline ? (
                                  <span className="bg-white/80 text-[#0a0a0a] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-[#0a0a0a]/20">
                                    Sesi Offline Kampus UIN
                                  </span>
                                ) : (
                                  <span className="bg-white/80 text-[#0a0a0a] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-[#0a0a0a]/20">
                                    Zoom Daring
                                  </span>
                                )}
                              </div>
                              <h3 className="text-xl sm:text-2xl font-black text-[#0a0a0a] tracking-tight">{round.title}</h3>
                            </div>
                          </div>

                          <div className="text-xs text-[#0a0a0a] font-extrabold bg-white/80 border border-[#0a0a0a]/20 px-3.5 py-1.5 rounded-xl shrink-0 self-start sm:self-auto shadow-2xs">
                            {round.questionCount} Soal • {round.durationMinutes} Menit
                          </div>
                        </div>

                        <p className="text-sm text-[#0a0a0a]/90 font-medium leading-relaxed max-w-2xl relative z-10">
                          {isOffline
                            ? 'Sesi final dilaksanakan tatap muka di Kampus UIN Siber Syekh Nurjati Cirebon.'
                            : 'Ujian penyisihan daring via Zoom. Kamera pengawas wajib diatur posisi samping ±1 meter.'}
                        </p>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t-2 border-[#0a0a0a]/15 relative z-10">
                          <div className="text-xs text-[#0a0a0a]/80 font-bold">
                            Jadwal Ujian: <strong className="text-[#0a0a0a] font-black">{formatTanggalID(sDate, sTime)} s.d {formatTanggalID(eDate, eTime)}</strong>
                          </div>

                          {!isOffline && (
                            <>
                              {isCompletedSession ? (
                                <button
                                  type="button"
                                  disabled
                                  className="w-full sm:w-auto bg-[#0a0a0a]/30 text-white/70 font-extrabold px-6 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-[#0a0a0a]/20"
                                  title="Quiz sudah selesai dikerjakan"
                                >
                                  <span className="material-symbols-outlined text-sm text-[#a4d4c5]">check_circle</span>
                                  <span>Quiz Sudah Selesai Dikerjakan</span>
                                </button>
                              ) : isOngoingSession ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onStartQuiz) onStartQuiz(round);
                                    else onNavigate('quiz');
                                  }}
                                  className="w-full sm:w-auto bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#a4d4c5] font-extrabold px-7 py-3.5 rounded-2xl clay-shadow clay-button-active transition-all text-sm flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                                >
                                  <span>Lanjutkan Quiz</span>
                                  <span className="material-symbols-outlined text-sm text-[#a4d4c5]">forward</span>
                                </button>
                              ) : isOpen ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onStartQuiz) onStartQuiz(round);
                                    else onNavigate('quiz');
                                  }}
                                  className="w-full sm:w-auto bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white font-extrabold px-7 py-3.5 rounded-2xl clay-shadow clay-button-active transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <span>Mulai Quiz Sekarang</span>
                                  <span className="material-symbols-outlined text-sm text-[#a4d4c5]">play_arrow</span>
                                </button>
                              ) : isBefore ? (
                                <button
                                  type="button"
                                  disabled
                                  className="w-full sm:w-auto bg-[#0a0a0a]/40 text-white/70 font-extrabold px-6 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-[#0a0a0a]/20"
                                  title="Waktu ujian belum dimulai"
                                >
                                  <span className="material-symbols-outlined text-sm">lock_clock</span>
                                  <span>Waktu Ujian Belum Dimulai</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="w-full sm:w-auto bg-[#0a0a0a]/40 text-white/70 font-extrabold px-6 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-[#0a0a0a]/20"
                                  title="Waktu ujian telah berakhir"
                                >
                                  <span className="material-symbols-outlined text-sm">event_busy</span>
                                  <span>Waktu Ujian Berakhir</span>
                                </button>
                              )}
                            </>
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
                          <span className="bg-[#e8b94a]/20 text-[#8c6508] px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase">
                            Terkunci
                          </span>
                          {isOffline && (
                            <span className="bg-[#feaf83]/30 text-[#0a0a0a] px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase">
                              Offline Kampus UIN SSC
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#6a6a6a]">
                          Terbuka untuk 10 peserta terbaik yang lolos dari babak penyisihan.
                        </p>
                      </div>

                      <div className="shrink-0">
                        <span className="bg-[#f2ede4] px-3 py-1 rounded-md text-[10px] font-black text-[#6a6a6a]/60 border border-[#6a6a6a]/20">
                          {round.isFinal ? 'BABAK FINAL' : 'PENYISIHAN'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
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

            {/* Upcoming Agenda Card */}
            <div className="bg-[#f5f0e0] rounded-2xl p-6 border border-[#e7e2d8]">
              <h3 className="font-bold text-base text-[#0a0a0a] mb-4">Agenda OPTIMA 2026</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-[#a4d4c5]/30 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-[#0a0a0a] shrink-0">
                    <span className="text-[10px] font-bold">SEPT</span>
                    <span className="text-base font-black leading-none">12</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#0a0a0a]">Technical Meeting</p>
                    <p className="text-xs text-[#6a6a6a]">09.00 - 12.00 WIB via Zoom</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-[#b8a4ed]/30 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-[#0a0a0a] shrink-0">
                    <span className="text-[10px] font-bold">SEPT</span>
                    <span className="text-base font-black leading-none">14</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#0a0a0a]">Opening &amp; Penyisihan</p>
                    <p className="text-xs text-[#6a6a6a]">13.00 WIB Daring via Zoom</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-[#e8b94a]/30 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-[#0a0a0a] shrink-0">
                    <span className="text-[10px] font-bold">SEPT</span>
                    <span className="text-base font-black leading-none">16</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#0a0a0a]">Tahap Final Offline</p>
                    <p className="text-xs text-[#6a6a6a]">Kampus UIN SSC Cirebon</p>
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
