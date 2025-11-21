# Sentry Implementation Files

This document provides an overview of all files created or modified for Sentry error tracking integration.

## Configuration Files

### `/sentry.client.config.ts`
**Purpose**: Client-side (browser) error tracking and performance monitoring

**Features**:
- Automatic error capturing for React components
- Session replay for debugging user sessions (10% of sessions, 100% on errors)
- Web Vitals tracking (LCP, FID, CLS, FCP, TTFB)
- Breadcrumbs for user actions (clicks, navigation, fetch requests)
- PII filtering (removes sensitive data automatically)
- Browser profiling for performance optimization

**Sample Rates**:
- Errors: 100%
- Transactions: 10% (production), 100% (development)
- Session Replays: 10% (normal), 100% (when error occurs)
- Profiling: 10% (production), 100% (development)

**Exported Functions**:
- `setSentryUser(user)` - Set user context for error tracking
- `addSentryContext(key, data)` - Add custom context to errors
- `captureSentryException(error, context)` - Manually capture exceptions
- `captureSentryMessage(message, level)` - Capture informational messages

---

### `/sentry.server.config.ts`
**Purpose**: Server-side (Node.js) error tracking and performance monitoring

**Features**:
- API route error tracking
- Server-side rendering (SSR) error tracking
- HTTP request/response tracking
- Node.js profiling for performance optimization
- PII filtering for headers, cookies, and request data

**Sample Rates**:
- Errors: 100%
- Transactions: 20% (production), 100% (development)
- Profiling: 10% (production), 100% (development)

**Exported Functions**:
- `setSentryUser(user)` - Set user context
- `addSentryContext(key, data)` - Add custom context
- `captureSentryException(error, context)` - Capture exceptions
- `captureSentryMessage(message, level)` - Capture messages
- `trackSentryPerformance(name, operation, context)` - Track performance of async operations

---

### `/sentry.edge.config.ts`
**Purpose**: Edge runtime error tracking (middleware, edge functions)

**Features**:
- Lightweight configuration for fast cold starts
- Middleware error tracking
- Edge API route error tracking
- Geographic request tracking (with IP filtering)
- Minimal bundle size (optimized for edge runtime)

**Sample Rates**:
- Errors: 100%
- Transactions: 20% (production), 100% (development)

**Exported Functions**:
- `addSentryContext(key, data)` - Add custom context
- `captureSentryException(error, context)` - Capture exceptions
- `captureSentryMessage(message, level)` - Capture messages
- `trackEdgePerformance(name, operation, context)` - Track edge function performance

---

### `/instrumentation.ts`
**Purpose**: Next.js instrumentation hook for automatic Sentry initialization

**Features**:
- Automatically loads server config on Node.js runtime
- Automatically loads edge config on Edge runtime
- Runs before any server/edge code executes
- Recommended by Next.js for monitoring tools

**Note**: Requires `experimental.instrumentationHook: true` in next.config.ts

---

## Modified Files

### `/next.config.ts`
**Changes**:
1. Added `import { withSentryConfig } from '@sentry/nextjs'`
2. Enabled `experimental.instrumentationHook: true`
3. Added Sentry webpack plugin configuration
4. Wrapped config with `withSentryConfig()` for source maps upload

**Features**:
- Automatic source maps generation
- Source maps upload to Sentry (production only)
- Hide source maps from client bundles (security)
- React component annotation for better error messages
- Release tracking via Git commit SHA

---

### `/.env.example`
**Added Variables**:
```bash
# Sentry DSN (public, safe to expose)
NEXT_PUBLIC_SENTRY_DSN=https://your_key@your_org.ingest.sentry.io/your_project_id

# Sentry Auth Token (REQUIRED for source maps - KEEP SECRET)
SENTRY_AUTH_TOKEN=sntrys_your_auth_token_here

# Sentry Organization Slug
SENTRY_ORG=your-org-slug

# Sentry Project Slug
SENTRY_PROJECT=your-project-slug
```

---

## Documentation Files

### `/docs/SENTRY_SETUP.md`
Comprehensive setup and usage guide covering:
- Quick start instructions
- Account setup steps
- Environment variable configuration
- Usage examples for all exported functions
- Privacy & PII protection details
- Source maps configuration
- Monitoring dashboard setup
- Troubleshooting common issues
- Best practices and cost optimization

### `/docs/SENTRY_FILES.md`
This file - overview of all Sentry-related files and their purposes.

---

## Dependencies Added

