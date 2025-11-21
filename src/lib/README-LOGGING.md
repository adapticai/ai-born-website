# Logging Infrastructure - Quick Reference

## Installation

```bash
npm install pino pino-pretty next-logger
```

## Environment Configuration

Add to `.env.local`:

```bash
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
```

## Quick Start

### Basic Logging

```typescript
import { logger } from '@/lib/logger';

// Simple message
logger.info('Application started');

// With context
logger.info({ userId: '123', action: 'login' }, 'User logged in');

// Error logging
logger.error({ err: error, userId: '123' }, 'Operation failed');
```

### API Routes

```typescript
import { withLogging, getRequestLogger } from '@/middleware/logging';

export const GET = withLogging(async (request: NextRequest) => {
  const log = getRequestLogger(request);

  log.info('Processing request');
  // ... handler logic

  return NextResponse.json({ data: 'success' });
});
```

### Server Actions

```typescript
'use server';

import { withServerActionLogging } from '@/middleware/logging';

export const submitForm = withServerActionLogging(
  'submitForm',
  async (formData: FormData) => {
    // ... action logic
  }
);
```

### Client-Side Errors

```typescript
'use client';

import { useErrorReporting } from '@/examples/client-error-logging';

export function MyComponent() {
  const { reportError } = useErrorReporting();

  const handleError = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      reportError(error as Error, { component: 'MyComponent' });
    }
  };
}
```

## Log Levels

| Level | Usage |
|-------|-------|
| `trace` | Very detailed debugging (disabled in production) |
| `debug` | Debugging information |
| `info` | General informational messages (default) |
| `warn` | Warning messages (non-critical issues) |
| `error` | Error messages |
| `fatal` | Critical errors (process should exit) |

## Features

- ✅ High-performance JSON logging (Pino)
- ✅ Automatic PII redaction
- ✅ Request/response tracking
- ✅ Error aggregation with stack traces
- ✅ Performance metrics
- ✅ Analytics event logging
- ✅ TypeScript-safe logging functions

## Documentation

Full documentation: `/docs/LOGGING.md`

## Examples

- API Routes: `/src/app/api/example-logging/route.ts`
- Server Actions: `/src/examples/server-action-logging.ts`
- Client Errors: `/src/examples/client-error-logging.tsx`

## Production Deployment

1. Set environment variables:
   ```bash
   LOG_LEVEL=info
   ENABLE_REQUEST_LOGGING=true
   ```

2. Configure log aggregation (Datadog, LogDNA, etc.)

3. Set up alerts for error rates and performance

## Support

See [LOGGING.md](/docs/LOGGING.md) for comprehensive documentation.
