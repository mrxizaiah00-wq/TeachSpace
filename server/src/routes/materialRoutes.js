import { Router } from 'express';
import { deleteMaterial, downloadMaterial, listMaterials, materialUpload, uploadMaterial } from '../controllers/materialController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', listMaterials);
router.post('/', materialUpload.single('file'), uploadMaterial);
router.get('/:id/download', downloadMaterial);
router.delete('/:id', deleteMaterial);

export default router;
