import { Router } from 'express';
import { categoriesController } from './categories.controller';

const router = Router();

router.get('/', ...categoriesController.list);
router.post('/', ...categoriesController.create);
router.patch('/:id', ...categoriesController.update);
router.delete('/:id', ...categoriesController.remove);

export default router;
