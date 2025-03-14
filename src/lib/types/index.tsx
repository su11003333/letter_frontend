// lib/types/index.ts

// 節點類型：表示筆畫中的一個點
export interface Node {
    x: number;
    y: number;
  }
  
  // 筆畫類型：由多個節點組成
  export interface Stroke {
    nodes: Node[];
  }
  
  // 字元預覽資訊：用於字元選擇列表
  export interface CharacterPreview {
    id: number;
    name: string;
    preview: string;
  }
  
  // 完整的字元資料
  export interface Character {
    id: number;
    name: string;
    svgUrl: string;
    strokeData: Stroke[];
  }
  
  // 筆畫記錄：記錄用戶寫字時的筆畫軌跡
  export interface StrokeRecord {
    id?: number;
    userId: number;
    characterId: number;
    strokeIndex: number;
    path: Node[];
    score: number;
    createdAt?: string;
  }
  
  // 筆畫記錄請求
  export interface StrokeRecordRequest {
    userId: number;
    characterId: number;
    strokeIndex: number;
    path: Node[];
    score: number;
  }
  
  // 筆畫記錄回應
  export interface StrokeRecordResponse {
    recordId: number;
    simplifiedNodes: Node[];
  }
  
  // 使用者類型
  export interface User {
    id: number;
    username: string;
    email?: string;
  }
  
  // 登入請求
  export interface LoginRequest {
    username: string;
    password: string;
  }
  
  // 登入回應
  export interface LoginResponse {
    user: User;
    token: string;
  }
  
  // 進度數據
  export interface ProgressData {
    userId: number;
    characterId: number;
    mastery: number; // 0-100 表示熟練度
    attempts: number;
    bestScore: number;
    lastPracticed: string;
  }
  
  // 認證狀態
  export interface AuthState {
    user: User | null;
    isLoggedIn: boolean;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
  }
  
  // 遊戲狀態
  export interface GameState {
    characterData: Character | null;
    currentStroke: number;
    isDrawing: boolean;
    currentPath: Node[];
    setCharacterData: (data: Character | null) => void;
    setCurrentStroke: (index: number) => void;
    setIsDrawing: (drawing: boolean) => void;
    setCurrentPath: (path: Node[]) => void;
    resetGame: () => void;
  }