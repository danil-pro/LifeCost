import client from './client';

export const expensesApi = {
  list: (params?: { month?: string; categoryId?: string; page?: number; limit?: number }) =>
    client.get('/expenses', { params }),
  create: (data: { amount: number; categoryId: string; description?: string; date?: string }) =>
    client.post('/expenses', data),
  quickAdd: (amount: number, categoryId?: string) =>
    client.post('/expenses/quick', { amount, categoryId }),
  summary: (month?: string) =>
    client.get('/expenses/summary', { params: { month } }),
  update: (id: string, data: Partial<{ amount: number; categoryId: string; description: string }>) =>
    client.patch(`/expenses/${id}`, data),
  remove: (id: string) => client.delete(`/expenses/${id}`),
};
