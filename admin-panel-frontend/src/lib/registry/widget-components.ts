import { ComponentType } from 'react';
import { StatWidget } from '@/components/widgets/stat-widget';
import { ChartWidgetDynamic } from '@/components/widgets/chart-widget-dynamic';

// Widget component props
export interface WidgetComponentProps {
  config: Record<string, any>;
  data?: any;
  isLoading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  [key: string]: any;
}

// Widget component registry type
export type WidgetComponentRegistry = Record<string, ComponentType<WidgetComponentProps>>;

// Widget component registry
export const widgetComponents: WidgetComponentRegistry = {};

// ─── Register built-in widget components ─────────────────────────────────────
widgetComponents['metric'] = StatWidget as ComponentType<WidgetComponentProps>;
widgetComponents['stat'] = StatWidget as ComponentType<WidgetComponentProps>;
widgetComponents['chart'] = ChartWidgetDynamic as ComponentType<WidgetComponentProps>;
widgetComponents['line-chart'] = ChartWidgetDynamic as ComponentType<WidgetComponentProps>;
widgetComponents['bar-chart'] = ChartWidgetDynamic as ComponentType<WidgetComponentProps>;
widgetComponents['pie-chart'] = ChartWidgetDynamic as ComponentType<WidgetComponentProps>;

/**
 * Register a widget component
 */
export function registerWidgetComponent(
  type: string,
  component: ComponentType<WidgetComponentProps>
): void {
  widgetComponents[type] = component;
}

/**
 * Get widget component by type
 */
export function getWidgetComponent(
  type: string
): ComponentType<WidgetComponentProps> | undefined {
  return widgetComponents[type];
}

/**
 * Check if widget component exists
 */
export function hasWidgetComponent(type: string): boolean {
  return type in widgetComponents;
}

// Widget type mappings
export const WIDGET_TYPE_MAP = {
  chart: 'chart',
  metric: 'metric',
  table: 'table',
  list: 'list',
  custom: 'custom',
  html: 'custom',
  iframe: 'custom',
} as const;

export default widgetComponents;
