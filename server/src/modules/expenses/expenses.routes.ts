import { Router } from 'express';
import { expensesController } from './expenses.controller';

const router = Router();

router.post('/', ...expensesController.create);
router.post('/quick', ...expensesController.quickAdd);
router.get('/summary', ...expensesController.summary);
router.get('/', ...expensesController.list);
router.patch('/:id', ...expensesController.update);
router.delete('/:id', ...expensesController.remove);

export default router;
