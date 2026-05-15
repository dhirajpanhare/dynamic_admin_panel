import { z } from 'zod';

/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * URL validation
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Phone number validation (basic)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Password strength validation
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
} {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  if (errors.length === 0) {
    strength = 'strong';
  } else if (errors.length <= 2) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    strength,
    errors,
  };
}

/**
 * File type validation
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      const category = type.split('/')[0];
      return file.type.startsWith(category + '/');
    }
    return file.type === type;
  });
}

/**
 * File size validation
 */
export function isValidFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

/**
 * Create Zod schema from field metadata
 */
export function createFieldSchema(field: any): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.field_type) {
    case 'text':
    case 'textarea':
    case 'slug':
      schema = z.string();
      if (field.validation?.min) {
        schema = (schema as z.ZodString).min(field.validation.min);
      }
      if (field.validation?.max) {
        schema = (schema as z.ZodString).max(field.validation.max);
      }
      if (field.validation?.pattern) {
        schema = (schema as z.ZodString).regex(new RegExp(field.validation.pattern));
      }
      break;

    case 'email':
      schema = z.string().email('Invalid email address');
      break;

    case 'url':
      schema = z.string().url('Invalid URL');
      break;

    case 'number':
      schema = z.number();
      if (field.validation?.min !== undefined) {
        schema = (schema as z.ZodNumber).min(field.validation.min);
      }
      if (field.validation?.max !== undefined) {
        schema = (schema as z.ZodNumber).max(field.validation.max);
      }
      break;

    case 'date':
    case 'datetime':
      schema = z.date();
      break;

    case 'boolean':
    case 'switch':
      schema = z.boolean();
      break;

    case 'select':
    case 'radio':
      if (field.options && field.options.length > 0) {
        const values = field.options.map((opt: any) => opt.value);
        schema = z.enum(values as [string, ...string[]]);
      } else {
        schema = z.string();
      }
      break;

    case 'multi-select':
    case 'checkbox-group':
      schema = z.array(z.string());
      if (field.validation?.min) {
        schema = (schema as z.ZodArray<any>).min(field.validation.min);
      }
      if (field.validation?.max) {
        schema = (schema as z.ZodArray<any>).max(field.validation.max);
      }
      break;

    case 'file':
      schema = z.any();
      break;

    case 'json':
      schema = z.any();
      break;

    default:
      schema = z.any();
  }

  // Handle required fields
  if (!field.required) {
    schema = schema.optional().nullable();
  }

  return schema;
}

/**
 * Create form schema from entity fields
 */
export function createFormSchema(fields: any[]): z.ZodObject<any> {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    schemaShape[field.name] = createFieldSchema(field);
  });

  return z.object(schemaShape);
}
