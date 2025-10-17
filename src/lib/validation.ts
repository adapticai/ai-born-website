/**
 * Validation Schemas & Helpers using Zod
 */

import * as z from 'zod';

// ============================================================================
// Email Capture Schema
// ============================================================================

export const EmailCaptureSchema = z.object({
  name: z.string().min(1, 'Name is required').optional().or(z.literal('')),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  source: z.string().optional(),
  honeypot: z.string().max(0, 'Invalid submission').optional(),
});

export type EmailCaptureInput = z.infer<typeof EmailCaptureSchema>;

// ============================================================================
// Bonus Claim Schema
// ============================================================================

export const BonusClaimSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  orderId: z
    .string()
    .min(1, 'Order ID is required')
    .max(100, 'Order ID is too long'),
  retailer: z.string().optional(),
  receiptFile: z
    .any()
    .refine((file) => file instanceof File, 'Receipt file is required')
    .refine(
      (file) => file instanceof File && file.size <= 5 * 1024 * 1024,
      'File must be less than 5MB'
    )
    .refine(
      (file) =>
        file instanceof File &&
        (file.type === 'application/pdf' ||
          file.type.startsWith('image/')),
      'File must be a PDF or image'
    )
    .optional(),
  honeypot: z.string().max(0, 'Invalid submission').optional(),
});

export type BonusClaimInput = z.infer<typeof BonusClaimSchema>;

// ============================================================================
// Media Request Schema
// ============================================================================

export const MediaRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  outlet: z.string().min(1, 'Outlet/Organization is required'),
  requestType: z.enum(['galley', 'interview', 'review-copy', 'other']),
  message: z
    .string()
    .min(10, 'Please provide more details (at least 10 characters)')
    .max(1000, 'Message is too long (maximum 1000 characters)'),
  honeypot: z.string().max(0, 'Invalid submission').optional(),
});

export type MediaRequestInput = z.infer<typeof MediaRequestSchema>;

// ============================================================================
// Bulk Order Schema
// ============================================================================

export const BulkOrderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  company: z.string().min(1, 'Company/Organization is required'),
  quantity: z
    .number()
    .min(10, 'Minimum bulk order is 10 copies')
    .max(10000, 'For orders over 10,000 copies, please contact us directly')
    .or(
      z
        .string()
        .regex(/^\d+$/, 'Please enter a valid number')
        .transform(Number)
        .pipe(z.number().min(10).max(10000))
    ),
  message: z
    .string()
    .min(10, 'Please provide more details (at least 10 characters)')
    .max(1000, 'Message is too long (maximum 1000 characters)'),
  honeypot: z.string().max(0, 'Invalid submission').optional(),
});

export type BulkOrderInput = z.infer<typeof BulkOrderSchema>;

// ============================================================================
// Newsletter Subscribe Schema
// ============================================================================

export const NewsletterSubscribeSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  source: z.string().optional(),
  honeypot: z.string().max(0, 'Invalid submission').optional(),
});

export type NewsletterSubscribeInput = z.infer<typeof NewsletterSubscribeSchema>;

// ============================================================================
// Contact Form Schema
// ============================================================================

export const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z
    .string()
    .min(10, 'Please provide more details (at least 10 characters)')
    .max(1000, 'Message is too long (maximum 1000 characters)'),
  honeypot: z.string().max(0, 'Invalid submission').optional(),
});

export type ContactFormInput = z.infer<typeof ContactFormSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate data against a Zod schema
 * Returns parsed data or error messages
 */
export function validateSchema<T extends z.ZodType>(
  schema: T,
  data: unknown
): {
  success: boolean;
  data?: z.infer<T>;
  errors?: Record<string, string[]>;
} {
  try {
    const parsed = schema.parse(data);
    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};

      error.issues.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });

      return {
        success: false,
        errors,
      };
    }

    return {
      success: false,
      errors: {
        _form: ['An unexpected error occurred during validation'],
      },
    };
  }
}

/**
 * Check if honeypot field is filled (indicates spam)
 */
export function isHoneypotFilled(data: { honeypot?: string }): boolean {
  return Boolean(data.honeypot && data.honeypot.length > 0);
}

/**
 * Validate email format (simple regex check)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string input (basic XSS prevention)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Extract first error message from Zod validation errors
 */
export function getFirstError(
  errors?: Record<string, string[]>
): string | undefined {
  if (!errors) return undefined;
  
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey][0] : undefined;
}

/**
 * Convert Zod errors to flat error object
 */
export function flattenZodErrors(
  error: z.ZodError
): Record<string, string> {
  const flattened: Record<string, string> = {};

  error.issues.forEach((err) => {
    const path = err.path.join('.');
    if (!flattened[path]) {
      flattened[path] = err.message;
    }
  });

  return flattened;
}
