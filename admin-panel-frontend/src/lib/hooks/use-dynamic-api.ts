import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { dynamicApi } from '@/lib/api/dynamic.api';
import type { ListResponse, ListParams } from '@/lib/api/dynamic.api';
import { QUERY_KEYS } from '@/config/constants';
import { toast } from 'sonner';

/**
 * Hook to fetch list of records
 */
export function useEntityList<T = any>(
  entitySlug: string,
  params?: ListParams,
  options?: { enabled?: boolean }
): UseQueryResult<ListResponse<T>, Error> {
  return useQuery({
    queryKey: [QUERY_KEYS.ENTITY_LIST, entitySlug, params],
    queryFn: () => dynamicApi.getList<T>(entitySlug, params),
    enabled: options?.enabled !== false && !!entitySlug,
  });
}

/**
 * Hook to fetch single record
 */
export function useEntityDetail<T = any>(
  entitySlug: string,
  id: string | number,
  options?: { enabled?: boolean }
): UseQueryResult<T, Error> {
  return useQuery({
    queryKey: [QUERY_KEYS.ENTITY_DETAIL, entitySlug, id],
    queryFn: () => dynamicApi.getOne<T>(entitySlug, id),
    enabled: options?.enabled !== false && !!entitySlug && !!id,
  });
}

/**
 * Hook to create a record
 */
export function useCreateEntity<T = any>(entitySlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => dynamicApi.create<T>(entitySlug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ENTITY_LIST, entitySlug] });
      toast.success('Record created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create record');
    },
  });
}

/**
 * Hook to update a record
 */
export function useUpdateEntity<T = any>(entitySlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) =>
      dynamicApi.update<T>(entitySlug, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ENTITY_LIST, entitySlug] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ENTITY_DETAIL, entitySlug, variables.id],
      });
      toast.success('Record updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update record');
    },
  });
}

/**
 * Hook to delete a record
 */
export function useDeleteEntity(entitySlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => dynamicApi.delete(entitySlug, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ENTITY_LIST, entitySlug] });
      toast.success('Record deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete record');
    },
  });
}

/**
 * Hook to bulk delete records
 */
export function useBulkDeleteEntity(entitySlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: (string | number)[]) => dynamicApi.bulkDelete(entitySlug, ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ENTITY_LIST, entitySlug] });
      toast.success(`${ids.length} record(s) deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete records');
    },
  });
}

/**
 * Hook to export records
 */
export function useExportEntity(entitySlug: string) {
  return useMutation({
    mutationFn: (params?: any) => dynamicApi.export(entitySlug, params),
    onSuccess: (blob, variables) => {
      const format = variables?.format || 'xlsx';
      const filename = `${entitySlug}-export-${Date.now()}.${format}`;
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Export completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to export records');
    },
  });
}

/**
 * Hook to upload file
 */
export function useUploadFile(entitySlug: string) {
  return useMutation({
    mutationFn: ({ file, field }: { file: File; field?: string }) =>
      dynamicApi.uploadFile(entitySlug, file, field),
    onSuccess: () => {
      toast.success('File uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload file');
    },
  });
}

/**
 * Hook to fetch related records for relation fields
 */
export function useRelatedRecords<T = any>(
  entitySlug: string,
  params?: { search?: string; page?: number; perPage?: number },
  options?: { enabled?: boolean }
): UseQueryResult<ListResponse<T>, Error> {
  return useQuery({
    queryKey: [QUERY_KEYS.ENTITY_LIST, entitySlug, 'related', params],
    queryFn: () => dynamicApi.getRelatedRecords<T>(entitySlug, params),
    enabled: options?.enabled !== false && !!entitySlug,
  });
}

/**
 * Hook to execute custom action
 */
export function useExecuteAction<T = any>(entitySlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ actionId, data }: { actionId: string; data?: any }) =>
      dynamicApi.executeAction<T>(entitySlug, actionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ENTITY_LIST, entitySlug] });
      toast.success('Action executed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to execute action');
    },
  });
}

/**
 * Hook to execute bulk action
 */
export function useExecuteBulkAction<T = any>(entitySlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      actionId,
      ids,
      data,
    }: {
      actionId: string;
      ids: (string | number)[];
      data?: any;
    }) => dynamicApi.executeBulkAction<T>(entitySlug, actionId, ids, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ENTITY_LIST, entitySlug] });
      toast.success('Bulk action executed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to execute bulk action');
    },
  });
}
