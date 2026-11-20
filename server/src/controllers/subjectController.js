import { pool, withTransaction } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { logAudit } from '../services/auditService.js';

export async function listSubjects(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const search = String(req.query.search || '').trim();
    const where = search ? 'WHERE s.workspace_id = ? AND (s.name LIKE ? OR s.code LIKE ?)' : 'WHERE s.workspace_id = ?';
    const params = search ? [wsId, `%${search}%`, `%${search}%`] : [wsId];

    const [subjects] = await pool.execute(`SELECT s.* FROM subjects s ${where} ORDER BY s.name ASC`, params);
    const data = await Promise.all(
      subjects.map(async (sub) => {
        const [classes] = await pool.execute(
          `SELECT c.id, c.code, c.name
           FROM classes c
           JOIN class_subjects cs ON cs.class_id = c.id
           WHERE cs.subject_id = ? AND cs.workspace_id = ?`,
          [sub.id, wsId]
        );
        return { ...sub, classes };
      })
    );

    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function createSubject(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const { code, name, description, class_ids } = req.body;
    const [dup] = await pool.execute('SELECT id FROM subjects WHERE workspace_id = ? AND code = ?', [wsId, code]);
    if (dup.length > 0) throw new AppError('Kode mata pelajaran sudah ada.', 409);

    const id = await withTransaction(async (conn) => {
      const [info] = await conn.execute('INSERT INTO subjects (workspace_id, code, name, description) VALUES (?, ?, ?, ?)', [
        wsId,
        code,
        name,
        description || null,
      ]);
      const subId = info.insertId;
      if (Array.isArray(class_ids)) {
        for (const cid of class_ids) {
          const [valid] = await conn.execute('SELECT id FROM classes WHERE id = ? AND workspace_id = ?', [Number(cid), wsId]);
          if (valid.length > 0) {
            await conn.execute('INSERT IGNORE INTO class_subjects (workspace_id, class_id, subject_id) VALUES (?, ?, ?)', [
              wsId,
              Number(cid),
              subId,
            ]);
          }
        }
      }
      return subId;
    });

    await logAudit(wsId, req.auth.userId, 'CREATE', 'subject', id, `Menambahkan mata pelajaran ${name} (${code})`);
    const [created] = await pool.execute('SELECT * FROM subjects WHERE id = ?', [id]);
    res.status(201).json({ message: 'Mata pelajaran berhasil ditambahkan.', data: created[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateSubject(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const id = Number(req.params.id);
    const [existing] = await pool.execute('SELECT id FROM subjects WHERE id = ? AND workspace_id = ?', [id, wsId]);
    if (existing.length === 0) throw new AppError('Mata pelajaran tidak ditemukan.', 404);

    const { code, name, description, class_ids } = req.body;
    const [dup] = await pool.execute('SELECT id FROM subjects WHERE workspace_id = ? AND code = ? AND id != ?', [wsId, code, id]);
    if (dup.length > 0) throw new AppError('Kode mata pelajaran sudah digunakan.', 409);

    await withTransaction(async (conn) => {
      await conn.execute('UPDATE subjects SET code = ?, name = ?, description = ? WHERE id = ? AND workspace_id = ?', [
        code,
        name,
        description || null,
        id,
        wsId,
      ]);
      if (Array.isArray(class_ids)) {
        await conn.execute('DELETE FROM class_subjects WHERE workspace_id = ? AND subject_id = ?', [wsId, id]);
        for (const cid of class_ids) {
          const [valid] = await conn.execute('SELECT id FROM classes WHERE id = ? AND workspace_id = ?', [Number(cid), wsId]);
          if (valid.length > 0) {
            await conn.execute('INSERT IGNORE INTO class_subjects (workspace_id, class_id, subject_id) VALUES (?, ?, ?)', [
              wsId,
              Number(cid),
              id,
            ]);
          }
        }
      }
    });

    await logAudit(wsId, req.auth.userId, 'UPDATE', 'subject', id, `Memperbarui mata pelajaran ${name}`);
    const [updated] = await pool.execute('SELECT * FROM subjects WHERE id = ?', [id]);
    res.json({ message: 'Mata pelajaran berhasil diperbarui.', data: updated[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteSubject(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const id = Number(req.params.id);
    const [existing] = await pool.execute('SELECT name FROM subjects WHERE id = ? AND workspace_id = ?', [id, wsId]);
    if (existing.length === 0) throw new AppError('Mata pelajaran tidak ditemukan.', 404);

    await pool.execute('DELETE FROM subjects WHERE id = ? AND workspace_id = ?', [id, wsId]);
    await logAudit(wsId, req.auth.userId, 'DELETE', 'subject', id, `Menghapus mata pelajaran ${existing[0].name}`);
    res.json({ message: 'Mata pelajaran berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
}
