# Rate Limiting Quick Start

## TL;DR

Production-grade rate limiting with Upstash Redis is now live. Set two environment variables and you're done.

## Setup (2 minutes)

### 1. Get Upstash Credentials

1. Go to https://console.upstash.com
2. Create a free account (no credit card required)
3. Create a new Redis database
4. Copy your **REST API URL** and **REST API Token**

### 2. Add Environment Variables

Add to `.env.local`:

```bash
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_rest_token_here
```

### 3. Deploy

```bash
# Development (auto-fallback to in-memory)
npm run dev

# Production (uses Redis)
vercel --prod
```

Done! 🎉

## What's Protected

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/email-capture` | 10 requests | 1 hour |
| `/api/bonus-claim` | 5 requests | 1 hour |
| `/api/codes/*/redeem` | 10 requests | 1 hour |
| `/api/media-request` | 5 requests | 1 hour |
| `/api/bulk-order` | 5 requests | 1 hour |

## Example Response

### Success (200)
```json
{
  "success": true,
  "data": { ... }
}
```

**Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 3540
```

### Rate Limited (429)
```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again in 3540 seconds.",
  "retryAfter": 3540
}
```

**Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 3540
Retry-After: 3540
```

## Development

**Without Redis:**
- Automatic fallback to in-memory
- Perfect for local development
- No configuration needed

**With Redis:**
- Set environment variables
- Distributed across instances
- Production-ready

## Usage in New Endpoints

```typescript
import {
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
  apiRateLimiter,
} from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const result = await checkRateLimit(clientIP, apiRateLimiter);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: getRateLimitHeaders(result),
      }
    );
  }

  // Your logic here...

  return NextResponse.json(
    { success: true },
    { headers: getRateLimitHeaders(result) }
  );
}
```

## Pre-configured Rate Limiters

```typescript
import {
  apiRateLimiter,          // 100 req/hour - General API
  emailCaptureRateLimiter, // 10 req/hour  - Email capture
  codeRedemptionRateLimiter, // 10 req/hour - Code redemption
  fileUploadRateLimiter,   // 5 req/hour   - File uploads
  generalFormRateLimiter,  // 5 req/hour   - Forms
} from '@/lib/ratelimit';
```

## Testing

### Local Testing

```bash
# Send 12 requests (should hit 10/hour limit)
for i in {1..12}; do
  curl -X POST http://localhost:3000/api/email-capture \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}' \
    -w "\nStatus: %{http_code}\n"
done
```

Expected output:
- Requests 1-10: `200 OK`
- Requests 11-12: `429 Too Many Requests`

### Check Rate Limiter Mode

```bash
# Start server
npm run dev

# Look for log message:
# [Rate Limit] Redis not configured. Using in-memory fallback.
# OR
# (No message = Redis is configured and working)
```

## Production Checklist

- [ ] Upstash Redis database created
- [ ] Environment variables set in hosting platform
- [ ] Rate limits tested and adjusted if needed
- [ ] Monitoring enabled in Upstash console
- [ ] Error alerting configured

## Troubleshooting

### "Rate Limit] Redis not configured"
✅ This is normal for development. Add Redis env vars for production.

### Rate limits not working
1. Check env vars are set: `echo $UPSTASH_REDIS_REST_URL`
2. Verify credentials in Upstash console
3. Check server logs for errors

### Too many 429 errors
1. Increase rate limits in `/src/lib/ratelimit.ts`
2. Check if legitimate traffic is being blocked
3. Consider user-based rate limiting for authenticated users

## More Information

- Full documentation: [`/docs/RATE_LIMITING.md`](./RATE_LIMITING.md)
- Upstash docs: https://upstash.com/docs/redis/features/ratelimiting
- Code: `/src/lib/ratelimit.ts`

## Support

- Create an issue in the repository
- Check Upstash status: https://status.upstash.com
- Contact: support@upstash.com

---

**Pro Tip:** The system automatically falls back to in-memory rate limiting if Redis is unavailable. You can deploy without Redis and add it later with zero downtime.
