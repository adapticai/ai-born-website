# Code Redemption API - Testing Guide

This document provides comprehensive testing scenarios for the code redemption endpoint.

## Testing Prerequisites

### 1. Start Development Server

```bash
npm run dev
```

### 2. Set Mock Authentication Cookie

Open browser console and run:

```javascript
document.cookie = 'dev-session-user-id=user_test_123; path=/';
```

Or use this helper script:

```bash
# Create a test session cookie
curl -X POST http://localhost:3000/api/codes/ABC123/redeem \
  -H "Content-Type: application/json" \
  -H "Cookie: dev-session-user-id=user_test_123" \
  -d '{"retailer":"amazon","consentToTerms":true}'
```

## Test Scenarios

### 1. Successful Code Redemption

**Test:** Redeem a valid, unused code

```bash
curl -X POST http://localhost:3000/api/codes/ABC123/redeem \
  -H "Content-Type: application/json" \
  -H "Cookie: dev-session-user-id=user_test_123" \
  -d '{
    "retailer": "amazon",
    "deviceFingerprint": "fp_test_12345",
    "consentToTerms": true
  }' | jq
```

**Expected Response:** `200 OK`

```json
{
  "data": {
    "status": "redeemed",
    "redirectUrl": "https://amazon.com/AI-Born-dp/...",
    "retailer": "amazon",
    "format": "hardcover",
    "nextSteps": "Complete your purchase at the retailer, then upload your receipt to unlock the toolkit.",
    "receiptUploadUrl": "/api/receipts/upload",
    "toolkitAccess": false,
    "entitlement": {
      "type": "toolkit",
      "grantedAt": "2025-10-18T14:32:01.123Z"
    }
  },
  "meta": {
    "requestId": "...",
    "timestamp": "..."
  }
}
```

**Verification:**
- Code status changed to `redeemed`
- User assigned to code
- Entitlement created
- Audit log entry created

---

### 2. Invalid Code Format

**Test:** Attempt to redeem a code with invalid format

```bash
curl -X POST http://localhost:3000/api/codes/invalid/redeem \
  -H "Content-Type: application/json" \
  -H "Cookie: dev-session-user-id=user_test_123" \
  -d '{
    "retailer": "amazon",
    "consentToTerms": true
  }' | jq
```

**Expected Response:** `400 Bad Request`

```json
{
  "error": {
    "code": "INVALID_CODE",
    "message": "The redemption code format is invalid",
    "details": {
      "code": "invalid",
      "reason": "invalid_format"
    }
  },
  "meta": {
    "requestId": "...",
    "timestamp": "..."
  }
}
```

---

### 3. Code Not Found

**Test:** Attempt to redeem a non-existent code

```bash
curl -X POST http://localhost:3000/api/codes/NOTFND/redeem \
  -H "Content-Type: application/json" \
  -H "Cookie: dev-session-user-id=user_test_123" \
  -d '{
    "retailer": "amazon",
    "consentToTerms": true
  }' | jq
```

**Expected Response:** `404 Not Found`

```json
{
  "error": {
    "code": "CODE_NOT_FOUND",
    "message": "The redemption code does not exist",
    "details": {
      "code": "NOTFND",
      "reason": "not_found"
    }
  },
  "meta": {
    "requestId": "...",
    "timestamp": "..."
  }
}
```

---

### 4. Code Already Redeemed

**Test:** Attempt to redeem an already-redeemed code

```bash
curl -X POST http://localhost:3000/api/codes/USED99/redeem \
  -H "Content-Type: application/json" \
  -H "Cookie: dev-session-user-id=user_test_123" \
  -d '{
    "retailer": "amazon",
    "consentToTerms": true
  }' | jq
```

**Expected Response:** `409 Conflict`

```json
{
  "error": {
    "code": "CODE_ALREADY_REDEEMED",
    "message": "This code has already been redeemed",
    "details": {
      "code": "USED99",
      "reason": "already_redeemed",
      "redeemedAt": "2025-10-18T14:32:01Z"
    }
  },
  "meta": {
    "requestId": "...",
    "timestamp": "..."
  }
}
```

