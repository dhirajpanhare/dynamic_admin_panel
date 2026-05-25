import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi, usersApi, permissionsApi, auditLogsApi } from '@/lib/api/rbac.api';
import { QUERY_KEYS } from '@/config';
import { toast } from 'sonner';

// ─── Roles hooks ──────────────────────────────────────────────────────────────

export function useRoles() {
  return useQuery({
    queryKey: [QUERY_KEYS.ROLES],
    queryFn: () => rolesApi.list(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rolesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ROLES] });
      toast.success('Role created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Failed to create role');
    },
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => rolesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ROLES] });
      toast.success('Role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Failed to update role');
    },
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ROLES] });
      toast.success('Role deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Failed to delete role');
    },
  });
}

// ─── Users hooks ──────────────────────────────────────────────────────────────

export function useUsers(params?: { page?: number; pageSize?: number; search?: string }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.list(params),
    staleTime: 1 * 60 * 1000,
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.invite,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Invitation sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Failed to invite user');
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User removed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Failed to remove user');
    },
  });
}

export function useAssignRoles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: string[] }) => usersApi.update(id, { roleSlugs: roles }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Roles updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Failed to update roles');
    },
  });
}

// ─── Permissions hook ─────────────────────────────────────────────────────────

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionsApi.list(),
    staleTime: 10 * 60 * 1000,
  });
}

// ─── Audit logs hook ──────────────────────────────────────────────────────────

export function useAuditLogs(params?: {
  page?: number;
  pageSize?: number;
  userId?: string;
  entity?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.AUDIT_LOGS, params],
    queryFn: () => auditLogsApi.list(params),
    staleTime: 30 * 1000,
  });
}
