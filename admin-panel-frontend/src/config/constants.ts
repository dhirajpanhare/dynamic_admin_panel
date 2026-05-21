export const APP_NAME = 'Dynamic Admin Panel';
export const APP_VERSION = '1.0.0';

export const APP_INFO = {
  NAME: APP_NAME,
  VERSION: APP_VERSION,
} as const;

export const FEATURES = {
  MULTI_TENANT: true,
  WORKFLOW_ENGINE: true,
  FILE_MANAGEMENT: true,
  NOTIFICATIONS: true,
  DASHBOARD_BUILDER: true,
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
  SHORT: 'MM/dd/yyyy',
  LONG: 'MMMM dd, yyyy',
  TIME: 'HH:mm:ss',
  TIME_SHORT: 'HH:mm',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  VERIFY_OTP: '/verify-otp',
  WORKSPACE: '/workspace',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  BUILDER: '/builder',
  BUILDER_NEW: '/builder/new',
  USERS: '/users',
  WORKFLOW: '/workflow',
  WORKFLOW_BUILDER: '/workflow/builder',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  WORKSPACES: '/workspaces',
  WORKSPACE_MEMBERS: '/workspaces/:workspaceId/members',
  WORKSPACE_SETTINGS: '/workspaces/:workspaceId/settings',
  RBAC_ROLES: '/rbac/roles',
  RBAC_PERMISSIONS: '/rbac/permissions',
  RBAC_USERS: '/rbac/users',
  RBAC_AUDIT: '/rbac/audit',
  // Dynamic entity routes
  ENTITY_LIST: '/entities/:entitySlug',
  ENTITY_CREATE: '/entities/:entitySlug/new',
  ENTITY_DETAIL: '/entities/:entitySlug/:id',
  ENTITY_EDIT: '/entities/:entitySlug/:id/edit',
  // Dashboard builder
  DASHBOARD_BUILDER: '/dashboard/builder',
  // File management
  FILES: '/files',
  // Notifications
  NOTIFICATIONS: '/notifications',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  TOKEN: 'auth_token',          // alias used by auth-context
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  WORKSPACE: 'workspace',
  THEME: 'theme',
  TENANT: 'current_tenant',    // used by tenant-context and API client
} as const;

export const QUERY_KEYS = {
  USER: 'user',
  WORKSPACES: 'workspaces',
  PRODUCTS: 'products',
  USERS: 'users',
  PERMISSIONS: 'permissions',
  WORKFLOWS: 'workflows',
  API_KEYS: 'api_keys',
  // Dynamic entity hooks
  ENTITY_LIST: 'entity-list',
  ENTITY_DETAIL: 'entity-detail',
  // Metadata hooks
  ENTITY_CONFIG: 'entity-config',
  MENUS: 'menus',
  PAGE_CONFIG: 'page-config',
  DASHBOARD_CONFIG: 'dashboard-config',
  LIST_VIEW_CONFIG: 'list-view-config',
  // RBAC
  ROLES: 'roles',
  AUDIT_LOGS: 'audit-logs',
  // Files
  FILES: 'files',
  // Notifications
  NOTIFICATIONS: 'notifications',
  NOTIFICATION_COUNT: 'notification-count',
} as const;
