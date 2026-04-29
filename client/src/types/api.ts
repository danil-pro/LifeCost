export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    tier: 'free' | 'premium';
    avatar?: string;
    createdAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    tier: 'free' | 'premium';
    createdAt: string;
  };
  accessToken: string;
  refreshToken: string;
}
