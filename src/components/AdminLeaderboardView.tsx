import React, { useState, useEffect, useRef } from 'react';
import { ScreenView, Participant } from '../types';
import { ASSET_IMAGES } from '../data/mockData';
import { apiService, RoundData } from '../services/api';

interface AdminLeaderboardViewProps {
  onNavigate: (screen: ScreenView) => void;
}

// ----------------------------------------------------------------------
// Animated Count-Up Number Component
// ----------------------------------------------------------------------
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 800 }) => {
  const [count, setCount] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = prevValueRef.current;
    const endValue = value;

    if (startValue === endValue) {
      setCount(endValue);
      return;
    }

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (endValue - startValue) * easeOut);
      setCount(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(endValue);
        prevValueRef.current = endValue;
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [value, duration]);

  return <>{count.toLocaleString()}</>;
};

// ----------------------------------------------------------------------
// Status Dropdown Component
// ----------------------------------------------------------------------
interface StatusDropdownProps {
  status: 'qualified' | 'disqualified' | 'pending';
  onChange: (newStatus: 'qualified' | 'disqualified' | 'pending') => void;
}

const STATUS_CONFIG = {
  qualified: {
    label: 'Lolos',
    sublabel: 'Kualifikasi babak berikutnya',
    icon: 'check_circle',
    badgeBg: 'bg-[#a4d4c5]/30 hover:bg-[#a4d4c5]/50',
    border: 'border-[#a4d4c5]',
    text: 'text-[#0f5236]',
    iconColor: 'text-[#0f5236]',
    dotBg: 'bg-[#0f5236]'
  },
  disqualified: {
    label: 'Tidak Lolos',
    sublabel: 'Dieliminasi / Pelanggaran tab',
    icon: 'cancel',
    badgeBg: 'bg-[#ffdad6]/50 hover:bg-[#ffdad6]/80',
    border: 'border-[#ba1a1a]/40',
    text: 'text-[#ba1a1a]',
    iconColor: 'text-[#ba1a1a]',
    dotBg: 'bg-[#ba1a1a]'
  },
  pending: {
    label: 'Belum Ditentukan',
    sublabel: 'Menunggu penilaian akhir',
    icon: 'schedule',
    badgeBg: 'bg-[#ebe6d6]/80 hover:bg-[#ebe6d6]',
    border: 'border-[#0a0a0a]/15',
    text: 'text-[#5a5a5a]',
    iconColor: 'text-[#6a6a6a]',
    dotBg: 'bg-[#6a6a6a]'
  }
};

