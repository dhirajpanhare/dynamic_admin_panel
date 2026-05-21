import React from 'react';
import { Input } from '@/components/ui/input';
import type { FieldComponentProps } from '@/lib/registry/field-components';

/**
 * Date field. Stores value as ISO date string (yyyy-MM-dd).
 * Renders a native <input type="date"> for broad browser support.
 */
export const DateField: React.FC<FieldComponentProps> = ({
  value,
  onChange,
  error,
  label,
  required,
  disabled,
  readonly,
  min,
  max,
}) => {
  // Normalize value to yyyy-MM-dd for the date input
  const normalized = value
    ? typeof value === 'string'
      ? value.substring(0, 10)
      : new Date(value).toISOString().substring(0, 10)
    : '';

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}
      <Input
        type="date"
        value={normalized}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
        readOnly={readonly}
        min={min}
        max={max}
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default DateField;
