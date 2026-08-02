import React, { useState, useEffect } from 'react';
import { ScreenView } from '../types';
import { ASSET_IMAGES } from '../data/mockData';

interface RegisterViewProps {
  onNavigate: (screen: ScreenView) => void;
  onRegisterSuccess?: (userData: any) => void;
  initialTab?: 'register' | 'login';
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onNavigate,
  onRegisterSuccess,
  initialTab = 'register'
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Form states
  const [regType, setRegType] = useState<'individu' | 'guru'>('individu');
  
  // Individu fields
  const [fullName, setFullName] = useState('Alex Johnson');
  const [email, setEmail] = useState('alex@school.edu');
  const [password, setPassword] = useState('••••••••');
  const [school, setSchool] = useState('International Science Academy');
  const [category, setCategory] = useState<'SD-SMP' | 'SMA'>('SD-SMP');
  const [grade, setGrade] = useState('Kelas 7 (SMP)');
  
  // Guru / Kolektif fields
  const [teacherName, setTeacherName] = useState('Bpk. Budi Santoso, S.Pd.');
  const [teacherPhone, setTeacherPhone] = useState('081234567890');
  const [studentsList, setStudentsList] = useState<Array<{ id: string; name: string; category: 'SD-SMP' | 'SMA'; grade: string }>>([
    { id: '1', name: 'Andi Pratama', category: 'SD-SMP', grade: 'Kelas 7 (SMP)' },
    { id: '2', name: 'Siti Rahma', category: 'SD-SMP', grade: 'Kelas 8 (SMP)' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const sdSmpGrades = [
    'Kelas 1 (SD)',
    'Kelas 2 (SD)',
    'Kelas 3 (SD)',
    'Kelas 4 (SD)',
    'Kelas 5 (SD)',
    'Kelas 6 (SD)',
    'Kelas 7 (SMP)',
    'Kelas 8 (SMP)',
    'Kelas 9 (SMP)'
  ];

  const smaGrades = [
    'Kelas 10 (SMA)',
    'Kelas 11 (SMA)',
    'Kelas 12 (SMA)'
  ];

  const handleCategoryChange = (newCategory: 'SD-SMP' | 'SMA') => {
    setCategory(newCategory);
    if (newCategory === 'SD-SMP') {
      if (!sdSmpGrades.includes(grade)) {
        setGrade('Kelas 7 (SMP)');
      }
    } else {
      if (!smaGrades.includes(grade)) {
        setGrade('Kelas 10 (SMA)');
      }
    }
  };

  const addStudent = () => {
    setStudentsList((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: '',
        category: 'SD-SMP',
        grade: 'Kelas 7 (SMP)'
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
            const newCat = value as 'SD-SMP' | 'SMA';
            const defaultGrade = newCat === 'SD-SMP' ? 'Kelas 7 (SMP)' : 'Kelas 10 (SMA)';
            return { ...s, category: newCat, grade: defaultGrade };
          }
          return { ...s, [field]: value };
        }
        return s;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onRegisterSuccess) {
        if (activeTab === 'login') {
          onRegisterSuccess({
            fullName: email.split('@')[0] || 'Andi Pratama',
            email,
            school,
            grade,
            category
          });
        } else if (regType === 'individu') {
          onRegisterSuccess({
            fullName,
            email,
            school,
            grade,
            category,
            regType: 'individu'
          });
        } else {
          onRegisterSuccess({
            fullName: teacherName || 'Bpk/Ibu Guru',
            email,
            school,
            regType: 'guru',
            studentsCount: studentsList.length,
            students: studentsList
          });
        }
      }
      onNavigate('student-dashboard');
    }, 500);
  };

  return (
    <div className="w-full bg-[#fef9ef] min-h-[calc(100vh-80px)] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl relative">
        {/* Decorative Badge */}
        <div className="absolute -top-7 -right-4 w-16 h-16 bg-[#e8b94a] rounded-full flex items-center justify-center clay-shadow z-20 hidden sm:flex">
          <span className="material-symbols-outlined text-white text-2xl">emoji_events</span>
        </div>

        {/* Card Header & Tab Switcher */}
        <div className="bg-white rounded-[32px] p-6 sm:p-10 clay-shadow border border-[#e7e2d8] relative z-10">
          
          {/* Competition Header Banner */}
          <div className="mb-8 rounded-2xl overflow-hidden border-2 border-[#feaf83]/60 shadow-md bg-[#fffaf0]">
            <img 
              src={ASSET_IMAGES.competitionBanner} 
              alt="Olimpiade Prestasi Matematika Banner" 
              className="w-full h-auto object-cover max-h-48 sm:max-h-56"
              referrerPolicy="no-referrer"
            />
          </div>



          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0a0a0a] tracking-tight">
              {activeTab === 'register' ? 'Buat Akun Anda' : 'Selamat Datang Kembali'}
            </h1>
            <p className="text-sm text-[#6a6a6a] mt-2">
              {activeTab === 'register'
                ? 'Bergabunglah dalam ajang Olimpiade Matematika hari ini dan raih prestasi terbaikmu.'
                : 'Masuk untuk mengakses babak kompetisi dan dashboard siswa Anda.'}
            </p>

