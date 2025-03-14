// components/ui/NavBar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth';

const NavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // 處理客戶端渲染時的狀態同步
  useEffect(() => {
    setMounted(true);
  }, []);

  // 避免 SSR 渲染時的狀態不一致
  if (!mounted) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          寫字練習平台
        </Link>
        
        <nav className="flex items-center space-x-4">
          <Link 
            href="/" 
            className={`hover:text-blue-200 ${pathname === '/' ? 'text-blue-200 underline' : ''}`}
          >
            首頁
          </Link>
          <Link 
            href="/practice" 
            className={`hover:text-blue-200 ${pathname === '/practice' ? 'text-blue-200 underline' : ''}`}
          >
            練習
          </Link>
          <Link 
            href="/progress" 
            className={`hover:text-blue-200 ${pathname === '/progress' ? 'text-blue-200 underline' : ''}`}
          >
            學習進度
          </Link>
          
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <span>你好，{user?.username}</span>
              <button 
                onClick={handleLogout}
                className="bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded"
              >
                登出
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded"
            >
              登錄
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default NavBar;