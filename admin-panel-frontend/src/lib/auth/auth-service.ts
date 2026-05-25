import { api } from '@/lib/api/client';
import { API_CONFIG } from '@/config/api.config';
import { STORAGE_KEYS } from '@/config/constants';

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

// Shape the backend sends for User inside LoginResponse / profile endpoint
interface BackendUserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  roles: string[];
}

/** Map backend UserDto → frontend User */
function mapUser(dto: BackendUserDto): User {
  return {
    id: String(dto.id),
    email: dto.email,
    name: [dto.firstName, dto.lastName].filter(Boolean).join(' ') || dto.email,
    role: dto.roles?.[0] ?? 'user',
    permissions: dto.roles ?? [],   // roles are treated as permissions until RBAC endpoint is integrated
  };
}



export const authService = {
  /**
   * Login with email and password.
   * Backend returns { token, refreshToken, expiresAt, user: BackendUserDto }
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const raw = await api.post<any>(API_CONFIG.endpoints.auth.login, { email, password });
    return {
      token: raw.token,
      refreshToken: raw.refreshToken,
      requiresOtp: raw.requiresOtp ?? false,
      user: mapUser(raw.user),
    };
  },

  /**
   * Verify OTP (two-factor auth)
   */
  verifyOtp: async (email: string, otp: string): Promise<OtpVerifyResponse> => {
    const raw = await api.post<any>(API_CONFIG.endpoints.auth.verifyOtp, { email, otp });
    return {
      token: raw.token,
      refreshToken: raw.refreshToken,
      user: mapUser(raw.user),
    };
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    const raw = await api.post<any>(API_CONFIG.endpoints.auth.refresh, { refreshToken });
    return { token: raw.token ?? raw };
  },

  /**
   * Get current user profile (called on every page load to restore session)
   */
  getProfile: async (): Promise<User> => {
    const raw = await api.get<BackendUserDto>(API_CONFIG.endpoints.auth.profile);
    return mapUser(raw);
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
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
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
