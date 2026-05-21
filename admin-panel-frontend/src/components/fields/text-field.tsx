import React from 'react';
import { Input } from '@/components/ui/input';
import type { FieldComponentProps } from '@/lib/registry/field-components';

/**
 * Renders text / email / url / password inputs.
 * The `inputType` extra prop (passed via field metadata) controls the HTML type.
 */
export const TextField: React.FC<FieldComponentProps> = ({
  value,
  onChange,
  error,
  label,
  placeholder,
  required,
  disabled,
  readonly,
  inputType = 'text',
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
        type={inputType}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readonly}
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default TextField;
