import { Router } from 'express';
import { body } from 'express-validator';
import { forgotPassword, getCsrf, login, logout, me, register, resetPassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { handleValidation } from '../middleware/validateMiddleware.js';
import { loginValidator, registerValidator } from '../validators/requestValidators.js';

const router = Router();

router.get('/csrf', getCsrf);
router.post('/register', registerValidator, handleValidation, register);
router.post('/login', loginValidator, handleValidation, login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.post('/forgot-password', [body('email').trim().isEmail().normalizeEmail().withMessage('Masukkan email yang valid.'), handleValidation], forgotPassword);
router.post(
  '/reset-password',
  [
    body('token').trim().notEmpty().withMessage('Token reset wajib diisi.'),
    body('password').isLength({ min: 8 }).withMessage('Password baru minimal 8 karakter.'),
    handleValidation,
  ],
  resetPassword
);

export default router;
