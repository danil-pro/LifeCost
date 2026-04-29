import client from './client';

export const categoriesApi = {
  list: () => client.get('/categories'),
  create: (data: { name: string; nameRu?: string; icon?: string; type?: string }) =>
    client.post('/categories', data),
};
