import { z } from 'zod';

export const createExpenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  categoryId: z.string().min(1, 'Category ID is required'),
  description: z.string().max(255).optional(),
  date: z.string().optional(),
});

export const quickExpenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  categoryId: z.string().optional(),
});

export const updateExpenseSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  categoryId: z.string().optional(),
  description: z.string().max(255).optional(),
  date: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type QuickExpenseInput = z.infer<typeof quickExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
