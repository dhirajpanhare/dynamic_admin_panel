import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from './auth-service';
import type { User, LoginResponse, OtpVerifyResponse } from './auth-service';
import { STORAGE_KEYS, ROUTES } from '@/config/constants';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await authService.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // Clear invalid token
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          setToken(null);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<LoginResponse> => {
    const response = await authService.login(email, password);
    
    if (!response.requiresOtp) {
      // Direct login without OTP
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      setToken(response.token);
      setUser(response.user);
    }
    
    return response;
  }, []);

  // Verify OTP function
  const verifyOtp = useCallback(async (email: string, otp: string): Promise<void> => {
    const response = await authService.verifyOtp(email, otp);
    
    localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
    setToken(response.token);
    setUser(response.user);
    
    navigate(ROUTES.DASHBOARD);
  }, [navigate]);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    setToken(null);
    navigate('/login');
  }, [navigate]);

  // Refresh user data
  const refreshUser = useCallback(async (): Promise<void> => {
    if (token) {
      try {
        const userData = await authService.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }
  }, [token]);

  // Permission checks
  const hasPermission = useCallback(
    (permission: string): boolean => {
      return authService.hasPermission(user, permission);
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      return authService.hasAnyPermission(user, permissions);
    },
    [user]
  );

  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      return authService.hasAllPermissions(user, permissions);
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    verifyOtp,
    logout,
    refreshUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
