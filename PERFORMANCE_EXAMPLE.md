# Performance Monitoring Integration Example

## Example: Adding Performance Monitoring to Existing API Route

This example shows how to integrate performance monitoring into the existing `/api/excerpt/request` endpoint.

### Before (Original Code)

```typescript
export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  let clientIP = 'unknown';

  try {
    clientIP = getClientIP(request);
    const body = await request.json();

    // ... validation and processing

    await sendExcerptEmail(validatedData.email, validatedData.name);

    return NextResponse.json({
      success: true,
      message: 'Thank you! Check your email for the excerpt.',
      downloadUrl,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### After (With Performance Monitoring)

```typescript
import { measureAPIRoute, measureOperation } from '@/lib/performance';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  return measureAPIRoute('POST /api/excerpt/request', request, async () => {
    const timestamp = new Date().toISOString();
    let clientIP = 'unknown';

    try {
      clientIP = getClientIP(request);
      const body = await request.json();

      // ... validation

      // Measure email sending operation
      await measureOperation('sendExcerptEmail', async () => {
        return sendExcerptEmail(validatedData.email, validatedData.name);
      }, {
        recipient: validatedData.email,
        source: validatedData.source,
      });

      // Log structured success
      logger.info({
        email: validatedData.email,
        source: validatedData.source,
        ip: clientIP,
      }, 'Excerpt request successful');

      return NextResponse.json({
        success: true,
        message: 'Thank you! Check your email for the excerpt.',
        downloadUrl,
      });
    } catch (err) {
      // Structured error logging
      logger.error({
        err,
        ip: clientIP,
        path: '/api/excerpt/request',
      }, 'Excerpt request failed');

      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
```

### What Changed?

1. **Wrapped entire handler** with `measureAPIRoute`:
   - Automatically tracks request duration
   - Logs HTTP method, path, status code
   - Checks against API_ROUTE budget (≤1000ms)
   - Warns if budget exceeded

2. **Measured email operation** with `measureOperation`:
   - Tracks email sending time separately
   - Includes metadata (recipient, source)
   - Enables identifying slow email delivery

3. **Replaced console.log** with structured logger:
   - Proper log levels (info, error)
   - Automatic PII redaction
   - Searchable structured data
   - Production-ready format

### Benefits

#### Before Monitoring
```bash
[Excerpt Request] {"ip":"127.0.0.1","email":"user@example.com","success":true}
```

#### After Monitoring
```json
{
  "level": "info",
  "time": "2025-10-18T12:00:00.000Z",
  "type": "performance",
  "name": "APIRoute:POST /api/excerpt/request",
  "value": 234,
  "unit": "ms",
  "method": "POST",
  "path": "/api/excerpt/request",
  "statusCode": 200,
  "traceId": "trace_abc123",
  "msg": "API route completed"
}
```

### Performance Dashboard Output

After adding monitoring, the performance dashboard shows:

```json
{
  "endpoints": [
    {
      "name": "APIRoute:POST /api/excerpt/request",
      "count": 234,
      "avg": 234,
      "p50": 215,
      "p95": 356,
      "p99": 489,
      "min": 156,
      "max": 567
    }
  ],
  "budgetCompliance": {
    "byMetric": {
      "API_ROUTE": 98.7
    }
  }
}
```

## Example: Database Query Monitoring

### Before

```typescript
async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { bonusClaims: true },
  });
}
```

### After

```typescript
import { measureDatabaseQuery } from '@/lib/performance';

async function getUserByEmail(email: string) {
  return measureDatabaseQuery('findUnique', 'User', async () => {
    return prisma.user.findUnique({
      where: { email },
      include: { bonusClaims: true },
    });
  });
}
```

### Output

```json
{
  "level": "info",
  "type": "performance",
  "name": "DB:User.findUnique",
  "value": 23,
  "unit": "ms",
  "operation": "findUnique",
  "model": "User"
}
```

### Budget Warning

If query exceeds 100ms budget:

```json
{
  "level": "warn",
  "operation": "findUnique",
  "model": "User",
  "duration": 156,
  "threshold": 100,
  "exceeded": 56,
  "msg": "Database query exceeded budget: User.findUnique"
}
```

## Example: Server Action Monitoring

### Before

```typescript
'use server';

export async function createBonusClaim(data: BonusClaimInput) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    throw new Error('User not found');
  }

  return prisma.bonusClaim.create({
    data: {
      userId: user.id,
      retailer: data.retailer,
      status: 'pending',
    },
  });
}
```

### After

```typescript
'use server';

import { measureServerAction, measureDatabaseQuery } from '@/lib/performance';

export const createBonusClaim = measureServerAction('createBonusClaim', async (data: BonusClaimInput) => {
  const user = await measureDatabaseQuery('findUnique', 'User', async () => {
    return prisma.user.findUnique({ where: { email: data.email } });
  });

  if (!user) {
    throw new Error('User not found');
  }

  return measureDatabaseQuery('create', 'BonusClaim', async () => {
    return prisma.bonusClaim.create({
      data: {
        userId: user.id,
        retailer: data.retailer,
        status: 'pending',
      },
    });
  });
});
```

### Output

```json
{
  "level": "info",
  "type": "performance",
  "name": "ServerAction:createBonusClaim",
  "value": 145,
  "unit": "ms",
  "type": "server_action",
  "actionName": "createBonusClaim",
  "traceId": "trace_xyz789"
}
```

## Example: Client-Side Component Monitoring

### Before

```typescript
'use client';

