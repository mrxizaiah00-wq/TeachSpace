import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { api, getErrorMessage } from '../services/api.js';

const COVER_IMAGE = '/assets/login_cover.jpg';

export default function LoginPage({ initialMode = 'login' }) {
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

 const [mode, setMode] = useState(initialMode);

useEffect(() => {
  setMode(initialMode);
  setError('');
}, [initialMode]);

useEffect(() => {
  setMode(initialMode);
  setError('');
}, [initialMode]);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [institutionName, setInstitutionName] = useState('');

  const [resetStep, setResetStep] = useState('request');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        showToast('Selamat datang kembali di TeachSpace.');
        navigate('/');
      } else if (mode === 'register') {
        await register({ fullName, email, password, workspaceName, institutionName });
        showToast('Akun dan workspace pribadi berhasil dibuat.');
        navigate('/');
      } else if (mode === 'forgot') {
        if (resetStep === 'request') {
          const { data } = await api.post('/auth/forgot-password', { email });
          showToast(data.message, 'info');
          if (data.devResetToken) setResetToken(data.devResetToken);
          setResetStep('confirm');
        } else {
          const { data } = await api.post('/auth/reset-password', { token: resetToken, password: newPassword });
          showToast(data.message);
          setMode('login');
          setResetStep('request');
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      await login('guru@teachspace.id', 'TeachSpace123!');
      showToast('Masuk menggunakan akun demo Ibu Ratna.');
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#F7F9FC]">
      <div className="hidden lg:flex lg:col-span-5 relative bg-[#142B4A] text-white flex-col justify-between p-10 overflow-hidden">
        <img src={COVER_IMAGE} alt="Meja kerja guru" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-linear-to-t from-[#142B4A] via-[#142B4A]/75 to-[#142B4A]/60" />

        <div className="relative z-10">
          <span className="text-2xl font-bold tracking-tight font-display">TeachSpace</span>
          <p className="text-sm text-blue-200 mt-1">Your Teaching, Organized.</p>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="text-3xl font-bold leading-tight font-display">
            Ruang kerja akademik pribadi untuk guru dan pengajar independen.
          </h2>
          <p className="text-sm text-slate-200/90 leading-relaxed">
            Kelola kelas, data siswa, jadwal mingguan, absensi harian, penilaian dengan ambang ketuntasan, materi ajar,
            serta laporan Excel dan PDF dalam satu platform yang terstruktur.
          </p>
          <div className="pt-4 border-t border-white/15 flex items-center gap-4 text-xs text-blue-100/80">
            <span>Workspace Terisolasi</span>
            <span aria-hidden="true">·</span>
            <span>Tanpa Admin Sekolah</span>
            <span aria-hidden="true">·</span>
            <span>Ekspor PDF & Excel</span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-7 sm:p-8 shadow-sm">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
                mode === 'login' ? 'bg-white text-[#142B4A] shadow-sm' : 'text-slate-600 hover:text-[#142B4A]'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
                mode === 'register' ? 'bg-white text-[#142B4A] shadow-sm' : 'text-slate-600 hover:text-[#142B4A]'
              }`}
            >
              Daftar Mandiri
            </button>
          </div>

          <h1 className="text-xl font-bold text-[#142B4A] font-display">
            {mode === 'login' ? 'Masuk ke Workspace Anda' : mode === 'register' ? 'Buat Workspace Mengajar Baru' : 'Reset Password Akun'}
          </h1>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            {mode === 'login'
              ? 'Masukkan email dan password akun TeachSpace Anda.'
              : mode === 'register'
              ? 'Sistem otomatis membuat workspace pribadi setelah Anda mendaftar.'
              : 'Ajukan token reset password untuk memperbarui kredensial Anda.'}
          </p>

          {error && <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Budi Santoso, S.Pd."
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Nama Workspace (Opsional)</label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      placeholder="Workspace Pak Budi"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Sekolah / Bimbel (Opsional)</label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      placeholder="Mandiri / SMA ..."
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </>
            )}

            {(mode !== 'forgot' || resetStep === 'request') && (
              <div>
                <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
                />
              </div>
            )}

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-[#142B4A]">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setResetStep('request');
                        setError('');
                      }}
                      className="text-xs font-medium text-[#3478C8] hover:underline"
                    >
                      Lupa password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full px-3.5 py-2.5 pr-10 text-sm border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="Tampilkan password"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'forgot' && resetStep === 'confirm' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Token Reset Password</label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-mono-num border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Password Baru</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-[#3478C8] hover:bg-[#2a65ac] text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>
                {submitting
                  ? 'Memproses...'
                  : mode === 'login'
                  ? 'Masuk ke Workspace'
                  : mode === 'register'
                  ? 'Buat Akun & Workspace'
                  : resetStep === 'request'
                  ? 'Kirim Permintaan Reset'
                  : 'Simpan Password Baru'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {mode === 'forgot' && (
            <button type="button" onClick={() => setMode('login')} className="w-full mt-3 py-2 text-xs font-medium text-slate-600 hover:text-[#142B4A]">
              Kembali ke halaman masuk
            </button>
          )}

          {mode === 'login' && (
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Akun Demo Pengajar</span>
                <span className="font-mono-num text-[#142B4A]">guru@teachspace.id</span>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-[#EAF2FB] hover:bg-[#dce9f8] text-[#142B4A] text-xs font-semibold rounded-lg transition-colors"
              >
                Masuk Cepat dengan Akun Demo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
