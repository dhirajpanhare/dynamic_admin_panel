import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Play,
  Pause,
  Copy,
  Eye,
  Key,
  RefreshCw,
  Activity,
} from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  status: 'Active' | 'Paused' | 'Draft';
  triggers: number;
  lastRun: string;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  status: 'Active' | 'Revoked';
}

const mockWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'Email Campaign Automation',
    status: 'Active',
    triggers: 1234,
    lastRun: '2 hours ago',
  },
  {
    id: '2',
    name: 'Product Sync',
    status: 'Active',
    triggers: 567,
    lastRun: '5 minutes ago',
  },
  {
    id: '3',
    name: 'User Onboarding',
    status: 'Paused',
    triggers: 89,
    lastRun: '2 days ago',
  },
  {
    id: '4',
    name: 'Order Processing',
    status: 'Draft',
    triggers: 0,
    lastRun: 'Never',
  },
];

const mockAPIKeys: APIKey[] = [
  {
    id: '1',
    name: 'Production API',
    key: 'sk_live_51H*********************',
    created: '2024-01-15',
    lastUsed: '2 hours ago',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Development API',
    key: 'sk_test_51H*********************',
    created: '2024-02-01',
    lastUsed: '1 day ago',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Legacy API',
    key: 'sk_live_41G*********************',
    created: '2023-12-01',
    lastUsed: '30 days ago',
    status: 'Revoked',
  },
];

const mockLogs = [
  {
    id: '1',
    workflow: 'Email Campaign',
    status: 'Success',
    duration: '1.2s',
    timestamp: '2 minutes ago',
  },
  {
    id: '2',
    workflow: 'Product Sync',
    status: 'Success',
    duration: '0.8s',
    timestamp: '5 minutes ago',
  },
  {
    id: '3',
    workflow: 'Email Campaign',
    status: 'Failed',
    duration: '2.1s',
    timestamp: '15 minutes ago',
  },
  {
    id: '4',
    workflow: 'Order Processing',
    status: 'Success',
    duration: '1.5s',
    timestamp: '1 hour ago',
  },
];

export function WorkflowPage() {
  const [showKey, setShowKey] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Workflow & API Engine
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage workflows, API keys, and monitor activity
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Workflows</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                {mockWorkflows.length}
              </p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active</p>
              <p className="text-2xl font-semibold text-green-600 mt-1">
                {mockWorkflows.filter((w) => w.status === 'Active').length}
              </p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <Play className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">API Keys</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                {mockAPIKeys.filter((k) => k.status === 'Active').length}
              </p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3">
              <Key className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Triggers</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                {mockWorkflows.reduce((acc, w) => acc + w.triggers, 0)}
              </p>
            </div>
            <div className="rounded-lg bg-orange-100 p-3">
              <RefreshCw className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Workflows */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Workflows
          </h3>
          <div className="space-y-3">
            {mockWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900">
                      {workflow.name}
                    </span>
                    <Badge
                      variant={
                        workflow.status === 'Active'
                          ? 'default'
                          : workflow.status === 'Paused'
                          ? 'secondary'
                          : 'outline'
                      }
                      className={
                        workflow.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : undefined
                      }
                    >
                      {workflow.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>{workflow.triggers} triggers</span>
                    <span>•</span>
                    <span>Last run: {workflow.lastRun}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {workflow.status === 'Active' ? (
                    <Button variant="ghost" size="sm">
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* API Keys */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">API Keys</h3>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Key
            </Button>
          </div>
          <div className="space-y-3">
            {mockAPIKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900">
                        {apiKey.name}
                      </span>
                      <Badge
                        variant={
                          apiKey.status === 'Active' ? 'default' : 'secondary'
                        }
                        className={
                          apiKey.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }
                      >
                        {apiKey.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm text-slate-600 font-mono">
                        {showKey === apiKey.id
                          ? apiKey.key
                          : apiKey.key.substring(0, 20) + '...'}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setShowKey(showKey === apiKey.id ? null : apiKey.id)
                        }
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Created: {apiKey.created}</span>
                  <span>•</span>
                  <span>Last used: {apiKey.lastUsed}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity Logs */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Activity Logs
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Workflow
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {mockLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {log.workflow}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={log.status === 'Success' ? 'default' : 'destructive'}
                      className={
                        log.status === 'Success'
                          ? 'bg-green-100 text-green-700'
                          : undefined
                      }
                    >
                      {log.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {log.duration}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
