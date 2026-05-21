import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Permission types
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';
export type PermissionModule = 
  | 'dashboard'
  | 'products'
  | 'users'
  | 'roles'
  | 'workflows'
  | 'forms'
  | 'settings'
  | 'api_keys'
  | 'audit_logs'
  | 'workspaces';

export interface Permission {
  id: string;
  module: PermissionModule;
  action: PermissionAction;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Permission IDs
  isSystem: boolean; // System roles can't be deleted
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roleId: string;
  status: 'active' | 'invited' | 'suspended';
  lastLogin?: Date;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  timestamp: Date;
}

interface RBACState {
  // Permissions
  permissions: Permission[];
  
  // Roles
  roles: Role[];
  
  // Users
  users: User[];
  
  // Audit Logs
  auditLogs: AuditLog[];
  
  // Actions - Permissions
  setPermissions: (permissions: Permission[]) => void;
  
  // Actions - Roles
  setRoles: (roles: Role[]) => void;
  addRole: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  
  // Actions - Users
  setUsers: (users: User[]) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  inviteUser: (email: string, roleId: string) => void;
  
  // Actions - Audit Logs
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  clearAuditLogs: () => void;
  
  // Utility
  getRoleById: (id: string) => Role | undefined;
  getUsersByRole: (roleId: string) => User[];
  hasPermission: (userId: string, module: PermissionModule, action: PermissionAction) => boolean;
}

// Default permissions for all modules
const defaultPermissions: Permission[] = [
  // Dashboard
  { id: 'perm_dashboard_read', module: 'dashboard', action: 'read', description: 'View dashboard' },
  
  // Products
  { id: 'perm_products_create', module: 'products', action: 'create', description: 'Create products' },
  { id: 'perm_products_read', module: 'products', action: 'read', description: 'View products' },
  { id: 'perm_products_update', module: 'products', action: 'update', description: 'Edit products' },
  { id: 'perm_products_delete', module: 'products', action: 'delete', description: 'Delete products' },
  
  // Users
  { id: 'perm_users_create', module: 'users', action: 'create', description: 'Invite users' },
  { id: 'perm_users_read', module: 'users', action: 'read', description: 'View users' },
  { id: 'perm_users_update', module: 'users', action: 'update', description: 'Edit users' },
  { id: 'perm_users_delete', module: 'users', action: 'delete', description: 'Delete users' },
  
  // Roles
  { id: 'perm_roles_create', module: 'roles', action: 'create', description: 'Create roles' },
  { id: 'perm_roles_read', module: 'roles', action: 'read', description: 'View roles' },
  { id: 'perm_roles_update', module: 'roles', action: 'update', description: 'Edit roles' },
  { id: 'perm_roles_delete', module: 'roles', action: 'delete', description: 'Delete roles' },
  
  // Workflows
  { id: 'perm_workflows_create', module: 'workflows', action: 'create', description: 'Create workflows' },
  { id: 'perm_workflows_read', module: 'workflows', action: 'read', description: 'View workflows' },
  { id: 'perm_workflows_update', module: 'workflows', action: 'update', description: 'Edit workflows' },
  { id: 'perm_workflows_delete', module: 'workflows', action: 'delete', description: 'Delete workflows' },
  
  // Forms
  { id: 'perm_forms_create', module: 'forms', action: 'create', description: 'Create forms' },
  { id: 'perm_forms_read', module: 'forms', action: 'read', description: 'View forms' },
  { id: 'perm_forms_update', module: 'forms', action: 'update', description: 'Edit forms' },
  { id: 'perm_forms_delete', module: 'forms', action: 'delete', description: 'Delete forms' },
  
  // Settings
  { id: 'perm_settings_read', module: 'settings', action: 'read', description: 'View settings' },
  { id: 'perm_settings_manage', module: 'settings', action: 'manage', description: 'Manage settings' },
  
  // API Keys
  { id: 'perm_api_keys_create', module: 'api_keys', action: 'create', description: 'Create API keys' },
  { id: 'perm_api_keys_read', module: 'api_keys', action: 'read', description: 'View API keys' },
  { id: 'perm_api_keys_delete', module: 'api_keys', action: 'delete', description: 'Delete API keys' },
  
  // Audit Logs
  { id: 'perm_audit_logs_read', module: 'audit_logs', action: 'read', description: 'View audit logs' },
  
  // Workspaces
  { id: 'perm_workspaces_create', module: 'workspaces', action: 'create', description: 'Create workspaces' },
  { id: 'perm_workspaces_read', module: 'workspaces', action: 'read', description: 'View workspaces' },
  { id: 'perm_workspaces_update', module: 'workspaces', action: 'update', description: 'Edit workspaces' },
  { id: 'perm_workspaces_delete', module: 'workspaces', action: 'delete', description: 'Delete workspaces' },
];

