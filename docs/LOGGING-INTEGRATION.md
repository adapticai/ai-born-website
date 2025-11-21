# Logging Integration Guide

This guide shows how to integrate the logging infrastructure into your AI-Born application.

---

## Quick Setup (5 minutes)

### 1. Environment Configuration

Create `.env.local`:

```bash
# Copy from .env.example
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
```

### 2. Verify Installation

```bash
npm list pino pino-pretty next-logger
```

Should show:
```
├── pino@10.1.0
├── pino-pretty@13.1.2
└── next-logger@5.0.2
```

### 3. Test Logging

Create a test file or add to existing code:

```typescript
import { logger } from '@/lib/logger';

logger.info('Logging infrastructure is working!');
```

Run your app:
```bash
npm run dev
```

You should see colorized output in your console.

---

## Integration Steps

### Step 1: Update Middleware (Optional)

If you want automatic request logging, add to `/src/middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { loggingMiddleware } from '@/middleware/logging';

export function middleware(request: NextRequest) {
  // Add request logging
  const response = loggingMiddleware(request);

  // Add any other middleware logic here

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Step 2: Update API Routes

Replace existing API routes with logged versions:

**Before:**
```typescript
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

**After:**
```typescript
import { withLogging, getRequestLogger } from '@/middleware/logging';

export const GET = withLogging(async (request: NextRequest) => {
  const log = getRequestLogger(request);

  try {
    log.info('Fetching data');
    const data = await fetchData();
    log.info({ dataSize: data.length }, 'Data fetched successfully');
    return NextResponse.json(data);
  } catch (error) {
    log.error({ err: error }, 'Failed to fetch data');
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
});
```

### Step 3: Update Server Actions

Replace existing server actions:

**Before:**
```typescript
'use server';

export async function submitForm(formData: FormData) {
  try {
    console.log('Processing form');
    await processData(formData);
    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false };
  }
}
```

**After:**
```typescript
'use server';

import { withServerActionLogging } from '@/middleware/logging';
import { logger } from '@/lib/logger';

export const submitForm = withServerActionLogging(
  'submitForm',
  async (formData: FormData) => {
    const log = logger.child({ action: 'form-submit' });

    try {
      log.info('Processing form submission');
      await processData(formData);

      // Log analytics
      logger.analytics({
        event: 'form_submit',
        properties: { form: 'contact' },
      });

      log.info('Form processed successfully');
      return { success: true };
    } catch (error) {
      log.error({ err: error }, 'Form processing failed');
      return { success: false };
    }
  }
);
```

### Step 4: Add Client Error Logging

Add to your root layout `/src/app/layout.tsx`:

```typescript
import { setupGlobalErrorHandlers } from '@/examples/client-error-logging';
import { useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set up global error handlers
    setupGlobalErrorHandlers();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Step 5: Replace Console Statements

Find and replace all `console.log`, `console.error`, etc.:

```bash
# Find all console statements
grep -r "console\." src/

# Replace with logger
```

**Before:**
```typescript
console.log('User logged in:', userId);
console.error('Error occurred:', error);
```

**After:**
```typescript
import { logger } from '@/lib/logger';

logger.info({ userId }, 'User logged in');
logger.error({ err: error }, 'Error occurred');
```

---

## Common Patterns

### Pattern 1: Service/Module Logger

```typescript
// services/email.ts
import { createModuleLogger } from '@/lib/logger';

const log = createModuleLogger('EmailService');

export class EmailService {
  async send(to: string, subject: string) {
    log.info({ to, subject }, 'Sending email');

    try {
      await this.transport.send({ to, subject });
      log.info({ to }, 'Email sent successfully');
    } catch (error) {
      log.error({ err: error, to }, 'Failed to send email');
      throw error;
    }
  }
}
```

### Pattern 2: Request-Scoped Logger

```typescript
// Use throughout a request lifecycle
export async function GET(request: NextRequest) {
  const log = getRequestLogger(request);

  log.info('Request started');

  const userId = await authenticate(request);
  log.info({ userId }, 'User authenticated');

  const data = await fetchUserData(userId);
  log.info({ dataSize: data.length }, 'Data fetched');

  log.info('Request completed');

  return NextResponse.json(data);
}
```

### Pattern 3: Performance Tracking

```typescript
import { logExecutionTime } from '@/lib/logger';

