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
  /** camelCase from backend: text|email|number|select|checkbox|date|... */
  fieldType: string;
  required: boolean;
  readonly?: boolean;
  defaultValue?: any;
  placeholder?: string;
  helpText?: string;
  validationRules?: Record<string, any>;
  options?: Array<{ label: string; value: string }>;
  relationConfig?: {
    entity: string;
    displayField: string;
    valueField: string;
  };
  conditionalVisibility?: {
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
  labelPlural: string;
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
    enableAudit: boolean;
    enableSoftDelete: boolean;
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
  /** camelCase from backend */
  defaultSortField?: string;
  defaultSortDirection?: 'asc' | 'desc';
  defaultPageSize?: number;
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
  type: string;
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
  /** camelCase from backend */
  dataSource?: Record<string, any>;
  refreshIntervalSeconds?: number;
}

export interface DashboardConfig {
  id: string;
  slug: string;
  name: string;
  widgets: DashboardWidget[];
}

export interface DashboardSummary {
  id: string;
  slug: string;
  name: string;
  isDefault: boolean;
}

// Metadata API methods
export const metadataApi = {
  getMenuItems: (): Promise<MenuItem[]> =>
    api.get<MenuItem[]>(API_CONFIG.endpoints.metadata.menus),

  getEntityConfig: (slug: string): Promise<EntityConfig> =>
    api.get<EntityConfig>(API_CONFIG.endpoints.metadata.entity(slug)),

  getDashboardConfig: (slug: string): Promise<DashboardConfig> =>
    api.get<DashboardConfig>(API_CONFIG.endpoints.metadata.dashboard(slug)),

  getDashboards: (): Promise<DashboardSummary[]> =>
    api.get<DashboardSummary[]>(API_CONFIG.endpoints.metadata.dashboards),

  getListViewConfig: (entity: string): Promise<ListViewConfig> =>
    api.get<ListViewConfig>(API_CONFIG.endpoints.metadata.listViewConfig(entity)),

  saveDashboard: (slug: string, data: { name: string; isDefault: boolean; widgets: DashboardWidget[] }): Promise<DashboardConfig> =>
    api.put<DashboardConfig>(API_CONFIG.endpoints.metadata.dashboard(slug), data),
};

export default metadataApi;
