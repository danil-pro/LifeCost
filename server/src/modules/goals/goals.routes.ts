import { Router } from 'express';
import { goalsController } from './goals.controller';

const router = Router();

router.post('/', ...goalsController.create);
router.get('/', ...goalsController.list);
router.get('/:id', ...goalsController.getById);
router.get('/:id/projection', ...goalsController.projection);
router.post('/:id/deposits', ...goalsController.addDeposit);
router.get('/:id/deposits', ...goalsController.listDeposits);
router.patch('/:id', ...goalsController.update);
router.delete('/:id', ...goalsController.remove);

export default router;