// Automatically logs execution time
const data = await logExecutionTime(
  'fetchExpensiveData',
  async () => {
    return await expensiveOperation();
  },
  { userId: '123' }
);
```

### Pattern 4: Analytics Events

```typescript
import { logger } from '@/lib/logger';

// Track business events
logger.analytics({
  event: 'preorder_click',
  userId: '123',
  sessionId: 'abc',
  properties: {
    retailer: 'amazon',
    format: 'hardcover',
    price: 29.99,
  },
});
```

---

## Migration Checklist

- [ ] Environment variables configured (`.env.local`)
- [ ] Middleware updated with logging (if using)
- [ ] API routes converted to use `withLogging`
- [ ] Server actions converted to use `withServerActionLogging`
- [ ] Client error handlers set up
- [ ] All `console.log` replaced with `logger.info`
- [ ] All `console.error` replaced with `logger.error`
- [ ] Performance-critical paths instrumented
- [ ] Analytics events added for key user actions
- [ ] Error logging includes proper context
- [ ] Tests passing with new logging
- [ ] Tested in development environment
- [ ] Tested in staging/production

---

## Verifying Integration

### 1. Check Console Output (Development)

Run your app and verify logs appear:

```bash
npm run dev
```

You should see:
```
[14:32:45.123] INFO: Incoming request
    method: "GET"
    path: "/api/test"
    requestId: "req_1234567890_abc123"
```

### 2. Check JSON Output (Production)

Set `NODE_ENV=production` and verify JSON output:

```bash
NODE_ENV=production npm run build
NODE_ENV=production npm start
```

Logs should be JSON:
```json
{
  "level": "info",
  "time": "2025-10-18T14:32:45.123Z",
  "msg": "Incoming request",
  "method": "GET",
  "path": "/api/test"
}
```

### 3. Test Error Logging

Trigger an error and verify it's logged:

```typescript
try {
  throw new Error('Test error');
} catch (error) {
  logger.error({ err: error }, 'Test error logging');
}
```

Should log with stack trace.

### 4. Test PII Redaction

Log sensitive data and verify redaction:

```typescript
logger.info({
  email: 'user@example.com',
  password: 'secret',
}, 'Test PII redaction');
```

Should show:
```
email: "[REDACTED]"
password: "[REDACTED]"
```

---

## Production Deployment

### 1. Set Environment Variables

In Vercel/hosting provider:

```bash
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
NODE_ENV=production
```

### 2. Configure Log Aggregation

Choose a service:
- **Datadog:** Add Datadog integration to Vercel
- **LogDNA:** Stream logs via webhook
- **Logtail:** Add Logtail integration

### 3. Set Up Alerts

Configure alerts for:
- Error rate > 1%
- Response time > 2s
- Fatal errors (immediate notification)

### 4. Create Dashboards

Track:
- Request volume by endpoint
- Error rates by type
- Response time percentiles (p50, p95, p99)
- Analytics events

---

## Troubleshooting

### Issue: No logs appearing

**Solution:**
```bash
# Check environment
echo $LOG_LEVEL
echo $NODE_ENV

# Set explicitly
LOG_LEVEL=debug npm run dev
```

### Issue: JSON output in development

**Solution:**
```bash
# Ensure NODE_ENV is development
NODE_ENV=development npm run dev
```

### Issue: PII not redacted

**Solution:**
Check field names match PII_FIELDS in `/src/lib/logger.ts`. Add custom fields if needed.

### Issue: Request ID missing

**Solution:**
Ensure middleware is configured in `/src/middleware.ts`.

---

## Next Steps

1. **Review Examples**
   - `/src/app/api/example-logging/route.ts`
   - `/src/examples/server-action-logging.ts`
   - `/src/examples/client-error-logging.tsx`

2. **Read Documentation**
   - `/docs/LOGGING.md` - Full documentation
   - `/src/lib/README-LOGGING.md` - Quick reference

3. **Set Up Monitoring**
   - Configure log aggregation
   - Create dashboards
   - Set up alerts

4. **Optimize**
   - Review log volume
   - Adjust log levels
   - Add performance tracking

---

**Need Help?**

See `/docs/LOGGING.md` for comprehensive documentation and troubleshooting.
