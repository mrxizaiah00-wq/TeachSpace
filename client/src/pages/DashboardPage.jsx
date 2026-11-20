import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Plus, ClipboardCheck, Award, FolderOpen, CalendarClock } from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ErrorState } from '../components/ui.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-white border border-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState message={error || 'Gagal memuat dashboard.'} onRetry={loadDashboard} />;
  }

  const statItems = [
    { label: 'Total Kelas', value: data.stats.totalClasses, suffix: 'kelas' },
    { label: 'Siswa Aktif', value: data.stats.totalStudents, suffix: 'siswa' },
    { label: `Jadwal ${data.todayName}`, value: data.stats.todayScheduleCount, suffix: 'sesi' },
    { label: 'Tingkat Kehadiran', value: `${data.stats.attendanceRate}%`, suffix: 'keseluruhan' },
    { label: 'Rata-rata Nilai', value: data.stats.averageGrade, suffix: 'skala 100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#142B4A] font-display">
            Selamat datang, {user?.full_name.split(',')[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {user?.workspace_name} · Tahun Ajaran {user?.academic_year}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={() => navigate('/classes')} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#142B4A] bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
            <Plus className="w-3.5 h-3.5 text-[#3478C8]" /> Tambah Kelas
          </button>
          <button type="button" onClick={() => navigate('/attendance')} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#142B4A] bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
            <ClipboardCheck className="w-3.5 h-3.5 text-[#3478C8]" /> Isi Absensi
          </button>
          <button type="button" onClick={() => navigate('/grades')} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#142B4A] bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
            <Award className="w-3.5 h-3.5 text-[#3478C8]" /> Input Nilai
          </button>
          <button type="button" onClick={() => navigate('/materials')} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#3478C8] rounded-lg hover:bg-[#2a65ac]">
            <FolderOpen className="w-3.5 h-3.5" /> Unggah Materi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statItems.map((item) => (
          <div key={item.label} className="bg-white border border-slate-200/90 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-[#142B4A] font-mono-num tabular-nums">{item.value}</p>
            <p className="mt-1 text-xs text-slate-400">{item.suffix}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/90 rounded-xl p-6">
          <h2 className="text-base font-semibold text-[#142B4A] font-display">Tren Kehadiran Siswa</h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-5">Persentase kehadiran per tanggal sesi</p>
          <div className="h-64 w-full">
            {data.charts.attendanceChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">Belum ada data sesi absensi.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.charts.attendanceChart}>
                  <defs>
                    <linearGradient id="attFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3478C8" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#3478C8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip />
                  <Area type="monotone" dataKey="kehadiran" name="Kehadiran (%)" stroke="#3478C8" strokeWidth={2} fill="url(#attFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-6">
          <h2 className="text-base font-semibold text-[#142B4A] font-display">Rata-rata Nilai per Kelas</h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-5">Akumulasi nilai ternormalisasi skala 100</p>
          <div className="h-64 w-full">
            {data.charts.classGradesChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">Belum ada data penilaian kelas.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.classGradesChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="kelas" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="rataRata" name="Rata-rata Nilai" fill="#142B4A" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#142B4A] font-display">Jadwal Mengajar Hari Ini ({data.todayName}) & Mendatang</h2>
              <p className="text-xs text-slate-500 mt-0.5">Ringkasan agenda mengajar aktif Anda</p>
            </div>
            <button type="button" onClick={() => navigate('/schedules')} className="text-xs font-semibold text-[#3478C8] hover:underline">
              Lihat Semua
            </button>
          </div>
          {data.todaySchedules.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-[#3478C8] mb-2">Hari Ini</p>
              <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-lg">
                {data.todaySchedules.map((sch) => (
                  <div key={sch.id} className="px-4 py-3 flex items-center justify-between gap-4 bg-[#EAF2FB]/40">
                    <div>
                      <p className="text-sm font-semibold text-[#142B4A]">{sch.subject_name}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{sch.class_name} {sch.room ? `· ${sch.room}` : ''}</p>
                    </div>
                    <span className="text-xs font-medium font-mono-num text-[#142B4A]">{sch.start_time} – {sch.end_time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="divide-y divide-slate-100">
            {data.upcomingSchedules.map((sch) => (
              <div key={sch.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <CalendarClock className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#142B4A] truncate">{sch.subject_name}</p>
                    <p className="text-xs text-slate-500 truncate">{sch.day_of_week} · {sch.class_name} {sch.room ? `· ${sch.room}` : ''}</p>
                  </div>
                </div>
                <span className="text-xs font-mono-num text-slate-600 whitespace-nowrap">{sch.start_time} – {sch.end_time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl p-6">
          <h2 className="text-base font-semibold text-[#142B4A] font-display">Aktivitas Terbaru</h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">Riwayat perubahan data di workspace Anda</p>
          {data.recentActivities.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">Belum ada aktivitas tercatat.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentActivities.map((act) => (
                <div key={act.id} className="py-3">
                  <p className="text-sm text-[#142B4A] leading-snug">{act.summary}</p>
                  <p className="text-xs text-slate-400 mt-1 font-mono-num">
                    {act.action} · {new Date(String(act.created_at).replace(' ', 'T')).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
