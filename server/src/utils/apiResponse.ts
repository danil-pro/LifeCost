import { Request, Response } from 'express';

export const apiResponse = {
  success(res: Response, data: any, meta?: any) {
    return res.json({ success: true, data, error: null, meta: meta || null });
  },
  error(res: Response, status: number, message: string) {
    return res.status(status).json({ success: false, data: null, error: message, meta: null });
  },
};
