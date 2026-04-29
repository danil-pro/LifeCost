import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  nameRu: z.string().max(50).optional(),
  icon: z.string().max(30).optional(),
  type: z.enum(['fixed', 'variable']).default('variable'),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  nameRu: z.string().max(50).optional(),
  icon: z.string().max(30).optional(),
  type: z.enum(['fixed', 'variable']).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
