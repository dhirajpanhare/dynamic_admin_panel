import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useRBACStore } from '@/lib/store';
import type { Role, PermissionModule } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface CreateRoleModalProps {
  open: boolean;
  onClose: () => void;
  role?: Role | null;
}

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

export function CreateRoleModal({ open, onClose, role }: CreateRoleModalProps) {
  const { permissions, addRole, updateRole } = useRBACStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setSelectedPermissions(role.permissions);
    } else {
      setName('');
      setDescription('');
      setSelectedPermissions([]);
    }
  }, [role, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }

    if (selectedPermissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    try {
      if (role) {
        updateRole(role.id, {
          name: name.trim(),
          description: description.trim(),
          permissions: selectedPermissions,
        });
        toast.success('Role updated successfully');
      } else {
        addRole({
          name: name.trim(),
          description: description.trim(),
          permissions: selectedPermissions,
          isSystem: false,
          userCount: 0,
        });
        toast.success('Role created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save role');
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const toggleModule = (module: PermissionModule) => {
    const modulePermissions = permissions
      .filter((p) => p.module === module)
      .map((p) => p.id);

    const allSelected = modulePermissions.every((id) =>
      selectedPermissions.includes(id)
    );

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((id) => !modulePermissions.includes(id))
      );
    } else {
      setSelectedPermissions((prev) => [
        ...prev.filter((id) => !modulePermissions.includes(id)),
        ...modulePermissions,
      ]);
    }
  };

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<PermissionModule, typeof permissions>);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {role ? 'Edit Role' : 'Create New Role'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Role Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Content Manager"
                disabled={role?.isSystem}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Description
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this role"
              />
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Permissions</h3>
              <span className="text-xs text-muted-foreground">
                {selectedPermissions.length} selected
              </span>
            </div>

            <div className="border rounded-lg divide-y">
              {Object.entries(permissionsByModule).map(([module, perms]) => {
                const modulePerms = perms.map((p) => p.id);
                const allSelected = modulePerms.every((id) =>
                  selectedPermissions.includes(id)
                );
                const someSelected = modulePerms.some((id) =>
                  selectedPermissions.includes(id)
                );

                return (
                  <div key={module} className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={() => toggleModule(module as PermissionModule)}
                        className={someSelected && !allSelected ? 'opacity-50' : ''}
                      />
                      <label className="text-sm font-medium cursor-pointer flex-1">
                        {moduleLabels[module as PermissionModule]}
                      </label>
                      <span className="text-xs text-muted-foreground">
                        {perms.length} permissions
                      </span>
                    </div>

                    <div className="ml-7 grid grid-cols-2 gap-2">
                      {perms.map((permission) => (
                        <div key={permission.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                          <label className="text-sm text-muted-foreground cursor-pointer">
                            {permission.action}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {role ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
