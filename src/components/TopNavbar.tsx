import React, { useState, useEffect } from 'react';
import { ScreenView, CompetitionRound } from '../types';
import { ASSET_IMAGES, INITIAL_ROUNDS } from '../data/mockData';

interface TopNavbarProps {
  currentScreen: ScreenView;
  onNavigate: (screen: ScreenView) => void;
  selectedRound?: string;
  onSelectRound?: (round: string) => void;
  rounds?: CompetitionRound[];
  variant?: 'student' | 'admin' | 'quiz' | 'default';
  onOpenAuthModal?: (type: 'login' | 'register') => void;
  isLoggedIn?: boolean;
  userName?: string;
  userCategory?: string;
  onLogout?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentScreen,
  onNavigate,
  selectedRound = 'Penyisihan 2 - SMA',
  onSelectRound,
  rounds = INITIAL_ROUNDS,
  variant = 'default',
  onOpenAuthModal,
  isLoggedIn = false,
  userName = 'Andi Pratama',
  userCategory = 'Kategori SMA',
  onLogout
}) => {
  const [roundDropdownOpen, setRoundDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeCategoryHover, setActiveCategoryHover] = useState<'SD-SMP' | 'SMA' | null>('SD-SMP');
  const [activeSection, setActiveSection] = useState<'schedule' | 'categories' | 'rules' | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative')) {
        setRoundDropdownOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (currentScreen !== 'landing') {
      setActiveSection(null);
      return;
    }

    const handleScroll = () => {
      const scheduleEl = document.getElementById('schedule-section');
      const categoriesEl = document.getElementById('categories-section');
      const rulesEl = document.getElementById('rules-section');

      const scrollPos = window.scrollY;
      const windowHeight = window.innerHeight;

      if (rulesEl) {
        const rulesRect = rulesEl.getBoundingClientRect();
        if (rulesRect.top <= windowHeight * 0.45 && rulesRect.bottom >= 150) {
          setActiveSection('rules');
          return;
        }
      }

      if (categoriesEl) {
        const catRect = categoriesEl.getBoundingClientRect();
        if (catRect.top <= windowHeight * 0.45 && catRect.bottom >= 150) {
          setActiveSection('categories');
          return;
        }
      }

      if (scheduleEl) {
        const schedRect = scheduleEl.getBoundingClientRect();
        if (schedRect.top <= windowHeight * 0.45 && schedRect.bottom >= 150) {
          setActiveSection('schedule');
          return;
        }
      }

      if (scrollPos < 300) {
        setActiveSection(null);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentScreen]);

  // If we are in quiz focus mode, render the custom dark top bar
  if (variant === 'quiz' || currentScreen === 'quiz') {
    return null; // Quiz has its own specialized header in QuizExecutionView
  }

  return (
    <header className="w-full sticky top-0 z-40 bg-[#fef9ef]/90 backdrop-blur-md border-b border-[#0a0a0a]/5 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Left Section: Brand & Global Round Dropdown */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button 
            onClick={() => onNavigate('landing')} 
            className="flex items-center text-left focus:outline-none group"
          >
            <img 
              src={ASSET_IMAGES.logo} 
              alt="MathOlympiad" 
              className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105" 
              referrerPolicy="no-referrer"
            />
          </button>

          {variant === 'admin' && (
            <>
              <div className="h-6 w-[1px] bg-[#c4c7c7] hidden sm:block" />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setRoundDropdownOpen(!roundDropdownOpen);
                    setProfileDropdownOpen(false);
                    if (!roundDropdownOpen) setActiveCategoryHover('SD-SMP');
                  }}
                  className="flex items-center gap-1.5 bg-[#f5f0e0] border border-[#0a0a0a]/10 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-[#0a0a0a] hover:bg-[#ebe6d6] transition-all shadow-2xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#0a0a0a]">school</span>
                  <span>{selectedRound}</span>
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </button>

                {roundDropdownOpen && (
                  <div className="absolute left-0 mt-2 flex flex-col sm:flex-row gap-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* Main Categories Menu */}
                    <div className="w-56 bg-white rounded-2xl shadow-2xl border border-[#0a0a0a]/10 p-2 space-y-1">
                      <div className="px-3 py-1.5 text-[10px] font-black uppercase text-[#6a6a6a] tracking-wider border-b border-[#0a0a0a]/5 mb-1">
                        Kategori Lomba
                      </div>

                      {/* SD-SMP Category Item */}
                      <div
                        onMouseEnter={() => setActiveCategoryHover('SD-SMP')}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          activeCategoryHover === 'SD-SMP'
                            ? 'bg-[#a4d4c5] text-[#0a0a0a] shadow-2xs'
                            : 'hover:bg-[#f8f3e9] text-[#0a0a0a]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base">child_care</span>
                          <span>SD - SMP</span>
                        </div>
                        <span className="material-symbols-outlined text-base">chevron_right</span>
                      </div>

                      {/* SMA Category Item */}
                      <div
                        onMouseEnter={() => setActiveCategoryHover('SMA')}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          activeCategoryHover === 'SMA'
                            ? 'bg-[#b8a4ed] text-[#0a0a0a] shadow-2xs'
                            : 'hover:bg-[#f8f3e9] text-[#0a0a0a]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base">workspace_premium</span>
                          <span>SMA</span>
                        </div>
                        <span className="material-symbols-outlined text-base">chevron_right</span>
                      </div>
                    </div>

                    {/* Flyout Submenu for Rounds */}
                    {activeCategoryHover && (
                      <div className="w-64 bg-white rounded-2xl shadow-2xl border border-[#0a0a0a]/10 p-2 space-y-1 animate-in fade-in slide-in-from-left-2 duration-150">
                        <div className="px-3 py-1.5 text-[10px] font-black uppercase text-[#6a6a6a] tracking-wider border-b border-[#0a0a0a]/5 mb-1 flex items-center justify-between">
                          <span>Babak {activeCategoryHover}</span>
                          <span className="text-[9px] bg-[#0a0a0a]/10 px-1.5 py-0.5 rounded-full text-[#0a0a0a] font-bold">
                            {rounds.filter((r) => (r.category || 'SMA') === activeCategoryHover).length} Babak
                          </span>
                        </div>

                        <div className="space-y-1 max-h-60 overflow-y-auto">
                          {rounds
                            .filter((r) => (r.category || 'SMA') === activeCategoryHover)
                            .map((r) => {
                              const isSelected = selectedRound === r.title;
                              return (
                                <button
                                  key={r.id}
                                  type="button"
                                  onClick={() => {
                                    if (onSelectRound) onSelectRound(r.title);
                                    setRoundDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-start gap-2 cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#0a0a0a] text-white shadow-2xs'
                                      : 'hover:bg-[#f8f3e9] text-[#0a0a0a]'
                                  }`}
                                >
                                  <span className={`material-symbols-outlined text-base shrink-0 mt-0.5 ${
                                    isSelected ? 'text-[#a4d4c5]' : 'text-[#6a6a6a]'
                                  }`}>
                                    {r.isFinal ? 'emoji_events' : 'flag'}
                                  </span>
                                  <div className="flex-1">
                                    <div className="line-clamp-2 leading-tight">{r.title}</div>
                                    <div className={`text-[10px] mt-0.5 font-semibold ${isSelected ? 'text-white/70' : 'text-[#6a6a6a]'}`}>
                                      {r.questionCount} Soal • {r.durationMinutes}m
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Center Section: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {variant === 'admin' || currentScreen.startsWith('admin') ? (
            <>
              <button
                onClick={() => onNavigate('admin-leaderboard')}
                className={`font-semibold text-sm transition-all pb-0.5 ${
                  currentScreen === 'admin-leaderboard'
                    ? 'text-[#0a0a0a] border-b-2 border-[#0a0a0a]'
                    : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('admin-rounds')}
                className={`font-semibold text-sm transition-all pb-0.5 ${
                  currentScreen === 'admin-rounds'
                    ? 'text-[#0a0a0a] border-b-2 border-[#0a0a0a]'
                    : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                }`}
              >
                Kelola Babak
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setActiveSection('schedule');
                  if (currentScreen === 'landing') {
                    const el = document.getElementById('schedule-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onNavigate('landing');
                    setTimeout(() => {
                      const el = document.getElementById('schedule-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
                className={`font-semibold text-sm transition-all pb-0.5 ${
                  currentScreen === 'landing' && activeSection === 'schedule'
                    ? 'text-[#0a0a0a] border-b-2 border-[#0a0a0a]'
                    : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                }`}
              >
                Jadwal
              </button>
              <button
                onClick={() => {
                  setActiveSection('categories');
                  if (currentScreen === 'landing') {
                    const el = document.getElementById('categories-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onNavigate('landing');
                    setTimeout(() => {
                      const el = document.getElementById('categories-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
                className={`font-semibold text-sm transition-all pb-0.5 ${
                  currentScreen === 'landing' && activeSection === 'categories'
                    ? 'text-[#0a0a0a] border-b-2 border-[#0a0a0a]'
                    : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                }`}
              >
                Kategori
              </button>
              <button
                onClick={() => {
                  setActiveSection('rules');
                  if (currentScreen === 'landing') {
                    const el = document.getElementById('rules-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onNavigate('landing');
                    setTimeout(() => {
                      const el = document.getElementById('rules-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
                className={`font-semibold text-sm transition-all pb-0.5 ${
                  currentScreen === 'landing' && activeSection === 'rules'
                    ? 'text-[#0a0a0a] border-b-2 border-[#0a0a0a]'
                    : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                }`}
              >
                Aturan
              </button>
            </>
          )}
        </nav>

        {/* Right Section: User Profile or Auth / Admin Switcher */}
        <div className="flex items-center gap-2 sm:gap-4">
          {variant === 'admin' ? (
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setRoundDropdownOpen(false);
                }}
                className="flex items-center gap-3 cursor-pointer group focus:outline-none"
              >
                <div className="hidden sm:flex flex-col items-end">
                  <span className="font-semibold text-sm text-[#0a0a0a] leading-tight">Admin Officer</span>
                  <span className="bg-[#6b42c9] text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Administrator
                  </span>
                </div>
                <div className="relative">
                  <img
                    src={ASSET_IMAGES.avatarAndi}
                    alt="Admin Avatar"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border-2 border-[#b8a4ed] shadow-xs group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#6b42c9] text-white rounded-full flex items-center justify-center border border-white">
                    <span className="material-symbols-outlined text-[10px]">shield</span>
                  </div>
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#0a0a0a]/10 rounded-2xl shadow-lg py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-[#0a0a0a]/10 mb-1 sm:hidden">
                    <p className="font-bold text-xs text-[#0a0a0a]">Admin Officer</p>
                    <p className="text-[10px] text-[#6b42c9] font-bold uppercase">Administrator</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigate('admin-leaderboard');
                    }}
                    className={`md:hidden w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-colors ${
                      currentScreen === 'admin-leaderboard' ? 'bg-[#f5f0e0] text-[#0a0a0a] font-bold' : 'text-[#6a6a6a] hover:bg-[#f5f0e0] hover:text-[#0a0a0a]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">dashboard</span>
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigate('admin-rounds');
                    }}
                    className={`md:hidden w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-colors ${
                      currentScreen === 'admin-rounds' ? 'bg-[#f5f0e0] text-[#0a0a0a] font-bold' : 'text-[#6a6a6a] hover:bg-[#f5f0e0] hover:text-[#0a0a0a]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">tune</span>
                    <span>Kelola Babak</span>
                  </button>
                  <hr className="my-1 border-[#0a0a0a]/10 md:hidden" />
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigate('landing');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-[#ff6b5a] hover:bg-[#ff6b5a]/10 flex items-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    <span>Keluar Admin</span>
                  </button>
                </div>
              )}
            </div>
          ) : variant === 'student' || isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setRoundDropdownOpen(false);
                }}
                className="flex items-center gap-3 cursor-pointer group focus:outline-none"
              >
                <div className="hidden sm:flex flex-col items-end">
                  <span className="font-semibold text-sm text-[#0a0a0a] leading-tight">{userName}</span>
                  <span className="bg-[#1a3a3a] text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {userCategory}
                  </span>
                </div>
                <img
                  src={ASSET_IMAGES.avatarAndi}
                  alt="User Avatar"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border-2 border-[#e7e2d8] shadow-xs group-hover:scale-105 transition-transform"
                />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#0a0a0a]/10 rounded-2xl shadow-lg py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-[#0a0a0a]/10 mb-1 sm:hidden">
                    <p className="font-bold text-xs text-[#0a0a0a]">{userName}</p>
                    <p className="text-[10px] text-[#1a3a3a] font-bold uppercase">{userCategory}</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigate('student-dashboard');
                    }}
                    className={`md:hidden w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-colors ${
                      currentScreen === 'student-dashboard' ? 'bg-[#f5f0e0] text-[#0a0a0a] font-bold' : 'text-[#6a6a6a] hover:bg-[#f5f0e0] hover:text-[#0a0a0a]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">dashboard</span>
                    <span>Dashboard</span>
                  </button>
                  <hr className="my-1 border-[#0a0a0a]/10 md:hidden" />
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      if (onLogout) onLogout();
                      onNavigate('landing');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-[#ff6b5a] hover:bg-[#ff6b5a]/10 flex items-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    <span>Keluar</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (onOpenAuthModal) onOpenAuthModal('login');
                  onNavigate('register');
                }}
                className="bg-[#ebe6d6] hover:bg-[#e7e2d8] text-[#0a0a0a] px-3 sm:px-4 py-1.5 rounded-xl font-semibold text-xs sm:text-sm clay-shadow-sm clay-button-active transition-all"
              >
                Masuk
              </button>
              <button
                onClick={() => {
                  if (onOpenAuthModal) onOpenAuthModal('register');
                  onNavigate('register');
                }}
                className="bg-[#0a0a0a] hover:bg-[#0a0a0a]/90 text-white px-3 sm:px-4 py-1.5 rounded-xl font-semibold text-xs sm:text-sm clay-shadow-sm clay-button-active transition-all"
              >
                Daftar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
