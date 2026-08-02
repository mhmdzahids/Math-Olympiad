import React, { useState } from 'react';
import { ScreenView, CompetitionRound } from './types';
import { INITIAL_ROUNDS } from './data/mockData';
import { TopNavbar } from './components/TopNavbar';
import { LandingView } from './components/LandingView';
import { RegisterView } from './components/RegisterView';
import { StudentDashboard } from './components/StudentDashboard';
import { QuizExecutionView } from './components/QuizExecutionView';
import { AdminRoundManagerView } from './components/AdminRoundManagerView';
import { AdminLeaderboardView } from './components/AdminLeaderboardView';
import { Footer } from './components/Footer';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenView>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [authInitialTab, setAuthInitialTab] = useState<'register' | 'login'>('register');
  const [selectedRound, setSelectedRound] = useState<string>('Penyisihan 2 - SMA');
  const [rounds, setRounds] = useState<CompetitionRound[]>(INITIAL_ROUNDS);
  const [registeredUser, setRegisteredUser] = useState<any>({
    fullName: 'Andi Pratama',
    category: 'SMA'
  });
  const [isAdminEditingRounds, setIsAdminEditingRounds] = useState<boolean>(false);
  const [highlightSaveTrigger, setHighlightSaveTrigger] = useState<number>(0);
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');

  const [pendingNav, setPendingNav] = useState<{ screen: ScreenView; tab?: 'register' | 'login' } | null>(null);

  const handleNavigate = (screen: ScreenView, tab?: 'register' | 'login') => {
    if (isAdminEditingRounds && screen !== currentScreen) {
      setPendingNav({ screen, tab });
      return;
    }
    if (tab) {
      setAuthInitialTab(tab);
    }
    setCurrentScreen(screen);
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

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authModal === 'register') {
      setRegisteredUser({
        fullName: authEmail.split('@')[0] || 'Andi Pratama',
        category: 'SMA'
      });
    }
    setIsLoggedIn(true);
    setAuthModal(null);
    setCurrentScreen('student-dashboard');
  };

  return (
    <div className="min-h-screen bg-[#fef9ef] flex flex-col font-sans antialiased text-[#1d1c16]">
      {/* Quick Screen Selector Toolbar (Floating Bar at top for instant screen testing) */}
      <div className="bg-[#0a0a0a] text-white text-xs py-2 px-4 flex flex-wrap justify-between items-center gap-2 border-b border-white/10 z-50">
        <div className="flex items-center gap-2 font-bold text-[#e8b94a]">
          <span className="material-symbols-outlined text-[16px]">touch_app</span>
          <span>MathQuest Screen Switcher:</span>
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

      {/* Shared Navigation Bar */}
      <TopNavbar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        selectedRound={selectedRound}
        onSelectRound={(r) => setSelectedRound(r)}
        rounds={rounds}
        isLoggedIn={isLoggedIn}
        userName={registeredUser?.fullName || 'Andi Pratama'}
        userCategory={registeredUser?.category ? `${registeredUser.category} Category` : 'SMA Category'}
        onLogout={() => setIsLoggedIn(false)}
        variant={
          currentScreen === 'student-dashboard'
            ? 'student'
            : currentScreen.startsWith('admin')
            ? 'admin'
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
            onRegisterSuccess={(data) => {
              setRegisteredUser(data);
              setIsLoggedIn(true);
            }}
          />
        )}

        {currentScreen === 'register' && (
          <RegisterView
            onNavigate={handleNavigate}
            initialTab={authInitialTab}
            onRegisterSuccess={(data) => {
              setRegisteredUser(data);
              setIsLoggedIn(true);
            }}
          />
        )}

        {currentScreen === 'student-dashboard' && (
          <StudentDashboard
            onNavigate={handleNavigate}
            studentName={registeredUser?.fullName || 'Andi'}
            studentCategory={registeredUser?.category || 'SMA'}
            rounds={rounds}
          />
        )}

        {currentScreen === 'quiz' && (
          <QuizExecutionView onNavigate={handleNavigate} />
        )}

        {currentScreen === 'admin-rounds' && (
          <AdminRoundManagerView
            onNavigate={handleNavigate}
            rounds={rounds}
            onUpdateRounds={setRounds}
            onEditModeChange={setIsAdminEditingRounds}
            highlightSaveTrigger={highlightSaveTrigger}
          />
        )}

        {currentScreen === 'admin-leaderboard' && (
          <AdminLeaderboardView onNavigate={handleNavigate} />
        )}
      </div>

      {/* Footer (hidden during quiz execution for concentration) */}
      {currentScreen !== 'quiz' && <Footer onNavigate={handleNavigate} />}

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
