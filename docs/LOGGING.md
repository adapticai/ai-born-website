# Logging Infrastructure Documentation

**Version:** 1.0
**Last Updated:** 18 October 2025

## Overview

The AI-Born website implements production-grade structured logging using Pino, providing:

- **High-performance JSON logging** (10x faster than alternatives)
- **Automatic PII redaction** for compliance
- **Request/response tracking** with unique IDs
- **Error aggregation** with stack traces
- **Performance metrics** tracking
- **Analytics event logging**
- **TypeScript-safe** logging functions

---

## Table of Contents

1. [Architecture](#architecture)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Architecture

### Components

```
src/
├── lib/
│   └── logger.ts              # Core logging infrastructure
├── middleware/
│   └── logging.ts             # Request/response middleware
├── app/api/
│   ├── log-client-error/      # Client error logging endpoint
│   └── example-logging/       # Example API route with logging
└── examples/
    ├── server-action-logging.ts   # Server action examples
    └── client-error-logging.tsx   # Client-side error handling
```

### Key Features

#### 1. Environment-Aware Configuration

- **Development:** Pretty-printed, colorized output for readability
- **Production:** Structured JSON for parsing and aggregation

#### 2. Automatic PII Redaction

Sensitive fields automatically redacted:
- `email`
- `password`
- `token`, `accessToken`, `refreshToken`
- `apiKey`
- `creditCard`, `ssn`
- `phoneNumber`, `address`

#### 3. Request Context Injection

Every log automatically includes:
- `requestId` - Unique request identifier
- `userId` - Authenticated user ID (if available)
- `sessionId` - Session identifier
- `path` - Request path
- `method` - HTTP method
- `statusCode` - Response status
- `duration` - Request duration in ms

---

## Quick Start

### 1. Install Dependencies

```bash
npm install pino pino-pretty next-logger
```

### 2. Configure Environment

Add to `.env.local`:

```bash
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
```

### 3. Basic Usage

```typescript
import { logger } from '@/lib/logger';

// Simple message
logger.info('Application started');

// With context
logger.info({ userId: '123', action: 'login' }, 'User logged in');

// Error logging
try {
  // ... some operation
} catch (error) {
  logger.error({ err: error, userId: '123' }, 'Operation failed');
}
```

---

## Configuration

### Environment Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `LOG_LEVEL` | `trace\|debug\|info\|warn\|error\|fatal` | `info` | Minimum log level to output |
| `ENABLE_REQUEST_LOGGING` | `boolean` | `true` | Enable automatic request logging |
| `NODE_ENV` | `development\|production` | - | Controls output format |

### Log Levels

From most verbose to least:

1. **trace** - Very detailed debugging (disabled in production)
2. **debug** - Debugging information
3. **info** - General informational messages (default)
4. **warn** - Warning messages (non-critical issues)
5. **error** - Error messages
6. **fatal** - Critical errors (process should exit)

### Log Output Format

#### Development (Pretty Print)

```
[14:32:45.123] INFO: User logged in
    userId: "123"
    action: "login"
```

#### Production (JSON)

```json
{
  "level": "info",
  "time": "2025-10-18T14:32:45.123Z",
  "msg": "User logged in",
  "userId": "123",
  "action": "login",
  "env": "production",
  "pid": 1234
}
```

---

## Usage Examples

### API Routes

#### Option 1: Using `withLogging` wrapper (Recommended)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withLogging, getRequestLogger } from '@/middleware/logging';

export const GET = withLogging(async (request: NextRequest) => {
  const log = getRequestLogger(request);

  log.info('Processing request');

  try {
    const data = await fetchData();
    log.info({ dataSize: data.length }, 'Request successful');
    return NextResponse.json(data);
  } catch (error) {
    log.error({ err: error }, 'Request failed');
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
});
```

#### Option 2: Manual logging

```typescript
export async function POST(request: NextRequest) {
  const log = getRequestLogger(request);
  const startTime = Date.now();

  try {
    const body = await request.json();
    log.info({ bodyKeys: Object.keys(body) }, 'Received POST');

    // ... process request

    const duration = Date.now() - startTime;
    log.info({ duration }, 'Request completed');

    return NextResponse.json({ success: true });
  } catch (error) {
    const duration = Date.now() - startTime;
    log.error({ err: error, duration }, 'Request failed');
    throw error;
  }
}
```

### Server Actions

```typescript
'use server';

import { withServerActionLogging } from '@/middleware/logging';
import { logger } from '@/lib/logger';

export const submitForm = withServerActionLogging(
  'submitForm',
  async (formData: FormData) => {
    const log = logger.child({ action: 'form-submit' });

    try {
      const email = formData.get('email');
      log.info('Form submission received');

      // Process form
      await processSubmission(email);

      // Log analytics
      logger.analytics({
        event: 'form_submit',
        properties: { form: 'email-capture' },
      });

      log.info('Form processed successfully');
      return { success: true };
    } catch (error) {
      log.error({ err: error }, 'Form processing failed');
      return { success: false, error: 'Processing failed' };
    }
  }
);
```

### Client-Side Error Logging

```typescript
'use client';

import { useErrorReporting } from '@/examples/client-error-logging';

export function MyComponent() {
  const { reportError } = useErrorReporting();

  const handleAction = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      if (error instanceof Error) {
        reportError(error, {
          component: 'MyComponent',
          action: 'handleAction',
        });
      }
      // Show user-friendly error
    }
  };

  return <button onClick={handleAction}>Action</button>;
}
```

### Child Loggers (Scoped Context)

```typescript
import { logger } from '@/lib/logger';

