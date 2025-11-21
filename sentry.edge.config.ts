/**
 * Sentry Edge Runtime Configuration
 *
 * Configures error tracking for Edge runtime (middleware, edge API routes).
 * Edge runtime has different constraints than Node.js - lighter bundle size,
 * faster cold starts, but fewer Node.js APIs available.
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development';

// Only initialize Sentry if DSN is configured
if (SENTRY_DSN) {
  Sentry.init({
    // Data Source Name - unique identifier for this project
    dsn: SENTRY_DSN,

    // Environment (production, staging, development)
    environment: ENVIRONMENT,

    // Release version for tracking deploys
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development',

    // Sample rate for error events (100% = capture all errors)
    sampleRate: 1.0,

    // Sample rate for performance monitoring transactions
    // Edge functions are fast, so we can afford higher sample rate
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.2 : 1.0,

    // Edge runtime uses minimal default integrations automatically
    // Note: httpClientIntegration and other Node.js integrations are not available in edge runtime
    // The edge runtime will use only compatible integrations by default

    // Ignore specific errors common in edge runtime
    ignoreErrors: [
      // Client disconnects
      'ECONNRESET',
      'EPIPE',
      'ECANCELED',

      // Client aborted requests
      'AbortError',
      'The operation was aborted',

      // Next.js specific
      'NEXT_NOT_FOUND',
      'NEXT_REDIRECT',

      // Geo-location errors (not critical)
      'Failed to get geolocation',
    ],

    // PII filtering for edge runtime
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        const sensitiveHeaders = [
          'authorization',
          'cookie',
          'x-api-key',
          'x-auth-token',
          'x-csrf-token',
          'x-real-ip',
          'x-forwarded-for',
        ];

        const headers = { ...event.request.headers };
        sensitiveHeaders.forEach(header => {
          if (headers[header]) {
            headers[header] = '[Filtered]';
          }
        });
        event.request.headers = headers;
      }

      // Remove query strings that might contain sensitive data
      if (event.request?.url) {
        try {
          const url = new URL(event.request.url);
          const sensitiveParams = ['email', 'token', 'key', 'password', 'secret', 'api_key'];
          sensitiveParams.forEach(param => {
            if (url.searchParams.has(param)) {
              url.searchParams.set(param, '[Filtered]');
            }
          });
          event.request.url = url.toString();
        } catch {
          // If URL parsing fails, leave it as is
        }
      }

      // Redact IP addresses from context
      if (event.contexts?.['Request Info']) {
        const requestContext = { ...event.contexts['Request Info'] };
        if (requestContext.ip) {
          requestContext.ip = '[Filtered]';
        }
        event.contexts['Request Info'] = requestContext;
      }

      return event;
    },

    // Filter noisy breadcrumbs
    beforeBreadcrumb(breadcrumb, hint) {
      // Filter out console logs in production
      if (breadcrumb.category === 'console' && ENVIRONMENT === 'production') {
        return null;
      }

      // Redact sensitive data from HTTP breadcrumbs
      if (breadcrumb.category === 'http') {
        if (breadcrumb.data?.url) {
          try {
            const url = new URL(breadcrumb.data.url);
            const sensitiveParams = ['email', 'token', 'key', 'password', 'secret'];
            sensitiveParams.forEach(param => {
              if (url.searchParams.has(param)) {
                url.searchParams.set(param, '[Filtered]');
              }
            });
            breadcrumb.data.url = url.toString();
          } catch {
            // If URL parsing fails, leave it as is
          }
        }
      }

      return breadcrumb;
    },

    // Add custom tags to all events
    initialScope: {
      tags: {
        runtime: 'edge',
      },
    },

    // Enable debug mode in development
    debug: ENVIRONMENT === 'development',
  });
}

// Export a function to add custom context to errors
export function addSentryContext(key: string, data: Record<string, unknown>) {
  Sentry.setContext(key, data);
}

// Export a function to manually capture exceptions
export function captureSentryException(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

// Export a function to manually capture messages
export function captureSentryMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}

// Export a function to track edge function performance
export function trackEdgePerformance<T>(
  name: string,
  operation: () => T | Promise<T>,
  context?: Record<string, string | number | boolean>
): Promise<T> {
  return Sentry.startSpan(
    {
      name,
      op: 'edge.function',
      attributes: context as Record<string, string | number | boolean | undefined>,
    },
    async () => {
      try {
        return await operation();
      } catch (error) {
        Sentry.captureException(error);
        throw error;
      }
    }
  );
}