---

### 5. Missing Authentication

**Test:** Attempt to redeem without authentication

```bash
curl -X POST http://localhost:3000/api/codes/ABC123/redeem \
  -H "Content-Type: application/json" \
  -d '{
    "retailer": "amazon",
    "consentToTerms": true
  }' | jq
```

**Expected Response:** `401 Unauthorized`

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You must be logged in to redeem a code",
    "details": {
      "reason": "authentication_required"
    }
  },
  "meta": {
    "requestId": "...",
    "timestamp": "..."
  }
}
```

---

### 6. Missing Required Fields

**Test:** Attempt to redeem without retailer

```bash
curl -X POST http://localhost:3000/api/codes/ABC123/redeem \
  -H "Content-Type: application/json" \
  -H "Cookie: dev-session-user-id=user_test_123" \
  -d '{
    "consentToTerms": true
  }' | jq
```

**Expected Response:** `400 Bad Request`

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Request validation failed",
    "details": {
      "retailer": ["Retailer is required"]
    }
  },
  "meta": {
    "requestId": "...",
    "timestamp": "..."
  }
}
```

---

### 7. Terms Not Accepted

**Test:** Attempt to redeem without accepting terms

```bash
curl -X POST http://localhost:3000/api/codes/ABC123/redeem \
  -H "Content-Type: application/json" \
  -H "Cookie: dev-session-user-id=user_test_123" \
  -d '{
    "retailer": "amazon",
    "consentToTerms": false
  }' | jq
```

**Expected Response:** `400 Bad Request`

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Request validation failed",
    "details": {
      "consentToTerms": ["You must accept the terms of service to redeem this code"]
    }
  },
  "meta": {
    "requestId": "...",
    "timestamp": "..."
  }
}
```

---

### 8. Rate Limiting

**Test:** Exceed rate limit (10 requests per hour)

```bash
# Send 11 requests in quick succession
for i in {1..11}; do
  echo "Request $i:"
  curl -s -X POST http://localhost:3000/api/codes/ABC123/redeem \
    -H "Content-Type: application/json" \
    -H "Cookie: dev-session-user-id=user_test_${i}" \
    -d '{"retailer":"amazon","consentToTerms":true}' \
    -w "\nHTTP Status: %{http_code}\n\n" | head -n 20
  sleep 0.5
done
```

**Expected Response (Request 11):** `429 Too Many Requests`

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many redemption attempts. Please try again later.",
    "details": {
      "limit": 10,
      "window": "1 hour",
      "resetIn": 3599
    }
  },
  "meta": {
    "requestId": "...",
    "timestamp": "..."
  }
}
```

**Response Headers:**
```
Retry-After: 3599
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 3599
```

---

### 9. Case Insensitivity

**Test:** Redeem code with lowercase letters

```bash
curl -X POST http://localhost:3000/api/codes/abc123/redeem \
  -H "Content-Type: application/json" \
  -H "Cookie: dev-session-user-id=user_test_123" \
  -d '{
    "retailer": "amazon",
    "consentToTerms": true
  }' | jq
```

**Expected Response:** `200 OK` (code is normalized to uppercase)

---

### 10. Different Retailers

**Test:** Redeem codes with different retailers

```bash
# Redeem with Barnes & Noble
curl -X POST http://localhost:3000/api/codes/XYZ789/redeem \
  -H "Content-Type: application/json" \
  -H "Cookie: dev-session-user-id=user_test_456" \
  -d '{
    "retailer": "barnes-noble",
    "consentToTerms": true
  }' | jq

# Verify redirectUrl changes based on retailer
```

**Expected:** `redirectUrl` should point to Barnes & Noble

---

## Integration Testing

### Frontend Integration Test

