import { useState } from 'react';
import { Check, X, Save } from 'lucide-react';
import { useRBACStore } from '@/lib/store';
import type { PermissionModule, PermissionAction } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout';

const moduleLabels: Record<PermissionModule, string> = {
  dashboard: 'Dashboard',
  products: 'Products',
  users: 'Users',
  roles: 'Roles',
  workflows: 'Workflows',
  forms: 'Forms',
  settings: 'Settings',
  api_keys: 'API Keys',
  audit_logs: 'Audit Logs',
  workspaces: 'Workspaces',
};

const actionLabels: Record<PermissionAction, string> = {
  create: 'Create',
  read: 'Read',
  update: 'Update',
  delete: 'Delete',
  manage: 'Manage',
};

export function PermissionsMatrixPage() {
  const { roles, permissions, updateRole } = useRBACStore();
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || '');
  const [modifiedPermissions, setModifiedPermissions] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  const handleRoleChange = (roleId: string) => {
    if (hasChanges) {
      const confirm = window.confirm('You have unsaved changes. Do you want to discard them?');
      if (!confirm) return;
    }
    setSelectedRoleId(roleId);
    setModifiedPermissions([]);
    setHasChanges(false);
  };

  const togglePermission = (permissionId: string) => {
    if (!selectedRole) return;

    const currentPerms = hasChanges ? modifiedPermissions : selectedRole.permissions;
    const newPerms = currentPerms.includes(permissionId)
      ? currentPerms.filter((id) => id !== permissionId)
      : [...currentPerms, permissionId];

    setModifiedPermissions(newPerms);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!selectedRole) return;

    try {
      updateRole(selectedRole.id, {
        permissions: modifiedPermissions,
      });
      toast.success('Permissions updated successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to update permissions');
    }
  };

  const handleReset = () => {
    setModifiedPermissions([]);
    setHasChanges(false);
  };

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<PermissionModule, typeof permissions>);

  // Get all unique actions
  const allActions = Array.from(
    new Set(permissions.map((p) => p.action))
  ).sort() as PermissionAction[];

  const currentPermissions = hasChanges
    ? modifiedPermissions
    : selectedRole?.permissions || [];

  return (
    <PageContainer
      title="Permissions Matrix"
      description="Visual overview of role permissions"
    >
      <div className="space-y-6">
        {/* Role Selector */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Select Role</CardTitle>
                <CardDescription>
                  Choose a role to view and edit its permissions
                </CardDescription>
              </div>
              {hasChanges && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Reset
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select value={selectedRoleId} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        {role.name}
                        {role.isSystem && (
                          <Badge variant="secondary" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedRole && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{currentPermissions.length} permissions</span>
                  <span>•</span>
                  <span>{selectedRole.userCount} users</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Matrix */}
        {selectedRole && (
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                Check or uncheck boxes to grant or revoke permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-sm">Module</th>
                      {allActions.map((action) => (
                        <th key={action} className="text-center p-3 font-medium text-sm">
                          {actionLabels[action]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(permissionsByModule).map(([module, perms]) => (
                      <tr key={module} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium text-sm">
                          {moduleLabels[module as PermissionModule]}
                        </td>
                        {allActions.map((action) => {
                          const permission = perms.find((p) => p.action === action);
                          const isChecked = permission
                            ? currentPermissions.includes(permission.id)
                            : false;

                          return (
                            <td key={action} className="text-center p-3">
                              {permission ? (
                                <div className="flex items-center justify-center">
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() => togglePermission(permission.id)}
                                    disabled={selectedRole.isSystem}
                                  />
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedRole.isSystem && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> System roles cannot be modified. Create a custom role
                    to define your own permissions.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Permission granted</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-red-600" />
                <span>Permission denied</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">System</Badge>
                <span>Cannot be modified</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
