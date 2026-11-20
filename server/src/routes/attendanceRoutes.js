import { Router } from 'express';
import { body } from 'express-validator';
import {
  deleteAttendanceSession,
  getAttendanceRecap,
  getAttendanceSheet,
  listAttendanceSessions,
  saveAttendanceSheet,
} from '../controllers/attendanceController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { handleValidation } from '../middleware/validateMiddleware.js';

const router = Router();
router.use(requireAuth);

router.get('/sessions', listAttendanceSessions);
router.get('/sheet', getAttendanceSheet);
router.post(
  '/save',
  [
    body('class_id').isInt().withMessage('Kelas wajib dipilih.'),
    body('session_date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Tanggal tidak valid.'),
    body('records').isArray({ min: 1 }).withMessage('Daftar kehadiran siswa tidak boleh kosong.'),
    handleValidation,
  ],
  saveAttendanceSheet
);
router.get('/recap', getAttendanceRecap);
router.delete('/sessions/:id', deleteAttendanceSession);

export default router;
