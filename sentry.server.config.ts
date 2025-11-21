/**
 * Sentry Server-Side Configuration
 *
 * Configures error tracking and performance monitoring for Node.js/server-side code.
 * This runs on the server and captures API errors, server-side rendering errors,
 * and backend performance data.
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
    // Lower in production to reduce quota usage
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.2 : 1.0,

    // Enable server profiling
    profilesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Integrations configuration
    integrations: [
      // HTTP integration for tracking outbound requests
      Sentry.httpIntegration(),

      // Prisma integration (if using Prisma)
      // Sentry.prismaIntegration(),
    ],

    // Ignore specific errors
    ignoreErrors: [
      // Client disconnects (not actionable)
      'ECONNRESET',
      'EPIPE',
      'ECANCELED',

      // Timeout errors from slow clients
      'ETIMEDOUT',

      // Client aborted requests
      'AbortError',
      'The operation was aborted',

      // Next.js specific errors that aren't bugs
      'NEXT_NOT_FOUND',
      'NEXT_REDIRECT',
    ],

    // PII filtering - redact sensitive data before sending to Sentry
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        const sensitiveHeaders = [
          'authorization',
          'cookie',
          'x-api-key',
          'x-auth-token',
          'x-csrf-token',
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

      // Redact potential PII from extra data
      if (event.extra) {
        const redactedExtra = { ...event.extra };
        const sensitiveKeys = ['email', 'password', 'token', 'api_key', 'secret', 'ssn', 'creditCard'];

        const redactObject = (obj: any): any => {
          if (typeof obj !== 'object' || obj === null) return obj;

          const redacted = { ...obj };
          Object.keys(redacted).forEach(key => {
            if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
              redacted[key] = '[Filtered]';
            } else if (typeof redacted[key] === 'object') {
              redacted[key] = redactObject(redacted[key]);
            }
          });
          return redacted;
        };

        event.extra = redactObject(redactedExtra);
      }

      return event;
    },

    // Add custom tags to all events
    initialScope: {
      tags: {
        runtime: 'node',
      },
    },

    // Enable debug mode in development
    debug: ENVIRONMENT === 'development',

    // Adjust stack trace processing
    stackParser: Sentry.defaultStackParser,

    // Configure context lines for stack traces
    beforeBreadcrumb(breadcrumb, hint) {
      // Filter out noisy breadcrumbs
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
  });
}

// Export a function to set user context when authenticated
export function setSentryUser(user: { id: string; email?: string; username?: string } | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } else {
    Sentry.setUser(null);
  }
}

// Export a function to add custom context to errors
export function addSentryContext(key: string, data: Record<string, unknown>) {
  Sentry.setContext(key, data);
}

// Export a function to manually capture exceptions with context
export function captureSentryException(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

// Export a function to manually capture messages
export function captureSentryMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}

// Export a function to track performance
export function trackSentryPerformance<T>(
  name: string,
  operation: () => T | Promise<T>,
  context?: Record<string, string | number | boolean>
): Promise<T> {
  return Sentry.startSpan(
    {
      name,
      op: 'function',
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
