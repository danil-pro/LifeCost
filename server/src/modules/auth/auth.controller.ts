import { Response } from 'express';
import { authService } from './auth.service';
import { apiResponse } from '../../utils/apiResponse';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema } from './auth.types';
import { authMiddleware, AuthRequest } from '../../middleware/auth';

export const authController = {
  register: [
    validate(registerSchema),
    async (req: AuthRequest, res: Response) => {
      try {
        const { email, password } = req.body;
        const result = await authService.register(email, password);
        return apiResponse.success(res, result);
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  login: [
    validate(loginSchema),
    async (req: AuthRequest, res: Response) => {
      try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        return apiResponse.success(res, result);
      } catch (err: any) {
        return apiResponse.error(res, 401, err.message);
      }
    },
  ],

  refresh: async (req: AuthRequest, res: Response) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return apiResponse.error(res, 400, 'Refresh token is required');
      }
      const result = await authService.refreshToken(refreshToken);
      return apiResponse.success(res, result);
    } catch (err: any) {
      return apiResponse.error(res, 401, err.message);
    }
  },

  logout: [
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        const { refreshToken } = req.body;
        if (!req.userId || !refreshToken) {
          return apiResponse.error(res, 400, 'Refresh token is required');
        }
        await authService.logout(req.userId, refreshToken);
        return apiResponse.success(res, { message: 'Logged out successfully' });
      } catch (err: any) {
        return apiResponse.error(res, 400, err.message);
      }
    },
  ],

  me: [
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.userId) {
          return apiResponse.error(res, 401, 'Not authenticated');
        }
        const user = await authService.getMe(req.userId);
        return apiResponse.success(res, user);
      } catch (err: any) {
        return apiResponse.error(res, 404, err.message);
      }
    },
  ],
};
