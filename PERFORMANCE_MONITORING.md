# Performance Monitoring Documentation

## Overview

Comprehensive performance monitoring system for the AI-Born website, integrated with OpenTelemetry for distributed tracing and automated budget violation detection.

## Features

- **Server-Side Monitoring**
  - Server action timing with automatic budget checks
  - API route performance tracking
  - Database query monitoring
  - Distributed tracing with OpenTelemetry

- **Client-Side Monitoring**
  - Web Vitals tracking (LCP, FID, CLS, INP, TTFB, FCP)
  - Route change performance
  - Component render time tracking
  - Custom performance marks and measures

- **Performance Budgets** (from CLAUDE.md)
  - LCP ≤ 2.0s
  - TBT ≤ 150ms
  - CLS ≤ 0.1
  - FID ≤ 100ms
  - INP ≤ 200ms
  - TTFB ≤ 600ms
  - API Route ≤ 1000ms
  - Server Action ≤ 2000ms
  - Database Query ≤ 100ms

- **Automated Alerts**
  - Budget violation detection
  - Logging to structured logger
  - Sentry integration
  - Custom webhook support

## Installation

All required packages are already installed:

```bash
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
npm install @opentelemetry/api @opentelemetry/resources
npm install @opentelemetry/semantic-conventions
npm install @opentelemetry/exporter-trace-otlp-http
```

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# OpenTelemetry OTLP Endpoint (optional)
# Set this to export traces to an OpenTelemetry-compatible backend
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces

# Performance Dashboard Admin API Key
# Required for production access to /api/admin/performance
ADMIN_API_KEY=your-admin-api-key-here
```

### Automatic Instrumentation

OpenTelemetry is automatically initialized via Next.js instrumentation:

- `instrumentation.ts` - Next.js entry point
- `instrumentation.node.ts` - OpenTelemetry SDK configuration

No additional setup required. Instrumentation starts automatically when the app boots.

## Usage

### Server Actions

Wrap server actions with `measureServerAction`:

```typescript
'use server';

import { measureServerAction } from '@/lib/performance';

export const createUser = measureServerAction('createUser', async (data) => {
  // Your action code here
  const user = await prisma.user.create({ data });
  return user;
});

// Automatically logs:
// - Execution time
// - Success/failure status
// - Budget violations (if >2000ms)
```

### API Routes

Wrap route handlers with `measureAPIRoute`:

```typescript
import { NextResponse } from 'next/server';
import { measureAPIRoute } from '@/lib/performance';

export async function GET(request: Request) {
  return measureAPIRoute('GET /api/users', request, async () => {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  });
}

// Automatically logs:
// - Response time
// - HTTP status code
// - Budget violations (if >1000ms)
// - Error details (if failed)
```

### Database Queries

Wrap Prisma queries with `measureDatabaseQuery`:

```typescript
import { measureDatabaseQuery } from '@/lib/performance';

// In your data access layer
async function getUsers() {
  return measureDatabaseQuery('findMany', 'User', async () => {
    return prisma.user.findMany({ where: { active: true } });
  });
}

// Automatically logs:
// - Query execution time
// - Budget violations (if >100ms)
// - Error details (if failed)
```

### Generic Operations

Measure any async operation:

```typescript
import { measureOperation } from '@/lib/performance';

async function sendEmail(to: string, subject: string) {
  return measureOperation('sendEmail', async () => {
    return await resend.emails.send({ to, subject, html: '...' });
  }, { recipient: to });
}
```

### Client-Side Monitoring

#### Web Vitals (Automatic)

Web Vitals are automatically tracked on all pages via the analytics integration:

```typescript
// Already configured in src/lib/analytics.ts
import { trackWebVital } from '@/lib/analytics';

// Automatically tracks:
// - LCP (Largest Contentful Paint)
// - FID (First Input Delay)
// - CLS (Cumulative Layout Shift)
// - INP (Interaction to Next Paint)
// - TTFB (Time to First Byte)
// - FCP (First Contentful Paint)
```

#### Component Performance Monitoring

Use the `usePerformanceMonitor` hook:

```typescript
'use client';

import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

function MyComponent() {
  const { trackEvent, trackRender, mark, measure } = usePerformanceMonitor('MyComponent', {
    trackRenderTime: true,
    slowRenderThreshold: 50, // Warn if render >50ms
  });

  const handleClick = async () => {
    mark('fetch-start');

    await fetchData();

    const duration = measure('data-fetch', 'fetch-start');
    trackEvent('data_fetched', { duration });
  };

  return <button onClick={handleClick}>Load Data</button>;
}
```

#### Route Change Tracking

Automatically track navigation performance:

```typescript
'use client';

import { useNavigationTracker } from '@/hooks/usePerformanceMonitor';

function Layout({ children }) {
  useNavigationTracker(); // Automatically tracks all route changes

  return <div>{children}</div>;
}
```

#### Operation Tracking

Track async operations on the client:

```typescript
'use client';

