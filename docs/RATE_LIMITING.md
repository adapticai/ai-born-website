# Rate Limiting Implementation Guide

## Overview

The AI-Born landing page uses production-grade distributed rate limiting powered by **Upstash Redis**. This implementation provides:

- **Distributed rate limiting** across multiple server instances
- **Automatic fallback** to in-memory rate limiting for development
- **Multiple algorithms** (sliding window, token bucket, fixed window)
- **Standard HTTP headers** (X-RateLimit-Limit, X-RateLimit-Remaining, etc.)
- **TypeScript-first** with comprehensive type safety
- **Zero-downtime** graceful degradation

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    API Request                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Rate Limit Middleware                      │
│  • Extract IP or User ID                               │
│  • Check rate limit                                     │
│  • Add rate limit headers                              │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌────────────────┐      ┌────────────────┐
│ Upstash Redis  │      │   In-Memory    │
│   (Production) │      │  (Development) │
└────────────────┘      └────────────────┘
```

## Setup

### 1. Install Dependencies

The required packages are already installed:

```bash
npm install @upstash/redis @upstash/ratelimit
```

### 2. Configure Upstash Redis

#### Create Upstash Account

1. Go to [console.upstash.com](https://console.upstash.com)
2. Sign up for a free account (10,000 commands/day included)
3. Create a new Redis database

#### Get Credentials

1. Select your database
2. Copy the **REST API URL** and **REST API Token**
3. Add to your `.env` file:

```bash
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_rest_token_here
```

### 3. Development Mode

If Redis credentials are not configured, the system automatically falls back to in-memory rate limiting. This is perfect for local development:

```bash
# Development (no Redis required)
npm run dev
```

You'll see a warning in the console:
```
[Rate Limit] Redis not configured. Using in-memory fallback.
Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production.
```

## Usage

### Basic Usage

```typescript
import {
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
  emailCaptureRateLimiter,
  EMAIL_CAPTURE_RATE_LIMIT,
} from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  // Check rate limit
  const result = await checkRateLimit(
    clientIP,
    emailCaptureRateLimiter,
    EMAIL_CAPTURE_RATE_LIMIT // Fallback config for development
  );

  if (!result.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: getRateLimitHeaders(result),
      }
    );
  }

  // Process request...
  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: getRateLimitHeaders(result),
    }
  );
}
```

### Using Middleware Wrapper

For simpler integration, use the `withRateLimit` wrapper:

```typescript
import { withRateLimit, apiRateLimiter } from '@/lib/ratelimit';

export const POST = withRateLimit(
  async (request) => {
    // Your handler logic
    return NextResponse.json({ success: true });
  },
  apiRateLimiter,
  { maxRequests: 100, windowMs: 60 * 60 * 1000 }
);
```

### User-Based Rate Limiting

For authenticated users, rate limit by user ID instead of IP:

```typescript
import { getUserIdentifier, checkRateLimit } from '@/lib/ratelimit';

const identifier = getUserIdentifier(request, session?.user?.id);
const result = await checkRateLimit(identifier, apiRateLimiter);
```

## Pre-configured Rate Limiters

The following rate limiters are pre-configured and ready to use:

### API Routes (100 requests/hour)
```typescript
import { apiRateLimiter } from '@/lib/ratelimit';
```
General protection for all API endpoints.

### Email Capture (10 requests/hour)
```typescript
import { emailCaptureRateLimiter } from '@/lib/ratelimit';
```
Prevents email harvesting and spam.

### Code Redemption (10 requests/hour)
```typescript
import { codeRedemptionRateLimiter } from '@/lib/ratelimit';
```
Prevents brute force attacks on redemption codes.

### File Uploads (5 requests/hour)
```typescript
import { fileUploadRateLimiter } from '@/lib/ratelimit';
```
Prevents storage abuse and spam (used for bonus claims).

### General Forms (5 requests/hour)
```typescript
import { generalFormRateLimiter } from '@/lib/ratelimit';
```
For contact forms, media requests, bulk orders.

## Custom Rate Limiters

Create custom rate limiters for specific use cases:

```typescript
import { createRateLimiter } from '@/lib/ratelimit';

