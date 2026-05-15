import { ComponentType } from 'react';

// Field component type
export interface FieldComponentProps {
  value: any;
  onChange: (value: any) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  [key: string]: any;
}

// Field component registry type
export type FieldComponentRegistry = Record<string, ComponentType<FieldComponentProps>>;

// Field component registry
// Components will be registered here as they are created
export const fieldComponents: FieldComponentRegistry = {};

/**
 * Register a field component
 */
export function registerFieldComponent(
  type: string,
  component: ComponentType<FieldComponentProps>
): void {
  fieldComponents[type] = component;
}

/**
 * Get field component by type
 */
export function getFieldComponent(type: string): ComponentType<FieldComponentProps> | undefined {
  return fieldComponents[type];
}

/**
 * Check if field component exists
 */
export function hasFieldComponent(type: string): boolean {
  return type in fieldComponents;
}

// Field type mappings
export const FIELD_TYPE_MAP = {
  text: 'text',
  email: 'text',
  password: 'text',
  url: 'text',
  textarea: 'textarea',
  number: 'number',
  select: 'select',
  'multi-select': 'multi-select',
  radio: 'radio',
  checkbox: 'checkbox',
  'checkbox-group': 'checkbox-group',
  switch: 'switch',
  date: 'date',
  datetime: 'datetime',
  'date-range': 'date-range',
  time: 'time',
  file: 'file',
  image: 'file',
  'rich-text': 'rich-text',
  json: 'json',
  color: 'color',
  slug: 'slug',
  relation: 'relation',
} as const;

export default fieldComponents;