// Default system roles
const defaultRoles: Role[] = [
  {
    id: 'role_admin',
    name: 'Administrator',
    description: 'Full access to all features and settings',
    permissions: defaultPermissions.map(p => p.id),
    isSystem: true,
    userCount: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'role_manager',
    name: 'Manager',
    description: 'Can manage products, users, and workflows',
    permissions: [
      'perm_dashboard_read',
      'perm_products_create',
      'perm_products_read',
      'perm_products_update',
      'perm_users_read',
      'perm_users_update',
      'perm_workflows_create',
      'perm_workflows_read',
      'perm_workflows_update',
      'perm_forms_create',
      'perm_forms_read',
      'perm_forms_update',
      'perm_workspaces_read',
    ],
    isSystem: true,
    userCount: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'role_editor',
    name: 'Editor',
    description: 'Can create and edit content',
    permissions: [
      'perm_dashboard_read',
      'perm_products_create',
      'perm_products_read',
      'perm_products_update',
      'perm_forms_read',
      'perm_workflows_read',
      'perm_workspaces_read',
    ],
    isSystem: true,
    userCount: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'role_viewer',
    name: 'Viewer',
    description: 'Read-only access to most features',
    permissions: [
      'perm_dashboard_read',
      'perm_products_read',
      'perm_users_read',
      'perm_workflows_read',
      'perm_forms_read',
      'perm_workspaces_read',
    ],
    isSystem: true,
    userCount: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Sample users
const defaultUsers: User[] = [
  {
    id: 'user_1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: undefined,
    roleId: 'role_admin',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90), // 90 days ago
  },
  {
    id: 'user_2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    avatar: undefined,
    roleId: 'role_manager',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60), // 60 days ago
  },
  {
    id: 'user_3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    avatar: undefined,
    roleId: 'role_editor',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45), // 45 days ago
  },
  {
    id: 'user_4',
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    avatar: undefined,
    roleId: 'role_viewer',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
  },
  {
    id: 'user_5',
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    avatar: undefined,
    roleId: 'role_editor',
    status: 'invited',
    lastLogin: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
];

