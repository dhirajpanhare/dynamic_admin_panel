export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
  endpoints: {
    auth: {
      login: '/auth/login',
      verifyOtp: '/auth/verify-otp',
      refresh: '/auth/refresh-token',   // matches backend POST /auth/refresh-token
      profile: '/auth/profile',          // matches backend GET /auth/profile
      logout: '/auth/logout',
    },
    metadata: {
      menus: '/metadata/menus',
      entity: (slug: string) => `/metadata/entities/${slug}`,
      entities: '/metadata/entities',
      page: (slug: string) => `/metadata/pages/${slug}`,
      dashboard: (slug: string) => `/metadata/dashboards/${slug}`,
      dashboards: '/metadata/dashboards',
      listViewConfig: (entity: string) => `/metadata/list-views/${entity}`,
    },
    dynamic: {
      list: (entity: string) => `/dynamic/${entity}`,
      detail: (entity: string, id: string | number) => `/dynamic/${entity}/${id}`,
      create: (entity: string) => `/dynamic/${entity}`,
      update: (entity: string, id: string | number) => `/dynamic/${entity}/${id}`,
      delete: (entity: string, id: string | number) => `/dynamic/${entity}/${id}`,
      bulkDelete: (entity: string) => `/dynamic/${entity}/bulk-delete`,
      export: (entity: string) => `/dynamic/${entity}/export`,
    },
    users: {
      list: '/users',
      detail: (id: string | number) => `/users/${id}`,
      invite: '/users/invite',
      update: (id: string | number) => `/users/${id}`,
      setStatus: (id: string | number) => `/users/${id}/status`,
      delete: (id: string | number) => `/users/${id}`,
    },
    roles: {
      list: '/roles',
      create: '/roles',
      update: (id: string | number) => `/roles/${id}`,
      delete: (id: string | number) => `/roles/${id}`,
      setPermissions: (id: string | number) => `/roles/${id}/permissions`,
    },
    permissions: {
      list: '/permissions',
    },
    notifications: {
      list: '/notifications',
      markRead: (id: string | number) => `/notifications/${id}/read`,
      markAllRead: '/notifications/read-all',
      delete: (id: string | number) => `/notifications/${id}`,
    },
    auditLogs: {
      list: '/audit-logs',
    },
    tenants: {
      branding: '/tenants/branding',
      settings: '/tenants/settings',
    },
    workflows: {
      list: '/workflows',
      detail: (id: string | number) => `/workflows/${id}`,
      create: '/workflows',
      update: (id: string | number) => `/workflows/${id}`,
      delete: (id: string | number) => `/workflows/${id}`,
      activate: (id: string | number) => `/workflows/${id}/activate`,
      pause: (id: string | number) => `/workflows/${id}/pause`,
    },
  },
};

export default API_CONFIG;
