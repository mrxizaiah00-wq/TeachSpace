import { Router } from 'express';
import { createSubject, deleteSubject, listSubjects, updateSubject } from '../controllers/subjectController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { handleValidation } from '../middleware/validateMiddleware.js';
import { subjectValidator } from '../validators/requestValidators.js';

const router = Router();
router.use(requireAuth);

router.get('/', listSubjects);
router.post('/', subjectValidator, handleValidation, createSubject);
router.put('/:id', subjectValidator, handleValidation, updateSubject);
router.delete('/:id', deleteSubject);

export default router;
