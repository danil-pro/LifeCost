import { Response } from 'express';
import { goalsService } from './goals.service';
import { apiResponse } from '../../utils/apiResponse';
import { validate } from '../../middleware/validate';
import { createGoalSchema, updateGoalSchema, createDepositSchema } from './goals.types';
import { authMiddleware, premiumMiddleware, AuthRequest } from '../../middleware/auth';

export const goalsController = {
  create: [
    authMiddleware,
    validate(createGoalSchema),
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const goal = await goalsService.create(req.userId, req.body);
        return apiResponse.success(res, goal);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  list: [
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const { isCompleted } = req.query;
        const goals = await goalsService.list(req.userId, isCompleted as string | undefined);
        return apiResponse.success(res, goals);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  getById: [
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const id = req.params.id as string;
        const goal = await goalsService.getById(req.userId, id);
        return apiResponse.success(res, goal);
      } catch (err: any) {
        return apiResponse.error(res, 404, err.message);
      }
    },
  ],

  update: [
    authMiddleware,
    validate(updateGoalSchema),
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const id = req.params.id as string;
        const goal = await goalsService.update(req.userId, id, req.body);
        return apiResponse.success(res, goal);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  remove: [
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const id = req.params.id as string;
        const result = await goalsService.remove(req.userId, id);
        return apiResponse.success(res, result);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  addDeposit: [
    authMiddleware,
    validate(createDepositSchema),
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const goalId = req.params.id as string;
        const { amount } = req.body;
        const deposit = await goalsService.addDeposit(req.userId, goalId, amount);
        return apiResponse.success(res, deposit);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  listDeposits: [
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const goalId = req.params.id as string;
        const deposits = await goalsService.listDeposits(req.userId, goalId);
        return apiResponse.success(res, deposits);
      } catch (err: any) {
        return apiResponse.error(res, 404, err.message);
      }
    },
  ],

  projection: [
    authMiddleware,
    premiumMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const id = req.params.id as string;
        const result = await goalsService.projection(req.userId, id);
        return apiResponse.success(res, result);
      } catch (err: any) {
        return apiResponse.error(res, 404, err.message);
      }
    },
  ],
};
