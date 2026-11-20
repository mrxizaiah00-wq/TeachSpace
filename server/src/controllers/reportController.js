import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { pool } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

async function fetchReportData(wsId, type, startDate, endDate, classId) {
  if (type === 'students') {
    const conds = ['s.workspace_id = ?'];
    const params = [wsId];
    if (classId) {
      conds.push('EXISTS (SELECT 1 FROM class_students cs WHERE cs.student_id = s.id AND cs.class_id = ?)');
      params.push(classId);
    }
    const [rows] = await pool.execute(
      `SELECT s.student_number AS nis, s.full_name AS nama, s.gender AS jk, s.phone AS telepon, s.status
       FROM students s WHERE ${conds.join(' AND ')} ORDER BY s.full_name ASC`,
      params
    );
    return {
      title: 'Laporan Data Siswa',
      columns: ['NIS', 'Nama Lengkap', 'JK', 'Telepon', 'Status'],
      keys: ['nis', 'nama', 'jk', 'telepon', 'status'],
      rows,
    };
  }

  if (type === 'attendance') {
    const conds = ['ats.workspace_id = ?'];
    const params = [wsId];
    if (startDate) {
      conds.push('ats.session_date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conds.push('ats.session_date <= ?');
      params.push(endDate);
    }
    if (classId) {
      conds.push('ats.class_id = ?');
      params.push(classId);
    }
    const [rows] = await pool.execute(
      `SELECT ats.session_date AS tanggal, c.name AS kelas, st.full_name AS siswa, ar.status, COALESCE(ar.notes, '-') AS catatan
       FROM attendance_records ar
       JOIN attendance_sessions ats ON ats.id = ar.session_id
       JOIN classes c ON c.id = ats.class_id
       JOIN students st ON st.id = ar.student_id
       WHERE ${conds.join(' AND ')}
       ORDER BY ats.session_date DESC, c.name ASC, st.full_name ASC`,
      params
    );
    return {
      title: 'Laporan Absensi Siswa',
      columns: ['Tanggal', 'Kelas', 'Nama Siswa', 'Status', 'Catatan'],
      keys: ['tanggal', 'kelas', 'siswa', 'status', 'catatan'],
      rows,
    };
  }

  if (type === 'grades') {
    const conds = ['a.workspace_id = ?'];
    const params = [wsId];
    if (startDate) {
      conds.push('a.assessment_date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conds.push('a.assessment_date <= ?');
      params.push(endDate);
    }
    if (classId) {
      conds.push('a.class_id = ?');
      params.push(classId);
    }
    const [rows] = await pool.execute(
      `SELECT a.assessment_date AS tanggal, c.name AS kelas, sub.name AS mapel, a.title AS penilaian,
              st.full_name AS siswa, g.score AS nilai, a.passing_score AS kkm,
              CASE WHEN g.score >= a.passing_score THEN 'Tuntas' ELSE 'Belum Tuntas' END AS status
       FROM grades g
       JOIN assessments a ON a.id = g.assessment_id
       JOIN classes c ON c.id = a.class_id
       JOIN subjects sub ON sub.id = a.subject_id
       JOIN students st ON st.id = g.student_id
       WHERE ${conds.join(' AND ')}
       ORDER BY a.assessment_date DESC, st.full_name ASC`,
      params
    );
    return {
      title: 'Laporan Nilai & Ketuntasan Siswa',
      columns: ['Tanggal', 'Kelas', 'Mata Pelajaran', 'Penilaian', 'Siswa', 'Nilai', 'KKM', 'Status'],
      keys: ['tanggal', 'kelas', 'mapel', 'penilaian', 'siswa', 'nilai', 'kkm', 'status'],
      rows,
    };
  }

  if (type === 'classes') {
    const [rows] = await pool.execute(
      `SELECT c.code AS kode, c.name AS nama_kelas, c.grade_level AS tingkat, c.academic_year AS tahun_ajaran,
              (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) AS jumlah_siswa,
              (SELECT COUNT(*) FROM class_subjects csub WHERE csub.class_id = c.id) AS jumlah_mapel
       FROM classes c WHERE c.workspace_id = ? ORDER BY c.name ASC`,
      [wsId]
    );
    return {
      title: 'Laporan Data Kelas',
      columns: ['Kode', 'Nama Kelas', 'Tingkat', 'Tahun Ajaran', 'Siswa', 'Mata Pelajaran'],
      keys: ['kode', 'nama_kelas', 'tingkat', 'tahun_ajaran', 'jumlah_siswa', 'jumlah_mapel'],
      rows,
    };
  }

  throw new AppError('Jenis laporan tidak valid.', 400);
}

export async function getReport(req, res, next) {
  try {
    const report = await fetchReportData(
      req.auth.workspaceId,
      String(req.query.type || 'students'),
      req.query.startDate ? String(req.query.startDate) : undefined,
      req.query.endDate ? String(req.query.endDate) : undefined,
      req.query.classId ? Number(req.query.classId) : null
    );
    res.json(report);
  } catch (err) {
    next(err);
  }
}

export async function exportReportExcel(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const type = String(req.query.type || 'students');
    const report = await fetchReportData(
      wsId,
      type,
      req.query.startDate ? String(req.query.startDate) : undefined,
      req.query.endDate ? String(req.query.endDate) : undefined,
      req.query.classId ? Number(req.query.classId) : null
    );

    const [[wsInfo]] = await pool.execute('SELECT name, institution_name FROM workspaces WHERE id = ?', [wsId]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TeachSpace';
    const sheet = workbook.addWorksheet(report.title.slice(0, 31));
    sheet.addRow([report.title]);
    sheet.addRow([`${wsInfo.name}${wsInfo.institution_name ? ` — ${wsInfo.institution_name}` : ''}`]);
    sheet.addRow([`Dicetak: ${new Date().toLocaleDateString('id-ID')}`]);
    sheet.addRow([]);

    const headerRow = sheet.addRow(report.columns);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF142B4A' } };

    for (const row of report.rows) {
      sheet.addRow(report.keys.map((k) => row[k] ?? '-'));
    }

    sheet.columns.forEach((col) => {
      col.width = 20;
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="teachspace-${type}-report.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
}

export async function exportReportPdf(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const type = String(req.query.type || 'students');
    const report = await fetchReportData(
      wsId,
      type,
      req.query.startDate ? String(req.query.startDate) : undefined,
      req.query.endDate ? String(req.query.endDate) : undefined,
      req.query.classId ? Number(req.query.classId) : null
    );

    const [[wsInfo]] = await pool.execute('SELECT name, institution_name FROM workspaces WHERE id = ?', [wsId]);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="teachspace-${type}-report.pdf"`);

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: report.columns.length > 5 ? 'landscape' : 'portrait' });
    doc.pipe(res);

    doc.fillColor('#142B4A').fontSize(18).text(report.title);
    doc.fillColor('#475569').fontSize(10).text(`${wsInfo.name}${wsInfo.institution_name ? ` · ${wsInfo.institution_name}` : ''}`);
    doc.text(`Dicetak pada ${new Date().toLocaleDateString('id-ID')}`);
    doc.moveDown(1);

    const startX = 40;
    const usableWidth = doc.page.width - 80;
    const colWidth = usableWidth / report.columns.length;
    let y = doc.y;

    doc.rect(startX, y, usableWidth, 22).fill('#142B4A');
    doc.fillColor('#FFFFFF').fontSize(9);
    report.columns.forEach((col, i) => {
      doc.text(col, startX + i * colWidth + 6, y + 6, { width: colWidth - 12, ellipsis: true });
    });
    y += 24;

    doc.fontSize(9);
    report.rows.forEach((row, idx) => {
      if (y > doc.page.height - 60) {
        doc.addPage();
        y = 40;
      }
      if (idx % 2 === 1) {
        doc.rect(startX, y - 2, usableWidth, 20).fill('#F7F9FC');
      }
      doc.fillColor('#142B4A');
      report.keys.forEach((k, i) => {
        doc.text(String(row[k] ?? '-'), startX + i * colWidth + 6, y + 3, { width: colWidth - 12, ellipsis: true });
      });
      y += 20;
    });

    doc.end();
  } catch (err) {
    next(err);
  }
}
