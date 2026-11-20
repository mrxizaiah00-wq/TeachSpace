import { Router } from 'express';
import { body } from 'express-validator';
import {
  createAssessment,
  deleteAssessment,
  getAssessmentGrades,
  listAssessments,
  saveAssessmentGrades,
  updateAssessment,
} from '../controllers/assessmentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { handleValidation } from '../middleware/validateMiddleware.js';
import { assessmentValidator } from '../validators/requestValidators.js';

const router = Router();
router.use(requireAuth);

router.get('/', listAssessments);
router.post('/', assessmentValidator, handleValidation, createAssessment);
router.put(
  '/:id',
  [
    body('title').trim().isLength({ min: 2, max: 150 }),
    body('max_score').isFloat({ min: 1, max: 1000 }),
    body('passing_score').isFloat({ min: 0, max: 1000 }),
    handleValidation,
  ],
  updateAssessment
);
router.delete('/:id', deleteAssessment);
router.get('/:id/grades', getAssessmentGrades);
router.post(
  '/:id/grades',
  [body('grades').isArray({ min: 1 }).withMessage('Data nilai tidak boleh kosong.'), handleValidation],
  saveAssessmentGrades
);

export default router;
