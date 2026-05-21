import { useState } from 'react';
import { Search, UserPlus, MoreVertical, Mail, Trash2, Edit, Ban } from 'lucide-react';
import { useRBACStore } from '@/lib/store';
import type { User } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { InviteUserModal } from './invite-user-modal';
import { PageContainer } from '@/components/layout';
import { formatDistanceToNow } from 'date-fns';
import { useUsers, useDeleteUser } from '@/lib/hooks/use-rbac';

export function UserManagementPage() {
  const { users: storeUsers, roles, deleteUser: storeDeleteUser, updateUser, getRoleById } = useRBACStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const { data: apiUsersResponse } = useUsers({ search: searchQuery });
  const deleteUserMutation = useDeleteUser();

  // Use API data if available, otherwise fall back to store
  const users: User[] = apiUsersResponse
    ? (apiUsersResponse.items as unknown as User[])
    : storeUsers;

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || (user as any).roleId === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleDeleteUser = async (user: User) => {
    const confirm = window.confirm(
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`
    );
    if (!confirm) return;

    try {
      if (apiUsersResponse) {
        await deleteUserMutation.mutateAsync(user.id);
      } else {
        storeDeleteUser(user.id);
        toast.success(`User "${user.name}" deleted successfully`);
      }
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleSuspendUser = (user: User) => {
    try {
      updateUser(user.id, {
        status: user.status === 'suspended' ? 'active' : 'suspended',
      });
      toast.success(
        user.status === 'suspended'
          ? `User "${user.name}" activated`
          : `User "${user.name}" suspended`
      );
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleResendInvite = (user: User) => {
    toast.success(`Invitation resent to ${user.email}`);
  };

  const handleChangeRole = (user: User, newRoleId: string) => {
    try {
      updateUser(user.id, { roleId: newRoleId });
      const newRole = getRoleById(newRoleId);
      toast.success(`User role changed to ${newRole?.name}`);
    } catch (error) {
      toast.error('Failed to change user role');
    }
  };

  const activeUsers = users.filter((u) => u.status === 'active').length;
  const invitedUsers = users.filter((u) => u.status === 'invited').length;
  const suspendedUsers = users.filter((u) => u.status === 'suspended').length;

  return (
    <PageContainer
      title="User Management"
      description="Manage users and their roles"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invited</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{invitedUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{suspendedUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </div>
              <Button onClick={() => setIsInviteModalOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            <div className="border rounded-lg">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">User</th>
                    <th className="text-left p-3 text-sm font-medium">Role</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">Last Active</th>
                    <th className="text-right p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((user) => {
                    const role = getRoleById(user.roleId);
                    return (
                      <tr key={user.id} className="hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="bg-primary text-white text-sm">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary">{role?.name || 'Unknown'}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={
                              user.status === 'active'
                                ? 'default'
                                : user.status === 'invited'
                                ? 'secondary'
                                : 'outline'
                            }
                            className={
                              user.status === 'active'
                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                : user.status === 'suspended'
                                ? 'bg-red-100 text-red-700 hover:bg-red-100'
                                : ''
                            }
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {user.lastLogin
                            ? formatDistanceToNow(user.lastLogin, { addSuffix: true })
                            : 'Never'}
                        </td>
                        <td className="p-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              
                              {user.status === 'invited' && (
                                <DropdownMenuItem onClick={() => handleResendInvite(user)}>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Resend Invite
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuItem onClick={() => handleSuspendUser(user)}>
                                <Ban className="h-4 w-4 mr-2" />
                                {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite User Modal */}
      <InviteUserModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </PageContainer>
  );
}
