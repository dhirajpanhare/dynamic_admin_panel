import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Mail, MoreVertical, Trash2, Shield, X } from 'lucide-react';
import type { WorkspaceMember } from '@/lib/store';
import { useWorkspaceStore } from '@/lib/store';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const WorkspaceMembersPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { workspaces, members, addMember, removeMember, updateMember } = useWorkspaceStore();
  const workspace = workspaces.find((w) => w.id === workspaceId);
  const workspaceMembers = members[workspaceId || ''] || [];

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceMember['role']>('member');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Initialize with sample members if empty
  React.useEffect(() => {
    if (workspaceId && workspaceMembers.length === 0) {
      const sampleMembers: WorkspaceMember[] = [
        {
          id: '1',
          userId: 'user-1',
          workspaceId,
          name: 'John Doe',
          email: 'john@example.com',
          avatar: undefined,
          role: 'owner',
          status: 'active',
          joinedAt: new Date('2024-01-15'),
          lastActive: new Date(),
        },
        {
          id: '2',
          userId: 'user-2',
          workspaceId,
          name: 'Jane Smith',
          email: 'jane@example.com',
          avatar: undefined,
          role: 'admin',
          status: 'active',
          joinedAt: new Date('2024-02-01'),
          lastActive: new Date('2024-03-19'),
        },
        {
          id: '3',
          userId: 'user-3',
          workspaceId,
          name: 'Bob Johnson',
          email: 'bob@example.com',
          avatar: undefined,
          role: 'member',
          status: 'invited',
          joinedAt: new Date('2024-03-10'),
        },
      ];

      useWorkspaceStore.getState().setMembers(workspaceId, sampleMembers);
    }
  }, [workspaceId]);

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!workspaceId) return;

    const newMember: WorkspaceMember = {
      id: uuidv4(),
      userId: uuidv4(),
      workspaceId,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'invited',
      joinedAt: new Date(),
    };

    addMember(workspaceId, newMember);
    toast.success(`Invitation sent to ${inviteEmail}`);
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('member');
  };

  const handleRemoveMember = (memberId: string) => {
    if (!workspaceId) return;
    if (confirm('Are you sure you want to remove this member?')) {
      removeMember(workspaceId, memberId);
      toast.success('Member removed successfully');
    }
  };

  const handleChangeRole = (memberId: string, newRole: WorkspaceMember['role']) => {
    if (!workspaceId) return;
    updateMember(workspaceId, memberId, { role: newRole });
    toast.success('Member role updated');
    setSelectedMember(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const roleColors = {
    owner: 'default',
    admin: 'default',
    member: 'secondary',
    viewer: 'secondary',
  } as const;

  const statusColors = {
    active: 'success',
    invited: 'warning',
    suspended: 'destructive',
  } as const;

  if (!workspace) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Workspace not found</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{workspace.name} - Members</h1>
            <p className="text-muted-foreground mt-2">
              Manage team members and their permissions
            </p>
          </div>
          <Button onClick={() => setShowInviteModal(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </div>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members ({workspaceMembers.length})</CardTitle>
            <CardDescription>
              People who have access to this workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workspaceMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.name}</p>
                        <Badge variant={roleColors[member.role]}>
                          {member.role}
                        </Badge>
                        <Badge variant={statusColors[member.status]}>
                          {member.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {formatDate(member.joinedAt)}
                        {member.lastActive && ` • Last active ${formatDate(member.lastActive)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {member.status === 'invited' && (
                      <Button variant="outline" size="sm">
                        <Mail className="mr-2 h-4 w-4" />
                        Resend
                      </Button>
                    )}

                    {member.role !== 'owner' && (
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setSelectedMember(selectedMember === member.id ? null : member.id)
                          }
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>

                        {selectedMember === member.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setSelectedMember(null)}
                            />
                            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border bg-card p-2 shadow-lg">
                              <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                Change Role
                              </div>
                              {(['admin', 'member', 'viewer'] as const).map((role) => (
                                <button
                                  key={role}
                                  onClick={() => handleChangeRole(member.id, role)}
                                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent capitalize"
                                >
                                  <Shield className="h-4 w-4" />
                                  {role}
                                </button>
                              ))}
                              <div className="my-1 border-t" />
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                                Remove
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowInviteModal(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Invite Team Member</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInviteModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Send an invitation to join this workspace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as WorkspaceMember['role'])}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="admin">Admin - Full access</option>
                    <option value="member">Member - Standard access</option>
                    <option value="viewer">Viewer - Read-only access</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInvite}>Send Invitation</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </PageContainer>
  );
};

export default WorkspaceMembersPage;
