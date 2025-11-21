# Sentry Error Tracking Setup

This document explains how to set up and use Sentry for error tracking and performance monitoring in the AI-Born landing page.

## Overview

Sentry is configured for comprehensive error tracking across:
- **Client-side** (browser) errors and performance
- **Server-side** (Node.js) errors and API monitoring
- **Edge runtime** (middleware, edge functions) errors

## Quick Start

### 1. Create a Sentry Account

1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new project and select "Next.js" as the platform
3. Note your organization slug and project slug from the URL

### 2. Get Your DSN

1. Navigate to **Settings** → **Projects** → **[Your Project]** → **Client Keys (DSN)**
2. Copy the DSN (it looks like: `https://[key]@[org].ingest.sentry.io/[project-id]`)
3. This is public and safe to expose in client-side code

### 3. Generate an Auth Token

1. Go to **Settings** → **Account** → **API** → **Auth Tokens**
2. Click "Create New Token"
3. Name it (e.g., "AI-Born Source Maps Upload")
4. Select scopes:
   - `project:releases`
   - `project:write`
   - `org:read`
5. Copy the token (starts with `sntrys_`)
6. **Important**: Keep this secret! Never commit it to git

### 4. Configure Environment Variables

#### Local Development (.env.local)

```bash
# Required
NEXT_PUBLIC_SENTRY_DSN=https://your_key@your_org.ingest.sentry.io/your_project_id

# Optional (for source maps upload)
SENTRY_AUTH_TOKEN=sntrys_your_auth_token_here
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

#### Production (Vercel)

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the following variables:
   - `NEXT_PUBLIC_SENTRY_DSN` (Production value)
   - `SENTRY_AUTH_TOKEN` (Production value - keep secret!)
   - `SENTRY_ORG` (your organization slug)
   - `SENTRY_PROJECT` (your project slug)

## Configuration Files

### Client Configuration (`sentry.client.config.ts`)

Handles browser-side error tracking:
- Error capturing and reporting
- Session replay for debugging user sessions
- Performance monitoring (Web Vitals, LCP, FID, CLS)
- Breadcrumbs for user actions
- PII filtering (removes sensitive data before sending)

**Sample rates:**
- Errors: 100% (capture all errors)
- Transactions: 10% in production, 100% in development
- Session replay: 10% of sessions, 100% when errors occur

### Server Configuration (`sentry.server.config.ts`)

Handles Node.js server-side error tracking:
- API route errors
- Server-side rendering errors
- Database query errors
- HTTP request tracking
- Server performance profiling

**Sample rates:**
- Errors: 100%
- Transactions: 20% in production, 100% in development
- Profiling: 10% in production, 100% in development

### Edge Configuration (`sentry.edge.config.ts`)

Handles edge runtime error tracking:
- Middleware errors
- Edge API route errors
- Lightweight configuration for fast cold starts

**Sample rates:**
- Errors: 100%
- Transactions: 20% in production, 100% in development

## Usage

### Automatic Error Tracking

Errors are automatically captured. No code changes needed!

```typescript
// This error will be automatically sent to Sentry
throw new Error('Something went wrong');
```

### Manual Error Capture

```typescript
import { captureSentryException } from '@/sentry.client.config';

try {
  await riskyOperation();
} catch (error) {
  captureSentryException(error as Error, {
    context: 'user-checkout',
    userId: user.id,
    retailer: 'amazon',
  });
}
```

### Setting User Context

```typescript
import { setSentryUser } from '@/sentry.client.config';

// When user signs in
setSentryUser({
  id: user.id,
  email: user.email,
  username: user.username,
});

// When user signs out
setSentryUser(null);
```

### Adding Custom Context

```typescript
import { addSentryContext } from '@/sentry.client.config';

addSentryContext('checkout', {
  retailer: 'amazon',
  format: 'hardcover',
  price: 29.99,
});
```

### Capturing Messages

```typescript
import { captureSentryMessage } from '@/sentry.client.config';

// Info message
captureSentryMessage('User completed pre-order', 'info');

// Warning message
captureSentryMessage('Slow API response detected', 'warning');

// Error message
captureSentryMessage('Rate limit exceeded', 'error');
```

### Tracking Performance

```typescript
import { trackSentryPerformance } from '@/sentry.server.config';

