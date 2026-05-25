import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/config/api.config';
import { STORAGE_KEYS } from '@/config/constants';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token and tenant ID
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from memory (Zustand store will provide this)
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Get tenant ID from memory
    const tenantId = localStorage.getItem(STORAGE_KEYS.TENANT);
    if (tenantId) {
      config.headers['X-Tenant-Id'] = tenantId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            `${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.refresh}`,
            { refreshToken }
          );

          const { token } = response.data;
          localStorage.setItem('auth_token', token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Normalize error response
    const responseData = error.response?.data as Record<string, any> | undefined;
    const normalizedError = {
      message: responseData?.message || error.message || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data,
    };

    return Promise.reject(normalizedError);
  }
);

export default apiClient;

// Unwraps ApiResponse<T> envelope: { success, data, message } → T
const unwrap = <T>(res: { data: unknown }): T => {
  const body = res.data;
  if (body && typeof body === 'object' && 'data' in body) {
    return (body as { data: T }).data;
  }
  return body as T;
};

// Export typed request methods
export const api = {
  get: <T = any>(url: string, config?: any) =>
    apiClient.get(url, config).then(unwrap<T>),

  post: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.post(url, data, config).then(unwrap<T>),

  put: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.put(url, data, config).then(unwrap<T>),

  patch: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.patch(url, data, config).then(unwrap<T>),

  delete: <T = any>(url: string, config?: any) =>
    apiClient.delete(url, config).then(unwrap<T>),
};
