import { Router } from 'express';
import { body } from 'express-validator';
import { avatarUpload, changePassword, getSettings, updateProfile, uploadAvatar } from '../controllers/settingsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { handleValidation } from '../middleware/validateMiddleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', getSettings);
router.put(
  '/profile',
  [
    body('full_name').trim().isLength({ min: 2, max: 120 }).withMessage('Nama lengkap minimal 2 karakter.'),
    body('email').trim().isEmail().normalizeEmail().withMessage('Email tidak valid.'),
    body('workspace_name').trim().isLength({ min: 2, max: 120 }).withMessage('Nama workspace minimal 2 karakter.'),
    body('passing_grade').optional().isFloat({ min: 0, max: 100 }).withMessage('KKM harus antara 0 - 100.'),
    handleValidation,
  ],
  updateProfile
);
router.post('/avatar', avatarUpload.single('avatar'), uploadAvatar);
router.put(
  '/password',
  [
    body('current_password').notEmpty().withMessage('Password saat ini wajib diisi.'),
    body('new_password').isLength({ min: 8 }).withMessage('Password baru minimal 8 karakter.'),
    handleValidation,
  ],
  changePassword
);

export default router;
