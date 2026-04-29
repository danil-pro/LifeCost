import { Response } from 'express';
import { insightsService } from './insights.service';
import { apiResponse } from '../../utils/apiResponse';
import { authMiddleware, AuthRequest } from '../../middleware/auth';

export const insightsController = {
  costOfLiving: [
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const { month } = req.query;
        const result = await insightsService.costOfLiving(req.userId, month as string | undefined);
        return apiResponse.success(res, result);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  breakdown: [
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const { month } = req.query;
        const result = await insightsService.breakdown(req.userId, month as string | undefined);
        return apiResponse.success(res, result);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  insights: [
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const { month } = req.query;
        const result = await insightsService.insights(req.userId, month as string | undefined);
        return apiResponse.success(res, result);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],
};
