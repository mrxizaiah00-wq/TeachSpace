import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { PageHeader, Modal, ConfirmDialog, EmptyState, ErrorState, TableSkeleton, Pagination } from '../components/ui.jsx';

export default function StudentsPage() {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    student_number: '',
    full_name: '',
    gender: 'L',
    birth_date: '',
    address: '',
    phone: '',
    status: 'aktif',
    class_ids: [],
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [detail, setDetail] = useState(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [stuRes, clsRes] = await Promise.all([
        api.get('/students', { params: { search, status: statusFilter, classId: classFilter || undefined, page, limit: 12 } }),
        api.get('/classes', { params: { limit: 100 } }),
      ]);
      setStudents(stuRes.data.data);
      setTotalPages(stuRes.data.meta.totalPages || 1);
      setClasses(clsRes.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, classFilter, page]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const openCreate = () => {
    setEditing(null);
    setForm({ student_number: '', full_name: '', gender: 'L', birth_date: '', address: '', phone: '', status: 'aktif', class_ids: [] });
    setFormOpen(true);
  };

  const openEdit = (st) => {
    setEditing(st);
    setForm({
      student_number: st.student_number || '',
      full_name: st.full_name,
      gender: st.gender,
      birth_date: st.birth_date || '',
      address: st.address || '',
      phone: st.phone || '',
      status: st.status,
      class_ids: st.classes.map((c) => c.id),
    });
    setFormOpen(true);
  };

  const toggleClass = (cid) => {
    setForm((prev) => ({
      ...prev,
      class_ids: prev.class_ids.includes(cid) ? prev.class_ids.filter((x) => x !== cid) : [...prev.class_ids, cid],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/students/${editing.id}`, form);
        showToast('Data siswa berhasil diperbarui.');
      } else {
        await api.post('/students', form);
        showToast('Siswa baru berhasil ditambahkan.');
      }
      setFormOpen(false);
      loadStudents();
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
      await api.delete(`/students/${deleteTarget.id}`);
      showToast('Data siswa berhasil dihapus.');
      setDeleteTarget(null);
      loadStudents();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const openDetail = async (id) => {
    try {
      const { data } = await api.get(`/students/${id}`);
      setDetail(data.data);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Siswa"
        subtitle="Kelola biodata siswa, status keaktifan, dan penempatan ke dalam kelas."
        action={
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg hover:bg-[#2a65ac]">
            <Plus className="w-4 h-4" /> Tambah Siswa
          </button>
        }
      />

      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama, NIS, atau telepon..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg"
          />
        </div>
        <select value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setPage(1); }} className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg">
          <option value="">Semua Kelas</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg">
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
          <option value="lulus">Lulus</option>
        </select>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadStudents} />
      ) : students.length === 0 ? (
        <EmptyState
          title="Belum ada data siswa"
          description="Tambahkan siswa dan tempatkan ke kelas agar dapat mengikuti sesi absensi serta penilaian."
          action={<button type="button" onClick={openCreate} className="px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg">Tambah Siswa</button>}
        />
      ) : (
        <>
          <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F7F9FC] text-xs font-semibold text-slate-500">
                    <th className="py-3 px-5">NIS</th>
                    <th className="py-3 px-5">Nama Lengkap</th>
                    <th className="py-3 px-5">JK</th>
                    <th className="py-3 px-5">Kelas</th>
                    <th className="py-3 px-5">Telepon</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-5 font-mono-num text-xs text-slate-500">{st.student_number || '-'}</td>
                      <td className="py-3 px-5 font-semibold text-[#142B4A]">{st.full_name}</td>
                      <td className="py-3 px-5 text-slate-600">{st.gender}</td>
                      <td className="py-3 px-5 text-xs text-slate-600">{st.classes.length > 0 ? st.classes.map((c) => c.name).join(' · ') : 'Belum ditempatkan'}</td>
                      <td className="py-3 px-5 font-mono-num text-xs text-slate-600">{st.phone || '-'}</td>
                      <td className="py-3 px-5 text-xs font-semibold capitalize">{st.status}</td>
                      <td className="py-3 px-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button type="button" onClick={() => openDetail(st.id)} className="p-1.5 text-slate-500 hover:text-[#3478C8]"><Eye className="w-4 h-4" /></button>
                          <button type="button" onClick={() => openEdit(st)} className="p-1.5 text-slate-500 hover:text-[#142B4A]"><Pencil className="w-4 h-4" /></button>
                          <button type="button" onClick={() => setDeleteTarget(st)} className="p-1.5 text-slate-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Data Siswa' : 'Tambah Siswa Baru'} maxWidth="max-w-xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">NIS (Opsional)</label>
              <input type="text" value={form.student_number} onChange={(e) => setForm({ ...form, student_number: e.target.value })} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Nama Lengkap</label>
              <input type="text" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Jenis Kelamin</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Tanggal Lahir</label>
              <input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
                <option value="lulus">Lulus</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Telepon</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Alamat</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#142B4A] mb-2">Penempatan Kelas</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-3 border border-slate-200 rounded-lg bg-[#F7F9FC]">
              {classes.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-xs text-[#142B4A] cursor-pointer">
                  <input type="checkbox" checked={form.class_ids.includes(c.id)} onChange={() => toggleClass(c.id)} />
                  <span className="truncate">{c.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg">Batal</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg">{saving ? 'Menyimpan...' : 'Simpan Siswa'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title={detail?.full_name || 'Detail Siswa'} maxWidth="max-w-2xl">
        {detail && (
          <div className="space-y-4 text-sm">
            <p className="text-xs text-slate-500">NIS: {detail.student_number || '-'} · Status: {detail.status} · Telepon: {detail.phone || '-'}</p>
            <div>
              <h4 className="font-semibold text-[#142B4A] mb-2">Riwayat Nilai</h4>
              {detail.grades.length === 0 ? (
                <p className="text-xs text-slate-400">Belum ada riwayat nilai.</p>
              ) : (
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                  {detail.grades.map((g, i) => (
                    <div key={i} className="px-4 py-2 flex justify-between text-xs">
                      <span>{g.assessment_title} ({g.subject_name})</span>
                      <span className="font-mono-num font-bold">{g.score} / {g.max_score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Hapus Siswa" message={`Hapus siswa "${deleteTarget?.full_name}"?`} />
    </div>
  );
}
