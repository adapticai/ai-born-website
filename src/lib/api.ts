/**
 * API Utilities & Fetch Wrappers
 * Includes error handling and rate limit retry logic
 */

import { sleep } from './utils';

import type { APIResponse, APIError } from '@/types';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// ============================================================================
// Error Classes
// ============================================================================

export class APIRequestError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIRequestError';
  }
}

export class RateLimitError extends APIRequestError {
  constructor(
    message: string = 'Rate limit exceeded',
    public retryAfter?: number
  ) {
    super(message, 'RATE_LIMIT', 429);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends APIRequestError {
  constructor(
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', 400, errors);
    this.name = 'ValidationError';
  }
}

// ============================================================================
// Request Options
// ============================================================================

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  skipRetry?: boolean;
}

// ============================================================================
// Core Fetch Wrapper
// ============================================================================

/**
 * Enhanced fetch with timeout, retries, and error handling
 */
async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = MAX_RETRIES,
    retryDelay = RETRY_DELAY,
    skipRetry = false,
    ...fetchOptions
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError: Error | null = null;
  const maxAttempts = skipRetry ? 1 : retries + 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle rate limiting with retry
      if (response.status === 429 && !skipRetry && attempt < maxAttempts - 1) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : retryDelay * Math.pow(2, attempt);
        
        console.warn(`Rate limited. Retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error as Error;

      // Don't retry on abort or if skipRetry is true
      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIRequestError('Request timeout', 'TIMEOUT', 408);
      }

      if (skipRetry || attempt === maxAttempts - 1) {
        break;
      }

      // Exponential backoff
      const delay = retryDelay * Math.pow(2, attempt);
      console.warn(`Request failed. Retrying in ${delay}ms...`, error);
      await sleep(delay);
    }
  }

  throw lastError || new APIRequestError('Request failed', 'UNKNOWN_ERROR', 500);
}

/**
 * Parse response as JSON with error handling
 */
async function parseResponse<T = unknown>(response: Response): Promise<APIResponse<T>> {
  const contentType = response.headers.get('content-type');
  
  if (!contentType?.includes('application/json')) {
    throw new APIRequestError(
      'Invalid response format',
      'INVALID_RESPONSE',
      response.status
    );
  }

  try {
    const data = await response.json();

    if (!response.ok) {
      // Handle API error responses
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new RateLimitError(
          data.message || 'Rate limit exceeded',
          retryAfter ? parseInt(retryAfter) : undefined
        );
      }

      if (response.status === 400 && data.errors) {
        throw new ValidationError(
          data.message || 'Validation failed',
          data.errors
        );
      }

      throw new APIRequestError(
        data.message || 'Request failed',
        data.code,
        response.status,
        data.details
      );
    }

    return data as APIResponse<T>;
  } catch (error) {
    if (error instanceof APIRequestError) {
      throw error;
    }

    throw new APIRequestError(
      'Failed to parse response',
      'PARSE_ERROR',
      response.status
    );
  }
}

// ============================================================================
// HTTP Methods
// ============================================================================

/**
 * GET request
 */
export async function get<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<APIResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return parseResponse<T>(response);
}

/**
 * POST request
 */
export async function post<T = unknown>(
  endpoint: string,
  data?: unknown,
  options: FetchOptions = {}
): Promise<APIResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  return parseResponse<T>(response);
}

/**
 * PUT request
 */
export async function put<T = unknown>(
  endpoint: string,
  data?: unknown,
  options: FetchOptions = {}
): Promise<APIResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetchWithTimeout(url, {
    method: 'PUT',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  return parseResponse<T>(response);
}

/**
 * DELETE request
 */
export async function del<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<APIResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetchWithTimeout(url, {
    method: 'DELETE',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return parseResponse<T>(response);
}

/**
 * POST multipart/form-data (for file uploads)
 */
export async function postFormData<T = unknown>(
  endpoint: string,
  formData: FormData,
  options: FetchOptions = {}
): Promise<APIResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    ...options,
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary
  });

  return parseResponse<T>(response);
}

// ============================================================================
// Specialized API Methods
// ============================================================================

/**
 * Submit email capture form
 */
export async function submitEmailCapture(data: {
  name?: string;
  email: string;
  source?: string;
}): Promise<APIResponse<{ downloadUrl?: string }>> {
  return post('/email-capture', data);
}

/**
 * Submit bonus claim form
 */
export async function submitBonusClaim(
  email: string,
  orderId: string,
  receiptFile: File,
  retailer?: string
): Promise<APIResponse> {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('orderId', orderId);
  formData.append('receiptFile', receiptFile);
  if (retailer) {
    formData.append('retailer', retailer);
  }

  return postFormData('/bonus-claim', formData);
}

/**
 * Submit media request form
 */
export async function submitMediaRequest(data: {
  name: string;
  email: string;
  outlet: string;
  requestType: string;
  message: string;
}): Promise<APIResponse> {
  return post('/media-request', data);
}

/**
 * Submit bulk order inquiry
 */
export async function submitBulkOrder(data: {
  name: string;
  email: string;
  company: string;
  quantity: number;
  message: string;
}): Promise<APIResponse> {
  return post('/bulk-order', data);
}

/**
 * Subscribe to newsletter
 */
export async function subscribeNewsletter(
  email: string,
  source?: string
): Promise<APIResponse> {
  return post('/newsletter-subscribe', { email, source });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if an error is a rate limit error
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

/**
 * Check if an error is a validation error
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof APIRequestError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Convert error to APIError object
 */
export function toAPIError(error: unknown): APIError {
  if (error instanceof APIRequestError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
}
