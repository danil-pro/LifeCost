import { Response } from 'express';
import { incomeService } from './income.service';
import { apiResponse } from '../../utils/apiResponse';
import { validate } from '../../middleware/validate';
import { createIncomeSchema, updateIncomeSchema } from './income.types';
import { authMiddleware, AuthRequest } from '../../middleware/auth';

export const incomeController = {
  create: [
    authMiddleware,
    validate(createIncomeSchema),
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const income = await incomeService.create(req.userId, req.body);
        return apiResponse.success(res, income, null);
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
        const { month } = req.query;
        const incomes = await incomeService.list(req.userId, month as string | undefined);
        return apiResponse.success(res, incomes, null);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  getCurrent: [
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const result = await incomeService.getCurrent(req.userId);
        return apiResponse.success(res, result, null);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  update: [
    authMiddleware,
    validate(updateIncomeSchema),
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const id = req.params.id as string;
        const income = await incomeService.update(req.userId, id, req.body);
        return apiResponse.success(res, income, null);
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
        const result = await incomeService.remove(req.userId, id);
        return apiResponse.success(res, result, null);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],
};
