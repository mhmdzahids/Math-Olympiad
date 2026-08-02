import React, { useState } from 'react';
import { ScreenView, Participant } from '../types';
import { INITIAL_PARTICIPANTS, ASSET_IMAGES } from '../data/mockData';

interface AdminLeaderboardViewProps {
  onNavigate: (screen: ScreenView) => void;
}

export const AdminLeaderboardView: React.FC<AdminLeaderboardViewProps> = ({
  onNavigate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'SD-SMP' | 'SMA'>('SD-SMP');
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto qualify top 20 handler
  const handleAutoQualify = () => {
    setParticipants((prev) =>
      prev.map((p) => ({
        ...p,
        status: p.rank <= 20 && p.tabSwitches < 3 ? 'qualified' : 'disqualified'
      }))
    );
    alert('20 Peserta teratas otomatis ditetapkan Lolos!');
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Peringkat', 'Nama', 'Sekolah', 'Skor', 'PindahTab', 'Status'],
      ...participants.map((p) => [p.rank, p.name, p.school, p.score, p.tabSwitches, p.status])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Penyisihan2_Leaderboard_${selectedCategory}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleParticipantStatus = (id: string) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status: p.status === 'qualified' ? 'disqualified' : 'qualified'
          };
        }
        return p;
      })
    );
  };

  const filteredParticipants = participants.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.school.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-[#fef9ef] min-h-screen pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0a0a0a] leading-tight">
              Kualifikasi & Klasemen - Penyisihan 2
            </h1>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory('SD-SMP')}
                className={`px-6 py-1.5 rounded-full font-bold text-xs sm:text-sm transition-all ${
                  selectedCategory === 'SD-SMP'
                    ? 'bg-[#a4d4c5] text-[#0a0a0a] ring-2 ring-[#a4d4c5] ring-offset-2'
                    : 'bg-[#ebe6d6] text-[#6a6a6a] hover:bg-[#b8a4ed] hover:text-[#0a0a0a]'
                }`}
              >
                SD-SMP
              </button>

              <button
                onClick={() => setSelectedCategory('SMA')}
                className={`px-6 py-1.5 rounded-full font-bold text-xs sm:text-sm transition-all ${
                  selectedCategory === 'SMA'
                    ? 'bg-[#a4d4c5] text-[#0a0a0a] ring-2 ring-[#a4d4c5] ring-offset-2'
                    : 'bg-[#ebe6d6] text-[#6a6a6a] hover:bg-[#b8a4ed] hover:text-[#0a0a0a]'
                }`}
              >
                SMA
              </button>
            </div>
          </div>

          {/* Clay Blue Blob Mascot Decoration */}
          <div className="relative hidden lg:block shrink-0">
            <div className="w-28 h-28 transform rotate-6">
              <img
                src={ASSET_IMAGES.blueBlob}
                alt="Blue Blob Mascot"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="clay-card bg-[#ffb084] p-6 sm:p-8 rounded-[24px] flex flex-col justify-between h-44 shadow-md">
            <span className="text-xs font-bold text-[#0a0a0a]/70 uppercase tracking-wider">
              Total Peserta
            </span>
            <div className="flex items-end justify-between">
              <span className="text-5xl font-black text-[#0a0a0a]">100</span>
              <span className="material-symbols-outlined text-4xl text-[#0a0a0a]/20">
                groups
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="clay-card bg-[#1a3a3a] p-6 sm:p-8 rounded-[24px] flex flex-col justify-between h-44 shadow-md text-white">
            <span className="text-xs font-bold text-white/70 uppercase tracking-wider">
              Lolos ke Babak Berikutnya
            </span>
            <div className="flex items-end justify-between">
              <span className="text-5xl font-black text-white">20</span>
              <span className="material-symbols-outlined text-4xl text-white/20">
                verified_user
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="clay-card bg-[#ff4d8b] p-6 sm:p-8 rounded-[24px] flex flex-col justify-between h-44 shadow-md text-white">
            <span className="text-xs font-bold text-white/70 uppercase tracking-wider">
              Dihentikan Paksa (Pindah Tab)
            </span>
            <div className="flex items-end justify-between">
              <span className="text-5xl font-black text-white">3</span>
              <span className="material-symbols-outlined text-4xl text-white/20">
                warning
              </span>
            </div>
          </div>
        </section>

        {/* Action Bar */}
        <section className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={handleAutoQualify}
              className="h-11 px-6 rounded-xl bg-[#0a0a0a] text-white flex items-center justify-center gap-2 font-bold text-xs sm:text-sm hover:opacity-90 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
              <span>Loloskan Top 20 Otomatis</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="h-11 px-6 rounded-xl bg-[#fef9ef] border border-[#0a0a0a]/10 text-[#0a0a0a] flex items-center justify-center gap-2 font-bold text-xs sm:text-sm hover:bg-[#ebe6d6] transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-lg">description</span>
              <span>Ekspor Laporan CSV</span>
            </button>
          </div>

          {/* Search Filter Input */}
          <div className="w-full sm:w-64 relative">
            <input
              type="text"
              placeholder="Cari peserta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8f3e9] border border-[#0a0a0a]/10 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[#6a6a6a] text-[18px]">
              search
            </span>
          </div>
        </section>

        {/* Main Leaderboard Table */}
        <section className="bg-[#ffffff] rounded-[24px] overflow-hidden shadow-sm border border-[#f2ede4]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#f8f3e9] border-b border-[#f2ede4] text-[11px] font-bold text-[#6a6a6a] uppercase tracking-wider">
                  <th className="px-6 py-4">Peringkat</th>
                  <th className="px-6 py-4">Nama Peserta</th>
                  <th className="px-6 py-4">Sekolah</th>
                  <th className="px-6 py-4">Skor</th>
                  <th className="px-6 py-4">Pindah Tab</th>
                  <th className="px-6 py-4 text-right">Status Kualifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2ede4]">
                {filteredParticipants.map((p) => {
                  const isQualified = p.status === 'qualified';
                  const isHighTab = p.tabSwitches >= 3;

                  let rowBg = 'hover:bg-[#f8f3e9]/60 transition-colors';
                  if (isQualified) rowBg = 'bg-[#a4d4c5]/10 hover:bg-[#a4d4c5]/20 transition-colors';
                  if (isHighTab) rowBg = 'bg-[#ffdad6]/20 hover:bg-[#ffdad6]/30 transition-colors';

                  return (
                    <tr key={p.id} className={rowBg}>
                      {/* Rank */}
                      <td className="px-6 py-4">
                        {isQualified ? (
                          <span className="bg-[#a4d4c5] text-[#0a0a0a] font-black px-2.5 py-1 rounded-lg text-xs">
                            {p.rank}
                          </span>
                        ) : (
                          <span className={`font-bold px-2 ${isHighTab ? 'text-[#ba1a1a]' : 'text-[#6a6a6a]'}`}>
                            {p.rank}
                          </span>
                        )}
                      </td>

                      {/* Participant Name */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#0a0a0a]">{p.name}</div>
                      </td>

                      {/* School */}
                      <td className="px-6 py-4">
                        <div className="text-[#6a6a6a]">{p.school}</div>
                      </td>

                      {/* Score */}
                      <td className="px-6 py-4 font-black text-[#0a0a0a]">
                        {p.score}/100
                      </td>

                      {/* Tab-Switch */}
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1 font-bold ${isHighTab ? 'text-[#ba1a1a]' : 'text-[#0a0a0a]'}`}>
                          <span>{p.tabSwitches}</span>
                          {isHighTab && (
                            <span className="material-symbols-outlined text-lg">error</span>
                          )}
                        </div>
                      </td>

                      {/* Advancement Toggle / Status Pill */}
                      <td className="px-6 py-4 text-right">
                        {isQualified ? (
                          <button
                            onClick={() => toggleParticipantStatus(p.id)}
                            className="inline-flex items-center gap-1.5 bg-[#a4d4c5]/20 border border-[#a4d4c5] text-[#0a0a0a] px-3 py-1 rounded-full font-bold text-xs hover:bg-[#a4d4c5]/40 transition-colors"
                          >
                            <span className="w-2 h-2 rounded-full bg-[#a4d4c5] animate-pulse" />
                            <span>Lolos</span>
                          </button>
                        ) : isHighTab ? (
                          <button
                            onClick={() => toggleParticipantStatus(p.id)}
                            className="inline-flex items-center gap-1.5 bg-[#ffdad6] border border-[#ba1a1a] text-[#ba1a1a] px-3 py-1 rounded-full font-bold text-xs hover:bg-[#ffdad6]/80 transition-colors"
                          >
                            <span>Tidak Lolos</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isQualified}
                                onChange={() => toggleParticipantStatus(p.id)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-[#ebe6d6] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a4d4c5]" />
                              <span className="ml-2 font-bold text-xs text-[#6a6a6a]">
                                Tidak Lolos
                              </span>
                            </label>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-[#f8f3e9] border-t border-[#f2ede4] flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs text-[#6a6a6a]">Menampilkan 1 hingga 20 dari 100 peserta</span>
            <div className="flex gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded-lg hover:bg-[#ebe6d6] transition-colors disabled:opacity-40"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    currentPage === page ? 'bg-[#0a0a0a] text-white' : 'hover:bg-[#ebe6d6] text-[#0a0a0a]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={currentPage === 3}
                onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                className="p-1 rounded-lg hover:bg-[#ebe6d6] transition-colors disabled:opacity-40"
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
