/**
 * Sentry Client-Side Configuration
 *
 * Configures error tracking and performance monitoring for browser/client-side code.
 * This runs in the user's browser and captures client-side errors, performance data,
 * and user interactions.
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
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Capture 100% of sessions for release health tracking
    replaysSessionSampleRate: 0.1,

    // Capture 100% of sessions when an error occurs
    replaysOnErrorSampleRate: 1.0,

    // Enable browser profiling (performance)
    profilesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Integrations configuration
    integrations: [
      // Session replay for debugging user sessions
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
        maskAllInputs: true, // Mask form inputs for privacy
      }),

      // Breadcrumbs for tracing user actions
      Sentry.breadcrumbsIntegration({
        console: ENVIRONMENT !== 'production', // Only log console in non-prod
        dom: true,
        fetch: true,
        history: true,
        xhr: true,
      }),

      // Browser profiling
      Sentry.browserProfilingIntegration(),

      // HTTP client instrumentation
      Sentry.httpClientIntegration({
        failedRequestStatusCodes: [400, 599], // Track 4xx and 5xx errors
      }),
    ],

    // Ignore common browser errors and third-party noise
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',

      // Random plugins/extensions
      'Cannot redefine property: googletag',

      // Network errors that aren't actionable
      'NetworkError',
      'Failed to fetch',
      'Load failed',

      // User cancelled requests
      'AbortError',
      'The operation was aborted',

      // Safari private browsing
      'QuotaExceededError',

      // Common noise
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed',
    ],

    // URLs to ignore (third-party scripts, etc.)
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,

      // Common third-party scripts
      /graph\.facebook\.com/i,
      /connect\.facebook\.net/i,
      /google-analytics\.com/i,
      /googletagmanager\.com/i,
    ],

    // PII filtering - redact sensitive data before sending to Sentry
    beforeSend(event, hint) {
      // Remove query strings that might contain sensitive data
      if (event.request?.url) {
        try {
          const url = new URL(event.request.url);
          // Remove query params that commonly contain PII
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

      // Redact potential PII from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
          if (breadcrumb.data) {
            const redactedData = { ...breadcrumb.data };
            const sensitiveKeys = ['email', 'password', 'token', 'api_key', 'secret'];
            sensitiveKeys.forEach(key => {
              if (redactedData[key]) {
                redactedData[key] = '[Filtered]';
              }
            });
            breadcrumb.data = redactedData;
          }
          return breadcrumb;
        });
      }

      return event;
    },

    // Add custom tags to all events
    initialScope: {
      tags: {
        runtime: 'browser',
      },
    },

    // Enable debug mode in development
    debug: ENVIRONMENT === 'development',
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
