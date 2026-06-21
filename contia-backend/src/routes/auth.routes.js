import { Router } from 'express';
import { registrar, login, me } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', registrar);
router.post('/login', login);
router.get('/me', requireAuth, me);

export default router;
