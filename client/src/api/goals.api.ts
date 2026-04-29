import client from './client';

export const goalsApi = {
  list: (isCompleted?: boolean) =>
    client.get('/goals', { params: { isCompleted } }),
  create: (data: { name: string; targetAmount: number; deadline?: string }) =>
    client.post('/goals', data),
  getById: (id: string) => client.get(`/goals/${id}`),
  update: (id: string, data: Partial<{ name: string; targetAmount: number; savedAmount: number }>) =>
    client.patch(`/goals/${id}`, data),
  remove: (id: string) => client.delete(`/goals/${id}`),
  projection: (id: string) => client.get(`/goals/${id}/projection`),
  addDeposit: (goalId: string, amount: number) =>
    client.post(`/goals/${goalId}/deposits`, { amount }),
  listDeposits: (goalId: string) =>
    client.get(`/goals/${goalId}/deposits`),
};