const result = await trackSentryPerformance(
  'process-bulk-order',
  async () => {
    // Your expensive operation
    return await processBulkOrder(orderId);
  },
  {
    orderId,
    itemCount: 100,
  }
);
```

## Privacy & PII Protection

Sentry is configured to automatically redact sensitive information:

### Automatically Filtered

- Passwords
- Email addresses in URLs
- API keys and tokens
- Authorization headers
- Cookies
- IP addresses (in edge runtime)
- Form input values (masked by default)

### Manual Filtering

If you need to filter additional data:

```typescript
// The beforeSend hook in config files handles this
// Add sensitive field names to the sensitiveKeys array
```

## Ignored Errors

Common noise is filtered out to reduce quota usage:

- Browser extension errors
- Network errors (failed fetches, aborted requests)
- Client disconnects (ECONNRESET, EPIPE)
- Safari private browsing errors (QuotaExceededError)
- ResizeObserver loop errors
- Next.js redirects and 404s

## Source Maps

Source maps are automatically uploaded to Sentry during production builds:

1. **Build time**: Webpack plugin generates source maps
2. **Upload**: Source maps are uploaded to Sentry
3. **Client**: Source maps are hidden from client bundles (security)
4. **Debugging**: You can see original source code in Sentry error stack traces

### Requirements

- `SENTRY_AUTH_TOKEN` must be set (keeps builds working without Sentry)
- Source maps only upload in production builds
- Requires internet connection during build

### Vercel Integration

Vercel automatically sets:
- `NEXT_PUBLIC_VERCEL_ENV` (production/preview/development)
- `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA` (used as release version)

## Monitoring Dashboard

### Key Metrics to Watch

1. **Error Rate**: Track new errors introduced in deployments
2. **Performance**: Monitor API response times, LCP, FID, CLS
3. **Release Health**: Session crash rates per deployment
4. **User Impact**: How many users are affected by each error

### Setting Up Alerts

1. Go to **Alerts** → **Create Alert**
2. Recommended alerts:
   - New error types (immediate notification)
   - Error rate spike (>10% increase)
   - Performance degradation (LCP >2.5s)
   - High error volume (>100 errors/hour)

## Troubleshooting

### Errors Not Appearing in Sentry

1. Check `NEXT_PUBLIC_SENTRY_DSN` is set correctly
2. Verify DSN is valid (test in browser console)
3. Check browser console for Sentry initialization errors
4. Ensure error isn't in `ignoreErrors` list

### Source Maps Not Uploading

1. Verify `SENTRY_AUTH_TOKEN` is set
2. Check auth token has correct scopes
3. Ensure `SENTRY_ORG` and `SENTRY_PROJECT` match your Sentry account
4. Check build logs for upload errors

### High Quota Usage

1. Reduce sample rates in config files
2. Add more errors to `ignoreErrors` list
3. Filter noisy third-party errors in `denyUrls`
4. Consider upgrading Sentry plan

### Development Mode Not Working

1. Sentry is optional in development
2. Set `NEXT_PUBLIC_SENTRY_DSN` in `.env.local` to enable
3. Check `debug: true` is set in config files
4. Look for Sentry initialization logs in console

## Best Practices

### DO

- Set user context when authenticated
- Add meaningful context to manual captures
- Use breadcrumbs to understand user journey
- Review errors weekly and fix high-impact issues
- Set up alerts for critical errors
- Monitor release health after deployments

### DON'T

- Capture expected errors (validation errors, 404s)
- Log sensitive information (passwords, tokens, PII)
- Ignore all errors from a route (you might miss real bugs)
- Set sample rates to 100% in production (expensive)
- Forget to test error tracking in staging

## Environment-Specific Configuration

### Development

- Higher sample rates (100% for debugging)
- Console logging enabled
- Debug mode on
- Optional Sentry initialization (can work without it)

### Staging

- Medium sample rates (50%)
- Console logging disabled
- Debug mode off
- Required Sentry initialization

### Production

- Lower sample rates (10-20% for transactions)
- Console logging disabled
- Debug mode off
- Required Sentry initialization
- Source maps uploaded
- Release tracking enabled

## Cost Optimization

Sentry charges based on:
- **Events**: Errors and transactions
- **Replays**: Session recordings
- **Attachments**: Screenshots, breadcrumbs

To optimize costs:

1. **Adjust sample rates**: Lower `tracesSampleRate` in production
2. **Filter noise**: Add common errors to `ignoreErrors`
3. **Limit replays**: Set `replaysSessionSampleRate` to 0.1 (10%)
4. **Use rate limits**: Prevent spam from single users
5. **Review quota**: Monitor usage in Sentry dashboard

## Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Error Monitoring Best Practices](https://docs.sentry.io/product/best-practices/)
- [Performance Monitoring Guide](https://docs.sentry.io/product/performance/)
- [Session Replay Guide](https://docs.sentry.io/product/session-replay/)

## Support

For issues with this setup, contact the development team or file an issue in the repository.
