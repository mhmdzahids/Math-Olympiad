import React, { useState, useEffect } from 'react';
import { ScreenView } from '../types';
import { ASSET_IMAGES, COMPETITION_INFO } from '../data/mockData';
import { apiService, UserOut } from '../services/api';

interface RegisterViewProps {
  onNavigate: (screen: ScreenView) => void;
  onRegisterSuccess?: (userData: any) => void;
  onLoginSuccess?: (user: UserOut) => void;
  initialTab?: 'register' | 'login';
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onNavigate,
  onRegisterSuccess,
  onLoginSuccess,
  initialTab = 'register'
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>(initialTab);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [regType, setRegType] = useState<'individu' | 'guru'>('individu');

  // Individu fields
  const [fullName, setFullName] = useState('Andi Pratama');
  const [email, setEmail] = useState('andi@sekolah.sch.id');
  const [password, setPassword] = useState('••••••••');
  const [school, setSchool] = useState('SMA Negeri 1 Cirebon');
  const [category, setCategory] = useState<'SD' | 'SMP' | 'SMA'>('SMA');
  const [grade, setGrade] = useState('Kelas 10 (SMA)');

  // Guru / Kolektif fields
  const [teacherName, setTeacherName] = useState('Bpk. Budi Santoso, S.Pd.');
  const [teacherPhone, setTeacherPhone] = useState('081234567890');
  const [studentsList, setStudentsList] = useState<Array<{ id: string; name: string; category: 'SD' | 'SMP' | 'SMA'; grade: string }>>([
    { id: '1', name: 'Andi Pratama', category: 'SMA', grade: 'Kelas 10 (SMA)' },
    { id: '2', name: 'Siti Rahma', category: 'SMP', grade: 'Kelas 8 (SMP)' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const sdGrades = ['Kelas 1 (SD)', 'Kelas 2 (SD)', 'Kelas 3 (SD)', 'Kelas 4 (SD)', 'Kelas 5 (SD)', 'Kelas 6 (SD)'];
  const smpGrades = ['Kelas 7 (SMP)', 'Kelas 8 (SMP)', 'Kelas 9 (SMP)'];
  const smaGrades = ['Kelas 10 (SMA/SMK)', 'Kelas 11 (SMA/SMK)', 'Kelas 12 (SMA/SMK)'];

  const handleCategoryChange = (newCat: 'SD' | 'SMP' | 'SMA') => {
    setCategory(newCat);
    if (newCat === 'SD') setGrade('Kelas 5 (SD)');
    else if (newCat === 'SMP') setGrade('Kelas 7 (SMP)');
    else setGrade('Kelas 10 (SMA/SMK)');
  };

  const addStudent = () => {
    setStudentsList((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: '',
        category: 'SMA',
        grade: 'Kelas 10 (SMA/SMK)'
      }
    ]);
  };

  const removeStudent = (id: string) => {
    if (studentsList.length <= 1) return;
    setStudentsList((prev) => prev.filter((s) => s.id !== id));
  };

  const updateStudent = (id: string, field: 'name' | 'category' | 'grade', value: string) => {
    setStudentsList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          if (field === 'category') {
            const newCat = value as 'SD' | 'SMP' | 'SMA';
            const defaultGrade = newCat === 'SD' ? 'Kelas 5 (SD)' : newCat === 'SMP' ? 'Kelas 7 (SMP)' : 'Kelas 10 (SMA/SMK)';
            return { ...s, category: newCat, grade: defaultGrade };
          }
          return { ...s, [field]: value };
        }
        return s;
      })
    );
  };

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await apiService.login(loginEmail, loginPass);
      const user = await apiService.getMe();
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
      if (user.role === 'admin') {
        onNavigate('admin-leaderboard');
      } else {
        onNavigate('student-dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login gagal. Periksa kembali email dan password Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (activeTab === 'login') {
      await executeLogin(email, password);
      return;
    }

    setIsSubmitting(true);
    try {
      const regCategory = category === 'SD' ? 'sd' : category === 'SMP' ? 'smp' : 'sma';
      await apiService.register({
        email,
        password,
        full_name: fullName,
        school_name: school,
        category: regCategory,
        grade,
      });

      // Auto login after successful registration
      await executeLogin(email, password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registrasi gagal. Periksa kembali data Anda.');
      setIsSubmitting(false);
    }
  };

  const getFeeInfo = (cat: 'SD' | 'SMP' | 'SMA') => {
    if (cat === 'SD') return COMPETITION_INFO.fees.sd;
    if (cat === 'SMP') return COMPETITION_INFO.fees.smp;
    return COMPETITION_INFO.fees.sma;
  };

  return (
    <div className="w-full bg-[#fef9ef] min-h-[calc(100vh-80px)] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl relative">
        <div className="absolute -top-7 -right-4 w-16 h-16 bg-[#e8b94a] rounded-full flex items-center justify-center clay-shadow z-20 hidden sm:flex">
          <span className="material-symbols-outlined text-white text-2xl">emoji_events</span>
        </div>

        <div className="bg-white rounded-[32px] p-6 sm:p-10 clay-shadow border border-[#e7e2d8] relative z-10">
          {/* Header Banner */}
          <div className="mb-8 rounded-2xl overflow-hidden border-2 border-[#feaf83]/60 shadow-md bg-[#fffaf0]">
            <img
              src={ASSET_IMAGES.competitionBanner}
              alt="OPTIMA MATRIX 2026 Banner"
              className="w-full h-auto object-cover max-h-48 sm:max-h-56"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0a0a0a] tracking-tight mt-2">
              {activeTab === 'register' ? 'Pendaftaran Peserta' : 'Masuk Portal Kuis'}
            </h1>
            <p className="text-xs sm:text-sm text-[#6a6a6a] mt-1.5">
              {activeTab === 'register'
                ? 'Daftar sebagai peserta OPTIMA 2026 Se-Pulau Jawa (SD/MI, SMP/MTs, SMA/SMK/MA).'
                : 'Masuk dengan email Anda untuk memulai pengerjaan babak kuis.'}
            </p>

            {/* Tab Pill Switcher */}
            <div className="inline-flex bg-[#f8f3e9] p-1.5 rounded-2xl border border-[#0a0a0a]/10 mt-5 gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'register'
                  ? 'bg-[#0a0a0a] text-white shadow-md'
                  : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                  }`}
              >
                Formulir Pendaftaran
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'login'
                  ? 'bg-[#0a0a0a] text-white shadow-md'
                  : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                  }`}
              >
                Masuk Akun
              </button>
            </div>
          </div>

          <form id="register-form" onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'register' ? (
              <>
                {/* Registration Type */}
                <div>
                  <label className="block text-xs font-bold text-[#0a0a0a] uppercase tracking-wider mb-2.5">
                    Pilih Tipe Pendaftaran
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
                    <button
                      type="button"
                      onClick={() => setRegType('individu')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3.5 ${regType === 'individu'
                        ? 'bg-[#b8a4ed]/25 border-[#0a0a0a] ring-2 ring-[#0a0a0a]/10 shadow-md scale-[1.01]'
                        : 'bg-[#fffaf0] border-[#0a0a0a]/15 text-[#6a6a6a] hover:border-[#0a0a0a]/40 hover:text-[#0a0a0a]'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 mt-0.5 ${regType === 'individu' ? 'bg-[#0a0a0a] text-white' : 'bg-[#0a0a0a]/10 text-[#0a0a0a]'
                        }`}>
                        <span className="material-symbols-outlined text-xl">person</span>
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-[#0a0a0a] flex items-center gap-1.5">
                          <span>Individu</span>
                          <span className="text-[10px] bg-[#b8a4ed] text-[#0a0a0a] px-2 py-0.5 rounded-full font-bold uppercase">Mandiri</span>
                        </div>
                        <div className="text-xs text-[#6a6a6a] mt-1 leading-snug">
                          Pendaftaran siswa secara mandiri per perorangan.
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegType('guru')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3.5 ${regType === 'guru'
                        ? 'bg-[#a4d4c5]/35 border-[#0a0a0a] ring-2 ring-[#0a0a0a]/10 shadow-md scale-[1.01]'
                        : 'bg-[#fffaf0] border-[#0a0a0a]/15 text-[#6a6a6a] hover:border-[#0a0a0a]/40 hover:text-[#0a0a0a]'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 mt-0.5 ${regType === 'guru' ? 'bg-[#0a0a0a] text-white' : 'bg-[#0a0a0a]/10 text-[#0a0a0a]'
                        }`}>
                        <span className="material-symbols-outlined text-xl">groups</span>
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-[#0a0a0a] flex items-center gap-1.5">
                          <span>Kolektif Sekolah</span>
                          <span className="text-[10px] bg-[#a4d4c5] text-[#0a0a0a] px-2 py-0.5 rounded-full font-bold uppercase">Guru</span>
                        </div>
                        <div className="text-xs text-[#6a6a6a] mt-1 leading-snug">
                          Guru pendamping mendaftarkan beberapa siswa sekaligus.
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {regType === 'individu' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-[#0a0a0a] uppercase tracking-wider mb-2">
                          Nama Lengkap Peserta
                        </label>
                        <input
                          type="text"
                          required
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="cth. Andi Pratama"
                          className="w-full bg-[#fffaf0] border-2 border-[#0a0a0a]/15 rounded-xl px-4 py-3 text-sm font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0a0a0a] uppercase tracking-wider mb-2">
                          Alamat Email Aktif
                        </label>
                        <input
                          type="email"
                          required
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="andi@sekolah.sch.id"
                          className="w-full bg-[#fffaf0] border-2 border-[#0a0a0a]/15 rounded-xl px-4 py-3 text-sm font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0a0a0a] uppercase tracking-wider mb-2">
                          Kata Sandi Akun
                        </label>
                        <input
                          type="password"
                          required
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#fffaf0] border-2 border-[#0a0a0a]/15 rounded-xl px-4 py-3 text-sm font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0a0a0a] uppercase tracking-wider mb-2">
                          Asal Sekolah
                        </label>
                        <input
                          type="text"
                          required
                          onChange={(e) => setSchool(e.target.value)}
                          placeholder="SMAN 1 Cirebon"
                          className="w-full bg-[#fffaf0] border-2 border-[#0a0a0a]/15 rounded-xl px-4 py-3 text-sm font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
                        />
                      </div>
                    </div>

                    {/* Category & Grade */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-[#0a0a0a] uppercase tracking-wider">
                        Kategori Jenjang Lomba
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleCategoryChange('SD')}
                          className={`py-2.5 px-2 rounded-xl text-center border-2 transition-all cursor-pointer ${category === 'SD'
                            ? 'bg-[#ffb084] border-[#0a0a0a] text-[#0a0a0a] font-extrabold shadow-sm'
                            : 'bg-[#fffaf0] border-[#0a0a0a]/15 text-[#6a6a6a]'
                            }`}
                        >
                          <div className="text-xs font-bold">SD / MI</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCategoryChange('SMP')}
                          className={`py-2.5 px-2 rounded-xl text-center border-2 transition-all cursor-pointer ${category === 'SMP'
                            ? 'bg-[#b8a4ed] border-[#0a0a0a] text-[#0a0a0a] font-extrabold shadow-sm'
                            : 'bg-[#fffaf0] border-[#0a0a0a]/15 text-[#6a6a6a]'
                            }`}
                        >
                          <div className="text-xs font-bold">SMP / MTs</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCategoryChange('SMA')}
                          className={`py-2.5 px-2 rounded-xl text-center border-2 transition-all cursor-pointer ${category === 'SMA'
                            ? 'bg-[#e8b94a] border-[#0a0a0a] text-[#0a0a0a] font-extrabold shadow-sm'
                            : 'bg-[#fffaf0] border-[#0a0a0a]/15 text-[#6a6a6a]'
                            }`}
                        >
                          <div className="text-xs font-bold">SMA / SMK / MA</div>
                        </button>
                      </div>

                      <div className="bg-[#ebe6d6]/60 p-3 rounded-xl border border-[#0a0a0a]/10 flex items-center justify-between text-xs font-bold">
                        <span>Biaya Pendaftaran ({category}):</span>
                        <span className="text-[#0a0a0a]">
                          Early Bird: <strong>{getFeeInfo(category).earlyBird}</strong> | Reguler: <strong>{getFeeInfo(category).reguler}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Form Kolektif Guru */
                  <div className="space-y-6">
                    <div className="bg-[#a4d4c5]/20 p-4 rounded-2xl border border-[#2c7a65]/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#0a0a0a] uppercase mb-1">Nama Guru Pendamping</label>
                        <input
                          type="text"
                          required
                          onChange={(e) => setTeacherName(e.target.value)}
                          placeholder={teacherName}
                          className="w-full bg-[#fffaf0] border-2 border-[#0a0a0a]/15 rounded-xl px-3 py-2 text-sm font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#0a0a0a] uppercase mb-1">No. WhatsApp Guru</label>
                        <input
                          type="tel"
                          required
                          onChange={(e) => setTeacherPhone(e.target.value)}
                          placeholder={teacherPhone}
                          className="w-full bg-[#fffaf0] border-2 border-[#0a0a0a]/15 rounded-xl px-3 py-2 text-sm font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Required Documents Checklist from Rulebook */}
                <div className="bg-[#fffaf0] rounded-2xl p-4 border-2 border-[#0a0a0a]/10 space-y-2">
                  <div className="text-xs font-black uppercase text-[#0a0a0a] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-[#ff6b5a]">file_present</span>
                    <span>Berkas Persyaratan yang Harus Dilampirkan:</span>
                  </div>
                  <ul className="text-xs text-[#6a6a6a] space-y-1 list-disc pl-4">
                    <li>Kartu Pelajar (KP) / Surat Keterangan Siswa dari Sekolah</li>
                    <li>Surat Rekomendasi Sekolah yang ditandatangani Kepala Sekolah</li>
                    <li>Bukti Pembayaran Biaya Pendaftaran</li>
                  </ul>
                </div>

                {/* Payment Bank Details */}
                <div className="bg-[#ebe6d6]/60 rounded-2xl p-4 border border-[#0a0a0a]/10 space-y-3">
                  <div className="text-xs font-black uppercase text-[#0a0a0a] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-[#0a0a0a]">account_balance_wallet</span>
                    <span>Rekening Pembayaran Biaya Pendaftaran:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {COMPETITION_INFO.paymentMethods.map((pm) => (
                      <div key={pm.bank} className="bg-white p-3 rounded-xl border border-[#0a0a0a]/10 font-medium">
                        <div className="font-extrabold text-[#0a0a0a]">{pm.bank}</div>
                        <div className="font-mono font-bold text-sm text-[#ff6b5a]">{pm.accountNo}</div>
                        <div className="text-[11px] text-[#6a6a6a]">a.n. {pm.accountName}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Login Form */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0a0a0a] uppercase mb-1">Email Peserta / Admin</label>
                  <input
                    type="email"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="peserta@sekolah.sch.id"
                    className="w-full bg-[#fffaf0] border-2 border-[#0a0a0a]/15 rounded-xl px-4 py-3 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0a0a0a] uppercase mb-1">Kata Sandi</label>
                  <input
                    type="password"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#fffaf0] border-2 border-[#0a0a0a]/15 rounded-xl px-4 py-3 text-sm font-semibold"
                  />
                </div>

                {/* Demo Accounts Quick Login Selector */}
                <div className="bg-[#f8f3e9] p-3.5 rounded-2xl border border-[#0a0a0a]/10 space-y-2 mt-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#6a6a6a] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#e8b94a]">bolt</span>
                    <span>Uji Coba Akun Demo (Satu Klik):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('admin@matholympiad.id');
                        setPassword('admin123');
                        executeLogin('admin@matholympiad.id', 'admin123');
                      }}
                      className="bg-[#b8a4ed]/30 hover:bg-[#b8a4ed]/50 text-[#0a0a0a] text-xs font-bold py-2.5 px-3 rounded-xl border border-[#0a0a0a]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base text-[#6b42c9]">admin_panel_settings</span>
                      <span>Masuk sebagai Admin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('andi@sekolah.sch.id');
                        setPassword('peserta123');
                        executeLogin('andi@sekolah.sch.id', 'peserta123');
                      }}
                      className="bg-[#a4d4c5]/30 hover:bg-[#a4d4c5]/50 text-[#0a0a0a] text-xs font-bold py-2.5 px-3 rounded-xl border border-[#0a0a0a]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base text-[#1a3a3a]">school</span>
                      <span>Masuk sebagai Peserta</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="bg-[#ff6b5a]/15 border border-[#ff6b5a] text-[#a82415] rounded-xl p-3.5 text-xs font-bold flex items-start gap-2 animate-in fade-in duration-200">
                <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0a0a0a] hover:bg-[#0a0a0a]/90 text-white font-bold py-4 rounded-2xl clay-shadow transition-all text-base flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Memproses Pendaftaran...</span>
              ) : activeTab === 'register' ? (
                <span>Kirim &amp; Lanjut ke Dashboard</span>
              ) : (
                <span>Masuk ke Dashboard Kuis</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
