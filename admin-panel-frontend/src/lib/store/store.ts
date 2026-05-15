import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface Workspace {
  id: string;
  name: string;
  type: string;
  logo?: string;
  status: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  workspace: Workspace | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setWorkspace: (workspace: Workspace | null) => void;
  logout: () => void;
}

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      workspace: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setWorkspace: (workspace) => set({ workspace }),
      logout: () => set({ user: null, token: null, workspace: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: 'light',
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage',
    }
  )
);