### Package.json
```json
{
  "dependencies": {
    "@sentry/nextjs": "^8.x.x",
    "@sentry/react": "^8.x.x"
  }
}
```

**Total Bundle Impact**:
- Client bundle: ~35KB gzipped
- Server bundle: ~45KB
- Edge bundle: ~25KB (optimized)

---

## File Structure

```
/ai-born-website/
├── sentry.client.config.ts      # Client-side configuration
├── sentry.server.config.ts      # Server-side configuration
├── sentry.edge.config.ts        # Edge runtime configuration
├── instrumentation.ts           # Next.js instrumentation hook
├── next.config.ts               # Modified for Sentry webpack plugin
├── .env.example                 # Modified with Sentry variables
└── docs/
    ├── SENTRY_SETUP.md          # Setup and usage guide
    └── SENTRY_FILES.md          # This file
```

---

## Environment-Specific Behavior

### Development
- Sentry is **optional** (gracefully disabled if DSN not set)
- Higher sample rates for debugging (100%)
- Console logging enabled
- Debug mode enabled
- No source maps upload

### Staging
- Sentry is **optional** (recommend enabling)
- Medium sample rates (50%)
- Console logging disabled
- Debug mode disabled
- Source maps uploaded

### Production
- Sentry is **required** (should be enabled)
- Lower sample rates (10-20% for performance)
- Console logging disabled
- Debug mode disabled
- Source maps uploaded and hidden from client
- Release tracking enabled via Git commit SHA

---

## Privacy & Security Features

### Automatic PII Filtering

**URLs & Query Params**:
- `email`, `token`, `key`, `password`, `secret`, `api_key` → `[Filtered]`

**HTTP Headers**:
- `authorization`, `cookie`, `x-api-key`, `x-auth-token`, `x-csrf-token` → `[Filtered]`

**Form Inputs**:
- All input values masked by default in session replays

**IP Addresses**:
- Filtered in edge runtime context

**Breadcrumbs**:
- Sensitive data removed from HTTP request breadcrumbs
- Console logs filtered out in production

### Source Maps Security
- Source maps uploaded to Sentry only (not deployed)
- Hidden from client bundles via `hideSourceMaps: true`
- Original source code visible only in Sentry error reports
- Requires authentication to access

---

## Ignored Errors

To reduce noise and quota usage, the following errors are ignored:

**Browser Extensions**:
- `chrome-extension://`
- `moz-extension://`

**Network Errors**:
- `NetworkError`
- `Failed to fetch`
- `Load failed`
- `AbortError`

**Browser-Specific**:
- `QuotaExceededError` (Safari private browsing)
- `ResizeObserver loop limit exceeded`

**Next.js Framework**:
- `NEXT_NOT_FOUND` (intentional 404s)
- `NEXT_REDIRECT` (intentional redirects)

**Server-Side**:
- `ECONNRESET`, `EPIPE` (client disconnects)
- `ETIMEDOUT` (client timeouts)

---

## Integration Points

### Client-Side Integration

```typescript
// In React components
import { captureSentryException } from '@/sentry.client.config';

try {
  await submitForm();
} catch (error) {
  captureSentryException(error as Error, { form: 'newsletter' });
}
```

### Server-Side Integration

```typescript
// In API routes
import { trackSentryPerformance } from '@/sentry.server.config';

export async function POST(request: Request) {
  return trackSentryPerformance('api-email-capture', async () => {
    // Your API logic here
  });
}
```

### Edge Runtime Integration

```typescript
// In middleware
import { captureSentryException } from '@/sentry.edge.config';

export function middleware(request: NextRequest) {
  try {
    // Your middleware logic
  } catch (error) {
    captureSentryException(error as Error);
  }
}
```

---

## Next Steps

1. **Create Sentry Account**: Sign up at [sentry.io](https://sentry.io)
2. **Get DSN**: Copy from project settings
3. **Generate Auth Token**: Create with `project:releases` and `project:write` scopes
4. **Configure Environment**: Add variables to `.env.local` and Vercel
5. **Test in Development**: Trigger an error to verify Sentry captures it
6. **Deploy to Staging**: Test source maps upload and error tracking
7. **Set Up Alerts**: Configure notifications for critical errors
8. **Monitor Dashboard**: Review errors and performance regularly

---

## Support Resources

- **Sentry Docs**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Setup Guide**: `/docs/SENTRY_SETUP.md`
- **Next.js Integration**: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

---

**Last Updated**: 2025-10-18
**Version**: 1.0.0
