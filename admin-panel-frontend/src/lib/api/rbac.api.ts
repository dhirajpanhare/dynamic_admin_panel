import apiClient from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface RbacUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Roles API ────────────────────────────────────────────────────────────────

export const rolesApi = {
  list: (): Promise<Role[]> =>
    apiClient.get('/api/roles').then((r) => r.data),

  getById: (id: string): Promise<Role> =>
    apiClient.get(`/api/roles/${id}`).then((r) => r.data),

  create: (data: Partial<Role>): Promise<Role> =>
    apiClient.post('/api/roles', data).then((r) => r.data),

  update: (id: string, data: Partial<Role>): Promise<Role> =>
    apiClient.put(`/api/roles/${id}`, data).then((r) => r.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/api/roles/${id}`).then((r) => r.data),

  assignPermissions: (id: string, permissions: string[]): Promise<Role> =>
    apiClient.put(`/api/roles/${id}/permissions`, { permissions }).then((r) => r.data),
};

// ─── Users API ────────────────────────────────────────────────────────────────

export const usersApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string }): Promise<ListResponse<RbacUser>> =>
    apiClient.get('/api/users', { params }).then((r) => r.data),

  getById: (id: string): Promise<RbacUser> =>
    apiClient.get(`/api/users/${id}`).then((r) => r.data),

  invite: (data: { name: string; email: string; roles: string[] }): Promise<RbacUser> =>
    apiClient.post('/api/users/invite', data).then((r) => r.data),

  update: (id: string, data: Partial<RbacUser>): Promise<RbacUser> =>
    apiClient.put(`/api/users/${id}`, data).then((r) => r.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/api/users/${id}`).then((r) => r.data),

  assignRoles: (id: string, roles: string[]): Promise<RbacUser> =>
    apiClient.put(`/api/users/${id}/roles`, { roles }).then((r) => r.data),

  deactivate: (id: string): Promise<RbacUser> =>
    apiClient.post(`/api/users/${id}/deactivate`).then((r) => r.data),
};

// ─── Permissions API ──────────────────────────────────────────────────────────

export const permissionsApi = {
  list: (): Promise<Permission[]> =>
    apiClient.get('/api/permissions').then((r) => r.data),
};

// ─── Audit Logs API ───────────────────────────────────────────────────────────

export const auditLogsApi = {
  list: (params?: {
    page?: number;
    pageSize?: number;
    userId?: string;
    resource?: string;
    from?: string;
    to?: string;
  }): Promise<ListResponse<AuditLog>> =>
    apiClient.get('/api/audit-logs', { params }).then((r) => r.data),
};
