import React from 'react';
import type { FieldComponentProps } from '@/lib/registry/field-components';

export const TextareaField: React.FC<FieldComponentProps> = ({
  value,
  onChange,
  error,
  label,
  placeholder,
  required,
  disabled,
  readonly,
  rows = 4,
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readonly}
        rows={rows}
        className={[
          'flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background',
          'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y',
          error ? 'border-destructive' : 'border-input',
        ].join(' ')}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default TextareaField;
