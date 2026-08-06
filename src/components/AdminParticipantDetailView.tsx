import React, { useState, useEffect } from 'react';
import { ScreenView, ParticipantDetailData } from '../types';
import { apiService } from '../services/api';
import { MathText } from './MathText';

interface AdminParticipantDetailViewProps {
  participantId: string;
  onNavigate: (screen: ScreenView) => void;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning', title?: string) => void;
}

export const AdminParticipantDetailView: React.FC<AdminParticipantDetailViewProps> = ({
  participantId,
  onNavigate,
  onShowToast,
}) => {
  const [data, setData] = useState<ParticipantDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [questionFilter, setQuestionFilter] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isResettingSession, setIsResettingSession] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    apiService
      .getParticipantDetail(participantId, selectedRoundId || undefined)
      .then((res) => {
        if (!isMounted) return;
        if (res) {
          setData(res);
          if (res.selected_round_id && !selectedRoundId) {
            setSelectedRoundId(res.selected_round_id);
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Gagal mengambil detail peserta:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [participantId]);

  const handleSelectRound = (roundId: string) => {
    setSelectedRoundId(roundId);
    apiService
      .getParticipantDetail(participantId, roundId)
      .then((res) => {
        if (res) {
          setData(res);
        }
      })
      .catch((err) => {
        console.error('Gagal memuat babak:', err);
      });
  };

  if (isLoading && !data) {
    return (
      <div className="w-full bg-[#fef9ef] min-h-screen py-10 px-4 sm:px-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-[#0a0a0a]/10 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-96 bg-[#f5f0e0] rounded-[28px] border-2 border-[#0a0a0a]/10 animate-pulse" />
          <div className="lg:col-span-8 h-96 bg-[#f5f0e0] rounded-[28px] border-2 border-[#0a0a0a]/10 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full bg-[#fef9ef] min-h-screen py-16 px-4 text-center space-y-4">
        <span className="material-symbols-outlined text-5xl text-[#6a6a6a]">person_off</span>
        <h2 className="text-xl font-extrabold text-[#0a0a0a]">Data Peserta Tidak Ditemukan</h2>
        <button
          onClick={() => onNavigate('admin-leaderboard')}
          className="bg-[#0a0a0a] text-white px-6 py-2.5 rounded-xl font-bold text-xs clay-shadow clay-button-active cursor-pointer"
        >
          Kembali ke Klasemen
        </button>
      </div>
    );
  }

  const { participant, rounds_summary, submission_breakdown } = data;
  const activeRoundSummary = rounds_summary.find((r) => r.round_id === selectedRoundId) || rounds_summary[0];

  const handleUpdateQualificationStatus = async (newStatus: 'qualified' | 'disqualified' | 'pending') => {
    setIsUpdatingStatus(true);
    try {
      await apiService.updateQualification(participant.id, newStatus, participant.category);
      const statusLabel = newStatus === 'qualified' ? 'LOLOS' : newStatus === 'disqualified' ? 'TIDAK LOLOS' : 'PENDING';
      onShowToast?.(
        `Status kualifikasi ${participant.full_name} berhasil diperbarui menjadi ${statusLabel}`,
        'success',
        'Status Disimpan'
      );
      const refreshed = await apiService.getParticipantDetail(participant.id, selectedRoundId || undefined);
      setData(refreshed);
    } catch (err: any) {
      onShowToast?.(err.message || 'Gagal memperbarui status kualifikasi', 'warning', 'Gagal Simpan');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleResetSession = async () => {
    if (!selectedRoundId) return;
    const confirmReset = window.confirm("Apakah Anda yakin ingin mereset sesi kuis ini? Seluruh jawaban dan riwayat pelanggaran akan dihapus permanen!");
    if (!confirmReset) return;

    setIsResettingSession(true);
    try {
      await apiService.resetParticipantSession(participant.id, selectedRoundId);
      onShowToast?.("Sesi ujian peserta berhasil direset.", "success", "Reset Berhasil");
      const refreshed = await apiService.getParticipantDetail(participant.id, selectedRoundId);
      setData(refreshed);
    } catch (err: any) {
      onShowToast?.(err.message || "Gagal mereset sesi kuis.", "warning", "Gagal Reset");
    } finally {
      setIsResettingSession(false);
    }
  };

  const filteredQuestions = submission_breakdown.filter((q) => {
    if (questionFilter === 'correct') return q.status === 'correct';
    if (questionFilter === 'incorrect') return q.status === 'incorrect';
    if (questionFilter === 'unanswered') return q.status === 'unanswered';
    return true;
  });

  const correctCount = submission_breakdown.filter((q) => q.status === 'correct').length;
  const incorrectCount = submission_breakdown.filter((q) => q.status === 'incorrect').length;
  const unansweredCount = submission_breakdown.filter((q) => q.status === 'unanswered').length;

  return (
    <div className="w-full bg-[#fef9ef] min-h-screen pb-32 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* ── Top Header Title Bar ── */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('admin-leaderboard')}
            className="w-10 h-10 rounded-2xl bg-white border-2 border-[#0a0a0a]/15 text-[#0a0a0a] flex items-center justify-center clay-shadow-sm clay-button-active hover:bg-[#f5f0e0] transition-all cursor-pointer shrink-0"
            title="Kembali ke Klasemen"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>

          <h1 className="text-2xl sm:text-3xl font-black text-[#0a0a0a] tracking-tight">
            Detail Peserta: <span className="text-[#0a0a0a] underline decoration-[#ff6b5a] decoration-4">{participant.full_name}</span>
          </h1>
        </div>

        {/* ── Horizontal Round Selector Tabs Bar ── */}
        <div className="border-b-2 border-[#0a0a0a]/10 pb-1 pt-2">
          <div className="flex gap-4 overflow-x-auto">
            {rounds_summary.map((r) => {
              const isSelected = selectedRoundId === r.round_id;
              const qualLabel = r.qualification_status === 'qualified' ? 'LOLOS' : r.qualification_status === 'disqualified' ? 'TIDAK LOLOS' : 'PENDING';
              return (
                <button
                  key={r.round_id}
                  type="button"
                  onClick={() => handleSelectRound(r.round_id)}
                  className={`pb-3 px-2 flex items-center gap-2.5 transition-all cursor-pointer whitespace-nowrap border-b-4 font-extrabold text-sm ${
                    isSelected
                      ? 'border-[#0a0a0a] text-[#0a0a0a]'
                      : 'border-transparent text-[#6a6a6a] hover:text-[#0a0a0a]'
                  }`}
                >
                  <span>{r.round_name}</span>
                  
                  {/* Round Score & Status Pill Badge */}
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                      r.qualification_status === 'qualified'
                        ? 'bg-[#a4d4c5]/40 text-[#0f5236] border-[#0f5236]/20'
                        : r.qualification_status === 'disqualified'
                        ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/20'
                        : 'bg-[#ebe6d6] text-[#6a6a6a] border-[#0a0a0a]/10'
                    }`}
                  >
                    SKOR: {r.has_session ? r.score : '-'} • {qualLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Two-Column Grid Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ──── LEFT COLUMN (Profile Card & Round Analysis) ──── */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Card 1: Profile Card */}
            <div className="clay-card bg-white p-6 rounded-[28px] border-2 border-[#0a0a0a]/15 clay-shadow flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-20 h-20 rounded-2xl bg-[#b8a4ed] border-2 border-[#0a0a0a] text-white flex items-center justify-center font-black text-3xl mb-3 clay-shadow-sm">
                <span className="material-symbols-outlined text-4xl">person</span>
              </div>

              <h2 className="text-xl font-black text-[#0a0a0a] tracking-tight">
                {participant.full_name}
              </h2>
              <p className="text-xs font-bold text-[#6a6a6a] mb-5">
                ID Peserta #{participant.id.slice(0, 8)}
              </p>

              <div className="w-full border-t border-[#0a0a0a]/10 pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-black uppercase text-[#6a6a6a] tracking-wider">SEKOLAH</span>
                  <span className="font-bold text-[#0a0a0a] text-right">{participant.school_name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-black uppercase text-[#6a6a6a] tracking-wider">KELAS</span>
                  <span className="font-bold text-[#0a0a0a] text-right">{participant.grade}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-black uppercase text-[#6a6a6a] tracking-wider">KATEGORI</span>
                  <span className="font-extrabold text-[#0a0a0a] bg-[#f5f0e0] px-2.5 py-0.5 rounded-lg border border-[#0a0a0a]/10">
                    {participant.category.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-black uppercase text-[#6a6a6a] tracking-wider">EMAIL</span>
                  <span className="font-medium text-[#6a6a6a] text-right truncate max-w-[150px]" title={participant.email}>
                    {participant.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Round Analysis Card */}
            {activeRoundSummary && (
              <div className="clay-card bg-white p-6 rounded-[28px] border-2 border-[#0a0a0a]/15 clay-shadow space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#6a6a6a]">
                  ANALISIS {activeRoundSummary.round_name.toUpperCase()}
                </h3>

                {/* 2 Metric Boxes Side-by-Side */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#f8f3e9] p-4 rounded-2xl border border-[#0a0a0a]/10 text-center space-y-1">
                    <span className="text-[10px] font-black uppercase text-[#6a6a6a] tracking-wider block">SKOR</span>
                    <span className="text-2xl font-black text-[#0a0a0a]">
                      {activeRoundSummary.has_session ? activeRoundSummary.score : 0}
                    </span>
                  </div>

                  <div className="bg-[#f8f3e9] p-4 rounded-2xl border border-[#0a0a0a]/10 text-center space-y-1">
                    <span className="text-[10px] font-black uppercase text-[#6a6a6a] tracking-wider block">STATUS</span>
                    <span
                      className={`text-sm font-black uppercase block ${
                        activeRoundSummary.qualification_status === 'qualified'
                          ? 'text-[#0f5236]'
                          : activeRoundSummary.qualification_status === 'disqualified'
                          ? 'text-[#ba1a1a]'
                          : 'text-[#e8b94a]'
                      }`}
                    >
                      {activeRoundSummary.qualification_status === 'qualified'
                        ? 'LOLOS'
                        : activeRoundSummary.qualification_status === 'disqualified'
                        ? 'TIDAK LOLOS'
                        : 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Security Session Box with 3-Level Classification */}
                {(() => {
                  const switches = activeRoundSummary.tab_switches || 0;
                  const limit = activeRoundSummary.tab_switch_limit || 3;
                  const isForceEnded = activeRoundSummary.session_status === 'force_ended_tabswitch';
                  const isDanger = switches >= limit || isForceEnded || !activeRoundSummary.is_safe;
                  const isWarning = switches > 0 && !isDanger;

                  let bgStyle = 'bg-[#a4d4c5]/20 border-[#0f5236]/30 text-[#0f5236]';
                  let iconName = 'verified_user';
                  let title = 'Sesi Ujian Aman';
                  let description = 'Tidak ada pelanggaran keamanan yang terdeteksi pada babak ini (0x Pindah Tab).';

                  if (isDanger) {
                    bgStyle = 'bg-[#ffdad6]/40 border-[#ba1a1a]/40 text-[#ba1a1a]';
                    iconName = 'warning';
                    title = `Pelanggaran Berat (${switches}x Pindah Tab)`;
                    description = `Sesi dihentikan paksa karena peserta melanggar batas maksimal perpindahan tab (${switches}/${limit}x).`;
                  } else if (isWarning) {
                    bgStyle = 'bg-[#e8b94a]/20 border-[#e8b94a]/40 text-[#0a0a0a]';
                    iconName = 'error';
                    title = `Peringatan Keamanan (${switches}x Pindah Tab)`;
                    description = `Terdeteksi ${switches} kali perpindahan tab. Masih di bawah batas maksimal (${limit}x).`;
                  }

                  return (
                    <div className={`p-4 rounded-2xl border-2 text-center space-y-2 ${bgStyle}`}>
                      <div className="w-10 h-10 rounded-full bg-white border border-current flex items-center justify-center mx-auto shadow-2xs">
                        <span className="material-symbols-outlined text-xl">{iconName}</span>
                      </div>

                      <div>
                        <h4 className="font-black text-sm text-[#0a0a0a]">{title}</h4>
                        <p className="text-xs font-semibold text-[#6a6a6a] mt-1 leading-snug">
                          {description}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {activeRoundSummary.has_session && (
                  <button
                    type="button"
                    onClick={handleResetSession}
                    disabled={isResettingSession}
                    className="w-full mt-2 py-3 rounded-2xl border-2 border-[#ba1a1a]/30 bg-[#ffdad6]/20 text-[#ba1a1a] font-bold text-sm flex items-center justify-center gap-2 clay-shadow-sm hover:bg-[#ffdad6]/50 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {isResettingSession ? 'hourglass_empty' : 'restart_alt'}
                    </span>
                    {isResettingSession ? 'Mereset...' : 'Reset Sesi Kuis'}
                  </button>
                )}
              </div>
            )}

          </div>

          {/* ──── RIGHT COLUMN (Submission Breakdown) ──── */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="clay-card bg-[#f8f3e9] p-6 rounded-[28px] border-2 border-[#0a0a0a]/15 clay-shadow space-y-4">
              
              {/* Header & Mini Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0a0a0a]/10 pb-3">
                <h3 className="text-xs font-black uppercase text-[#6a6a6a] tracking-wider">
                  RINCIAN SUBMISSION SOAL ({activeRoundSummary?.round_name})
                </h3>

                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#0a0a0a]/10 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setQuestionFilter('all')}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      questionFilter === 'all' ? 'bg-[#0a0a0a] text-white' : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                    }`}
                  >
                    Semua ({submission_breakdown.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionFilter('correct')}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      questionFilter === 'correct' ? 'bg-[#0f5236] text-white' : 'text-[#0f5236]'
                    }`}
                  >
                    Benar ({correctCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionFilter('incorrect')}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      questionFilter === 'incorrect' ? 'bg-[#ba1a1a] text-white' : 'text-[#ba1a1a]'
                    }`}
                  >
                    Salah ({incorrectCount})
                  </button>
                </div>
              </div>

              {/* Questions List */}
              {filteredQuestions.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl text-center space-y-2 border border-[#0a0a0a]/10">
                  <span className="material-symbols-outlined text-4xl text-[#6a6a6a]">
                    {activeRoundSummary && !activeRoundSummary.has_session ? 'hourglass_empty' : 'quiz'}
                  </span>
                  <p className="font-bold text-sm text-[#0a0a0a]">
                    {activeRoundSummary && !activeRoundSummary.has_session
                      ? 'Peserta belum memulai / belum mengerjakan sesi kuis pada babak ini.'
                      : 'Tidak ada soal untuk filter ini.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQuestions.map((q) => {
                    const isExpanded = expandedQuestionId === q.question_id;
                    const optionsObj: Record<string, string> = Array.isArray(q.options)
                      ? q.options.reduce((acc, cur) => ({ ...acc, [cur.key]: cur.text }), {})
                      : (q.options as Record<string, string>);

                    return (
                      <div
                        key={q.question_id || q.number}
                        className="bg-white rounded-2xl border-2 border-[#0a0a0a]/10 clay-shadow-sm overflow-hidden transition-all"
                      >
                        {/* Question Card Summary Row */}
                        <div
                          onClick={() => setExpandedQuestionId(isExpanded ? null : q.question_id)}
                          className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#fffaf0] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {/* Number Circle Badge */}
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0 border ${
                                q.status === 'correct'
                                  ? 'bg-[#a4d4c5] text-[#0f5236] border-[#0f5236]/30'
                                  : q.status === 'incorrect'
                                  ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/30'
                                  : 'bg-[#ebe6d6] text-[#6a6a6a] border-[#0a0a0a]/10'
                              }`}
                            >
                              {q.number}
                            </div>

                            <div>
                              <div className="font-black text-sm text-[#0a0a0a] line-clamp-1">
                                Soal #{q.number}
                              </div>
                              <div className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 mt-0.5">
                                {q.status === 'correct' ? (
                                  <span className="text-[#0f5236]">BENAR • 10 POIN</span>
                                ) : q.status === 'incorrect' ? (
                                  <span className="text-[#ba1a1a]">SALAH • 0 POIN</span>
                                ) : (
                                  <span className="text-[#6a6a6a]">TIDAK DIJAWAB • 0 POIN</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {q.status === 'correct' ? (
                              <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
                            ) : q.status === 'incorrect' ? (
                              <span className="material-symbols-outlined text-red-600 text-xl">cancel</span>
                            ) : (
                              <span className="material-symbols-outlined text-gray-400 text-xl">remove_circle</span>
                            )}
                            <span className="material-symbols-outlined text-base text-[#6a6a6a]">
                              {isExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                          </div>
                        </div>

                        {/* Expanded Question Details */}
                        {isExpanded && (
                          <div className="p-5 border-t border-[#0a0a0a]/10 bg-[#fffaf0]/50 space-y-4">
                            <div className="text-sm font-semibold text-[#0a0a0a]">
                              <MathText text={q.question_text} />
                            </div>

                            {q.image_url && (
                              <div className="max-w-md rounded-xl overflow-hidden border border-[#0a0a0a]/10">
                                <img src={q.image_url} alt={`Soal ${q.number}`} className="w-full object-contain max-h-56" />
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                              {['A', 'B', 'C', 'D'].map((key) => {
                                const optText = optionsObj[key] || '';
                                const isStudentChoice = q.submitted_answer?.toUpperCase() === key;
                                const isCorrectKey = q.correct_answer.toUpperCase() === key;

                                let style = 'bg-white border-[#0a0a0a]/15 text-[#0a0a0a]';
                                if (isStudentChoice && isCorrectKey) {
                                  style = 'bg-[#a4d4c5] border-[#0f5236] font-bold text-[#0f5236]';
                                } else if (isStudentChoice && !isCorrectKey) {
                                  style = 'bg-[#ffdad6] border-[#ba1a1a] font-bold text-[#ba1a1a]';
                                } else if (isCorrectKey) {
                                  style = 'bg-white border-2 border-[#0f5236] font-bold text-[#0f5236]';
                                }

                                return (
                                  <div key={key} className={`p-3 rounded-xl border flex items-start gap-2 text-xs ${style}`}>
                                    <span className="font-black shrink-0">{key}.</span>
                                    <div className="flex-1">
                                      <MathText text={optText} />
                                    </div>
                                    {isStudentChoice && (
                                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#0a0a0a] text-white shrink-0">
                                        Jawaban Peserta
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* ── Bottom Sticky Action Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#0a0a0a]/15 p-4 z-40 clay-shadow">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Left Info Text */}
          <div className="flex items-center gap-2 text-xs text-[#6a6a6a] font-semibold">
            <span className="material-symbols-outlined text-base text-[#e8b94a]">info</span>
            <span>Pastikan semua skor telah diverifikasi sebelum menyimpan keputusan kelulusan.</span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => handleUpdateQualificationStatus('qualified')}
              className="flex-1 sm:flex-initial bg-[#a4d4c5] hover:bg-[#8cc4b3] text-[#0f5236] border border-[#0f5236]/30 font-black px-5 py-2.5 rounded-xl text-xs clay-shadow-sm clay-button-active transition-all cursor-pointer"
            >
              Loloskan Peserta
            </button>
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => handleUpdateQualificationStatus('disqualified')}
              className="flex-1 sm:flex-initial bg-[#ffdad6] hover:bg-[#f7c2bd] text-[#ba1a1a] border border-[#ba1a1a]/30 font-black px-5 py-2.5 rounded-xl text-xs clay-shadow-sm clay-button-active transition-all cursor-pointer"
            >
              Gugurkan Peserta
            </button>
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => handleUpdateQualificationStatus('qualified')}
              className="flex-1 sm:flex-initial bg-[#0a0a0a] hover:bg-[#0a0a0a]/90 text-white font-black px-6 py-2.5 rounded-xl text-xs clay-shadow clay-button-active transition-all cursor-pointer disabled:opacity-50"
            >
              {isUpdatingStatus ? 'Menyimpan...' : 'Simpan Keputusan Kelulusan'}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
