# Dokumentasi REST API TeachSpace (`/api/v1`)

Semua endpoint menggunakan prefix `/api/v1`. Autentikasi menggunakan cookie `HttpOnly` (`ts_token`) berisi JWT yang terikat pada tabel `sessions`. Endpoint mutasi (`POST`, `PUT`, `DELETE`) selain login/register wajib menyertakan header `X-CSRF-Token`.

## 1. Authentication (`/api/v1/auth`)
- `GET /auth/csrf` — Mendapatkan CSRF token.
- `POST /auth/register` — Mendaftar akun guru/tutor baru & membuat workspace pribadi otomatis.
- `POST /auth/login` — Login dengan email & password, mengatur cookie HttpOnly.
- `POST /auth/logout` — Mencabut sesi aktif di database dan menghapus cookie.
- `GET /auth/me` — Mengambil profil pengguna & workspace aktif.
- `POST /auth/forgot-password` — Membuat token reset password ter-hash (siap integrasi SMTP).
- `POST /auth/reset-password` — Memverifikasi token & memperbarui password.

## 2. Dashboard (`/api/v1/dashboard`)
- `GET /dashboard` — Statistik KPI, jadwal hari ini, jadwal terdekat, aktivitas terbaru, dan data grafik Recharts.

## 3. Kelas (`/api/v1/classes`)
- `GET /classes?search=&page=1&limit=10` — Daftar kelas dengan paginasi & pencarian.
- `GET /classes/:id` — Detail kelas beserta siswa & mata pelajaran terhubung.
- `POST /classes` — Tambah kelas baru.
- `PUT /classes/:id` — Perbarui kelas.
- `DELETE /classes/:id` — Hapus kelas.
- `POST /classes/:id/students` — Masukkan siswa ke kelas.
- `DELETE /classes/:id/students/:studentId` — Keluarkan siswa dari kelas.
- `POST /classes/:id/subjects` — Hubungkan mata pelajaran ke kelas.
- `DELETE /classes/:id/subjects/:subjectId` — Lepaskan mata pelajaran dari kelas.

## 4. Siswa (`/api/v1/students`)
- `GET /students?search=&status=&classId=&page=1&limit=12` — Daftar siswa.
- `GET /students/:id` — Detail siswa, riwayat absensi, dan nilai.
- `POST /students` — Tambah siswa dan penempatan kelas opsional.
- `PUT /students/:id` — Edit biodata & penempatan kelas siswa.
- `DELETE /students/:id` — Hapus siswa.

## 5. Mata Pelajaran (`/api/v1/subjects`)
- `GET /subjects?search=` — Daftar mata pelajaran & kelas terhubung.
- `POST /subjects` — Tambah mata pelajaran.
- `PUT /subjects/:id` — Perbarui mata pelajaran.
- `DELETE /subjects/:id` — Hapus mata pelajaran.

## 6. Jadwal Mengajar (`/api/v1/schedules`)
- `GET /schedules?classId=&day=` — Daftar jadwal mingguan.
- `POST /schedules` — Tambah jadwal.
- `PUT /schedules/:id` — Edit jadwal.
- `DELETE /schedules/:id` — Hapus jadwal.

## 7. Absensi (`/api/v1/attendance`)
- `GET /attendance/sessions?classId=` — Riwayat sesi absensi.
- `GET /attendance/sheet?classId=&date=YYYY-MM-DD` — Lembar absensi per kelas & tanggal.
- `POST /attendance/save` — Simpan/edit absensi (Hadir, Izin, Sakit, Alpa + catatan).
- `GET /attendance/recap?classId=` — Rekap total & persentase kehadiran per siswa.
- `DELETE /attendance/sessions/:id` — Hapus sesi absensi.

## 8. Penilaian & Nilai (`/api/v1/assessments`)
- `GET /assessments?classId=&subjectId=` — Daftar penilaian.
- `POST /assessments` — Buat penilaian baru (dengan `max_score` & `passing_score`).
- `PUT /assessments/:id` — Edit penilaian.
- `DELETE /assessments/:id` — Hapus penilaian.
- `GET /assessments/:id/grades` — Ambil daftar siswa & nilai untuk penilaian tertentu.
- `POST /assessments/:id/grades` — Simpan/perbarui nilai siswa secara massal.

## 9. Materi Pembelajaran (`/api/v1/materials`)
- `GET /materials?search=&category=&classId=` — Daftar materi.
- `POST /materials` — Upload file (`multipart/form-data`: PDF, DOCX, PPTX, JPG/PNG/WEBP, maks. 10 MB).
- `GET /materials/:id/download` — Unduh file materi (tervalidasi `workspace_id`).
- `DELETE /materials/:id` — Hapus materi & file fisik.

## 10. Laporan (`/api/v1/reports`)
- `GET /reports?type=students|attendance|grades|classes&classId=&startDate=&endDate=` — Pratinjau data laporan.
- `GET /reports/export/excel?...` — Unduh file `.xlsx`.
- `GET /reports/export/pdf?...` — Unduh file `.pdf`.

## 11. Pengaturan (`/api/v1/settings`)
- `GET /settings` — Profil & pengaturan workspace.
- `PUT /settings/profile` — Perbarui profil, email, nama workspace, institusi, tahun ajaran, dan KKM default.
- `POST /settings/avatar` — Upload foto profil.
- `PUT /settings/password` — Ganti password akun.
