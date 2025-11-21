/**
 * Logging middleware for Next.js
 *
 * Provides:
 * - Automatic request/response logging
 * - Request ID generation and propagation
 * - Duration tracking
 * - Error logging
 * - Context injection
 *
 * Usage in middleware.ts:
 * ```typescript
 * import { loggingMiddleware } from '@/middleware/logging';
 *
 * export function middleware(request: NextRequest) {
 *   return loggingMiddleware(request);
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger, generateRequestId, type LogContext } from '@/lib/logger';

// ============================================================================
// Configuration
// ============================================================================

const ENABLE_REQUEST_LOGGING =
  process.env.ENABLE_REQUEST_LOGGING !== 'false'; // Enabled by default

/**
 * Paths to exclude from request logging (health checks, static assets)
 */
const EXCLUDED_PATHS = [
  '/_next/static',
  '/_next/image',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

/**
 * Headers to include in logs
 */
const LOGGED_HEADERS = [
  'user-agent',
  'referer',
  'x-forwarded-for',
  'x-real-ip',
];

// ============================================================================
// Request Context
// ============================================================================

/**
 * Extract logging context from request
 */
export function extractRequestContext(request: NextRequest): LogContext {
  const headers: Record<string, string> = {};

  // Extract relevant headers
  LOGGED_HEADERS.forEach(headerName => {
    const value = request.headers.get(headerName);
    if (value) {
      headers[headerName] = value;
    }
  });

  // Get client IP (respects proxies)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  return {
    method: request.method,
    path: request.nextUrl.pathname,
    searchParams: Object.fromEntries(request.nextUrl.searchParams),
    userAgent: request.headers.get('user-agent') || undefined,
    referer: request.headers.get('referer') || undefined,
    ip,
    headers,
  };
}

/**
 * Check if path should be logged
 */
function shouldLogPath(pathname: string): boolean {
  if (!ENABLE_REQUEST_LOGGING) return false;

  return !EXCLUDED_PATHS.some(excluded => pathname.startsWith(excluded));
}

// ============================================================================
// Middleware
// ============================================================================

/**
 * Logging middleware for Next.js
 *
 * Automatically logs all HTTP requests and responses with:
 * - Request ID
 * - Duration
 * - Status code
 * - Error details (if applicable)
 */
export async function loggingMiddleware(
  request: NextRequest
): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const pathname = request.nextUrl.pathname;

  // Skip logging for excluded paths
  if (!shouldLogPath(pathname)) {
    const response = NextResponse.next();
    response.headers.set('x-request-id', requestId);
    return response;
  }

  // Extract request context
  const requestContext = extractRequestContext(request);
  const requestLogger = logger.child({ requestId, ...requestContext });

  // Log incoming request
  requestLogger.info('Incoming request');

  let response: NextResponse | undefined;
  let error: unknown = null;

  try {
    // Continue to next middleware/handler
    response = NextResponse.next();

    // Add request ID to response headers
    response.headers.set('x-request-id', requestId);

  } catch (err) {
    error = err;

    // Log error
    requestLogger.error(
      { err },
      'Request processing failed'
    );

    // Return error response
    response = NextResponse.json(
      {
        error: 'Internal Server Error',
        requestId,
      },
      { status: 500 }
    );

    response.headers.set('x-request-id', requestId);
  } finally {
    // Calculate duration
    const duration = Date.now() - startTime;
    const statusCode = response?.status || 500;

    // Log completed request
    requestLogger.http({
      method: request.method,
      path: pathname,
      statusCode,
      duration,
      requestId,
      error: error ? true : undefined,
    });
  }

  // Response should always be defined by this point (either from try or catch block)
  return response || NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// ============================================================================
// Request Logger Hook (for App Router)
// ============================================================================

/**
 * Get request-scoped logger in Server Components or Route Handlers
 *
 * Usage in Route Handler:
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const log = getRequestLogger(request);
 *   log.info('Processing GET request');
 *   // ... handler logic
 * }
 * ```
 */
export function getRequestLogger(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || generateRequestId();
  const context = extractRequestContext(request);

  return logger.child({ requestId, ...context });
}

// ============================================================================
// API Route Wrapper
// ============================================================================

/**
 * Wrap API route handler with automatic logging
 *
 * Usage:
 * ```typescript
 * export const GET = withLogging(async (request, context) => {
 *   // Your handler logic
 *   return NextResponse.json({ data: 'success' });
 * });
 * ```
 */
export function withLogging<T extends (...args: any[]) => Promise<Response>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    const request = args[0] as NextRequest;
    const startTime = Date.now();
    const requestId = request.headers.get('x-request-id') || generateRequestId();

    const context = extractRequestContext(request);
    const log = logger.child({ requestId, ...context });

    try {
      log.info('API handler started');

      const response = await handler(...args);
      const duration = Date.now() - startTime;

      log.http({
        method: request.method,
        path: request.nextUrl.pathname,
        statusCode: response.status,
        duration,
        requestId,
      });

      // Add request ID to response
      response.headers.set('x-request-id', requestId);

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;

      log.error(
        {
          err: error,
          duration,
          requestId,
        },
        'API handler failed'
      );

      throw error;
    }
  }) as T;
}

// ============================================================================
// Server Action Logging
// ============================================================================

/**
 * Wrap Server Action with automatic logging
 *
 * Usage:
 * ```typescript
 * export const submitForm = withServerActionLogging(
 *   'submitForm',
 *   async (formData: FormData) => {
 *     // Your action logic
 *   }
 * );
 * ```
 */
export function withServerActionLogging<T extends (...args: any[]) => Promise<any>>(
  actionName: string,
  action: T
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = Date.now();
    const actionId = generateRequestId();

    const log = logger.child({
      actionName,
      actionId,
      type: 'server-action',
    });

    try {
      log.info({ args: args.length }, 'Server action started');

      const result = await action(...args);
      const duration = Date.now() - startTime;

      log.info({ duration }, 'Server action completed');

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;

      log.error(
        {
          err: error,
          duration,
          args: args.length,
        },
        'Server action failed'
      );

      throw error;
    }
  }) as T;
}
