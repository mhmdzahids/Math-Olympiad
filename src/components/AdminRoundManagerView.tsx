import React, { useState, useEffect } from 'react';
import { ScreenView, CompetitionRound, ParsedQuestion } from '../types';
import { INITIAL_ROUNDS, INITIAL_PARSED_QUESTIONS, ASSET_IMAGES } from '../data/mockData';

interface AdminRoundManagerViewProps {
  onNavigate: (screen: ScreenView) => void;
  rounds?: CompetitionRound[];
  onUpdateRounds?: (rounds: CompetitionRound[]) => void;
  onEditModeChange?: (isEditing: boolean) => void;
  highlightSaveTrigger?: number;
}

export const AdminRoundManagerView: React.FC<AdminRoundManagerViewProps> = ({
  onNavigate,
  rounds: propsRounds,
  onUpdateRounds,
  onEditModeChange,
  highlightSaveTrigger
}) => {
  const [localRounds, setLocalRounds] = useState<CompetitionRound[]>(propsRounds || INITIAL_ROUNDS);
  const currentRounds = propsRounds || localRounds;

  const updateRounds = (newRounds: CompetitionRound[]) => {
    if (onUpdateRounds) {
      onUpdateRounds(newRounds);
    } else {
      setLocalRounds(newRounds);
    }
  };

  const [expandedRoundId, setExpandedRoundId] = useState<string>('round-2');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'SD-SMP' | 'SMA'>('SD-SMP');
  const [isEditingSettings, setIsEditingSettings] = useState<boolean>(false);
  const [openCategoryDropdownId, setOpenCategoryDropdownId] = useState<string | null>(null);
  const [roundsBackup, setRoundsBackup] = useState<CompetitionRound[] | null>(null);
  const [randomizeOrder, setRandomizeOrder] = useState<boolean>(true);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>(INITIAL_PARSED_QUESTIONS);
  const [isSaveHighlighted, setIsSaveHighlighted] = useState<boolean>(false);

  useEffect(() => {
    if (highlightSaveTrigger && highlightSaveTrigger > 0) {
      setIsSaveHighlighted(true);
      const timer = setTimeout(() => {
        setIsSaveHighlighted(false);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [highlightSaveTrigger]);

  // Warning when leaving/refreshing browser with unsaved changes
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditingSettings) {
        e.preventDefault();
        e.returnValue = 'Perubahan pengaturan babak belum disimpan!';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isEditingSettings]);

  const handleStartEditing = () => {
    setRoundsBackup(JSON.parse(JSON.stringify(currentRounds)));
    setIsEditingSettings(true);
    if (onEditModeChange) onEditModeChange(true);
  };

  const handleCancelEditing = () => {
    if (roundsBackup) {
      updateRounds(roundsBackup);
    }
    setIsEditingSettings(false);
    setIsSaveHighlighted(false);
    setRoundsBackup(null);
    if (onEditModeChange) onEditModeChange(false);
  };

  const handleSaveEditing = () => {
    setIsEditingSettings(false);
    setIsSaveHighlighted(false);
    setRoundsBackup(null);
    if (onEditModeChange) onEditModeChange(false);
    alert('Pengaturan babak berhasil disimpan!');
  };

  // Edit / Add Question Modal states
  const [editingQuestion, setEditingQuestion] = useState<ParsedQuestion | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [newOptions, setNewOptions] = useState<{ key: string; text: string }[]>([
    { key: 'A', text: '' },
    { key: 'B', text: '' },
    { key: 'C', text: '' },
    { key: 'D', text: '' }
  ]);
  const [newKey, setNewKey] = useState('A');

  const toggleExpand = (id: string) => {
    setExpandedRoundId(expandedRoundId === id ? '' : id);
  };

  const handleUpdateCategory = (roundId: string, category: string) => {
    if (!isEditingSettings) return;
    const updated = currentRounds.map((r) =>
      r.id === roundId ? { ...r, category } : r
    );
    updateRounds(updated);
  };

  const handleUpdateDuration = (roundId: string, duration: number) => {
    if (!isEditingSettings) return;
    const updated = currentRounds.map((r) =>
      r.id === roundId ? { ...r, durationMinutes: duration } : r
    );
    updateRounds(updated);
  };

  const handleUpdateTabLimit = (roundId: string, limit: number) => {
    if (!isEditingSettings) return;
    const updated = currentRounds.map((r) =>
      r.id === roundId ? { ...r, tabSwitchLimit: limit } : r
    );
    updateRounds(updated);
  };

  const handleUpdateExecutionMode = (roundId: string, mode: 'online' | 'offline') => {
    if (!isEditingSettings) return;
    const updated = currentRounds.map((r) =>
      r.id === roundId ? { ...r, executionMode: mode } : r
    );
    updateRounds(updated);
  };

  const handleUpdateSchedule = (
    roundId: string,
    field: 'startDate' | 'startTime' | 'endDate' | 'endTime',
    value: string
  ) => {
    if (!isEditingSettings) return;
    const updated = currentRounds.map((r) =>
      r.id === roundId ? { ...r, [field]: value } : r
    );
    updateRounds(updated);
  };

  const handleToggleStartOfflineRound = (roundId: string) => {
    const updated = currentRounds.map((r) => {
      if (r.id === roundId) {
        const nextState = !r.isOfflineStarted;
        if (nextState) {
          alert(`Sesi Offline untuk "${r.title}" BERHASIL DIMULAI! Layar proyektor siap ditayangkan.`);
        } else {
          alert(`Sesi Offline untuk "${r.title}" telah dihentikan.`);
        }
        return { ...r, isOfflineStarted: nextState };
      }
      return r;
    });
    updateRounds(updated);
  };

  const activeExpandedRound = currentRounds.find((r) => r.id === expandedRoundId) || currentRounds[0];
  const isSelectedRoundOffline = activeExpandedRound?.executionMode === 'offline';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isSelectedRoundOffline) {
        alert(`Berhasil mengunggah berkas presentasi offline (${file.name}) untuk tayangan proyektor!`);
      } else {
        alert(`Parsing file Word: ${file.name} ...`);
        const newParsed: ParsedQuestion = {
          id: `Q0${parsedQuestions.length + 1}`,
          questionText: `Uploaded Question: Calculate integral of 2x dx from 0 to ${parsedQuestions.length + 5}.`,
          options: [
            { key: 'A', text: `${(parsedQuestions.length + 5) ** 2}` },
            { key: 'B', text: `${(parsedQuestions.length + 5) * 2}` },
            { key: 'C', text: `${parsedQuestions.length + 10}` }
          ],
          key: 'A',
          isError: false
        };
        setParsedQuestions([...parsedQuestions, newParsed]);
      }
    }
  };

  const handleSkipQuestion = (id: string) => {
    setParsedQuestions(parsedQuestions.filter((q) => q.id !== id));
  };

  const handleStartEdit = (pq: ParsedQuestion) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const rawOpts = pq.options && pq.options.length > 0
      ? pq.options
      : [
          { key: 'A', text: '' },
          { key: 'B', text: '' },
          { key: 'C', text: '' },
          { key: 'D', text: '' }
        ];
    const opts = rawOpts.map((opt, i) => ({
      ...opt,
      key: letters[i] || `P${i + 1}`
    }));
    setEditingQuestion({
      ...pq,
      options: opts,
      key: pq.key || opts[0]?.key || 'A'
    });
  };

  const handleSaveEditQuestion = () => {
    if (!editingQuestion) return;
    setParsedQuestions(
      parsedQuestions.map((q) =>
        q.id === editingQuestion.id
          ? {
              ...editingQuestion,
              isError: false,
              errorMessage: undefined
            }
          : q
      )
    );
    setEditingQuestion(null);
  };

  const handleAddNewOption = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const rawAdded = [...newOptions, { key: '', text: '' }];
    const updatedOpts = rawAdded.map((opt, i) => ({
      ...opt,
      key: letters[i] || `P${i + 1}`
    }));
    const validKeys = updatedOpts.map((o) => o.key);
    const updatedKey = validKeys.includes(newKey) ? newKey : updatedOpts[0].key;
    setNewOptions(updatedOpts);
    setNewKey(updatedKey);
  };

  const handleDeleteNewOption = (idx: number) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const filtered = newOptions.filter((_, i) => i !== idx);
    const updatedOpts = filtered.map((o, i) => ({
      ...o,
      key: letters[i] || `P${i + 1}`
    }));
    const validKeys = updatedOpts.map((o) => o.key);
    const updatedKey = validKeys.includes(newKey) ? newKey : (updatedOpts[0]?.key || 'A');
    setNewOptions(updatedOpts);
    setNewKey(updatedKey);
  };

  const handleOptionTextChange = (idx: number, text: string) => {
    const updated = [...newOptions];
    updated[idx] = { ...updated[idx], text };
    setNewOptions(updated);
  };

  const resetAddModal = () => {
    setNewQuestionText('');
    setNewImageUrl('');
    setNewOptions([
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' }
    ]);
    setNewKey('A');
    setShowAddModal(false);
  };

  const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingQuestion) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditingQuestion({
            ...editingQuestion,
            imageUrl: event.target.result as string,
            isError: false
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddManualQuestion = () => {
    if (!newQuestionText.trim()) return;
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const formattedOpts = newOptions.map((opt, i) => ({
      key: letters[i] || `P${i + 1}`,
      text: opt.text.trim() || `Pilihan ${letters[i] || i + 1}`
    }));
    const validKeys = formattedOpts.map((o) => o.key);
    const finalKey = validKeys.includes(newKey) ? newKey : (formattedOpts[0]?.key || 'A');

    const newQ: ParsedQuestion = {
      id: `Q0${parsedQuestions.length + 1}`,
      questionText: newQuestionText,
      options: formattedOpts,
      key: finalKey,
      isError: false,
      imageUrl: newImageUrl.trim() || undefined
    };
    setParsedQuestions([...parsedQuestions, newQ]);
    resetAddModal();
  };

  const handleConfirmSaveToBank = () => {
    alert(`Berhasil menyinkronkan ${parsedQuestions.length} soal ke Bank Soal pusat!`);
    onNavigate('admin-leaderboard');
  };

  return (
    <div className="w-full bg-[#fffaf0] min-h-screen pb-32">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Section 1: Dynamic Round Manager */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a] tracking-tight">
                  Manajer Babak
                </h2>
                <p className="text-sm text-[#6a6a6a]">Atur, urutkan, dan kelola babak kompetisi SD-SMP & SMA.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {/* Button 1 Slot: Pengaturan Babak <-> Batalkan */}
                <button
                  type="button"
                  onClick={isEditingSettings ? handleCancelEditing : handleStartEditing}
                  className={`relative overflow-hidden flex items-center justify-center font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all duration-300 ease-out shadow-2xs cursor-pointer border ${
                    isEditingSettings
                      ? 'bg-[#ff6b5a]/15 hover:bg-[#ff6b5a]/25 text-[#d32f2f] border-[#ff6b5a]/40'
                      : 'bg-[#ebe6d6] hover:bg-[#e7e2d8] text-[#0a0a0a] border-transparent'
                  }`}
                >
                  <div className="relative flex items-center justify-center min-h-[20px] min-w-[120px]">
                    {/* Non-editing state content */}
                    <div
                      className={`flex items-center gap-1.5 transition-all duration-300 ease-out ${
                        isEditingSettings
                          ? 'opacity-0 -translate-y-2 pointer-events-none absolute'
                          : 'opacity-100 translate-y-0 relative'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">settings</span>
                      <span className="whitespace-nowrap">Pengaturan Babak</span>
                    </div>

                    {/* Editing state content */}
                    <div
                      className={`flex items-center gap-1.5 transition-all duration-300 ease-out ${
                        isEditingSettings
                          ? 'opacity-100 translate-y-0 relative'
                          : 'opacity-0 translate-y-2 pointer-events-none absolute'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                      <span className="whitespace-nowrap">Batalkan</span>
                    </div>
                  </div>
                </button>

                {/* Button 2 Slot: Tambah Babak Baru <-> Simpan Pengaturan */}
                <button
                  type="button"
                  onClick={() => {
                    if (isEditingSettings) {
                      handleSaveEditing();
                    } else {
                      const newCategory = selectedCategoryTab;
                      const categoryCount = currentRounds.filter((r) => r.category === newCategory).length;
                      const newR: CompetitionRound = {
                        id: `round-${currentRounds.length + 1}`,
                        title: `Babak Baru ${newCategory} ${categoryCount + 1}`,
                        category: newCategory,
                        questionCount: 30,
                        durationMinutes: 60,
                        tabSwitchLimit: 3,
                        status: 'active',
                        executionMode: 'online'
                      };
                      updateRounds([...currentRounds, newR]);
                    }
                  }}
                  className={`relative overflow-hidden flex items-center justify-center font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all duration-300 ease-out cursor-pointer active:scale-95 border ${
                    isEditingSettings
                      ? 'bg-[#a4d4c5] hover:bg-[#a4d4c5]/90 text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-md'
                      : 'bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border-transparent shadow-xs'
                  }`}
                >
                  {/* Subtle white blinking overlay when save is highlighted */}
                  {isSaveHighlighted && isEditingSettings && (
                    <div className="absolute inset-0 bg-white/50 animate-pulse pointer-events-none" />
                  )}

                  <div className="relative z-10 flex items-center justify-center min-h-[20px] min-w-[135px]">
                    {/* Non-editing state content */}
                    <div
                      className={`flex items-center gap-1.5 transition-all duration-300 ease-out ${
                        isEditingSettings
                          ? 'opacity-0 -translate-y-2 pointer-events-none absolute'
                          : 'opacity-100 translate-y-0 relative'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      <span className="whitespace-nowrap">Tambah Babak Baru</span>
                    </div>

                    {/* Editing state content */}
                    <div
                      className={`flex items-center gap-1.5 transition-all duration-300 ease-out ${
                        isEditingSettings
                          ? 'opacity-100 translate-y-0 relative'
                          : 'opacity-0 translate-y-2 pointer-events-none absolute'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      <span className="whitespace-nowrap">Simpan Pengaturan</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Category Selector Buttons Bar */}
            <div className="bg-[#ebe6d6]/60 p-2 rounded-2xl border border-[#0a0a0a]/10 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <span className="text-xs font-extrabold text-[#0a0a0a] uppercase tracking-wider pl-2 mr-1 flex items-center gap-1 shrink-0">
                  <span className="material-symbols-outlined text-base">school</span>
                  Kategori:
                </span>

                <button
                  onClick={() => setSelectedCategoryTab('SD-SMP')}
                  className={`px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer border ${
                    selectedCategoryTab === 'SD-SMP'
                      ? 'bg-[#ffb084] text-[#0a0a0a] border-[#0a0a0a] shadow-md ring-2 ring-[#ffb084]/50'
                      : 'bg-white/80 hover:bg-white text-[#0a0a0a] border-[#0a0a0a]/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">child_care</span>
                  <span>SD - SMP</span>
                  <span className="px-2 py-0.5 text-[10px] bg-[#0a0a0a]/10 text-[#0a0a0a] rounded-full font-black">
                    {currentRounds.filter((r) => r.category === 'SD-SMP').length}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedCategoryTab('SMA')}
                  className={`px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer border ${
                    selectedCategoryTab === 'SMA'
                      ? 'bg-[#e8b94a] text-[#0a0a0a] border-[#0a0a0a] shadow-md ring-2 ring-[#e8b94a]/50'
                      : 'bg-white/80 hover:bg-white text-[#0a0a0a] border-[#0a0a0a]/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">workspace_premium</span>
                  <span>SMA</span>
                  <span className="px-2 py-0.5 text-[10px] bg-[#0a0a0a]/10 text-[#0a0a0a] rounded-full font-black">
                    {currentRounds.filter((r) => r.category === 'SMA').length}
                  </span>
                </button>
              </div>

              <div className="text-xs font-semibold text-[#6a6a6a] px-2 hidden md:block">
                Menampilkan: <span className="font-extrabold text-[#0a0a0a]">{selectedCategoryTab}</span>
              </div>
            </div>



            {/* Accordion List */}
            <div className="space-y-3">
              {currentRounds
                .filter((r) => (r.category || 'SMA') === selectedCategoryTab)
                .map((round) => {
                  const isExpanded = expandedRoundId === round.id;
                  const isOffline = round.executionMode === 'offline';
                  const isSdSmp = round.category === 'SD-SMP';

                  return (
                    <div
                      key={round.id}
                      className={`rounded-2xl p-4 border transition-all relative ${
                        isExpanded
                          ? 'bg-[#fef9ef] border-[#feaf83]/30 ring-2 ring-[#feaf83]/20 shadow-md'
                          : 'bg-[#f5f0e0] border-[#0a0a0a]/10 hover:bg-[#ebe6d6]'
                      }`}
                    >
                      <div
                        onClick={() => toggleExpand(round.id)}
                        className="flex items-center justify-between flex-wrap gap-2 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[#6a6a6a] cursor-move" onClick={(e) => e.stopPropagation()}>
                            drag_indicator
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-base text-[#0a0a0a]">{round.title}</p>
                              
                              {round.isFinal && (
                                <span className="bg-[#e8b94a] text-[#0a0a0a] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  FINAL
                                </span>
                              )}
                              {isOffline ? (
                                <span className="bg-[#feaf83] text-[#0a0a0a] text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                                  <span className="material-symbols-outlined text-[12px]">co_present</span>
                                  <span>Sesi Offline</span>
                                </span>
                              ) : (
                                <span className="bg-[#b8a4ed]/40 text-[#0a0a0a] text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px]">laptop_mac</span>
                                  <span>Online</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#6a6a6a]">
                              {round.questionCount} Soal • {round.durationMinutes} Menit {isOffline ? '• Proyektor Kelas' : ''}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(round.id);
                          }}
                          className="p-1.5 hover:bg-[#ebe6d6] rounded-lg transition-colors text-[#0a0a0a] cursor-pointer"
                        >
                          <span className={`material-symbols-outlined transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                            expand_more
                          </span>
                        </button>
                      </div>

                      {/* Expanded Controls with Smooth Accordion Transition */}
                      <div
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                        }`}
                      >
                        <div className={isExpanded ? 'overflow-visible' : 'overflow-hidden'}>
                          <div className="space-y-4 pt-4 mt-4 border-t border-[#ebe6d6]">
                          {/* Mode Pelaksanaan Selection */}
                          <div className="space-y-1.5 bg-[#fffaf0] p-3.5 rounded-xl border border-[#0a0a0a]/10">
                            <div className="flex items-center justify-between">
                            <label className="text-[11px] font-black text-[#0a0a0a] uppercase tracking-wider flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-base text-[#0a0a0a]">tune</span>
                              <span>MODE PELAKSANAAN BABAK</span>
                            </label>
                            {!isEditingSettings && (
                              <span className="text-[10px] text-[#6a6a6a] font-bold italic flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">lock</span>
                                Mode Terkunci
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              disabled={!isEditingSettings}
                              onClick={() => handleUpdateExecutionMode(round.id, 'online')}
                              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border-2 transition-all ${
                                !isOffline
                                  ? 'bg-[#b8a4ed] border-[#0a0a0a] text-[#0a0a0a] shadow-xs'
                                  : 'bg-white border-[#0a0a0a]/15 text-[#6a6a6a]'
                              } ${!isEditingSettings ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:border-[#0a0a0a]'}`}
                            >
                              <span className="material-symbols-outlined text-base">laptop_mac</span>
                              <span>Kuis Online (Laptop Peserta)</span>
                            </button>

                            <button
                              type="button"
                              disabled={!isEditingSettings}
                              onClick={() => handleUpdateExecutionMode(round.id, 'offline')}
                              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border-2 transition-all ${
                                isOffline
                                  ? 'bg-[#feaf83] border-[#0a0a0a] text-[#0a0a0a] shadow-xs'
                                  : 'bg-white border-[#0a0a0a]/15 text-[#6a6a6a]'
                              } ${!isEditingSettings ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:border-[#0a0a0a]'}`}
                            >
                              <span className="material-symbols-outlined text-base">co_present</span>
                              <span>Sesi Offline (Proyektor Kelas)</span>
                            </button>
                          </div>

                          {isOffline && (
                            <div className="bg-[#ffdbca]/50 border border-[#8b4f2b]/20 p-2.5 rounded-lg mt-2 text-[11px] text-[#6e3816] leading-relaxed">
                              <strong>Catatan Sesi Offline:</strong> Kuis dilaksanakan dengan menayangkan soal di 1 proyektor kelas. Tombol <em>"Mulai Kuis Sekarang"</em> pada Dashboard Siswa otomatis disembunyikan.
                            </div>
                          )}
                        </div>

                        {/* Jadwal Pelaksanaan (Tanggal & Waktu) */}
                        <div className="space-y-1.5 bg-[#fffaf0] p-3.5 rounded-xl border border-[#0a0a0a]/10">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-black text-[#0a0a0a] uppercase tracking-wider flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-base text-[#0a0a0a]">calendar_clock</span>
                              <span>PENGATURAN WAKTU & JADWAL UJIAN</span>
                            </label>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {/* Start Date & Time */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-[#6a6a6a] uppercase block tracking-wider">Tanggal & Jam Mulai</span>
                              <div className="flex gap-2">
                                <div className={`flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${
                                  isEditingSettings
                                    ? 'bg-white border-[#0a0a0a]/30 focus-within:border-[#0a0a0a] focus-within:ring-2 focus-within:ring-[#0a0a0a]/10 shadow-2xs'
                                    : 'bg-[#ebe6d6]/40 border-transparent cursor-not-allowed opacity-80'
                                }`}>
                                  <span className="material-symbols-outlined text-[#6a6a6a] text-base shrink-0">calendar_month</span>
                                  <input
                                    type="date"
                                    disabled={!isEditingSettings}
                                    value={round.startDate || '2026-08-01'}
                                    onChange={(e) => handleUpdateSchedule(round.id, 'startDate', e.target.value)}
                                    className={`w-full text-xs font-black text-[#0a0a0a] bg-transparent focus:outline-none ${
                                      !isEditingSettings ? 'cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                                  />
                                </div>

                                <div className={`w-32 flex items-center gap-1.5 px-2.5 py-2 rounded-xl border transition-all ${
                                  isEditingSettings
                                    ? 'bg-white border-[#0a0a0a]/30 focus-within:border-[#0a0a0a] focus-within:ring-2 focus-within:ring-[#0a0a0a]/10 shadow-2xs'
                                    : 'bg-[#ebe6d6]/40 border-transparent cursor-not-allowed opacity-80'
                                }`}>
                                  <span className="material-symbols-outlined text-[#6a6a6a] text-base shrink-0">schedule</span>
                                  <input
                                    type="time"
                                    disabled={!isEditingSettings}
                                    value={round.startTime || '08:00'}
                                    onChange={(e) => handleUpdateSchedule(round.id, 'startTime', e.target.value)}
                                    className={`w-full text-xs font-black text-[#0a0a0a] bg-transparent focus:outline-none ${
                                      !isEditingSettings ? 'cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* End Date & Time */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-[#6a6a6a] uppercase block tracking-wider">Tanggal & Jam Selesai</span>
                              <div className="flex gap-2">
                                <div className={`flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${
                                  isEditingSettings
                                    ? 'bg-white border-[#0a0a0a]/30 focus-within:border-[#0a0a0a] focus-within:ring-2 focus-within:ring-[#0a0a0a]/10 shadow-2xs'
                                    : 'bg-[#ebe6d6]/40 border-transparent cursor-not-allowed opacity-80'
                                }`}>
                                  <span className="material-symbols-outlined text-[#6a6a6a] text-base shrink-0">event_available</span>
                                  <input
                                    type="date"
                                    disabled={!isEditingSettings}
                                    value={round.endDate || '2026-08-10'}
                                    onChange={(e) => handleUpdateSchedule(round.id, 'endDate', e.target.value)}
                                    className={`w-full text-xs font-black text-[#0a0a0a] bg-transparent focus:outline-none ${
                                      !isEditingSettings ? 'cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                                  />
                                </div>

                                <div className={`w-32 flex items-center gap-1.5 px-2.5 py-2 rounded-xl border transition-all ${
                                  isEditingSettings
                                    ? 'bg-white border-[#0a0a0a]/30 focus-within:border-[#0a0a0a] focus-within:ring-2 focus-within:ring-[#0a0a0a]/10 shadow-2xs'
                                    : 'bg-[#ebe6d6]/40 border-transparent cursor-not-allowed opacity-80'
                                }`}>
                                  <span className="material-symbols-outlined text-[#6a6a6a] text-base shrink-0">history_toggle_off</span>
                                  <input
                                    type="time"
                                    disabled={!isEditingSettings}
                                    value={round.endTime || '18:00'}
                                    onChange={(e) => handleUpdateSchedule(round.id, 'endTime', e.target.value)}
                                    className={`w-full text-xs font-black text-[#0a0a0a] bg-transparent focus:outline-none ${
                                      !isEditingSettings ? 'cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Offline Execution Control Box */}
                        {isOffline && (
                          <div className="bg-[#feaf83]/20 border-2 border-[#feaf83] p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                              <h4 className="font-extrabold text-sm text-[#0a0a0a] flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-lg text-[#0a0a0a]">co_present</span>
                                <span>Kontrol Tayangan Proyektor Sesi Offline</span>
                              </h4>
                              <p className="text-xs text-[#6a6a6a] mt-0.5">
                                Klik tombol di samping untuk mengaktifkan sesi tayangan proyektor di ruang kelas.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleStartOfflineRound(round.id)}
                              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-md transition-all shrink-0 cursor-pointer ${
                                round.isOfflineStarted
                                  ? 'bg-[#ff6b5a] text-white hover:bg-[#ff6b5a]/90'
                                  : 'bg-[#0a0a0a] text-white hover:bg-[#0a0a0a]/80'
                              }`}
                            >
                              <span className="material-symbols-outlined text-base">
                                {round.isOfflineStarted ? 'pause_circle' : 'play_circle'}
                              </span>
                              <span>{round.isOfflineStarted ? 'Hentikan Sesi Babak' : 'Mulai Babak'}</span>
                            </button>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {/* Kategori Lomba */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider">
                              KATEGORI LOMBA
                            </label>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!isEditingSettings) {
                                    setIsEditingSettings(true);
                                  }
                                  setOpenCategoryDropdownId(openCategoryDropdownId === round.id ? null : round.id);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-[#0a0a0a]/20 bg-[#f5f0e0] hover:bg-[#ebe6d6] shadow-2xs cursor-pointer transition-all text-xs font-black text-[#0a0a0a]"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-[18px] text-[#0a0a0a]">
                                    {(round.category || 'SMA') === 'SD-SMP' ? 'child_care' : 'workspace_premium'}
                                  </span>
                                  <span>{(round.category || 'SMA') === 'SD-SMP' ? 'SD - SMP' : 'SMA'}</span>
                                </div>
                                <span className="material-symbols-outlined text-base text-[#0a0a0a]">
                                  {openCategoryDropdownId === round.id ? 'expand_less' : 'expand_more'}
                                </span>
                              </button>

                              {openCategoryDropdownId === round.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setOpenCategoryDropdownId(null)}
                                  />
                                  <div className="absolute left-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-[#0a0a0a]/10 p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-3 py-1.5 text-[10px] font-black uppercase text-[#6a6a6a] tracking-wider border-b border-[#0a0a0a]/5 mb-1">
                                      Pilih Kategori Lomba
                                    </div>

                                    {/* SD-SMP Category Option */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!isEditingSettings) setIsEditingSettings(true);
                                        handleUpdateCategory(round.id, 'SD-SMP');
                                        setOpenCategoryDropdownId(null);
                                      }}
                                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                                        (round.category || 'SMA') === 'SD-SMP'
                                          ? 'bg-[#ffb084] text-[#0a0a0a] shadow-2xs border border-[#0a0a0a]/10'
                                          : 'hover:bg-[#f8f3e9] text-[#0a0a0a]'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-base shrink-0">child_care</span>
                                        <div className="text-left">
                                          <div>SD - SMP</div>
                                          <div className="text-[10px] font-medium text-[#6a6a6a]">Tingkat SD & SMP</div>
                                        </div>
                                      </div>
                                      {(round.category || 'SMA') === 'SD-SMP' && (
                                        <span className="material-symbols-outlined text-base text-[#0a0a0a] shrink-0">check_circle</span>
                                      )}
                                    </button>

                                    {/* SMA Category Option */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!isEditingSettings) setIsEditingSettings(true);
                                        handleUpdateCategory(round.id, 'SMA');
                                        setOpenCategoryDropdownId(null);
                                      }}
                                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                                        (round.category || 'SMA') === 'SMA'
                                          ? 'bg-[#e8b94a] text-[#0a0a0a] shadow-2xs border border-[#0a0a0a]/10'
                                          : 'hover:bg-[#f8f3e9] text-[#0a0a0a]'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-base shrink-0">workspace_premium</span>
                                        <div className="text-left">
                                          <div>SMA</div>
                                          <div className="text-[10px] font-medium text-[#6a6a6a]">Tingkat SMA / Sederajat</div>
                                        </div>
                                      </div>
                                      {(round.category || 'SMA') === 'SMA' && (
                                        <span className="material-symbols-outlined text-base text-[#0a0a0a] shrink-0">check_circle</span>
                                      )}
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Durasi Waktu */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider">
                              DURASI WAKTU
                            </label>
                            <div className={`flex items-center gap-2 border px-3 py-2 rounded-xl ${
                              isEditingSettings ? 'bg-[#fffaf0] border-[#0a0a0a]/20' : 'bg-[#ebe6d6]/40 border-[#0a0a0a]/10 opacity-80'
                            }`}>
                              <span className="material-symbols-outlined text-[#6a6a6a] text-[20px]">
                                timer
                              </span>
                              <input
                                type="number"
                                disabled={!isEditingSettings}
                                value={round.durationMinutes}
                                onChange={(e) =>
                                  handleUpdateDuration(round.id, parseInt(e.target.value) || 60)
                                }
                                className={`font-bold text-sm bg-transparent border-none focus:outline-none w-16 text-[#0a0a0a] ${
                                  !isEditingSettings ? 'cursor-not-allowed' : ''
                                }`}
                              />
                              <span className="text-xs text-[#6a6a6a] font-semibold">Menit</span>
                            </div>
                          </div>

                          {/* Batas Pindah Tab */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider">
                              BATAS PINDAH TAB
                            </label>
                            <div className={`flex items-center gap-2 border px-3 py-2 rounded-xl ${
                              isEditingSettings ? 'bg-[#fffaf0] border-[#0a0a0a]/20' : 'bg-[#ebe6d6]/40 border-[#0a0a0a]/10 opacity-80'
                            }`}>
                              <span className="material-symbols-outlined text-[#6a6a6a] text-[20px]">
                                security
                              </span>
                              <input
                                type="number"
                                disabled={!isEditingSettings}
                                value={round.tabSwitchLimit}
                                onChange={(e) =>
                                  handleUpdateTabLimit(round.id, parseInt(e.target.value) || 1)
                                }
                                className={`font-bold text-sm bg-transparent border-none focus:outline-none w-12 text-[#0a0a0a] ${
                                  !isEditingSettings ? 'cursor-not-allowed' : ''
                                }`}
                              />
                              <span className="text-xs text-[#6a6a6a] font-semibold">Kali</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          </div>

          {/* Clay Mascot Mascot Container */}
          <div className="hidden lg:flex flex-col justify-center items-center relative py-4">
            <img
              src={ASSET_IMAGES.bearMascot}
              alt="Maskot Beruang Kelulusan"
              className="w-full max-w-[280px] drop-shadow-xl animate-bounce"
              style={{ animationDuration: '4s' }}
            />
            <div className="mt-4 text-center">
              <p className="text-2xl font-black text-[#ff4d8b]">Naik Tingkat!</p>
              <p className="text-xs text-[#6a6a6a]">Siap memfinalisasi skema babak?</p>
            </div>
          </div>
        </section>

        {/* Section 2: Question Importer Panel */}
        <section className="space-y-4">
          <div className="bg-[#f5f0e0] rounded-2xl overflow-hidden border border-[#0a0a0a]/10 shadow-xs">
            <div className={`p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors ${
              isSelectedRoundOffline ? 'bg-[#feaf83]' : 'bg-[#b8a4ed]'
            }`}>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-xl">
                  <span className="material-symbols-outlined text-[#0a0a0a] text-[28px]">
                    {isSelectedRoundOffline ? 'co_present' : 'upload_file'}
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg sm:text-xl text-[#0a0a0a]">
                    {isSelectedRoundOffline
                      ? `Impor Berkas Presentasi Sesi Offline (${activeExpandedRound?.title})`
                      : `Impor Soal Kuis Online dari .docx (${activeExpandedRound?.title})`}
                  </h3>
                  <p className="text-xs text-[#0a0a0a]/80 font-medium">
                    {isSelectedRoundOffline
                      ? 'Format PDF / PowerPoint (.pdf, .ppt, .pptx) untuk ditayangkan via 1 proyektor di dalam kelas.'
                      : 'Format Word (.docx) berisi bank soal kuis online mandiri peserta.'}
                  </p>
                </div>
              </div>

              {!isSelectedRoundOffline && (
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs sm:text-sm text-[#0a0a0a] font-bold">
                    Acak Urutan Soal per Peserta
                  </span>
                  <button
                    type="button"
                    onClick={() => setRandomizeOrder(!randomizeOrder)}
                    className={`w-12 h-6 rounded-full relative flex items-center px-1 transition-colors ${
                      randomizeOrder ? 'bg-[#0a0a0a]' : 'bg-[#c4c7c7]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        randomizeOrder ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 sm:p-10">
              <label className="border-2 border-dashed border-[#c4c7c7] hover:border-[#0a0a0a] rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center bg-[#fffaf0]/50 group transition-colors cursor-pointer text-center block">
                <input
                  type="file"
                  accept={isSelectedRoundOffline ? '.pdf,.ppt,.pptx' : '.docx,.doc'}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="relative mb-4">
                  {isSelectedRoundOffline ? (
                    <div className="w-20 h-20 bg-[#feaf83]/30 rounded-2xl flex items-center justify-center text-[#0a0a0a]">
                      <span className="material-symbols-outlined text-5xl">slideshow</span>
                    </div>
                  ) : (
                    <img
                      src={ASSET_IMAGES.documentIcon}
                      alt="Ikon Dokumen"
                      className="w-20 h-20 group-hover:scale-110 transition-transform object-contain"
                    />
                  )}
                </div>
                <p className="font-bold text-base text-[#0a0a0a]">
                  {isSelectedRoundOffline
                    ? 'Tarik dan lepas berkas PDF / PowerPoint (.ppt, .pptx) di sini'
                    : 'Tarik dan lepas dokumen Word Anda di sini'}
                </p>
                <p className="text-xs text-[#6a6a6a] mt-1">
                  {isSelectedRoundOffline
                    ? 'Format yang didukung: .pdf, .ppt, .pptx (Maks 50MB)'
                    : 'Format yang didukung: .docx, .doc (Maks 20MB)'}
                </p>
                <span className="mt-4 inline-block bg-[#ebe6d6] group-hover:bg-[#e7e2d8] text-[#0a0a0a] font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-xs">
                  {isSelectedRoundOffline ? 'Pilih Berkas PDF / PPT' : 'Pilih Berkas Word (.docx)'}
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* Section 3: Live Parsing Preview Table */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-lg sm:text-xl text-[#0a0a0a]">
              Pratinjau Hasil Impor Soal
            </h3>
            <span className="text-xs sm:text-sm text-[#6a6a6a]">
              Menampilkan {parsedQuestions.length} soal terurai
            </span>
          </div>

          <div className="bg-[#f5f0e0] rounded-2xl overflow-hidden border border-[#0a0a0a]/10 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#ebe6d6]/60 border-b border-[#0a0a0a]/10 text-[11px] font-bold uppercase tracking-wider text-[#6a6a6a]">
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">TEKS SOAL</th>
                    <th className="px-6 py-3">PILIHAN (A-D)</th>
                    <th className="px-6 py-3 text-center">KUNCI</th>
                    <th className="px-6 py-3 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebe6d6]">
                  {parsedQuestions.map((pq) => (
                    <tr
                      key={pq.id}
                      className={
                        pq.isError
                          ? 'bg-[#ffdad6]/40 hover:bg-[#ffdad6]/60 transition-colors'
                          : 'hover:bg-[#fffaf0]/40 transition-colors'
                      }
                    >
                      <td className="px-6 py-4 font-bold text-[#0a0a0a]">{pq.id}</td>
                      <td className="px-6 py-4 max-w-xs">
                        {pq.isError ? (
                          <p className="text-[#ba1a1a] font-medium italic">
                            {pq.questionText}
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            <p className="text-[#1d1c16] line-clamp-2">{pq.questionText}</p>
                            {pq.imageUrl && (
                              <div className="flex items-center gap-2">
                                <img
                                  src={pq.imageUrl}
                                  alt="Lampiran Soal"
                                  className="h-9 w-14 object-cover rounded-lg border border-[#0a0a0a]/15 shadow-2xs"
                                />
                                <span className="text-[10px] font-extrabold text-[#e05638] bg-[#ffb084]/20 border border-[#ffb084]/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px]">image</span>
                                  <span>Lampiran Gambar</span>
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {pq.isError ? (
                          <span className="text-[#6a6a6a] italic text-xs">
                            Gagal mengurai...
                          </span>
                        ) : (
                          <div className="flex gap-1.5 flex-wrap">
                            {pq.options.map((opt) => (
                              <span
                                key={opt.key}
                                className="text-xs bg-[#fffaf0] px-2 py-1 rounded-lg border border-[#0a0a0a]/10 font-medium"
                              >
                                {opt.key}: {opt.text}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {pq.isError ? (
                          <span className="material-symbols-outlined text-[#ba1a1a]">
                            warning
                          </span>
                        ) : (
                          <span className="bg-[#a4d4c5] text-[#0a0a0a] text-xs px-2.5 py-1 rounded-full font-bold">
                            {pq.key}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {pq.isError ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleStartEdit(pq)}
                              className="bg-white text-[#0a0a0a] font-bold text-xs px-3 py-1 rounded-lg border border-[#0a0a0a]/10 hover:bg-[#ebe6d6] cursor-pointer"
                            >
                              Ubah
                            </button>
                            <button
                              onClick={() => handleSkipQuestion(pq.id)}
                              className="bg-[#ba1a1a] text-white font-bold text-xs px-3 py-1 rounded-lg hover:opacity-90 cursor-pointer"
                            >
                              Lewati
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(pq)}
                            className="text-[#6a6a6a] hover:text-[#0a0a0a] transition-colors p-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              edit
                            </span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Fixed Bottom Bar CTA Container */}
      <footer className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-[#0a0a0a]/10 py-4 px-6 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a4d4c5] text-2xl font-black">
              check_circle
            </span>
            <p className="text-sm font-semibold text-[#0a0a0a]">
              Semua sistem siap! {parsedQuestions.filter((q) => !q.isError).length} soal siap disinkronkan ke bank soal.
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 md:flex-none bg-[#ebe6d6] hover:bg-[#e7e2d8] text-[#0a0a0a] font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-colors"
            >
              Tambah Soal Manual
            </button>
            <button
              onClick={handleConfirmSaveToBank}
              className="flex-1 md:flex-none bg-[#0a0a0a] hover:bg-[#0a0a0a]/90 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl hover:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <span>Konfirmasi & Simpan ke Bank Soal</span>
              <span className="material-symbols-outlined text-[18px]">save</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Add Manual Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0a0a0a]/60 blur-backdrop" onClick={resetAddModal} />
          <div className="relative bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 clay-shadow z-10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#0a0a0a]/10 pb-3">
              <h3 className="text-xl font-bold text-[#0a0a0a]">Tambah Soal Manual</h3>
              <button
                type="button"
                onClick={resetAddModal}
                className="text-[#6a6a6a] hover:text-[#0a0a0a] transition-colors p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-xs font-bold uppercase text-[#6a6a6a] mb-1">Teks Soal</label>
              <textarea
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Masukkan teks soal..."
                className="w-full bg-[#f8f3e9] border border-[#0a0a0a]/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[#0a0a0a]"
                rows={3}
              />
            </div>

            {/* Question Image Attachment */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase text-[#6a6a6a]">Gambar / Diagram Soal (Opsional)</label>
                {newImageUrl && (
                  <button
                    type="button"
                    onClick={() => setNewImageUrl('')}
                    className="text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    <span>Hapus Gambar</span>
                  </button>
                )}
              </div>

              {newImageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-[#0a0a0a]/15 bg-[#f8f3e9] p-2 flex items-center justify-center">
                  <img
                    src={newImageUrl}
                    alt="Preview Gambar Soal"
                    className="max-h-40 max-w-full object-contain rounded-xl"
                  />
                </div>
              ) : (
                <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#f8f3e9] hover:bg-[#ebe6d6] text-[#0a0a0a] border border-dashed border-[#0a0a0a]/30 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
                  <span>Tambah / Unggah Gambar Soal</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleNewImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Options List */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase text-[#6a6a6a]">Pilihan Jawaban</label>
                <button
                  type="button"
                  onClick={handleAddNewOption}
                  className="bg-[#f8f3e9] hover:bg-[#ebe6d6] text-[#0a0a0a] px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-[#0a0a0a]/10 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Tambah Pilihan</span>
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {newOptions.map((opt, idx) => {
                  const isKey = newKey === opt.key;
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${
                        isKey ? 'bg-[#a4d4c5] border-[#0a0a0a] text-[#0a0a0a]' : 'bg-[#ebe6d6] border-transparent text-[#0a0a0a]'
                      }`}>
                        {opt.key}
                      </span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                        placeholder={`Isi pilihan ${opt.key}...`}
                        className="flex-grow bg-[#f8f3e9] border border-[#0a0a0a]/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0a0a0a]"
                      />
                      {newOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteNewOption(idx)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg shrink-0 cursor-pointer transition-colors"
                          title="Hapus Pilihan"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Answer Key Selection */}
            <div>
              <label className="block text-xs font-bold uppercase text-[#6a6a6a] mb-1">Kunci Jawaban Benar</label>
              <select
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-full bg-[#f8f3e9] border border-[#0a0a0a]/10 rounded-xl p-2.5 text-xs font-bold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
              >
                {newOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    Pilihan {opt.key} {opt.text ? `— ${opt.text}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-[#0a0a0a]/10">
              <button
                type="button"
                onClick={resetAddModal}
                className="w-1/2 py-2.5 bg-[#ebe6d6] hover:bg-[#e7e2d8] rounded-xl font-bold text-xs text-[#0a0a0a] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddManualQuestion}
                className="w-1/2 py-2.5 bg-[#0a0a0a] hover:bg-[#0a0a0a]/90 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md"
              >
                Tambah Soal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0a0a0a]/60 blur-backdrop" onClick={() => setEditingQuestion(null)} />
          <div className="relative bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 clay-shadow z-10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#0a0a0a]/10 pb-3">
              <h3 className="text-xl font-bold text-[#0a0a0a]">Ubah Soal ({editingQuestion.id})</h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-[#6a6a6a] hover:text-[#0a0a0a] transition-colors p-1"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Question Text Input */}
            <div>
              <label className="block text-xs font-bold uppercase text-[#6a6a6a] mb-1">Teks Soal</label>
              <textarea
                value={editingQuestion.questionText}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, questionText: e.target.value, isError: false })
                }
                className="w-full bg-[#f8f3e9] border border-[#0a0a0a]/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[#0a0a0a]"
                rows={3}
                placeholder="Masukkan teks soal..."
              />
            </div>

            {/* Question Image Attachment */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase text-[#6a6a6a]">Gambar / Diagram Soal (Opsional)</label>
                {editingQuestion.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setEditingQuestion({ ...editingQuestion, imageUrl: undefined, isError: false })}
                    className="text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    <span>Hapus Gambar</span>
                  </button>
                )}
              </div>

              {editingQuestion.imageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-[#0a0a0a]/15 bg-[#f8f3e9] p-2 flex items-center justify-center">
                  <img
                    src={editingQuestion.imageUrl}
                    alt="Preview Gambar Soal"
                    className="max-h-40 max-w-full object-contain rounded-xl"
                  />
                </div>
              ) : (
                <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#f8f3e9] hover:bg-[#ebe6d6] text-[#0a0a0a] border border-dashed border-[#0a0a0a]/30 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
                  <span>Tambah / Unggah Gambar Soal</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Options List Editor */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase text-[#6a6a6a]">Pilihan Jawaban</label>
                <button
                  type="button"
                  onClick={() => {
                    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
                    const currentOpts = editingQuestion.options || [];
                    const rawAdded = [...currentOpts, { key: '', text: '' }];
                    const newOpts = rawAdded.map((opt, i) => ({
                      ...opt,
                      key: letters[i] || `P${i + 1}`
                    }));
                    const validKeys = newOpts.map((o) => o.key);
                    const newKey = validKeys.includes(editingQuestion.key)
                      ? editingQuestion.key
                      : newOpts[0].key;

                    setEditingQuestion({
                      ...editingQuestion,
                      options: newOpts,
                      key: newKey,
                      isError: false
                    });
                  }}
                  className="bg-[#f8f3e9] hover:bg-[#ebe6d6] text-[#0a0a0a] px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-[#0a0a0a]/10 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Tambah Pilihan</span>
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {(editingQuestion.options || []).map((opt, idx) => {
                  const isKey = editingQuestion.key === opt.key;
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${
                        isKey ? 'bg-[#a4d4c5] border-[#0a0a0a] text-[#0a0a0a]' : 'bg-[#ebe6d6] border-transparent text-[#0a0a0a]'
                      }`}>
                        {opt.key}
                      </span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const newOpts = [...(editingQuestion.options || [])];
                          newOpts[idx] = { ...newOpts[idx], text: e.target.value };
                          setEditingQuestion({ ...editingQuestion, options: newOpts, isError: false });
                        }}
                        placeholder={`Isi pilihan ${opt.key}...`}
                        className="flex-grow bg-[#f8f3e9] border border-[#0a0a0a]/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0a0a0a]"
                      />
                      {(editingQuestion.options || []).length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
                            const filtered = (editingQuestion.options || []).filter((_, i) => i !== idx);
                            const newOpts = filtered.map((o, i) => ({
                              ...o,
                              key: letters[i] || `P${i + 1}`
                            }));
                            const validKeys = newOpts.map((o) => o.key);
                            const newKey = validKeys.includes(editingQuestion.key)
                              ? editingQuestion.key
                              : (newOpts[0]?.key || 'A');

                            setEditingQuestion({
                              ...editingQuestion,
                              options: newOpts,
                              key: newKey,
                              isError: false
                            });
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg shrink-0 cursor-pointer transition-colors"
                          title="Hapus Pilihan"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Answer Key Selection */}
            <div>
              <label className="block text-xs font-bold uppercase text-[#6a6a6a] mb-1">Kunci Jawaban Benar</label>
              <select
                value={editingQuestion.key}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, key: e.target.value })}
                className="w-full bg-[#f8f3e9] border border-[#0a0a0a]/10 rounded-xl p-2.5 text-xs font-bold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
              >
                {(editingQuestion.options || []).map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    Pilihan {opt.key} {opt.text ? `— ${opt.text}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-[#0a0a0a]/10">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="w-1/2 py-2.5 bg-[#ebe6d6] hover:bg-[#e7e2d8] rounded-xl font-bold text-xs text-[#0a0a0a] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEditQuestion}
                className="w-1/2 py-2.5 bg-[#0a0a0a] hover:bg-[#0a0a0a]/90 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
