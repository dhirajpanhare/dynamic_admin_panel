export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 30000,
  endpoints: {
    auth: {
      login: '/auth/login',
      verifyOtp: '/auth/verify-otp',
      refresh: '/auth/refresh',
      profile: '/auth/profile',
      logout: '/auth/logout',
    },
    metadata: {
      menus: '/metadata/menus',
      entity: (slug: string) => `/metadata/entities/${slug}`,
      page: (slug: string) => `/metadata/pages/${slug}`,
      dashboard: (slug: string) => `/metadata/dashboards/${slug}`,
      listViewConfig: (entity: string) => `/metadata/list-views/${entity}`,
    },
    dynamic: {
      list: (entity: string) => `/${entity}`,
      detail: (entity: string, id: string | number) => `/${entity}/${id}`,
      create: (entity: string) => `/${entity}`,
      update: (entity: string, id: string | number) => `/${entity}/${id}`,
      delete: (entity: string, id: string | number) => `/${entity}/${id}`,
      bulkDelete: (entity: string) => `/${entity}/bulk-delete`,
      export: (entity: string) => `/${entity}/export`,
    },
  },
};

export default API_CONFIG;