import { useOperationTracker } from '@/hooks/usePerformanceMonitor';

function DataFetcher() {
  const trackOperation = useOperationTracker();

  async function fetchData() {
    const endTracking = trackOperation('fetchUserData');

    try {
      const data = await fetch('/api/users');
      endTracking(true); // Success
      return data;
    } catch (error) {
      endTracking(false, error); // Failed
      throw error;
    }
  }

  return <button onClick={fetchData}>Fetch</button>;
}
```

## Performance Dashboard

Access real-time performance metrics at `/api/admin/performance`.

### Dashboard Data

```typescript
interface PerformanceDashboard {
  timestamp: string;
  summary: {
    totalRequests: number;
    averageResponseTime: number;
    p95: number;  // 95th percentile
    p99: number;  // 99th percentile
    errorRate: number;
    performanceScore: number;  // 0-100
    performanceGrade: string;  // A+ to F
  };
  endpoints: EndpointStats[];
  slowestEndpoints: EndpointStats[];
  budgetCompliance: {
    overallRate: number;
    byMetric: Record<string, number>;
    recentViolations: number;
  };
  budgetReport?: {
    passRate: number;
    violations: number;
    recommendations: string[];
  };
}
```

### Accessing the Dashboard

**Development:**
```bash
curl http://localhost:3000/api/admin/performance | jq
```

**Production:**
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  https://ai-born.org/api/admin/performance | jq
```

### Dashboard Example Response

```json
{
  "timestamp": "2025-10-18T12:00:00Z",
  "summary": {
    "totalRequests": 1543,
    "averageResponseTime": 234,
    "p95": 456,
    "p99": 789,
    "errorRate": 0.32,
    "performanceScore": 94,
    "performanceGrade": "A"
  },
  "endpoints": [
    {
      "name": "APIRoute:GET /api/excerpt/request",
      "count": 234,
      "avg": 156,
      "p50": 145,
      "p95": 234,
      "p99": 345,
      "min": 98,
      "max": 567
    }
  ],
  "slowestEndpoints": [
    {
      "name": "ServerAction:bonusClaim",
      "p95": 1234
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

## Budget Violation Alerts

### Manual Budget Check

```typescript
import { checkMetricBudget } from '@/lib/performance-budgets';

const check = checkMetricBudget('LCP', 2500);

if (!check.passed) {
  console.warn(`LCP exceeded budget by ${check.violation?.exceeded}ms`);
  // LCP exceeded budget by 500ms (2500ms > 2000ms)
}
```

### Automated Alerts

Configure alerts in your code:

```typescript
import { sendBudgetAlert } from '@/lib/performance-budgets';

const check = checkMetricBudget('API_ROUTE', 1200);

if (!check.passed) {
  await sendBudgetAlert(check, {
    enabled: true,
    threshold: 10, // Alert if >10% over budget
    destinations: ['log', 'sentry', 'webhook'],
    webhookUrl: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
  });
}
```

### Budget Report

Generate comprehensive reports:

```typescript
import { checkMultipleMetrics, generateBudgetReport } from '@/lib/performance-budgets';

const checks = checkMultipleMetrics({
  LCP: 2200,
  TBT: 180,
  CLS: 0.05,
  API_ROUTE: 1200
});

const report = generateBudgetReport(checks);

console.log(`Pass Rate: ${report.passRate * 100}%`);
console.log(`Violations: ${report.violations.length}`);
console.log('Recommendations:');
report.recommendations.forEach(r => console.log(`- ${r}`));
```

## OpenTelemetry Integration

### Viewing Traces

#### Local Development (Jaeger)

1. Start Jaeger:
```bash
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

2. Set environment variable:
```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

3. View traces at http://localhost:16686

#### Production (Vercel)

Vercel automatically configures OpenTelemetry when deployed. Traces are available in the Vercel dashboard under "Speed Insights".

#### External Services

Configure OTLP endpoint for services like:

- **Honeycomb:** `https://api.honeycomb.io/v1/traces`
- **New Relic:** `https://otlp.nr-data.net/v1/traces`
- **Datadog:** `https://trace.agent.datadoghq.com/v0.4/traces`
- **Custom:** Your own OTLP-compatible backend

## Performance Optimization Workflow

### 1. Monitor Performance

```bash
# Check current performance
curl http://localhost:3000/api/admin/performance | jq '.summary'
```

### 2. Identify Slow Endpoints

```bash
# Get slowest endpoints
curl http://localhost:3000/api/admin/performance | jq '.slowestEndpoints'
```

### 3. Add Monitoring to Slow Endpoints

```typescript
// Before
export async function POST(request: Request) {
  const data = await prisma.user.create({ ... });
  return NextResponse.json(data);
}

// After
export async function POST(request: Request) {
  return measureAPIRoute('POST /api/users', request, async () => {
    const data = await measureDatabaseQuery('create', 'User', async () => {
      return prisma.user.create({ ... });
    });
    return NextResponse.json(data);
  });
}
```

