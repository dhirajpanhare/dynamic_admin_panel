import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  UserPlus,
  Shield,
  Check,
  X,
  Clock,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Pending';
  avatar?: string;
  lastActive: string;
}

interface Permission {
  module: string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
    lastActive: '2 hours ago',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Editor',
    status: 'Active',
    lastActive: '5 minutes ago',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Viewer',
    status: 'Inactive',
    lastActive: '2 days ago',
  },
  {
    id: '4',
    name: 'Alice Williams',
    email: 'alice@example.com',
    role: 'Editor',
    status: 'Pending',
    lastActive: 'Never',
  },
];

const mockPermissions: Permission[] = [
  { module: 'Dashboard', read: true, write: true, delete: false },
  { module: 'Products', read: true, write: true, delete: true },
  { module: 'Users', read: true, write: false, delete: false },
  { module: 'Settings', read: true, write: true, delete: false },
  { module: 'Reports', read: true, write: false, delete: false },
  { module: 'Workflows', read: true, write: true, delete: true },
];

const mockAuditLogs = [
  {
    id: '1',
    user: 'John Doe',
    action: 'Updated product "Wireless Headphones"',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    user: 'Jane Smith',
    action: 'Created new user "Alice Williams"',
    timestamp: '5 hours ago',
  },
  {
    id: '3',
    user: 'John Doe',
    action: 'Deleted workflow "Email Campaign"',
    timestamp: '1 day ago',
  },
  {
    id: '4',
    user: 'Bob Johnson',
    action: 'Exported products report',
    timestamp: '2 days ago',
  },
];

export function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Users & RBAC Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Users List */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Users</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-3">
            {mockUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-slate-900">{user.name}</div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{user.role}</Badge>
                  <Badge
                    variant={
                      user.status === 'Active'
                        ? 'default'
                        : user.status === 'Pending'
                        ? 'secondary'
                        : 'outline'
                    }
                    className={
                      user.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : undefined
                    }
                  >
                    {user.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Clock className="h-4 w-4" />
                    {user.lastActive}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              User Stats
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Total Users</span>
                  <span className="text-2xl font-semibold text-slate-900">
                    {mockUsers.length}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Active</span>
                  <span className="text-lg font-semibold text-green-600">
                    {mockUsers.filter((u) => u.status === 'Active').length}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Pending</span>
                  <span className="text-lg font-semibold text-orange-600">
                    {mockUsers.filter((u) => u.status === 'Pending').length}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Roles
            </h3>
            <div className="space-y-2">
              {['Admin', 'Editor', 'Viewer'].map((role) => (
                <div
                  key={role}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-slate-900">
                      {role}
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {mockUsers.filter((u) => u.role === role).length}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Permission Matrix */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">
          Permission Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Module
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-700">
                  Read
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-700">
                  Write
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-700">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {mockPermissions.map((permission) => (
                <tr key={permission.module} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {permission.module}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {permission.read ? (
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {permission.write ? (
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {permission.delete ? (
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-slate-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Audit Logs */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">
          Activity Logs
        </h3>
        <div className="space-y-4">
          {mockAuditLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-4 pb-4 border-b border-slate-200 last:border-0 last:pb-0"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-900">
                  <span className="font-medium">{log.user}</span> {log.action}
                </p>
                <p className="text-xs text-slate-500 mt-1">{log.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
