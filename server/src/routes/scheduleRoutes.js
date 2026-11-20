import { Router } from 'express';
import { createSchedule, deleteSchedule, listSchedules, updateSchedule } from '../controllers/scheduleController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { handleValidation } from '../middleware/validateMiddleware.js';
import { scheduleValidator } from '../validators/requestValidators.js';

const router = Router();
router.use(requireAuth);

router.get('/', listSchedules);
router.post('/', scheduleValidator, handleValidation, createSchedule);
router.put('/:id', scheduleValidator, handleValidation, updateSchedule);
router.delete('/:id', deleteSchedule);

export default router;
