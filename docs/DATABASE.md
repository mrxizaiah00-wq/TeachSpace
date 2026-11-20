# Dokumentasi Skema Database MySQL (`teachspace_db`)

Database menggunakan **MySQL 8.x** dengan engine **InnoDB** (`utf8mb4_unicode_ci`), foreign key constraints, unique constraints, dan indeks komposit untuk performa query per workspace.

## Model Multi-Tenancy
- Setiap pengguna mendaftar secara mandiri dan langsung memperoleh satu baris di `workspaces` (`owner_user_id` unik).
- Semua tabel entitas akademik (`classes`, `students`, `class_students`, `subjects`, `class_subjects`, `schedules`, `attendance_sessions`, `attendance_records`, `assessments`, `grades`, `materials`, `audit_logs`) memiliki kolom `workspace_id` yang merujuk ke `workspaces(id) ON DELETE CASCADE`.
- Nilai `workspace_id` selalu diambil dari sesi JWT pengguna di backend, tidak pernah dari input request client.

## Daftar 18 Tabel
1. `users` — Akun autentikasi pengguna (email unik, `password_hash` bcrypt).
2. `workspaces` — Ruang kerja pribadi guru/tutor (`name`, `institution_name` opsional, `academic_year`, `passing_grade`).
3. `teacher_profiles` — Biodata pengajar (`full_name`, `phone`, `bio`, `avatar_url`).
4. `classes` — Daftar kelas (`code` unik per workspace, `name`, `grade_level`, `academic_year`).
5. `students` — Master data siswa (`student_number`, `full_name`, `gender`, `status`).
6. `class_students` — Relasi N:M penempatan siswa ke kelas.
7. `subjects` — Mata pelajaran (`code` unik per workspace, `name`, `description`).
8. `class_subjects` — Relasi N:M mata pelajaran dengan kelas.
9. `schedules` — Jadwal mengajar mingguan (`day_of_week`, `start_time`, `end_time`, `room`).
10. `attendance_sessions` — Sesi absensi unik per `(workspace_id, class_id, session_date)`.
11. `attendance_records` — Status kehadiran per siswa (`hadir`, `izin`, `sakit`, `alpa`, `notes`).
12. `assessments` — Daftar penilaian (`title`, `type`, `assessment_date`, `max_score`, `passing_score`).
13. `grades` — Nilai siswa per penilaian (`score`, `feedback`).
14. `materials` — Metadata file materi (`file_name`, `original_name`, `mime_type`, `file_size`, `file_path`).
15. `sessions` — Pelacakan sesi aktif & pencabutan token (`id` UUID, `expires_at`, `revoked_at`).
16. `password_reset_tokens` — Token reset password ter-hash SHA-256.
17. `email_verification_tokens` — Token verifikasi email ter-hash SHA-256.
18. `audit_logs` — Riwayat aktivitas perubahan data di workspace.
