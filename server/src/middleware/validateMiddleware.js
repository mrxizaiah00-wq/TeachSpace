import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

export function handleValidation(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    return next(new AppError(first.msg || 'Data input tidak valid.', 422, errors.array()));
  }
  next();
}
