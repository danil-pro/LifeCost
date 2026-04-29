import { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../utils/apiResponse';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`[Error] ${err.message}`, err.stack);
  return apiResponse.error(res, 500, 'Internal server error');
};
