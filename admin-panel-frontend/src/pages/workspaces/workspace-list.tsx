import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WorkspaceCard } from '@/components/workspace/workspace-card';
import { CreateWorkspaceModal } from '@/components/workspace/create-workspace-modal';
import { Plus, Search, Filter, Grid, List as ListIcon } from 'lucide-react';
import type { Workspace } from '@/lib/store';
import { useWorkspaceStore } from '@/lib/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const WorkspaceListPage: React.FC = () => {
  const navigate = useNavigate();
  const { workspaces, deleteWorkspace, setCurrentWorkspace } = useWorkspaceStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editWorkspace, setEditWorkspace] = useState<Workspace | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'trial'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'pro' | 'enterprise'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Initialize with sample data if empty
  useEffect(() => {
    if (workspaces.length === 0) {
      // Add sample workspaces for demo
      const sampleWorkspaces: Workspace[] = [
        {
          id: '1',
          name: 'Acme Corporation',
          slug: 'acme-corp',
          description: 'Leading provider of innovative solutions',
          organizationType: 'enterprise',
          industry: 'Technology',
          plan: 'enterprise',
          status: 'active',
          memberCount: 45,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-03-20'),
        },
        {
          id: '2',
          name: 'Startup Inc',
          slug: 'startup-inc',
          description: 'Fast-growing startup disrupting the market',
          organizationType: 'startup',
          industry: 'SaaS',
          plan: 'pro',
          status: 'active',
          memberCount: 12,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-03-19'),
        },
        {
          id: '3',
          name: 'Personal Projects',
          slug: 'personal-projects',
          description: 'My personal workspace for side projects',
          organizationType: 'personal',
          plan: 'free',
          status: 'trial',
          memberCount: 1,
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date('2024-03-15'),
        },
      ];
      
      sampleWorkspaces.forEach((ws) => {
        useWorkspaceStore.getState().addWorkspace(ws);
      });
    }
  }, []);

  const filteredWorkspaces = workspaces.filter((workspace) => {
    const matchesSearch =
      workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workspace.status === statusFilter;
    const matchesPlan = planFilter === 'all' || workspace.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleEdit = (workspace: Workspace) => {
    setEditWorkspace(workspace);
    setShowCreateModal(true);
  };

  const handleDelete = (workspace: Workspace) => {
    if (confirm(`Are you sure you want to delete "${workspace.name}"?`)) {
      deleteWorkspace(workspace.id);
      toast.success('Workspace deleted successfully');
    }
  };

  const handleSettings = (workspace: Workspace) => {
    navigate(`/admin/workspaces/${workspace.id}/settings`);
  };

  const handleSelect = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    navigate(`/admin/workspaces/${workspace.id}`);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditWorkspace(null);
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Workspaces</h1>
            <p className="text-muted-foreground mt-2">
              Manage your workspaces and team collaboration
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Workspace
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workspaces..."
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && 'bg-accent')}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>

            <div className="flex rounded-lg border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'rounded-r-none',
                  viewMode === 'grid' && 'bg-accent'
                )}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(
                  'rounded-l-none border-l',
                  viewMode === 'list' && 'bg-accent'
                )}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex gap-4 p-4 rounded-lg border bg-muted/50">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Plan</label>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter('all');
                  setPlanFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Workspace Grid/List */}
        {filteredWorkspaces.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No workspaces found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all' || planFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first workspace'}
            </p>
            {!searchQuery && statusFilter === 'all' && planFilter === 'all' && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Workspace
              </Button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            )}
          >
            {filteredWorkspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSettings={handleSettings}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        editWorkspace={editWorkspace}
      />
    </PageContainer>
  );
};

export default WorkspaceListPage;
