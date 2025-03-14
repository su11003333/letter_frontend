'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhaserGame from '@/components/game/PhaserGame';
import { ApiService } from '@/lib/utils/api';
import { Character, CharacterPreview } from '@/lib/types';
import { useAuthStore } from '@/lib/store/auth';

const PracticeContent = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [characters, setCharacters] = useState<CharacterPreview[]>([]);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGameActive, setIsGameActive] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 檢查用戶是否已登錄
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    // 從API獲取可用的字元列表
    const fetchCharacters = async () => {
      setIsLoading(true);
      try {
        // 在實際應用中，這裡應該調用真實 API
        // 模擬 API 響應
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
        
        setCharacters(mockCharacters);
      } catch (error) {
        console.error('Error fetching characters:', error);
        setError('無法載入字元列表，請稍後再試');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, [isLoggedIn, router]);

  const handleCharacterSelect = async (characterId: number) => {
    setIsLoading(true);
    try {
      // 在實際應用中，這裡應該調用真實 API
      // 模擬 API 響應
      const mockCharacterData: Record<number, Character> = {
        1: {
          id: 1,
          name: "一",
          svgUrl: "/assets/characters/yi.svg",
          strokeData: [
            {
              nodes: [
                { x: 150, y: 300 },
                { x: 300, y: 300 },
                { x: 450, y: 300 },
              ],
            },
          ],
        },
        2: {
          id: 2,
          name: "二",
          svgUrl: "/assets/characters/er.svg",
          strokeData: [
            {
              nodes: [
                { x: 150, y: 250 },
                { x: 300, y: 250 },
                { x: 450, y: 250 },
              ],
            },
            {
              nodes: [
                { x: 150, y: 350 },
                { x: 300, y: 350 },
                { x: 450, y: 350 },
              ],
            },
          ],
        },
        3: {
          id: 3,
          name: "三",
          svgUrl: "/assets/characters/san.svg",
          strokeData: [
            {
              nodes: [
                { x: 150, y: 200 },
                { x: 300, y: 200 },
                { x: 450, y: 200 },
              ],
            },
            {
              nodes: [
                { x: 150, y: 300 },
                { x: 300, y: 300 },
                { x: 450, y: 300 },
              ],
            },
            {
              nodes: [
                { x: 150, y: 400 },
                { x: 300, y: 400 },
                { x: 450, y: 400 },
              ],
            },
          ],
        },
      };

      // 獲取對應字元數據
      const characterData = mockCharacterData[characterId];
      if (!characterData) {
        throw new Error('字元數據不存在');
      }

      setCurrentCharacter(characterData);
      setIsGameActive(true);
    } catch (error) {
      console.error('Error fetching character data:', error);
      setError('無法載入字元數據，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameComplete = () => {
    // 完成當前字後
    setIsGameActive(false);
  };

  if (isLoading && !isGameActive) {
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
    <div>
      {isGameActive && currentCharacter ? (
        <div className="game-wrapper">
          <h2 className="text-xl font-semibold mb-4">練習: {currentCharacter.name}</h2>
          <PhaserGame
            characterData={currentCharacter}
            onComplete={handleGameComplete}
          />
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsGameActive(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              返回字庫
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">選擇要練習的字</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {characters.map((character) => (
              <div
                key={character.id}
                onClick={() => handleCharacterSelect(character.id)}
                className="character-card p-4 border rounded cursor-pointer hover:bg-gray-100 transition-colors text-center"
              >
                <div className="character-preview text-4xl font-bold">
                  {character.preview}
                </div>
                <div className="character-name mt-2">
                  {character.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeContent;