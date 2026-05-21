import { useState } from 'react';
import { Search, Download, Filter, Shield, User, Settings, Trash2 } from 'lucide-react';
import { useRBACStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageContainer } from '@/components/layout';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import { useAuditLogs } from '@/lib/hooks/use-rbac';

const actionIcons: Record<string, React.ReactNode> = {
  create: <Shield className="h-4 w-4 text-green-600" />,
  update: <Settings className="h-4 w-4 text-blue-600" />,
  delete: <Trash2 className="h-4 w-4 text-red-600" />,
  default: <User className="h-4 w-4 text-gray-600" />,
};

const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
};

export function AuditLogsPage() {
  const { auditLogs: storeLogs, clearAuditLogs } = useRBACStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const { data: apiLogsResponse } = useAuditLogs({ page: 1, pageSize: 100 });

  // Use API data if available, fall back to store
  const auditLogs = apiLogsResponse
    ? (apiLogsResponse.items as any[])
    : storeLogs;

  const filteredLogs = auditLogs.filter((log: any) => {
    const matchesSearch =
      (log.userName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details ?? log.action ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesModule = moduleFilter === 'all' || (log.module ?? log.resource) === moduleFilter;
    return matchesSearch && matchesAction && matchesModule;
  });

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Module', 'Details', 'IP Address'],
      ...filteredLogs.map((log) => [
        format(log.timestamp, 'yyyy-MM-dd HH:mm:ss'),
        log.userName,
        log.action,
        log.module,
        log.details,
        log.ipAddress || 'N/A',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Audit logs exported successfully');
  };

  const handleClearLogs = () => {
    const confirm = window.confirm(
      'Are you sure you want to clear all audit logs? This action cannot be undone.'
    );
    if (!confirm) return;

    clearAuditLogs();
    toast.success('Audit logs cleared');
  };

  const uniqueActions = Array.from(new Set(auditLogs.map((log) => log.action)));
  const uniqueModules = Array.from(new Set(auditLogs.map((log) => log.module)));

  return (
    <PageContainer
      title="Audit Logs"
      description="Track all user actions and system changes"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditLogs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Creates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {auditLogs.filter((log) => log.action === 'create').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {auditLogs.filter((log) => log.action === 'update').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deletes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {auditLogs.filter((log) => log.action === 'delete').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>
                  View and filter all system activities
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                {auditLogs.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearLogs}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Logs
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {uniqueModules.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Logs List */}
            <div className="space-y-3">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No audit logs</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery || actionFilter !== 'all' || moduleFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Activity will appear here as users interact with the system'}
                  </p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      {actionIcons[log.action] || actionIcons.default}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{log.userName}</span>
                        <Badge
                          variant="secondary"
                          className={actionColors[log.action] || ''}
                        >
                          {log.action}
                        </Badge>
                        <Badge variant="outline">{log.module}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {log.details}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                        </span>
                        <span>•</span>
                        <span>{format(log.timestamp, 'MMM d, yyyy HH:mm:ss')}</span>
                        {log.ipAddress && (
                          <>
                            <span>•</span>
                            <span>IP: {log.ipAddress}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
