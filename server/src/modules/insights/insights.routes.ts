import { Router } from 'express';
import { insightsController } from './insights.controller';

const router = Router();

router.get('/cost-of-living', ...insightsController.costOfLiving);
router.get('/breakdown', ...insightsController.breakdown);
router.get('/', ...insightsController.insights);

export default router;
