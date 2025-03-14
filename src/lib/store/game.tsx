// lib/store/game.ts
import { create } from 'zustand';
import { Character, Node, GameState } from '../types';

// 建立遊戲狀態管理
export const useGameStore = create<GameState>((set) => ({
  characterData: null,
  currentStroke: 0,
  isDrawing: false,
  currentPath: [],
  
  // 設置當前練習的字元數據
  setCharacterData: (data: Character | null) => set({
    characterData: data,
    currentStroke: 0, // 重置當前筆畫
  }),
  
  // 設置當前筆畫索引
  setCurrentStroke: (index: number) => set({
    currentStroke: index,
  }),
  
  // 設置是否正在繪製
  setIsDrawing: (drawing: boolean) => set({
    isDrawing: drawing,
  }),
  
  // 設置當前繪製路徑
  setCurrentPath: (path: Node[]) => set({
    currentPath: path,
  }),
  
  // 重置遊戲狀態
  resetGame: () => set({
    currentStroke: 0,
    isDrawing: false,
    currentPath: [],
  }),
}));