### 4. Check Budget Compliance

```bash
# Check budget violations
curl http://localhost:3000/api/admin/performance | jq '.budgetCompliance'
```

### 5. Optimize Based on Recommendations

The budget report includes specific recommendations for violations:

- **LCP violations:** Optimize images, preload critical resources, reduce server response time
- **TBT violations:** Code splitting, defer non-critical JavaScript, reduce main thread work
- **CLS violations:** Reserve space for images/ads, avoid inserting content above existing content
- **API Route violations:** Database query optimization, add caching, reduce payload size
- **Database Query violations:** Add indexes, optimize query, use connection pooling

## Testing

### Unit Tests

```typescript
import { checkMetricBudget, clearBudgetHistory } from '@/lib/performance-budgets';

describe('Performance Budgets', () => {
  beforeEach(() => {
    clearBudgetHistory();
  });

  it('should detect LCP budget violations', () => {
    const check = checkMetricBudget('LCP', 2500);

    expect(check.passed).toBe(false);
    expect(check.violation?.exceeded).toBe(500);
  });

  it('should pass for metrics within budget', () => {
    const check = checkMetricBudget('TBT', 100);

    expect(check.passed).toBe(true);
    expect(check.violation).toBeUndefined();
  });
});
```

### Integration Tests

```typescript
describe('Performance Dashboard API', () => {
  it('should return performance metrics', async () => {
    const response = await fetch('http://localhost:3000/api/admin/performance');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.summary).toBeDefined();
    expect(data.summary.performanceScore).toBeGreaterThanOrEqual(0);
    expect(data.summary.performanceScore).toBeLessThanOrEqual(100);
  });
});
```

## Best Practices

### 1. Monitor Critical Paths

Always monitor:
- User-facing API routes
- Database queries in hot paths
- Server actions that modify data
- Long-running operations

### 2. Set Appropriate Budgets

Adjust budgets based on operation type:
- **Interactive operations:** Strict budgets (100-200ms)
- **Background tasks:** Relaxed budgets (5000ms+)
- **Batch operations:** Very relaxed budgets (30000ms+)

### 3. Use Distributed Tracing

For complex operations spanning multiple services:

```typescript
import { createPerformanceTrace, addTraceEvent, endTrace } from '@/lib/performance';

async function complexOperation() {
  const trace = createPerformanceTrace('complexOperation', {
    userId: '123',
    operation: 'create'
  });

  try {
    addTraceEvent(trace, 'database_query_start');
    await queryDatabase();

    addTraceEvent(trace, 'external_api_call_start');
    await callExternalAPI();

    trace.status = 'ok';
  } catch (error) {
    trace.status = 'error';
    addTraceEvent(trace, 'error', { error: error.message });
  } finally {
    endTrace(trace);
  }
}
```

### 4. Minimize Overhead

Performance monitoring should have minimal overhead (<1ms per operation). Our implementation:
- Uses high-resolution timers
- Buffers metrics in memory
- Samples in production (configurable)
- Async logging (non-blocking)

### 5. Regular Reviews

Schedule weekly performance reviews:
```bash
# Weekly performance report
curl http://localhost:3000/api/admin/performance | \
  jq '{
    score: .summary.performanceScore,
    grade: .summary.performanceGrade,
    violations: .budgetCompliance.recentViolations,
    slowest: .slowestEndpoints[0:5]
  }'
```

## Troubleshooting

### Traces Not Appearing

1. Check OTLP endpoint is configured:
```bash
echo $OTEL_EXPORTER_OTLP_ENDPOINT
```

2. Verify endpoint is reachable:
```bash
curl -X POST $OTEL_EXPORTER_OTLP_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"test": "trace"}'
```

3. Check logs for OpenTelemetry errors:
```bash
npm run dev | grep OpenTelemetry
```

### Performance Dashboard Returns Empty Data

1. Generate some traffic:
```bash
# Make several requests to generate metrics
for i in {1..10}; do
  curl http://localhost:3000/api/excerpt/request
done
```

2. Check if metrics are being recorded:
```bash
curl http://localhost:3000/api/admin/performance | jq '.summary.totalRequests'
```

### High Overhead

If monitoring causes performance issues:

1. Reduce sampling rate (future feature)
2. Disable client-side tracking in production
3. Use server-side monitoring only for critical paths
4. Increase metrics buffer size to reduce flush frequency

## Roadmap

Future enhancements:

- [ ] Sampling configuration for high-traffic endpoints
- [ ] Custom metric aggregation windows
- [ ] Performance trend analysis and forecasting
- [ ] Automated performance regression detection
- [ ] Integration with CI/CD for performance gates
- [ ] Real-time performance alerts via WebSocket
- [ ] Custom dashboard UI component

## References

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)
- [Web Vitals](https://web.dev/vitals/)
- [CLAUDE.md Performance Budgets](/CLAUDE.md#performance-budgets)
