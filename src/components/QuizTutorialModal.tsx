import React, { useState } from 'react';

interface QuizTutorialModalProps {
  isOpen: boolean;
  onComplete: () => void;
  activeRoundTitle?: string;
  durationMinutes?: number;
  maxSwitches?: number;
}

export const QuizTutorialModal: React.FC<QuizTutorialModalProps> = ({
  isOpen,
  onComplete,
  activeRoundTitle = 'Babak Penyisihan 1 (SD)',
  durationMinutes = 60,
  maxSwitches = 3,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Selamat Datang di Panduan Ujian',
      subtitle: 'LANGKAH 1 DARI 5 • PETUNJUK UMUM',
      badgeBg: 'bg-[#a4d4c5]', // Mint
      textColor: 'text-[#0a0a0a]',
      icon: 'school',
      content: (
        <div className="space-y-4 text-[#3a3a3a] text-xs sm:text-sm leading-relaxed">
          <p>
            Sebelum Anda mulai mengerjakan soal kuis pada <strong className="text-[#0a0a0a]">{activeRoundTitle}</strong>, silakan ikuti petunjuk singkat ini untuk memahami alur dan fitur pada layar ujian.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-[#fffaf0] p-3 rounded-2xl border-2 border-[#0a0a0a]/15 clay-shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#e8b94a] flex items-center justify-center border border-[#0a0a0a]/20 shrink-0">
                <span className="material-symbols-outlined text-lg text-[#0a0a0a]">timer</span>
              </div>
              <div>
                <div className="text-[10px] uppercase font-black text-[#6a6a6a]">Durasi Waktu</div>
                <div className="text-sm font-extrabold text-[#0a0a0a]">{durationMinutes} Menit</div>
              </div>
            </div>
            <div className="bg-[#fffaf0] p-3 rounded-2xl border-2 border-[#0a0a0a]/15 clay-shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#ffaf83] flex items-center justify-center border border-[#0a0a0a]/20 shrink-0">
                <span className="material-symbols-outlined text-lg text-[#0a0a0a]">shield</span>
              </div>
              <div>
                <div className="text-[10px] uppercase font-black text-[#6a6a6a]">Batas Tab Switch</div>
                <div className="text-sm font-extrabold text-[#0a0a0a]">Maks. {maxSwitches} Kali</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Navigasi Soal & Pilihan Jawaban',
      subtitle: 'LANGKAH 2 DARI 5 • INTERAKSI SOAL',
      badgeBg: 'bg-[#ffaf83]', // Peach
      textColor: 'text-[#0a0a0a]',
      icon: 'grid_view',
      content: (
        <div className="space-y-3.5 text-[#3a3a3a] text-xs sm:text-sm leading-relaxed">
          <p>
            Anda dapat berpindah nomor soal secara bebas melalui **Panel Nomor Soal** di sebelah kanan layar:
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-3 bg-[#fffaf0] p-2.5 rounded-xl border border-[#0a0a0a]/10">
              <span className="w-6 h-6 rounded-lg bg-[#a4d4c5] border border-[#0a0a0a]/30 text-[#0a0a0a] font-black flex items-center justify-center text-xs">
                1
              </span>
              <span>Nomor berwarna <strong>Mint</strong> menandakan soal yang sudah Anda jawab.</span>
            </div>
            <div className="flex items-center gap-3 bg-[#fffaf0] p-2.5 rounded-xl border border-[#0a0a0a]/10">
              <span className="w-6 h-6 rounded-lg bg-[#e8b94a] border border-[#0a0a0a]/30 text-[#0a0a0a] font-black flex items-center justify-center text-xs">
                2
              </span>
              <span>Nomor berwarna <strong>Kuning</strong> menandakan soal yang Anda tandai <strong>Ragu-ragu</strong>.</span>
            </div>
            <div className="flex items-center gap-3 bg-[#fffaf0] p-2.5 rounded-xl border border-[#0a0a0a]/10">
              <span className="w-6 h-6 rounded-lg bg-white border border-[#0a0a0a]/30 text-[#6a6a6a] font-black flex items-center justify-center text-xs">
                3
              </span>
              <span>Nomor berwarna <strong>Putih</strong> menandakan soal yang belum dikerjakan.</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Simpan Otomatis & Notasi Rumus',
      subtitle: 'LANGKAH 3 DARI 5 • FITUR SISTEM',
      badgeBg: 'bg-[#b8a4ed]', // Lavender
      textColor: 'text-[#0a0a0a]',
      icon: 'cloud_done',
      content: (
        <div className="space-y-3.5 text-[#3a3a3a] text-xs sm:text-sm leading-relaxed">
          <p>
            Setiap kali Anda mengklik opsi jawaban (A, B, C, atau D), jawaban Anda akan <strong>otomatis tersimpan ke server</strong> tanpa perlu menekan tombol simpan tambahan.
          </p>
          <div className="bg-[#fff3d6] border-2 border-[#0a0a0a]/15 rounded-2xl p-3.5 text-xs text-[#0a0a0a] space-y-1.5">
            <div className="font-extrabold flex items-center gap-1.5 text-[#0a0a0a]">
              <span className="material-symbols-outlined text-base text-[#e8b94a]">functions</span>
              <span>Notasi Matematika Presisi (KaTeX):</span>
            </div>
            <p className="text-[#3a3a3a] font-medium leading-relaxed">
              Seluruh rumus seperti pecahan, bentuk akar, eksponen, dan limit ditampilkan dengan jernih menggunakan standar notasi matematika olimpiade.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'PERINGATAN SANGAT PENTING ANTI-CHEAT!',
      subtitle: 'LANGKAH 4 DARI 5 • KEAMANAN KUIS',
      badgeBg: 'bg-[#ff6b5a]', // Coral Red
      textColor: 'text-white',
      icon: 'warning',
      content: (
        <div className="space-y-3.5 text-[#3a3a3a] text-xs sm:text-sm leading-relaxed">
          <div className="bg-[#ff6b5a]/10 border-2 border-[#ff6b5a] rounded-2xl p-3.5 space-y-2">
            <div className="font-black text-[#ff6b5a] flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-xl">gavel</span>
              <span>Sistem Mendeteksi Perpindahan Tab Secara Real-Time!</span>
            </div>
            <ul className="list-disc list-inside text-xs font-bold text-[#0a0a0a] space-y-1">
              <li>Setiap kali Anda menggeser tab, meminimalkan peramban, atau membuka aplikasi lain, sistem akan mencatat <strong>1x Pelanggaran</strong>.</li>
              <li>Jika pelanggaran mencapai <strong>{maxSwitches} Kali</strong>, sesi kuis akan <strong>OTOMATIS DIHENTIKAN PAKSA</strong> dan jawaban Anda langsung dikumpulkan ke server.</li>
              <li>Fungsi Klik Kanan (Context Menu), Copy, dan Paste dinonaktifkan selama ujian.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: 'Siap Memulai Ujian?',
      subtitle: 'LANGKAH 5 DARI 5 • KONFIRMASI MULAI',
      badgeBg: 'bg-[#a4d4c5]', // Mint
      textColor: 'text-[#0a0a0a]',
      icon: 'rocket_launch',
      content: (
        <div className="space-y-4 text-[#3a3a3a] text-xs sm:text-sm leading-relaxed text-center py-2">
          <div className="w-16 h-16 rounded-3xl bg-[#a4d4c5] border-2 border-[#0a0a0a] flex items-center justify-center mx-auto clay-shadow-sm">
            <span className="material-symbols-outlined text-3xl text-[#0a0a0a]">timer</span>
          </div>
          <div>
            <h4 className="text-base font-black text-[#0a0a0a]">
              Timer Hitung Mundur {durationMinutes} Menit Akan Dimulai
            </h4>
            <p className="text-xs text-[#6a6a6a] mt-1 font-medium max-w-xs mx-auto">
              Klik tombol di bawah ini untuk menutup petunjuk dan memulai penghitungan waktu kuis Anda. Semoga sukses!
            </p>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dimmed Clay Backdrop */}
      <div className="fixed inset-0 bg-[#0a0a0a]/70 backdrop-blur-xs animate-in fade-in duration-300" />

      {/* Main Clay Tutorial Card Container */}
      <div className="relative bg-[#fef9ef] max-w-lg w-full rounded-[32px] p-6 sm:p-8 border-2 border-[#0a0a0a] shadow-2xl z-10 space-y-6 animate-in zoom-in-95 duration-300">
        
        {/* Step Indicator Progress Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? 'flex-2 bg-[#0a0a0a]'
                    : idx < currentStep
                    ? 'flex-1 bg-[#a4d4c5] border border-[#0a0a0a]/30'
                    : 'flex-1 bg-[#0a0a0a]/15'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-black text-[#6a6a6a] uppercase tracking-wider pl-2">
            {currentStep + 1} / {steps.length}
          </span>
        </div>

        {/* Step Header */}
        <div className="flex items-start gap-4 pt-1">
          <div className={`w-12 h-12 rounded-2xl ${current.badgeBg} border-2 border-[#0a0a0a] flex items-center justify-center shrink-0 clay-shadow-sm`}>
            <span className={`material-symbols-outlined text-2xl ${current.textColor}`}>
              {current.icon}
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#a4d4c5]">
              {current.subtitle}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-[#0a0a0a] leading-tight">
              {current.title}
            </h3>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[140px] flex flex-col justify-center">
          {current.content}
        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#0a0a0a]/10">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`py-3 px-4 rounded-xl border-2 border-[#0a0a0a] font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1 ${
              currentStep === 0
                ? 'opacity-0 pointer-events-none'
                : 'bg-[#f2ede4] hover:bg-[#e7e2d8] text-[#0a0a0a] shadow-2xs'
            }`}
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Kembali</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className={`py-3.5 px-6 rounded-2xl border-2 border-[#0a0a0a] font-black text-xs transition-all cursor-pointer flex items-center gap-2 text-white clay-shadow-sm clay-button-active ${
              isLastStep ? 'bg-[#0a0a0a] hover:bg-[#0a0a0a]/90' : 'bg-[#0a0a0a] hover:bg-[#0a0a0a]/90'
            }`}
          >
            <span>{isLastStep ? 'Mulai Pengerjaan Kuis!' : 'Lanjut Tutorial'}</span>
            <span className="material-symbols-outlined text-base">
              {isLastStep ? 'play_arrow' : 'arrow_forward'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
