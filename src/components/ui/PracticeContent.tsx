// src/components/ui/PracticeContent.tsx
'use client';

import { useState } from 'react';
import { Character, CharacterPreview } from '@/lib/types';
import PhaserGame from '@/components/game/PhaserGame';

// 硬編碼的模擬字元數據
const MOCK_CHARACTERS: CharacterPreview[] = [
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

// 硬編碼的詳細字元數據
const MOCK_CHARACTER_DETAILS: Record<number, Character> = {
  1: {
    id: 1,
    name: "一",
    svgUrl: "/assets/characters/yi.svg",
    strokeData: [{ nodes: [{ x: 150, y: 300 }, { x: 300, y: 300 }, { x: 450, y: 300 }] }],
  },
  2: {
    id: 2,
    name: "二",
    svgUrl: "/assets/characters/er.svg",
    strokeData: [
      { nodes: [{ x: 150, y: 250 }, { x: 300, y: 250 }, { x: 450, y: 250 }] },
      { nodes: [{ x: 150, y: 350 }, { x: 300, y: 350 }, { x: 450, y: 350 }] },
    ],
  },
  3: {
    id: 3,
    name: "三",
    svgUrl: "/assets/characters/san.svg",
    strokeData: [
      { nodes: [{ x: 150, y: 200 }, { x: 300, y: 200 }, { x: 450, y: 200 }] },
      { nodes: [{ x: 150, y: 300 }, { x: 300, y: 300 }, { x: 450, y: 300 }] },
      { nodes: [{ x: 150, y: 400 }, { x: 300, y: 400 }, { x: 450, y: 400 }] },
    ],
  },
  4: {
    id: 4,
    name: "四",
    svgUrl: "/assets/characters/si.svg",
    strokeData: [
      { nodes: [{ x: 200, y: 150 }, { x: 400, y: 150 }] },
      { nodes: [{ x: 300, y: 150 }, { x: 300, y: 450 }] },
      { nodes: [{ x: 200, y: 300 }, { x: 400, y: 300 }] },
      { nodes: [{ x: 200, y: 450 }, { x: 400, y: 450 }] },
    ],
  },
  5: {
    id: 5,
    name: "五",
    svgUrl: "/assets/characters/wu.svg",
    strokeData: [
      { nodes: [{ x: 200, y: 150 }, { x: 400, y: 150 }] },
      { nodes: [{ x: 200, y: 250 }, { x: 400, y: 250 }] },
      { nodes: [{ x: 300, y: 250 }, { x: 300, y: 450 }] },
      { nodes: [{ x: 200, y: 350 }, { x: 400, y: 350 }] },
      { nodes: [{ x: 200, y: 450 }, { x: 400, y: 450 }] },
    ],
  },
  6: {
    id: 6,
    name: "六",
    svgUrl: "/assets/characters/liu.svg",
    strokeData: [
      { nodes: [{ x: 300, y: 150 }, { x: 300, y: 450 }] },
      { nodes: [{ x: 200, y: 350 }, { x: 400, y: 100 }] },
    ],
  },
  7: {
    id: 7,
    name: "七",
    svgUrl: "/assets/characters/qi.svg",
    strokeData: [
      { nodes: [{ x: 200, y: 200 }, { x: 400, y: 200 }] },
      { nodes: [{ x: 350, y: 200 }, { x: 250, y: 400 }] },
    ],
  },
  8: {
    id: 8,
    name: "八",
    svgUrl: "/assets/characters/ba.svg",
    strokeData: [
      { nodes: [{ x: 200, y: 200 }, { x: 400, y: 400 }] },
      { nodes: [{ x: 400, y: 200 }, { x: 200, y: 400 }] },
    ],
  },
  9: {
    id: 9,
    name: "九",
    svgUrl: "/assets/characters/jiu.svg",
    strokeData: [
      { nodes: [{ x: 300, y: 150 }, { x: 200, y: 350 }] },
      { nodes: [{ x: 300, y: 150 }, { x: 400, y: 450 }] },
    ],
  },
  10: {
    id: 10,
    name: "十",
    svgUrl: "/assets/characters/shi.svg",
    strokeData: [
      { nodes: [{ x: 150, y: 300 }, { x: 450, y: 300 }] },
      { nodes: [{ x: 300, y: 150 }, { x: 300, y: 450 }] },
    ],
  },
};

const PracticeContent = () => {
  const [characters] = useState<CharacterPreview[]>(MOCK_CHARACTERS);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [completedCharacters, setCompletedCharacters] = useState<number[]>([]);

  // 處理字元選擇
  const handleCharacterSelect = (characterId: number) => {
    setIsLoading(true);
    // 使用硬編碼的數據，無需API調用
    const characterData = MOCK_CHARACTER_DETAILS[characterId];
    setCurrentCharacter(characterData);
    setIsGameActive(true);
    setIsLoading(false);
  };

  // 遊戲完成後的處理
  const handleGameComplete = () => {
    // 添加當前字元到已完成列表
    if (currentCharacter && !completedCharacters.includes(currentCharacter.id)) {
      setCompletedCharacters([...completedCharacters, currentCharacter.id]);
    }
    
    // 返回字元選擇
    setIsGameActive(false);
    setCurrentCharacter(null);
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
    <div>
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
        <p>獨立模式：此頁面目前使用硬編碼數據運行，不依賴後端API。</p>
      </div>

      {isGameActive && currentCharacter ? (
        <div className="game-wrapper">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              正在練習: <span className="text-blue-600">{currentCharacter.name}</span>
            </h2>
            <button
              onClick={() => setIsGameActive(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg shadow transition-colors"
            >
              返回字庫
            </button>
          </div>
          <PhaserGame
            characterData={currentCharacter}
            onComplete={handleGameComplete}
          />
        </div>
      ) : (
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">選擇要練習的字</h2>
            <p className="text-gray-600">點擊下方的字元開始練習寫字，系統會引導您按正確筆順完成。</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {characters.map((character) => (
              <div
                key={character.id}
                onClick={() => handleCharacterSelect(character.id)}
                className={`
                  p-6 border-2 rounded-lg cursor-pointer transition-all transform hover:scale-105
                  ${completedCharacters.includes(character.id) 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
                `}
              >
                <div className="text-center">
                  <div className="character-preview text-5xl font-bold mb-2">
                    {character.preview}
                  </div>
                  <div className="character-name text-lg">
                    {character.name}
                  </div>
                  
                  {completedCharacters.includes(character.id) && (
                    <div className="mt-2 text-sm bg-green-500 text-white rounded-full px-2 py-1 inline-block">
                      已完成
                    </div>
                  )}
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