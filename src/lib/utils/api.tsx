// lib/utils/api.ts
import axios from 'axios';
import { 
  CharacterPreview, 
  Character, 
  LoginRequest, 
  LoginResponse, 
  StrokeRecordRequest, 
  StrokeRecordResponse 
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
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API 服務類
export class ApiService {
  // 認證相關
  static async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  }
  
  static async register(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/register', data);
    return response.data;
  }
  
  // 字元相關
  static async getCharacters(): Promise<CharacterPreview[]> {
    const response = await apiClient.get<CharacterPreview[]>('/characters');
    return response.data;
  }
  
  static async getCharacterById(id: number): Promise<Character> {
    const response = await apiClient.get<Character>(`/characters/${id}`);
    return response.data;
  }
  
  // 筆畫記錄相關
  static async recordStroke(data: StrokeRecordRequest): Promise<StrokeRecordResponse> {
    const response = await apiClient.post<StrokeRecordResponse>('/strokes/record', data);
    return response.data;
  }
  
  static async getUserStrokeRecords(userId: number): Promise<StrokeRecordResponse[]> {
    const response = await apiClient.get<StrokeRecordResponse[]>(`/users/${userId}/stroke-records`);
    return response.data;
  }
  
  // 進度相關
  static async getUserProgress(userId: number): Promise<any> {
    const response = await apiClient.get(`/users/${userId}/progress`);
    return response.data;
  }
}