import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '@/lib/api/workflow.api';
import { toast } from 'sonner';

const WF_LIST_KEY = 'workflows';
const WF_LOGS_KEY = 'workflow-logs';

export function useWorkflows(params?: { page?: number; pageSize?: number; status?: string }) {
  return useQuery({
    queryKey: [WF_LIST_KEY, params],
    queryFn: () => workflowApi.list(params),
    staleTime: 30 * 1000,
  });
}

export function useWorkflow(id: string) {
  return useQuery({
    queryKey: [WF_LIST_KEY, id],
    queryFn: () => workflowApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: workflowApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [WF_LIST_KEY] });
      toast.success('Workflow created');
    },
    onError: (e: Error) => toast.error(e.message ?? 'Failed to create workflow'),
  });
}

export function useUpdateWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => workflowApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [WF_LIST_KEY] });
      qc.invalidateQueries({ queryKey: [WF_LIST_KEY, id] });
      toast.success('Workflow saved');
    },
    onError: (e: Error) => toast.error(e.message ?? 'Failed to save workflow'),
  });
}

export function useDeleteWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workflowApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [WF_LIST_KEY] });
      toast.success('Workflow deleted');
    },
    onError: (e: Error) => toast.error(e.message ?? 'Failed to delete workflow'),
  });
}

export function useActivateWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workflowApi.activate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [WF_LIST_KEY] });
      toast.success('Workflow activated');
    },
  });
}

export function usePauseWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workflowApi.pause(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [WF_LIST_KEY] });
      toast.success('Workflow paused');
    },
  });
}

export function useWorkflowLogs(params?: { page?: number; pageSize?: number; workflowId?: string }) {
  return useQuery({
    queryKey: [WF_LOGS_KEY, params],
    queryFn: () => workflowApi.getLogs(params),
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });
}
