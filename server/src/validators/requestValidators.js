import { body } from 'express-validator';

export const registerValidator = [
  body('fullName').trim().isLength({ min: 2, max: 120 }).withMessage('Nama lengkap minimal 2 karakter.'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Format email tidak valid.'),
  body('password').isLength({ min: 8 }).withMessage('Password minimal 8 karakter.'),
  body('workspaceName').optional().trim().isLength({ min: 2, max: 120 }).withMessage('Nama workspace minimal 2 karakter.'),
  body('institutionName').optional({ nullable: true }).trim().isLength({ max: 150 }),
];

export const loginValidator = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Masukkan email yang valid.'),
  body('password').notEmpty().withMessage('Password wajib diisi.'),
];

export const classValidator = [
  body('code').trim().isLength({ min: 2, max: 32 }).withMessage('Kode kelas minimal 2 karakter.'),
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Nama kelas minimal 2 karakter.'),
  body('grade_level').trim().notEmpty().withMessage('Tingkat kelas wajib diisi.'),
  body('academic_year').trim().notEmpty().withMessage('Tahun ajaran wajib diisi.'),
];

export const studentValidator = [
  body('full_name').trim().isLength({ min: 2, max: 120 }).withMessage('Nama lengkap siswa minimal 2 karakter.'),
  body('gender').isIn(['L', 'P']).withMessage('Jenis kelamin harus L atau P.'),
  body('status').optional().isIn(['aktif', 'nonaktif', 'lulus']).withMessage('Status siswa tidak valid.'),
];

export const subjectValidator = [
  body('code').trim().isLength({ min: 2, max: 32 }).withMessage('Kode mata pelajaran minimal 2 karakter.'),
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Nama mata pelajaran minimal 2 karakter.'),
];

export const scheduleValidator = [
  body('class_id').isInt().withMessage('Kelas wajib dipilih.'),
  body('subject_id').isInt().withMessage('Mata pelajaran wajib dipilih.'),
  body('day_of_week').isIn(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']).withMessage('Hari tidak valid.'),
  body('start_time').matches(/^\d{2}:\d{2}$/).withMessage('Format jam mulai harus HH:MM.'),
  body('end_time').matches(/^\d{2}:\d{2}$/).withMessage('Format jam selesai harus HH:MM.'),
];

export const assessmentValidator = [
  body('class_id').isInt().withMessage('Kelas wajib dipilih.'),
  body('subject_id').isInt().withMessage('Mata pelajaran wajib dipilih.'),
  body('title').trim().isLength({ min: 2, max: 150 }).withMessage('Nama penilaian minimal 2 karakter.'),
  body('type').isIn(['tugas', 'kuis', 'uts', 'uas', 'praktik', 'lainnya']).withMessage('Jenis penilaian tidak valid.'),
  body('assessment_date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Tanggal penilaian tidak valid.'),
  body('max_score').isFloat({ min: 1, max: 1000 }).withMessage('Skor maksimum harus antara 1 - 1000.'),
  body('passing_score').isFloat({ min: 0, max: 1000 }).withMessage('Batas nilai ketuntasan tidak valid.'),
];
