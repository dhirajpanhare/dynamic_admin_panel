import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Play, Pause, Eye, RefreshCw, Activity, Trash2 } from 'lucide-react';
import { useWorkflows, useWorkflowLogs, useActivateWorkflow, usePauseWorkflow, useDeleteWorkflow } from '@/lib/hooks/use-workflow';
import type { WorkflowDefinition, WorkflowLog } from '@/lib/api/workflow.api';
import { ROUTES } from '@/config';
import { formatDistanceToNow } from 'date-fns';

const FALLBACK_WORKFLOWS: WorkflowDefinition[] = [
  { id: '1', name: 'Email Campaign Automation', status: 'Active', triggers: 1234, lastRun: '2 hours ago', createdAt: '', updatedAt: '' },
  { id: '2', name: 'Product Sync', status: 'Active', triggers: 567, lastRun: '5 minutes ago', createdAt: '', updatedAt: '' },
  { id: '3', name: 'User Onboarding', status: 'Paused', triggers: 89, lastRun: '2 days ago', createdAt: '', updatedAt: '' },
  { id: '4', name: 'Order Processing', status: 'Draft', triggers: 0, createdAt: '', updatedAt: '' },
];

const FALLBACK_LOGS: WorkflowLog[] = [
  { id: '1', workflowId: '1', workflow: 'Email Campaign', status: 'Success', duration: '1.2s', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
  { id: '2', workflowId: '2', workflow: 'Product Sync', status: 'Success', duration: '0.8s', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { id: '3', workflowId: '1', workflow: 'Email Campaign', status: 'Failed', duration: '2.1s', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
];

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'Active' || status === 'Success'
      ? 'bg-green-100 text-green-700'
      : status === 'Failed'
      ? 'bg-red-100 text-red-700'
      : 'bg-slate-100 text-slate-700';
  return <Badge variant="secondary" className={cls}>{status}</Badge>;
}

function WorkflowCard({ workflow }: { workflow: WorkflowDefinition }) {
  const activate = useActivateWorkflow();
  const pause = usePauseWorkflow();
  const del = useDeleteWorkflow();

  const relTime = workflow.lastRun
    ? (() => { try { return formatDistanceToNow(new Date(workflow.lastRun), { addSuffix: true }); } catch { return workflow.lastRun; } })()
    : 'Never';

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-medium text-slate-900 truncate">{workflow.name}</span>
          <StatusBadge status={workflow.status} />
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>{workflow.triggers} triggers</span>
          <span>·</span>
          <span>Last run: {relTime}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 ml-2">
        {workflow.status === 'Active'
          ? <Button variant="ghost" size="sm" onClick={() => pause.mutate(workflow.id)}><Pause className="h-4 w-4" /></Button>
          : <Button variant="ghost" size="sm" onClick={() => activate.mutate(workflow.id)}><Play className="h-4 w-4" /></Button>}
        <Button variant="ghost" size="sm" asChild>
          <Link to={`${ROUTES.WORKFLOW_BUILDER}/${workflow.id}`}><Eye className="h-4 w-4" /></Link>
        </Button>
        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => del.mutate(workflow.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function WorkflowPage() {
  const { data: workflowsResponse, isLoading: wfLoading } = useWorkflows();
  const { data: logsResponse, isLoading: logsLoading } = useWorkflowLogs({ pageSize: 20 });

  const workflows = workflowsResponse?.items ?? FALLBACK_WORKFLOWS;
  const logs = logsResponse?.items ?? FALLBACK_LOGS;
  const activeCount = workflows.filter((w) => w.status === 'Active').length;
  const totalTriggers = workflows.reduce((acc, w) => acc + (w.triggers ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Workflow Engine</h1>
          <p className="text-sm text-slate-600 mt-1">Manage automated workflows and monitor activity</p>
        </div>
        <Button asChild>
          <Link to={ROUTES.WORKFLOW_BUILDER}><Plus className="mr-2 h-4 w-4" />Create Workflow</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-slate-600">Total Workflows</p><p className="text-2xl font-semibold text-slate-900 mt-1">{wfLoading ? '—' : workflows.length}</p></div>
            <div className="rounded-lg bg-blue-100 p-3"><Activity className="h-6 w-6 text-blue-600" /></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-slate-600">Active</p><p className="text-2xl font-semibold text-green-600 mt-1">{wfLoading ? '—' : activeCount}</p></div>
            <div className="rounded-lg bg-green-100 p-3"><Play className="h-6 w-6 text-green-600" /></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-slate-600">Total Triggers</p><p className="text-2xl font-semibold text-slate-900 mt-1">{wfLoading ? '—' : totalTriggers.toLocaleString()}</p></div>
            <div className="rounded-lg bg-orange-100 p-3"><RefreshCw className="h-6 w-6 text-orange-600" /></div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Workflows</h3>
        </div>
        {wfLoading
          ? <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          : workflows.length === 0
          ? <div className="py-12 text-center text-muted-foreground"><Activity className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No workflows yet.</p></div>
          : <div className="space-y-3">{workflows.map((wf) => <WorkflowCard key={wf.id} workflow={wf} />)}</div>}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Execution Logs</h3>
        {logsLoading ? <Skeleton className="h-40 w-full" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Workflow</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Duration</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: WorkflowLog) => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{log.workflow}</td>
                    <td className="px-4 py-3"><StatusBadge status={log.status} /></td>
                    <td className="px-4 py-3 text-slate-600">{log.duration ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{(() => { try { return formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }); } catch { return log.timestamp; } })()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
