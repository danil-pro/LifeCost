import client from './client';

interface SimulationAdjustment {
  categoryId: string;
  newAmount: number;
}

export interface SimulationResult {
  month: string;
  currentTotal: number;
  simulatedTotal: number;
  savings: number;
  changes: {
    categoryId: string;
    categoryName: string;
    currentAmount: number;
    newAmount: number;
    difference: number;
  }[];
}

export interface CoffeeCutResult {
  month: string;
  category: string;
  percent: number;
  currentSpending: number;
  newSpending: number;
  savings: number;
  transactionsCount: number;
}

export interface StupidSpendingItem {
  category: string;
  categoryId: string;
  count: number;
  total: number;
  averageAmount: number;
}

export const simulationsApi = {
  run: (adjustments: SimulationAdjustment[]) =>
    client.post('/simulations', { adjustments }),
  coffeeCut: (percent: number) =>
    client.get('/simulations/coffee-cut', { params: { percent } }),
  stupidSpending: () =>
    client.get('/simulations/stupid-spending'),
};
