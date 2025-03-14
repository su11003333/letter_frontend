// components/game/PhaserGame.tsx
'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { Character } from '@/lib/types';
import WritingScene from './WritingScene';

interface PhaserGameProps {
  characterData: Character;
  onComplete: () => void;
}

const PhaserGame: React.FC<PhaserGameProps> = ({ characterData, onComplete }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstance = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!characterData || !gameRef.current) return;

    // 確保在組件卸載時清除舊的遊戲實例
    if (gameInstance.current) {
      gameInstance.current.destroy(true);
      gameInstance.current = null;
    }

    // 遊戲配置
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 600,
      height: 600,
      backgroundColor: '#f8f8f8',
      scene: [WritingScene],
    };

    // 創建新的遊戲實例
    const game = new Phaser.Game(config);
    
    // 啟動場景並傳遞數據
    game.scene.start('WritingScene', {
      characterData,
      onComplete,
    });

    gameInstance.current = game;

    // 清理函數
    return () => {
      if (gameInstance.current) {
        gameInstance.current.destroy(true);
        gameInstance.current = null;
      }
    };
  }, [characterData, onComplete]);

  return (
    <div className="game-container w-full max-w-3xl mx-auto border-2 border-gray-300 rounded-lg overflow-hidden">
      <div ref={gameRef} className="phaser-container"></div>
    </div>
  );
};

export default PhaserGame;