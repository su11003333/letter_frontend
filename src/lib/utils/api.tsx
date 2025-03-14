// src/lib/utils/api.ts
import axios from 'axios';
import { 
  CharacterPreview, 
  Character, 
  LoginRequest, 
  LoginResponse, 
  StrokeRecordRequest, 
  StrokeRecordResponse,
  UserProgress,
  User,
  Stroke
} from '../types';

// API 基礎 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// 創建 axios 實例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加請求攔截器以添加認證令牌
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    // 確保格式正確，包含 'Bearer ' 前綴
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 錯誤處理
apiClient.interceptors.response.use(
  response => response,
  error => {
    // 未驗證時重定向到登錄頁面
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API 服務類
export class ApiService {
  // 認證相關
  static async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  static async register(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }
  
  // 字元相關
  static async getCharacters(): Promise<CharacterPreview[]> {
    try {
      const response = await apiClient.get<CharacterPreview[]>('/characters');
      return response.data;
    } catch (error) {
      console.error('Error fetching characters:', error);
      
      // 當伺服器不可用時使用模擬資料
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock data for characters');
        return [
          { id: 1, name: "一", preview: "一" },
          { id: 2, name: "二", preview: "二" },
          { id: 3, name: "三", preview: "三" },
          // ... 更多字元
        ];
      }
      
      throw error;
    }
  }
  
  static async getCharacterById(id: number): Promise<Character> {
    try {
      const response = await apiClient.get<Character>(`/characters/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching character ${id}:`, error);
      
      // 當伺服器不可用時使用模擬資料
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock data for character');
        
        // 基本模擬字元資料
        const mockCharacter: Character = {
          id,
          name: id === 1 ? "一" : id === 2 ? "二" : "三",
          svgUrl: `/assets/characters/${id === 1 ? 'yi' : id === 2 ? 'er' : 'san'}.svg`,
          strokeData: []
        };
        
        // 根據字元 ID 產生不同筆劃資料
        if (id === 1) {
          mockCharacter.strokeData = [
            { nodes: [{ x: 150, y: 300 }, { x: 300, y: 300 }, { x: 450, y: 300 }] }
          ];
        } else if (id === 2) {
          mockCharacter.strokeData = [
            { nodes: [{ x: 150, y: 250 }, { x: 300, y: 250 }, { x: 450, y: 250 }] },
            { nodes: [{ x: 150, y: 350 }, { x: 300, y: 350 }, { x: 450, y: 350 }] }
          ];
        } else if (id === 3) {
          mockCharacter.strokeData = [
            { nodes: [{ x: 150, y: 200 }, { x: 300, y: 200 }, { x: 450, y: 200 }] },
            { nodes: [{ x: 150, y: 300 }, { x: 300, y: 300 }, { x: 450, y: 300 }] },
            { nodes: [{ x: 150, y: 400 }, { x: 300, y: 400 }, { x: 450, y: 400 }] }
          ];
        }
        
        return mockCharacter;
      }
      
      throw error;
    }
  }
  
  // 筆畫記錄相關
  static async recordStroke(data: StrokeRecordRequest): Promise<StrokeRecordResponse> {
    try {
      const response = await apiClient.post<StrokeRecordResponse>('/strokes/record', data);
      return response.data;
    } catch (error) {
      console.error('Error recording stroke:', error);
      
      // 當伺服器不可用時使用模擬資料
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock response for stroke recording');
        return {
          recordId: Math.floor(Math.random() * 1000),
          simplifiedNodes: data.path.length > 3 
            ? [data.path[0], data.path[Math.floor(data.path.length/2)], data.path[data.path.length-1]]
            : data.path
        };
      }
      
      throw error;
    }
  }
  
  static async getUserStrokeRecords(userId: number): Promise<StrokeRecordResponse[]> {
    try {
      const response = await apiClient.get<StrokeRecordResponse[]>(`/users/${userId}/stroke-records`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user stroke records:', error);
      throw error;
    }
  }
  
  // 進度相關
  static async getUserProgress(userId: number): Promise<UserProgress> {
    try {
      const response = await apiClient.get<UserProgress>(`/users/${userId}/progress`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      
      // 當伺服器不可用時使用模擬資料
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock data for user progress');
        return {
          "1": { characterId: 1, attempts: 5, avgScore: 0.85, mastery: 85, lastStroke: 0 },
          "2": { characterId: 2, attempts: 3, avgScore: 0.7, mastery: 70, lastStroke: 1 },
          "3": { characterId: 3, attempts: 2, avgScore: 0.5, mastery: 50, lastStroke: 2 }
        };
      }
      
      throw error;
    }
  }

  // 管理功能相關方法

  // 用戶管理相關
  static async getUsers(): Promise<User[]> {
    try {
      // 注意：此端點可能需要後端實現
      const response = await apiClient.get<User[]>('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      
      // 開發環境使用模擬數據
      if (process.env.NODE_ENV === 'development') {
        return [
          { id: 1, username: "admin", email: "admin@example.com" },
          { id: 2, username: "demo", email: "demo@example.com" },
          { id: 3, username: "test", email: "test@example.com" },
        ];
      }
      
      throw error;
    }
  }

  static async createUser(data: { username: string; password: string; email: string }): Promise<User> {
    try {
      // 注意：此端點可能需要後端實現
      const response = await apiClient.post<User>('/admin/users', data);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async deleteUser(userId: number): Promise<void> {
    try {
      // 注意：此端點可能需要後端實現
      await apiClient.delete(`/admin/users/${userId}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // 字元管理相關
  static async createCharacter(data: { name: string; preview: string; svgUrl: string; strokeData: Stroke[] }): Promise<Character> {
    try {
      // 注意：此端點可能需要後端實現
      const response = await apiClient.post<Character>('/admin/characters', data);
      return response.data;
    } catch (error) {
      console.error('Error creating character:', error);
      throw error;
    }
  }

  static async updateCharacter(id: number, data: { name: string; preview: string; svgUrl: string; strokeData: Stroke[] }): Promise<Character> {
    try {
      // 注意：此端點可能需要後端實現
      const response = await apiClient.put<Character>(`/admin/characters/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating character:', error);
      throw error;
    }
  }

  static async deleteCharacter(id: number): Promise<void> {
    try {
      // 注意：此端點可能需要後端實現
      await apiClient.delete(`/admin/characters/${id}`);
    } catch (error) {
      console.error('Error deleting character:', error);
      throw error;
    }
  }

  // 系統統計相關
  static async getSystemStats(): Promise<any> {
    try {
      // 注意：此端點可能需要後端實現
      const response = await apiClient.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching system stats:', error);
      
      // 開發環境使用模擬數據
      if (process.env.NODE_ENV === 'development') {
        return {
          userCount: 3,
          characterCount: 10,
          strokeRecordCount: 32,
          systemStatus: {
            api: "running",
            storage: "memory",
            lastRestart: new Date().toISOString()
          }
        };
      }
      
      throw error;
    }
  }
}