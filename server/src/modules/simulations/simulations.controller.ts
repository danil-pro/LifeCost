import { Response } from 'express';
import { simulationsService } from './simulations.service';
import { apiResponse } from '../../utils/apiResponse';
import { validate } from '../../middleware/validate';
import { simulationSchema } from './simulations.types';
import { authMiddleware, premiumMiddleware, AuthRequest } from '../../middleware/auth';

export const simulationsController = {
  simulate: [
    authMiddleware,
    premiumMiddleware,
    validate(simulationSchema),
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const { adjustments, month } = req.body;
        const result = await simulationsService.simulate(req.userId, adjustments, month);
        return apiResponse.success(res, result);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  coffeeCut: [
    authMiddleware,
    premiumMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const { percent, month } = req.query;
        const pct = percent ? parseFloat(percent as string) : 50;
        if (pct <= 0 || pct > 100) {
          return apiResponse.error(res, 400, 'Percent must be between 1 and 100');
        }
        const result = await simulationsService.coffeeCut(req.userId, pct, month as string | undefined);
        return apiResponse.success(res, result);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  stupidSpending: [
    authMiddleware,
    premiumMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const { month } = req.query;
        const result = await simulationsService.stupidSpending(req.userId, month as string | undefined);
        return apiResponse.success(res, result);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],
};
