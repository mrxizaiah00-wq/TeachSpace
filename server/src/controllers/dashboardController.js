import { pool } from '../config/db.js';

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export async function getDashboard(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const todayName = DAY_NAMES[new Date().getDay()];

    const [[{ cnt: totalClasses }]] = await pool.execute('SELECT COUNT(*) AS cnt FROM classes WHERE workspace_id = ?', [wsId]);
    const [[{ cnt: totalStudents }]] = await pool.execute(
      "SELECT COUNT(*) AS cnt FROM students WHERE workspace_id = ? AND status = 'aktif'",
      [wsId]
    );

    const [todaySchedules] = await pool.execute(
      `SELECT sch.id, sch.day_of_week, sch.start_time, sch.end_time, sch.room,
              c.id AS class_id, c.name AS class_name, c.code AS class_code,
              sub.id AS subject_id, sub.name AS subject_name
       FROM schedules sch
       JOIN classes c ON c.id = sch.class_id
       JOIN subjects sub ON sub.id = sch.subject_id
       WHERE sch.workspace_id = ? AND sch.day_of_week = ?
       ORDER BY sch.start_time ASC`,
      [wsId, todayName]
    );

    const [upcomingSchedules] = await pool.execute(
      `SELECT sch.id, sch.day_of_week, sch.start_time, sch.end_time, sch.room,
              c.name AS class_name, sub.name AS subject_name
       FROM schedules sch
       JOIN classes c ON c.id = sch.class_id
       JOIN subjects sub ON sub.id = sch.subject_id
       WHERE sch.workspace_id = ?
       ORDER BY FIELD(sch.day_of_week, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'), sch.start_time ASC
       LIMIT 6`,
      [wsId]
    );

    const [[attTotals]] = await pool.execute(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END) AS present
       FROM attendance_records WHERE workspace_id = ?`,
      [wsId]
    );
    const attendanceRate = attTotals.total > 0 ? Math.round(((Number(attTotals.present) || 0) / Number(attTotals.total)) * 1000) / 10 : 0;

    const [[gradeTotals]] = await pool.execute(
      `SELECT AVG(CASE WHEN a.max_score > 0 THEN (g.score / a.max_score) * 100 ELSE g.score END) AS avg_pct
       FROM grades g
       JOIN assessments a ON a.id = g.assessment_id
       WHERE g.workspace_id = ?`,
      [wsId]
    );
    const averageGrade = gradeTotals.avg_pct !== null ? Math.round(Number(gradeTotals.avg_pct) * 10) / 10 : 0;

    const [recentActivities] = await pool.execute(
      'SELECT id, action, entity_type, summary, created_at FROM audit_logs WHERE workspace_id = ? ORDER BY id DESC LIMIT 8',
      [wsId]
    );

    const [attendanceTrend] = await pool.execute(
      `SELECT DATE_FORMAT(s.session_date, '%m-%d') AS date,
              COUNT(r.id) AS total,
              SUM(CASE WHEN r.status = 'hadir' THEN 1 ELSE 0 END) AS hadir,
              SUM(CASE WHEN r.status != 'hadir' THEN 1 ELSE 0 END) AS tidakHadir
       FROM attendance_sessions s
       LEFT JOIN attendance_records r ON r.session_id = s.id
       WHERE s.workspace_id = ?
       GROUP BY s.session_date
       ORDER BY s.session_date ASC
       LIMIT 10`,
      [wsId]
    );

    const attendanceChart = attendanceTrend.map((row) => ({
      date: row.date,
      kehadiran: Number(row.total) > 0 ? Math.round((Number(row.hadir) / Number(row.total)) * 100) : 0,
      hadir: Number(row.hadir) || 0,
      tidakHadir: Number(row.tidakHadir) || 0,
    }));

    const [classGradesChart] = await pool.execute(
      `SELECT c.name AS kelas,
              ROUND(AVG(CASE WHEN a.max_score > 0 THEN (g.score / a.max_score) * 100 ELSE g.score END), 1) AS rataRata
       FROM classes c
       LEFT JOIN assessments a ON a.class_id = c.id AND a.workspace_id = c.workspace_id
       LEFT JOIN grades g ON g.assessment_id = a.id
       WHERE c.workspace_id = ?
       GROUP BY c.id, c.name
       ORDER BY c.name ASC`,
      [wsId]
    );

    res.json({
      stats: {
        totalClasses: Number(totalClasses),
        totalStudents: Number(totalStudents),
        todayScheduleCount: todaySchedules.length,
        attendanceRate,
        averageGrade,
      },
      todayName,
      todaySchedules,
      upcomingSchedules,
      recentActivities,
      charts: {
        attendanceChart,
        classGradesChart: classGradesChart.map((item) => ({
          kelas: item.kelas,
          rataRata: Number(item.rataRata) || 0,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}
