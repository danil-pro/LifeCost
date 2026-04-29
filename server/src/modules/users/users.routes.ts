import { Router } from 'express';
import { usersController } from './users.controller';

const router = Router();

router.get('/profile', ...usersController.getProfile);
router.patch('/profile', ...usersController.updateProfile);
router.patch('/password', ...usersController.changePassword);
router.delete('/profile', ...usersController.deleteAccount);

export default router;
