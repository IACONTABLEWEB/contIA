import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { uploadPdf } from '../middleware/upload.js';
import { subir, listarPorEmpresa, obtenerUno, obtenerCuentas } from '../controllers/balances.controller.js';

const router = Router();
router.use(requireAuth);

router.post('/upload', uploadPdf.single('archivo'), subir);
router.get('/', listarPorEmpresa);
router.get('/:id', obtenerUno);
router.get('/:id/cuentas', obtenerCuentas);

export default router;