// Create logger with persistent context
const userLogger = logger.child({
  userId: '123',
  sessionId: 'abc',
});

// All logs include userId and sessionId
userLogger.info('User action'); // Includes userId: "123"
userLogger.error({ err }, 'Action failed'); // Includes userId: "123"
```

### Module Loggers

```typescript
import { createModuleLogger } from '@/lib/logger';

const log = createModuleLogger('EmailService');

log.info('Sending email'); // Includes module: "EmailService"
log.error({ err }, 'Failed to send'); // Includes module: "EmailService"
```

### Performance Tracking

```typescript
import { logExecutionTime } from '@/lib/logger';

const result = await logExecutionTime(
  'fetchUserData',
  async () => {
    return await db.user.findMany();
  },
  { source: 'user-service' }
);

// Automatically logs:
// { name: "fetchUserData", value: 234, unit: "ms", source: "user-service" }
```

### Analytics Events

```typescript
import { logger } from '@/lib/logger';

logger.analytics({
  event: 'preorder_click',
  userId: '123',
  sessionId: 'abc',
  properties: {
    retailer: 'amazon',
    format: 'hardcover',
  },
});

// Output:
// { type: "analytics", event: "preorder_click", userId: "123", ... }
```

### Different Log Levels

```typescript
import { logger } from '@/lib/logger';

// Debug: detailed information (development only)
logger.debug({ requestHeaders }, 'Request received');

// Info: general informational messages
logger.info({ userId: '123' }, 'User logged in');

// Warn: warning messages (non-critical)
logger.warn({ reason: 'rate-limit' }, 'Request throttled');

// Error: error messages
logger.error({ err: error }, 'Operation failed');

// Fatal: critical errors (process should exit)
logger.fatal({ err: error }, 'Database connection lost');
```

---

## Best Practices

### 1. Always Include Context

**Good:**
```typescript
logger.info({ userId, orderId, retailer }, 'Order placed');
```

**Bad:**
```typescript
logger.info('Order placed');
```

### 2. Use Appropriate Log Levels

- **Debug:** Detailed debugging (not in production)
- **Info:** Normal operations, business events
- **Warn:** Unexpected but handled situations
- **Error:** Errors that need attention
- **Fatal:** Critical failures requiring immediate action

### 3. Log Errors with Context

**Good:**
```typescript
try {
  await processOrder(orderId);
} catch (error) {
  logger.error(
    {
      err: error,
      orderId,
      userId,
      step: 'payment',
    },
    'Order processing failed'
  );
  throw error;
}
```

**Bad:**
```typescript
try {
  await processOrder(orderId);
} catch (error) {
  logger.error('Error');
  throw error;
}
```

### 4. Use Child Loggers for Persistent Context

```typescript
// Create once per request/session
const requestLogger = logger.child({
  requestId: req.id,
  userId: req.user?.id,
});

// Use throughout request lifecycle
requestLogger.info('Processing started');
requestLogger.info('Validation passed');
requestLogger.info('Processing completed');
```

### 5. Never Log Sensitive Data

```typescript
// NEVER do this:
logger.info({ password: user.password }, 'Login attempt');
logger.info({ creditCard: payment.card }, 'Payment');

// Instead:
logger.info({ userId: user.id }, 'Login attempt');
logger.info({ paymentMethod: 'card' }, 'Payment');
```

### 6. Structure Your Logs

```typescript
// Good structure
logger.info({
  event: 'user_signup',
  userId: user.id,
  source: 'email-form',
  timestamp: new Date().toISOString(),
}, 'User signup completed');