const StatusDropdown: React.FC<StatusDropdownProps> = ({ status, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`px-3.5 py-1.5 rounded-full font-bold text-xs border flex items-center gap-2 cursor-pointer transition-all duration-200 shadow-xs hover:scale-[1.02] active:scale-[0.98] focus:outline-none ${currentConfig.badgeBg} ${currentConfig.border} ${currentConfig.text}`}
      >
        <span className={`material-symbols-outlined text-[16px] ${currentConfig.iconColor}`}>
          {currentConfig.icon}
        </span>
        <span>{currentConfig.label}</span>
        <span className="material-symbols-outlined text-[16px] ml-0.5 opacity-60">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-64 rounded-2xl bg-[#ffffff] border border-[#0a0a0a]/10 shadow-2xl overflow-hidden z-50">
          <div className="p-2 border-b border-[#f2ede4] bg-[#f8f3e9]/90">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6a6a6a] px-3 py-1 block">
              Ubah Status Kualifikasi
            </span>
          </div>
          <div className="p-1.5 space-y-1 bg-[#ffffff]">
            {(['qualified', 'pending', 'disqualified'] as const).map((key) => {
              const option = STATUS_CONFIG[key];
              const isSelected = status === key;
              return (
                <button
                  key={key}
                  onClick={() => { onChange(key); setIsOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-3 transition-colors cursor-pointer ${isSelected ? 'bg-[#f8f3e9] border border-[#0a0a0a]/10 shadow-xs' : 'hover:bg-[#f8f3e9]/70'}`}
                >
                  <span className={`material-symbols-outlined text-[20px] mt-0.5 shrink-0 ${option.iconColor}`}>
                    {option.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-black ${option.text} flex items-center justify-between`}>
                      <span>{option.label}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[16px] text-[#0a0a0a]">check</span>
                      )}
                    </div>
                    <div className="text-[10px] font-medium text-[#6a6a6a] truncate mt-0.5">{option.sublabel}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// Round Selector Pill Card Component (Clay Style)
// ----------------------------------------------------------------------
interface RoundSelectorProps {
  rounds: RoundData[];
  selectedRoundId: string | null;
  onSelect: (roundId: string | null) => void;
  isLoading: boolean;
}

const ROUND_STATUS_STYLE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  aktif: { bg: 'bg-[#a4d4c5]/30', text: 'text-[#0f5236]', dot: 'bg-[#0f5236]', label: 'Aktif' },
  ditutup: { bg: 'bg-[#ffdad6]/40', text: 'text-[#ba1a1a]', dot: 'bg-[#ba1a1a]', label: 'Ditutup' },
  belum_dibuka: { bg: 'bg-[#ebe6d6]', text: 'text-[#6a6a6a]', dot: 'bg-[#9a9a9a]', label: 'Belum Dibuka' },
};

// Warna aksen per urutan babak (order_index) — gunakan outline karena tidak terpotong overflow
const ROUND_ACCENT: Record<number, { active: string; outline: string; icon: string }> = {
  1: { active: 'bg-[#ffb084] text-[#0a0a0a]', outline: 'outline-[#ffb084]', icon: 'looks_one' },
  2: { active: 'bg-[#b8a4ed] text-[#0a0a0a]', outline: 'outline-[#b8a4ed]', icon: 'looks_two' },
  3: { active: 'bg-[#e8b94a] text-[#0a0a0a]', outline: 'outline-[#e8b94a]', icon: 'looks_3' },
};
const DEFAULT_ACCENT = { active: 'bg-[#ebe6d6] text-[#0a0a0a]', outline: 'outline-[#ebe6d6]', icon: 'radio_button_checked' };

const RoundSelector: React.FC<RoundSelectorProps> = ({ rounds, selectedRoundId, onSelect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[72px] w-44 rounded-2xl bg-[#ebe6d6] animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  if (rounds.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#6a6a6a] font-medium py-2">
        <span className="material-symbols-outlined text-[18px]">info</span>
        Belum ada babak untuk kategori ini.
      </div>
    );
  }

  return (
    // px-1 py-3 -mx-1 -my-3 memberi ruang bagi outline/ring tanpa terpotong overflow
    <div className="flex gap-2 overflow-x-auto px-1 py-3 -mx-1 -my-3">
      {/* Pill: Semua Babak */}
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 h-[72px] px-4 rounded-2xl border-2 flex flex-col justify-center gap-1 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${selectedRoundId === null
          ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-md outline outline-2 outline-offset-2 outline-[#0a0a0a]/40'
          : 'bg-[#ffffff] border-[#e5e5e5] text-[#0a0a0a] hover:border-[#0a0a0a]/30 hover:bg-[#f8f3e9]'
          }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px]">layers</span>
          <span className="font-black text-xs whitespace-nowrap">Semua Babak</span>
        </div>
        <span className={`text-[10px] font-semibold whitespace-nowrap ${selectedRoundId === null ? 'text-white/70' : 'text-[#6a6a6a]'}`}>
          Sesi quiz terbaru
        </span>
      </button>

      {/* Pill per babak */}
      {rounds.map((round) => {
        const isSelected = selectedRoundId === round.id;
        const accent = ROUND_ACCENT[round.order_index] ?? DEFAULT_ACCENT;
        const statusStyle = ROUND_STATUS_STYLE[round.status] ?? ROUND_STATUS_STYLE.belum_dibuka;

        return (
          <button
            key={round.id}
            onClick={() => onSelect(round.id)}
            className={`shrink-0 h-[72px] px-4 rounded-2xl border-2 flex flex-col justify-center gap-1 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${isSelected
              ? `${accent.active} border-transparent shadow-md outline outline-2 outline-offset-2 ${accent.outline}`
              : 'bg-[#ffffff] border-[#e5e5e5] text-[#0a0a0a] hover:border-[#0a0a0a]/30 hover:bg-[#f8f3e9]'
              }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">{accent.icon}</span>
              <span className="font-black text-xs whitespace-nowrap max-w-[130px] truncate">{round.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-current opacity-60' : statusStyle.dot}`} />
              <span className={`text-[10px] font-semibold whitespace-nowrap ${isSelected ? 'opacity-70' : statusStyle.text}`}>
                {statusStyle.label}
              </span>
              <span className={`text-[10px] font-medium whitespace-nowrap ml-1 ${isSelected ? 'opacity-50' : 'text-[#9a9a9a]'}`}>
                · {round.mode === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};



// ----------------------------------------------------------------------
// Skeleton Loading Row
// ----------------------------------------------------------------------
const TableSkeletonRow: React.FC<{ index: number }> = ({ index }) => (
  <tr className="animate-pulse border-b border-[#f2ede4]">
    <td className="px-6 py-4">
      <div className="h-6 w-8 bg-[#ebe6d6] rounded-lg" style={{ animationDelay: `${index * 80}ms` }} />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-40 bg-[#ebe6d6] rounded-md mb-2" style={{ animationDelay: `${index * 80 + 40}ms` }} />
      <div className="h-3 w-24 bg-[#f2ede4] rounded-md" style={{ animationDelay: `${index * 80 + 60}ms` }} />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-48 bg-[#ebe6d6] rounded-md" style={{ animationDelay: `${index * 80 + 80}ms` }} />
    </td>
    <td className="px-6 py-4">
      <div className="h-5 w-16 bg-[#ebe6d6] rounded-md" style={{ animationDelay: `${index * 80 + 100}ms` }} />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-12 bg-[#ebe6d6] rounded-md" style={{ animationDelay: `${index * 80 + 120}ms` }} />
    </td>
    <td className="px-6 py-4 text-right">
      <div className="h-8 w-32 bg-[#ebe6d6] rounded-full ml-auto" style={{ animationDelay: `${index * 80 + 140}ms` }} />
    </td>
  </tr>
);

interface AdminLeaderboardViewProps {
  onNavigate: (screen: ScreenView) => void;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning', title?: string) => void;
}

// ----------------------------------------------------------------------
// Smooth Floating Sparkle Star Icon
// ----------------------------------------------------------------------
const SparkleStarIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5 text-white shrink-0 overflow-visible"
  >
    {/* Center Main Star */}
    <path
      d="M12 2L14.1 8.6L20.5 10.7L14.1 12.8L12 19.4L9.9 12.8L3.5 10.7L9.9 8.6L12 2Z"
      className="animate-main-star fill-white"
    />
    {/* Small Star 1 (Top-Right) */}
    <path
      d="M18.5 2.5L19.2 4.8L21.5 5.5L19.2 6.2L18.5 8.5L17.8 6.2L15.5 5.5L17.8 4.8L18.5 2.5Z"
      className="animate-star-float-1 fill-[#ffaf83]"
    />
    {/* Small Star 2 (Bottom-Left) */}
    <path
      d="M5.5 15.5L6.1 17.3L7.9 17.9L6.1 18.5L5.5 20.3L4.9 18.5L3.1 17.9L4.9 17.3L5.5 15.5Z"
      className="animate-star-float-2 fill-[#a4d4c5]"
    />
    {/* Small Star 3 (Top-Left) */}
    <path
      d="M4.5 3.5L5 4.8L6.3 5.3L5 5.8L4.5 7.1L4 5.8L2.7 5.3L4 4.8L4.5 3.5Z"
      className="animate-star-float-3 fill-[#b8a4ed]"
    />
  </svg>
);

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
export const AdminLeaderboardView: React.FC<AdminLeaderboardViewProps> = ({ onNavigate, onShowToast }) => {
  const [selectedCategory, setSelectedCategory] = useState<'SD' | 'SMP' | 'SMA'>('SD');
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [isRoundsLoading, setIsRoundsLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch rounds whenever category changes
  const fetchRounds = async (cat: string) => {
    setIsRoundsLoading(true);
    try {
      const data = await apiService.getRounds(cat.toLowerCase());
      setRounds(data);
      // Reset round selection when switching category
      setSelectedRoundId(null);
    } catch (err) {
      console.error('Failed to fetch rounds:', err);
      setRounds([]);
    } finally {
      setIsRoundsLoading(false);
    }
  };

  // Fetch leaderboard data dengan minimum delay konstan agar skeleton terasa realistis
  const fetchLeaderboard = async () => {
    setIsLoading(true);
    const minDelay = new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const [data] = await Promise.all([
        apiService.getLeaderboard(selectedCategory.toLowerCase(), selectedRoundId ?? undefined),
        minDelay
      ]);
      setParticipants(data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRounds(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    fetchLeaderboard();
    setCurrentPage(1);
  }, [selectedCategory, selectedRoundId]);

  // Active round object (for context banner)
  const activeRound = selectedRoundId ? rounds.find((r) => r.id === selectedRoundId) ?? null : null;

  // Auto qualify top 10 handler
  const handleAutoQualify = async () => {
    const updated = participants.map((p) => ({
      ...p,
      status: (p.rank <= 10 && p.tabSwitches < 3 ? 'qualified' : 'disqualified') as 'qualified' | 'disqualified' | 'pending'
    }));
    setParticipants(updated);
    onShowToast?.('Top 10 peserta berhasil diloloskan secara otomatis ke babak berikutnya!', 'success', 'Kualifikasi Otomatis');
    try {
      await Promise.all(
        updated.map((p) => apiService.updateQualification(p.id, p.status, selectedCategory.toLowerCase()))
      );
    } catch (err) {
      console.error('Failed to persist auto-qualification:', err);
    }
  };

  const handleExportCSV = () => {
    const roundLabel = activeRound ? activeRound.name : 'Semua Babak';
    const csvRows = [
      ['Peringkat', 'Nama', 'Sekolah', 'Babak', 'Skor', 'PindahTab', 'Status'],
      ...participants.map((p) => [p.rank, p.name, p.school, roundLabel, p.score, p.tabSwitches, p.status])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Leaderboard_${selectedCategory}_${roundLabel.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast?.('Laporan data klasemen berhasil diekspor ke berkas CSV!', 'info', 'Ekspor Berkas');
  };

  const setParticipantStatus = async (id: string, status: 'qualified' | 'disqualified' | 'pending') => {
    const targetP = participants.find((p) => p.id === id);
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
    const statusLabel = status === 'qualified' ? 'Lolos' : status === 'disqualified' ? 'Tidak Lolos' : 'Pending';
    onShowToast?.(`Status kualifikasi ${targetP?.name || 'peserta'} diubah menjadi "${statusLabel}"!`, 'success', 'Klasemen Diperbarui');
    try {
      await apiService.updateQualification(id, status, selectedCategory.toLowerCase());
    } catch (err) {
      console.error('Failed to update qualification in database:', err);
      fetchLeaderboard();
    }
  };

  const filteredParticipants = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.school.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const qualifiedCount = participants.filter((p) => p.status === 'qualified').length;
  const highTabCount = participants.filter((p) => p.tabSwitches >= 3).length;

  // Category pill accent — gunakan outline untuk menghindari clipping dari parent container
  const CATEGORY_STYLE: Record<string, { active: string; inactive: string }> = {
    SD: { active: 'bg-[#ffb084] text-[#0a0a0a] outline outline-2 outline-offset-2 outline-[#ffb084]/70 shadow-xs', inactive: 'bg-[#ebe6d6] text-[#6a6a6a] hover:bg-[#ffb084]/40 hover:text-[#0a0a0a]' },
    SMP: { active: 'bg-[#b8a4ed] text-[#0a0a0a] outline outline-2 outline-offset-2 outline-[#b8a4ed]/70 shadow-xs', inactive: 'bg-[#ebe6d6] text-[#6a6a6a] hover:bg-[#b8a4ed]/40 hover:text-[#0a0a0a]' },
    SMA: { active: 'bg-[#e8b94a] text-[#0a0a0a] outline outline-2 outline-offset-2 outline-[#e8b94a]/70 shadow-xs', inactive: 'bg-[#ebe6d6] text-[#6a6a6a] hover:bg-[#e8b94a]/40 hover:text-[#0a0a0a]' },
  };

  return (
    <div className="w-full bg-[#fef9ef] min-h-screen pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header Section ── */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0a0a0a] leading-tight">
              Kualifikasi &amp; Klasemen
            </h1>
            <p className="text-sm text-[#6a6a6a] font-medium">
              Pilih kategori dan babak di bawah untuk melihat skor yang spesifik.
            </p>
          </div>
          <div className="relative hidden lg:block shrink-0">
            <div className="w-28 h-28 transform rotate-6 hover:rotate-12 transition-transform">
              <img src={ASSET_IMAGES.blueBlob} alt="Blue Blob Mascot" className="w-full h-full object-contain drop-shadow-md" />
            </div>
          </div>
        </header>

        {/* ── Filter Section: Kategori + Babak ── */}
        <section className="bg-[#ffffff] rounded-[24px] border-2 border-[#0a0a0a]/10 clay-shadow p-5 sm:p-6 space-y-4">
          {/* Row 1: Kategori */}
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#9a9a9a] mb-2.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">school</span>
              Jenjang Peserta
            </div>
            {/* px-1 py-2 -mx-1 -my-2: beri ruang agar outline tidak terpotong parent */}
            <div className="flex gap-2 flex-wrap px-1 py-2 -mx-1 -my-2">
              {(['SD', 'SMP', 'SMA'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-1.5 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer ${selectedCategory === cat ? CATEGORY_STYLE[cat].active : CATEGORY_STYLE[cat].inactive
                    }`}
                >
                  {cat === 'SD' ? 'SD / MI' : cat === 'SMP' ? 'SMP / MTs' : 'SMA / SMK / MA'}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#f2ede4]" />

          {/* Row 2: Babak */}
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#9a9a9a] mb-2.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">emoji_events</span>
              Babak Quiz
              {selectedRoundId && (
                <span className="ml-auto text-[10px] font-semibold text-[#6a6a6a] normal-case tracking-normal">
                  Klik babak lain atau "Semua Babak" untuk ganti
                </span>
              )}
            </div>
            <RoundSelector
              rounds={rounds}
              selectedRoundId={selectedRoundId}
              onSelect={setSelectedRoundId}
              isLoading={isRoundsLoading}
            />
          </div>
        </section>


        {/* ── Stats Grid ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="clay-card bg-[#ffb084] p-6 sm:p-8 rounded-[24px] flex flex-col justify-between h-44 border-2 border-[#0a0a0a]/10 clay-shadow transition-transform hover:-translate-y-1">
            <span className="text-xs font-extrabold text-[#0a0a0a]/75 uppercase tracking-wider">
              Total Peserta ({selectedCategory})
            </span>
            <div className="flex items-end justify-between">
              <span className="text-5xl font-black text-[#0a0a0a] tabular-nums tracking-tight">
                {isLoading ? <span className="opacity-40 animate-pulse">...</span> : <AnimatedCounter value={participants.length} />}
              </span>
              <span className="material-symbols-outlined text-4xl text-[#0a0a0a]/25">groups</span>
            </div>
          </div>

          <div className="clay-card bg-[#1a3a3a] p-6 sm:p-8 rounded-[24px] flex flex-col justify-between h-44 border-2 border-[#0a0a0a]/20 clay-shadow text-white transition-transform hover:-translate-y-1">
            <span className="text-xs font-extrabold text-white/75 uppercase tracking-wider">
              Lolos ke Babak Berikutnya
            </span>
            <div className="flex items-end justify-between">
              <span className="text-5xl font-black text-white tabular-nums tracking-tight">
                {isLoading ? <span className="opacity-40 animate-pulse">...</span> : <AnimatedCounter value={qualifiedCount} />}
              </span>
              <span className="material-symbols-outlined text-4xl text-white/25">verified_user</span>
            </div>
          </div>

          <div className="clay-card bg-[#ff4d8b] p-6 sm:p-8 rounded-[24px] flex flex-col justify-between h-44 border-2 border-[#0a0a0a]/20 clay-shadow text-white transition-transform hover:-translate-y-1">
            <span className="text-xs font-extrabold text-white/75 uppercase tracking-wider">
              Dihentikan Paksa (Pindah Tab &ge; 3)
            </span>
            <div className="flex items-end justify-between">
              <span className="text-5xl font-black text-white tabular-nums tracking-tight">
                {isLoading ? <span className="opacity-40 animate-pulse">...</span> : <AnimatedCounter value={highTabCount} />}
              </span>
              <span className="material-symbols-outlined text-4xl text-white/25">warning</span>
            </div>
          </div>
        </section>

        {/* ── Action Bar ── */}
        <section className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={handleAutoQualify}
              disabled={isLoading || participants.length === 0}
              className="h-11 px-6 rounded-xl bg-[#0a0a0a] text-white flex items-center justify-center gap-2 font-bold text-xs sm:text-sm hover:bg-[#1f1f1f] clay-shadow-sm clay-button-active transition-all cursor-pointer disabled:opacity-50 group border border-[#0a0a0a]"
            >
              <SparkleStarIcon />
              <span>Loloskan Top 10 Otomatis</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={isLoading || participants.length === 0}
              className="h-11 px-6 rounded-xl bg-[#fef9ef] border border-[#0a0a0a]/15 text-[#0a0a0a] flex items-center justify-center gap-2 font-bold text-xs sm:text-sm hover:bg-[#ebe6d6] clay-shadow-sm clay-button-active transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">description</span>
              <span>Ekspor Laporan CSV</span>
            </button>

            <button
              onClick={fetchLeaderboard}
              disabled={isLoading}
              className="h-11 px-4 rounded-xl bg-[#ebe6d6] border border-[#0a0a0a]/10 text-[#0a0a0a] flex items-center justify-center gap-2 font-bold text-xs sm:text-sm hover:bg-[#dedad0] clay-shadow-sm clay-button-active transition-all cursor-pointer disabled:opacity-50"
              title="Refresh Data Peserta"
            >
              <span className={`material-symbols-outlined text-lg ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <div className="w-full sm:w-64 relative">
            <input
              type="text"
              placeholder="Cari peserta / sekolah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#ffffff] border-2 border-[#0a0a0a]/10 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/20 clay-shadow-sm"
            />
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6a6a6a] text-[18px]">search</span>
          </div>
        </section>

        {/* ── Main Leaderboard Table ── */}
        <section className="bg-[#ffffff] rounded-[28px] overflow-hidden border-2 border-[#0a0a0a]/10 clay-shadow relative">
          {/* Loading bar */}
          {isLoading && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#ebe6d6] overflow-hidden z-10">
              <div className="h-full bg-[#ffb084] animate-pulse w-full" />
            </div>
          )}

          {/* Table title bar */}
          <div className="px-6 py-4 border-b border-[#f2ede4] bg-[#f8f3e9] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-[#0a0a0a]/40">leaderboard</span>
              <div>
                <span className="font-black text-sm text-[#0a0a0a]">
                  {activeRound ? activeRound.name : 'Semua Babak'}
                </span>
                <span className="text-[11px] text-[#6a6a6a] font-medium ml-2">
                  · {selectedCategory}
                </span>
              </div>
            </div>
            {activeRound && (
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${ROUND_STATUS_STYLE[activeRound.status]?.bg ?? 'bg-[#ebe6d6]'} ${ROUND_STATUS_STYLE[activeRound.status]?.text ?? 'text-[#6a6a6a]'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${ROUND_STATUS_STYLE[activeRound.status]?.dot ?? 'bg-[#9a9a9a]'}`} />
                {ROUND_STATUS_STYLE[activeRound.status]?.label ?? '-'}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#f8f3e9] border-b border-[#f2ede4] text-[11px] font-extrabold text-[#6a6a6a] uppercase tracking-wider">
                  <th className="px-6 py-4">Peringkat</th>
                  <th className="px-6 py-4">Nama Peserta</th>
                  <th className="px-6 py-4">Sekolah</th>
                  <th className="px-6 py-4">Skor</th>
                  <th className="px-6 py-4">Pindah Tab</th>
                  <th className="px-6 py-4 text-right">Status Kualifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2ede4]">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => <TableSkeletonRow key={idx} index={idx} />)
                ) : filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-[#6a6a6a]">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-5xl text-[#6a6a6a]/30">search_off</span>
                        <span className="font-bold text-sm text-[#0a0a0a]">Tidak ada peserta ditemukan</span>
                        <span className="text-xs text-[#6a6a6a]">
                          {activeRound
                            ? `Belum ada peserta ${selectedCategory} yang mengikuti ${activeRound.name}.`
                            : 'Coba sesuaikan kata kunci pencarian atau ganti kategori.'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((p) => {
                    const isQualified = p.status === 'qualified';
                    const isHighTab = p.tabSwitches >= 3;
                    // Jika babak dipilih & peserta tidak punya sesi di babak itu
                    const hasNoSession = selectedRoundId !== null && p.has_session === false;

                    let rowBg = 'hover:bg-[#f8f3e9]/60 transition-colors';
                    if (hasNoSession) rowBg = 'opacity-50 bg-[#f8f3e9]/40';
                    else if (isQualified) rowBg = 'bg-[#a4d4c5]/10 hover:bg-[#a4d4c5]/20 transition-colors';
                    else if (isHighTab) rowBg = 'bg-[#ffdad6]/20 hover:bg-[#ffdad6]/30 transition-colors';

                    return (
                      <tr key={p.id} className={rowBg}>
                        <td className="px-6 py-4">
                          {hasNoSession ? (
                            <span className="font-medium px-2 text-[#9a9a9a]">—</span>
                          ) : isQualified ? (
                            <span className="bg-[#a4d4c5] text-[#0a0a0a] font-black px-2.5 py-1 rounded-lg text-xs shadow-xs">{p.rank}</span>
                          ) : (
                            <span className={`font-bold px-2 ${isHighTab ? 'text-[#ba1a1a]' : 'text-[#6a6a6a]'}`}>#{p.rank}</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-bold text-[#0a0a0a]">{p.name}</div>
                          {hasNoSession && (
                            <div className="text-[10px] font-semibold text-[#9a9a9a] mt-0.5 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">block</span>
                              Belum ikut babak ini
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-[#6a6a6a] font-medium">{p.school}</div>
                        </td>

                        <td className="px-6 py-4 font-black text-[#0a0a0a] tabular-nums">
                          {hasNoSession ? (
                            <span className="text-[#9a9a9a] font-medium">—</span>
                          ) : (
                            <>{p.score}/100</>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {hasNoSession ? (
                            <span className="text-[#9a9a9a] font-medium">—</span>
                          ) : (
                            <div className={`flex items-center gap-1 font-bold ${isHighTab ? 'text-[#ba1a1a]' : 'text-[#0a0a0a]'}`}>
                              <span>{p.tabSwitches}</span>
                              {isHighTab && (
                                <span className="material-symbols-outlined text-lg" title="Pindah tab melebihi batas">error</span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          {hasNoSession ? (
                            <span className="text-[11px] font-semibold text-[#9a9a9a] italic">Tidak ada data</span>
                          ) : (
                            <StatusDropdown
                              status={p.status}
                              onChange={(newStatus) => setParticipantStatus(p.id, newStatus)}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-[#f8f3e9] border-t border-[#f2ede4] flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs font-semibold text-[#6a6a6a]">
              {isLoading ? 'Memuat data...' : `Menampilkan ${filteredParticipants.length} dari ${participants.length} peserta · ${selectedCategory}${activeRound ? ` · ${activeRound.name}` : ''}`}
            </span>
            <div className="flex gap-1">
              <button
                disabled={currentPage === 1 || isLoading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded-lg hover:bg-[#ebe6d6] transition-colors disabled:opacity-40 cursor-pointer"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  disabled={isLoading}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === page ? 'bg-[#0a0a0a] text-white shadow-xs' : 'hover:bg-[#ebe6d6] text-[#0a0a0a]'}`}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={currentPage === 3 || isLoading}
                onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                className="p-1 rounded-lg hover:bg-[#ebe6d6] transition-colors disabled:opacity-40 cursor-pointer"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