export const useRBACStore = create<RBACState>()(
  persist(
    (set, get) => ({
      // Initial state
      permissions: defaultPermissions,
      roles: defaultRoles,
      users: defaultUsers,
      auditLogs: [],
      
      // Permissions actions
      setPermissions: (permissions) => set({ permissions }),
      
      // Roles actions
      setRoles: (roles) => set({ roles }),
      
      addRole: (roleData) => {
        const newRole: Role = {
          ...roleData,
          id: `role_${Date.now()}`,
          userCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          roles: [...state.roles, newRole],
        }));
        
        // Add audit log
        get().addAuditLog({
          userId: 'current_user',
          userName: 'Current User',
          action: 'create',
          module: 'roles',
          details: `Created role: ${newRole.name}`,
        });
      },
      
      updateRole: (id, updates) => {
        set((state) => ({
          roles: state.roles.map((role) =>
            role.id === id
              ? { ...role, ...updates, updatedAt: new Date() }
              : role
          ),
        }));
        
        // Add audit log
        const role = get().getRoleById(id);
        if (role) {
          get().addAuditLog({
            userId: 'current_user',
            userName: 'Current User',
            action: 'update',
            module: 'roles',
            details: `Updated role: ${role.name}`,
          });
        }
      },
      
      deleteRole: (id) => {
        const role = get().getRoleById(id);
        
        if (role?.isSystem) {
          throw new Error('Cannot delete system roles');
        }
        
        set((state) => ({
          roles: state.roles.filter((r) => r.id !== id),
        }));
        
        // Add audit log
        if (role) {
          get().addAuditLog({
            userId: 'current_user',
            userName: 'Current User',
            action: 'delete',
            module: 'roles',
            details: `Deleted role: ${role.name}`,
          });
        }
      },
      
      // Users actions
      setUsers: (users) => set({ users }),
      
      addUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: `user_${Date.now()}`,
          createdAt: new Date(),
        };
        
        set((state) => ({
          users: [...state.users, newUser],
        }));
        
        // Update role user count
        const role = get().getRoleById(userData.roleId);
        if (role) {
          get().updateRole(role.id, { userCount: role.userCount + 1 });
        }
        
        // Add audit log
        get().addAuditLog({
          userId: 'current_user',
          userName: 'Current User',
          action: 'create',
          module: 'users',
          details: `Added user: ${newUser.email}`,
        });
      },
      
      updateUser: (id, updates) => {
        const oldUser = get().users.find(u => u.id === id);
        
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updates } : user
          ),
        }));
        
        // Update role user counts if role changed
        if (updates.roleId && oldUser && oldUser.roleId !== updates.roleId) {
          const oldRole = get().getRoleById(oldUser.roleId);
          const newRole = get().getRoleById(updates.roleId);
          
          if (oldRole) {
            get().updateRole(oldRole.id, { userCount: Math.max(0, oldRole.userCount - 1) });
          }
          if (newRole) {
            get().updateRole(newRole.id, { userCount: newRole.userCount + 1 });
          }
        }
        
        // Add audit log
        if (oldUser) {
          get().addAuditLog({
            userId: 'current_user',
            userName: 'Current User',
            action: 'update',
            module: 'users',
            details: `Updated user: ${oldUser.email}`,
          });
        }
      },
      
      deleteUser: (id) => {
        const user = get().users.find(u => u.id === id);
        
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
        
        // Update role user count
        if (user) {
          const role = get().getRoleById(user.roleId);
          if (role) {
            get().updateRole(role.id, { userCount: Math.max(0, role.userCount - 1) });
          }
          
          // Add audit log
          get().addAuditLog({
            userId: 'current_user',
            userName: 'Current User',
            action: 'delete',
            module: 'users',
            details: `Deleted user: ${user.email}`,
          });
        }
      },
      
      inviteUser: (email, roleId) => {
        get().addUser({
          name: email.split('@')[0],
          email,
          roleId,
          status: 'invited',
        });
      },
      
      // Audit logs actions
      addAuditLog: (logData) => {
        const newLog: AuditLog = {
          ...logData,
          id: `log_${Date.now()}`,
          timestamp: new Date(),
        };
        
        set((state) => ({
          auditLogs: [newLog, ...state.auditLogs].slice(0, 1000), // Keep last 1000 logs
        }));
      },
      
      clearAuditLogs: () => set({ auditLogs: [] }),
      
      // Utility functions
      getRoleById: (id) => {
        return get().roles.find((role) => role.id === id);
      },
      
      getUsersByRole: (roleId) => {
        return get().users.filter((user) => user.roleId === roleId);
      },
      
      hasPermission: (userId, module, action) => {
        const user = get().users.find((u) => u.id === userId);
        if (!user) return false;
        
        const role = get().getRoleById(user.roleId);
        if (!role) return false;
        
        const permission = get().permissions.find(
          (p) => p.module === module && p.action === action
        );
        if (!permission) return false;
        
        return role.permissions.includes(permission.id);
      },
    }),
    {
      name: 'rbac-storage',
    }
  )
);
