'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { ApiService } from '@/lib/utils/api';
import { CharacterPreview, CharacterProgress, UserProgress } from '@/lib/types';
import {
  CheckCircleIcon,
  ChartBarIcon,
  StarIcon,
  ArrowPathIcon,
  ArrowRightIcon
} from '@heroicons/react/24/solid';

const ProgressContent = () => {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const [progressData, setProgressData] = useState<UserProgress>({});
  const [characters, setCharacters] = useState<CharacterPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalMastery, setTotalMastery] = useState(0);
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
        // 獲取字元列表
        const charactersData = await ApiService.getCharacters();
        setCharacters(charactersData);
        
        // 獲取用戶進度
        const progressData = await ApiService.getUserProgress(user.id);
        setProgressData(progressData);
        
        // 計算總體熟練度
        calculateTotalMastery(progressData, charactersData.length);
      } catch (error) {
        console.error('Error fetching progress data:', error);
        setError('無法載入進度數據，請稍後再試');
        
        // 在開發環境使用模擬數據
        if (process.env.NODE_ENV === 'development') {
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
          
          const mockProgressData: UserProgress = {
            "1": { characterId: 1, attempts: 10, avgScore: 0.85, mastery: 85, lastStroke: 0 },
            "2": { characterId: 2, attempts: 8, avgScore: 0.72, mastery: 72, lastStroke: 1 },
            "3": { characterId: 3, attempts: 5, avgScore: 0.65, mastery: 65, lastStroke: 2 },
          };
          
          setCharacters(mockCharacters);
          setProgressData(mockProgressData);
          calculateTotalMastery(mockProgressData, mockCharacters.length);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn, router, user]);

  // 計算總體熟練度
  const calculateTotalMastery = (progressData: UserProgress, totalCharacters: number) => {
    const completedCharacters = Object.keys(progressData).length;
    const totalPossibleMastery = totalCharacters * 100; // 每個字100%
    
    let totalAchievedMastery = 0;
    Object.values(progressData).forEach(progress => {
      totalAchievedMastery += progress.mastery;
    });
    
    const overallMastery = (totalAchievedMastery / totalPossibleMastery) * 100;
    setTotalMastery(overallMastery);
  };

  // 獲取熟練度顏色
  const getMasteryColor = (mastery: number) => {
    if (mastery >= 90) return 'bg-green-500';
    if (mastery >= 70) return 'bg-green-400';
    if (mastery >= 50) return 'bg-yellow-400';
    if (mastery >= 30) return 'bg-orange-400';
    return 'bg-red-400';
  };

  // 獲取熟練度等級文字
  const getMasteryLevel = (mastery: number) => {
    if (mastery >= 90) return '精通';
    if (mastery >= 70) return '熟練';
    if (mastery >= 50) return '進步中';
    if (mastery >= 30) return '初學';
    return '剛開始';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">載入中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* 總體進度摘要卡片 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <ChartBarIcon className="h-6 w-6 mr-2 text-blue-500" />
          學習進度摘要
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="text-lg font-semibold text-blue-800">總體掌握度</div>
            <div className="text-3xl font-bold">{totalMastery.toFixed(1)}%</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="text-lg font-semibold text-green-800">已練習字數</div>
            <div className="text-3xl font-bold">{Object.keys(progressData).length} / {characters.length}</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="text-lg font-semibold text-purple-800">總練習次數</div>
            <div className="text-3xl font-bold">
              {Object.values(progressData).reduce((sum, char) => sum + char.attempts, 0)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center mb-2">
          <div className="text-gray-700 font-medium">完成進度</div>
          <div className="ml-auto">{Object.keys(progressData).length} / {characters.length} 字</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-500"
            style={{
              width: `${(Object.keys(progressData).length / characters.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* 字元熟練度詳情 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <StarIcon className="h-6 w-6 mr-2 text-yellow-500" />
          字元熟練度詳情
        </h2>
        
        {Object.keys(progressData).length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">尚未有任何練習記錄</p>
            <button 
              onClick={() => router.push('/practice')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              開始練習
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 text-left font-semibold">字元</th>
                  <th className="py-3 px-4 text-left font-semibold">嘗試次數</th>
                  <th className="py-3 px-4 text-left font-semibold">平均得分</th>
                  <th className="py-3 px-4 text-left font-semibold">熟練度</th>
                  <th className="py-3 px-4 text-left font-semibold">等級</th>
                  <th className="py-3 px-4 text-left font-semibold">動作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Object.entries(progressData).map(([charId, progress]) => {
                  const character = characters.find(c => c.id === progress.characterId);
                  return (
                    <tr key={charId} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <span className="text-3xl font-bold mr-3">{character?.preview}</span>
                          <span className="text-gray-700">{character?.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">{progress.attempts}</td>
                      <td className="py-4 px-4">{(progress.avgScore * 100).toFixed(1)}%</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className={`h-2.5 rounded-full ${getMasteryColor(progress.mastery)}`}
                              style={{ width: `${progress.mastery}%` }}
                            ></div>
                          </div>
                          <span>{progress.mastery.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${progress.mastery >= 90 ? 'bg-green-100 text-green-800' : 
                            progress.mastery >= 70 ? 'bg-blue-100 text-blue-800' :
                            progress.mastery >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            progress.mastery >= 30 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'}`}
                        >
                          {getMasteryLevel(progress.mastery)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => router.push(`/practice?id=${progress.characterId}`)}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-1" />
                          練習
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 推薦練習區塊 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <CheckCircleIcon className="h-6 w-6 mr-2 text-green-500" />
          下一步推薦
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {characters
            .filter(char => !progressData[char.id?.toString()])
            .slice(0, 4)
            .map(char => (
              <div
                key={char.id}
                className="p-6 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                onClick={() => router.push(`/practice?id=${char.id}`)}
              >
                <div className="text-4xl font-bold text-center mb-3">{char.preview}</div>
                <div className="text-center text-gray-700 mb-4">{char.name}</div>
                <div className="text-center">
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    <ArrowRightIcon className="h-3 w-3 mr-1" />
                    開始學習
                  </span>
                </div>
              </div>
            ))}
          
          {characters.filter(char => !progressData[char.id?.toString()]).length === 0 && (
            <div className="col-span-full bg-green-50 p-6 rounded-lg border border-green-100 text-center">
              <p className="text-green-800 mb-2 font-medium">恭喜！您已經練習過所有的字元</p>
              <p className="text-gray-600 mb-4">您可以繼續提高熟練度，或探索其他學習資源</p>
              <button
                onClick={() => router.push('/practice')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                回到練習頁面
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressContent;