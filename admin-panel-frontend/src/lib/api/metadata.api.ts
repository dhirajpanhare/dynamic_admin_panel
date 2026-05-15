import { api } from './client';
import { API_CONFIG } from '@/config/api.config';

// Types for metadata responses
export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  permission?: string;
  order: number;
}

export interface EntityField {
  id: string;
  name: string;
  label: string;
  field_type: string;
  required: boolean;
  default_value?: any;
  placeholder?: string;
  help_text?: string;
  validation?: Record<string, any>;
  options?: Array<{ label: string; value: string }>;
  relation?: {
    entity: string;
    display_field: string;
    value_field: string;
  };
  conditional?: {
    field: string;
    operator: string;
    value: any;
  };
  order: number;
}

export interface EntityConfig {
  id: string;
  name: string;
  slug: string;
  label: string;
  label_plural: string;
  icon?: string;
  description?: string;
  fields: EntityField[];
  permissions: {
    create: string;
    read: string;
    update: string;
    delete: string;
  };
  settings?: {
    enable_audit: boolean;
    enable_soft_delete: boolean;
    enable_versioning: boolean;
  };
}

export interface ListViewColumn {
  field: string;
  label: string;
  sortable: boolean;
  filterable: boolean;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: string;
}

export interface ListViewConfig {
  entity: string;
  columns: ListViewColumn[];
  default_sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  filters?: Array<{
    field: string;
    type: string;
    label: string;
    options?: any[];
  }>;
  actions?: Array<{
    id: string;
    label: string;
    icon?: string;
    type: 'single' | 'bulk';
    permission?: string;
  }>;
}

export interface PageConfig {
  id: string;
  slug: string;
  title: string;
  page_type: 'list' | 'create' | 'edit' | 'detail' | 'dashboard' | 'custom';
  entity?: string;
  layout?: any;
  sections?: any[];
  permissions?: string[];
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'custom';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
  data_source?: {
    entity?: string;
    endpoint?: string;
    params?: Record<string, any>;
  };
  refresh_interval?: number;
}

export interface DashboardConfig {
  id: string;
  slug: string;
  title: string;
  description?: string;
  widgets: DashboardWidget[];
  layout: 'grid' | 'flex';
  permissions?: string[];
}

// Metadata API methods
export const metadataApi = {
  /**
   * Get menu items for navigation
   */
  getMenuItems: async (): Promise<MenuItem[]> => {
    return api.get<MenuItem[]>(API_CONFIG.endpoints.metadata.menus);
  },

  /**
   * Get entity configuration by slug
   */
  getEntityConfig: async (slug: string): Promise<EntityConfig> => {
    return api.get<EntityConfig>(API_CONFIG.endpoints.metadata.entity(slug));
  },

  /**
   * Get page configuration by slug
   */
  getPageConfig: async (slug: string): Promise<PageConfig> => {
    return api.get<PageConfig>(API_CONFIG.endpoints.metadata.page(slug));
  },

  /**
   * Get dashboard configuration by slug
   */
  getDashboardConfig: async (slug: string): Promise<DashboardConfig> => {
    return api.get<DashboardConfig>(API_CONFIG.endpoints.metadata.dashboard(slug));
  },

  /**
   * Get list view configuration for entity
   */
  getListViewConfig: async (entity: string): Promise<ListViewConfig> => {
    return api.get<ListViewConfig>(API_CONFIG.endpoints.metadata.listViewConfig(entity));
  },
};

export default metadataApi;
