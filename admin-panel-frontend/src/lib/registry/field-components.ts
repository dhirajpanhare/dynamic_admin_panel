import { ComponentType } from 'react';
import { TextField } from '@/components/fields/text-field';
import { NumberField } from '@/components/fields/number-field';
import { TextareaField } from '@/components/fields/textarea-field';
import { SelectField } from '@/components/fields/select-field';
import { MultiSelectField } from '@/components/fields/multi-select-field';
import { CheckboxField } from '@/components/fields/checkbox-field';
import { DateField } from '@/components/fields/date-field';
import { FileField } from '@/components/fields/file-field';
import { RichTextField } from '@/components/fields/rich-text-field';
import { RelationField } from '@/components/fields/relation-field';

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

// ─── Register built-in field components ───────────────────────────────────────
// text / email / url / password — all share the TextField renderer
fieldComponents['text'] = TextField as ComponentType<FieldComponentProps>;
fieldComponents['email'] = TextField as ComponentType<FieldComponentProps>;
fieldComponents['url'] = TextField as ComponentType<FieldComponentProps>;
fieldComponents['password'] = TextField as ComponentType<FieldComponentProps>;
fieldComponents['slug'] = TextField as ComponentType<FieldComponentProps>;
fieldComponents['color'] = TextField as ComponentType<FieldComponentProps>;

fieldComponents['number'] = NumberField as ComponentType<FieldComponentProps>;
fieldComponents['textarea'] = TextareaField as ComponentType<FieldComponentProps>;
fieldComponents['json'] = TextareaField as ComponentType<FieldComponentProps>;

fieldComponents['select'] = SelectField as ComponentType<FieldComponentProps>;
fieldComponents['radio'] = SelectField as ComponentType<FieldComponentProps>;

fieldComponents['multi-select'] = MultiSelectField as ComponentType<FieldComponentProps>;
fieldComponents['checkbox-group'] = MultiSelectField as ComponentType<FieldComponentProps>;

fieldComponents['checkbox'] = CheckboxField as ComponentType<FieldComponentProps>;
fieldComponents['switch'] = CheckboxField as ComponentType<FieldComponentProps>;

fieldComponents['date'] = DateField as ComponentType<FieldComponentProps>;
fieldComponents['datetime'] = DateField as ComponentType<FieldComponentProps>;
fieldComponents['date-range'] = DateField as ComponentType<FieldComponentProps>;
fieldComponents['time'] = DateField as ComponentType<FieldComponentProps>;

fieldComponents['file'] = FileField as ComponentType<FieldComponentProps>;
fieldComponents['image'] = FileField as ComponentType<FieldComponentProps>;

fieldComponents['rich-text'] = RichTextField as ComponentType<FieldComponentProps>;

fieldComponents['relation'] = RelationField as ComponentType<FieldComponentProps>;

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
