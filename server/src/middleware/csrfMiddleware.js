import { AppError } from '../utils/AppError.js';
import { verifyCsrfToken } from '../utils/security.js';

export function requireCsrf(req, _res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }
  const token = req.headers['x-csrf-token'];
  if (!verifyCsrfToken(Array.isArray(token) ? token[0] : token)) {
    return next(new AppError('Token CSRF tidak valid atau hilang. Muat ulang halaman.', 403));
  }
  next();
}
