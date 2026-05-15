import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentItem {
  id: string;
  entity: string;
  title: string;
  path: string;
  timestamp: number;
}

export interface TablePreference {
  entity: string;
  visibleColumns: string[];
  columnOrder: string[];
  pageSize: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

interface UserState {
  // Recent items
  recentItems: RecentItem[];
  
  // Table preferences
  tablePreferences: Record<string, TablePreference>;
  
  // User preferences
  preferences: {
    language: string;
    dateFormat: string;
    timeFormat: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
  };
  
  // Actions
  addRecentItem: (item: Omit<RecentItem, 'timestamp'>) => void;
  clearRecentItems: () => void;
  setTablePreference: (entity: string, preference: Partial<TablePreference>) => void;
  getTablePreference: (entity: string) => TablePreference | undefined;
  updatePreferences: (preferences: Partial<UserState['preferences']>) => void;
}

const MAX_RECENT_ITEMS = 10;

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      recentItems: [],
      tablePreferences: {},
      preferences: {
        language: 'en',
        dateFormat: 'MMM dd, yyyy',
        timeFormat: '12h',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
          inApp: true,
        },
      },

      // Actions
      addRecentItem: (item) =>
        set((state) => {
          // Remove duplicate if exists
          const filtered = state.recentItems.filter(
            (i) => !(i.entity === item.entity && i.id === item.id)
          );

          // Add new item at the beginning
          const newItems = [
            { ...item, timestamp: Date.now() },
            ...filtered,
          ].slice(0, MAX_RECENT_ITEMS);

          return { recentItems: newItems };
        }),

      clearRecentItems: () => set({ recentItems: [] }),

      setTablePreference: (entity, preference) =>
        set((state) => ({
          tablePreferences: {
            ...state.tablePreferences,
            [entity]: {
              ...state.tablePreferences[entity],
              entity,
              ...preference,
            },
          },
        })),

      getTablePreference: (entity) => get().tablePreferences[entity],

      updatePreferences: (preferences) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...preferences,
          },
        })),
    }),
    {
      name: 'user-storage',
    }
  )
);
