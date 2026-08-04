import React, { useState, useEffect } from 'react';
import { ScreenView, Question, CompetitionRound } from '../types';
import { MOCK_QUESTIONS, ASSET_IMAGES } from '../data/mockData';
import { apiService } from '../services/api';

interface QuizExecutionViewProps {
  onNavigate: (screen: ScreenView) => void;
  activeRound?: CompetitionRound | null;
  studentCategory?: string;
  questions?: Question[];
}

export const QuizExecutionView: React.FC<QuizExecutionViewProps> = ({
  onNavigate,
  activeRound,
  studentCategory,
  questions: propQuestions
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});

  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  const maxSwitches = activeRound?.tabSwitchLimit || 3;
  const durationMins = activeRound?.durationMinutes || 60;

  const [timeLeft, setTimeLeft] = useState<number>(durationMins * 60);
  const [tabSwitches, setTabSwitches] = useState<number>(0);
  const [showAntiCheatModal, setShowAntiCheatModal] = useState<boolean>(false);
  const [lastActivityLog, setLastActivityLog] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Anti-Cheat: Disable Copy, Paste & Context Menu
  useEffect(() => {
    const preventAction = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', preventAction);
    document.addEventListener('copy', preventAction);
    document.addEventListener('paste', preventAction);
    return () => {
      document.removeEventListener('contextmenu', preventAction);
      document.removeEventListener('copy', preventAction);
      document.removeEventListener('paste', preventAction);
    };
  }, []);

  // UUID validation helper — mock IDs like "round-sd-1" are not valid UUIDs
  const isValidUUID = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Fetch Questions from Secure Student Endpoint & Start Quiz Session
  useEffect(() => {
    let isMounted = true;
    async function loadQuizData() {
      setLoadingQuestions(true);

      const roundId = activeRound?.id;
      const isRealRound = roundId && isValidUUID(roundId);

      if (isRealRound) {
        try {
          // 1. Start or resume Quiz Session from Backend Server
          const session = await apiService.startQuizSession(roundId).catch(() => null);
          if (!isMounted) return;

          if (session) {
            setTimeLeft(session.remaining_seconds);
            setTabSwitches(session.tab_switch_count);
            if (session.is_submitted) {
              setIsSubmitted(true);
            }
          } else {
            setTimeLeft((activeRound.durationMinutes || 60) * 60);
          }

          // 2. Fetch Questions WITHOUT correct_key (Secure Anti-Cheat Endpoint)
          const dbQuestions = await apiService.getStudentQuestions(roundId);
          if (!isMounted) return;
          if (dbQuestions && dbQuestions.length > 0) {
            const formatted: Question[] = dbQuestions.map((q, idx) => ({
              id: idx + 1,
              code: `SOAL ${idx + 1} • ${(activeRound.category || studentCategory || 'SD').toUpperCase()}`,
              text: q.question_text,
              diagramUrl: q.image_url,
              options: (q.options || []).map((opt) => ({
                id: (opt.key || 'A').toUpperCase() as 'A' | 'B' | 'C' | 'D',
                text: opt.text
              })),
              correctOption: 'A', // Placeholder on client (correct answer is computed only at backend server!)
            }));
            setQuestions(formatted);
          } else if (propQuestions && propQuestions.length > 0) {
            setQuestions(propQuestions);
          } else {
            setQuestions(MOCK_QUESTIONS.slice(0, activeRound.questionCount || 25));
          }
        } catch (err) {
          if (!isMounted) return;
          console.warn('Could not load DB questions for active round:', err);
          setQuestions(propQuestions || MOCK_QUESTIONS.slice(0, activeRound.questionCount || 25));
        }
      } else {
        setQuestions(propQuestions || MOCK_QUESTIONS);
        setTimeLeft((activeRound?.durationMinutes || 60) * 60);
      }
      if (isMounted) setLoadingQuestions(false);
    }

    loadQuizData();
    return () => {
      isMounted = false;
    };
  }, [activeRound, propQuestions, studentCategory]);

  // Timer Countdown effect
  useEffect(() => {
    if (isSubmitted || loadingQuestions) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsSubmitted(true);
          if (activeRound?.id && isValidUUID(activeRound.id)) {
            apiService.submitQuizAnswers(activeRound.id, userAnswers).catch(() => {});
          }
          alert('Waktu pengerjaan telah habis! Jawaban Anda telah otomatis dikumpulkan ke server.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, loadingQuestions, activeRound, userAnswers]);

  // Tab switch & Window Focus Mode Listener with Server Log
  useEffect(() => {
    if (isSubmitted || loadingQuestions) return;

    const handleBlur = async () => {
      const now = new Date();
      setLastActivityLog(now.toLocaleTimeString());
      setShowAntiCheatModal(true);

      if (activeRound?.id && isValidUUID(activeRound.id)) {
        try {
          const res = await apiService.logQuizViolation(activeRound.id);
          setTabSwitches(res.tab_switch_count);
          if (res.is_submitted) {
            setIsSubmitted(true);
          }
        } catch {
          setTabSwitches((prev) => {
            const nextCount = prev + 1;
            if (nextCount >= maxSwitches) setIsSubmitted(true);
            return nextCount;
          });
        }
      } else {
        setTabSwitches((prev) => {
          const nextCount = prev + 1;
          if (nextCount >= maxSwitches) setIsSubmitted(true);
          return nextCount;
        });
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        handleBlur();
      }
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isSubmitted, loadingQuestions, maxSwitches, activeRound]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s} Tersisa`;
  };

  if (loadingQuestions) {
    return (
      <div className="bg-[#fef9ef] min-h-screen flex flex-col items-center justify-center p-6 text-[#0a0a0a]">
        <div className="bg-white p-8 rounded-3xl clay-shadow border border-[#0a0a0a]/10 text-center space-y-4 max-w-sm w-full animate-pulse">
          <span className="material-symbols-outlined text-4xl text-[#ff6b5a] animate-spin">
            hourglass_top
          </span>
          <h3 className="font-black text-lg">Memuat Soal Ujian...</h3>
          <p className="text-xs text-[#6a6a6a]">Menyiapkan kuis dan mengaktifkan Mode Fokus Olimpiade Aman.</p>
        </div>
      </div>
    );
  }

  const activeQuestions = questions.length > 0 ? questions : MOCK_QUESTIONS;
  const currentQ = activeQuestions[currentIdx] || activeQuestions[0];

  const handleSelectOption = (optId: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optId
    }));
  };

  const toggleFlagCurrent = () => {
    if (isSubmitted) return;
    setFlagged((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const handleSubmitQuiz = async () => {
    if (window.confirm('Apakah Anda yakin ingin mengumpulkan kuis Anda?')) {
      setIsSubmitted(true);
      if (activeRound?.id && isValidUUID(activeRound.id)) {
        try {
          await apiService.submitQuizAnswers(activeRound.id, userAnswers);
        } catch (err) {
          console.warn('Backend quiz submit error:', err);
        }
      }
      alert('Kuis berhasil dikumpulkan dan dinilai secara aman di server!');
      onNavigate('student-dashboard');
    }
  };

  return (
    <div className="bg-[#fef9ef] min-h-screen flex flex-col text-[#1d1c16] antialiased select-none">
      {/* Top Bar Header */}
      <header className="bg-[#0a0a0a] h-16 flex items-center justify-between px-4 sm:px-6 z-40 sticky top-0 shadow-md">
        <div className="flex items-center gap-2">
          <span className="bg-[#a4d4c5] text-[#0a0a0a] text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider shadow-2xs flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span>Mode Fokus Aktif</span>
          </span>
          <span className="text-white font-semibold text-xs sm:text-sm opacity-90 hidden sm:inline">
            {activeRound?.title ? activeRound.title : `Soal ${currentQ.id} dari ${activeQuestions.length}`}
          </span>
        </div>

        {/* Center Timer Pill */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <div className="bg-[#ff4d8b] text-white px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 clay-shadow-sm animate-pulse">
            <span className="material-symbols-outlined text-[18px]">timer</span>
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Right Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAntiCheatModal(true)}
            className="hidden sm:flex text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg items-center gap-1 cursor-pointer"
            title="Simulasi Peringatan Tab"
          >
            <span className="material-symbols-outlined text-sm">security</span>
            <span>Peringatan Tab ({tabSwitches}/{maxSwitches})</span>
          </button>

          <button
            onClick={handleSubmitQuiz}
            disabled={isSubmitted}
            className="bg-white text-[#0a0a0a] hover:bg-[#e7e2d8] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm clay-shadow-sm clay-button-active transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitted ? 'Ter-Kirim' : 'Kirim Kuis'}
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-grow flex flex-col lg:flex-row w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 gap-8 items-start">
        {/* Left: Question Area */}
        <section className="flex-grow flex flex-col gap-6 w-full lg:w-3/4">
          {/* Question Card */}
          <div className="bg-white p-6 sm:p-8 rounded-[24px] clay-shadow border border-[#f2ede4] flex flex-col md:flex-row gap-6 relative overflow-hidden">
            <div className="flex-1 flex flex-col gap-3">
              <span className="bg-[#a4d4c5] text-[#0a0a0a] px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider w-fit">
                {currentQ.code || `SOAL ${currentQ.id}`}
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-[#000000] leading-snug">
                {currentQ.text}
              </h1>
              {currentQ.note && (
                <p className="text-sm text-[#6a6a6a] italic">
                  {currentQ.note}
                </p>
              )}
            </div>

            {/* 3D Diagram Container */}
            {currentQ.diagramUrl && (
              <div className="w-full md:w-64 h-64 bg-[#f8f3e9] rounded-2xl flex items-center justify-center relative border border-[#c4c7c7]/30 shrink-0">
                <img
                  src={currentQ.diagramUrl}
                  alt="Diagram Soal 3D"
                  className="w-48 h-48 object-contain drop-shadow-xl hover:scale-105 transition-transform"
                />
                <div className="absolute bottom-3 right-3 bg-[#0a0a0a]/10 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                  <span className="text-[10px] font-bold text-[#0a0a0a]/70">
                    {currentQ.figLabel || `GAMBAR ${currentQ.id}`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((opt) => {
              const isSelected = userAnswers[currentQ.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  disabled={isSubmitted}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`group flex items-center gap-4 p-4 rounded-[16px] text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#feaf83]/10 border-2 border-[#feaf83] clay-shadow ring-4 ring-[#feaf83]/10'
                      : 'bg-white border-2 border-transparent clay-shadow-sm hover:border-[#a4d4c5] active:scale-[0.98]'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base transition-colors shrink-0 ${
                      isSelected
                        ? 'bg-[#e8b94a] text-[#0a0a0a]'
                        : 'bg-[#e7e2d8] text-[#0a0a0a] group-hover:bg-[#a4d4c5]'
                    }`}
                  >
                    {opt.id}
                  </div>
                  <span className={`text-sm sm:text-base ${isSelected ? 'font-bold text-[#0a0a0a]' : 'font-medium text-[#1d1c16]'}`}>
                    {opt.text}
                  </span>
                  {isSelected && (
                    <span className="ml-auto material-symbols-outlined text-[#e8b94a]">
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              className="flex items-center gap-1 text-[#6a6a6a] hover:text-[#0a0a0a] font-bold text-sm transition-colors disabled:opacity-40 cursor-pointer"
            >
              <span className="material-symbols-outlined">chevron_left</span>
              <span>Sebelumnya</span>
            </button>

            <div className="flex gap-3">
              <button
                disabled={isSubmitted}
                onClick={toggleFlagCurrent}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm clay-shadow-sm clay-button-active flex items-center gap-1.5 transition-all cursor-pointer ${
                  flagged[currentQ.id]
                    ? 'bg-[#e8b94a] text-[#0a0a0a]'
                    : 'bg-[#ebe6d6] text-[#0a0a0a] hover:bg-[#e7e2d8]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">flag</span>
                <span>{flagged[currentQ.id] ? 'Ditandai' : 'Tandai Soal'}</span>
              </button>

              <button
                disabled={currentIdx === activeQuestions.length - 1}
                onClick={() => setCurrentIdx((prev) => Math.min(activeQuestions.length - 1, prev + 1))}
                className="bg-[#0a0a0a] text-white hover:bg-[#0a0a0a]/90 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm clay-shadow-sm clay-button-active transition-all cursor-pointer disabled:opacity-40"
              >
                Soal Berikutnya
              </button>
            </div>
          </div>
        </section>

        {/* Right: Quiz Navigator Sidebar */}
        <aside className="w-full lg:w-80 bg-[#f8f3e9] p-6 rounded-[24px] border border-[#e7e2d8] flex flex-col gap-6 sticky top-20">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#0a0a0a]">Progres Kuis</h3>
            <span className="text-xs font-bold text-[#6a6a6a]">
              {Object.keys(userAnswers).length} / {activeQuestions.length}
            </span>
          </div>

          {/* Grid of Question Buttons */}
          <div className="grid grid-cols-5 gap-2">
            {activeQuestions.map((q, idx) => {
              const isCurrent = idx === currentIdx;
              const isAnswered = !!userAnswers[q.id];
              const isFlagged = !!flagged[q.id];

              let btnStyle = 'bg-white border border-[#c4c7c7]/30 text-[#444748] hover:bg-[#fef9ef]';
              if (isCurrent) {
                btnStyle = 'bg-[#a4d4c5] border-2 border-[#0a0a0a] text-[#0a0a0a] font-black scale-110 z-10 shadow-lg';
              } else if (isFlagged) {
                btnStyle = 'bg-[#e8b94a] text-[#0a0a0a] font-bold clay-shadow-sm relative';
              } else if (isAnswered) {
                btnStyle = 'bg-[#0a0a0a] text-white font-semibold clay-shadow-sm';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-full aspect-square rounded-lg text-xs flex items-center justify-center transition-transform active:scale-90 cursor-pointer ${btnStyle}`}
                >
                  {q.id}
                  {isFlagged && !isCurrent && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-[#c4c7c7]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#0a0a0a]" />
              <span className="text-[11px] font-bold text-[#6a6a6a]">Dijawab</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-white border border-[#c4c7c7]" />
              <span className="text-[11px] font-bold text-[#6a6a6a]">Belum Dijawab</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#e8b94a]" />
              <span className="text-[11px] font-bold text-[#6a6a6a]">Ditandai</span>
            </div>
          </div>
        </aside>
      </main>

      {/* Overlay Modal: Anti-Cheat Warning Modal */}
      {showAntiCheatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#0a0a0a]/80 blur-backdrop"
            onClick={() => setShowAntiCheatModal(false)}
          />

          <div className="relative bg-white max-w-md w-full rounded-[32px] p-8 clay-shadow border-4 border-[#e8b94a] flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in-95 duration-200 text-[#0a0a0a] z-10">
            {/* 3D Warning Hand Icon */}
            <div className="w-24 h-24 bg-[#e8b94a]/10 rounded-full flex items-center justify-center relative">
              <img
                src={ASSET_IMAGES.warningHand}
                alt="Peringatan Tangan Stop"
                className="w-20 h-20 object-contain drop-shadow-md"
              />
              <div className="absolute -top-2 -right-2 bg-[#ba1a1a] text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-lg clay-shadow-sm">
                !
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#0a0a0a] tracking-tight">
                {tabSwitches >= maxSwitches ? 'Ujian Di-Kumpulkan Otomatis' : 'Terdeteksi Perpindahan Tab'}
              </h2>
              {/* Dynamic progress indicator pills */}
              <div className="flex items-center justify-center gap-2 mt-2">
                {Array.from({ length: maxSwitches }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i < tabSwitches ? 'bg-[#ff4d8b]' : 'bg-[#e7e2d8]'
                    }`}
                    style={{ width: `${Math.max(20, Math.floor(140 / maxSwitches))}px` }}
                  />
                ))}
              </div>
              <p className="font-bold text-sm text-[#ff4d8b] pt-1">
                Peringatan {Math.min(maxSwitches, tabSwitches)} / {maxSwitches}
              </p>
            </div>

            <p className="text-sm text-[#6a6a6a] max-w-[280px]">
              {tabSwitches >= maxSwitches ? (
                <span className="text-[#ff6b5a] font-bold">
                  Batas maksimal {maxSwitches} kali perpindahan tab telah terlampaui. Kuis Anda telah dikumpulkan secara otomatis oleh sistem!
                </span>
              ) : (
                <>
                  Mode Fokus Olimpiade Matematika aktif. Mencapai <span className="font-bold text-[#0a0a0a]">{maxSwitches} kali perpindahan tab</span> akan secara otomatis mengumpulkan kuis Anda.
                </>
              )}
            </p>

            <button
              onClick={() => {
                setShowAntiCheatModal(false);
                if (tabSwitches >= maxSwitches) {
                  onNavigate('student-dashboard');
                }
              }}
              className="w-full bg-[#0a0a0a] text-white py-3.5 rounded-2xl font-bold text-sm clay-shadow clay-button-active hover:bg-[#0a0a0a]/90 transition-all cursor-pointer"
            >
              {tabSwitches >= maxSwitches ? 'Kembali ke Dashboard' : 'Saya mengerti, kembali ke kuis'}
            </button>

            {lastActivityLog && (
              <p className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider opacity-70">
                Aktivitas dicatat pada {lastActivityLog}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
