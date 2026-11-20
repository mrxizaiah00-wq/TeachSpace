import { pool } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { extractRequestToken, verifyAuthToken } from '../utils/security.js';

export async function requireAuth(req, _res, next) {
  try {
    const token = extractRequestToken(req);
    if (!token) {
      throw new AppError('Sesi berakhir atau belum masuk. Silakan login kembali.', 401);
    }

    const decoded = verifyAuthToken(token);
    const [rows] = await pool.execute(
      'SELECT id, user_id, workspace_id, expires_at, revoked_at FROM sessions WHERE id = ? AND user_id = ?',
      [decoded.sessionId, decoded.userId]
    );

    const session = rows[0];
    if (!session || session.revoked_at) {
      throw new AppError('Sesi tidak valid atau telah dicabut.', 401);
    }

    if (new Date(session.expires_at).getTime() < Date.now()) {
      throw new AppError('Sesi telah kedaluwarsa. Silakan login ulang.', 401);
    }

    req.auth = {
      userId: session.user_id,
      workspaceId: session.workspace_id,
      email: decoded.email,
      sessionId: session.id,
    };
    next();
  } catch (err) {
    if (err instanceof AppError) {
      return next(err);
    }
    return next(new AppError('Token autentikasi tidak valid.', 401));
  }
}
