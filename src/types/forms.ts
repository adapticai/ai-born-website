/**
 * Form schemas and validation types using Zod
 * Based on CLAUDE.md specifications for forms and data validation
 */

import { z } from 'zod';

// ==================== Email Capture Schema ====================

/**
 * Email capture form schema
 * Used for: Free excerpt download, newsletter signup
 * Fields: name (optional), email (required)
 */
export const emailCaptureSchema = z.object({
  /** User's name (optional for lower friction) */
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  /** User's email address (required) */
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),

  /** Honeypot field for spam prevention (should remain empty) */
  honeypot: z.string().max(0).optional(),

  /** GDPR/privacy consent (optional, depending on jurisdiction) */
  consent: z.boolean().optional(),

  /** Source tracking for analytics */
  source: z
    .enum(['hero-excerpt', 'bonus-section', 'newsletter-footer', 'popup', 'other'])
    .optional(),
});

/**
 * Inferred TypeScript type from email capture schema
 */
export type EmailCaptureFormData = z.infer<typeof emailCaptureSchema>;

// ==================== Bonus Claim Schema ====================

/**
 * Pre-order bonus claim form schema
 * Used for: Agent Charter Pack redemption
 * Fields: email, orderId, receipt file upload
 */
export const bonusClaimSchema = z.object({
  /** User's email address */
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),

  /** Order ID from retailer */
  orderId: z
    .string()
    .min(5, 'Order ID must be at least 5 characters')
    .max(100, 'Order ID must be less than 100 characters')
    .trim(),

  /** Retailer where purchase was made */
  retailer: z
    .string()
    .min(1, 'Please select a retailer')
    .max(50, 'Retailer name is too long'),

  /** Book format purchased */
  format: z.enum(['hardcover', 'ebook', 'audiobook'], {
    message: 'Please select a book format',
  }),

  /**
   * Receipt/proof of purchase file
   * Validated on client side for type and size
   * Server-side validation handles actual file processing
   */
  receipt: z
    .instanceof(File, { message: 'Please upload a receipt file' })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File size must be less than 5MB',
    })
    .refine(
      (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        return validTypes.includes(file.type);
      },
      {
        message: 'File must be JPG, PNG, WebP, or PDF',
      }
    )
    .optional(),

  /** Honeypot for spam prevention */
  honeypot: z.string().max(0).optional(),

  /** Terms acceptance */
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
});

/**
 * Inferred TypeScript type from bonus claim schema
 */
export type BonusClaimFormData = z.infer<typeof bonusClaimSchema>;

/**
 * Server-side version of bonus claim (after file is uploaded)
 */
export const bonusClaimServerSchema = bonusClaimSchema.extend({
  receipt: z
    .object({
      filename: z.string(),
      contentType: z.string(),
      size: z.number(),
      url: z.string().url(),
    })
    .optional(),
});

export type BonusClaimServerData = z.infer<typeof bonusClaimServerSchema>;

// ==================== Media Request Schema ====================

/**
 * Media/press request form schema
 * Used for: Journalist inquiries, interview requests, review copies
 * Fields: name, email, outlet, requestType, message
 */
export const mediaRequestSchema = z.object({
  /** Contact name */
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),

  /** Contact email */
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),

  /** Media outlet or publication name */
  outlet: z
    .string()
    .min(2, 'Outlet name must be at least 2 characters')
    .max(200, 'Outlet name must be less than 200 characters')
    .trim(),

  /** Type of media request */
  requestType: z.enum(['galley', 'interview', 'review-copy', 'speaking', 'partnership', 'other'], {
    message: 'Please select a request type',
  }),

  /** Optional phone number */
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]*$/, 'Please enter a valid phone number')
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal('')),

  /** Request message/details */
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(2000, 'Message must be less than 2000 characters')
    .trim(),

  /** Optional deadline (ISO date string) */
  deadline: z.string().datetime().optional().or(z.literal('')),

  /** Honeypot for spam prevention */
  honeypot: z.string().max(0).optional(),
});

/**
 * Inferred TypeScript type from media request schema
 */
export type MediaRequestFormData = z.infer<typeof mediaRequestSchema>;

// ==================== Bulk Order Schema ====================

/**
 * Corporate/bulk order inquiry form schema
 * Used for: NYT-friendly distributed bulk orders
 * Fields: name, email, company, quantity, distributionStrategy, timeline, message
 */
