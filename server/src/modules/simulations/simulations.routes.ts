import { Router } from 'express';
import { simulationsController } from './simulations.controller';

const router = Router();

router.post('/', ...simulationsController.simulate);
router.get('/coffee-cut', ...simulationsController.coffeeCut);
router.get('/stupid-spending', ...simulationsController.stupidSpending);

export default router;
