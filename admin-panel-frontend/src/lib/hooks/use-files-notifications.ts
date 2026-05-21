import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '@/lib/api/files.api';
import { notificationsApi } from '@/lib/api/notifications.api';
import { QUERY_KEYS } from '@/config';
import { toast } from 'sonner';

// ─── Files hooks ──────────────────────────────────────────────────────────────

export function useFiles(params?: { page?: number; pageSize?: number; search?: string }) {
  return useQuery({
    queryKey: [QUERY_KEYS.FILES, params],
    queryFn: () => filesApi.list(params),
    staleTime: 30 * 1000,
  });
}

export function useUploadFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file }: { file: File }) => filesApi.upload(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.FILES] });
      toast.success('File uploaded successfully');
    },
    onError: (e: Error) => toast.error(e.message ?? 'Upload failed'),
  });
}

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => filesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.FILES] });
      toast.success('File deleted');
    },
    onError: (e: Error) => toast.error(e.message ?? 'Delete failed'),
  });
}

// ─── Notifications hooks ──────────────────────────────────────────────────────

export function useNotifications(params?: { page?: number; pageSize?: number; unreadOnly?: boolean }) {
  return useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS, params],
    queryFn: () => notificationsApi.list(params),
    staleTime: 15 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useNotificationCount() {
  return useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATION_COUNT],
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATION_COUNT] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATION_COUNT] });
      toast.success('All notifications marked as read');
    },
  });
}
