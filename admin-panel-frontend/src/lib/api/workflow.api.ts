import apiClient from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WorkflowStatus = 'Active' | 'Paused' | 'Draft';

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  triggers: number;
  lastRun?: string;
  createdAt: string;
  updatedAt: string;
  definition?: WorkflowGraph;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface WorkflowLog {
  id: string;
  workflowId: string;
  workflow: string;
  status: 'Success' | 'Failed' | 'Running';
  duration?: string;
  error?: string;
  timestamp: string;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Workflow API ─────────────────────────────────────────────────────────────

export const workflowApi = {
  list: (params?: { page?: number; pageSize?: number; status?: string }): Promise<ListResponse<WorkflowDefinition>> =>
    apiClient.get('/api/workflows', { params }).then((r) => r.data),

  getById: (id: string): Promise<WorkflowDefinition> =>
    apiClient.get(`/api/workflows/${id}`).then((r) => r.data),

  create: (data: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> =>
    apiClient.post('/api/workflows', data).then((r) => r.data),

  update: (id: string, data: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> =>
    apiClient.put(`/api/workflows/${id}`, data).then((r) => r.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/api/workflows/${id}`).then((r) => r.data),

  activate: (id: string): Promise<WorkflowDefinition> =>
    apiClient.post(`/api/workflows/${id}/activate`).then((r) => r.data),

  pause: (id: string): Promise<WorkflowDefinition> =>
    apiClient.post(`/api/workflows/${id}/pause`).then((r) => r.data),

  getLogs: (params?: {
    page?: number;
    pageSize?: number;
    workflowId?: string;
  }): Promise<ListResponse<WorkflowLog>> =>
    apiClient.get('/api/workflows/logs', { params }).then((r) => r.data),
};
