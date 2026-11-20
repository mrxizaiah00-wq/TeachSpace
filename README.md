<<<<<<< HEAD
# TeachSpace (MVP) — Your Teaching, Organized.

**TeachSpace** adalah platform manajemen akademik pribadi (*Personal Academic Management Platform*) untuk guru sekolah, guru les privat, tutor bimbingan belajar, dan pengajar independen. Setiap pengguna memiliki *workspace* terisolasi secara mandiri tanpa memerlukan akun administrator sekolah.

---

## 1. Persyaratan Instalasi

- Sistem Operasi: Windows 10/11, macOS, atau Linux
- **Node.js LTS** (disarankan versi 20.x atau 22.x) + **npm**
- **MySQL Server 8.x** (bisa melalui MySQL Community Server, Laragon, XAMPP/MySQL 8, atau Docker)
- **Visual Studio Code** (disarankan ekstensi: *ES7+ React/Redux/React-Native snippets*, *ESLint*, *Tailwind CSS IntelliSense*)
- **Git** (opsional untuk version control)

---

## 2. Instalasi Node.js

1. Unduh **Node.js LTS** dari [https://nodejs.org](https://nodejs.org).
2. Jalankan installer dan ikuti instruksi hingga selesai.
3. Verifikasi instalasi melalui terminal:

```bash
node -v
npm -v
```

---

## 3. Instalasi MySQL 8.x

1. Unduh MySQL Community Server 8.x dari [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/) atau gunakan Docker:

```bash
docker run --name teachspace-mysql -e MYSQL_ROOT_PASSWORD=rootpassword -p 3306:3306 -d mysql:8.0
```

2. Pastikan layanan MySQL aktif dan cek versi MySQL:

```bash
mysql --version
```

---

## 4. Membuka Proyek di Visual Studio Code

1. Ekstrak file `TeachSpace-MVP.zip`.
2. Buka **Visual Studio Code**, pilih **File -> Open Folder...**, lalu pilih folder `teachspace/`.
3. Buka terminal terintegrasi di VS Code dengan menekan `Ctrl + ~` (Windows/Linux) atau `Cmd + ~` (macOS).

---

## 5. Membuat Database MySQL

Masuk ke MySQL CLI lalu buat database `teachspace_db`:

```bash
mysql -u root -p
```

Di dalam prompt MySQL:

```sql
CREATE DATABASE IF NOT EXISTS teachspace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

---

## 6. Import `schema.sql`

Jalankan perintah berikut dari folder root `teachspace/` untuk membuat seluruh 18 tabel relasional, foreign key, unique constraint, dan indeks:

```bash
mysql -u root -p teachspace_db < database/schema.sql
```

*(Untuk Windows PowerShell)*:

```powershell
Get-Content database/schema.sql | mysql -u root -p teachspace_db
```

---

## 7. Menjalankan `seed.sql` (Data Demo)

Import data demo awal (kelas, siswa, mapel, jadwal, absensi, nilai, serta akun demo):

```bash
mysql -u root -p teachspace_db < database/seed.sql
```

*(Untuk Windows PowerShell)*:

```powershell
Get-Content database/seed.sql | mysql -u root -p teachspace_db
```

---

## 8. Konfigurasi `.env`

1. Salin file template environment backend:

```bash
cp server/.env.example server/.env
```

*(Windows PowerShell)*:

```powershell
Copy-Item server/.env.example server/.env
```

2. Buka `server/.env` di VS Code dan sesuaikan kredensial MySQL serta secret key Anda:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password_mysql_anda
DB_NAME=teachspace_db

JWT_SECRET=ganti_dengan_string_acak_minimal_32_karakter
CSRF_SECRET=ganti_dengan_string_acak_csrf_minimal_32_karakter
JWT_EXPIRES_IN=7d
```

---

## 9. Instalasi Dependency

Jalankan perintah berikut dari folder root `teachspace/` untuk menginstal seluruh package root, backend (`server/`), dan frontend (`client/`):

```bash
npm run install:all
```

Atau satu per satu:

```bash
npm install
npm --prefix server install
npm --prefix client install
```

---

## 10. Menjalankan Backend

Dari folder `teachspace/`:

```bash
npm run dev:server
```

Atau dari dalam folder `teachspace/server/`:

```bash
npm run dev
```

Jika berhasil, terminal akan menampilkan:
`MySQL connection verified (teachspace_db).`
`TeachSpace API Server running on http://localhost:5000`

---

## 11. Menjalankan Frontend

Buka terminal baru di VS Code, lalu dari folder `teachspace/`:

```bash
npm run dev:client
```

Atau jalankan **backend & frontend sekaligus** dari folder root `teachspace/`:

```bash
npm run dev
```

---

## 12. URL Aplikasi

- **Frontend (React + Vite)**: [http://localhost:5173](http://localhost:5173)

---

## 13. URL API

- **Backend REST API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 14. Akun Demo

Anda dapat langsung mendaftar mandiri melalui tab **Daftar Mandiri**, atau login menggunakan akun demo dari `database/seed.sql`:

| Peran | Email | Password |
| :--- | :--- | :--- |
| Guru Sekolah (Workspace 1) | `guru@teachspace.id` | `TeachSpace123!` |
| Tutor Privat (Workspace 2 - Terisolasi) | `tutor@teachspace.id` | `TeachSpace123!` |

---

## 15. Troubleshooting Error Umum

1. **`Access denied for user 'root'@'localhost'`**
   - Periksa kembali `DB_USER` dan `DB_PASSWORD` di file `server/.env`.
2. **`Unknown database 'teachspace_db'`**
   - Pastikan Anda sudah mengimpor `database/schema.sql`.
3. **`ECONNREFUSED 127.0.0.1:3306`**
   - Pastikan service MySQL 8.x sudah berjalan di komputer Anda.
4. **Error CSRF 403 saat melakukan POST/PUT/DELETE**
   - Pastikan frontend mengakses backend melalui Vite proxy (`http://localhost:5173`) sehingga cookie `HttpOnly` terkirim pada origin yang sama, dan pastikan `CLIENT_URL` di `server/.env` sesuai (`http://localhost:5173`).
5. **Upload file materi ditolak**
   - Pastikan ukuran file $\le 10$ MB dan formatnya termasuk `PDF`, `DOC`, `DOCX`, `PPT`, `PPTX`, `JPG`, `PNG`, atau `WEBP`.

---

## 16. Cara Build untuk Production

1. Build aplikasi frontend:

```bash
npm run build
```

Hasil build production tersimpan di `client/dist/`.

2. Jalankan server backend dalam mode production:

```bash
NODE_ENV=production npm run start
```

Pastikan pada environment production `JWT_SECRET` dan `CSRF_SECRET` menggunakan string acak yang kuat serta HTTPS aktif agar cookie `HttpOnly` berstatus `Secure`.
=======
# TeachSpace
>>>>>>> b34a80fba01a6790fb56fd6d8a220e82f5ed15c5
