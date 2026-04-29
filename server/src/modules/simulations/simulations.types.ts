import { z } from 'zod';

export const simulationSchema = z.object({
  adjustments: z.array(
    z.object({
      categoryId: z.string().min(1, 'Category ID is required'),
      newAmount: z.number().min(0, 'New amount must be non-negative'),
    }),
  ).min(1, 'At least one adjustment is required'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format').optional(),
});

export type SimulationInput = z.infer<typeof simulationSchema>;
