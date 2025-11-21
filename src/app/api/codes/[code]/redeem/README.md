# Code Redemption API Endpoint

**Route:** `POST /api/codes/:code/redeem`

## Overview

This endpoint validates and redeems unique book purchase codes for authenticated users. It implements comprehensive anti-abuse controls, rate limiting, and error handling as specified in the API contracts.

## Specification References

- **API Contract:** `~/ai-born/outputs/website/specs/api-contracts.md` (Lines 472-549)
- **Database Schema:** `~/ai-born/outputs/website/specs/data-models.sql` (Lines 488-552)

## Authentication

**Required:** Yes

Users must be authenticated via Auth.js session to redeem codes. The endpoint checks for a valid session and rejects unauthenticated requests with a `401 Unauthorized` response.

## Rate Limiting

**Limit:** 10 attempts per hour per IP address

This provides protection against brute-force attacks whilst allowing legitimate users reasonable retry attempts. Rate limit is tracked per IP address and resets after 1 hour.

## Request

### Path Parameters

| Parameter | Type   | Description                                    |
|-----------|--------|------------------------------------------------|
| `code`    | string | 6-character alphanumeric redemption code (case-insensitive) |

### Request Body

```json
{
  "retailer": "amazon",
  "deviceFingerprint": "fp_abc123xyz",
  "consentToTerms": true
}
```

| Field              | Type    | Required | Description                                           |
|--------------------|---------|----------|-------------------------------------------------------|
| `retailer`         | string  | Yes      | Retailer slug where purchase will be made             |
| `deviceFingerprint`| string  | No       | Browser fingerprint for anti-abuse tracking           |
| `consentToTerms`   | boolean | Yes      | Must be `true` (ToS acceptance)                       |

### Example Request

```bash
curl -X POST https://ai-born.org/api/codes/ABC123/redeem \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "retailer": "amazon",
    "consentToTerms": true
  }'
```

## Response

### Success Response (200 OK)

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
    "requestId": "req_redeem_abc123",
    "timestamp": "2025-10-18T14:32:01Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid Code Format

```json
{
  "error": {
    "code": "INVALID_CODE",
    "message": "The redemption code format is invalid",
    "details": {
      "code": "abc",
      "reason": "invalid_format"
    }
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2025-10-18T14:32:01Z"
  }
}
```

#### 401 Unauthorized - Not Authenticated

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
    "requestId": "req_abc123",
    "timestamp": "2025-10-18T14:32:01Z"
  }
}
```

#### 404 Not Found - Code Does Not Exist

```json
{
  "error": {
    "code": "CODE_NOT_FOUND",
    "message": "The redemption code does not exist",
    "details": {
      "code": "ABC123",
      "reason": "not_found"
    }
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2025-10-18T14:32:01Z"
  }
}
```

#### 409 Conflict - Code Already Redeemed

```json
{
  "error": {
    "code": "CODE_ALREADY_REDEEMED",
    "message": "This code has already been redeemed",
    "details": {
      "code": "ABC123",
      "reason": "already_redeemed",
      "redeemedAt": "2025-10-15T10:00:00Z"
    }
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2025-10-18T14:32:01Z"
  }
}
```

#### 409 Conflict - User Already Has Format

```json
{
  "error": {
    "code": "USER_ALREADY_HAS_FORMAT",
    "message": "You have already redeemed a code for the hardcover format",
    "details": {
      "code": "ABC123",
      "format": "hardcover",
      "reason": "duplicate_format"
    }
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2025-10-18T14:32:01Z"
  }
}
```

#### 410 Gone - Code Expired

```json
{
  "error": {
    "code": "CODE_EXPIRED",
    "message": "This code has expired and can no longer be redeemed",
    "details": {
      "code": "ABC123",
      "reason": "expired",
      "expiresAt": "2025-01-01T00:00:00Z"
    }
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2025-10-18T14:32:01Z"
  }
}
```

#### 429 Too Many Requests - Rate Limit Exceeded

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many redemption attempts. Please try again later.",
    "details": {
      "limit": 10,
      "window": "1 hour",
      "resetIn": 3420
    }
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2025-10-18T14:32:01Z"
  }
}
```

**Response Headers:**
```
Retry-After: 3420
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 3420
```

