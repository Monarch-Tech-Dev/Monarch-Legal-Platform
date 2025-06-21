import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { User, LoginRequest, RegisterRequest, LoginResponse } from '@shared/types/api';
import * as authApi from '../services/api/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Set default authorization header
          authApi.setAuthToken(token);
          
          // Validate token by making a test request
          // This would typically be a call to get current user
          // For now, we'll assume the token is valid if it exists
        } catch (error) {
          // Invalid data in localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('refreshToken');
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Login mutation
  const loginMutation = useMutation(authApi.login, {
    onSuccess: (response: LoginResponse) => {
      const { token, refreshToken, user } = response;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set auth header
      authApi.setAuthToken(token);
      
      // Update state
      setUser(user);
      
      toast.success('Welcome back!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Login failed';
      toast.error(message);
    }
  });

  // Register mutation
  const registerMutation = useMutation(authApi.register, {
    onSuccess: (response: LoginResponse) => {
      const { token, refreshToken, user } = response;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set auth header
      authApi.setAuthToken(token);
      
      // Update state
      setUser(user);
      
      toast.success('Account created successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Registration failed';
      toast.error(message);
    }
  });

  // Refresh token mutation
  const refreshMutation = useMutation(authApi.refreshToken, {
    onSuccess: (response: any) => {
      const { token } = response;
      
      // Update token in localStorage
      localStorage.setItem('token', token);
      
      // Set auth header
      authApi.setAuthToken(token);
    },
    onError: () => {
      // Refresh failed, logout user
      logout();
      toast.error('Session expired. Please login again.');
    }
  });

  const login = async (credentials: LoginRequest): Promise<void> => {
    await loginMutation.mutateAsync(credentials);
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    await registerMutation.mutateAsync(userData);
  };

  const logout = (): void => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Clear auth header
    authApi.setAuthToken(null);
    
    // Clear state
    setUser(null);
    
    // Clear query cache
    queryClient.clear();
    
    toast.success('Logged out successfully');
  };

  const refreshToken = async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await refreshMutation.mutateAsync({ refreshToken });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading: isLoading || loginMutation.isLoading || registerMutation.isLoading,
    login,
    register,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};