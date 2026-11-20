import { AppError } from '../utils/AppError.js';

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Ukuran file melebihi batas maksimum yang diizinkan.' });
  }
  console.error('Unhandled API Error:', err);
  return res.status(500).json({ error: 'Terjadi kesalahan pada server. Silakan coba kembali.' });
}
