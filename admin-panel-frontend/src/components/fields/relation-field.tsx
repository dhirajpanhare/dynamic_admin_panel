import React, { useState, useEffect, useCallback } from 'react';
import { dynamicApi } from '@/lib/api/dynamic.api';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';
import type { FieldComponentProps } from '@/lib/registry/field-components';

interface RelationItem {
  id: string | number;
  label: string;
}

/**
 * Async relation/lookup field.
 * Searches against a related entity via dynamicApi.getList().
 *
 * Extra props from field metadata:
 *   - relationEntity: string  — entity slug to search against
 *   - displayField: string    — field name to use as label
 *   - valueField: string      — field name to use as value (default: 'id')
 *   - multiple: boolean       — allow multiple selections
 */
export const RelationField: React.FC<FieldComponentProps> = ({
  value,
  onChange,
  error,
  label,
  placeholder,
  required,
  disabled,
  relationEntity,
  displayField = 'name',
  valueField = 'id',
  multiple = false,
}) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<RelationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const selected: RelationItem[] = Array.isArray(value)
    ? value
    : value
    ? [value]
    : [];

  const fetchResults = useCallback(
    async (query: string) => {
      if (!relationEntity) return;
      setIsLoading(true);
      try {
        const res = await dynamicApi.getList(relationEntity, {
          search: query,
          perPage: 10,
        });
        setResults(
          res.items.map((item: any) => ({
            id: item[valueField],
            label: item[displayField] ?? String(item[valueField]),
          }))
        );
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [relationEntity, valueField, displayField]
  );

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => fetchResults(search), 300);
    return () => clearTimeout(timer);
  }, [search, isOpen, fetchResults]);

  const handleSelect = (item: RelationItem) => {
    if (multiple) {
      const already = selected.find((s) => s.id === item.id);
      if (!already) onChange([...selected, item]);
    } else {
      onChange(item);
      setIsOpen(false);
      setSearch('');
    }
  };

  const handleRemove = (id: string | number) => {
    if (multiple) {
      onChange(selected.filter((s) => s.id !== id));
    } else {
      onChange(null);
    }
  };

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
          {selected.map((item) => (
            <Badge key={item.id} variant="secondary" className="gap-1 pr-1">
              {item.label}
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleRemove(item.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
      {(!multiple || selected.length === 0 || multiple) && !disabled && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              setIsOpen(true);
              fetchResults(search);
            }}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            placeholder={placeholder ?? 'Search…'}
            className={`pl-9 ${error ? 'border-destructive' : ''}`}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}

          {/* Dropdown */}
          {isOpen && results.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="flex w-full items-center px-3 py-2 text-sm hover:bg-accent cursor-pointer text-left"
                  onMouseDown={() => handleSelect(item)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default RelationField;
