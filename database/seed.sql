use teachspace_db;


-- ============================================================
-- TeachSpace (MVP) - Demo Seed Data
-- Password untuk akun demo: TeachSpace123!
-- ============================================================


START TRANSACTION;

-- Users
INSERT INTO users (id, email, password_hash, is_verified, is_active) VALUES
  (1, 'guru@teachspace.id', '$2b$10$kuu6jGQpa7jvelFA93XXSeeQYeiuz5tG05thlGEPnrdeLm8wHbvE2', 1, 1),
  (2, 'tutor@teachspace.id', '$2b$10$kuu6jGQpa7jvelFA93XXSeeQYeiuz5tG05thlGEPnrdeLm8wHbvE2', 1, 1);

-- Workspaces
INSERT INTO workspaces (id, owner_user_id, name, institution_name, academic_year, passing_grade) VALUES
  (1, 1, 'Workspace Ibu Ratna', 'SMA Negeri 4 Nusantara', '2025/2026', 75.00),
  (2, 2, 'Bimbel Privat Dimas', NULL, '2025/2026', 70.00);

-- Teacher Profiles
INSERT INTO teacher_profiles (user_id, workspace_id, full_name, phone, bio) VALUES
  (1, 1, 'Ratna Kusuma, S.Pd., M.Pd.', '081234567890', 'Guru Matematika & Pembimbing Olimpiade Sains.'),
  (2, 2, 'Dimas Pratama', '081987654321', 'Tutor Privat Fisika & Kalkulus.');

-- Classes
INSERT INTO classes (id, workspace_id, code, name, grade_level, academic_year, description) VALUES
  (1, 1, 'X-IPA-1', 'Kelas X IPA 1', 'Kelas X', '2025/2026', 'Rombongan belajar peminatan MIPA pagi'),
  (2, 1, 'XI-IPA-2', 'Kelas XI IPA 2', 'Kelas XI', '2025/2026', 'Kelas lanjutan peminatan Matematika dan Sains'),
  (3, 1, 'PRIV-OSN', 'Bimbingan Olimpiade Matematika', 'Intensif', '2025/2026', 'Kelompok belajar persiapan OSN Tingkat Provinsi'),
  (4, 2, 'PRIV-FIS-01', 'Privat Fisika XII', 'Kelas XII', '2025/2026', 'Kelas privat UTBK Fisika');

-- Subjects
INSERT INTO subjects (id, workspace_id, code, name, description) VALUES
  (1, 1, 'MAT-W', 'Matematika Wajib', 'Aljabar, Fungsi, Trigonometri, dan Statistika Dasar'),
  (2, 1, 'MAT-P', 'Matematika Peminatan', 'Polinomial, Lingkaran, Limit, dan Turunan'),
  (3, 1, 'KOM-OSN', 'Kombinatorika & Teori Bilangan', 'Materi pengayaan olimpiade matematika'),
  (4, 2, 'FIS-UTBK', 'Fisika Mekanika & Listrik', 'Persiapan intensif ujian masuk perguruan tinggi');

-- Class Subjects
INSERT INTO class_subjects (workspace_id, class_id, subject_id) VALUES
  (1, 1, 1),
  (1, 2, 1),
  (1, 2, 2),
  (1, 3, 3),
  (2, 4, 4);

-- Students
INSERT INTO students (id, workspace_id, student_number, full_name, gender, birth_date, address, phone, status) VALUES
  (1, 1, '20250101', 'Alya Putri Maharani', 'P', '2009-04-12', 'Jl. Merpati No. 14', '081211110001', 'aktif'),
  (2, 1, '20250102', 'Bima Pratama Wijaya', 'L', '2009-07-23', 'Jl. Kenanga No. 8', '081211110002', 'aktif'),
  (3, 1, '20250103', 'Citra Dewi Lestari', 'P', '2009-01-19', 'Jl. Anggrek No. 22', '081211110003', 'aktif'),
  (4, 1, '20250104', 'Daffa Ramadhan', 'L', '2009-09-05', 'Jl. Melati No. 3', '081211110004', 'aktif'),
  (5, 1, '20250201', 'Elena Kartika Sari', 'P', '2008-03-14', 'Jl. Cempaka No. 11', '081211110005', 'aktif'),
  (6, 1, '20250202', 'Farhan Hakim Nugroho', 'L', '2008-11-30', 'Jl. Flamboyan No. 7', '081211110006', 'aktif'),
  (7, 1, '20250203', 'Gita Permata Hati', 'P', '2008-06-18', 'Jl. Kamboja No. 19', '081211110007', 'aktif'),
  (8, 1, '20250204', 'Hendra Saputra', 'L', '2008-02-27', 'Jl. Teratai No. 5', '081211110008', 'aktif'),
  (9, 1, '20250301', 'Intan Nurul Aini', 'P', '2008-08-09', 'Jl. Dahlia No. 16', '081211110009', 'aktif'),
  (10, 1, '20250302', 'Joko Susilo Wibowo', 'L', '2009-12-02', 'Jl. Mawar No. 9', '081211110010', 'aktif'),
  (11, 2, 'FIS-001', 'Nadia Putri', 'P', '2008-05-10', 'Jl. Sudirman No. 20', '081355550001', 'aktif');

