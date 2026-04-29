import { z } from 'zod';

export const createGoalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  targetAmount: z.number().positive('Target amount must be positive'),
  deadline: z.string().min(1).optional(),
});

export const updateGoalSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  targetAmount: z.number().positive('Target amount must be positive').optional(),
  savedAmount: z.number().min(0, 'Saved amount must be non-negative').optional(),
  deadline: z.string().min(1).optional().nullable(),
});

export const createDepositSchema = z.object({
  amount: z.number().positive('Deposit amount must be positive'),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
