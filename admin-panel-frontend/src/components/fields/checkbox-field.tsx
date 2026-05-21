import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import type { FieldComponentProps } from '@/lib/registry/field-components';

export const CheckboxField: React.FC<FieldComponentProps> = ({
  value,
  onChange,
  error,
  label,
  required,
  disabled,
  helpText,
}) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Checkbox
          id={label}
          checked={!!value}
          onCheckedChange={(checked) => onChange(!!checked)}
          disabled={disabled}
          className={error ? 'border-destructive' : ''}
        />
        {label && (
          <label
            htmlFor={label}
            className="text-sm font-medium text-foreground cursor-pointer select-none"
          >
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}
      </div>
      {helpText && <p className="text-xs text-muted-foreground pl-6">{helpText}</p>}
      {error && <p className="text-xs text-destructive pl-6">{error}</p>}
    </div>
  );
};

export default CheckboxField;
