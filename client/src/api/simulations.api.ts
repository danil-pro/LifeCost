import client from './client';

interface SimulationAdjustment {
  categoryId: string;
  newAmount: number;
}

export interface SimulationResult {
  currentTotal: number;
  projectedTotal: number;
  monthlySavings: number;
  breakdown: {
    categoryId: string;
    categoryName: string;
    currentAmount: number;
    newAmount: number;
  }[];
}

export interface CoffeeCutResult {
  currentSpending: number;
  projectedSpending: number;
  monthlySavings: number;
  percentCut: number;
}

export interface StupidSpendingItem {
  description: string;
  categoryName: string;
  averageAmount: number;
  frequency: number;
  totalSpent: number;
}

export const simulationsApi = {
  run: (adjustments: SimulationAdjustment[]) =>
    client.post('/simulations', { adjustments }),
  coffeeCut: (percent: number) =>
    client.get('/simulations/coffee-cut', { params: { percent } }),
  stupidSpending: () =>
    client.get('/simulations/stupid-spending'),
};