-- Class Students
INSERT INTO class_students (workspace_id, class_id, student_id) VALUES
  (1, 1, 1), (1, 1, 2), (1, 1, 3), (1, 1, 4),
  (1, 2, 5), (1, 2, 6), (1, 2, 7), (1, 2, 8),
  (1, 3, 9), (1, 3, 10), (1, 3, 1),
  (2, 4, 11);

-- Schedules
INSERT INTO schedules (workspace_id, class_id, subject_id, day_of_week, start_time, end_time, room) VALUES
  (1, 1, 1, 'Senin', '07:30', '09:00', 'Ruang X-1'),
  (1, 2, 2, 'Senin', '09:30', '11:00', 'Ruang XI-2'),
  (1, 1, 1, 'Selasa', '08:00', '09:30', 'Ruang X-1'),
  (1, 3, 3, 'Selasa', '14:00', '15:30', 'Lab Matematika'),
  (1, 2, 1, 'Rabu', '07:30', '09:00', 'Ruang XI-2'),
  (1, 1, 1, 'Kamis', '10:00', '11:30', 'Ruang X-1'),
  (1, 2, 2, 'Kamis', '13:00', '14:30', 'Ruang XI-2'),
  (1, 3, 3, 'Jumat', '13:30', '15:00', 'Lab Matematika'),
  (1, 3, 3, 'Sabtu', '09:00', '11:00', 'Online / Zoom'),
  (2, 4, 4, 'Sabtu', '13:00', '15:00', 'Online Meet');

-- Attendance Sessions & Records
INSERT INTO attendance_sessions (id, workspace_id, class_id, session_date, topic) VALUES
  (1, 1, 1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Pertemuan Aljabar #1'),
  (2, 1, 1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Pertemuan Aljabar #2'),
  (3, 1, 1, CURDATE(), 'Pertemuan Aljabar #3'),
  (4, 1, 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Limit Fungsi Polinomial');

INSERT INTO attendance_records (workspace_id, session_id, student_id, status, notes) VALUES
  (1, 1, 1, 'hadir', NULL), (1, 1, 2, 'hadir', NULL), (1, 1, 3, 'hadir', NULL), (1, 1, 4, 'izin', 'Izin kegiatan lomba sekolah'),
  (1, 2, 1, 'hadir', NULL), (1, 2, 2, 'hadir', NULL), (1, 2, 3, 'sakit', 'Surat dokter terlampir'), (1, 2, 4, 'hadir', NULL),
  (1, 3, 1, 'hadir', NULL), (1, 3, 2, 'hadir', NULL), (1, 3, 3, 'hadir', NULL), (1, 3, 4, 'hadir', NULL),
  (1, 4, 5, 'hadir', NULL), (1, 4, 6, 'alpa', 'Tanpa keterangan'), (1, 4, 7, 'hadir', NULL), (1, 4, 8, 'hadir', NULL);

-- Assessments & Grades
INSERT INTO assessments (id, workspace_id, class_id, subject_id, title, type, assessment_date, max_score, passing_score) VALUES
  (1, 1, 1, 1, 'Kuis Persamaan Kuadrat', 'kuis', DATE_SUB(CURDATE(), INTERVAL 7 DAY), 100.00, 75.00),
  (2, 1, 1, 1, 'Tugas Harian Trigonometri', 'tugas', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 100.00, 75.00),
  (3, 1, 2, 2, 'Ujian Tengah Semester Polinomial', 'uts', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 100.00, 75.00);

INSERT INTO grades (workspace_id, assessment_id, student_id, score, feedback) VALUES
  (1, 1, 1, 88.00, 'Pemahaman konsep baik'),
  (1, 1, 2, 79.00, 'Pemahaman konsep baik'),
  (1, 1, 3, 92.00, 'Sangat baik'),
  (1, 1, 4, 70.00, 'Perlu latihan soal pemfaktoran'),
  (1, 2, 1, 91.00, 'Tugas dikumpulkan tepat waktu'),
  (1, 2, 2, 84.00, 'Tugas dikumpulkan tepat waktu'),
  (1, 2, 3, 89.00, 'Tugas dikumpulkan tepat waktu'),
  (1, 2, 4, 78.00, 'Tugas dikumpulkan tepat waktu'),
  (1, 3, 5, 94.00, 'Hasil sangat baik'),
  (1, 3, 6, 72.00, 'Remedial pembagian polinomial'),
  (1, 3, 7, 86.00, 'Hasil baik'),
  (1, 3, 8, 81.00, 'Hasil baik');

-- Audit Logs
INSERT INTO audit_logs (workspace_id, user_id, action, entity_type, entity_id, summary) VALUES
  (1, 1, 'CREATE', 'assessment', 3, 'Membuat penilaian Ujian Tengah Semester Polinomial untuk Kelas XI IPA 2'),
  (1, 1, 'UPDATE', 'attendance', 3, 'Menyimpan rekap absensi harian Kelas X IPA 1'),
  (1, 1, 'CREATE', 'class', 3, 'Menambahkan kelas Bimbingan Olimpiade Matematika');

COMMIT;
