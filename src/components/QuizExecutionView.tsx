import React, { useState, useEffect } from 'react';
import { ScreenView, Question } from '../types';
import { MOCK_QUESTIONS, ASSET_IMAGES } from '../data/mockData';

interface QuizExecutionViewProps {
  onNavigate: (screen: ScreenView) => void;
  questions?: Question[];
}

export const QuizExecutionView: React.FC<QuizExecutionViewProps> = ({
  onNavigate,
  questions = MOCK_QUESTIONS
}) => {
  const [currentIdx, setCurrentIdx] = useState(11); // Start at Q12 (index 11) matching the reference screenshot!
  const [userAnswers, setUserAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({
    1: 'A', 2: 'B', 3: 'C', 4: 'A', 5: 'D',
    6: 'B', 7: 'A', 8: 'C', 9: 'D', 10: 'A', 11: 'B',
    12: 'B' // Option B selected for Q12 as in reference screenshot
  });
  const [flagged, setFlagged] = useState<Record<number, boolean>>({
    13: true // Question 13 flagged as in reference screenshot
  });

  const [timeLeft, setTimeLeft] = useState(45 * 60 + 30); // 45:30
  const [tabSwitches, setTabSwitches] = useState(1); // Warning 1 / 3
  const [showAntiCheatModal, setShowAntiCheatModal] = useState(true); // Open initially for instant visual matching!
  const [lastActivityLog, setLastActivityLog] = useState('10:24:45 AM');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Timer Countdown effect
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  // Tab switch detection (window blur)
  useEffect(() => {
    const handleBlur = () => {
      if (isSubmitted) return;
      setTabSwitches((prev) => {
        const nextCount = prev + 1;
        const now = new Date();
        setLastActivityLog(now.toLocaleTimeString());
        setShowAntiCheatModal(true);
        if (nextCount >= 3) {
          setIsSubmitted(true);
        }
        return nextCount;
      });
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [isSubmitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s} Tersisa`;
  };

  const currentQ = questions[currentIdx] || questions[0];

  const handleSelectOption = (optId: 'A' | 'B' | 'C' | 'D') => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optId
    }));
  };

  const toggleFlagCurrent = () => {
    setFlagged((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const handleSubmitQuiz = () => {
    if (window.confirm('Apakah Anda yakin ingin mengumpulkan kuis Anda?')) {
      setIsSubmitted(true);
      alert('Kuis berhasil dikumpulkan!');
      onNavigate('student-dashboard');
    }
  };

  return (
    <div className="bg-[#fef9ef] min-h-screen flex flex-col text-[#1d1c16] antialiased select-none">
      {/* Top Bar Header */}
      <header className="bg-[#0a0a0a] h-16 flex items-center justify-between px-4 sm:px-6 z-40 sticky top-0 shadow-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('student-dashboard')}
            className="text-white/80 hover:text-white flex items-center gap-1 text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <span className="text-white font-semibold text-sm sm:text-base opacity-90">
            Soal {currentQ.id} dari {questions.length}
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
            className="hidden sm:flex text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg items-center gap-1"
            title="Simulasi Peringatan Tab"
          >
            <span className="material-symbols-outlined text-sm">security</span>
            <span>Peringatan Tab ({tabSwitches}/3)</span>
          </button>

          <button
            onClick={handleSubmitQuiz}
            className="bg-white text-[#0a0a0a] hover:bg-[#e7e2d8] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm clay-shadow-sm clay-button-active transition-all"
          >
            Kirim Kuis
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
                {currentQ.code}
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
                    {currentQ.figLabel || 'GAMBAR 12A'}
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
                  onClick={() => handleSelectOption(opt.id)}
                  className={`group flex items-center gap-4 p-4 rounded-[16px] text-left transition-all ${
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
              className="flex items-center gap-1 text-[#6a6a6a] hover:text-[#0a0a0a] font-bold text-sm transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined">chevron_left</span>
              <span>Sebelumnya</span>
            </button>

            <div className="flex gap-3">
              <button
                onClick={toggleFlagCurrent}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm clay-shadow-sm clay-button-active flex items-center gap-1.5 transition-all ${
                  flagged[currentQ.id]
                    ? 'bg-[#e8b94a] text-[#0a0a0a]'
                    : 'bg-[#ebe6d6] text-[#0a0a0a] hover:bg-[#e7e2d8]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">flag</span>
                <span>{flagged[currentQ.id] ? 'Ditandai' : 'Tandai Soal'}</span>
              </button>

              <button
                disabled={currentIdx === questions.length - 1}
                onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                className="bg-[#0a0a0a] text-white hover:bg-[#0a0a0a]/90 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm clay-shadow-sm clay-button-active transition-all"
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
              {Object.keys(userAnswers).length} / {questions.length}
            </span>
          </div>

          {/* Grid of Question Buttons */}
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
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
                  className={`w-full aspect-square rounded-lg text-xs flex items-center justify-center transition-transform active:scale-90 ${btnStyle}`}
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
                Terdeteksi Perpindahan Tab
              </h2>
              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className={`h-2 w-12 rounded-full ${tabSwitches >= 1 ? 'bg-[#ff4d8b]' : 'bg-[#e7e2d8]'}`} />
                <div className={`h-2 w-12 rounded-full ${tabSwitches >= 2 ? 'bg-[#ff4d8b]' : 'bg-[#e7e2d8]'}`} />
                <div className={`h-2 w-12 rounded-full ${tabSwitches >= 3 ? 'bg-[#ff4d8b]' : 'bg-[#e7e2d8]'}`} />
              </div>
              <p className="font-bold text-sm text-[#ff4d8b] pt-1">
                Peringatan {Math.min(3, tabSwitches)} / 3
              </p>
            </div>

            <p className="text-sm text-[#6a6a6a] max-w-[280px]">
              Mode Fokus Olimpiade Matematika aktif. Mencapai <span className="font-bold text-[#0a0a0a]">3 kali perpindahan tab</span> akan secara otomatis mengumpulkan kuis Anda.
            </p>

            <button
              onClick={() => setShowAntiCheatModal(false)}
              className="w-full bg-[#0a0a0a] text-white py-3.5 rounded-2xl font-bold text-sm clay-shadow clay-button-active hover:bg-[#0a0a0a]/90 transition-all"
            >
              Saya mengerti, kembali ke kuis
            </button>

            <p className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider opacity-70">
              Aktivitas dicatat pada {lastActivityLog}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
