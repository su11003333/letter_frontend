'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiService } from '@/lib/utils/api';
import { useAuthStore } from '@/lib/store/auth';

const LoginForm = () => {
  const router = useRouter();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!username || !password) {
      setError('請輸入用戶名和密碼');
      setIsLoading(false);
      return;
    }

    try {
      // 在實際應用中，這裡應調用真實的 API
      // 模擬 API 調用延遲
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 簡化登入邏輯 (實際應用中應從 API 獲取)
      const mockResponse = {
        user: { id: 1, username },
        token: 'mock-jwt-token'
      };

      // 存儲到 Zustand 和 localStorage
      login(mockResponse.user, mockResponse.token);

      // 跳轉到練習頁面
      router.push('/practice');
    } catch (error) {
      console.error('登入失敗:', error);
      setError('登入失敗，請檢查您的用戶名和密碼');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            用戶名
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            密碼
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-blue-400"
        >
          {isLoading ? '登入中...' : '登入'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        <p>還沒有帳號？ 
          <Link href="/register" className="text-blue-600 hover:underline ml-1">
            註冊
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;