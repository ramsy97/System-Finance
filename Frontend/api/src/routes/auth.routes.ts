import { Router } from 'express';
import { login, me, logout, setup2FA, verify2FA, changePassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { loginSchema } from '../utils/schemas';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', authLimiter, validateBody(loginSchema), login);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);
router.post('/2fa/setup', authenticate, setup2FA);
router.post('/2fa/verify', authenticate, verify2FA);
router.post('/change-password', authenticate, changePassword);

export default router;
