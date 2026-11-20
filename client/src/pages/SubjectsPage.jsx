import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { PageHeader, Modal, ConfirmDialog, EmptyState, ErrorState, TableSkeleton } from '../components/ui.jsx';

export default function SubjectsPage() {
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', description: '', class_ids: [] });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [subRes, clsRes] = await Promise.all([api.get('/subjects', { params: { search } }), api.get('/classes', { params: { limit: 100 } })]);
      setSubjects(subRes.data.data);
      setClasses(clsRes.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: '', name: '', description: '', class_ids: [] });
    setFormOpen(true);
  };

  const openEdit = (sub) => {
    setEditing(sub);
    setForm({ code: sub.code, name: sub.name, description: sub.description || '', class_ids: sub.classes.map((c) => c.id) });
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
        await api.put(`/subjects/${editing.id}`, form);
        showToast('Mata pelajaran berhasil diperbarui.');
      } else {
        await api.post('/subjects', form);
        showToast('Mata pelajaran baru berhasil ditambahkan.');
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
      await api.delete(`/subjects/${deleteTarget.id}`);
      showToast('Mata pelajaran berhasil dihapus.');
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
        title="Mata Pelajaran"
        subtitle="Kelola kurikulum, kode mata pelajaran, dan relasinya dengan kelas."
        action={
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg hover:bg-[#2a65ac]">
            <Plus className="w-4 h-4" /> Tambah Mapel
          </button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari kode atau nama mata pelajaran..." className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg" />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : subjects.length === 0 ? (
        <EmptyState
          title="Belum ada mata pelajaran"
          description="Tambahkan mata pelajaran atau topik bimbingan yang Anda ajarkan lalu hubungkan ke kelas."
          action={<button type="button" onClick={openCreate} className="px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg">Tambah Mata Pelajaran</button>}
        />
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F7F9FC] text-xs font-semibold text-slate-500">
                  <th className="py-3 px-5">Kode</th>
                  <th className="py-3 px-5">Mata Pelajaran</th>
                  <th className="py-3 px-5">Deskripsi</th>
                  <th className="py-3 px-5">Kelas Terhubung</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-5 font-mono-num text-xs font-semibold text-[#3478C8]">{sub.code}</td>
                    <td className="py-3 px-5 font-semibold text-[#142B4A]">{sub.name}</td>
                    <td className="py-3 px-5 text-xs text-slate-500 max-w-xs truncate">{sub.description || '-'}</td>
                    <td className="py-3 px-5 text-xs text-slate-600">{sub.classes.length > 0 ? sub.classes.map((c) => c.name).join(' · ') : 'Belum dihubungkan'}</td>
                    <td className="py-3 px-5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button type="button" onClick={() => openEdit(sub)} className="p-1.5 text-slate-500 hover:text-[#142B4A]"><Pencil className="w-4 h-4" /></button>
                        <button type="button" onClick={() => setDeleteTarget(sub)} className="p-1.5 text-slate-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Kode Mapel</label>
              <input type="text" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Nama Mata Pelajaran</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Deskripsi (Opsional)</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#142B4A] mb-2">Hubungkan ke Kelas</label>
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
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Hapus Mata Pelajaran" message={`Hapus mata pelajaran "${deleteTarget?.name}"?`} />
    </div>
  );
}
