import { useRBACStore, type PermissionModule, type PermissionAction } from '@/lib/store/rbac.store';

export function usePermissions(userId?: string) {
  const { hasPermission, getRoleById, users } = useRBACStore();
  
  const currentUserId = userId || 'user_1'; // Default to first user for demo
  const currentUser = users.find(u => u.id === currentUserId);
  const currentRole = currentUser ? getRoleById(currentUser.roleId) : null;
  
  const can = (module: PermissionModule, action: PermissionAction): boolean => {
    return hasPermission(currentUserId, module, action);
  };
  
  const canAny = (checks: Array<{ module: PermissionModule; action: PermissionAction }>): boolean => {
    return checks.some(({ module, action }) => can(module, action));
  };
  
  const canAll = (checks: Array<{ module: PermissionModule; action: PermissionAction }>): boolean => {
    return checks.every(({ module, action }) => can(module, action));
  };
  
  return {
    can,
    canAny,
    canAll,
    currentUser,
    currentRole,
  };
}
