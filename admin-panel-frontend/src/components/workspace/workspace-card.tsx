import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Users, Settings, Trash2, Edit, Building2 } from 'lucide-react';
import type { Workspace } from '@/lib/store';
import { formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface WorkspaceCardProps {
  workspace: Workspace;
  onEdit: (workspace: Workspace) => void;
  onDelete: (workspace: Workspace) => void;
  onSettings: (workspace: Workspace) => void;
  onSelect: (workspace: Workspace) => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  workspace,
  onEdit,
  onDelete,
  onSettings,
  onSelect,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const statusColors = {
    active: 'success',
    suspended: 'destructive',
    trial: 'warning',
  } as const;

  const planColors = {
    free: 'secondary',
    pro: 'default',
    enterprise: 'default',
  } as const;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3" onClick={() => onSelect(workspace)}>
            {workspace.logo ? (
              <img
                src={workspace.logo}
                alt={workspace.name}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="h-6 w-6" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{workspace.name}</h3>
              <p className="text-sm text-muted-foreground">{workspace.slug}</p>
            </div>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border bg-card p-2 shadow-lg">
                  <button
                    onClick={() => {
                      onEdit(workspace);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      onSettings(workspace);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <div className="my-1 border-t" />
                  <button
                    onClick={() => {
                      onDelete(workspace);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent onClick={() => onSelect(workspace)}>
        {workspace.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {workspace.description}
          </p>
        )}

        <div className="flex items-center gap-2 mb-4">
          <Badge variant={statusColors[workspace.status]}>
            {workspace.status.charAt(0).toUpperCase() + workspace.status.slice(1)}
          </Badge>
          <Badge variant={planColors[workspace.plan]}>
            {workspace.plan.charAt(0).toUpperCase() + workspace.plan.slice(1)}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{workspace.memberCount} members</span>
          </div>
          <span className="text-muted-foreground">
            Created {formatDate(workspace.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkspaceCard;
