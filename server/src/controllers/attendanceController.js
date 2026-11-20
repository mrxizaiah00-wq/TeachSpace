import { pool, withTransaction } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { logAudit } from '../services/auditService.js';

export async function listAttendanceSessions(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const classId = Number(req.query.classId) || null;
    const where = classId ? 'WHERE s.workspace_id = ? AND s.class_id = ?' : 'WHERE s.workspace_id = ?';
    const params = classId ? [wsId, classId] : [wsId];

    const [sessions] = await pool.execute(
      `SELECT s.*, c.name AS class_name, c.code AS class_code,
              COUNT(r.id) AS total_students,
              SUM(CASE WHEN r.status = 'hadir' THEN 1 ELSE 0 END) AS hadir_count,
              SUM(CASE WHEN r.status = 'izin' THEN 1 ELSE 0 END) AS izin_count,
              SUM(CASE WHEN r.status = 'sakit' THEN 1 ELSE 0 END) AS sakit_count,
              SUM(CASE WHEN r.status = 'alpa' THEN 1 ELSE 0 END) AS alpa_count
       FROM attendance_sessions s
       JOIN classes c ON c.id = s.class_id
       LEFT JOIN attendance_records r ON r.session_id = s.id
       ${where}
       GROUP BY s.id
       ORDER BY s.session_date DESC, s.id DESC`,
      params
    );
    res.json({ data: sessions });
  } catch (err) {
    next(err);
  }
}

export async function getAttendanceSheet(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const classId = Number(req.query.classId);
    const date = String(req.query.date || new Date().toISOString().slice(0, 10));
    if (!classId) throw new AppError('Kelas wajib dipilih.', 400);

    const [clsRows] = await pool.execute('SELECT id, name, code FROM classes WHERE id = ? AND workspace_id = ?', [classId, wsId]);
    if (clsRows.length === 0) throw new AppError('Kelas tidak ditemukan.', 404);

    const [sessRows] = await pool.execute(
      'SELECT * FROM attendance_sessions WHERE workspace_id = ? AND class_id = ? AND session_date = ?',
      [wsId, classId, date]
    );
    const session = sessRows[0] || null;

    const [students] = await pool.execute(
      `SELECT st.id AS student_id, st.student_number, st.full_name, st.gender,
              COALESCE(ar.status, 'hadir') AS status,
              COALESCE(ar.notes, '') AS notes
       FROM class_students cs
       JOIN students st ON st.id = cs.student_id
       LEFT JOIN attendance_records ar ON ar.student_id = st.id AND ar.session_id = ?
       WHERE cs.class_id = ? AND cs.workspace_id = ? AND st.status = 'aktif'
       ORDER BY st.full_name ASC`,
      [session ? session.id : -1, classId, wsId]
    );

    res.json({ classInfo: clsRows[0], session, date, students });
  } catch (err) {
    next(err);
  }
}

export async function saveAttendanceSheet(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const { class_id, session_date, topic, records } = req.body;
    const [cls] = await pool.execute('SELECT name FROM classes WHERE id = ? AND workspace_id = ?', [Number(class_id), wsId]);
    if (cls.length === 0) throw new AppError('Kelas tidak ditemukan.', 404);

    const sessionId = await withTransaction(async (conn) => {
      const [existing] = await conn.execute(
        'SELECT id FROM attendance_sessions WHERE workspace_id = ? AND class_id = ? AND session_date = ?',
        [wsId, Number(class_id), session_date]
      );

      let sid;
      if (existing.length === 0) {
        const [ins] = await conn.execute(
          'INSERT INTO attendance_sessions (workspace_id, class_id, session_date, topic) VALUES (?, ?, ?, ?)',
          [wsId, Number(class_id), session_date, topic || null]
        );
        sid = ins.insertId;
      } else {
        sid = existing[0].id;
        await conn.execute('UPDATE attendance_sessions SET topic = ? WHERE id = ?', [topic || null, sid]);
      }

      const validStatuses = new Set(['hadir', 'izin', 'sakit', 'alpa']);
      for (const rec of records) {
        const studentId = Number(rec.student_id);
        const [validStu] = await conn.execute('SELECT id FROM students WHERE id = ? AND workspace_id = ?', [studentId, wsId]);
        if (validStu.length === 0) continue;

        const st = validStatuses.has(rec.status) ? rec.status : 'hadir';
        await conn.execute(
          `INSERT INTO attendance_records (workspace_id, session_id, student_id, status, notes)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes)`,
          [wsId, sid, studentId, st, rec.notes || null]
        );
      }
      return sid;
    });

    await logAudit(wsId, req.auth.userId, 'UPDATE', 'attendance', sessionId, `Menyimpan absensi ${cls[0].name} tanggal ${session_date}`);
    res.json({ message: 'Data absensi berhasil disimpan.', sessionId });
  } catch (err) {
    next(err);
  }
}

export async function getAttendanceRecap(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const classId = Number(req.query.classId) || null;
    const where = classId ? 'WHERE cs.workspace_id = ? AND cs.class_id = ?' : 'WHERE cs.workspace_id = ?';
    const params = classId ? [wsId, classId] : [wsId];

    const [rows] = await pool.execute(
      `SELECT st.id AS student_id, st.student_number, st.full_name, c.name AS class_name,
              COUNT(ar.id) AS total_sessions,
              SUM(CASE WHEN ar.status = 'hadir' THEN 1 ELSE 0 END) AS hadir,
              SUM(CASE WHEN ar.status = 'izin' THEN 1 ELSE 0 END) AS izin,
              SUM(CASE WHEN ar.status = 'sakit' THEN 1 ELSE 0 END) AS sakit,
              SUM(CASE WHEN ar.status = 'alpa' THEN 1 ELSE 0 END) AS alpa
       FROM class_students cs
       JOIN students st ON st.id = cs.student_id
       JOIN classes c ON c.id = cs.class_id
       LEFT JOIN attendance_sessions ats ON ats.class_id = c.id AND ats.workspace_id = cs.workspace_id
       LEFT JOIN attendance_records ar ON ar.session_id = ats.id AND ar.student_id = st.id
       ${where}
       GROUP BY st.id, st.student_number, st.full_name, c.id, c.name
       ORDER BY c.name ASC, st.full_name ASC`,
      params
    );

    const data = rows.map((row) => ({
      ...row,
      total_sessions: Number(row.total_sessions),
      hadir: Number(row.hadir) || 0,
      izin: Number(row.izin) || 0,
      sakit: Number(row.sakit) || 0,
      alpa: Number(row.alpa) || 0,
      percentage: Number(row.total_sessions) > 0 ? Math.round(((Number(row.hadir) || 0) / Number(row.total_sessions)) * 1000) / 10 : 0,
    }));

    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function deleteAttendanceSession(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const id = Number(req.params.id);
    const [existing] = await pool.execute('SELECT id FROM attendance_sessions WHERE id = ? AND workspace_id = ?', [id, wsId]);
    if (existing.length === 0) throw new AppError('Sesi absensi tidak ditemukan.', 404);

    await pool.execute('DELETE FROM attendance_sessions WHERE id = ? AND workspace_id = ?', [id, wsId]);
    res.json({ message: 'Sesi absensi berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
}
