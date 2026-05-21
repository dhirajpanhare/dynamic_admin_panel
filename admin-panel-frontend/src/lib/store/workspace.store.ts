import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  organizationType: 'enterprise' | 'startup' | 'personal' | 'non-profit' | 'education';
  industry?: string;
  location?: {
    country: string;
    city: string;
  };
  contact?: {
    email: string;
    phone?: string;
    website?: string;
  };
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'trial';
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'invited' | 'suspended';
  joinedAt: Date;
  lastActive?: Date;
}

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  members: Record<string, WorkspaceMember[]>;
  
  // Actions
  setWorkspaces: (workspaces: Workspace[]) => void;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  
  // Member actions
  setMembers: (workspaceId: string, members: WorkspaceMember[]) => void;
  addMember: (workspaceId: string, member: WorkspaceMember) => void;
  updateMember: (workspaceId: string, memberId: string, updates: Partial<WorkspaceMember>) => void;
  removeMember: (workspaceId: string, memberId: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      currentWorkspace: null,
      members: {},

      setWorkspaces: (workspaces) => set({ workspaces }),

      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

      addWorkspace: (workspace) =>
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
        })),

      updateWorkspace: (id, updates) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === id ? { ...w, ...updates, updatedAt: new Date() } : w
          ),
          currentWorkspace:
            state.currentWorkspace?.id === id
              ? { ...state.currentWorkspace, ...updates, updatedAt: new Date() }
              : state.currentWorkspace,
        })),

      deleteWorkspace: (id) =>
        set((state) => ({
          workspaces: state.workspaces.filter((w) => w.id !== id),
          currentWorkspace: state.currentWorkspace?.id === id ? null : state.currentWorkspace,
        })),

      setMembers: (workspaceId, members) =>
        set((state) => ({
          members: { ...state.members, [workspaceId]: members },
        })),

      addMember: (workspaceId, member) =>
        set((state) => ({
          members: {
            ...state.members,
            [workspaceId]: [...(state.members[workspaceId] || []), member],
          },
        })),

      updateMember: (workspaceId, memberId, updates) =>
        set((state) => ({
          members: {
            ...state.members,
            [workspaceId]: (state.members[workspaceId] || []).map((m) =>
              m.id === memberId ? { ...m, ...updates } : m
            ),
          },
        })),

      removeMember: (workspaceId, memberId) =>
        set((state) => ({
          members: {
            ...state.members,
            [workspaceId]: (state.members[workspaceId] || []).filter((m) => m.id !== memberId),
          },
        })),
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({
        workspaces: state.workspaces,
        currentWorkspace: state.currentWorkspace,
      }),
    }
  )
);
