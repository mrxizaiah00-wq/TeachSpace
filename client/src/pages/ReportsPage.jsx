import { useEffect, useState, useCallback } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { api, downloadFile, getErrorMessage } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { PageHeader, EmptyState, ErrorState, TableSkeleton } from '../components/ui.jsx';

export default function ReportsPage() {
  const [type, setType] = useState('students');
  const [classId, setClassId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [classes, setClasses] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/classes', { params: { limit: 100 } }).then((res) => setClasses(res.data.data)).catch(() => {});
  }, []);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/reports', {
        params: { type, classId: classId || undefined, startDate: startDate || undefined, endDate: endDate || undefined },
      });
      setReport(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [type, classId, startDate, endDate]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const { showToast } = useToast();

  const handleExport = async (format) => {
    try {
      const params = new URLSearchParams({ type });
      if (classId) params.set('classId', classId);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const ext = format === 'excel' ? 'xlsx' : 'pdf';
      await downloadFile(`/reports/export/${format}?${params.toString()}`, `laporan-${type}.${ext}`);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Akademik"
        subtitle="Filter data siswa, absensi, nilai, serta kelas dan ekspor langsung ke Excel atau PDF."
        action={
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={() => handleExport('excel')} className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#142B4A] bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" /> Export Excel
            </button>
            <button type="button" onClick={() => handleExport('pdf')} className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#142B4A] rounded-lg hover:bg-[#1e3d66]">
              <FileText className="w-4 h-4" /> Export PDF
            </button>
          </div>
        }
      />

      <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Jenis Laporan</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="px-3.5 py-2 text-sm border border-slate-200 rounded-lg bg-white">
            <option value="students">Laporan Data Siswa</option>
            <option value="attendance">Laporan Absensi</option>
            <option value="grades">Laporan Nilai</option>
            <option value="classes">Laporan Kelas</option>
          </select>
        </div>
        {type !== 'classes' && (
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Filter Kelas</label>
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className="px-3.5 py-2 text-sm border border-slate-200 rounded-lg bg-white">
              <option value="">Semua Kelas</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        {(type === 'attendance' || type === 'grades') && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Dari Tanggal</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3.5 py-2 text-sm border border-slate-200 rounded-lg font-mono-num" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Sampai Tanggal</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3.5 py-2 text-sm border border-slate-200 rounded-lg font-mono-num" />
            </div>
          </>
        )}
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadReport} />
      ) : !report || report.rows.length === 0 ? (
        <EmptyState title="Tidak ada data untuk laporan ini" description="Ubah filter untuk melihat data." />
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#142B4A]">{report.title}</h2>
            <span className="text-xs font-mono-num text-slate-500">{report.rows.length} baris</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F7F9FC] text-xs font-semibold text-slate-500">
                  {report.columns.map((col) => <th key={col} className="py-3 px-5">{col}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {report.rows.map((row, idx) => (
                  <tr key={idx}>
                    {report.keys.map((k) => <td key={k} className="py-3 px-5 text-slate-700 font-mono-num text-xs sm:text-sm">{String(row[k] ?? '-')}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
