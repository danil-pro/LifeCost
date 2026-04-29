import { Response } from 'express';
import { categoriesService } from './categories.service';
import { apiResponse } from '../../utils/apiResponse';
import { validate } from '../../middleware/validate';
import { createCategorySchema, updateCategorySchema } from './categories.types';
import { authMiddleware, AuthRequest } from '../../middleware/auth';

export const categoriesController = {
  list: [
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const categories = await categoriesService.list(req.userId);
        return apiResponse.success(res, categories);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  create: [
    authMiddleware,
    validate(createCategorySchema),
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const category = await categoriesService.create(req.userId, req.body);
        return apiResponse.success(res, category);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  update: [
    authMiddleware,
    validate(updateCategorySchema),
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const id = req.params.id as string;
        const category = await categoriesService.update(req.userId, id, req.body);
        return apiResponse.success(res, category);
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
        const result = await categoriesService.remove(req.userId, id);
        return apiResponse.success(res, result);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],
};
