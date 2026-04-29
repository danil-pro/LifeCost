import { Router } from 'express';
import { authController } from './auth.controller';
import { authLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, ...authController.register);
router.post('/login', authLimiter, ...authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', ...authController.logout);
router.get('/me', ...authController.me);

export default router;
