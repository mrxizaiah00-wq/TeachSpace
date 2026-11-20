# Arsitektur Aplikasi TeachSpace (MVP)

TeachSpace dirancang dengan arsitektur **3-tier modular** (React SPA + Express REST API + MySQL 8.x):

## 1. Frontend (`client/`)
- **Stack**: React 18+, Vite, JavaScript JSX, Tailwind CSS v4, React Router DOM, Axios, Lucide React, Recharts.
- **Autentikasi & Keamanan Client**:
  - Menggunakan `withCredentials: true` pada instance Axios agar cookie `HttpOnly` terkirim otomatis.
  - Menyisipkan header `X-CSRF-Token` pada setiap request mutasi melalui interceptor Axios.

## 2. Backend (`server/`)
- **Stack**: Node.js, Express.js, `mysql2/promise` (Connection Pool + Transaksi), `bcrypt`, `jsonwebtoken`, `cookie-parser`, `helmet`, `cors`, `express-rate-limit`, `express-validator`, `multer`, `exceljs`, `pdfkit`.
- **Pemisahan Layer**:
  - `config/`: koneksi pool MySQL & konstanta environment.
  - `middleware/`: autentikasi JWT + validasi tabel `sessions`, proteksi CSRF HMAC, error handler terpusat.
  - `validators/`: aturan `express-validator` untuk validasi request.
  - `controllers/`: logika bisnis, transaksi SQL, isolasi `workspace_id`.
  - `routes/`: pemetaan endpoint REST `/api/v1/*`.
  - `utils/`: hashing token, logging audit, custom `AppError`.

## 3. Keamanan & Isolasi Workspace
- Password di-hash menggunakan `bcrypt` (cost 10).
- Token JWT disimpan dalam cookie `HttpOnly`, `SameSite=Lax` (`None` + `Secure` saat HTTPS production).
- Seluruh query SQL menggunakan parameterized placeholders (`?`) untuk mencegah SQL Injection.
- Upload materi memvalidasi ekstensi dan MIME type serta membatasi ukuran maksimal 10 MB; download memverifikasi kepemilikan `workspace_id`.
