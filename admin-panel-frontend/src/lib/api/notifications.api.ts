import { api } from './client';
import { API_CONFIG } from '@/config/api.config';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  actionUrl?: string;
  icon?: string;
  readAt?: string;
  createdAt: string;
}

export interface NotificationPage {
  items: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  perPage: number;
}

export const notificationsApi = {
  list: (params?: { page?: number; perPage?: number; unreadOnly?: boolean }): Promise<NotificationPage> =>
    api.get<NotificationPage>(API_CONFIG.endpoints.notifications.list, { params }),

  /** Marks a single notification as read — backend uses PATCH */
  markRead: (id: string): Promise<void> =>
    api.patch<void>(API_CONFIG.endpoints.notifications.markRead(id)),

  /** Marks all unread notifications as read — backend uses PATCH */
  markAllRead: (): Promise<void> =>
    api.patch<void>(API_CONFIG.endpoints.notifications.markAllRead),

  delete: (id: string): Promise<void> =>
    api.delete<void>(API_CONFIG.endpoints.notifications.delete(id)),
};
