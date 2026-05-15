export const APP_NAME = 'Dynamic Admin Panel';
export const APP_VERSION = '1.0.0';

export const ROUTES = {
  LOGIN: '/login',
  WORKSPACE: '/workspace',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  BUILDER: '/builder',
  USERS: '/users',
  WORKFLOW: '/workflow',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  WORKSPACE: 'workspace',
  THEME: 'theme',
} as const;

export const QUERY_KEYS = {
  USER: 'user',
  WORKSPACES: 'workspaces',
  PRODUCTS: 'products',
  USERS: 'users',
  PERMISSIONS: 'permissions',
  WORKFLOWS: 'workflows',
  API_KEYS: 'api_keys',
} as const;
