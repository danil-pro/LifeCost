import { Router } from 'express';
import { incomeController } from './income.controller';

const router = Router();

router.post('/', ...incomeController.create);
router.get('/', ...incomeController.list);
router.get('/current', ...incomeController.getCurrent);
router.patch('/:id', ...incomeController.update);
router.delete('/:id', ...incomeController.remove);

export default router;
