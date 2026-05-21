import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
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

export const MultiSelectField: React.FC<FieldComponentProps> = ({
  value,
  onChange,
  error,
  label,
  placeholder,
  required,
  disabled,
  options = [] as Option[],
}) => {
  const selected: string[] = Array.isArray(value) ? value : [];

  const handleAdd = (val: string) => {
    if (!selected.includes(val)) {
      onChange([...selected, val]);
    }
  };

  const handleRemove = (val: string) => {
    onChange(selected.filter((v) => v !== val));
  };

  const available = (options as Option[]).filter((o) => !selected.includes(o.value));

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}

      {/* Selected items */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {selected.map((val) => {
            const opt = (options as Option[]).find((o) => o.value === val);
            return (
              <Badge key={val} variant="secondary" className="gap-1 pr-1">
                {opt?.label ?? val}
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemove(val)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Add selector */}
      {available.length > 0 && !disabled && (
        <Select onValueChange={handleAdd} disabled={disabled}>
          <SelectTrigger className={error ? 'border-destructive' : ''}>
            <SelectValue placeholder={placeholder ?? 'Add option…'} />
          </SelectTrigger>
          <SelectContent>
            {available.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default MultiSelectField;
