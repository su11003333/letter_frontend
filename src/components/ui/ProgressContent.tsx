'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { ApiService } from '@/lib/utils/api';
import { CharacterPreview } from '@/lib/types';

// 進度數據接口
interface CharacterProgress {
  characterId: number;
  attempts: number;
  avgScore: number;
  mastery: number;
}

const ProgressContent = () => {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const [progressData, setProgressData] = useState<Record<number, CharacterProgress>>({});
  const [characters, setCharacters] = useState<CharacterPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 檢查用戶是否已登入
    if (!isLoggedIn || !user) {
      router.push('/login');
      return;
    }

    // 獲取所有字元和用戶進度
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 在實際應用中，這裡應該調用真實 API
        // 模擬字元數據
        const mockCharacters: CharacterPreview[] = [
          { id: 1, name: "一", preview: "一" },
          { id: 2, name: "二", preview: "二" },
          { id: 3, name: "三", preview: "三" },
          { id: 4, name: "四", preview: "四" },
          { id: 5, name: "五", preview: "五" },
          { id: 6, name: "六", preview: "六" },
          { id: 7, name: "七", preview: "七" },
          { id: 8, name: "八", preview: "八" },
          { id: 9, name: "九", preview: "九" },
          { id: 10, name: "十", preview: "十" },
        ];
        
        // 模擬進度數據
        const mockProgressData: Record<number, CharacterProgress> = {
          1: { characterId: 1, attempts: 10, avgScore: 0.85, mastery: 85 },
          2: { characterId: 2, attempts: 8, avgScore: 0.72, mastery: 72 },
          3: { characterId: 3, attempts: 5, avgScore: 0.65, mastery: 65 },
        };

        setCharacters(mockCharacters);
        setProgressData(mockProgressData);
      } catch (error) {
        console.error('Error fetching progress data:', error);
        setError('無法載入進度數據，請稍後再試');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn, router, user]);

  // 獲取熟練度顏色
  const getMasteryColor = (mastery: number) => {
    if (mastery >= 90) return 'bg-green-500';
    if (mastery >= 70) return 'bg-green-300';
    if (mastery >= 50) return 'bg-yellow-400';
    if (mastery >= 30) return 'bg-orange-400';
    return 'bg-red-400';
  };

  if (isLoading) {
    return <div className="text-center py-10">載入中...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">總體進度</h2>
        <div className="flex items-center mb-4">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full"
              style={{
                width: `${
                  (Object.keys(progressData).length / characters.length) * 100
                }%`,
              }}
            ></div>
          </div>
          <span className="ml-4 font-semibold">
            {Object.keys(progressData).length} / {characters.length} 字
          </span>
        </div>
        <p className="text-gray-600">
          已完成 {Object.keys(progressData).length} 個字的練習，共 {characters.length} 個字。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">字元熟練度</h2>
        
        {Object.keys(progressData).length === 0 ? (
          <p className="text-gray-500 py-4">尚未有任何練習記錄，開始練習以查看進度。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">字元</th>
                  <th className="py-2 px-4 text-left">嘗試次數</th>
                  <th className="py-2 px-4 text-left">平均得分</th>
                  <th className="py-2 px-4 text-left">熟練度</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(progressData).map((progress) => {
                  const character = characters.find(c => c.id === progress.characterId);
                  return (
                    <tr key={progress.characterId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="text-2xl font-bold mr-2">{character?.preview}</span>
                          <span>{character?.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{progress.attempts}</td>
                      <td className="py-3 px-4">{(progress.avgScore * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className={`h-2.5 rounded-full ${getMasteryColor(progress.mastery)}`}
                              style={{ width: `${progress.mastery}%` }}
                            ></div>
                          </div>
                          <span>{progress.mastery.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">推薦練習</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {characters
            .filter(char => !progressData[char.id])
            .slice(0, 4)
            .map(char => (
              <div
                key={char.id}
                className="p-4 border rounded-lg hover:shadow-md cursor-pointer"
                onClick={() => router.push(`/practice?id=${char.id}`)}
              >
                <div className="text-3xl font-bold text-center mb-2">{char.preview}</div>
                <div className="text-center text-gray-600">{char.name}</div>
              </div>
            ))}
          {characters.filter(char => !progressData[char.id]).length === 0 && (
            <p className="col-span-full text-gray-500">
              恭喜！您已經練習過所有字元。可以繼續練習來提高熟練度。
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressContent;