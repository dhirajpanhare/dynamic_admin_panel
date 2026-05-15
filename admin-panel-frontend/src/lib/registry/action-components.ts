import { ComponentType } from 'react';

// Action component props
export interface ActionComponentProps {
  action: {
    id: string;
    label: string;
    icon?: string;
    type: 'single' | 'bulk';
    permission?: string;
    config?: Record<string, any>;
  };
  entitySlug: string;
  recordId?: string | number;
  recordIds?: (string | number)[];
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  [key: string]: any;
}

// Action component registry type
export type ActionComponentRegistry = Record<string, ComponentType<ActionComponentProps>>;

// Action component registry
export const actionComponents: ActionComponentRegistry = {};

/**
 * Register an action component
 */
export function registerActionComponent(
  type: string,
  component: ComponentType<ActionComponentProps>
): void {
  actionComponents[type] = component;
}

/**
 * Get action component by type
 */
export function getActionComponent(
  type: string
): ComponentType<ActionComponentProps> | undefined {
  return actionComponents[type];
}

/**
 * Check if action component exists
 */
export function hasActionComponent(type: string): boolean {
  return type in actionComponents;
}

// Action type mappings
export const ACTION_TYPE_MAP = {
  edit: 'edit',
  delete: 'delete',
  view: 'view',
  duplicate: 'duplicate',
  export: 'export',
  approve: 'approve',
  reject: 'reject',
  archive: 'archive',
  restore: 'restore',
  custom: 'custom',
} as const;

export default actionComponents;
