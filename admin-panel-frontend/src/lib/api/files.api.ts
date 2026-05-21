import apiClient from './client';

export interface FileRecord {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  entityType?: string;
  entityId?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const filesApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string }): Promise<ListResponse<FileRecord>> =>
    apiClient.get('/api/files', { params }).then((r) => r.data),

  upload: (file: File, onProgress?: (pct: number) => void): Promise<FileRecord> => {
    const form = new FormData();
    form.append('file', file);
    return apiClient
      .post('/api/files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
        },
      })
      .then((r) => r.data);
  },

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/api/files/${id}`).then((r) => r.data),
};
