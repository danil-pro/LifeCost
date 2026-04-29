import client from './client';

export const authApi = {
  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }),
  register: (email: string, password: string) =>
    client.post('/auth/register', { email, password }),
  me: () => client.get('/auth/me'),
};
