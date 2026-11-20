import { pool, withTransaction } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { logAudit } from '../services/auditService.js';

export async function listAssessments(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const classId = Number(req.query.classId) || null;
    const subjectId = Number(req.query.subjectId) || null;

    const conditions = ['a.workspace_id = ?'];
    const params = [wsId];
    if (classId) {
      conditions.push('a.class_id = ?');
      params.push(classId);
    }
    if (subjectId) {
      conditions.push('a.subject_id = ?');
      params.push(subjectId);
    }

    const [rows] = await pool.execute(
      `SELECT a.*, c.name AS class_name, c.code AS class_code, sub.name AS subject_name,
              COUNT(g.id) AS graded_count,
              ROUND(AVG(g.score), 1) AS average_score
       FROM assessments a
       JOIN classes c ON c.id = a.class_id
       JOIN subjects sub ON sub.id = a.subject_id
       LEFT JOIN grades g ON g.assessment_id = a.id
       WHERE ${conditions.join(' AND ')}
       GROUP BY a.id
       ORDER BY a.assessment_date DESC, a.id DESC`,
      params
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

export async function createAssessment(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const { class_id, subject_id, title, type, assessment_date, max_score, passing_score } = req.body;

    const [cls] = await pool.execute('SELECT id FROM classes WHERE id = ? AND workspace_id = ?', [Number(class_id), wsId]);
    const [sub] = await pool.execute('SELECT id FROM subjects WHERE id = ? AND workspace_id = ?', [Number(subject_id), wsId]);
    if (cls.length === 0 || sub.length === 0) throw new AppError('Kelas atau mata pelajaran tidak ditemukan.', 404);

    const [result] = await pool.execute(
      `INSERT INTO assessments (workspace_id, class_id, subject_id, title, type, assessment_date, max_score, passing_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [wsId, Number(class_id), Number(subject_id), title, type, assessment_date, Number(max_score), Number(passing_score)]
    );

    await logAudit(wsId, req.auth.userId, 'CREATE', 'assessment', result.insertId, `Membuat penilaian ${title}`);
    const [created] = await pool.execute('SELECT * FROM assessments WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Penilaian berhasil dibuat.', data: created[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateAssessment(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const id = Number(req.params.id);
    const [existing] = await pool.execute('SELECT id FROM assessments WHERE id = ? AND workspace_id = ?', [id, wsId]);
    if (existing.length === 0) throw new AppError('Penilaian tidak ditemukan.', 404);

    const { title, type, assessment_date, max_score, passing_score } = req.body;
    await pool.execute(
      'UPDATE assessments SET title = ?, type = ?, assessment_date = ?, max_score = ?, passing_score = ? WHERE id = ? AND workspace_id = ?',
      [title, type, assessment_date, Number(max_score), Number(passing_score), id, wsId]
    );

    res.json({ message: 'Penilaian berhasil diperbarui.' });
  } catch (err) {
    next(err);
  }
}

export async function deleteAssessment(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const id = Number(req.params.id);
    const [existing] = await pool.execute('SELECT title FROM assessments WHERE id = ? AND workspace_id = ?', [id, wsId]);
    if (existing.length === 0) throw new AppError('Penilaian tidak ditemukan.', 404);

    await pool.execute('DELETE FROM assessments WHERE id = ? AND workspace_id = ?', [id, wsId]);
    await logAudit(wsId, req.auth.userId, 'DELETE', 'assessment', id, `Menghapus penilaian ${existing[0].title}`);
    res.json({ message: 'Penilaian berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
}

export async function getAssessmentGrades(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const assessmentId = Number(req.params.id);
    const [assRows] = await pool.execute(
      `SELECT a.*, c.name AS class_name, sub.name AS subject_name
       FROM assessments a
       JOIN classes c ON c.id = a.class_id
       JOIN subjects sub ON sub.id = a.subject_id
       WHERE a.id = ? AND a.workspace_id = ?`,
      [assessmentId, wsId]
    );
    const assessment = assRows[0];
    if (!assessment) throw new AppError('Penilaian tidak ditemukan.', 404);

    const [students] = await pool.execute(
      `SELECT st.id AS student_id, st.student_number, st.full_name,
              g.score, COALESCE(g.feedback, '') AS feedback
       FROM class_students cs
       JOIN students st ON st.id = cs.student_id
       LEFT JOIN grades g ON g.student_id = st.id AND g.assessment_id = ?
       WHERE cs.class_id = ? AND cs.workspace_id = ?
       ORDER BY st.full_name ASC`,
      [assessmentId, assessment.class_id, wsId]
    );

    const enriched = students.map((row) => ({
      ...row,
      score: row.score !== null ? Number(row.score) : null,
      passed: row.score !== null ? Number(row.score) >= Number(assessment.passing_score) : null,
    }));

    const scored = enriched.filter((r) => r.score !== null);
    const averageScore =
      scored.length > 0 ? Math.round((scored.reduce((acc, s) => acc + s.score, 0) / scored.length) * 10) / 10 : 0;

    res.json({
      assessment,
      summary: {
        totalStudents: enriched.length,
        gradedCount: scored.length,
        averageScore,
        passedCount: scored.filter((s) => s.passed).length,
      },
      students: enriched,
    });
  } catch (err) {
    next(err);
  }
}

export async function saveAssessmentGrades(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const assessmentId = Number(req.params.id);
    const [assRows] = await pool.execute('SELECT id, title, max_score FROM assessments WHERE id = ? AND workspace_id = ?', [
      assessmentId,
      wsId,
    ]);
    const assessment = assRows[0];
    if (!assessment) throw new AppError('Penilaian tidak ditemukan.', 404);

    await withTransaction(async (conn) => {
      for (const item of req.body.grades) {
        const sid = Number(item.student_id);
        const [validStu] = await conn.execute('SELECT id FROM students WHERE id = ? AND workspace_id = ?', [sid, wsId]);
        if (validStu.length === 0) continue;
        if (item.score === '' || item.score === null || item.score === undefined) continue;

        const score = Math.max(0, Math.min(Number(assessment.max_score), Number(item.score)));
        await conn.execute(
          `INSERT INTO grades (workspace_id, assessment_id, student_id, score, feedback)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE score = VALUES(score), feedback = VALUES(feedback)`,
          [wsId, assessmentId, sid, score, item.feedback || null]
        );
      }
    });

    await logAudit(wsId, req.auth.userId, 'UPDATE', 'grade', assessmentId, `Menyimpan nilai untuk ${assessment.title}`);
    res.json({ message: 'Nilai siswa berhasil disimpan.' });
  } catch (err) {
    next(err);
  }
}
