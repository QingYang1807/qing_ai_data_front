import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/api/system';

export interface User {
  id: number;
  username: string;
  realName: string;
  email: string;
  phone: string;
  avatar?: string;
  status: number;
  lastLoginTime: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login({ username, password });
          if (response.data.success) {
            const user = response.data.data;
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      register: async (userData: any) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(userData);
          set({ isLoading: false });
          return response.data.success;
        } catch (error) {
          console.error('Register error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => {
        authAPI.logout().catch(console.error);
        get().clearAuth();
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setToken: (token: string) => {
        set({ token });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 