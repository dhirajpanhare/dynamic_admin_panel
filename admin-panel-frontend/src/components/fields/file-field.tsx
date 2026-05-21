import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FieldComponentProps } from '@/lib/registry/field-components';

interface UploadedFile {
  name: string;
  url: string;
  size?: number;
}

export const FileField: React.FC<FieldComponentProps> = ({
  value,
  onChange,
  error,
  label,
  required,
  disabled,
  accept,
  maxSize = 10 * 1024 * 1024, // 10 MB default
  multiple = false,
}) => {
  const files: UploadedFile[] = Array.isArray(value)
    ? value
    : value
    ? [value]
    : [];

  const onDrop = useCallback(
    (accepted: File[]) => {
      // In a real implementation these would be uploaded to the server first.
      // Here we create object URLs for preview until the form is submitted.
      const mapped: UploadedFile[] = accepted.map((f) => ({
        name: f.name,
        url: URL.createObjectURL(f),
        size: f.size,
      }));
      onChange(multiple ? [...files, ...mapped] : mapped[0] ?? null);
    },
    [files, multiple, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    accept,
    maxSize,
    multiple,
  });

  const handleRemove = (index: number) => {
    if (multiple) {
      const next = files.filter((_, i) => i !== index);
      onChange(next.length ? next : null);
    } else {
      onChange(null);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}

      <div
        {...getRootProps()}
        className={[
          'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          error ? 'border-destructive' : '',
        ].join(' ')}
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground text-center">
          {isDragActive
            ? 'Drop files here…'
            : 'Drag & drop files here, or click to select'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Max size: {Math.round(maxSize / (1024 * 1024))} MB
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span className="flex items-center gap-2 truncate">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{f.name}</span>
              </span>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-2 shrink-0"
                  onClick={() => handleRemove(i)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default FileField;
