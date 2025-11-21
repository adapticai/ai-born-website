# Performance Monitoring - Quick Start

## 5-Minute Setup

### 1. Environment Variables

Add to `.env`:

```bash
# Optional: OpenTelemetry endpoint for trace export
OTEL_EXPORTER_OTLP_ENDPOINT=

# Required for production dashboard access
ADMIN_API_KEY=$(openssl rand -base64 32)
```

### 2. Start Development Server

```bash
npm run dev
```

OpenTelemetry auto-starts via `instrumentation.ts`. No additional setup needed!

## Common Usage Patterns

### Wrap API Routes

```typescript
import { measureAPIRoute } from '@/lib/performance';

export async function GET(request: Request) {
  return measureAPIRoute('GET /api/users', request, async () => {
    // Your route logic here
    return NextResponse.json({ users });
  });
}
```

### Wrap Server Actions

```typescript
'use server';

import { measureServerAction } from '@/lib/performance';

export const createUser = measureServerAction('createUser', async (data) => {
  return prisma.user.create({ data });
});
```

### Wrap Database Queries

```typescript
import { measureDatabaseQuery } from '@/lib/performance';

async function getUsers() {
  return measureDatabaseQuery('findMany', 'User', async () => {
    return prisma.user.findMany();
  });
}
```

### Monitor Client Components

```typescript
'use client';

import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

function MyComponent() {
  const { trackEvent } = usePerformanceMonitor('MyComponent');

  const handleClick = () => {
    trackEvent('button_clicked', { buttonId: 'submit' });
  };

  return <button onClick={handleClick}>Submit</button>;
}
```

## Dashboard Access

### Development

```bash
curl http://localhost:3000/api/admin/performance | jq '.summary'
```

### Production

```bash
curl -H "Authorization: Bearer $ADMIN_API_KEY" \
  https://ai-born.org/api/admin/performance | jq '.summary'
```

## Performance Budgets

All budgets from `CLAUDE.md` are automatically enforced:

| Metric | Budget | Scope |
|--------|--------|-------|
| LCP | ≤ 2.0s | Client |
| TBT | ≤ 150ms | Client |
| CLS | ≤ 0.1 | Client |
| INP | ≤ 200ms | Client |
| TTFB | ≤ 600ms | Client |
| API Route | ≤ 1000ms | Server |
| Server Action | ≤ 2000ms | Server |
| Database Query | ≤ 100ms | Server |

**Budget violations are automatically logged and can trigger alerts.**

## Quick Checks

### Am I monitoring an endpoint?

Look for wrapper:
```typescript
// ✅ Monitored
export async function GET(request: Request) {
  return measureAPIRoute('GET /api/users', request, async () => {
    ...
  });
}

// ❌ Not monitored
export async function GET(request: Request) {
  return NextResponse.json({ users });
}
```

### Is performance data being collected?

```bash
# Check request count
curl http://localhost:3000/api/admin/performance | jq '.summary.totalRequests'

# If 0, generate some traffic:
for i in {1..5}; do curl http://localhost:3000/api/users; done
```

### Are there budget violations?

```bash
curl http://localhost:3000/api/admin/performance | jq '.budgetCompliance'
```

### What are my slowest endpoints?

```bash
curl http://localhost:3000/api/admin/performance | jq '.slowestEndpoints[0:5]'
```

## Common Issues

### "OpenTelemetry not starting"

✅ **Solution:** OpenTelemetry starts automatically. Check logs:
```bash
npm run dev | grep OpenTelemetry
```

You should see:
```
[OpenTelemetry] Instrumentation started
```

### "Dashboard returns empty data"

✅ **Solution:** Generate some traffic first:
```bash
# Make a few requests
curl http://localhost:3000/api/excerpt/request -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check dashboard
curl http://localhost:3000/api/admin/performance | jq
```

### "Traces not appearing in Jaeger"

✅ **Solution:** Set OTLP endpoint and restart:
```bash
# In .env
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces

# Restart dev server
npm run dev
```

### "Budget warnings in logs"

✅ **This is working as intended!** Budget warnings help identify slow operations:

```json
{
  "level": "warn",
  "operation": "findMany",
  "duration": 156,
  "threshold": 100,
  "msg": "Database query exceeded budget"
}
```

**Action:** Optimize the query (add index, reduce data fetched, etc.)

## Next Steps

1. **Add monitoring to existing routes** (see `PERFORMANCE_EXAMPLE.md`)
2. **Set up Jaeger for local trace viewing** (optional)
3. **Configure production OTLP endpoint** (optional)
4. **Schedule weekly performance reviews**

## Full Documentation

- **Complete Guide:** `PERFORMANCE_MONITORING.md`
- **Integration Examples:** `PERFORMANCE_EXAMPLE.md`
- **Summary:** `PERFORMANCE_MONITORING_SUMMARY.md`

## Key Files

```
src/
  lib/
    performance.ts              # Core utilities
    performance-budgets.ts      # Budget checking
  hooks/
    usePerformanceMonitor.ts    # Client hooks
  app/
    api/
      admin/
        performance/
          route.ts              # Dashboard API

instrumentation.ts              # Next.js entry (auto-loaded)
instrumentation.node.ts         # OpenTelemetry config
```

## Support

Questions? Check:
1. `PERFORMANCE_MONITORING.md` - Comprehensive documentation
2. `PERFORMANCE_EXAMPLE.md` - Real-world integration examples
3. OpenTelemetry docs: https://opentelemetry.io/docs/

---

**You're all set!** Performance monitoring is running and ready to use. 🚀
