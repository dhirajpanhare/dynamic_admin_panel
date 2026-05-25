import { api } from './client';
import { API_CONFIG } from '@/config/api.config';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
  userCount: number;
  isSystemRole: boolean;
}

export interface Permission {
  id: string;
  name: string;
  slug: string;
  group?: string;
  description?: string;
}

export interface RbacUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuditLog {
  id: string;
  entityName: string;
  entityId: string;
  action: string;
  oldValues?: string;
  newValues?: string;
  userId: string;
  userName: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Roles API ────────────────────────────────────────────────────────────────

export const rolesApi = {
  list: (): Promise<Role[]> =>
    api.get<Role[]>(API_CONFIG.endpoints.roles.list),

  create: (data: { name: string; slug: string; description?: string }): Promise<Role> =>
    api.post<Role>(API_CONFIG.endpoints.roles.create, data),

  update: (id: string, data: { name: string; description?: string }): Promise<Role> =>
    api.put<Role>(API_CONFIG.endpoints.roles.update(id), data),

  delete: (id: string): Promise<void> =>
    api.delete<void>(API_CONFIG.endpoints.roles.delete(id)),

  assignPermissions: (id: string, permissions: string[]): Promise<void> =>
    api.put<void>(API_CONFIG.endpoints.roles.setPermissions(id), { permissions }),
};

// ─── Users API ────────────────────────────────────────────────────────────────

export const usersApi = {
  list: (params?: { page?: number; perPage?: number; search?: string; isActive?: boolean }): Promise<PagedResult<RbacUser>> =>
    api.get<PagedResult<RbacUser>>(API_CONFIG.endpoints.users.list, { params }),

  getById: (id: string): Promise<RbacUser> =>
    api.get<RbacUser>(API_CONFIG.endpoints.users.detail(id)),

  invite: (data: { email: string; displayName: string; roleSlug?: string }): Promise<RbacUser> =>
    api.post<RbacUser>(API_CONFIG.endpoints.users.invite, data),

  update: (id: string, data: { displayName?: string; avatarUrl?: string; roleSlugs?: string[] }): Promise<void> =>
    api.put<void>(API_CONFIG.endpoints.users.update(id), data),

  setStatus: (id: string, isActive: boolean): Promise<void> =>
    api.put<void>(API_CONFIG.endpoints.users.setStatus(id), { isActive }),

  delete: (id: string): Promise<void> =>
    api.delete<void>(API_CONFIG.endpoints.users.delete(id)),
};

// ─── Permissions API ──────────────────────────────────────────────────────────

export const permissionsApi = {
  list: (): Promise<Permission[]> =>
    api.get<Permission[]>(API_CONFIG.endpoints.permissions.list),
};

// ─── Audit Logs API ───────────────────────────────────────────────────────────

export const auditLogsApi = {
  list: (params?: {
    page?: number;
    perPage?: number;
    entity?: string;
    userId?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PagedResult<AuditLog>> =>
    api.get<PagedResult<AuditLog>>(API_CONFIG.endpoints.auditLogs.list, { params }),
};
