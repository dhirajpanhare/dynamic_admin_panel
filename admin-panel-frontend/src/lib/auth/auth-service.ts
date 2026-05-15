import { api } from '@/lib/api/client';
import { API_CONFIG } from '@/config/api.config';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  permissions: string[];
  tenants?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  requiresOtp?: boolean;
}

export interface OtpVerifyResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// Test credentials for bypassing authentication (development only)
const TEST_CREDENTIALS = {
  email: 'test@admin.com',
  password: 'test123',
};

const TEST_USER: User = {
  id: 'test-user-001',
  email: 'test@admin.com',
  name: 'Test Admin',
  avatar: undefined,
  role: 'admin',
  permissions: ['*'], // All permissions
  tenants: [
    {
      id: 'test-tenant-001',
      name: 'Test Tenant',
      slug: 'test-tenant',
    },
  ],
};

const TEST_TOKENS = {
  token: 'test-jwt-token-' + Date.now(),
  refreshToken: 'test-refresh-token-' + Date.now(),
};

export const authService = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // Check for test credentials (bypass authentication for testing)
    if (email === TEST_CREDENTIALS.email && password === TEST_CREDENTIALS.password) {
      console.warn('🧪 Using test credentials - bypassing authentication');
      return {
        ...TEST_TOKENS,
        user: TEST_USER,
        requiresOtp: false,
      };
    }

    const response = await api.post<LoginResponse>(
      API_CONFIG.endpoints.auth.login,
      { email, password }
    );
    return response;
  },

  /**
   * Verify OTP
   */
  verifyOtp: async (email: string, otp: string): Promise<OtpVerifyResponse> => {
    const response = await api.post<OtpVerifyResponse>(
      API_CONFIG.endpoints.auth.verifyOtp,
      { email, otp }
    );
    return response;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    const response = await api.post<{ token: string }>(
      API_CONFIG.endpoints.auth.refresh,
      { refreshToken }
    );
    return response;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    // Check if using test token
    const token = localStorage.getItem('auth_token');
    if (token && token.startsWith('test-jwt-token-')) {
      console.warn('🧪 Using test token - returning test user profile');
      return TEST_USER;
    }

    const response = await api.get<User>(API_CONFIG.endpoints.auth.profile);
    return response;
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    try {
      await api.post(API_CONFIG.endpoints.auth.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  },

  /**
   * Check if user has permission
   */
  hasPermission: (user: User | null, permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission) || user.permissions.includes('*');
  },

  /**
   * Check if user has any of the permissions
   */
  hasAnyPermission: (user: User | null, permissions: string[]): boolean => {
    if (!user) return false;
    if (user.permissions.includes('*')) return true;
    return permissions.some((permission) => user.permissions.includes(permission));
  },

  /**
   * Check if user has all permissions
   */
  hasAllPermissions: (user: User | null, permissions: string[]): boolean => {
    if (!user) return false;
    if (user.permissions.includes('*')) return true;
    return permissions.every((permission) => user.permissions.includes(permission));
  },
};

export default authService;
