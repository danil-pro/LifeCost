import client from './client';

export const insightsApi = {
  list: (month?: string) =>
    client.get('/insights', { params: { month } }),
  breakdown: (month?: string) =>
    client.get('/insights/breakdown', { params: { month } }),
  costOfLiving: (month?: string) =>
    client.get('/insights/cost-of-living', { params: { month } }),
};
