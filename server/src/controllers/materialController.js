import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { pool } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { logAudit } from '../services/auditService.js';

const materialsDir = path.resolve(process.cwd(), 'uploads/materials');
if (!fs.existsSync(materialsDir)) fs.mkdirSync(materialsDir, { recursive: true });

const ALLOWED_MIMES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const ALLOWED_EXTS = new Set(['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.jpg', '.jpeg', '.png', '.webp']);

export const materialUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, materialsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_MIMES.has(file.mimetype) && ALLOWED_EXTS.has(ext)) {
      cb(null, true);
    } else {
      cb(new AppError('Tipe file tidak diizinkan. Gunakan PDF, DOCX, PPTX, JPG, PNG, atau WEBP.', 400));
    }
  },
});

export async function listMaterials(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const category = String(req.query.category || '').trim();
    const classId = Number(req.query.classId) || null;
    const search = String(req.query.search || '').trim();

    const conditions = ['m.workspace_id = ?'];
    const params = [wsId];
    if (category) {
      conditions.push('m.category = ?');
      params.push(category);
    }
    if (classId) {
      conditions.push('m.class_id = ?');
      params.push(classId);
    }
    if (search) {
      conditions.push("(m.title LIKE ? OR COALESCE(m.description, '') LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.execute(
      `SELECT m.*, c.name AS class_name, sub.name AS subject_name
       FROM materials m
       LEFT JOIN classes c ON c.id = m.class_id
       LEFT JOIN subjects sub ON sub.id = m.subject_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY m.created_at DESC`,
      params
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

export async function uploadMaterial(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    if (!req.file) throw new AppError('File materi wajib diunggah (maks. 10 MB).', 400);

    const { title, description, category, class_id, subject_id } = req.body;
    if (!title || String(title).trim().length < 2) {
      fs.unlinkSync(req.file.path);
      throw new AppError('Judul materi minimal 2 karakter.', 400);
    }

    const validClassId = class_id ? Number(class_id) : null;
    const validSubjectId = subject_id ? Number(subject_id) : null;

    if (validClassId) {
      const [cls] = await pool.execute('SELECT id FROM classes WHERE id = ? AND workspace_id = ?', [validClassId, wsId]);
      if (cls.length === 0) {
        fs.unlinkSync(req.file.path);
        throw new AppError('Kelas tidak ditemukan.', 404);
      }
    }

    if (validSubjectId) {
      const [sub] = await pool.execute('SELECT id FROM subjects WHERE id = ? AND workspace_id = ?', [validSubjectId, wsId]);
      if (sub.length === 0) {
        fs.unlinkSync(req.file.path);
        throw new AppError('Mata pelajaran tidak ditemukan.', 404);
      }
    }

    const [result] = await pool.execute(
      `INSERT INTO materials (workspace_id, class_id, subject_id, title, description, category, file_name, original_name, mime_type, file_size, file_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        wsId,
        validClassId,
        validSubjectId,
        String(title).trim(),
        description ? String(description).trim() : null,
        category || 'modul',
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        req.file.filename,
      ]
    );

    await logAudit(wsId, req.auth.userId, 'UPLOAD', 'material', result.insertId, `Mengunggah materi ${String(title).trim()}`);
    const [created] = await pool.execute('SELECT * FROM materials WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Materi pembelajaran berhasil diunggah.', data: created[0] });
  } catch (err) {
    next(err);
  }
}

export async function downloadMaterial(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const id = Number(req.params.id);
    const [rows] = await pool.execute('SELECT original_name, file_path FROM materials WHERE id = ? AND workspace_id = ?', [id, wsId]);
    if (rows.length === 0) throw new AppError('Materi tidak ditemukan.', 404);

    const fullPath = path.join(materialsDir, path.basename(rows[0].file_path));
    if (!fs.existsSync(fullPath)) throw new AppError('File materi tidak tersedia di penyimpanan.', 404);

    res.download(fullPath, rows[0].original_name);
  } catch (err) {
    next(err);
  }
}

export async function deleteMaterial(req, res, next) {
  try {
    const wsId = req.auth.workspaceId;
    const id = Number(req.params.id);
    const [rows] = await pool.execute('SELECT title, file_path FROM materials WHERE id = ? AND workspace_id = ?', [id, wsId]);
    if (rows.length === 0) throw new AppError('Materi tidak ditemukan.', 404);

    const fullPath = path.join(materialsDir, path.basename(rows[0].file_path));
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    await pool.execute('DELETE FROM materials WHERE id = ? AND workspace_id = ?', [id, wsId]);
    await logAudit(wsId, req.auth.userId, 'DELETE', 'material', id, `Menghapus materi ${rows[0].title}`);
    res.json({ message: 'Materi berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
}
