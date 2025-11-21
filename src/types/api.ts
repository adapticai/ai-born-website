/**
 * API Contract Type Definitions
 *
 * TypeScript types for all API endpoints, requests, and responses.
 * Ensures type safety across frontend and backend.
 */

// ============================================================================
// Excerpt API
// ============================================================================

/**
 * Request body for excerpt request endpoint
 * POST /api/excerpt/request
 */
export interface ExcerptRequestBody {
  email: string;
  name?: string;
  source?: string;
  honeypot?: string;
}

/**
 * Response from excerpt request endpoint
 * POST /api/excerpt/request
 */
export interface ExcerptRequestResponse {
  success: boolean;
  message: string;
  downloadUrl?: string;
  errors?: Record<string, string[]>;
}

/**
 * Query parameters for excerpt download endpoint
 * GET /api/excerpt/download?token=<jwt>
 */
export interface ExcerptDownloadQuery {
  token: string;
}

/**
 * Response from excerpt download endpoint
 * GET /api/excerpt/download
 * Returns PDF file or JSON error
 */
export interface ExcerptDownloadErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================================================
// Email Capture API
// ============================================================================

/**
 * Request body for email capture endpoint
 * POST /api/email-capture
 */
export interface EmailCaptureRequestBody {
  email: string;
  name?: string;
  source?: string;
  honeypot?: string;
}

/**
 * Response from email capture endpoint
 * POST /api/email-capture
 */
export interface EmailCaptureResponse {
  success: boolean;
  message: string;
  downloadUrl?: string;
  errors?: Record<string, string[]>;
}

// ============================================================================
// Bonus Claim API
// ============================================================================

// BonusClaimFormData is exported from ./forms.ts to avoid duplication

/**
 * Response from bonus claim endpoint
 * POST /api/bonus-claim
 */
export interface BonusClaimResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================================================
// Media Request API
// ============================================================================

/**
 * Request body for media request endpoint
 * POST /api/media-request
 */
export interface MediaRequestBody {
  name: string;
  email: string;
  outlet: string;
  requestType: 'galley' | 'interview' | 'review-copy' | 'other';
  message: string;
  honeypot?: string;
}

/**
 * Response from media request endpoint
 * POST /api/media-request
 */
export interface MediaRequestResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================================================
// Bulk Order API
// ============================================================================

/**
 * Request body for bulk order endpoint
 * POST /api/bulk-order
 */
export interface BulkOrderRequestBody {
  name: string;
  email: string;
  company: string;
  quantity: number | string;
  message: string;
  honeypot?: string;
}

/**
 * Response from bulk order endpoint
 * POST /api/bulk-order
 */
export interface BulkOrderResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================================================
// Newsletter API
// ============================================================================

/**
 * Request body for newsletter subscribe endpoint
 * POST /api/newsletter-subscribe
 */
export interface NewsletterSubscribeBody {
  email: string;
  source?: string;
  honeypot?: string;
}

/**
 * Response from newsletter subscribe endpoint
 * POST /api/newsletter-subscribe
 */
export interface NewsletterSubscribeResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================================================
// VIP Code API
// ============================================================================

/**
 * Request body for VIP code redemption
 * POST /api/codes/:code/redeem
 */
export interface VIPCodeRedemptionBody {
  code: string;
  honeypot?: string;
}

/**
 * Response from VIP code redemption
 * POST /api/codes/:code/redeem
 */
export interface VIPCodeRedemptionResponse {
  success: boolean;
  message: string;
  data?: {
    benefits: string[];
    expiresAt?: string;
  };
  errors?: Record<string, string[]>;
}

// ============================================================================
// Generic API Types
// ============================================================================

/**
 * Generic API response wrapper
 */
export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * API error structure
 */
export interface APIError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

/**
 * Rate limit error structure
 */
export interface RateLimitError extends APIError {
  retryAfter?: number;
  resetTime?: number;
}

/**
 * Validation error structure
 */
export interface ValidationError extends APIError {
  errors: Record<string, string[]>;
}

// ============================================================================
// Token Types
// ============================================================================

/**
 * Excerpt download token payload
 */
export interface ExcerptTokenPayload {
  email: string;
  name?: string;
  source?: string;
  timestamp: number;
  expiresAt: number;
}

/**
 * Token verification result
 */
export interface TokenVerificationResult {
  valid: boolean;
  payload?: ExcerptTokenPayload;
  error?: 'expired' | 'invalid' | 'malformed' | 'missing_secret';
}

// ============================================================================
// Analytics Event Types
// ============================================================================

/**
 * Excerpt download analytics event
 */
export interface ExcerptDownloadEvent {
  event: 'excerpt_download';
  email: string; // Should be hashed for privacy
  source?: string;
  timestamp: string;
  success: boolean;
  error?: string;
}

/**
 * Excerpt request analytics event
 */
export interface ExcerptRequestEvent {
  event: 'excerpt_request';
  email: string; // Should be hashed for privacy
  source?: string;
  timestamp: string;
  success: boolean;
  error?: string;
}

// ============================================================================
// HTTP Methods Type Guards
// ============================================================================

/**
 * Check if response is successful
 */
export function isSuccessResponse<T>(
  response: APIResponse<T>
): response is APIResponse<T> & { success: true; data: T } {
  return response.success === true && response.data !== undefined;
}

/**
 * Check if response is an error
 */
export function isErrorResponse(
  response: APIResponse
): response is APIResponse & { success: false; errors: Record<string, string[]> } {
  return response.success === false;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: APIError): error is RateLimitError {
  return error.status === 429;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: APIError): error is ValidationError {
  return error.status === 400 && 'errors' in error;
}