#### 500 Internal Server Error

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later.",
    "details": {}
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2025-10-18T14:32:01Z"
  }
}
```

## Anti-Abuse Controls

The endpoint implements multiple layers of anti-abuse protection:

### 1. One Code Per User Per Format

Users cannot redeem multiple codes for the same book format. This prevents bulk abuse and ensures fair distribution. Enforced via database unique constraint:

```sql
CONSTRAINT one_code_per_user_per_format UNIQUE (user_id, format)
```

### 2. Rate Limiting

10 attempts per hour per IP address prevents brute-force attacks and API abuse.

### 3. Device Fingerprinting

Optional device fingerprinting allows fraud detection without blocking legitimate users. Suspicious patterns (>3 codes/24h from single IP) are flagged for review.

### 4. IP Address Logging

IP addresses are logged at redemption time for fraud detection and retained for 30 days before automatic redaction per GDPR compliance.

### 5. Audit Trail

All redemption attempts (success and failure) are logged to the `audit_logs` table with correlation IDs for tracking.

## Database Operations

The endpoint performs the following database operations in a transaction:

1. **Find Code:** Query `codes` table by code string
2. **Check User Format:** Query `codes` table for existing user redemptions
3. **Update Code:** Set status to `redeemed`, assign user, retailer, timestamp
4. **Create Entitlement:** Insert into `entitlements` table
5. **Log Audit Event:** Insert into `audit_logs` table

## Business Logic

### Code Status Lifecycle

```
pending → redeemed (success)
pending → expired (time-based or admin action)
pending → revoked (admin action)
```

### Pre-order vs. Launch Week

Codes redeemed before launch (D-0) are marked as `pre_order: true` in the database. Both pre-order and launch-week redemptions unlock the same entitlements.

### Entitlements Granted

Upon successful redemption, users receive:

- **Toolkit Access** (immediate)
- **Receipt Upload Flow** (required for full entitlement verification)

Full toolkit access is unlocked after receipt verification via `/api/receipts/upload`.

## Integration Points

### Frontend Integration

```typescript
async function redeemCode(code: string, retailer: string): Promise<void> {
  const response = await fetch(`/api/codes/${code}/redeem`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      retailer,
      consentToTerms: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  const { data } = await response.json();

  // Redirect to retailer
  window.location.href = data.redirectUrl;
}
```

### Analytics Events

Track redemption events for monitoring and optimization:

```javascript
// Successful redemption
gtag('event', 'code_redeemed', {
  code_id: 'code_abc123',
  format: 'hardcover',
  retailer: 'amazon',
  timestamp: '2025-10-18T14:32:01Z',
});

// Failed redemption
gtag('event', 'code_redemption_failed', {
  error_code: 'CODE_ALREADY_REDEEMED',
  code_format: codeParam,
  timestamp: '2025-10-18T14:32:01Z',
});
```

## Development Testing

### Mock Codes (Development Only)

The endpoint seeds mock codes in development mode:

| Code    | Format    | Status   | Notes                    |
|---------|-----------|----------|--------------------------|
| ABC123  | Hardcover | Pending  | Can be redeemed          |
| XYZ789  | eBook     | Pending  | Can be redeemed          |
| USED99  | Hardcover | Redeemed | Already redeemed (error) |

### Mock Authentication

Set a development cookie to simulate authentication:

```javascript
document.cookie = 'dev-session-user-id=user_test_123; path=/';
```

### Testing Rate Limiting

Make 11 requests within an hour to trigger rate limiting:

```bash
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/codes/ABC123/redeem \
    -H "Content-Type: application/json" \
    -H "Cookie: dev-session-user-id=user_test_123" \
    -d '{"retailer":"amazon","consentToTerms":true}' \
    -w "\nStatus: %{http_code}\n\n"
  sleep 1
done
```

## Production Deployment

### Prerequisites

1. **Database:** PostgreSQL with schema from `data-models.sql`
2. **ORM:** Prisma configured with database connection
3. **Authentication:** Auth.js (NextAuth v5) with session middleware
4. **Rate Limiting:** Redis/Upstash for distributed rate limiting (recommended)
5. **Monitoring:** Error tracking (Sentry) and logging (Datadog/CloudWatch)

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_URL="https://ai-born.org"
NEXTAUTH_SECRET="..."

# Redis (optional, for distributed rate limiting)
REDIS_URL="redis://..."

# Monitoring
SENTRY_DSN="..."
```

### Database Migration

Apply the schema before deployment:

```bash
# Using Prisma
npx prisma migrate deploy

# Or raw SQL
psql $DATABASE_URL < outputs/website/specs/data-models.sql
```

### Replace Mock Functions

Search for `TODO: Replace with Prisma` comments and implement actual database queries:

1. `findCodeByCode()` → Prisma query
2. `userHasFormatCode()` → Prisma query
3. `redeemCode()` → Prisma transaction
4. `createEntitlement()` → Prisma create
5. `logAuditEvent()` → Prisma audit log insert
6. `getAuthenticatedUser()` → Auth.js session retrieval

### Monitoring & Alerts

Set up alerts for:

- **Error Rate >5%** for 5 minutes
- **Rate Limit Abuse** (>10 429s/user/hour)
- **Failed Redemptions >20%** of total attempts
- **Database Transaction Failures**

## Security Considerations

### PII Handling

- IP addresses are logged for 30 days, then automatically redacted
- Device fingerprints retained for 90 days (fraud detection window)
- Order IDs hashed (SHA-256) for deduplication
- No email addresses sent to LLMs

### OWASP Top 10 Mitigations

1. **Injection:** Parameterised queries via Prisma ORM
2. **Broken Authentication:** Auth.js session management, HTTP-only cookies
3. **Sensitive Data Exposure:** PII encryption at rest, minimal collection
4. **XXE:** No XML parsing (JSON only)
5. **Broken Access Control:** Session validation, user-code ownership checks
6. **Security Misconfiguration:** Environment variable validation, CSP headers
7. **XSS:** React auto-escaping, input sanitization
8. **Insecure Deserialisation:** Zod schema validation on all inputs
9. **Known Vulnerabilities:** Dependabot, `npm audit`
10. **Insufficient Logging:** Structured logs with correlation IDs

## Support

For technical questions or issues, contact the engineering team:

- **Slack:** #ai-born-engineering
- **Email:** engineering@adaptic.ai
- **Documentation:** See API contracts and database schema specifications
