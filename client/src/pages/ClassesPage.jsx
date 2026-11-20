import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, Eye, UserPlus, BookPlus } from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { PageHeader, Modal, ConfirmDialog, EmptyState, ErrorState, TableSkeleton, Pagination } from '../components/ui.jsx';

export default function ClassesPage() {
  const { showToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', grade_level: '', academic_year: '2025/2026', description: '' });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [detail, setDetail] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const loadClasses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/classes', { params: { search, page, limit: 10 } });
      setClasses(data.data);
      setTotalPages(data.meta.totalPages || 1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: '', name: '', grade_level: '', academic_year: '2025/2026', description: '' });
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      code: item.code,
      name: item.name,
      grade_level: item.grade_level,
      academic_year: item.academic_year,
      description: item.description || '',
    });
    setFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/classes/${editing.id}`, form);
        showToast('Data kelas berhasil diperbarui.');
      } else {
        await api.post('/classes', form);
        showToast('Kelas baru berhasil ditambahkan.');
      }
      setFormOpen(false);
      loadClasses();
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
      await api.delete(`/classes/${deleteTarget.id}`);
      showToast('Kelas berhasil dihapus.');
      setDeleteTarget(null);
      loadClasses();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const openDetail = async (id) => {
    try {
      const [detRes, stuRes, subRes] = await Promise.all([
        api.get(`/classes/${id}`),
        api.get('/students', { params: { limit: 100 } }),
        api.get('/subjects'),
      ]);
      setDetail(detRes.data.data);
      setAllStudents(stuRes.data.data);
      setAllSubjects(subRes.data.data);
      setSelectedStudentId('');
      setSelectedSubjectId('');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const assignStudent = async () => {
    if (!detail || !selectedStudentId) return;
    try {
      await api.post(`/classes/${detail.id}/students`, { student_id: Number(selectedStudentId) });
      showToast('Siswa ditambahkan ke kelas.');
      openDetail(detail.id);
      loadClasses();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const removeStudent = async (studentId) => {
    if (!detail) return;
    try {
      await api.delete(`/classes/${detail.id}/students/${studentId}`);
      showToast('Siswa dikeluarkan dari kelas.');
      openDetail(detail.id);
      loadClasses();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const assignSubject = async () => {
    if (!detail || !selectedSubjectId) return;
    try {
      await api.post(`/classes/${detail.id}/subjects`, { subject_id: Number(selectedSubjectId) });
      showToast('Mata pelajaran dihubungkan ke kelas.');
      openDetail(detail.id);
      loadClasses();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const removeSubject = async (subjectId) => {
    if (!detail) return;
    try {
      await api.delete(`/classes/${detail.id}/subjects/${subjectId}`);
      showToast('Mata pelajaran dilepas dari kelas.');
      openDetail(detail.id);
      loadClasses();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Kelas"
        subtitle="Kelola rombongan belajar, kelompok les, atau kelas bimbingan Anda."
        action={
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg hover:bg-[#2a65ac]">
            <Plus className="w-4 h-4" /> Tambah Kelas
          </button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Cari kode, nama kelas, atau tingkat..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg"
        />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadClasses} />
      ) : classes.length === 0 ? (
        <EmptyState
          title="Belum ada kelas terdaftar"
          description="Buat kelas pertama Anda untuk mulai menempatkan siswa, menyusun jadwal, dan mencatat absensi."
          action={
            <button type="button" onClick={openCreate} className="px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg">
              Tambah Kelas Pertama
            </button>
          }
        />
      ) : (
        <>
          <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F7F9FC] text-xs font-semibold text-slate-500">
                    <th className="py-3 px-5">Kode</th>
                    <th className="py-3 px-5">Nama Kelas</th>
                    <th className="py-3 px-5">Tingkat</th>
                    <th className="py-3 px-5">Tahun Ajaran</th>
                    <th className="py-3 px-5 text-right">Siswa</th>
                    <th className="py-3 px-5 text-right">Mapel</th>
                    <th className="py-3 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {classes.map((cls) => (
                    <tr key={cls.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-5 font-mono-num text-xs font-semibold text-[#3478C8]">{cls.code}</td>
                      <td className="py-3 px-5">
                        <p className="font-semibold text-[#142B4A]">{cls.name}</p>
                        {cls.description && <p className="text-xs text-slate-500 truncate max-w-xs">{cls.description}</p>}
                      </td>
                      <td className="py-3 px-5 text-slate-600">{cls.grade_level}</td>
                      <td className="py-3 px-5 font-mono-num text-slate-600">{cls.academic_year}</td>
                      <td className="py-3 px-5 text-right font-mono-num font-medium text-[#142B4A]">{cls.student_count}</td>
                      <td className="py-3 px-5 text-right font-mono-num font-medium text-[#142B4A]">{cls.subject_count}</td>
                      <td className="py-3 px-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button type="button" onClick={() => openDetail(cls.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-[#3478C8] hover:bg-[#EAF2FB]">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => openEdit(cls)} className="p-1.5 rounded-lg text-slate-500 hover:text-[#142B4A] hover:bg-slate-100">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => setDeleteTarget(cls)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Kelas' : 'Tambah Kelas Baru'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Kode Kelas</label>
              <input type="text" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Tahun Ajaran</label>
              <input type="text" required value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Nama Kelas</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Tingkat / Level</label>
            <input type="text" required value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: e.target.value })} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Deskripsi (Opsional)</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg">Batal</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg">{saving ? 'Menyimpan...' : 'Simpan Kelas'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title={detail ? `${detail.name} (${detail.code})` : 'Detail Kelas'} maxWidth="max-w-3xl">
        {detail && (
          <div className="space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold text-[#142B4A]">Daftar Siswa ({detail.students.length})</h3>
                <div className="flex items-center gap-2">
                  <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white">
                    <option value="">Pilih siswa untuk dimasukkan...</option>
                    {allStudents.filter((s) => !detail.students.some((ds) => ds.id === s.id)).map((s) => (
                      <option key={s.id} value={s.id}>{s.full_name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={assignStudent} disabled={!selectedStudentId} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#3478C8] rounded-lg disabled:opacity-40">
                    <UserPlus className="w-3.5 h-3.5" /> Tambah
                  </button>
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-52 overflow-y-auto">
                {detail.students.map((st) => (
                  <div key={st.id} className="px-4 py-2.5 flex items-center justify-between text-sm">
                    <span>{st.full_name}</span>
                    <button type="button" onClick={() => removeStudent(st.id)} className="text-xs font-medium text-red-600 hover:underline">Keluarkan</button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold text-[#142B4A]">Mata Pelajaran ({detail.subjects.length})</h3>
                <div className="flex items-center gap-2">
                  <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white">
                    <option value="">Hubungkan mata pelajaran...</option>
                    {allSubjects.filter((sub) => !detail.subjects.some((ds) => ds.id === sub.id)).map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.code} — {sub.name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={assignSubject} disabled={!selectedSubjectId} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#142B4A] rounded-lg disabled:opacity-40">
                    <BookPlus className="w-3.5 h-3.5" /> Hubungkan
                  </button>
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                {detail.subjects.map((sub) => (
                  <div key={sub.id} className="px-4 py-2.5 flex items-center justify-between text-sm">
                    <span>{sub.code} — {sub.name}</span>
                    <button type="button" onClick={() => removeSubject(sub.id)} className="text-xs font-medium text-red-600 hover:underline">Lepas</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Kelas"
        message={`Apakah Anda yakin ingin menghapus kelas "${deleteTarget?.name}"?`}
      />
    </div>
  );
}
