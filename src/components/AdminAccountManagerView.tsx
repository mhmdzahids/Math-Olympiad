import React, { useState, useEffect, useCallback } from "react";
import { ScreenView } from "../types";
import { apiService } from "../services/api";

interface AdminAccountManagerViewProps {
  onNavigate: (screen: ScreenView) => void;
  onShowToast?: (msg: string, type?: "success" | "info" | "warning", title?: string) => void;
}

interface ParticipantAccount {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  school_name: string;
  category: "sd" | "smp" | "sma";
  grade?: string;
  phone?: string;
  is_active: boolean;
  created_at?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  sd: "SD / MI",
  smp: "SMP / MTs",
  sma: "SMA / SMK / MA",
};

const CATEGORY_COLORS: Record<string, string> = {
  sd: "bg-[#ffb084] text-[#0a0a0a] border-[#ff8c54]",
  smp: "bg-[#b8a4ed] text-[#0a0a0a] border-[#9f88e8]",
  sma: "bg-[#e8b94a] text-[#0a0a0a] border-[#d4a030]",
};

const CountUp = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;
    const duration = 400; // fast animation
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(easeOut * value));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [value]);
  return <>{count}</>;
};

export const AdminAccountManagerView: React.FC<AdminAccountManagerViewProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [accounts, setAccounts] = useState<ParticipantAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "sd" | "smp" | "sma">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [editModal, setEditModal] = useState<ParticipantAccount | null>(null);
  const [editForm, setEditForm] = useState({ full_name: "", school_name: "", grade: "", phone: "", category: "" });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ full_name: "", email: "", password: "", school_name: "", grade: "", phone: "", category: "sd" });
  const [isCreating, setIsCreating] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ParticipantAccount | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getAdminAccounts();
      setAccounts(data);
    } catch {
      onShowToast?.("Gagal memuat daftar akun.", "warning", "Error");
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => { loadAccounts(); }, [loadAccounts]);

  const handleToggleActivation = async (account: ParticipantAccount) => {
    setProcessingId(account.id);
    try {
      if (account.is_active) {
        await apiService.deactivateAccount(account.id);
        onShowToast?.(`Akun ${account.full_name} dinonaktifkan.`, "info", "Akun Dinonaktifkan");
      } else {
        await apiService.activateAccount(account.id);
        onShowToast?.(`Akun ${account.full_name} berhasil diaktivasi!`, "success", "Akun Diaktivasi");
      }
      setAccounts((prev) => prev.map((a) => a.id === account.id ? { ...a, is_active: !a.is_active } : a));
    } catch (err: any) {
      onShowToast?.(err.message || "Gagal mengubah status akun.", "warning", "Error");
    } finally {
      setProcessingId(null);
    }
  };

  const openEditModal = (account: ParticipantAccount) => {
    setEditModal(account);
    setEditForm({ full_name: account.full_name, school_name: account.school_name, grade: account.grade || "", phone: account.phone || "", category: account.category });
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    setIsSavingEdit(true);
    try {
      await apiService.updateParticipantProfile(editModal.id, editForm);
      onShowToast?.(`Profil ${editForm.full_name} berhasil diperbarui!`, "success", "Profil Diperbarui");
      setAccounts((prev) => prev.map((a) => a.id === editModal.id ? { ...a, ...editForm, category: editForm.category as "sd"|"smp"|"sma" } : a));
      setEditModal(null);
    } catch (err: any) {
      onShowToast?.(err.message || "Gagal menyimpan perubahan.", "warning", "Error");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCreateAccount = async () => {
    setIsCreating(true);
    try {
      await apiService.register({
        email: createForm.email,
        password: createForm.password,
        full_name: createForm.full_name,
        school_name: createForm.school_name,
        category: createForm.category as "sd" | "smp" | "sma",
        grade: createForm.grade,
        phone: createForm.phone,
      });
      onShowToast?.(`Akun ${createForm.full_name} berhasil dibuat!`, "success", "Akun Dibuat");
      setCreateModalOpen(false);
      setCreateForm({ full_name: "", email: "", password: "", school_name: "", grade: "", phone: "", category: "sd" });
      loadAccounts();
    } catch (err: any) {
      onShowToast?.(err.message || "Gagal membuat akun peserta.", "warning", "Error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeletingId(deleteTarget.id);
    try {
      await apiService.deleteParticipantAccount(deleteTarget.id);
      onShowToast?.(`Akun ${deleteTarget.full_name} berhasil dihapus.`, "success", "Akun Dihapus");
      setAccounts((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      onShowToast?.(err.message || "Gagal menghapus akun.", "warning", "Error");
    } finally {
      setIsDeletingId(null);
    }
  };

  const filtered = accounts.filter((a) => {
    const matchSearch = a.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase()) || a.school_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === "all" || a.category === filterCategory;
    const matchStatus = filterStatus === "all" || (filterStatus === "active" && a.is_active) || (filterStatus === "inactive" && !a.is_active);
    return matchSearch && matchCat && matchStatus;
  });

  const totalActive = accounts.filter((a) => a.is_active).length;
  const totalInactive = accounts.filter((a) => !a.is_active).length;

  return (
    <div className="w-full bg-[#fef9ef] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 space-y-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => onNavigate("admin-leaderboard")}
              className="w-10 h-10 rounded-2xl bg-white border-2 border-[#0a0a0a]/15 text-[#0a0a0a] flex items-center justify-center clay-shadow-sm clay-button-active hover:bg-[#f5f0e0] transition-all cursor-pointer shrink-0">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0a0a0a] tracking-tight">Kelola Akun Peserta</h1>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            <button type="button" onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] border-2 border-[#0a0a0a] rounded-2xl font-bold text-sm text-white hover:bg-[#1a1a1a] transition-all cursor-pointer clay-shadow-sm clay-button-active">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span className="hidden sm:inline">Tambah Akun</span>
            </button>
            <button type="button" onClick={loadAccounts}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[#0a0a0a]/15 rounded-2xl font-bold text-sm text-[#0a0a0a] hover:bg-[#f5f0e0] transition-all cursor-pointer clay-shadow-sm clay-button-active">
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Peserta", value: accounts.length, icon: "group", color: "bg-[#f5f0e0]" },
            { label: "Akun Aktif", value: totalActive, icon: "check_circle", color: "bg-[#a4d4c5]" },
            { label: "Belum Aktif", value: totalInactive, icon: "pending", color: "bg-[#ffb084]" },
            { label: "Ditampilkan", value: filtered.length, icon: "filter_list", color: "bg-[#b8a4ed]" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-[24px] p-4 border-2 border-[#0a0a0a]/10 clay-shadow-sm flex items-center gap-3`}>
              <div className="w-10 h-10 bg-white/40 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl text-[#0a0a0a]">{stat.icon}</span>
              </div>
              <div>
                <div className="text-2xl font-black text-[#0a0a0a]"><CountUp value={stat.value} /></div>
                <div className="text-[10px] font-bold text-[#0a0a0a]/60 uppercase tracking-wide">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-[#f5f0e0] rounded-[24px] border-2 border-[#0a0a0a]/10 clay-shadow p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
          <div className="relative flex-1 w-full min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6a6a6a] text-[20px]">search</span>
            <input type="text" placeholder="Cari nama, email, atau sekolah..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#0a0a0a]/20 bg-white text-sm font-medium text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] transition-colors" />
          </div>
          <div className="flex gap-2 flex-wrap shrink-0 items-center">
            {(["all", "sd", "smp", "sma"] as const).map((cat) => (
              <button key={cat} type="button" onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${filterCategory === cat ? "bg-white text-[#0a0a0a] border border-[#0a0a0a]/10 shadow-[0_2px_8px_rgba(10,10,10,0.06)]" : "bg-transparent text-[#6a6a6a] hover:text-[#0a0a0a] hover:bg-white/50"}`}>
                {cat === "all" ? "Semua" : CATEGORY_LABELS[cat]}
              </button>
            ))}
            
            <div className="relative shrink-0 ml-2">
              <button type="button" onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border-2 ${filterStatus !== 'all' ? (filterStatus === 'active' ? 'bg-[#a4d4c5] text-[#0a0a0a] border-[#a4d4c5]' : 'bg-[#ff6b5a] text-white border-[#ff6b5a]') : 'bg-white text-[#0a0a0a] border-[#0a0a0a]/10 hover:bg-[#ebe6d6]'}`}
                title="Filter Status">
                <span className="material-symbols-outlined text-[20px]">filter_alt</span>
              </button>
              
              <div className={`absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border-2 border-[#0a0a0a]/10 shadow-xl overflow-hidden z-20 transition-all origin-top-right duration-200 ${isStatusDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="p-2 space-y-1">
                  {[{ key: "all", label: "Semua Status", icon: "list" }, { key: "active", label: "Aktif", icon: "check_circle" }, { key: "inactive", label: "Belum Aktif", icon: "pending" }].map(({ key, label, icon }) => (
                    <button key={key} type="button" 
                      onClick={() => { setFilterStatus(key as typeof filterStatus); setIsStatusDropdownOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${filterStatus === key ? (key === 'active' ? 'bg-[#a4d4c5] text-[#0a0a0a]' : key === 'inactive' ? 'bg-[#ff6b5a] text-white' : 'bg-[#0a0a0a] text-white') : 'text-[#0a0a0a] hover:bg-[#f5f0e0]'}`}>
                      <span className="material-symbols-outlined text-[16px]">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#f5f0e0] rounded-[28px] border-2 border-[#0a0a0a]/10 clay-shadow overflow-hidden">
          <div className="bg-[#0a0a0a] px-5 py-4 flex items-center justify-between">
            <h2 className="font-extrabold text-white text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#a4d4c5]">manage_accounts</span>
              Daftar Akun Peserta
              <span className="bg-white/15 text-white/80 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">{filtered.length}</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-[#0a0a0a]/20 border-t-[#0a0a0a] rounded-full animate-spin" />
              <p className="text-sm font-bold text-[#6a6a6a]">Memuat daftar akun...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <span className="material-symbols-outlined text-5xl text-[#6a6a6a]">person_search</span>
              <p className="text-sm font-bold text-[#0a0a0a]">Tidak ada akun yang ditemukan</p>
              <p className="text-xs text-[#6a6a6a]">Coba ubah filter atau kata kunci pencarian.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#0a0a0a]/5">
              {filtered.map((account, idx) => (
                <div key={account.id} className={`px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-colors hover:bg-[#ebe6d6]/50 ${idx % 2 === 0 ? "bg-transparent" : "bg-white/30"}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border-2 border-[#0a0a0a]/10 ${account.is_active ? "bg-[#a4d4c5]" : "bg-[#e7e2d8]"}`}>
                      {account.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-[#0a0a0a] truncate">{account.full_name}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[account.category]}`}>{CATEGORY_LABELS[account.category]}</span>
                        {account.grade && <span className="text-[9px] font-bold text-[#6a6a6a] bg-white px-1.5 py-0.5 rounded-full border border-[#0a0a0a]/10">Kelas {account.grade}</span>}
                      </div>
                      <div className="text-xs text-[#6a6a6a] mt-0.5 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">mail</span>{account.email}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">school</span>{account.school_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {account.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#a4d4c5] text-[#0a0a0a] text-xs font-extrabold border border-[#0a0a0a]/15">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a] shrink-0" />Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ffb084]/60 text-[#0a0a0a] text-xs font-extrabold border border-[#0a0a0a]/15">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b5a] shrink-0 animate-pulse" />Belum Aktif
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" disabled={processingId === account.id} onClick={() => handleToggleActivation(account)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border-2 transition-all cursor-pointer clay-button-active ${account.is_active ? "bg-[#ff6b5a]/10 border-[#ff6b5a]/30 text-[#ba1a1a] hover:bg-[#ff6b5a]/20" : "bg-[#a4d4c5] border-[#0a0a0a]/20 text-[#0a0a0a] hover:bg-[#8cc4b3]"} disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={account.is_active ? "Nonaktifkan akun" : "Aktifkan akun"}>
                      {processingId === account.id ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[16px]">{account.is_active ? "block" : "check_circle"}</span>}
                      <span className="hidden sm:inline">{account.is_active ? "Nonaktifkan" : "Aktifkan"}</span>
                    </button>
                    <button type="button" onClick={() => openEditModal(account)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-extrabold bg-white border-2 border-[#0a0a0a]/20 text-[#0a0a0a] hover:bg-[#f5f0e0] transition-all cursor-pointer clay-button-active"
                      title="Edit profil"><span className="material-symbols-outlined text-[16px]">edit</span><span className="hidden sm:inline">Edit</span></button>
                    <button type="button" onClick={() => setDeleteTarget(account)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-extrabold bg-[#ff6b5a]/10 border-2 border-[#ff6b5a]/30 text-[#ba1a1a] hover:bg-[#ff6b5a]/20 transition-all cursor-pointer clay-button-active"
                      title="Hapus akun"><span className="material-symbols-outlined text-[16px]">delete</span><span className="hidden sm:inline">Hapus</span></button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isLoading && filtered.length > 0 && (
            <div className="px-5 py-3 bg-[#0a0a0a]/5 border-t border-[#0a0a0a]/10 text-xs font-medium text-[#6a6a6a] flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Menampilkan {filtered.length} dari {accounts.length} akun. Klik <strong className="text-[#0a0a0a] mx-1">Aktifkan</strong> untuk memberi akses kuis kepada peserta.
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-[#0a0a0a]/60 backdrop-blur-xs" onClick={() => setEditModal(null)} />
          <div className="relative bg-[#fef9ef] max-w-md w-full rounded-[32px] border-2 border-[#0a0a0a] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#b8a4ed] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[#0a0a0a]">edit</span><h3 className="font-black text-[#0a0a0a] text-base">Edit Profil Peserta</h3></div>
              <button type="button" onClick={() => setEditModal(null)} className="w-8 h-8 rounded-xl bg-white/30 flex items-center justify-center hover:bg-white/50 cursor-pointer"><span className="material-symbols-outlined text-[18px] text-[#0a0a0a]">close</span></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-[#f5f0e0] rounded-2xl px-4 py-3 flex items-center gap-3 border border-[#0a0a0a]/10">
                <div className="w-9 h-9 rounded-xl bg-[#b8a4ed] flex items-center justify-center font-black text-[#0a0a0a]">{editModal.full_name.charAt(0)}</div>
                <div><div className="text-xs font-black text-[#0a0a0a]">{editModal.full_name}</div><div className="text-[10px] text-[#6a6a6a]">{editModal.email}</div></div>
              </div>
              <div className="space-y-3">
                {([{ key: "full_name", label: "Nama Lengkap", icon: "person" }, { key: "school_name", label: "Asal Sekolah", icon: "school" }, { key: "grade", label: "Kelas", icon: "class" }, { key: "phone", label: "No. WhatsApp", icon: "phone" }] as const).map(({ key, label, icon }) => (
                  <div key={key}>
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#6a6a6a] mb-1 block">{label}</label>
                    <div className="flex items-center gap-2 border-2 border-[#0a0a0a]/15 rounded-xl px-3 py-2 bg-white focus-within:border-[#0a0a0a] transition-colors">
                      <span className="material-symbols-outlined text-[18px] text-[#6a6a6a] shrink-0">{icon}</span>
                      <input type="text" value={editForm[key as keyof typeof editForm]} onChange={(e) => setEditForm((prev) => ({ ...prev, [key]: e.target.value }))} className="flex-1 bg-transparent text-sm font-bold text-[#0a0a0a] outline-none" placeholder={label} />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#6a6a6a] mb-1 block">Kategori</label>
                  <div className="border-2 border-[#0a0a0a]/15 rounded-xl px-3 py-2 bg-white focus-within:border-[#0a0a0a]">
                    <select value={editForm.category} onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))} className="w-full bg-transparent text-sm font-bold text-[#0a0a0a] outline-none cursor-pointer">
                      <option value="sd">SD / MI</option><option value="smp">SMP / MTs</option><option value="sma">SMA / SMK / MA</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditModal(null)} className="flex-1 py-3 rounded-2xl border-2 border-[#0a0a0a]/15 bg-[#f5f0e0] font-bold text-sm text-[#0a0a0a] hover:bg-[#ebe6d6] cursor-pointer">Batal</button>
                <button type="button" onClick={handleSaveEdit} disabled={isSavingEdit} className="flex-1 py-3 rounded-2xl border-2 border-[#0a0a0a] bg-[#0a0a0a] font-bold text-sm text-white hover:bg-[#1a1a1a] cursor-pointer clay-button-active disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSavingEdit ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</> : <><span className="material-symbols-outlined text-[16px]">save</span>Simpan Perubahan</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-[#0a0a0a]/60 backdrop-blur-xs transition-opacity" onClick={() => setCreateModalOpen(false)} />
          <div className="relative bg-[#fef9ef] max-w-md w-full rounded-[32px] border-2 border-[#0a0a0a] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#a4d4c5] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[#0a0a0a]">person_add</span><h3 className="font-black text-[#0a0a0a] text-base">Buat Akun Peserta</h3></div>
              <button type="button" onClick={() => setCreateModalOpen(false)} className="w-8 h-8 rounded-xl bg-white/30 flex items-center justify-center hover:bg-white/50 cursor-pointer"><span className="material-symbols-outlined text-[18px] text-[#0a0a0a]">close</span></button>
            </div>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-3">
                {([{ key: "full_name", label: "Nama Lengkap", icon: "person", type: "text" }, { key: "email", label: "Email", icon: "mail", type: "email" }, { key: "password", label: "Password", icon: "lock", type: "password" }, { key: "school_name", label: "Asal Sekolah", icon: "school", type: "text" }, { key: "grade", label: "Kelas", icon: "class", type: "text" }, { key: "phone", label: "No. WhatsApp", icon: "phone", type: "text" }] as const).map(({ key, label, icon, type }) => (
                  <div key={key}>
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#6a6a6a] mb-1 block">{label}</label>
                    <div className="flex items-center gap-2 border-2 border-[#0a0a0a]/15 rounded-xl px-3 py-2 bg-white focus-within:border-[#0a0a0a] transition-colors">
                      <span className="material-symbols-outlined text-[18px] text-[#6a6a6a] shrink-0">{icon}</span>
                      <input type={type} value={createForm[key as keyof typeof createForm]} onChange={(e) => setCreateForm((prev) => ({ ...prev, [key]: e.target.value }))} className="flex-1 bg-transparent text-sm font-bold text-[#0a0a0a] outline-none" placeholder={label} />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#6a6a6a] mb-1 block">Kategori</label>
                  <div className="border-2 border-[#0a0a0a]/15 rounded-xl px-3 py-2 bg-white focus-within:border-[#0a0a0a]">
                    <select value={createForm.category} onChange={(e) => setCreateForm((prev) => ({ ...prev, category: e.target.value }))} className="w-full bg-transparent text-sm font-bold text-[#0a0a0a] outline-none cursor-pointer">
                      <option value="sd">SD / MI</option><option value="smp">SMP / MTs</option><option value="sma">SMA / SMK / MA</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="flex-1 py-3 rounded-2xl border-2 border-[#0a0a0a]/15 bg-[#f5f0e0] font-bold text-sm text-[#0a0a0a] hover:bg-[#ebe6d6] cursor-pointer">Batal</button>
                <button type="button" onClick={handleCreateAccount} disabled={isCreating} className="flex-1 py-3 rounded-2xl border-2 border-[#0a0a0a] bg-[#0a0a0a] font-bold text-sm text-white hover:bg-[#1a1a1a] cursor-pointer clay-button-active disabled:opacity-50 flex items-center justify-center gap-2">
                  {isCreating ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Memproses...</> : <><span className="material-symbols-outlined text-[16px]">person_add</span>Buat Akun</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0a0a0a]/60 backdrop-blur-xs" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-[#fef9ef] max-w-sm w-full rounded-[32px] border-2 border-[#ff6b5a] shadow-2xl z-10 p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-[#ff6b5a]/10 border-2 border-[#ff6b5a] flex items-center justify-center mx-auto"><span className="material-symbols-outlined text-3xl text-[#ff6b5a]">delete_forever</span></div>
            <div>
              <h3 className="text-xl font-black text-[#0a0a0a]">Hapus Akun Peserta?</h3>
              <p className="text-sm font-bold text-[#3a3a3a] mt-1">Akun <span className="text-[#ff6b5a]">{deleteTarget.full_name}</span> beserta seluruh data kuis dan kualifikasi akan dihapus secara permanen.</p>
            </div>
            <div className="bg-[#fff3d6] border border-[#e8b94a]/50 rounded-2xl p-3 text-xs font-bold text-[#0a0a0a] flex items-center gap-2 text-left">
              <span className="material-symbols-outlined text-[#e8b94a] shrink-0">warning</span>Tindakan ini tidak dapat dibatalkan!
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-2xl border-2 border-[#0a0a0a]/15 bg-[#f5f0e0] font-bold text-sm text-[#0a0a0a] hover:bg-[#ebe6d6] cursor-pointer">Batal</button>
              <button type="button" onClick={handleDeleteConfirm} disabled={isDeletingId === deleteTarget.id} className="flex-1 py-3 rounded-2xl border-2 border-[#ff6b5a] bg-[#ff6b5a] font-bold text-sm text-white hover:bg-[#e05848] cursor-pointer clay-button-active disabled:opacity-50 flex items-center justify-center gap-2">
                {isDeletingId === deleteTarget.id ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span className="material-symbols-outlined text-[16px]">delete</span>Ya, Hapus Akun</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
