// lib/store/auth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '../types';

// 建立認證狀態管理
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      token: null,
      
      // 登入處理
      login: (user: User, token: string) => set({
        user,
        token,
        isLoggedIn: true,
      }),
      
      // 登出處理
      logout: () => set({
        user: null,
        token: null,
        isLoggedIn: false,
      }),
    }),
    {
      name: 'auth-storage', // 持久化存儲名稱
    }
  )
);