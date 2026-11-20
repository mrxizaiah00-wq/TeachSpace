import { pool } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { logAudit } from '../services/auditService.js';

export async function listClasses(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const search = String(req.query.search || '').trim();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const where = search
      ? 'WHERE c.workspace_id = ? AND (c.name LIKE ? OR c.code LIKE ? OR c.grade_level LIKE ?)'
      : 'WHERE c.workspace_id = ?';
    const params = search ? [wsId, `%${search}%`, `%${search}%`, `%${search}%`] : [wsId];

    const [[{ cnt: total }]] = await pool.execute(`SELECT COUNT(*) AS cnt FROM classes c ${where}`, params);
    const [rows] = await pool.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id AND cs.workspace_id = c.workspace_id) AS student_count,
              (SELECT COUNT(*) FROM class_subjects csub WHERE csub.class_id = c.id AND csub.workspace_id = c.workspace_id) AS subject_count
       FROM classes c
       ${where}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ data: rows, meta: { total: Number(total), page, limit, totalPages: Math.ceil(Number(total) / limit) } });
  } catch (err) {
    next(err);
  }
}

export async function getClassDetail(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const classId = Number(req.params.id);
    const [clsRows] = await pool.execute('SELECT * FROM classes WHERE id = ? AND workspace_id = ?', [classId, wsId]);
    if (clsRows.length === 0) throw new AppError('Kelas tidak ditemukan.', 404);

    const [students] = await pool.execute(
      `SELECT s.*, cs.enrolled_at
       FROM students s
       JOIN class_students cs ON cs.student_id = s.id
       WHERE cs.class_id = ? AND cs.workspace_id = ?
       ORDER BY s.full_name ASC`,
      [classId, wsId]
    );

    const [subjects] = await pool.execute(
      `SELECT sub.*
       FROM subjects sub
       JOIN class_subjects csub ON csub.subject_id = sub.id
       WHERE csub.class_id = ? AND csub.workspace_id = ?
       ORDER BY sub.name ASC`,
      [classId, wsId]
    );

    res.json({ data: { ...clsRows[0], students, subjects } });
  } catch (err) {
    next(err);
  }
}

export async function createClass(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const { code, name, grade_level, academic_year, description } = req.body;
    const [dup] = await pool.execute('SELECT id FROM classes WHERE workspace_id = ? AND code = ?', [wsId, code]);
    if (dup.length > 0) throw new AppError('Kode kelas sudah digunakan di workspace ini.', 409);

    const [result] = await pool.execute(
      'INSERT INTO classes (workspace_id, code, name, grade_level, academic_year, description) VALUES (?, ?, ?, ?, ?, ?)',
      [wsId, code, name, grade_level, academic_year, description || null]
    );

    await logAudit(wsId, req.auth.userId, 'CREATE', 'class', result.insertId, `Menambahkan kelas ${name} (${code})`);
    const [created] = await pool.execute('SELECT * FROM classes WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Kelas berhasil ditambahkan.', data: created[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateClass(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const id = Number(req.params.id);
    const [existing] = await pool.execute('SELECT id FROM classes WHERE id = ? AND workspace_id = ?', [id, wsId]);
    if (existing.length === 0) throw new AppError('Kelas tidak ditemukan.', 404);

    const { code, name, grade_level, academic_year, description } = req.body;
    const [dup] = await pool.execute('SELECT id FROM classes WHERE workspace_id = ? AND code = ? AND id != ?', [wsId, code, id]);
    if (dup.length > 0) throw new AppError('Kode kelas sudah digunakan oleh kelas lain.', 409);

    await pool.execute(
      'UPDATE classes SET code = ?, name = ?, grade_level = ?, academic_year = ?, description = ? WHERE id = ? AND workspace_id = ?',
      [code, name, grade_level, academic_year, description || null, id, wsId]
    );

    await logAudit(wsId, req.auth.userId, 'UPDATE', 'class', id, `Memperbarui kelas ${name}`);
    const [updated] = await pool.execute('SELECT * FROM classes WHERE id = ?', [id]);
    res.json({ message: 'Kelas berhasil diperbarui.', data: updated[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteClass(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const id = Number(req.params.id);
    const [existing] = await pool.execute('SELECT name FROM classes WHERE id = ? AND workspace_id = ?', [id, wsId]);
    if (existing.length === 0) throw new AppError('Kelas tidak ditemukan.', 404);

    await pool.execute('DELETE FROM classes WHERE id = ? AND workspace_id = ?', [id, wsId]);
    await logAudit(wsId, req.auth.userId, 'DELETE', 'class', id, `Menghapus kelas ${existing[0].name}`);
    res.json({ message: 'Kelas berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
}

export async function addStudentToClass(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const classId = Number(req.params.id);
    const studentId = Number(req.body.student_id);

    const [cls] = await pool.execute('SELECT id FROM classes WHERE id = ? AND workspace_id = ?', [classId, wsId]);
    const [stu] = await pool.execute('SELECT id FROM students WHERE id = ? AND workspace_id = ?', [studentId, wsId]);
    if (cls.length === 0 || stu.length === 0) throw new AppError('Kelas atau siswa tidak ditemukan.', 404);

    await pool.execute('INSERT IGNORE INTO class_students (workspace_id, class_id, student_id) VALUES (?, ?, ?)', [
      wsId,
      classId,
      studentId,
    ]);
    res.status(201).json({ message: 'Siswa ditambahkan ke kelas.' });
  } catch (err) {
    next(err);
  }
}

export async function removeStudentFromClass(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    await pool.execute('DELETE FROM class_students WHERE workspace_id = ? AND class_id = ? AND student_id = ?', [
      wsId,
      Number(req.params.id),
      Number(req.params.studentId),
    ]);
    res.json({ message: 'Siswa dikeluarkan dari kelas.' });
  } catch (err) {
    next(err);
  }
}

export async function addSubjectToClass(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const classId = Number(req.params.id);
    const subjectId = Number(req.body.subject_id);

    const [cls] = await pool.execute('SELECT id FROM classes WHERE id = ? AND workspace_id = ?', [classId, wsId]);
    const [sub] = await pool.execute('SELECT id FROM subjects WHERE id = ? AND workspace_id = ?', [subjectId, wsId]);
    if (cls.length === 0 || sub.length === 0) throw new AppError('Kelas atau mata pelajaran tidak ditemukan.', 404);

    await pool.execute('INSERT IGNORE INTO class_subjects (workspace_id, class_id, subject_id) VALUES (?, ?, ?)', [
      wsId,
      classId,
      subjectId,
    ]);
    res.status(201).json({ message: 'Mata pelajaran dihubungkan dengan kelas.' });
  } catch (err) {
    next(err);
  }
}

export async function removeSubjectFromClass(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    await pool.execute('DELETE FROM class_subjects WHERE workspace_id = ? AND class_id = ? AND subject_id = ?', [
      wsId,
      Number(req.params.id),
      Number(req.params.subjectId),
    ]);
    res.json({ message: 'Mata pelajaran dilepaskan dari kelas.' });
  } catch (err) {
    next(err);
  }
}
