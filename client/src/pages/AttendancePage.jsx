import { useEffect, useState, useCallback } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { PageHeader, EmptyState, ErrorState, TableSkeleton, ConfirmDialog } from '../components/ui.jsx';

export default function AttendancePage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState('input');
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [topic, setTopic] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [sessions, setSessions] = useState([]);
  const [recap, setRecap] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadClasses = useCallback(async () => {
    try {
      const { data } = await api.get('/classes', { params: { limit: 100 } });
      setClasses(data.data);
      if (data.data.length > 0 && !classId) {
        setClassId(String(data.data[0].id));
      } else if (data.data.length === 0) {
        setLoading(false);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const loadSheet = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/attendance/sheet', { params: { classId, date } });
      setRows(data.students);
      setTopic(data.session?.topic || '');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [classId, date]);

  const loadSessionsAndRecap = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sessRes, recRes] = await Promise.all([
        api.get('/attendance/sessions', { params: { classId: classId || undefined } }),
        api.get('/attendance/recap', { params: { classId: classId || undefined } }),
      ]);
      setSessions(sessRes.data.data);
      setRecap(recRes.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (tab === 'input') loadSheet();
    else loadSessionsAndRecap();
  }, [tab, loadSheet, loadSessionsAndRecap]);

  const handleSaveSheet = async (e) => {
    e.preventDefault();
    if (!classId || rows.length === 0) return;
    setSaving(true);
    try {
      await api.post('/attendance/save', {
        class_id: Number(classId),
        session_date: date,
        topic,
        records: rows.map((r) => ({ student_id: r.student_id, status: r.status, notes: r.notes })),
      });
      showToast('Data absensi berhasil disimpan.');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/attendance/sessions/${deleteTarget.id}`);
      showToast('Sesi absensi dihapus.');
      setDeleteTarget(null);
      loadSessionsAndRecap();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Absensi Siswa" subtitle="Catat kehadiran harian (Hadir, Izin, Sakit, Alpa) dan pantau persentase kehadiran siswa." />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
          <button type="button" onClick={() => setTab('input')} className={`px-3.5 py-1.5 text-xs font-semibold rounded-md ${tab === 'input' ? 'bg-white text-[#142B4A] shadow-sm' : 'text-slate-600'}`}>Isi / Edit Absensi</button>
          <button type="button" onClick={() => setTab('sessions')} className={`px-3.5 py-1.5 text-xs font-semibold rounded-md ${tab === 'sessions' ? 'bg-white text-[#142B4A] shadow-sm' : 'text-slate-600'}`}>Riwayat Sesi</button>
          <button type="button" onClick={() => setTab('recap')} className={`px-3.5 py-1.5 text-xs font-semibold rounded-md ${tab === 'recap' ? 'bg-white text-[#142B4A] shadow-sm' : 'text-slate-600'}`}>Rekap Kehadiran</button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg">
            {tab !== 'input' && <option value="">Semua Kelas</option>}
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {tab === 'input' && (
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg font-mono-num" />
          )}
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={tab === 'input' ? loadSheet : loadSessionsAndRecap} />
      ) : tab === 'input' ? (
        rows.length === 0 ? (
          <EmptyState title="Belum ada siswa aktif di kelas ini" description="Tempatkan siswa aktif ke kelas ini terlebih dahulu." />
        ) : (
          <form onSubmit={handleSaveSheet} className="space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 max-w-md">
                <label className="block text-xs font-medium text-slate-500 mb-1">Topik / Catatan Pertemuan</label>
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Contoh: Pertemuan 4" className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
              </div>
              <div className="flex items-center gap-2.5">
                <button type="button" onClick={() => setRows((p) => p.map((r) => ({ ...r, status: 'hadir' })))} className="px-3.5 py-2 text-xs font-semibold text-[#142B4A] bg-[#EAF2FB] rounded-lg">Tandai Semua Hadir</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg">
                  <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Absensi'}
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F7F9FC] text-xs font-semibold text-slate-500">
                      <th className="py-3 px-5">NIS</th>
                      <th className="py-3 px-5">Nama Siswa</th>
                      <th className="py-3 px-5">Status Kehadiran</th>
                      <th className="py-3 px-5">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {rows.map((st) => (
                      <tr key={st.student_id}>
                        <td className="py-3 px-5 font-mono-num text-xs text-slate-500">{st.student_number || '-'}</td>
                        <td className="py-3 px-5 font-semibold text-[#142B4A]">{st.full_name}</td>
                        <td className="py-3 px-5">
                          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                            {['hadir', 'izin', 'sakit', 'alpa'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setRows((p) => p.map((r) => (r.student_id === st.student_id ? { ...r, status: opt } : r)))}
                                className={`px-3 py-1 text-xs font-semibold rounded-md capitalize ${
                                  st.status === opt ? 'bg-[#3478C8] text-white' : 'text-slate-600'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <input
                            type="text"
                            value={st.notes}
                            onChange={(e) => setRows((p) => p.map((r) => (r.student_id === st.student_id ? { ...r, notes: e.target.value } : r)))}
                            className="w-full min-w-45 px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </form>
        )
      ) : tab === 'sessions' ? (
        <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F7F9FC] text-xs font-semibold text-slate-500">
                  <th className="py-3 px-5">Tanggal</th>
                  <th className="py-3 px-5">Kelas</th>
                  <th className="py-3 px-5">Topik</th>
                  <th className="py-3 px-5 text-right">Hadir</th>
                  <th className="py-3 px-5 text-right">Izin</th>
                  <th className="py-3 px-5 text-right">Sakit</th>
                  <th className="py-3 px-5 text-right">Alpa</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 px-5 font-mono-num text-xs font-semibold">{s.session_date}</td>
                    <td className="py-3 px-5">{s.class_name}</td>
                    <td className="py-3 px-5 text-xs text-slate-500">{s.topic || '-'}</td>
                    <td className="py-3 px-5 text-right font-mono-num text-emerald-700 font-semibold">{s.hadir_count}</td>
                    <td className="py-3 px-5 text-right font-mono-num">{s.izin_count}</td>
                    <td className="py-3 px-5 text-right font-mono-num">{s.sakit_count}</td>
                    <td className="py-3 px-5 text-right font-mono-num text-red-600">{s.alpa_count}</td>
                    <td className="py-3 px-5 text-right">
                      <button type="button" onClick={() => { setClassId(String(s.class_id)); setDate(s.session_date); setTab('input'); }} className="text-xs font-semibold text-[#3478C8] mr-2">Edit</button>
                      <button type="button" onClick={() => setDeleteTarget(s)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F7F9FC] text-xs font-semibold text-slate-500">
                  <th className="py-3 px-5">Siswa</th>
                  <th className="py-3 px-5">Kelas</th>
                  <th className="py-3 px-5 text-right">Sesi</th>
                  <th className="py-3 px-5 text-right">Hadir</th>
                  <th className="py-3 px-5 text-right">Izin</th>
                  <th className="py-3 px-5 text-right">Sakit</th>
                  <th className="py-3 px-5 text-right">Alpa</th>
                  <th className="py-3 px-5 text-right">Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recap.map((r, i) => (
                  <tr key={i}>
                    <td className="py-3 px-5 font-semibold text-[#142B4A]">{r.full_name}</td>
                    <td className="py-3 px-5 text-xs text-slate-600">{r.class_name}</td>
                    <td className="py-3 px-5 text-right font-mono-num">{r.total_sessions}</td>
                    <td className="py-3 px-5 text-right font-mono-num text-emerald-700 font-semibold">{r.hadir}</td>
                    <td className="py-3 px-5 text-right font-mono-num">{r.izin}</td>
                    <td className="py-3 px-5 text-right font-mono-num">{r.sakit}</td>
                    <td className="py-3 px-5 text-right font-mono-num text-red-600">{r.alpa}</td>
                    <td className="py-3 px-5 text-right font-mono-num font-bold">{r.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteSession} title="Hapus Sesi Absensi" message={`Hapus sesi absensi ${deleteTarget?.class_name} tanggal ${deleteTarget?.session_date}?`} />
    </div>
  );
}
