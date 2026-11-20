import { useState } from 'react';
import { Save, Upload, KeyRound } from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { PageHeader } from '../components/ui.jsx';

const DEFAULT_AVATAR = '/assets/teacher_avatar.jpg';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [workspaceName, setWorkspaceName] = useState(user?.workspace_name || '');
  const [institutionName, setInstitutionName] = useState(user?.institution_name || '');
  const [academicYear, setAcademicYear] = useState(user?.academic_year || '2025/2026');
  const [passingGrade, setPassingGrade] = useState(String(user?.passing_grade ?? 75));
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/settings/profile', {
        full_name: fullName,
        email,
        phone,
        bio,
        workspace_name: workspaceName,
        institution_name: institutionName,
        academic_year: academicYear,
        passing_grade: Number(passingGrade),
      });
      await refreshUser();
      showToast('Profil dan pengaturan workspace berhasil disimpan.');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await api.post('/settings/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshUser();
      showToast('Foto profil diperbarui.');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await api.put('/settings/password', { current_password: currentPassword, new_password: newPassword });
      showToast('Password berhasil diperbarui.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Pengaturan Workspace & Akun" subtitle="Kelola profil pengajar, identitas workspace pribadi, ambang nilai default, dan keamanan akun." />

      <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200/90 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-100">
          <img
            src={user?.avatar_url || DEFAULT_AVATAR}
            alt="Foto profil"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_AVATAR;
            }}
            className="w-20 h-20 rounded-xl object-cover border border-slate-200 bg-[#EAF2FB]"
          />
          <div>
            <h2 className="text-base font-semibold text-[#142B4A] font-display">{user?.full_name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            <label className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#142B4A] bg-[#EAF2FB] rounded-lg hover:bg-[#dce9f8] cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Ganti Foto Profil
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Nama Lengkap</label>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Email Akun</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Nomor Telepon</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Nama Workspace</label>
            <input type="text" required value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Nama Sekolah / Institusi (Opsional)</label>
            <input type="text" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Tahun Ajaran</label>
              <input type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-full px-3.5 py-2 text-sm font-mono-num border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">KKM Default</label>
              <input type="number" min={0} max={100} value={passingGrade} onChange={(e) => setPassingGrade(e.target.value)} className="w-full px-3.5 py-2 text-sm font-mono-num border border-slate-200 rounded-lg" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Bio Singkat</label>
          <textarea rows={2} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={savingProfile} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg">
            <Save className="w-4 h-4" /> {savingProfile ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>

      <form onSubmit={handleChangePassword} className="bg-white border border-slate-200/90 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#3478C8]" />
          <h2 className="text-base font-semibold text-[#142B4A] font-display">Ganti Password</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Password Saat Ini</label>
            <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Password Baru (min. 8 karakter)</label>
            <input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={savingPassword} className="px-4 py-2 text-sm font-semibold text-white bg-[#142B4A] rounded-lg">{savingPassword ? 'Memperbarui...' : 'Perbarui Password'}</button>
        </div>
      </form>
    </div>
  );
}