```typescript
// test/integration/code-redemption.test.ts

describe('Code Redemption Flow', () => {
  it('should successfully redeem a valid code', async () => {
    const response = await fetch('/api/codes/ABC123/redeem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        retailer: 'amazon',
        consentToTerms: true,
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data.status).toBe('redeemed');
    expect(data.data.redirectUrl).toContain('amazon.com');
  });

  it('should reject already-redeemed codes', async () => {
    // First redemption
    await fetch('/api/codes/TEST01/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        retailer: 'amazon',
        consentToTerms: true,
      }),
    });

    // Second redemption (should fail)
    const response = await fetch('/api/codes/TEST01/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        retailer: 'amazon',
        consentToTerms: true,
      }),
    });

    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error.code).toBe('CODE_ALREADY_REDEEMED');
  });

  it('should enforce rate limiting', async () => {
    const requests = Array.from({ length: 11 }, (_, i) =>
      fetch(`/api/codes/TEST${i.toString().padStart(2, '0')}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailer: 'amazon',
          consentToTerms: true,
        }),
      })
    );

    const responses = await Promise.all(requests);
    const lastResponse = responses[10];

    expect(lastResponse.status).toBe(429);
    expect(lastResponse.headers.get('Retry-After')).toBeTruthy();
  });
});
```

---

## Load Testing

### Apache Bench

```bash
# Test 100 requests with 10 concurrent users
ab -n 100 -c 10 \
  -H "Content-Type: application/json" \
  -H "Cookie: dev-session-user-id=user_load_test" \
  -p payload.json \
  http://localhost:3000/api/codes/ABC123/redeem
```

**payload.json:**
```json
{
  "retailer": "amazon",
  "consentToTerms": true
}
```

### Expected Results

- **Request Rate:** ~50-100 req/s (depends on hardware)
- **Error Rate:** 0% for valid requests
- **Latency p50:** <50ms
- **Latency p95:** <200ms
- **Rate Limit Triggered:** After 10 requests from same IP

---

## Monitoring & Debugging

### Check Logs

```bash
# Watch server logs
npm run dev | grep "Code Redemption"
```

### Log Output Format

```json
{
  "code": "ABC123",
  "userId": "user_test_123",
  "ip": "127.0.0.1",
  "success": true,
  "retailer": "amazon",
  "timestamp": "2025-10-18T14:32:01.123Z"
}
```

### Audit Trail

All redemptions are logged to console with:
- Event type (`code_redeemed`)
- User ID
- Code ID
- Before/after state
- Timestamp

---

## Common Issues

### Issue: "Code already redeemed" but I haven't redeemed it

**Cause:** Code was redeemed in a previous test run

**Solution:** Restart the development server to reset mock data

```bash
# Kill server (Ctrl+C)
# Restart
npm run dev
```

---

### Issue: Rate limit persists after server restart

**Cause:** In-memory rate limit store clears on restart, but may persist if using Redis

**Solution:** Wait for rate limit window to expire (1 hour) or clear Redis cache

```bash
# Clear Redis (if using)
redis-cli FLUSHALL
```

---

### Issue: "Not authenticated" error

**Cause:** Missing or expired session cookie

**Solution:** Set mock authentication cookie

```javascript
document.cookie = 'dev-session-user-id=user_test_123; path=/';
```

---

## Production Testing Checklist

Before deploying to production, verify:

- [ ] Database schema applied (`data-models.sql`)
- [ ] Prisma migrations run
- [ ] Auth.js session validation working
- [ ] Redis rate limiting configured (optional)
- [ ] Environment variables set
- [ ] Mock functions replaced with real implementations
- [ ] Error tracking (Sentry) configured
- [ ] Logging (structured JSON) working
- [ ] Rate limit alerts configured
- [ ] All test scenarios pass
- [ ] Load testing completed (100+ req/s)
- [ ] Security scan passed (OWASP checks)

---

## Next Steps

After successful redemption:

1. User redirected to retailer
2. User completes purchase
3. User uploads receipt via `/api/receipts/upload`
4. Receipt verified (manual or LLM)
5. Full toolkit access unlocked

## Related Endpoints

- **Receipt Upload:** `POST /api/receipts/upload`
- **Receipt Status:** `GET /api/receipts/:id/status`
- **User Profile:** `GET /api/user`
- **User Entitlements:** `GET /api/user` (includes entitlements array)

---

**Last Updated:** 2025-10-18
**Author:** Technical Solutions Architect
**Specification Version:** 1.1.0
