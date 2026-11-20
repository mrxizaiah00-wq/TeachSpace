import { pool, withTransaction } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { logAudit } from '../services/auditService.js';

export async function listStudents(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const search = String(req.query.search || '').trim();
    const status = String(req.query.status || '').trim();
    const classId = Number(req.query.classId) || null;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions = ['s.workspace_id = ?'];
    const params = [wsId];
    if (search) {
      conditions.push("(s.full_name LIKE ? OR COALESCE(s.student_number, '') LIKE ? OR COALESCE(s.phone, '') LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      conditions.push('s.status = ?');
      params.push(status);
    }
    if (classId) {
      conditions.push('EXISTS (SELECT 1 FROM class_students cs WHERE cs.student_id = s.id AND cs.class_id = ? AND cs.workspace_id = ?)');
      params.push(classId, wsId);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const [[{ cnt: total }]] = await pool.execute(`SELECT COUNT(*) AS cnt FROM students s ${where}`, params);
    const [students] = await pool.query(`SELECT s.* FROM students s ${where} ORDER BY s.full_name ASC LIMIT ? OFFSET ?`, [
      ...params,
      limit,
      offset,
    ]);

    const enriched = await Promise.all(
      students.map(async (st) => {
        const [classes] = await pool.execute(
          `SELECT c.id, c.name, c.code
           FROM classes c
           JOIN class_students cs ON cs.class_id = c.id
           WHERE cs.student_id = ? AND cs.workspace_id = ?`,
          [st.id, wsId]
        );
        return { ...st, classes };
      })
    );

    res.json({ data: enriched, meta: { total: Number(total), page, limit, totalPages: Math.ceil(Number(total) / limit) } });
  } catch (err) {
    next(err);
  }
}

export async function getStudentDetail(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const id = Number(req.params.id);
    const [rows] = await pool.execute('SELECT * FROM students WHERE id = ? AND workspace_id = ?', [id, wsId]);
    if (rows.length === 0) throw new AppError('Siswa tidak ditemukan.', 404);

    const [classes] = await pool.execute(
      `SELECT c.id, c.code, c.name, c.grade_level, cs.enrolled_at
       FROM classes c
       JOIN class_students cs ON cs.class_id = c.id
       WHERE cs.student_id = ? AND cs.workspace_id = ?`,
      [id, wsId]
    );

    const [attendanceSummary] = await pool.execute(
      'SELECT status, COUNT(*) AS count FROM attendance_records WHERE student_id = ? AND workspace_id = ? GROUP BY status',
      [id, wsId]
    );

    const [grades] = await pool.execute(
      `SELECT g.score, g.feedback, a.title AS assessment_title, a.type, a.assessment_date, a.max_score, a.passing_score,
              sub.name AS subject_name, c.name AS class_name
       FROM grades g
       JOIN assessments a ON a.id = g.assessment_id
       JOIN subjects sub ON sub.id = a.subject_id
       JOIN classes c ON c.id = a.class_id
       WHERE g.student_id = ? AND g.workspace_id = ?
       ORDER BY a.assessment_date DESC`,
      [id, wsId]
    );

    res.json({ data: { ...rows[0], classes, attendanceSummary, grades } });
  } catch (err) {
    next(err);
  }
}

export async function createStudent(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const { student_number, full_name, gender, birth_date, address, phone, status, class_ids } = req.body;

    const createdId = await withTransaction(async (conn) => {
      const [info] = await conn.execute(
        'INSERT INTO students (workspace_id, student_number, full_name, gender, birth_date, address, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [wsId, student_number || null, full_name, gender, birth_date || null, address || null, phone || null, status || 'aktif']
      );
      const sid = info.insertId;

      if (Array.isArray(class_ids)) {
        for (const cid of class_ids) {
          const [valid] = await conn.execute('SELECT id FROM classes WHERE id = ? AND workspace_id = ?', [Number(cid), wsId]);
          if (valid.length > 0) {
            await conn.execute('INSERT IGNORE INTO class_students (workspace_id, class_id, student_id) VALUES (?, ?, ?)', [
              wsId,
              Number(cid),
              sid,
            ]);
          }
        }
      }
      return sid;
    });

    await logAudit(wsId, req.auth.userId, 'CREATE', 'student', createdId, `Menambahkan siswa ${full_name}`);
    const [created] = await pool.execute('SELECT * FROM students WHERE id = ?', [createdId]);
    res.status(201).json({ message: 'Siswa berhasil ditambahkan.', data: created[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateStudent(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const id = Number(req.params.id);
    const [existing] = await pool.execute('SELECT id FROM students WHERE id = ? AND workspace_id = ?', [id, wsId]);
    if (existing.length === 0) throw new AppError('Siswa tidak ditemukan.', 404);

    const { student_number, full_name, gender, birth_date, address, phone, status, class_ids } = req.body;

    await withTransaction(async (conn) => {
      await conn.execute(
        `UPDATE students
         SET student_number = ?, full_name = ?, gender = ?, birth_date = ?, address = ?, phone = ?, status = ?
         WHERE id = ? AND workspace_id = ?`,
        [student_number || null, full_name, gender, birth_date || null, address || null, phone || null, status, id, wsId]
      );

      if (Array.isArray(class_ids)) {
        await conn.execute('DELETE FROM class_students WHERE workspace_id = ? AND student_id = ?', [wsId, id]);
        for (const cid of class_ids) {
          const [valid] = await conn.execute('SELECT id FROM classes WHERE id = ? AND workspace_id = ?', [Number(cid), wsId]);
          if (valid.length > 0) {
            await conn.execute('INSERT IGNORE INTO class_students (workspace_id, class_id, student_id) VALUES (?, ?, ?)', [
              wsId,
              Number(cid),
              id,
            ]);
          }
        }
      }
    });

    await logAudit(wsId, req.auth.userId, 'UPDATE', 'student', id, `Memperbarui data siswa ${full_name}`);
    const [updated] = await pool.execute('SELECT * FROM students WHERE id = ?', [id]);
    res.json({ message: 'Data siswa berhasil diperbarui.', data: updated[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteStudent(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const id = Number(req.params.id);
    const [existing] = await pool.execute('SELECT full_name FROM students WHERE id = ? AND workspace_id = ?', [id, wsId]);
    if (existing.length === 0) throw new AppError('Siswa tidak ditemukan.', 404);

    await pool.execute('DELETE FROM students WHERE id = ? AND workspace_id = ?', [id, wsId]);
    await logAudit(wsId, req.auth.userId, 'DELETE', 'student', id, `Menghapus siswa ${existing[0].full_name}`);
    res.json({ message: 'Siswa berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
}
