import { useEffect, useState, useCallback } from 'react';
import { Upload, Download, Trash2, Search, FileText } from 'lucide-react';
import { api, downloadFile, getErrorMessage } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { formatBytes } from '../utils/formatters.js';
import { PageHeader, Modal, ConfirmDialog, EmptyState, ErrorState, TableSkeleton } from '../components/ui.jsx';

export default function MaterialsPage() {
  const { showToast } = useToast();
  const [materials, setMaterials] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('modul');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [file, setFile] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [matRes, clsRes, subRes] = await Promise.all([
        api.get('/materials', { params: { search, category: categoryFilter, classId: classFilter || undefined } }),
        api.get('/classes', { params: { limit: 100 } }),
        api.get('/subjects'),
      ]);
      setMaterials(matRes.data.data);
      setClasses(clsRes.data.data);
      setSubjects(subRes.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, classFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return showToast('Pilih file materi terlebih dahulu.', 'error');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      if (classId) formData.append('class_id', classId);
      if (subjectId) formData.append('subject_id', subjectId);
      formData.append('file', file);

      await api.post('/materials', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('Materi berhasil diunggah.');
      setUploadOpen(false);
      setTitle('');
      setDescription('');
      setFile(null);
      loadData();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/materials/${deleteTarget.id}`);
      showToast('Materi dihapus.');
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Materi Pembelajaran"
        subtitle="Simpan dan kelola modul PDF, DOCX, PPTX, serta gambar pembelajaran."
        action={
          <button type="button" onClick={() => setUploadOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg hover:bg-[#2a65ac]">
            <Upload className="w-4 h-4" /> Unggah Materi
          </button>
        }
      />

      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari judul materi..." className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg">
          <option value="">Semua Kategori</option>
          <option value="modul">Modul</option><option value="slide">Slide Presentasi</option><option value="latihan">Latihan Soal</option><option value="referensi">Referensi</option>
        </select>
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg">
          <option value="">Semua Kelas</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : materials.length === 0 ? (
        <EmptyState title="Belum ada materi pembelajaran" description="Unggah file PDF, DOCX, PPTX, atau gambar hingga 10 MB." action={<button type="button" onClick={() => setUploadOpen(true)} className="px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg">Unggah Materi Pertama</button>} />
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F7F9FC] text-xs font-semibold text-slate-500">
                  <th className="py-3 px-5">Materi</th>
                  <th className="py-3 px-5">Kategori</th>
                  <th className="py-3 px-5">Kelas & Mapel</th>
                  <th className="py-3 px-5 text-right">Ukuran</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {materials.map((m) => (
                  <tr key={m.id}>
                    <td className="py-3 px-5">
                      <div className="flex items-start gap-2.5">
                        <FileText className="w-4 h-4 text-[#3478C8] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#142B4A]">{m.title}</p>
                          <p className="text-xs text-slate-500">{m.original_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 capitalize text-xs font-medium">{m.category}</td>
                    <td className="py-3 px-5 text-xs text-slate-600">{[m.class_name, m.subject_name].filter(Boolean).join(' · ') || 'Umum'}</td>
                    <td className="py-3 px-5 text-right font-mono-num text-xs">{formatBytes(m.file_size)}</td>
                    <td className="py-3 px-5 text-right">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await downloadFile(`/materials/${m.id}/download`, m.original_name || 'materi');
                          } catch (err) {
                            showToast(getErrorMessage(err), 'error');
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#3478C8] bg-[#EAF2FB] rounded-md mr-2"
                      >
                        <Download className="w-3.5 h-3.5" /> Unduh
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(m)} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Unggah Materi Pembelajaran">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Judul Materi</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Kategori</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
                <option value="modul">Modul</option><option value="slide">Slide</option><option value="latihan">Latihan Soal</option><option value="referensi">Referensi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Kelas</label>
              <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
                <option value="">Umum</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Mapel</label>
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
                <option value="">Umum</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#142B4A] mb-1.5">Deskripsi</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#142B4A] mb-1.5">File Materi (PDF, DOCX, PPTX, JPG/PNG, maks. 10 MB)</label>
            <input type="file" required accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-600" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setUploadOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg">Batal</button>
            <button type="submit" disabled={uploading} className="px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] rounded-lg">{uploading ? 'Mengunggah...' : 'Unggah'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Hapus Materi" message={`Hapus file materi "${deleteTarget?.title}"?`} />
    </div>
  );
}
