import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { apiResponse } from '../utils/apiResponse';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        return apiResponse.error(res, 400, messages.join(', '));
      }
      return apiResponse.error(res, 400, 'Validation failed');
    }
  };
};
