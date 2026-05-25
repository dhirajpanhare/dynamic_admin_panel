import { api } from './client';
import { API_CONFIG } from '@/config/api.config';

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
    api.get<ListResponse<WorkflowDefinition>>(API_CONFIG.endpoints.workflows.list, { params }),

  getById: (id: string): Promise<WorkflowDefinition> =>
    api.get<WorkflowDefinition>(API_CONFIG.endpoints.workflows.detail(id)),

  create: (data: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> =>
    api.post<WorkflowDefinition>(API_CONFIG.endpoints.workflows.create, data),

  update: (id: string, data: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> =>
    api.put<WorkflowDefinition>(API_CONFIG.endpoints.workflows.update(id), data),

  delete: (id: string): Promise<void> =>
    api.delete<void>(API_CONFIG.endpoints.workflows.delete(id)),

  activate: (id: string): Promise<WorkflowDefinition> =>
    api.patch<WorkflowDefinition>(API_CONFIG.endpoints.workflows.activate(id)),

  pause: (id: string): Promise<WorkflowDefinition> =>
    api.patch<WorkflowDefinition>(API_CONFIG.endpoints.workflows.pause(id)),

  getLogs: (params?: {
    page?: number;
    pageSize?: number;
    workflowId?: string;
  }): Promise<ListResponse<WorkflowLog>> =>
    api.get<ListResponse<WorkflowLog>>('/workflows/logs', { params }),
};