const customRateLimiter = createRateLimiter({
  maxRequests: 50,
  windowMs: 15 * 60 * 1000, // 15 minutes
  prefix: 'ratelimit:custom',
});
```

## HTTP Headers

All rate-limited responses include standard headers:

### Success Response (200)
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 3540
```

### Rate Limit Exceeded (429)
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 3540
Retry-After: 3540
```

## Error Handling

### Graceful Degradation

If Upstash Redis is unavailable, the system automatically falls back to in-memory rate limiting:

```typescript
try {
  const result = await limiter.limit(identifier);
  return result;
} catch (error) {
  console.error('[Rate Limit] Upstash rate limit check failed:', error);
  // Automatically falls back to in-memory
}
```

### Standard Error Response

```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again in 3540 seconds.",
  "retryAfter": 3540
}
```

## Rate Limit Configuration

### Default Limits

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| API Routes | 100 | 1 hour | General API protection |
| Email Capture | 10 | 1 hour | Prevent email harvesting |
| Code Redemption | 10 | 1 hour | Prevent brute force |
| File Uploads | 5 | 1 hour | Prevent storage abuse |
| General Forms | 5 | 1 hour | Contact/media/bulk forms |

### Adjusting Limits

To adjust limits for production, modify the configuration in `/src/lib/ratelimit.ts`:

```typescript
export const emailCaptureRateLimiter = createRateLimiter({
  maxRequests: 20, // Increased from 10
  windowMs: 60 * 60 * 1000, // 1 hour
  prefix: 'ratelimit:email',
});
```

## Monitoring

### Health Check

Check rate limiter status:

```typescript
import { getRateLimiterStatus } from '@/lib/ratelimit';

const status = getRateLimiterStatus();
console.log(status);
// {
//   redisConfigured: true,
//   inMemoryStoreSize: 0,
//   mode: 'redis'
// }
```

### Analytics

Upstash Rate Limit includes built-in analytics:

```typescript
const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1h'),
  analytics: true, // Enable analytics
});
```

View analytics in the [Upstash Console](https://console.upstash.com).

## Testing

### Local Testing (In-Memory)

```bash
# Don't set Redis env vars
npm run dev

# Test rate limiting
curl -X POST http://localhost:3000/api/email-capture \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Production Testing (Redis)

```bash
# Set Redis env vars in .env.local
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

npm run dev

# Test with Redis
curl -X POST http://localhost:3000/api/email-capture \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Load Testing

Use tools like `hey` or `k6` to test rate limiting:

```bash
# Install hey
brew install hey

# Send 20 requests (should hit rate limit)
hey -n 20 -c 1 -m POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' \
  http://localhost:3000/api/email-capture
```

### Clear In-Memory Store (Testing Only)

```typescript
import { clearInMemoryStore } from '@/lib/ratelimit';

// Only for testing
if (process.env.NODE_ENV === 'test') {
  clearInMemoryStore();
}
```

## Deployment

### Vercel

1. Add environment variables in Vercel dashboard:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

2. Deploy:
```bash
vercel --prod
```

### Other Platforms

Set environment variables in your hosting platform:

```bash
# Heroku
heroku config:set UPSTASH_REDIS_REST_URL=https://...
heroku config:set UPSTASH_REDIS_REST_TOKEN=...

