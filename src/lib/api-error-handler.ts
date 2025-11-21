/**
 * API Error Handling Utilities
 *
 * Provides standardised error handling for Next.js API routes with:
 * - Typed error responses
 * - Automatic logging
 * - HTTP status code mapping
 * - Development vs production error details
 * - Auth-specific error handling
 *
 * @module lib/api-error-handler
 */

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { AuthErrorType } from "@/types/auth";

// ============================================================================
// Types
// ============================================================================

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    type: string;
    details?: unknown;
    timestamp: string;
    requestId?: string;
  };
}

/**
 * API error options
 */
export interface ApiErrorOptions {
  statusCode?: number;
  code?: string;
  type?: string;
  details?: unknown;
  requestId?: string;
  logLevel?: "warn" | "error" | "fatal";
  context?: Record<string, unknown>;
}

// ============================================================================
// Error Classes
// ============================================================================

/**
 * Base API Error class
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly type: string;
  public readonly details?: unknown;
  public readonly requestId?: string;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.statusCode = options.statusCode || 500;
    this.code = options.code || "INTERNAL_SERVER_ERROR";
    this.type = options.type || "ApiError";
    this.details = options.details;
    this.requestId = options.requestId;
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = "Authentication required", options: ApiErrorOptions = {}) {
    super(message, {
      statusCode: 401,
      code: "AUTHENTICATION_REQUIRED",
      type: AuthErrorType.SessionRequired,
      ...options,
    });
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = "Access denied", options: ApiErrorOptions = {}) {
    super(message, {
      statusCode: 403,
      code: "ACCESS_DENIED",
      type: AuthErrorType.AccessDenied,
      ...options,
    });
    this.name = "AuthorizationError";
  }
}

/**
 * Validation Error
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown, options: ApiErrorOptions = {}) {
    super(message, {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      type: "ValidationError",
      details,
      ...options,
    });
    this.name = "ValidationError";
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found", options: ApiErrorOptions = {}) {
    super(message, {
      statusCode: 404,
      code: "NOT_FOUND",
      type: "NotFoundError",
      ...options,
    });
    this.name = "NotFoundError";
  }
}

/**
 * Rate Limit Error
 */
export class RateLimitError extends ApiError {
  constructor(message: string = "Too many requests", options: ApiErrorOptions = {}) {
    super(message, {
      statusCode: 429,
      code: "RATE_LIMIT_EXCEEDED",
      type: "RateLimitError",
      ...options,
    });
    this.name = "RateLimitError";
  }
}

/**
 * Configuration Error
 */
export class ConfigurationError extends ApiError {
  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message, {
      statusCode: 500,
      code: "CONFIGURATION_ERROR",
      type: AuthErrorType.Configuration,
      ...options,
    });
    this.name = "ConfigurationError";
  }
}

// ============================================================================
// Error Handling Functions
// ============================================================================

/**
 * Handle API errors and return standardised response
 *
 * @example
 * ```typescript
 * try {
 *   // API logic
 * } catch (error) {
 *   return handleApiError(error, { requestId });
 * }
 * ```
 */
export function handleApiError(
  error: unknown,
  options: {
    requestId?: string;
    context?: Record<string, unknown>;
    includeStack?: boolean;
  } = {}
): NextResponse<ApiErrorResponse> {
  const { requestId, context, includeStack = false } = options;
  const isDevelopment = process.env.NODE_ENV === "development";

  // Handle known ApiError instances
  if (error instanceof ApiError) {
    // Log error
    const logLevel = error.statusCode >= 500 ? "error" : "warn";
    logger[logLevel](
      {
        err: error,
        statusCode: error.statusCode,
        code: error.code,
        type: error.type,
        requestId: error.requestId || requestId,
        ...context,
      },
      `API error: ${error.message}`
    );

    // Build response
    const response: ApiErrorResponse = {
      error: {
        message: error.message,
        code: error.code,
        type: error.type,
        timestamp: new Date().toISOString(),
        requestId: error.requestId || requestId,
      },
    };

    // Include details in development or for validation errors
    if (isDevelopment || error instanceof ValidationError) {
      response.error.details = error.details;
    }

    // Include stack trace in development
    if (isDevelopment && includeStack && error.stack) {
      (response.error as any).stack = error.stack;
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    logger.error(
      {
        err: error,
        requestId,
        ...context,
      },
      `Unhandled error: ${error.message}`
    );

    const response: ApiErrorResponse = {
      error: {
        message: isDevelopment ? error.message : "An unexpected error occurred",
        code: "INTERNAL_SERVER_ERROR",
        type: "Error",
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

    if (isDevelopment && includeStack && error.stack) {
      (response.error as any).stack = error.stack;
    }

    return NextResponse.json(response, { status: 500 });
  }

  // Handle unknown error types
  logger.error(
    {
      err: error,
      requestId,
      ...context,
    },
    "Unknown error type"
  );

  const response: ApiErrorResponse = {
    error: {
      message: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
      type: "Unknown",
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  if (isDevelopment) {
    response.error.details = error;
  }

  return NextResponse.json(response, { status: 500 });
}

/**
 * Wrap an API route handler with error handling
 *
 * @example
 * ```typescript
 * export const POST = withErrorHandler(async (req) => {
 *   // Your logic here
 *   return NextResponse.json({ success: true });
 * });
 * ```
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  options: {
    includeStack?: boolean;
    onError?: (error: unknown) => void;
  } = {}
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      // Call custom error handler if provided
      if (options.onError) {
        options.onError(error);
      }

      // Return standardised error response
      return handleApiError(error, {
        includeStack: options.includeStack,
      });
    }
  }) as T;
}

/**
 * Create a success response
 *
 * @example
 * ```typescript
 * return createSuccessResponse({ userId: "123" }, { status: 201 });
 * ```
 */
export function createSuccessResponse<T = unknown>(
  data: T,
  options: {
    status?: number;
    headers?: Record<string, string>;
  } = {}
): NextResponse<{ success: true; data: T }> {
  return NextResponse.json(
    { success: true, data },
    {
      status: options.status || 200,
      headers: options.headers,
    }
  );
}

/**
 * Create an error response
 *
 * @example
 * ```typescript
 * return createErrorResponse("Invalid input", 400, "VALIDATION_ERROR");
 * ```
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  code: string = "ERROR",
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    error: {
      message,
      code,
      type: "Error",
      timestamp: new Date().toISOString(),
    },
  };

  if (details && (process.env.NODE_ENV === "development" || statusCode === 400)) {
    response.error.details = details;
  }

  return NextResponse.json(response, { status: statusCode });
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate required fields in request body
 *
 * @example
 * ```typescript
 * const body = await req.json();
 * validateRequiredFields(body, ["email", "name"]);
 * ```
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  fields: string[]
): void {
  const missing = fields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === "";
  });

  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(", ")}`,
      { missingFields: missing }
    );
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email address format");
  }
}

/**
 * Validate request method
 *
 * @example
 * ```typescript
 * validateMethod(req.method, ["POST", "PUT"]);
 * ```
 */
export function validateMethod(
  method: string,
  allowedMethods: string[]
): void {
  if (!allowedMethods.includes(method)) {
    throw new ApiError(
      `Method ${method} not allowed. Allowed methods: ${allowedMethods.join(", ")}`,
      {
        statusCode: 405,
        code: "METHOD_NOT_ALLOWED",
      }
    );
  }
}

// ============================================================================
// Exports
// ============================================================================

export {
  // Error classes
  ApiError as default,

  // Response helpers
  handleApiError as handleError,
  withErrorHandler as withError,
  createSuccessResponse as success,
  createErrorResponse as error,
};
