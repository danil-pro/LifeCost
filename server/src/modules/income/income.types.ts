import { z } from 'zod';

export const createIncomeSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().min(3).max(3).default('USD'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  label: z.string().max(100).optional(),
  isRecurring: z.boolean().default(true),
});

export const updateIncomeSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  currency: z.string().min(3).max(3).optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format').optional(),
  label: z.string().max(100).optional(),
  isRecurring: z.boolean().optional(),
});

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
