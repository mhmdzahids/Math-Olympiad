import React, { useState, useEffect } from 'react';
import { ScreenView, CompetitionRound } from './types';
import { INITIAL_ROUNDS } from './data/mockData';
import { TopNavbar } from './components/TopNavbar';
import { LandingView } from './components/LandingView';
import { RegisterView } from './components/RegisterView';
import { StudentDashboard } from './components/StudentDashboard';
import { QuizExecutionView } from './components/QuizExecutionView';
import { AdminRoundManagerView } from './components/AdminRoundManagerView';
import { AdminLeaderboardView } from './components/AdminLeaderboardView';
import { AdminParticipantDetailView } from './components/AdminParticipantDetailView';
import { Footer } from './components/Footer';
import { apiService, UserOut } from './services/api';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenView>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserOut | null>(null);
  const [authInitialTab, setAuthInitialTab] = useState<'register' | 'login'>('register');
  const initialSdRound = INITIAL_ROUNDS.find((r) => r.category === 'SD') || INITIAL_ROUNDS[0];
  const [selectedRound, setSelectedRound] = useState<string>(initialSdRound ? initialSdRound.title : 'Babak Penyisihan 1 (SD)');
  const [rounds, setRounds] = useState<CompetitionRound[]>(INITIAL_ROUNDS);
  const [activeQuizRound, setActiveQuizRound] = useState<CompetitionRound | null>(null);
  const [isAdminEditingRounds, setIsAdminEditingRounds] = useState<boolean>(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [highlightSaveTrigger, setHighlightSaveTrigger] = useState<number>(0);
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showSwitcherBar, setShowSwitcherBar] = useState<boolean>(false);

  // Global Hotkey Listener: Ctrl + ` (backtick) to toggle MathQuest Screen Switcher bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === '`' || e.code === 'Backquote')) {
        e.preventDefault();
        setShowSwitcherBar((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const [pendingNav, setPendingNav] = useState<{ screen: ScreenView; tab?: 'register' | 'login' } | null>(null);

  useEffect(() => {
    async function checkSession() {
      const token = apiService.getToken();
      if (token) {
        try {
          const user = await apiService.getMe();
          setCurrentUser(user);
          setIsLoggedIn(true);
          if (user.role === 'admin') {
            setCurrentScreen('admin-leaderboard');
          } else {
            setCurrentScreen('student-dashboard');
          }
        } catch {
          apiService.logout();
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      }
    }

    async function loadRoundsFromDb() {
      try {
        const dbRounds = await apiService.getRounds();
        if (dbRounds && dbRounds.length > 0) {
          const mapped: CompetitionRound[] = dbRounds.map((r) => ({
            id: r.id,
            title: r.name,
            category: r.category.toUpperCase() as 'SD' | 'SMP' | 'SMA',
            questionCount: r.question_count ?? (r.category === 'sma' ? 30 : 25),
            durationMinutes: r.duration_minutes,
            tabSwitchLimit: r.tab_switch_limit,
            isRandomized: r.is_randomized ?? true,
            status: (() => {
              if (r.status === 'draft' || r.status === 'belum_dibuka') return 'upcoming';
              if (r.end_date) {
                const eDate = r.end_date;
                const eTime = r.end_time || '18:00';
                const endDt = new Date(`${eDate}T${eTime}:00`);
                if (new Date() > endDt) return 'completed';
                return 'active';
              }
              return r.status === 'aktif' ? 'active' : 'completed';
            })(),
            executionMode: r.mode,
            isOfflineStarted: r.is_offline_started,
            startDate: r.start_date,
            startTime: r.start_time,
            endDate: r.end_date,
            endTime: r.end_time,
          }));
          setRounds(mapped);
          const topSd = mapped.find((r) => r.category === 'SD') || mapped[0];
          if (topSd) {
            setSelectedRound(topSd.title);
          }
        }
      } catch (err) {
        console.warn('Fallback to local rounds:', err);
      }
    }

    checkSession();
    loadRoundsFromDb();
  }, []);

  const handleLoginSuccess = (user: UserOut) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    if (user.role === 'admin') {
      setCurrentScreen('admin-leaderboard');
    } else {
      setCurrentScreen('student-dashboard');
    }
  };

  const handleLogout = () => {
    apiService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentScreen('landing');
  };

  const handleNavigate = (screen: ScreenView, tab?: 'register' | 'login') => {
    let targetScreen = screen;
    if (screen === 'student-dashboard' && currentUser?.role === 'admin') {
      targetScreen = 'admin-leaderboard';
    }

    if (isAdminEditingRounds && targetScreen !== currentScreen) {
      setPendingNav({ screen: targetScreen, tab });
      return;
    }
    if (tab) {
      setAuthInitialTab(tab);
    }
    setCurrentScreen(targetScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmLeave = () => {
    if (pendingNav) {
      setIsAdminEditingRounds(false);
      if (pendingNav.tab) {
        setAuthInitialTab(pendingNav.tab);
      }
      setCurrentScreen(pendingNav.screen);
      setPendingNav(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancelLeave = () => {
    setPendingNav(null);
    setHighlightSaveTrigger((prev) => prev + 1);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (authModal === 'login') {
        await apiService.login(authEmail, authPass);
      } else {
        await apiService.register({
          email: authEmail,
          password: authPass,
          full_name: authEmail.split('@')[0] || 'Peserta Baru',
          school_name: 'Sekolah Participant',
          category: 'sma',
        });
        await apiService.login(authEmail, authPass);
      }
      const user = await apiService.getMe();
      handleLoginSuccess(user);
      setAuthModal(null);
    } catch (err: any) {
      setAuthError(err.message || 'Proses otentikasi gagal.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fef9ef] flex flex-col font-sans antialiased text-[#1d1c16]">
      {/* Quick Screen Selector Toolbar (Floating Bar at top for instant screen testing — Toggleable via Ctrl + `) */}
      {showSwitcherBar && (
        <div className="bg-[#0a0a0a] text-white text-xs py-2 px-4 flex flex-wrap justify-between items-center gap-2 border-b border-white/10 z-50 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 font-bold text-[#e8b94a]">
            <span className="material-symbols-outlined text-[16px]">touch_app</span>
            <span>MathQuest Screen Switcher:</span>
            <span className="text-[10px] bg-white/15 text-white/70 px-1.5 py-0.5 rounded-md font-mono border border-white/15">
              Ctrl + `
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleNavigate('landing')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                currentScreen === 'landing'
                  ? 'bg-[#ff4d8b] text-white shadow-xs'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              1. Landing
            </button>
            <button
              onClick={() => handleNavigate('register')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                currentScreen === 'register'
                  ? 'bg-[#ff6b5a] text-white shadow-xs'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              2. Register / Login Page
            </button>
            <button
              onClick={() => handleNavigate('student-dashboard')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                currentScreen === 'student-dashboard'
                  ? 'bg-[#a4d4c5] text-[#0a0a0a] shadow-xs'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              3. Student Dashboard
            </button>
            <button
              onClick={() => handleNavigate('quiz')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                currentScreen === 'quiz'
                  ? 'bg-[#feaf83] text-[#0a0a0a] shadow-xs'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              4. Quiz Focus Mode
            </button>
            <button
              onClick={() => handleNavigate('admin-rounds')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                currentScreen === 'admin-rounds'
                  ? 'bg-[#b8a4ed] text-[#0a0a0a] shadow-xs'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              5. Admin Round Manager
            </button>
            <button
              onClick={() => handleNavigate('admin-leaderboard')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                currentScreen === 'admin-leaderboard'
                  ? 'bg-[#e8b94a] text-[#0a0a0a] shadow-xs'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              6. Admin Leaderboard
            </button>
          </div>
        </div>
      )}

      {/* Shared Navigation Bar */}
      <TopNavbar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        selectedRound={selectedRound}
        onSelectRound={(r) => setSelectedRound(r)}
        rounds={rounds}
        isLoggedIn={isLoggedIn}
        userName={
          currentUser?.role === 'admin'
            ? 'Admin Officer'
            : currentUser?.participant?.full_name || currentUser?.email || 'Peserta'
        }
        userCategory={
          currentUser?.role === 'admin'
            ? 'Administrator'
            : currentUser?.participant?.category === 'sd'
            ? 'SD Category'
            : currentUser?.participant?.category === 'smp'
            ? 'SMP Category'
            : 'SMA Category'
        }
        onLogout={handleLogout}
        variant={
          currentUser?.role === 'admin' || currentScreen.startsWith('admin')
            ? 'admin'
            : isLoggedIn || currentScreen === 'student-dashboard'
            ? 'student'
            : 'default'
        }
        onOpenAuthModal={(type) => {
          handleNavigate('register', type);
        }}
      />

      {/* Main Screen Content View */}
      <div className="flex-grow">
        {currentScreen === 'landing' && (
          <LandingView
            onNavigate={handleNavigate}
            isLoggedIn={isLoggedIn}
            userRole={currentUser?.role}
          />
        )}

        {currentScreen === 'register' && (
          <RegisterView
            onNavigate={handleNavigate}
            initialTab={authInitialTab}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentScreen === 'student-dashboard' && (
          <StudentDashboard
            onNavigate={handleNavigate}
            studentName={currentUser?.participant?.full_name || currentUser?.email || 'Peserta'}
            studentCategory={
              currentUser?.participant?.category === 'sd'
                ? 'SD'
                : currentUser?.participant?.category === 'smp'
                ? 'SMP'
                : 'SMA'
            }
            rounds={rounds}
            onStartQuiz={(round) => {
              setActiveQuizRound(round);
              handleNavigate('quiz');
            }}
          />
        )}

        {currentScreen === 'quiz' && (
          <QuizExecutionView
            onNavigate={handleNavigate}
            activeRound={activeQuizRound}
            studentCategory={
              currentUser?.participant?.category === 'sd'
                ? 'SD'
                : currentUser?.participant?.category === 'smp'
                ? 'SMP'
                : 'SMA'
            }
          />
        )}

        {currentScreen === 'admin-rounds' && (
          <AdminRoundManagerView
            onNavigate={handleNavigate}
            rounds={rounds}
            onUpdateRounds={setRounds}
            onEditModeChange={setIsAdminEditingRounds}
            highlightSaveTrigger={highlightSaveTrigger}
            selectedRoundTitle={selectedRound}
            onSelectRound={setSelectedRound}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'admin-leaderboard' && (
          <AdminLeaderboardView
            onNavigate={handleNavigate}
            onSelectParticipant={(participantId) => {
              setSelectedParticipantId(participantId);
              handleNavigate('admin-participant-detail');
            }}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'admin-participant-detail' && (
          <AdminParticipantDetailView
            participantId={selectedParticipantId || 'demo-participant-id'}
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        )}
      </div>

      {/* Footer (hidden during quiz execution for concentration) */}
      {currentScreen !== 'quiz' && <Footer onNavigate={handleNavigate} />}

      {/* Bubble Chat Toast Notifications Overlay (Bottom Right) */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Auth Modal Overlay */}
      {authModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0a0a0a]/60 blur-backdrop"
            onClick={() => setAuthModal(null)}
          />
          <div className="relative bg-white max-w-sm w-full rounded-3xl p-6 sm:p-8 clay-shadow z-10 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#0a0a0a]">
                {authModal === 'login' ? 'Login to MathQuest' : 'Create Student Account'}
              </h3>
              <button
                onClick={() => setAuthModal(null)}
                className="text-[#6a6a6a] hover:text-[#0a0a0a]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-[#6a6a6a] mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="student@school.edu"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-[#f8f3e9] border border-[#0a0a0a]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#6a6a6a] mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPass}
                  onChange={(e) => setAuthPass(e.target.value)}
                  className="w-full bg-[#f8f3e9] border border-[#0a0a0a]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0a0a0a] text-white font-bold py-3 rounded-xl clay-shadow transition-all hover:bg-[#0a0a0a]/90 text-sm mt-2 cursor-pointer"
              >
                {authModal === 'login' ? 'Sign In' : 'Register Now'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Unsaved Changes Confirmation Modal Pop-up */}
      {pendingNav && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={handleCancelLeave}
          />
          <div className="relative bg-[#fef9ef] max-w-md w-full rounded-3xl p-6 sm:p-7 border-2 border-[#0a0a0a] shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ff6b5a]/20 border-2 border-[#0a0a0a] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#ff6b5a] text-2xl">warning</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0a0a0a] leading-snug">
                  Perubahan Belum Disimpan!
                </h3>
                <p className="text-xs text-[#6a6a6a] font-medium mt-1 leading-relaxed">
                  Anda sedang berada dalam <strong className="text-[#0a0a0a]">Mode Edit Babak</strong>. Perubahan yang Anda buat belum disimpan dan akan dibatalkan jika Anda meninggalkan halaman ini.
                </p>
              </div>
            </div>

            <div className="bg-[#fff3d6] border border-[#0a0a0a]/15 rounded-2xl p-3 text-xs text-[#0a0a0a] font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#e8b94a] shrink-0">info</span>
              <span>Klik "Simpan Pengaturan" di halaman babak jika ingin menyimpan perubahan.</span>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCancelLeave}
                className="flex-1 bg-[#a4d4c5] hover:bg-[#8cc4b3] text-[#0a0a0a] font-extrabold py-3 px-4 rounded-xl border-2 border-[#0a0a0a] shadow-xs transition-all text-xs cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">save</span>
                <span>Kembali untuk Simpan Pengaturan</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                className="flex-1 bg-[#ff6b5a] hover:bg-[#e05848] text-white font-extrabold py-3 px-4 rounded-xl border-2 border-[#0a0a0a] shadow-2xs transition-all text-xs cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Tinggalkan Halaman</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
