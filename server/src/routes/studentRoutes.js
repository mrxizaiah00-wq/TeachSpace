import { Router } from 'express';
import { createStudent, deleteStudent, getStudentDetail, listStudents, updateStudent } from '../controllers/studentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { handleValidation } from '../middleware/validateMiddleware.js';
import { studentValidator } from '../validators/requestValidators.js';

const router = Router();
router.use(requireAuth);

router.get('/', listStudents);
router.get('/:id', getStudentDetail);
router.post('/', studentValidator, handleValidation, createStudent);
router.put('/:id', studentValidator, handleValidation, updateStudent);
router.delete('/:id', deleteStudent);

export default router;
