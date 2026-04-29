import { Response } from 'express';
import { expensesService } from './expenses.service';
import { apiResponse } from '../../utils/apiResponse';
import { validate } from '../../middleware/validate';
import { createExpenseSchema, quickExpenseSchema, updateExpenseSchema } from './expenses.types';
import { authMiddleware, AuthRequest } from '../../middleware/auth';

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export const expensesController = {
  create: [
    authMiddleware,
    validate(createExpenseSchema),
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const expense = await expensesService.create(req.userId, req.body);
        return apiResponse.success(res, expense);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  quickAdd: [
    authMiddleware,
    validate(quickExpenseSchema),
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const { amount, categoryId } = req.body;
        const expense = await expensesService.quickAdd(req.userId, amount, categoryId);
        return apiResponse.success(res, expense);
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
        const { month, categoryId, page, limit } = req.query;
        const result = await expensesService.list(
          req.userId,
          month as string | undefined,
          categoryId as string | undefined,
          page ? parseInt(page as string, 10) : undefined,
          limit ? parseInt(limit as string, 10) : undefined,
        );
        return apiResponse.success(res, result.expenses, result.meta);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  summary: [
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const { month } = req.query;
        const summaryMonth = (month && typeof month === 'string') ? month : getCurrentMonth();
        const result = await expensesService.summary(req.userId, summaryMonth);
        return apiResponse.success(res, result);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  update: [
    authMiddleware,
    validate(updateExpenseSchema),
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const id = req.params.id as string;
        const expense = await expensesService.update(req.userId, id, req.body);
        return apiResponse.success(res, expense);
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
        const result = await expensesService.remove(req.userId, id);
        return apiResponse.success(res, result);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],
};
