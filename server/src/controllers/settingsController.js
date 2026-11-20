import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcrypt';
import multer from 'multer';
import { pool, withTransaction } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { logAudit } from '../services/auditService.js';

const avatarsDir = path.resolve(process.cwd(), 'uploads/avatars');
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

export const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, avatarsDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `avatar-${req.auth.userId}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Foto profil harus berupa JPG, PNG, atau WEBP.', 400));
    }
  },
});

export async function getSettings(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id AS user_id, u.email, w.id AS workspace_id, w.name AS workspace_name,
              w.institution_name, w.academic_year, w.passing_grade,
              tp.full_name, tp.phone, tp.bio, tp.avatar_url
       FROM users u
       JOIN workspaces w ON w.owner_user_id = u.id
       JOIN teacher_profiles tp ON tp.user_id = u.id
       WHERE u.id = ?`,
      [req.auth.userId]
    );
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const userId = req.auth.userId;
    const wsId = req.auth.workspaceId;
    const { full_name, email, phone, bio, workspace_name, institution_name, academic_year, passing_grade } = req.body;

    const [dup] = await pool.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
    if (dup.length > 0) throw new AppError('Email sudah digunakan oleh akun lain.', 409);

    await withTransaction(async (conn) => {
      await conn.execute('UPDATE users SET email = ? WHERE id = ?', [email, userId]);
      await conn.execute(
        'UPDATE workspaces SET name = ?, institution_name = ?, academic_year = ?, passing_grade = ? WHERE id = ? AND owner_user_id = ?',
        [workspace_name, institution_name || null, academic_year || '2025/2026', Number(passing_grade ?? 75), wsId, userId]
      );
      await conn.execute('UPDATE teacher_profiles SET full_name = ?, phone = ?, bio = ? WHERE user_id = ? AND workspace_id = ?', [
        full_name,
        phone || null,
        bio || null,
        userId,
        wsId,
      ]);
    });

    await logAudit(wsId, userId, 'UPDATE', 'settings', wsId, 'Memperbarui profil dan pengaturan workspace');
    const [updated] = await pool.execute(
      `SELECT u.id AS user_id, u.email, w.id AS workspace_id, w.name AS workspace_name,
              w.institution_name, w.academic_year, w.passing_grade,
              tp.full_name, tp.phone, tp.bio, tp.avatar_url
       FROM users u
       JOIN workspaces w ON w.owner_user_id = u.id
       JOIN teacher_profiles tp ON tp.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );
    res.json({ message: 'Pengaturan profil & workspace berhasil disimpan.', data: updated[0] });
  } catch (err) {
    next(err);
  }
}

export async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) throw new AppError('Pilih file foto profil terlebih dahulu.', 400);
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await pool.execute('UPDATE teacher_profiles SET avatar_url = ? WHERE user_id = ?', [avatarUrl, req.auth.userId]);
    res.json({ message: 'Foto profil berhasil diperbarui.', avatar_url: avatarUrl });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const userId = req.auth.userId;
    const { current_password, new_password } = req.body;
    const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (rows.length === 0 || !(await bcrypt.compare(current_password, rows[0].password_hash))) {
      throw new AppError('Password saat ini tidak sesuai.', 400);
    }
    const newHash = await bcrypt.hash(new_password, 10);
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);
    await logAudit(req.auth.workspaceId, userId, 'UPDATE', 'password', userId, 'Mengubah password akun');
    res.json({ message: 'Password berhasil diperbarui.' });
  } catch (err) {
    next(err);
  }
}
