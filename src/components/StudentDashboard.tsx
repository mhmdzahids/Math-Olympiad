import React, { useState, useEffect } from 'react';
import { ScreenView, CompetitionRound } from '../types';
import { ASSET_IMAGES, INITIAL_ROUNDS, COMPETITION_INFO } from '../data/mockData';

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
                            Jawaban Anda telah tersimpan. Pengumuman kualifikasi babak final diumumkan oleh panitia.
                          </p>
                        </div>

                        <div className="text-left md:text-right shrink-0">
                          <span className="text-sm font-semibold text-[#6a6a6a]">Proses Penilaian</span>
                        </div>
                      </div>
                    );
                  }

                  if (round.status === 'active') {
                    return (
                      <div
                        key={round.id}
                        className="clay-card bg-[#0a0a0a] text-white rounded-2xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden border border-[#ff6b5a]/30 shadow-2xl"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#ff6b5a] text-white flex items-center justify-center font-black text-xl shrink-0">
                              <span className="material-symbols-outlined text-2xl">quiz</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="bg-[#ff6b5a] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                                  BABAK AKTIF
                                </span>
                                {isOffline ? (
                                  <span className="bg-[#feaf83] text-[#0a0a0a] text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                                    Sesi Offline Kampus UIN
                                  </span>
                                ) : (
                                  <span className="bg-[#b8a4ed] text-[#0a0a0a] text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                                    Zoom Daring
                                  </span>
                                )}
                              </div>
                              <h3 className="text-xl sm:text-2xl font-black text-white">{round.title}</h3>
                            </div>
                          </div>

                          <div className="text-xs text-white/80 font-bold bg-white/10 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-auto">
                            {round.questionCount} Soal • {round.durationMinutes} Menit
                          </div>
                        </div>

                        <p className="text-sm text-white/80 leading-relaxed">
                          {isOffline
                            ? 'Sesi final dilaksanakan tatap muka di Kampus UIN Siber Syekh Nurjati Cirebon.'
                            : 'Ujian penyisihan daring via Zoom. Kamera pengawas wajib diatur posisi samping ±1 meter.'}
                        </p>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-white/10">
                          <div className="text-xs text-white/70">
                            Waktu Pelaksanaan: <strong className="text-white">{round.startDate || '14 Sept 2026'} ({round.startTime || '13.00'} WIB)</strong>
                          </div>

                          {!isOffline && (
                            <button
                              onClick={() => onNavigate('quiz')}
                              className="w-full sm:w-auto bg-[#ff6b5a] hover:bg-[#ff6b5a]/90 text-white font-extrabold px-6 py-3 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
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
            {/* Contact Persons Card from Proposal */}
            <div className="bg-[#fffaf0] rounded-2xl p-6 border-2 border-[#0a0a0a]/15 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-[#ff6b5a] tracking-wider">
                <span className="material-symbols-outlined text-base">support_agent</span>
                <span>Narahubung Resmi OPTIMA</span>
              </div>
              <div className="space-y-3 text-xs">
                {COMPETITION_INFO.contacts.map((c) => (
                  <div key={c.category} className="bg-white p-3 rounded-xl border border-[#0a0a0a]/10">
                    <div className="font-bold text-[#0a0a0a]">{c.category}</div>
                    <div className="text-[#6a6a6a]">{c.name}</div>
                    <div className="font-mono font-bold text-[#ff6b5a] mt-0.5">{c.phone}</div>
                  </div>
                ))}
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
