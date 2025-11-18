import { create } from 'zustand';
import axios from 'axios';

type Role = 'ADMIN' | 'CANDIDATE';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
}

interface SignUpData {
  name: string;
  username: string;
  email: string;
  password: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (data: SignUpData) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'auth-storage';
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const withWindow = typeof window !== 'undefined';

const getStoredAuth = () => {
  if (!withWindow) return { user: null, token: null };
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { user: parsed.user ?? null, token: parsed.token ?? null };
    }
  } catch {
    // ignore corrupted storage
  }
  return { user: null, token: null };
};

const persistAuth = (user: User | null, token: string | null) => {
  if (!withWindow) return;
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      user,
      token,
    })
  );
};

const clearPersistedAuth = () => {
  if (!withWindow) return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

const stored = getStoredAuth();

axios.defaults.baseURL = API_URL;
if (stored.token) {
  axios.defaults.headers.common.Authorization = `Bearer ${stored.token}`;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: stored.user,
  token: stored.token,

  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const tokenResponse = await axios.post('/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const token = tokenResponse.data.access_token;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;

    const profileResponse = await axios.get<User>('/users/me');
    const nextState = { user: profileResponse.data, token };
    set(nextState);
    persistAuth(nextState.user, nextState.token);
  },

  signup: async (data: SignUpData) => {
    try {
      await axios.post('/users/register', data);
      await get().login(data.username, data.password);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.message ||
        'Sign up failed';
      throw new Error(errorMessage);
    }
  },

  fetchProfile: async () => {
    const token = get().token;
    if (!token) return;

    try {
      const profileResponse = await axios.get<User>('/users/me');
      set((state) => {
        const nextState = { ...state, user: profileResponse.data };
        persistAuth(nextState.user, nextState.token);
        return nextState;
      });
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  },

  logout: () => {
    set({ user: null, token: null });
    clearPersistedAuth();
    delete axios.defaults.headers.common.Authorization;
  },
}));