export const bulkOrderSchema = z.object({
  /** Contact name */
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),

  /** Contact email */
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),

  /** Company/organisation name */
  company: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name must be less than 200 characters')
    .trim(),

  /** Phone number */
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]*$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal('')),

  /** Estimated quantity */
  quantity: z
    .number({
      message: 'Quantity must be a number',
    })
    .int('Quantity must be a whole number')
    .min(10, 'Minimum bulk order is 10 copies')
    .max(100000, 'Please contact us directly for orders over 100,000'),

  /** Preferred book format */
  format: z.enum(['hardcover', 'ebook', 'audiobook', 'mixed'], {
    message: 'Please select a book format',
  }),

  /**
   * Distribution strategy for NYT-friendly bulk orders
   * - single: Single retailer/location (not NYT-eligible)
   * - regional: Multiple regional stores for distributed fulfillment
   * - multi-store: Multiple stores/retailers across locations (NYT-eligible)
   */
  distributionStrategy: z.enum(['single', 'regional', 'multi-store'], {
    message: 'Please select a distribution strategy',
  }),

  /**
   * Timeline for order fulfillment
   */
  timeline: z.enum(['rush-1-week', '2-4-weeks', '1-2-months', '2-3-months', 'flexible'], {
    message: 'Please select a timeline',
  }),

  /** Desired delivery date (ISO date string) - optional if timeline is selected */
  deliveryDate: z
    .string()
    .datetime()
    .optional()
    .or(z.literal('')),

  /** Geographic region for shipping */
  region: z.enum(['US', 'UK', 'EU', 'AU', 'other'], {
    message: 'Please select a region',
  }),

  /** Additional message/requirements */
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(2000, 'Message must be less than 2000 characters')
    .trim(),

  /** Whether customer needs customization (bookplates, branding, etc.) */
  customization: z.boolean().optional(),

  /** User ID for linking to authenticated account */
  userId: z.string().optional(),

  /** Honeypot for spam prevention */
  honeypot: z.string().max(0).optional(),
});

/**
 * Inferred TypeScript type from bulk order schema
 */
export type BulkOrderFormData = z.infer<typeof bulkOrderSchema>;

// ==================== Contact/General Inquiry Schema ====================

/**
 * General contact form schema
 * Used for: General inquiries, speaking requests, etc.
 */
export const contactFormSchema = z.object({
  /** Contact name */
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),

  /** Contact email */
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),

  /** Subject line */
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters')
    .trim(),

  /** Message body */
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(2000, 'Message must be less than 2000 characters')
    .trim(),

  /** Honeypot for spam prevention */
  honeypot: z.string().max(0).optional(),
});

/**
 * Inferred TypeScript type from contact form schema
 */
export type ContactFormData = z.infer<typeof contactFormSchema>;

// ==================== Helper Types ====================

/**
 * Generic form state for UI
 */
export interface FormState<T = unknown> {
  /** Whether form is currently submitting */
  isSubmitting: boolean;
  /** Whether form submission was successful */
  isSuccess: boolean;
  /** Error message if submission failed */
  error: string | null;
  /** Form data */
  data: T | null;
}

/**
 * API response for form submissions
 */
export interface FormSubmissionResponse {
  /** Whether submission was successful */
  success: boolean;
  /** Success or error message */
  message: string;
  /** Optional data payload */
  data?: Record<string, unknown>;
  /** Optional error details */
  errors?: Record<string, string[]>;
}

/**
 * Rate limiting response
 */
export interface RateLimitResponse {
  /** Whether rate limit was exceeded */
  limited: boolean;
  /** Retry after this many seconds */
  retryAfter?: number;
  /** Number of remaining requests */
  remaining?: number;
}

// ==================== Validation Utilities ====================

/**
 * File upload constraints
 */
export const FILE_UPLOAD_CONSTRAINTS = {
  /** Maximum file size in bytes (5MB) */
  MAX_SIZE: 5 * 1024 * 1024,
  /** Allowed MIME types for receipts */
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
  /** Human-readable allowed types */
  ALLOWED_TYPES_LABEL: 'JPG, PNG, WebP, or PDF',
} as const;

/**
 * Form field constraints
 */
export const FIELD_CONSTRAINTS = {
  name: { min: 2, max: 100 },
  email: { min: 1, max: 255 },
  message: { min: 20, max: 2000 },
  orderId: { min: 5, max: 100 },
  company: { min: 2, max: 200 },
  outlet: { min: 2, max: 200 },
  bulkQuantity: { min: 25, max: 100000 },
} as const;
