import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { apiResponse } from '../utils/apiResponse';

export interface AuthRequest extends Request {
  userId?: string;
  userTier?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return apiResponse.error(res, 401, 'No token provided');
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    req.userId = payload.userId;
    req.userTier = payload.tier;
    next();
  } catch {
    return apiResponse.error(res, 401, 'Invalid or expired token');
  }
};

export const premiumMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userTier !== 'premium') {
    return apiResponse.error(res, 403, 'Premium feature');
  }
  next();
};
