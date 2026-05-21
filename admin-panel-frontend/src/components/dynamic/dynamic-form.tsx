import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getFieldComponent } from '@/lib/registry/field-components';
import type { EntityConfig, EntityField } from '@/lib/api/metadata.api';

// ─── Zod schema builder ───────────────────────────────────────────────────────

function buildZodField(field: EntityField): z.ZodTypeAny {
  const rules = field.validation ?? {};
  let schema: z.ZodTypeAny;

  switch (field.field_type) {
    case 'number':
      schema = z.number({ coerce: true } as any);
      if (rules.min !== undefined) schema = (schema as z.ZodNumber).min(rules.min, rules.minMessage);
      if (rules.max !== undefined) schema = (schema as z.ZodNumber).max(rules.max, rules.maxMessage);
      break;

    case 'checkbox':
    case 'switch':
      schema = z.boolean();
      break;

    case 'multi-select':
    case 'checkbox-group':
      schema = z.array(z.string());
      break;

    case 'file':
    case 'image':
      schema = z.any();
      break;

    case 'relation':
      schema = z.any();
      break;

    default:
      schema = z.string();
      if (rules.minLength !== undefined)
        schema = (schema as z.ZodString).min(rules.minLength, rules.minMessage);
      if (rules.maxLength !== undefined)
        schema = (schema as z.ZodString).max(rules.maxLength, rules.maxMessage);
      if (rules.pattern !== undefined)
        schema = (schema as z.ZodString).regex(
          new RegExp(rules.pattern),
          rules.patternMessage ?? 'Invalid format'
        );
      if (field.field_type === 'email')
        schema = (schema as z.ZodString).email('Invalid email address');
      if (field.field_type === 'url')
        schema = (schema as z.ZodString).url('Invalid URL');
  }

  if (!field.required) {
    schema = schema.optional().nullable();
  }

  return schema;
}

function buildZodSchema(fields: EntityField[]): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    shape[field.name] = buildZodField(field);
  }
  return z.object(shape);
}

// ─── Conditional visibility ───────────────────────────────────────────────────

function isFieldVisible(field: EntityField, watchValues: Record<string, any>): boolean {
  if (!field.conditional) return true;
  const { field: condField, operator, value: condValue } = field.conditional;
  const actual = watchValues[condField];

  switch (operator) {
    case 'eq':
    case '==':
      return actual == condValue;
    case 'neq':
    case '!=':
      return actual != condValue;
    case 'gt':
      return Number(actual) > Number(condValue);
    case 'lt':
      return Number(actual) < Number(condValue);
    case 'contains':
      return String(actual ?? '').includes(String(condValue));
    case 'notEmpty':
      return actual !== null && actual !== undefined && actual !== '';
    default:
      return true;
  }
}

// ─── DynamicForm ─────────────────────────────────────────────────────────────

export interface DynamicFormProps {
  config: EntityConfig;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  /** When true renders fields read-only (detail view) */
  readonly?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  config,
  initialData,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save',
  readonly = false,
}) => {
  const sortedFields = [...config.fields].sort((a, b) => a.order - b.order);
  const schema = buildZodSchema(sortedFields);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData ?? {},
  });

  // Reset form when initialData changes (e.g. edit page re-fetches)
  useEffect(() => {
    if (initialData) reset(initialData);
  }, [initialData, reset]);

  const watchValues = watch();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {sortedFields.map((field) => {
        if (!isFieldVisible(field, watchValues)) return null;

        const FieldComponent = getFieldComponent(field.field_type);

        if (!FieldComponent) {
          console.warn(`[DynamicForm] No component registered for field type: ${field.field_type}`);
          return null;
        }

        return (
          <Controller
            key={field.id}
            name={field.name}
            control={control}
            render={({ field: rhfField }) => (
              <FieldComponent
                {...rhfField}
                label={field.label}
                placeholder={field.placeholder}
                helpText={field.help_text}
                required={field.required}
                disabled={readonly}
                readonly={readonly}
                options={field.options}
                error={errors[field.name]?.message as string | undefined}
                // pass relation config
                relationEntity={field.relation?.entity}
                displayField={field.relation?.display_field}
                valueField={field.relation?.value_field}
                // pass input type hint for text field variants
                inputType={
                  ['email', 'password', 'url'].includes(field.field_type)
                    ? field.field_type
                    : 'text'
                }
              />
            )}
          />
        );
      })}

      {!readonly && (
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
};

export default DynamicForm;
