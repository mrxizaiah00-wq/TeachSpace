import { Router } from 'express';
import { body } from 'express-validator';
import {
  addStudentToClass,
  addSubjectToClass,
  createClass,
  deleteClass,
  getClassDetail,
  listClasses,
  removeStudentFromClass,
  removeSubjectFromClass,
  updateClass,
} from '../controllers/classController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { handleValidation } from '../middleware/validateMiddleware.js';
import { classValidator } from '../validators/requestValidators.js';

const router = Router();
router.use(requireAuth);

router.get('/', listClasses);
router.get('/:id', getClassDetail);
router.post('/', classValidator, handleValidation, createClass);
router.put('/:id', classValidator, handleValidation, updateClass);
router.delete('/:id', deleteClass);
router.post('/:id/students', [body('student_id').isInt().withMessage('Siswa wajib dipilih.'), handleValidation], addStudentToClass);
router.delete('/:id/students/:studentId', removeStudentFromClass);
router.post('/:id/subjects', [body('subject_id').isInt().withMessage('Mata pelajaran wajib dipilih.'), handleValidation], addSubjectToClass);
router.delete('/:id/subjects/:subjectId', removeSubjectFromClass);

export default router;