// Easy to query in log aggregation tools:
// - Find all user_signup events
// - Filter by source
// - Track by userId
```

### 7. Log Business Events for Analytics

```typescript
// Track important business events
logger.analytics({
  event: 'preorder_click',
  properties: {
    retailer: 'amazon',
    format: 'hardcover',
    price: 29.99,
  },
});

// Can be used for:
// - Business intelligence
// - A/B testing analysis
// - Conversion tracking
```

---

## Production Deployment

### 1. Log Aggregation

Production logs should be aggregated to a centralized service:

**Recommended Services:**
- **Datadog** - Full-featured APM
- **LogDNA/Mezmo** - Log management
- **Logtail** - Simple, developer-friendly
- **CloudWatch** (AWS) - AWS-native
- **Google Cloud Logging** (GCP)

### 2. Vercel Deployment

Logs automatically stream to Vercel Dashboard:

```bash
# View logs
vercel logs [deployment-url]

# Stream logs in real-time
vercel logs --follow
```

### 3. Environment Configuration

**Production `.env`:**
```bash
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
NODE_ENV=production
```

**Staging `.env`:**
```bash
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
NODE_ENV=production
```

### 4. Log Rotation

For self-hosted deployments, configure log rotation:

```json
// pino-config.json
{
  "logRotation": {
    "maxFiles": 7,
    "maxSize": "100m",
    "compress": true
  }
}
```

### 5. Monitoring & Alerts

Set up alerts for:
- **Error rate** > threshold
- **Response time** > 2s
- **Fatal errors** (immediate notification)
- **High volume** of warnings

---

## Troubleshooting

### Logs Not Appearing

**Issue:** No logs in development

**Solution:**
```bash
# Check environment
echo $NODE_ENV
echo $LOG_LEVEL

# Ensure not set to 'silent'
LOG_LEVEL=debug npm run dev
```

### Pretty Printing Not Working

**Issue:** Seeing JSON in development

**Solution:**
```bash
# Ensure pino-pretty is installed
npm install pino-pretty

# Check NODE_ENV
NODE_ENV=development npm run dev
```

### Too Many Logs

**Issue:** Log volume too high

**Solution:**
```bash
# Increase log level
LOG_LEVEL=warn

# Disable request logging for static assets
# (already configured in middleware)

# Exclude specific paths in middleware/logging.ts
```

### PII Not Redacted

**Issue:** Sensitive data in logs

**Solution:**
```typescript
// Add to PII_FIELDS array in lib/logger.ts
const PII_FIELDS = [
  'email',
  'password',
  'yourCustomField', // Add here
];
```

### Request ID Missing

**Issue:** No requestId in logs

**Solution:**
```typescript
// Ensure middleware is configured
// In middleware.ts:
import { loggingMiddleware } from '@/middleware/logging';

export function middleware(request: NextRequest) {
  return loggingMiddleware(request);
}
```

---

## Performance Considerations

### Pino Performance

Pino is extremely fast (10x faster than Winston):
- **Sync writes** by default (no backpressure)
- **Minimal overhead** (~1-2ms per log)
- **JSON serialization** optimized

### Production Impact

Logging overhead in production:
- **Request logging:** ~1-2ms per request
- **Error logging:** ~2-3ms per error
- **Analytics logging:** <1ms per event

**Total:** <1% performance impact

### Optimization Tips

1. **Use appropriate log levels** (don't debug in production)
2. **Avoid logging in hot paths** (tight loops)
3. **Use child loggers** to reduce context creation
4. **Sample high-volume logs** if needed

---

## Integration with Monitoring

### Sentry Integration

```typescript
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

try {
  await riskyOperation();
} catch (error) {
  // Log to Pino
  logger.error({ err: error }, 'Operation failed');

  // Also send to Sentry
  Sentry.captureException(error);

  throw error;
}
```

### Custom Monitoring Service

```typescript
// lib/monitoring.ts
import { logger } from '@/lib/logger';

export function trackMetric(name: string, value: number) {
  // Log locally
  logger.performance({ name, value, unit: 'ms' });

  // Send to monitoring service
  monitoring.track(name, value);
}
```

---

## Examples Summary

All examples available in:
- `/src/app/api/example-logging/route.ts` - API routes
- `/src/examples/server-action-logging.ts` - Server actions
- `/src/examples/client-error-logging.tsx` - Client-side errors
- `/src/app/api/log-client-error/route.ts` - Client error endpoint

---

## Support

For questions or issues:
1. Check [troubleshooting](#troubleshooting) section
2. Review [examples](#usage-examples)
3. Consult [Pino documentation](https://getpino.io/)

---

**Last Updated:** 18 October 2025
**Maintained By:** Engineering Team
