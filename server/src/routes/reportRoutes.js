import { Router } from 'express';
import { exportReportExcel, exportReportPdf, getReport } from '../controllers/reportController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', getReport);
router.get('/export/excel', exportReportExcel);
router.get('/export/pdf', exportReportPdf);

export default router;
