import React from 'react';
import { Input } from '@/components/ui/input';
import type { FieldComponentProps } from '@/lib/registry/field-components';

export const NumberField: React.FC<FieldComponentProps> = ({
  value,
  onChange,
  error,
  label,
  placeholder,
  required,
  disabled,
  readonly,
  min,
  max,
  step,
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}
      <Input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readonly}
        min={min}
        max={max}
        step={step}
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default NumberField;
