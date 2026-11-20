import { pool } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { logAudit } from '../services/auditService.js';

export async function listSchedules(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const classId = Number(req.query.classId) || null;
    const day = String(req.query.day || '').trim();

    const conditions = ['sch.workspace_id = ?'];
    const params = [wsId];
    if (classId) {
      conditions.push('sch.class_id = ?');
      params.push(classId);
    }
    if (day) {
      conditions.push('sch.day_of_week = ?');
      params.push(day);
    }

    const [rows] = await pool.execute(
      `SELECT sch.*, c.name AS class_name, c.code AS class_code, sub.name AS subject_name, sub.code AS subject_code
       FROM schedules sch
       JOIN classes c ON c.id = sch.class_id
       JOIN subjects sub ON sub.id = sch.subject_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY FIELD(sch.day_of_week, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'), sch.start_time ASC`,
      params
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

export async function createSchedule(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const { class_id, subject_id, day_of_week, start_time, end_time, room } = req.body;
    if (start_time >= end_time) throw new AppError('Jam selesai harus lebih akhir dari jam mulai.', 400);

    const [cls] = await pool.execute('SELECT name FROM classes WHERE id = ? AND workspace_id = ?', [Number(class_id), wsId]);
    const [sub] = await pool.execute('SELECT name FROM subjects WHERE id = ? AND workspace_id = ?', [Number(subject_id), wsId]);
    if (cls.length === 0 || sub.length === 0) throw new AppError('Kelas atau mata pelajaran tidak ditemukan.', 404);

    const [result] = await pool.execute(
      'INSERT INTO schedules (workspace_id, class_id, subject_id, day_of_week, start_time, end_time, room) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [wsId, Number(class_id), Number(subject_id), day_of_week, start_time, end_time, room || null]
    );

    await logAudit(
      wsId,
      req.auth.userId,
      'CREATE',
      'schedule',
      result.insertId,
      `Menambahkan jadwal ${sub[0].name} (${cls[0].name}) - ${day_of_week} ${start_time}`
    );
    const [created] = await pool.execute('SELECT * FROM schedules WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Jadwal berhasil ditambahkan.', data: created[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateSchedule(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const id = Number(req.params.id);
    const [existing] = await pool.execute('SELECT id FROM schedules WHERE id = ? AND workspace_id = ?', [id, wsId]);
    if (existing.length === 0) throw new AppError('Jadwal tidak ditemukan.', 404);

    const { class_id, subject_id, day_of_week, start_time, end_time, room } = req.body;
    if (start_time >= end_time) throw new AppError('Jam selesai harus lebih akhir dari jam mulai.', 400);

    await pool.execute(
      'UPDATE schedules SET class_id = ?, subject_id = ?, day_of_week = ?, start_time = ?, end_time = ?, room = ? WHERE id = ? AND workspace_id = ?',
      [Number(class_id), Number(subject_id), day_of_week, start_time, end_time, room || null, id, wsId]
    );

    await logAudit(wsId, req.auth.userId, 'UPDATE', 'schedule', id, `Memperbarui jadwal mengajar hari ${day_of_week}`);
    const [updated] = await pool.execute('SELECT * FROM schedules WHERE id = ?', [id]);
    res.json({ message: 'Jadwal berhasil diperbarui.', data: updated[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteSchedule(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const id = Number(req.params.id);
    const [existing] = await pool.execute('SELECT id FROM schedules WHERE id = ? AND workspace_id = ?', [id, wsId]);
    if (existing.length === 0) throw new AppError('Jadwal tidak ditemukan.', 404);

    await pool.execute('DELETE FROM schedules WHERE id = ? AND workspace_id = ?', [id, wsId]);
    await logAudit(wsId, req.auth.userId, 'DELETE', 'schedule', id, 'Menghapus jadwal mengajar');
    res.json({ message: 'Jadwal berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
}
