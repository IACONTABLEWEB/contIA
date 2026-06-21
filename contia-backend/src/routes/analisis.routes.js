import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { crear, obtener, status, exportarDocx, exportarPdf } from '../controllers/analisis.controller.js';

const router = Router();
router.use(requireAuth);

router.post('/', crear);
router.get('/:id', obtener);
router.get('/:id/status', status);
router.get('/:id/export/docx', exportarDocx);
router.get('/:id/export/pdf', exportarPdf);

export default router;
