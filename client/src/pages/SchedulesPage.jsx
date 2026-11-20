import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, MapPin, Clock } from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { PageHeader, Modal, ConfirmDialog, EmptyState, ErrorState, TableSkeleton } from '../components/ui.jsx';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function SchedulesPage() {
  const { showToast } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('weekly');
  const [classFilter, setClassFilter] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ class_id: '', subject_id: '', day_of_week: 'Senin', start_time: '08:00', end_time: '09:30', room: '' });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [schRes, clsRes, subRes] = await Promise.all([
        api.get('/schedules', { params: { classId: classFilter || undefined } }),
        api.get('/classes', { params: { limit: 100 } }),
        api.get('/subjects'),
      ]);
      setSchedules(schRes.data.data);
      setClasses(clsRes.data.data);
      setSubjects(subRes.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [classFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = (day = 'Senin') => {
    setEditing(null);
    setForm({
      class_id: classes[0]?.id ? String(classes[0].id) : '',
      subject_id: subjects[0]?.id ? String(subjects[0].id) : '',
      day_of_week: day,
      start_time: '08:00',
      end_time: '09:30',
      room: '',
    });
    setFormOpen(true);
  };

  const openEdit = (sch) => {
    setEditing(sch);
    setForm({
      class_id: String(sch.class_id),
      subject_id: String(sch.subject_id),
      day_of_week: sch.day_of_week,
      start_time: sch.start_time,
      end_time: sch.end_time,
      room: sch.room || '',
    });
    setFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, class_id: Number(form.class_id), subject_id: Number(form.subject_id) };
      if (editing) {
        await api.put(`/schedules/${editing.id}`, payload);
        showToast('Jadwal berhasil diperbarui.');
      } else {
        await api.post('/schedules', payload);
        showToast('Jadwal mengajar ditambahkan.');
      }
      setFormOpen(false);
      loadData();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/schedules/${deleteTarget.id}`);
      showToast('Jadwal dihapus.');
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jadwal Mengajar"
        subtitle="Atur jadwal mingguan untuk setiap kelas dan mata pelajaran."
        action={
          <button type="button" onClick={() => openCreate('Senin')} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg hover:bg-[#2a65ac]">
            <Plus className="w-4 h-4" /> Tambah Jadwal
          </button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
          <button type="button" onClick={() => setViewMode('weekly')} className={`px-3.5 py-1.5 text-xs font-semibold rounded-md ${viewMode === 'weekly' ? 'bg-white text-[#142B4A] shadow-sm' : 'text-slate-600'}`}>
            Tampilan Mingguan
          </button>
          <button type="button" onClick={() => setViewMode('list')} className={`px-3.5 py-1.5 text-xs font-semibold rounded-md ${viewMode === 'list' ? 'bg-white text-[#142B4A] shadow-sm' : 'text-slate-600'}`}>
            Daftar Tabel
          </button>
        </div>
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg">
          <option value="">Semua Kelas</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : schedules.length === 0 ? (
        <EmptyState
          title="Belum ada jadwal mengajar"
          description="Susun jadwal mingguan agar kelas dan jam mengajar Anda terorganisir dengan rapi."
          action={<button type="button" onClick={() => openCreate('Senin')} className="px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg">Buat Jadwal Pertama</button>}
        />
      ) : viewMode === 'weekly' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DAYS.filter((d) => d !== 'Minggu' || schedules.some((s) => s.day_of_week === 'Minggu')).map((day) => {
            const dayItems = schedules.filter((s) => s.day_of_week === day);
            return (
              <div key={day} className="bg-white border border-slate-200/90 rounded-xl overflow-hidden flex flex-col">
                <div className="px-4 py-3 bg-[#F7F9FC] border-b border-slate-200/80 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#142B4A] font-display">{day}</h3>
                  <button type="button" onClick={() => openCreate(day)} className="text-xs font-medium text-[#3478C8] hover:underline">+ Tambah</button>
                </div>
                <div className="p-4 space-y-3 flex-1">
                  {dayItems.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">Tidak ada jadwal</p>
                  ) : (
                    dayItems.map((item) => (
                      <div key={item.id} className="p-3.5 rounded-lg border border-slate-200/90 bg-white">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-[#142B4A]">{item.subject_name}</p>
                            <p className="text-xs text-slate-600 mt-0.5">{item.class_name}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button type="button" onClick={() => openEdit(item)} className="p-1 text-slate-400 hover:text-[#142B4A]"><Pencil className="w-3.5 h-3.5" /></button>
                            <button type="button" onClick={() => setDeleteTarget(item)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1 font-mono-num text-[#3478C8] font-medium"><Clock className="w-3.5 h-3.5" />{item.start_time} – {item.end_time}</span>
                          {item.room && <span className="inline-flex items-center gap-1 truncate max-w-[120px]"><MapPin className="w-3.5 h-3.5 shrink-0" />{item.room}</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F7F9FC] text-xs font-semibold text-slate-500">
                  <th className="py-3 px-5">Hari</th>
                  <th className="py-3 px-5">Waktu</th>
                  <th className="py-3 px-5">Kelas</th>
                  <th className="py-3 px-5">Mata Pelajaran</th>
                  <th className="py-3 px-5">Ruangan</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {schedules.map((sch) => (
                  <tr key={sch.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-5 font-semibold text-[#142B4A]">{sch.day_of_week}</td>
                    <td className="py-3 px-5 font-mono-num text-xs text-[#3478C8]">{sch.start_time} – {sch.end_time}</td>
                    <td className="py-3 px-5 text-slate-700">{sch.class_name}</td>
                    <td className="py-3 px-5 font-medium text-[#142B4A]">{sch.subject_name}</td>
                    <td className="py-3 px-5 text-xs text-slate-500">{sch.room || '-'}</td>
                    <td className="py-3 px-5 text-right">
                      <button type="button" onClick={() => openEdit(sch)} className="p-1.5 text-slate-500 hover:text-[#142B4A]"><Pencil className="w-4 h-4" /></button>
                      <button type="button" onClick={() => setDeleteTarget(sch)} className="p-1.5 text-slate-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Jadwal' : 'Tambah Jadwal Mengajar'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Kelas</label>
              <select required value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
                <option value="">Pilih Kelas</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Mata Pelajaran</label>
              <select required value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
                <option value="">Pilih Mata Pelajaran</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Hari</label>
              <select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Jam Mulai</label>
              <input type="time" required value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Jam Selesai</label>
              <input type="time" required value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Ruangan / Link (Opsional)</label>
            <input type="text" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg">Batal</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg">{saving ? 'Menyimpan...' : 'Simpan Jadwal'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Hapus Jadwal" message={`Hapus jadwal ${deleteTarget?.subject_name}?`} />
    </div>
  );
}
