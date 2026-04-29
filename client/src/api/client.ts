import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

let accessToken = '';
let refreshToken = '';

export const tokenManager = {
  getAccessToken: (): string => accessToken,
  getRefreshToken: (): string => refreshToken,
  setTokens: (access: string, refresh?: string): void => {
    accessToken = access;
    if (refresh) {
      refreshToken = refresh;
    }
  },
  clearTokens: (): void => {
    accessToken = '';
    refreshToken = '';
  },
};

const client: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = tokenManager.getRefreshToken();
        if (!refresh) {
          tokenManager.clearTokens();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${client.defaults.baseURL}/auth/refresh`,
          { refreshToken: refresh }
        );

        const { accessToken: newAccess, refreshToken: newRefresh } = response.data.data;
        tokenManager.setTokens(newAccess, newRefresh);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        }

        return client(originalRequest);
      } catch (refreshError) {
        tokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
