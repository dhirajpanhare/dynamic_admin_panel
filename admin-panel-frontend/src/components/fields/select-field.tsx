import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FieldComponentProps } from '@/lib/registry/field-components';

interface Option {
  label: string;
  value: string;
}

export const SelectField: React.FC<FieldComponentProps> = ({
  value,
  onChange,
  error,
  label,
  placeholder,
  required,
  disabled,
  options = [] as Option[],
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}
      <Select
        value={value ?? ''}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder={placeholder ?? 'Select an option'} />
        </SelectTrigger>
        <SelectContent>
          {(options as Option[]).map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default SelectField;
