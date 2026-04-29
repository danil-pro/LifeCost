import client from './client';

export const incomeApi = {
  list: (month?: string) =>
    client.get('/income', { params: { month } }),
  current: () => client.get('/income/current'),
  create: (data: { amount: number; currency?: string; month: string; label?: string }) =>
    client.post('/income', data),
  update: (id: string, data: Partial<{ amount: number; label: string }>) =>
    client.patch(`/income/${id}`, data),
  remove: (id: string) => client.delete(`/income/${id}`),
};