function ExcerptForm() {
  const [email, setEmail] = useState('');

  async function handleSubmit() {
    const res = await fetch('/api/excerpt/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    console.log('Form submitted');
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### After

```typescript
'use client';

import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

function ExcerptForm() {
  const [email, setEmail] = useState('');
  const { trackEvent } = usePerformanceMonitor('ExcerptForm', {
    trackRenderTime: true,
    slowRenderThreshold: 50,
  });

  async function handleSubmit() {
    const start = performance.now();

    const res = await fetch('/api/excerpt/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    const duration = performance.now() - start;
    const data = await res.json();

    trackEvent('form_submitted', {
      duration,
      success: res.ok,
      statusCode: res.status,
    });
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### GTM DataLayer Output

```javascript
{
  "event": "performance_event",
  "event_name": "form_submitted",
  "component": "ExcerptForm",
  "duration": 234,
  "success": true,
  "statusCode": 200,
  "timestamp": "2025-10-18T12:00:00.000Z"
}
```

## Complete Integration Example

Here's a complete example showing end-to-end monitoring:

```typescript
// ============================================
// Server: API Route with Full Monitoring
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { measureAPIRoute, measureDatabaseQuery, measureOperation } from '@/lib/performance';
import { logger } from '@/lib/logger';
import { checkMetricBudget, sendBudgetAlert } from '@/lib/performance-budgets';

export async function POST(request: NextRequest) {
  return measureAPIRoute('POST /api/users', request, async () => {
    try {
      // Parse request
      const body = await request.json();

      // Database query with monitoring
      const existingUser = await measureDatabaseQuery('findUnique', 'User', async () => {
        return prisma.user.findUnique({ where: { email: body.email } });
      });

      if (existingUser) {
        return NextResponse.json({ error: 'User exists' }, { status: 400 });
      }

      // Create user
      const user = await measureDatabaseQuery('create', 'User', async () => {
        return prisma.user.create({ data: body });
      });

      // Send welcome email
      await measureOperation('sendWelcomeEmail', async () => {
        return sendEmail(user.email, 'Welcome!');
      }, { userId: user.id });

      // Check if we exceeded budget
      const check = checkMetricBudget('API_ROUTE', performance.now());
      if (!check.passed) {
        await sendBudgetAlert(check, {
          enabled: true,
          threshold: 10,
          destinations: ['log', 'sentry'],
        });
      }

      logger.info({ userId: user.id }, 'User created successfully');

      return NextResponse.json({ user }, { status: 201 });

    } catch (error) {
      logger.error({ err: error }, 'Failed to create user');
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
  });
}
```

```typescript
// ============================================
// Client: Component with Full Monitoring
// ============================================

'use client';

import { usePerformanceMonitor, useOperationTracker } from '@/hooks/usePerformanceMonitor';

function UserRegistration() {
  const { trackEvent, mark, measure } = usePerformanceMonitor('UserRegistration', {
    trackRenderTime: true,
    slowRenderThreshold: 50,
  });
  const trackOperation = useOperationTracker();

  async function handleRegister(email: string) {
    const endTracking = trackOperation('registerUser');

    mark('registration-start');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      const duration = measure('registration', 'registration-start');

      if (res.ok) {
        endTracking(true);
        trackEvent('registration_success', { duration });
      } else {
        endTracking(false);
        trackEvent('registration_failed', { duration, statusCode: res.status });
      }

    } catch (error) {
      const duration = measure('registration', 'registration-start');
      endTracking(false, error);
      trackEvent('registration_error', { duration });
    }
  }

  return <form onSubmit={() => handleRegister(email)}>...</form>;
}
```

## Monitoring Results

After implementing full monitoring, the dashboard shows:

```json
{
  "summary": {
    "totalRequests": 1543,
    "averageResponseTime": 234,
    "p95": 456,
    "p99": 789,
    "errorRate": 0.32,
    "performanceScore": 94,
    "performanceGrade": "A"
  },
  "slowestEndpoints": [
    {
      "name": "APIRoute:POST /api/users",
      "p95": 456,
      "count": 234
    },
    {
      "name": "DB:User.create",
      "p95": 89,
      "count": 234
    },
    {
      "name": "sendWelcomeEmail",
      "p95": 156,
      "count": 234
    }
  ],
  "budgetCompliance": {
    "overallRate": 98.7,
    "byMetric": {
      "API_ROUTE": 99.2,
      "DATABASE_QUERY": 97.8
    },
    "recentViolations": 3
  }
}
```

## Next Steps

1. **Add monitoring to all API routes**
   ```bash
   # Find all route handlers
   find src/app/api -name "route.ts" -exec grep -L "measureAPIRoute" {} \;
   ```

2. **Monitor critical database queries**
   ```bash
   # Find Prisma queries
   grep -r "prisma\." src/ --include="*.ts"
   ```

3. **Set up performance alerts**
   ```typescript
   // In production environment variables
   ADMIN_API_KEY=your-key-here
   OTEL_EXPORTER_OTLP_ENDPOINT=https://your-otlp-endpoint
   ```

4. **Create performance review workflow**
   ```bash
   # Weekly cron job
   curl -H "Authorization: Bearer $ADMIN_API_KEY" \
     https://ai-born.org/api/admin/performance | \
     jq '.summary' > weekly-performance-report.json
   ```

## Troubleshooting

If you don't see performance data:

1. Check that monitoring is imported:
   ```typescript
   import { measureAPIRoute } from '@/lib/performance';
   ```

2. Verify the route is wrapped:
   ```typescript
   export async function GET(request: Request) {
     return measureAPIRoute('GET /api/example', request, async () => {
       // handler code
     });
   }
   ```

3. Make some requests to generate data:
   ```bash
   for i in {1..10}; do curl http://localhost:3000/api/example; done
   ```

4. Check the dashboard:
   ```bash
   curl http://localhost:3000/api/admin/performance | jq
   ```
