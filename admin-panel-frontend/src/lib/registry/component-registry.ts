import { ComponentType } from 'react';
import {
  fieldComponents,
  registerFieldComponent,
  getFieldComponent,
  hasFieldComponent,
  FieldComponentProps,
} from './field-components';
import {
  widgetComponents,
  registerWidgetComponent,
  getWidgetComponent,
  hasWidgetComponent,
  WidgetComponentProps,
} from './widget-components';
import {
  actionComponents,
  registerActionComponent,
  getActionComponent,
  hasActionComponent,
  ActionComponentProps,
} from './action-components';

/**
 * Central component registry
 */
export const componentRegistry = {
  // Field components
  fields: {
    registry: fieldComponents,
    register: registerFieldComponent,
    get: getFieldComponent,
    has: hasFieldComponent,
  },

  // Widget components
  widgets: {
    registry: widgetComponents,
    register: registerWidgetComponent,
    get: getWidgetComponent,
    has: hasWidgetComponent,
  },

  // Action components
  actions: {
    registry: actionComponents,
    register: registerActionComponent,
    get: getActionComponent,
    has: hasActionComponent,
  },
};

/**
 * Register multiple components at once
 */
export function registerComponents(components: {
  fields?: Record<string, ComponentType<FieldComponentProps>>;
  widgets?: Record<string, ComponentType<WidgetComponentProps>>;
  actions?: Record<string, ComponentType<ActionComponentProps>>;
}): void {
  if (components.fields) {
    Object.entries(components.fields).forEach(([type, component]) => {
      registerFieldComponent(type, component);
    });
  }

  if (components.widgets) {
    Object.entries(components.widgets).forEach(([type, component]) => {
      registerWidgetComponent(type, component);
    });
  }

  if (components.actions) {
    Object.entries(components.actions).forEach(([type, component]) => {
      registerActionComponent(type, component);
    });
  }
}

export default componentRegistry;
