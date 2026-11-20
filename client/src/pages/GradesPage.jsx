import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Save, ArrowLeft } from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { PageHeader, Modal, ConfirmDialog, EmptyState, ErrorState, TableSkeleton } from '../components/ui.jsx';

export default function GradesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [assessments, setAssessments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    class_id: '',
    subject_id: '',
    title: '',
    type: 'tugas',
    assessment_date: new Date().toISOString().slice(0, 10),
    max_score: '100',
    passing_score: String(user?.passing_grade ?? 75),
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [gradeRows, setGradeRows] = useState([]);
  const [savingGrades, setSavingGrades] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [assRes, clsRes, subRes] = await Promise.all([
        api.get('/assessments', { params: { classId: classFilter || undefined } }),
        api.get('/classes', { params: { limit: 100 } }),
        api.get('/subjects'),
      ]);
      setAssessments(assRes.data.data);
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

  const openCreate = () => {
    setEditing(null);
    setForm({
      class_id: classes[0]?.id ? String(classes[0].id) : '',
      subject_id: subjects[0]?.id ? String(subjects[0].id) : '',
      title: '',
      type: 'tugas',
      assessment_date: new Date().toISOString().slice(0, 10),
      max_score: '100',
      passing_score: String(user?.passing_grade ?? 75),
    });
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      class_id: String(item.class_id),
      subject_id: String(item.subject_id),
      title: item.title,
      type: item.type,
      assessment_date: item.assessment_date,
      max_score: String(item.max_score),
      passing_score: String(item.passing_score),
    });
    setFormOpen(true);
  };

  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        class_id: Number(form.class_id),
        subject_id: Number(form.subject_id),
        max_score: Number(form.max_score),
        passing_score: Number(form.passing_score),
      };
      if (editing) {
        await api.put(`/assessments/${editing.id}`, payload);
        showToast('Penilaian berhasil diperbarui.');
      } else {
        await api.post('/assessments', payload);
        showToast('Penilaian baru berhasil dibuat.');
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
    try {
      await api.delete(`/assessments/${deleteTarget.id}`);
      showToast('Penilaian dihapus.');
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const openGradeSheet = async (item) => {
    try {
      const { data } = await api.get(`/assessments/${item.id}/grades`);
      setActiveAssessment(data.assessment);
      setGradeRows(
        data.students.map((s) => ({
          student_id: s.student_id,
          student_number: s.student_number,
          full_name: s.full_name,
          score: s.score === null ? '' : String(s.score),
          feedback: s.feedback || '',
        }))
      );
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleSaveGrades = async (e) => {
    e.preventDefault();
    setSavingGrades(true);
    try {
      await api.post(`/assessments/${activeAssessment.id}/grades`, {
        grades: gradeRows.map((r) => ({
          student_id: r.student_id,
          score: r.score === '' ? null : Number(r.score),
          feedback: r.feedback,
        })),
      });
      showToast('Nilai siswa berhasil disimpan.');
      loadData();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSavingGrades(false);
    }
  };

  if (activeAssessment) {
    const scored = gradeRows.filter((r) => r.score !== '' && !Number.isNaN(Number(r.score)));
    const avg = scored.length > 0 ? Math.round((scored.reduce((acc, r) => acc + Number(r.score), 0) / scored.length) * 10) / 10 : 0;
    const passedCount = scored.filter((r) => Number(r.score) >= Number(activeAssessment.passing_score)).length;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <button type="button" onClick={() => setActiveAssessment(null)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3478C8] hover:underline mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Penilaian
            </button>
            <h1 className="text-2xl font-bold text-[#142B4A] font-display">{activeAssessment.title}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {activeAssessment.class_name} · {activeAssessment.subject_name} · Maks {activeAssessment.max_score} · KKM {activeAssessment.passing_score}
            </p>
          </div>
          <div className="flex items-center gap-6 bg-white border border-slate-200 rounded-xl px-5 py-3">
            <div>
              <p className="text-xs text-slate-500">Rata-rata</p>
              <p className="text-lg font-bold font-mono-num text-[#142B4A]">{avg}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Tuntas</p>
              <p className="text-lg font-bold font-mono-num text-emerald-700">{passedCount}/{scored.length}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveGrades} className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F7F9FC] text-xs font-semibold text-slate-500">
                    <th className="py-3 px-5">NIS</th>
                    <th className="py-3 px-5">Nama Siswa</th>
                    <th className="py-3 px-5 w-36">Nilai</th>
                    <th className="py-3 px-5">Ketuntasan</th>
                    <th className="py-3 px-5">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {gradeRows.map((row, idx) => {
                    const hasVal = row.score !== '' && !Number.isNaN(Number(row.score));
                    const isPassed = hasVal && Number(row.score) >= Number(activeAssessment.passing_score);
                    return (
                      <tr key={row.student_id}>
                        <td className="py-3 px-5 font-mono-num text-xs text-slate-500">{row.student_number || '-'}</td>
                        <td className="py-3 px-5 font-semibold text-[#142B4A]">{row.full_name}</td>
                        <td className="py-3 px-5">
                          <input
                            type="number"
                            min={0}
                            max={activeAssessment.max_score}
                            step="0.1"
                            value={row.score}
                            onChange={(e) => setGradeRows((p) => p.map((r, i) => (i === idx ? { ...r, score: e.target.value } : r)))}
                            className="w-28 px-3 py-1.5 text-sm font-mono-num border border-slate-200 rounded-lg"
                          />
                        </td>
                        <td className="py-3 px-5 text-xs font-semibold">
                          {!hasVal ? <span className="text-slate-400">Belum dinilai</span> : isPassed ? <span className="text-emerald-700">Tuntas</span> : <span className="text-red-600">Belum Tuntas</span>}
                        </td>
                        <td className="py-3 px-5">
                          <input
                            type="text"
                            value={row.feedback}
                            onChange={(e) => setGradeRows((p) => p.map((r, i) => (i === idx ? { ...r, feedback: e.target.value } : r)))}
                            className="w-full min-w-[200px] px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingGrades} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#3478C8] rounded-lg">
              <Save className="w-4 h-4" /> {savingGrades ? 'Menyimpan...' : 'Simpan Semua Nilai'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Nilai"
        subtitle="Buat daftar penilaian, input nilai siswa, dan pantau status ketuntasan berdasarkan KKM."
        action={
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg hover:bg-[#2a65ac]">
            <Plus className="w-4 h-4" /> Buat Penilaian
          </button>
        }
      />

      <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg">
        <option value="">Semua Kelas</option>
        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : assessments.length === 0 ? (
        <EmptyState title="Belum ada penilaian" description="Buat tugas, kuis, UTS, atau UAS untuk mulai mencatat dan merekap nilai siswa." action={<button type="button" onClick={openCreate} className="px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg">Buat Penilaian Pertama</button>} />
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F7F9FC] text-xs font-semibold text-slate-500">
                  <th className="py-3 px-5">Nama Penilaian</th>
                  <th className="py-3 px-5">Jenis</th>
                  <th className="py-3 px-5">Kelas & Mapel</th>
                  <th className="py-3 px-5">Tanggal</th>
                  <th className="py-3 px-5 text-right">KKM / Maks</th>
                  <th className="py-3 px-5 text-right">Rata-rata</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {assessments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-5 font-semibold text-[#142B4A]">{a.title}</td>
                    <td className="py-3 px-5 uppercase text-xs font-semibold text-[#3478C8]">{a.type}</td>
                    <td className="py-3 px-5 text-xs text-slate-600">{a.class_name} · {a.subject_name}</td>
                    <td className="py-3 px-5 font-mono-num text-xs text-slate-600">{a.assessment_date}</td>
                    <td className="py-3 px-5 text-right font-mono-num text-xs">{a.passing_score} / {a.max_score}</td>
                    <td className="py-3 px-5 text-right font-mono-num font-bold text-[#142B4A]">{a.average_score ?? '-'}</td>
                    <td className="py-3 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button type="button" onClick={() => openGradeSheet(a)} className="px-3 py-1 text-xs font-semibold text-[#3478C8] bg-[#EAF2FB] rounded-md">Input Nilai</button>
                        <button type="button" onClick={() => openEdit(a)} className="p-1.5 text-slate-500 hover:text-[#142B4A]"><Pencil className="w-4 h-4" /></button>
                        <button type="button" onClick={() => setDeleteTarget(a)} className="p-1.5 text-slate-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Penilaian' : 'Buat Penilaian Baru'}>
        <form onSubmit={handleSaveAssessment} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Nama Penilaian</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Kelas</label>
              <select required disabled={Boolean(editing)} value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
                <option value="">Pilih Kelas</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Mata Pelajaran</label>
              <select required disabled={Boolean(editing)} value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
                <option value="">Pilih Mapel</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Jenis</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
                <option value="tugas">Tugas</option><option value="kuis">Kuis</option><option value="uts">UTS</option><option value="uas">UAS</option><option value="praktik">Praktik</option><option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Tanggal</label>
              <input type="date" required value={form.assessment_date} onChange={(e) => setForm({ ...form, assessment_date: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Skor Maksimum</label>
              <input type="number" required value={form.max_score} onChange={(e) => setForm({ ...form, max_score: e.target.value })} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Batas Ketuntasan (KKM)</label>
              <input type="number" required value={form.passing_score} onChange={(e) => setForm({ ...form, passing_score: e.target.value })} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg">Batal</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Hapus Penilaian" message={`Hapus penilaian "${deleteTarget?.title}"?`} />
    </div>
  );
}
