import { Response } from 'express';
import { usersService } from './users.service';
import { apiResponse } from '../../utils/apiResponse';
import { validate } from '../../middleware/validate';
import { updateProfileSchema, changePasswordSchema } from './users.types';
import { authMiddleware, AuthRequest } from '../../middleware/auth';

export const usersController = {
  getProfile: [
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const user = await usersService.getProfile(req.userId);
        return apiResponse.success(res, user);
      } catch (err: any) {
        return apiResponse.error(res, 404, err.message);
      }
    },
  ],

  updateProfile: [
    authMiddleware,
    validate(updateProfileSchema),
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const user = await usersService.updateProfile(req.userId, req.body);
        return apiResponse.success(res, user);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  changePassword: [
    authMiddleware,
    validate(changePasswordSchema),
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const { oldPassword, newPassword } = req.body;
        const result = await usersService.changePassword(req.userId, oldPassword, newPassword);
        return apiResponse.success(res, result);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  deleteAccount: [
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const result = await usersService.deleteAccount(req.userId);
        return apiResponse.success(res, result);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],
};
