import apiClient from './client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const notificationsApi = {
  list: (params?: { page?: number; pageSize?: number; unreadOnly?: boolean }): Promise<ListResponse<Notification>> =>
    apiClient.get('/api/notifications', { params }).then((r) => r.data),

  getUnreadCount: (): Promise<{ count: number }> =>
    apiClient.get('/api/notifications/unread-count').then((r) => r.data),

  markRead: (id: string): Promise<void> =>
    apiClient.put(`/api/notifications/${id}/read`).then((r) => r.data),

  markAllRead: (): Promise<void> =>
    apiClient.put('/api/notifications/read-all').then((r) => r.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/api/notifications/${id}`).then((r) => r.data),
};
