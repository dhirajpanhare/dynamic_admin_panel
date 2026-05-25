import { api } from './client';
import { API_CONFIG } from '@/config/api.config';

// Types for dynamic API responses — matches backend PagedResponse<T>
export interface ListResponse<T> {
  items: T[];
  totalCount: number;   // backend: totalCount
  page: number;
  pageSize: number;     // backend: pageSize
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, string | number | boolean>;
  [key: string]: any;
}

export interface BulkDeleteParams {
  ids: (string | number)[];
}

export interface ExportParams extends ListParams {
  format?: 'xlsx' | 'csv' | 'pdf';
  fields?: string[];
}

// Dynamic API methods
export const dynamicApi = {
  /**
   * Get list of records for an entity
   */
  getList: async <T = any>(
    entitySlug: string,
    params?: ListParams
  ): Promise<ListResponse<T>> => {
    const url = API_CONFIG.endpoints.dynamic.list(entitySlug);
    return api.get<ListResponse<T>>(url, { params });
  },

  /**
   * Get single record by ID
   */
  getOne: async <T = any>(entitySlug: string, id: string | number): Promise<T> => {
    const url = API_CONFIG.endpoints.dynamic.detail(entitySlug, id);
    return api.get<T>(url);
  },

  /**
   * Create new record
   */
  create: async <T = any>(entitySlug: string, data: any): Promise<T> => {
    const url = API_CONFIG.endpoints.dynamic.create(entitySlug);
    return api.post<T>(url, data);
  },

  /**
   * Update existing record
   */
  update: async <T = any>(
    entitySlug: string,
    id: string | number,
    data: any
  ): Promise<T> => {
    const url = API_CONFIG.endpoints.dynamic.update(entitySlug, id);
    return api.put<T>(url, data);
  },

  /**
   * Partially update existing record
   */
  patch: async <T = any>(
    entitySlug: string,
    id: string | number,
    data: any
  ): Promise<T> => {
    const url = API_CONFIG.endpoints.dynamic.update(entitySlug, id);
    return api.patch<T>(url, data);
  },

  /**
   * Delete record by ID
   */
  delete: async (entitySlug: string, id: string | number): Promise<void> => {
    const url = API_CONFIG.endpoints.dynamic.delete(entitySlug, id);
    return api.delete(url);
  },

  /**
   * Bulk delete records
   */
  bulkDelete: async (entitySlug: string, ids: (string | number)[]): Promise<void> => {
    const url = API_CONFIG.endpoints.dynamic.bulkDelete(entitySlug);
    return api.post(url, { ids });
  },

  /**
   * Export records
   */
  export: async (entitySlug: string, params?: ExportParams): Promise<Blob> => {
    const url = API_CONFIG.endpoints.dynamic.export(entitySlug);
    const response = await apiClient.get(url, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Upload file
   */
  uploadFile: async (entitySlug: string, file: File, field?: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    if (field) {
      formData.append('field', field);
    }

    const url = `/${entitySlug}/upload`;
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get related records for relation fields
   */
  getRelatedRecords: async <T = any>(
    entitySlug: string,
    params?: {
      search?: string;
      page?: number;
      perPage?: number;
    }
  ): Promise<ListResponse<T>> => {
    const url = API_CONFIG.endpoints.dynamic.list(entitySlug);
    return api.get<ListResponse<T>>(url, { params });
  },

  /**
   * Execute custom action on entity
   */
  executeAction: async <T = any>(
    entitySlug: string,
    actionId: string,
    data?: any
  ): Promise<T> => {
    const url = `/${entitySlug}/actions/${actionId}`;
    return api.post<T>(url, data);
  },

  /**
   * Execute bulk action on multiple records
   */
  executeBulkAction: async <T = any>(
    entitySlug: string,
    actionId: string,
    ids: (string | number)[],
    data?: any
  ): Promise<T> => {
    const url = `/${entitySlug}/bulk-actions/${actionId}`;
    return api.post<T>(url, { ids, ...data });
  },
};

export default dynamicApi;
