import axios from 'axios';
import { LoginRequest, RegisterRequest, LoginResponse, ApiResponse } from '@shared/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await refreshTokenApi(refreshToken);
          const { token } = response.data;
          
          localStorage.setItem('token', token);
          setAuthToken(token);
          
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Set auth token for API requests
export const setAuthToken = (token: string | null): void => {
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.Authorization;
  }
};

// Auth API functions
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<ApiResponse<LoginResponse>>('/api/auth/login', credentials);
  return response.data.data!;
};

export const register = async (userData: RegisterRequest): Promise<LoginResponse> => {
  const response = await api.post<ApiResponse<LoginResponse>>('/api/auth/register', userData);
  return response.data.data!;
};

export const refreshToken = async (refreshTokenData: { refreshToken: string }): Promise<any> => {
  const response = await api.post<ApiResponse>('/api/auth/refresh', refreshTokenData);
  return response.data.data;
};

// Internal refresh token function (used by interceptor)
const refreshTokenApi = async (refreshToken: string): Promise<any> => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
    refreshToken
  });
  return response;
};

export default api;