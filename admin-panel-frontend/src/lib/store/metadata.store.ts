import { create } from 'zustand';
import type { EntityConfig, MenuItem, PageConfig, DashboardConfig } from '@/lib/api/metadata.api';

interface MetadataState {
  // Cached data
  menus: MenuItem[] | null;
  entityConfigs: Record<string, EntityConfig>;
  pageConfigs: Record<string, PageConfig>;
  dashboardConfigs: Record<string, DashboardConfig>;
  
  // Loading states
  menusLoading: boolean;
  
  // Actions
  setMenus: (menus: MenuItem[]) => void;
  setEntityConfig: (slug: string, config: EntityConfig) => void;
  getEntityConfig: (slug: string) => EntityConfig | undefined;
  setPageConfig: (slug: string, config: PageConfig) => void;
  getPageConfig: (slug: string) => PageConfig | undefined;
  setDashboardConfig: (slug: string, config: DashboardConfig) => void;
  getDashboardConfig: (slug: string) => DashboardConfig | undefined;
  setMenusLoading: (loading: boolean) => void;
  clearCache: () => void;
  clearEntityCache: (slug: string) => void;
}

export const useMetadataStore = create<MetadataState>((set, get) => ({
  // Initial state
  menus: null,
  entityConfigs: {},
  pageConfigs: {},
  dashboardConfigs: {},
  menusLoading: false,

  // Actions
  setMenus: (menus) => set({ menus }),

  setEntityConfig: (slug, config) =>
    set((state) => ({
      entityConfigs: { ...state.entityConfigs, [slug]: config },
    })),

  getEntityConfig: (slug) => get().entityConfigs[slug],

  setPageConfig: (slug, config) =>
    set((state) => ({
      pageConfigs: { ...state.pageConfigs, [slug]: config },
    })),

  getPageConfig: (slug) => get().pageConfigs[slug],

  setDashboardConfig: (slug, config) =>
    set((state) => ({
      dashboardConfigs: { ...state.dashboardConfigs, [slug]: config },
    })),

  getDashboardConfig: (slug) => get().dashboardConfigs[slug],

  setMenusLoading: (loading) => set({ menusLoading: loading }),

  clearCache: () =>
    set({
      menus: null,
      entityConfigs: {},
      pageConfigs: {},
      dashboardConfigs: {},
    }),

  clearEntityCache: (slug) =>
    set((state) => {
      const { [slug]: _, ...rest } = state.entityConfigs;
      return { entityConfigs: rest };
    }),
}));
