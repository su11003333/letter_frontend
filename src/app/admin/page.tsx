'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { User, CharacterPreview } from '@/lib/types';
import { ApiService } from '@/lib/utils/api';

// 管理面板主頁面
export default function AdminPage() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [characters, setCharacters] = useState<CharacterPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 檢查是否登入且是管理員
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    // 在實際應用中，可以檢查用戶是否具有管理員權限
    if (user?.id !== 1) { // 假設 ID=1 的用戶是管理員
      setError('您沒有權限訪問此頁面');
      return;
    }

    // 載入初始數據
    fetchData();
  }, [isLoggedIn, user, router]);

  // 獲取所有數據
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 獲取字元列表
      const charactersData = await ApiService.getCharacters();
      setCharacters(charactersData);

      // 模擬獲取用戶列表 (實際應用中應該有API)
      const mockUsers = [
        { id: 1, username: "admin", email: "admin@example.com" },
        { id: 2, username: "demo", email: "demo@example.com" },
        { id: 3, username: "test", email: "test@example.com" },
      ];
      setUsers(mockUsers);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('獲取數據失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  // 添加新用戶
  const handleAddUser = () => {
    const username = prompt('請輸入用戶名');
    if (!username) return;
    
    const email = prompt('請輸入郵箱');
    if (!email) return;

    const newUser = {
      id: users.length + 1,
      username,
      email
    };

    setUsers([...users, newUser]);
    alert('用戶添加成功！');
  };

  // 刪除用戶
  const handleDeleteUser = (id: number) => {
    if (confirm('確定要刪除此用戶嗎？')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  // 渲染用戶管理頁面
  const renderUsersTab = () => (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">用戶管理</h2>
        <button 
          onClick={handleAddUser}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          添加用戶
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">用戶名</th>
              <th className="py-2 px-4 text-left">郵箱</th>
              <th className="py-2 px-4 text-left">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-3 px-4">{user.id}</td>
                <td className="py-3 px-4">{user.username}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-800 mr-2"
                  >
                    刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 渲染字元管理頁面
  const renderCharactersTab = () => (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">字元管理</h2>
        <button 
          onClick={() => alert('此功能尚未實現')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          添加字元
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {characters.map(char => (
          <div 
            key={char.id}
            className="border rounded-lg p-4 text-center hover:shadow-md"
          >
            <div className="text-5xl font-bold mb-2">{char.preview}</div>
            <div className="text-gray-700">{char.name}</div>
            <div className="mt-2 flex justify-center space-x-2">
              <button className="text-blue-600 hover:text-blue-800">
                編輯
              </button>
              <button className="text-red-600 hover:text-red-800">
                刪除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 渲染統計頁面
  const renderStatsTab = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">系統統計</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg">
          <div className="text-lg font-semibold text-blue-800">用戶總數</div>
          <div className="text-3xl font-bold">{users.length}</div>
        </div>
        
        <div className="bg-green-100 p-4 rounded-lg">
          <div className="text-lg font-semibold text-green-800">字元總數</div>
          <div className="text-3xl font-bold">{characters.length}</div>
        </div>
        
        <div className="bg-purple-100 p-4 rounded-lg">
          <div className="text-lg font-semibold text-purple-800">筆畫記錄</div>
          <div className="text-3xl font-bold">32</div> {/* 模擬數據 */}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-2">系統狀態</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>後端 API:</span>
            <span className="text-green-600">正常運行</span>
          </div>
          <div className="flex justify-between">
            <span>資料儲存:</span>
            <span className="text-yellow-600">使用記憶體儲存</span>
          </div>
          <div className="flex justify-between">
            <span>上次重啟:</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">載入中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">管理員控制台</h1>
      
      <div className="mb-6">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-4 ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              用戶管理
            </button>
            <button
              onClick={() => setActiveTab('characters')}
              className={`py-2 px-4 ${
                activeTab === 'characters'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              字元管理
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-2 px-4 ${
                activeTab === 'stats'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              系統統計
            </button>
          </nav>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'characters' && renderCharactersTab()}
        {activeTab === 'stats' && renderStatsTab()}
      </div>
    </div>
  );
}