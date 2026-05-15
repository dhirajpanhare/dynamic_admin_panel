import { ComponentType } from 'react';

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