# Railway
railway variables set UPSTASH_REDIS_REST_URL=https://...
railway variables set UPSTASH_REDIS_REST_TOKEN=...
```

## Performance

### Benchmarks

| Metric | Upstash Redis | In-Memory |
|--------|--------------|-----------|
| Average Latency | ~50ms | <1ms |
| Distributed | ✅ Yes | ❌ No |
| Persistence | ✅ Yes | ❌ No |
| Scalability | ✅ Unlimited | ⚠️ Single instance |

### Optimization Tips

1. **Use appropriate limits**: Don't over-limit legitimate users
2. **Monitor analytics**: Adjust limits based on actual usage
3. **Cache friendly**: Sliding window algorithm is cache-efficient
4. **Edge deployment**: Deploy to edge for lower latency

## Troubleshooting

### Rate Limit Not Working

**Check Redis configuration:**
```bash
# Verify env vars are set
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN
```

**Check logs:**
```
[Rate Limit] Redis not configured. Using in-memory fallback.
```

### Redis Connection Errors

**Network issues:**
- Check Upstash dashboard for service status
- Verify firewall/network settings
- Check API token validity

**Automatic fallback:**
The system will automatically fall back to in-memory if Redis is unavailable.

### Rate Limit Headers Missing

**Ensure headers are added:**
```typescript
const headers = getRateLimitHeaders(result);
return NextResponse.json(data, { headers });
```

### In-Memory Store Growing

**Development only:**
In-memory store is cleared automatically every 10 minutes. For production, always use Redis.

## Security Considerations

### IP Spoofing

The rate limiter checks multiple headers in order of trust:

1. `cf-connecting-ip` (Cloudflare)
2. `x-real-ip` (Nginx)
3. `x-forwarded-for` (Standard)

### DDoS Protection

Rate limiting is **one layer** of protection. Consider:

1. **Cloudflare DDoS protection**
2. **WAF rules**
3. **Honeypot fields**
4. **CAPTCHA for high-risk endpoints**

### Data Privacy

- IP addresses are hashed before storage (if needed)
- No PII is stored in Redis
- Rate limit data expires automatically

## Best Practices

### 1. Always Use TypeScript Types

```typescript
import type { RateLimitResult } from '@/lib/ratelimit';

const result: RateLimitResult = await checkRateLimit(...);
```

### 2. Add Rate Limit Headers to All Responses

```typescript
// Success response
return NextResponse.json(data, {
  headers: getRateLimitHeaders(result),
});

// Error response
return NextResponse.json(error, {
  status: 400,
  headers: getRateLimitHeaders(result),
});
```

### 3. Log Rate Limit Violations

```typescript
if (!result.success) {
  console.warn('[Rate Limit]', {
    endpoint: '/api/email-capture',
    ip: clientIP,
    limit: result.limit,
    reset: result.reset,
  });
}
```

### 4. Use Appropriate Limits

- **Read operations**: Higher limits (100-1000/hour)
- **Write operations**: Lower limits (5-10/hour)
- **Expensive operations**: Very low limits (1-3/hour)

### 5. Provide Clear Error Messages

```typescript
if (!result.success) {
  return NextResponse.json(
    {
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again in ${result.reset} seconds.`,
      retryAfter: result.reset,
    },
    { status: 429 }
  );
}
```

## Migration Guide

### From Old Rate Limiter

The old in-memory rate limiter is deprecated but backward compatible:

**Old code:**
```typescript
import { checkRateLimit } from '@/lib/rate-limit';

const result = checkRateLimit(ip, config); // Synchronous
```

**New code:**
```typescript
import { checkRateLimit } from '@/lib/ratelimit';

const result = await checkRateLimit(ip, limiter, config); // Async
```

### Backward Compatibility

The old API routes using `@/lib/utils/rate-limiter` will continue to work. They now use Upstash Redis internally via a compatibility wrapper.

## References

- [Upstash Redis Documentation](https://upstash.com/docs/redis)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/features/ratelimiting)
- [Rate Limiting Algorithms](https://upstash.com/docs/redis/features/ratelimiting#algorithms)
- [Upstash Console](https://console.upstash.com)

## Support

### Questions?

- **Upstash Support**: [support@upstash.com](mailto:support@upstash.com)
- **Project Issues**: Create an issue in the repository
- **Documentation**: Check the [Upstash docs](https://upstash.com/docs)

### Common Issues

| Issue | Solution |
|-------|----------|
| "Redis not configured" warning | Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` |
| Rate limit not persisting | Using in-memory fallback (set Redis env vars) |
| 429 errors in development | Clear in-memory store or increase limits |
| Slow response times | Check Upstash region, consider edge deployment |

---

**Last Updated:** October 2025
**Version:** 1.0.0
**Maintained by:** AI-Born Development Team
