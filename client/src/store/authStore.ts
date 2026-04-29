import { create } from 'zustand';
import { tokenManager } from '../api/client';

interface User {
  id: string;
  email: string;
  displayName: string | null;
  locale: string;
  currency: string;
  tier: 'free' | 'premium';
  createdAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
}

const TOKEN_KEY = 'lifecost-access-token';
const REFRESH_KEY = 'lifecost-refresh-token';
const USER_KEY = 'lifecost-user';

const savedToken = localStorage.getItem(TOKEN_KEY) || '';
const savedRefresh = localStorage.getItem(REFRESH_KEY) || '';
let savedUser: User | null = null;

try {
  const raw = localStorage.getItem(USER_KEY);
  if (raw) {
    savedUser = JSON.parse(raw);
  }
} catch {
  savedUser = null;
}

if (savedToken) {
  tokenManager.setTokens(savedToken, savedRefresh);
}

export const useAuthStore = create<AuthState>((set) => ({
  user: savedUser,
  accessToken: savedToken,
  isAuthenticated: !!savedToken && !!savedUser,

  setUser: (user) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    set({ user, isAuthenticated: !!user });
  },

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_KEY, refreshToken);
    }
    tokenManager.setTokens(accessToken, refreshToken);
    set({ accessToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    tokenManager.clearTokens();
    set({ user: null, accessToken: '', isAuthenticated: false });
  },
}));
