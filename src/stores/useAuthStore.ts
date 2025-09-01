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
          if (response.code === 200) {
            const loginUser = response.data.user;
            // 创建完整的User对象，补充缺失的属性
            const user: User = {
              id: loginUser.id,
              username: loginUser.username,
              realName: loginUser.username, // 使用username作为realName的默认值
              email: loginUser.email,
              phone: '', // 默认空字符串
              status: 1, // 默认启用状态
              lastLoginTime: new Date().toISOString(),
            };
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
          return response.code === 200;
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