            {/* Tab Pill Switcher */}
            <div className="inline-flex bg-[#f8f3e9] p-1.5 rounded-2xl border border-[#0a0a0a]/10 mt-6 gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'register'
                    ? 'bg-[#0a0a0a] text-white shadow-md'
                    : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                }`}
              >
                Daftar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'login'
                    ? 'bg-[#0a0a0a] text-white shadow-md'
                    : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                }`}
              >
                Masuk
              </button>
            </div>
          </div>

          {/* Registration / Login Form */}
          <form id="register-form" onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'register' ? (
              <>
                {/* Registration Type Choice */}
                <div>
                  <label className="block text-xs font-bold text-[#0a0a0a] uppercase tracking-wider mb-2.5">
                    Pilih Tipe Pendaftaran
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                    <button
                      type="button"
                      onClick={() => setRegType('individu')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                        regType === 'individu'
                          ? 'bg-[#b8a4ed]/25 border-[#0a0a0a] ring-2 ring-[#0a0a0a]/10 shadow-md scale-[1.01]'
                          : 'bg-[#fffaf0] border-[#0a0a0a]/15 text-[#6a6a6a] hover:border-[#0a0a0a]/40 hover:text-[#0a0a0a]'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                        regType === 'individu' ? 'bg-[#0a0a0a] text-white' : 'bg-[#0a0a0a]/10 text-[#0a0a0a]'
                      }`}>
                        <span className="material-symbols-outlined text-xl">person</span>
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-[#0a0a0a] flex items-center gap-1.5">
                          <span>Individu</span>
                          <span className="text-[10px] bg-[#b8a4ed] text-[#0a0a0a] px-2 py-0.5 rounded-full font-bold uppercase">Mandiri</span>
                        </div>
                        <div className="text-xs text-[#6a6a6a] mt-1 leading-snug">
                          Mendaftar atas nama diri sendiri sebagai peserta lomba.
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegType('guru')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                        regType === 'guru'
                          ? 'bg-[#a4d4c5]/35 border-[#0a0a0a] ring-2 ring-[#0a0a0a]/10 shadow-md scale-[1.01]'
                          : 'bg-[#fffaf0] border-[#0a0a0a]/15 text-[#6a6a6a] hover:border-[#0a0a0a]/40 hover:text-[#0a0a0a]'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                        regType === 'guru' ? 'bg-[#0a0a0a] text-white' : 'bg-[#0a0a0a]/10 text-[#0a0a0a]'
                      }`}>
                        <span className="material-symbols-outlined text-xl">groups</span>
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-[#0a0a0a] flex items-center gap-1.5">
                          <span>Guru / Kolektif</span>
                          <span className="text-[10px] bg-[#a4d4c5] text-[#0a0a0a] px-2 py-0.5 rounded-full font-bold uppercase">Sekolah</span>
                        </div>
                        <div className="text-xs text-[#6a6a6a] mt-1 leading-snug">
                          Mendaftarkan beberapa siswa peserta sekaligus.
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {regType === 'individu' ? (
                  /* Form Pendaftaran Individu */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-bold text-[#0a0a0a] uppercase tracking-wider mb-2">
                          Nama Lengkap Peserta
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="cth. Andi Pratama"
                          className="w-full bg-[#fffaf0] border-2 border-[#0a0a0a]/15 hover:border-[#0a0a0a]/30 rounded-xl px-4 py-3 text-sm font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] focus:ring-2 focus:ring-[#0a0a0a]/10 shadow-xs transition-all placeholder:text-[#6a6a6a]/60"
                        />
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="block text-xs font-bold text-[#0a0a0a] uppercase tracking-wider mb-2">
                          Alamat Email
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="andi@sekolah.sch.id"
                          className="w-full bg-[#fffaf0] border-2 border-[#0a0a0a]/15 hover:border-[#0a0a0a]/30 rounded-xl px-4 py-3 text-sm font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] focus:ring-2 focus:ring-[#0a0a0a]/10 shadow-xs transition-all placeholder:text-[#6a6a6a]/60"
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-xs font-bold text-[#0a0a0a] uppercase tracking-wider mb-2">
                          Kata Sandi Akun
                        </label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#fffaf0] border-2 border-[#0a0a0a]/15 hover:border-[#0a0a0a]/30 rounded-xl px-4 py-3 text-sm font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] focus:ring-2 focus:ring-[#0a0a0a]/10 shadow-xs transition-all placeholder:text-[#6a6a6a]/60"
                        />
                      </div>

                      {/* School Origin */}
                      <div>
                        <label className="block text-xs font-bold text-[#0a0a0a] uppercase tracking-wider mb-2">
                          Asal Sekolah
                        </label>
                        <input
                          type="text"
                          required
                          value={school}
                          onChange={(e) => setSchool(e.target.value)}
                          placeholder="SMA Negeri 1 Jakarta"
                          className="w-full bg-[#fffaf0] border-2 border-[#0a0a0a]/15 hover:border-[#0a0a0a]/30 rounded-xl px-4 py-3 text-sm font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] focus:ring-2 focus:ring-[#0a0a0a]/10 shadow-xs transition-all placeholder:text-[#6a6a6a]/60"
                        />
                      </div>
                    </div>

                    {/* Grade & Category Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                      {/* Category Selection */}
                      <div>
                        <label className="block text-xs font-bold text-[#0a0a0a] uppercase tracking-wider mb-2">
                          Pilihan Kategori
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleCategoryChange('SD-SMP')}
                            className={`py-3 px-2 rounded-xl text-center border-2 transition-all cursor-pointer ${
                              category === 'SD-SMP'
                                ? 'bg-[#b8a4ed] border-[#0a0a0a] text-[#0a0a0a] font-extrabold shadow-md scale-[1.02]'
                                : 'bg-[#fffaf0] border-[#0a0a0a]/15 text-[#6a6a6a] hover:border-[#0a0a0a]/40 hover:text-[#0a0a0a]'
                            }`}
                          >
                            <div className="text-xs font-bold">SD - SMP</div>
                            <div className="text-[10px] uppercase tracking-tight opacity-80 font-semibold">Liga Junior</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCategoryChange('SMA')}
                            className={`py-3 px-2 rounded-xl text-center border-2 transition-all cursor-pointer ${
                              category === 'SMA'
                                ? 'bg-[#a4d4c5] border-[#0a0a0a] text-[#0a0a0a] font-extrabold shadow-md scale-[1.02]'
                                : 'bg-[#fffaf0] border-[#0a0a0a]/15 text-[#6a6a6a] hover:border-[#0a0a0a]/40 hover:text-[#0a0a0a]'
                            }`}
                          >
                            <div className="text-xs font-bold">SMA</div>
                            <div className="text-[10px] uppercase tracking-tight opacity-80 font-semibold">Liga Senior</div>
                          </button>
                        </div>
                      </div>

                      {/* Grade Dropdown */}
                      <div>
                        <label className="block text-xs font-bold text-[#0a0a0a] uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>Kelas / Jenjang Saat Ini</span>
                          <span className="text-[10px] text-[#ff6b5a] font-extrabold">
                            {category === 'SD-SMP' ? 'Kelas 1 - 9' : 'Kelas 10 - 12'}
                          </span>
                        </label>
                        <div className="relative">
                          <select
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full bg-[#fffaf0] border-2 border-[#0a0a0a]/15 hover:border-[#0a0a0a]/30 rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-[#0a0a0a] appearance-none focus:outline-none focus:border-[#0a0a0a] focus:ring-2 focus:ring-[#0a0a0a]/10 shadow-xs cursor-pointer transition-all"
                          >
                            {(category === 'SD-SMP' ? sdSmpGrades : smaGrades).map((g) => (
                              <option key={g} value={g} className="bg-[#fffaf0] text-[#0a0a0a] font-semibold py-1">
                                {g}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#0a0a0a] flex items-center justify-center">
                            <span className="material-symbols-outlined text-xl">expand_more</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Form Pendaftaran Guru / Kolektif */
                  <div className="space-y-6">
                    <div className="bg-[#a4d4c5]/20 p-4 rounded-2xl border border-[#2c7a65]/20">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-[#2c7a65] uppercase tracking-wider mb-3">
                        <span className="material-symbols-outlined text-base">badge</span>
                        <span>Informasi Guru / Pendamping Sekolah</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-[#0a0a0a] uppercase tracking-wider mb-1.5">
                            Nama Lengkap Guru
                          </label>
                          <input
                            type="text"
                            required
                            value={teacherName}
                            onChange={(e) => setTeacherName(e.target.value)}
                            placeholder="cth. Bpk. Budi Santoso, S.Pd."
                            className="w-full bg-[#fffaf0] border-2 border-[#0a0a0a]/15 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#0a0a0a] uppercase tracking-wider mb-1.5">
                            Nomor WhatsApp / HP
                          </label>
                          <input
                            type="tel"
                            required
                            value={teacherPhone}
                            onChange={(e) => setTeacherPhone(e.target.value)}
                            placeholder="cth. 081234567890"
                            className="w-full bg-[#fffaf0] border-2 border-[#0a0a0a]/15 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#0a0a0a] uppercase tracking-wider mb-1.5">
                            Email Guru (Akun Utama)
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="guru@sekolah.sch.id"
                            className="w-full bg-[#fffaf0] border-2 border-[#0a0a0a]/15 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#0a0a0a] uppercase tracking-wider mb-1.5">
                            Asal Sekolah / Instansi
                          </label>
                          <input
                            type="text"
                            required
                            value={school}
                            onChange={(e) => setSchool(e.target.value)}
                            placeholder="SMA Negeri 1 Jakarta"
                            className="w-full bg-[#fffaf0] border-2 border-[#0a0a0a]/15 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
                          />
                        </div>

                        {/* Email Password Dispatch Notice */}
                        <div className="col-span-1 sm:col-span-2 bg-[#ff6b5a]/10 border-2 border-[#ff6b5a]/30 rounded-xl p-3.5 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#ff6b5a] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                            <span className="material-symbols-outlined text-lg">mark_email_unread</span>
                          </div>
                          <div className="text-xs leading-relaxed text-[#0a0a0a]">
                            <span className="font-black uppercase tracking-wider text-[#ff6b5a] block mb-0.5">
                              Catatan Pengiriman Password
                            </span>
                            Password & kata sandi akun untuk seluruh peserta siswa yang Anda daftarkan akan dikirimkan secara otomatis ke email Guru (<strong>{email || 'guru@sekolah.sch.id'}</strong>) setelah pendaftaran berhasil dikonfirmasi.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Student List Kolektif */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-extrabold text-[#0a0a0a] uppercase tracking-wider flex items-center gap-2">
                            <span>Daftar Peserta Siswa</span>
                            <span className="bg-[#0a0a0a] text-white px-2 py-0.5 rounded-full text-xs font-bold">
                              {studentsList.length} Siswa
                            </span>
                          </h3>
                          <p className="text-xs text-[#6a6a6a] mt-0.5">
                            Tambahkan data nama, kategori, dan kelas untuk setiap siswa yang didaftarkan.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={addStudent}
                          className="bg-[#0a0a0a] text-white hover:bg-[#0a0a0a]/80 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                        >
                          <span className="material-symbols-outlined text-base">add</span>
                          <span>Tambah Peserta</span>
                        </button>
                      </div>

                      <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                        {studentsList.map((student, idx) => (
                          <div key={student.id} className="bg-[#fffaf0] p-4 rounded-2xl border-2 border-[#0a0a0a]/15 relative space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black uppercase tracking-wider text-[#ff6b5a] bg-[#ff6b5a]/10 px-2.5 py-0.5 rounded-md">
                                Peserta #{idx + 1}
                              </span>
                              {studentsList.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeStudent(student.id)}
                                  className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-base">delete</span>
                                  <span>Hapus</span>
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {/* Student Name */}
                              <div className="sm:col-span-1">
                                <label className="block text-[10px] font-bold text-[#0a0a0a] uppercase tracking-wider mb-1">
                                  Nama Siswa
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={student.name}
                                  onChange={(e) => updateStudent(student.id, 'name', e.target.value)}
                                  placeholder="Nama lengkap siswa"
                                  className="w-full bg-white border border-[#0a0a0a]/20 rounded-lg px-3 py-2 text-xs font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
                                />
                              </div>

                              {/* Student Category */}
                              <div>
                                <label className="block text-[10px] font-bold text-[#0a0a0a] uppercase tracking-wider mb-1">
                                  Kategori
                                </label>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => updateStudent(student.id, 'category', 'SD-SMP')}
                                    className={`py-2 px-1 rounded-lg text-center border text-xs font-bold transition-all cursor-pointer ${
                                      student.category === 'SD-SMP'
                                        ? 'bg-[#b8a4ed] border-[#0a0a0a] text-[#0a0a0a]'
                                        : 'bg-white border-[#0a0a0a]/15 text-[#6a6a6a]'
                                    }`}
                                  >
                                    SD - SMP
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateStudent(student.id, 'category', 'SMA')}
                                    className={`py-2 px-1 rounded-lg text-center border text-xs font-bold transition-all cursor-pointer ${
                                      student.category === 'SMA'
                                        ? 'bg-[#a4d4c5] border-[#0a0a0a] text-[#0a0a0a]'
                                        : 'bg-white border-[#0a0a0a]/15 text-[#6a6a6a]'
                                    }`}
                                  >
                                    SMA
                                  </button>
                                </div>
                              </div>

                              {/* Student Grade */}
                              <div>
                                <label className="block text-[10px] font-bold text-[#0a0a0a] uppercase tracking-wider mb-1">
                                  Kelas
                                </label>
                                <div className="relative">
                                  <select
                                    value={student.grade}
                                    onChange={(e) => updateStudent(student.id, 'grade', e.target.value)}
                                    className="w-full bg-white border border-[#0a0a0a]/20 hover:border-[#0a0a0a]/40 rounded-lg px-3 py-2 pr-8 text-xs font-semibold text-[#0a0a0a] appearance-none focus:outline-none focus:border-[#0a0a0a] cursor-pointer"
                                  >
                                    {(student.category === 'SD-SMP' ? sdSmpGrades : smaGrades).map((g) => (
                                      <option key={g} value={g}>
                                        {g}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#0a0a0a] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-base">expand_more</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Help Admin Contact Banner */}
                <div className="bg-[#f8f3e9] rounded-2xl p-4 flex items-start gap-3 border border-[#0a0a0a]/10 shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-base">help</span>
                  </div>
                  <p className="text-xs text-[#0a0a0a] font-medium leading-relaxed">
                    Butuh bantuan? Hubungi admin di <strong className="font-extrabold text-[#0a0a0a]">0812-3456-7890 (WhatsApp)</strong> / email <strong className="font-extrabold text-[#0a0a0a]">support@olimpiadematematika.id</strong>
                  </p>
                </div>

                {/* Account Switcher Prompt */}
                <div className="text-center pt-1 text-xs sm:text-sm text-[#6a6a6a] font-medium">
                  Sudah memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="font-extrabold text-[#ff6b5a] hover:underline cursor-pointer"
                  >
                    Masuk Sekarang
                  </button>
                </div>
              </>
            ) : (
              /* Sign In Form */
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[#0a0a0a] uppercase tracking-wider mb-2">
                    Alamat Email / ID
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="andi@sekolah.sch.id"
                    className="w-full bg-[#fffaf0] border-2 border-[#0a0a0a]/15 hover:border-[#0a0a0a]/30 rounded-xl px-4 py-3 text-sm font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] focus:ring-2 focus:ring-[#0a0a0a]/10 shadow-xs transition-all placeholder:text-[#6a6a6a]/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0a0a0a] uppercase tracking-wider mb-2">
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#fffaf0] border-2 border-[#0a0a0a]/15 hover:border-[#0a0a0a]/30 rounded-xl px-4 py-3 text-sm font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] focus:ring-2 focus:ring-[#0a0a0a]/10 shadow-xs transition-all placeholder:text-[#6a6a6a]/60"
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#6a6a6a]">
                    <input type="checkbox" defaultChecked className="rounded text-[#0a0a0a]" />
                    <span>Ingat saya</span>
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Instruksi pemulihan kata sandi telah dikirim ke email Anda.'); }} className="font-bold text-[#0a0a0a] hover:underline">
                    Lupa Kata Sandi?
                  </a>
                </div>

                {/* WiFi Banner */}
                <div className="bg-[#f8f3e9] rounded-2xl p-4 flex items-start gap-3 border border-[#0a0a0a]/5">
                  <div className="w-6 h-6 rounded-full bg-[#e8b94a] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    i
                  </div>
                  <p className="text-xs text-[#6a6a6a] leading-relaxed">
                    Menggunakan WiFi sekolah? Tanyakan admin untuk akun terdaftar agar koneksi lancar selama kompetisi.
                  </p>
                </div>

                {/* Account Switcher Prompt */}
                <div className="text-center pt-1 text-xs sm:text-sm text-[#6a6a6a] font-medium">
                  Belum memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="font-extrabold text-[#ff6b5a] hover:underline cursor-pointer"
                  >
                    Daftar Sekarang
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0a0a0a] hover:bg-[#0a0a0a]/90 text-white font-bold py-4 rounded-2xl clay-shadow clay-button-active transition-all text-base flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Memproses...</span>
              ) : activeTab === 'register' ? (
                <span>Selesaikan Pendaftaran</span>
              ) : (
                <span>Masuk ke Dashboard</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
