import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listar, obtener, crear, actualizar, eliminar } from '../controllers/empresas.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', listar);
router.post('/', crear);
router.get('/:id', obtener);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

export default router;
