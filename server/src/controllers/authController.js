import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { pool, withTransaction } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { extractRequestToken, generateCsrfToken, getCookieOptions, hashToken, signAuthToken, verifyAuthToken } from '../utils/security.js';
import { logAudit } from '../services/auditService.js';

async function getUserContext(userId) {
  const [rows] = await pool.execute(
    `SELECT u.id AS user_id, u.email, u.is_verified, u.last_login_at,
            w.id AS workspace_id, w.name AS workspace_name, w.institution_name, w.academic_year, w.passing_grade,
            tp.full_name, tp.phone, tp.bio, tp.avatar_url
     FROM users u
     JOIN workspaces w ON w.owner_user_id = u.id
     JOIN teacher_profiles tp ON tp.user_id = u.id
     WHERE u.id = ?`,
    [userId]
  );
  return rows[0] || null;
}

export function getCsrf(_req, res) {
  res.json({ csrfToken: generateCsrfToken() });
}

export async function register(req, res, next) {
  try {
    const { fullName, email, password, workspaceName, institutionName } = req.body;
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      throw new AppError('Email sudah terdaftar. Silakan masuk atau gunakan email lain.', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const sessionId = crypto.randomUUID();

    const { userId, workspaceId } = await withTransaction(async (conn) => {
      const [uRes] = await conn.execute(
        'INSERT INTO users (email, password_hash, is_verified, is_active, last_login_at) VALUES (?, ?, 1, 1, NOW())',
        [email, passwordHash]
      );
      const uid = uRes.insertId;

      const wsTitle = workspaceName?.trim() || `Workspace ${fullName.split(' ')[0]}`;
      const [wRes] = await conn.execute(
        'INSERT INTO workspaces (owner_user_id, name, institution_name, academic_year, passing_grade) VALUES (?, ?, ?, ?, ?)',
        [uid, wsTitle, institutionName?.trim() || null, '2025/2026', 75]
      );
      const wid = wRes.insertId;

      await conn.execute('INSERT INTO teacher_profiles (user_id, workspace_id, full_name) VALUES (?, ?, ?)', [
        uid,
        wid,
        fullName.trim(),
      ]);

      await conn.execute(
        'INSERT INTO sessions (id, user_id, workspace_id, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
        [sessionId, uid, wid, req.ip || null, req.headers['user-agent'] || null]
      );

      return { userId: uid, workspaceId: wid };
    });

    await logAudit(workspaceId, userId, 'REGISTER', 'workspace', workspaceId, `Workspace pribadi dibuat untuk ${fullName}`);

    const token = signAuthToken({ userId, workspaceId, email, sessionId });
    res.cookie('ts_token', token, getCookieOptions(req));

    const user = await getUserContext(userId);
    res.status(201).json({
      message: 'Registrasi berhasil. Workspace pribadi Anda siap digunakan.',
      user,
      token,
      csrfToken: generateCsrfToken(),
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.execute(
      `SELECT u.id, u.email, u.password_hash, u.is_active, w.id AS workspace_id
       FROM users u
       JOIN workspaces w ON w.owner_user_id = u.id
       WHERE u.email = ?`,
      [email]
    );
    const userRow = rows[0];
    if (!userRow || !(await bcrypt.compare(password, userRow.password_hash))) {
      throw new AppError('Email atau password tidak sesuai.', 401);
    }
    if (!userRow.is_active) {
      throw new AppError('Akun Anda sedang dinonaktifkan.', 403);
    }

    const sessionId = crypto.randomUUID();
    await withTransaction(async (conn) => {
      await conn.execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [userRow.id]);
      await conn.execute(
        'INSERT INTO sessions (id, user_id, workspace_id, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
        [sessionId, userRow.id, userRow.workspace_id, req.ip || null, req.headers['user-agent'] || null]
      );
    });

    const token = signAuthToken({
      userId: userRow.id,
      workspaceId: userRow.workspace_id,
      email: userRow.email,
      sessionId,
    });
    res.cookie('ts_token', token, getCookieOptions(req));

    const user = await getUserContext(userRow.id);
    res.json({
      message: 'Berhasil masuk ke TeachSpace.',
      user,
      token,
      csrfToken: generateCsrfToken(),
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const token = extractRequestToken(req);
    if (token) {
      try {
        const decoded = verifyAuthToken(token);
        if (decoded?.sessionId) {
          await pool.execute('UPDATE sessions SET revoked_at = NOW() WHERE id = ?', [decoded.sessionId]);
        }
      } catch {
        // Token expired/invalid — still clear cookie cleanly
      }
    }
    const { maxAge: _maxAge, ...clearOpts } = getCookieOptions(req);
    res.clearCookie('ts_token', clearOpts);
    res.json({ message: 'Berhasil keluar dari sesi.' });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await getUserContext(req.auth.userId);
    if (!user) throw new AppError('Profil pengguna tidak ditemukan.', 404);
    res.json({ user, token: extractRequestToken(req), csrfToken: generateCsrfToken() });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const [rows] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    let devResetToken;
    if (rows.length > 0) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      await pool.execute(
        'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))',
        [rows[0].id, tokenHash]
      );
      if (process.env.NODE_ENV !== 'production') {
        devResetToken = rawToken;
      }
    }
    res.json({
      message: 'Jika email terdaftar, instruksi reset password telah disiapkan.',
      ...(devResetToken ? { devResetToken } : {}),
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const tokenHash = hashToken(token);
    const [rows] = await pool.execute(
      'SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ?',
      [tokenHash]
    );
    const record = rows[0];
    if (!record || record.used_at || new Date(record.expires_at).getTime() < Date.now()) {
      throw new AppError('Token reset password tidak valid atau sudah kedaluwarsa.', 400);
    }

    const newHash = await bcrypt.hash(password, 10);
    await withTransaction(async (conn) => {
      await conn.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, record.user_id]);
      await conn.execute('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?', [record.id]);
      await conn.execute('UPDATE sessions SET revoked_at = NOW() WHERE user_id = ?', [record.user_id]);
    });

    res.json({ message: 'Password berhasil diperbarui. Silakan login kembali.' });
  } catch (err) {
    next(err);
  }
}
