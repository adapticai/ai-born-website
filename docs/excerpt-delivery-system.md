# Excerpt PDF Delivery System

## Overview

The excerpt PDF delivery system provides secure, token-based downloads for book excerpts. It implements:

- Rate limiting (10 requests/hour per IP)
- Spam protection via honeypot fields
- JWT-based signed download tokens (7-day expiry)
- Email delivery via Resend
- Analytics tracking
- Production-ready security

---

## Architecture

### Flow Diagram

```
User Request → Email Capture Form → API Validation → Token Generation → Email Delivery → Secure Download
```

### Components

1. **Request Endpoint** (`/api/excerpt/request`)
   - Validates email address
   - Checks rate limits
   - Generates signed download token
   - Sends email with download link

2. **Download Endpoint** (`/api/excerpt/download`)
   - Verifies token signature and expiry
   - Streams PDF file to client
   - Tracks download analytics

3. **Token Utilities** (`/src/lib/tokens.ts`)
   - JWT generation and verification
   - HMAC-SHA256 signing
   - Expiry validation

---

## API Endpoints

### POST /api/excerpt/request

Request a free book excerpt.

**Request Body:**
```typescript
{
  email: string;         // Required: Valid email address
  name?: string;         // Optional: User's name
  source?: string;       // Optional: Traffic source for analytics
  honeypot?: string;     // Must be empty (spam protection)
}
```

**Success Response (200):**
```typescript
{
  success: true,
  message: "Thank you! Check your email for the excerpt.",
  downloadUrl: "https://ai-born.org/api/excerpt/download?token=<jwt>"
}
```

**Error Responses:**

- **400 Validation Error:**
  ```typescript
  {
    success: false,
    message: "Please correct the errors below",
    errors: {
      email: ["Please enter a valid email address"]
    }
  }
  ```

- **429 Rate Limit:**
  ```typescript
  {
    success: false,
    message: "Rate limit exceeded. Please try again after 3:45 PM.",
    errors: {
      _form: ["Too many requests. Limit: 10 per hour."]
    }
  }
  ```

---

### GET /api/excerpt/download?token=<jwt>

Download the excerpt PDF using a signed token.

**Query Parameters:**
```typescript
{
  token: string;  // Required: JWT token from request endpoint
}
```

**Success Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="ai-born-excerpt.pdf"`
- Status: 200
- Body: PDF file stream

**Error Responses:**

- **401 Invalid Token:**
  ```json
  {
    "success": false,
    "message": "Invalid download token",
    "errors": {
      "token": ["The download token is invalid or malformed"]
    }
  }
  ```

- **401 Expired Token:**
  ```json
  {
    "success": false,
    "message": "Download token has expired",
    "errors": {
      "token": ["This download link has expired. Please request a new excerpt."]
    }
  }
  ```

- **404 File Not Found:**
  ```json
  {
    "success": false,
    "message": "Excerpt PDF is currently unavailable",
    "errors": {
      "_form": ["The requested file could not be found"]
    }
  }
  ```

---

## Token System

### Token Payload

```typescript
interface ExcerptTokenPayload {
  email: string;        // User's email address
  name?: string;        // Optional: User's name
  source?: string;      // Optional: Traffic source
  timestamp: number;    // Token creation time (ms since epoch)
  expiresAt: number;    // Expiry time (ms since epoch)
}
```

### Token Structure

Standard JWT format:
```
<base64url(header)>.<base64url(payload)>.<base64url(signature)>
```

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Signature:**
- Algorithm: HMAC-SHA256
- Secret: `process.env.NEXTAUTH_SECRET` or `process.env.EXCERPT_TOKEN_SECRET`

### Token Expiry

- **Valid for:** 7 days from generation
- **Grace period:** None (strict expiry)
- **Re-request:** Users can request new excerpts if token expires

---

## Security Features

### Rate Limiting

**Configuration:**
- Limit: 10 requests per hour per IP
- Window: Rolling 1-hour window
- Storage: In-memory (Redis recommended for production)

**Headers:**
```http
Retry-After: <seconds>
```

### Spam Protection

**Honeypot Field:**
- Field name: `honeypot`
- Expected value: Empty string
- Behavior: Silently accept if filled (bot trap)

**Implementation:**
```typescript
if (body.honeypot && body.honeypot.length > 0) {
  // Bot detected - return fake success
  return { success: true, downloadUrl: '/placeholder' };
}
```

### Token Verification

**Checks:**
1. Token format (3 parts separated by dots)
2. Signature validity (HMAC-SHA256)
3. Expiry time (must be in future)

**Errors:**
- `malformed`: Invalid token structure
- `invalid`: Signature mismatch
- `expired`: Token past expiry time
- `missing_secret`: Server configuration error

### PDF Security Headers

```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="ai-born-excerpt.pdf"
Cache-Control: private, no-cache, no-store, must-revalidate
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

---

## Environment Variables

### Required

```bash
# Token signing secret (minimum 32 characters)
NEXTAUTH_SECRET=your-secret-key-minimum-32-characters

# Site URL for download links
NEXT_PUBLIC_SITE_URL=https://ai-born.org
```

### Optional

```bash
# Resend API key for email delivery
RESEND_API_KEY=re_your_api_key_here

# Alternative token secret (overrides NEXTAUTH_SECRET)
EXCERPT_TOKEN_SECRET=separate-secret-for-excerpts

# Rate limiting configuration
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=3600000
```

---

## Email Integration

### Resend Configuration

**Install SDK:**
```bash
npm install resend
```

**Example Implementation:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'AI-Born <excerpt@ai-born.org>',
  to: email,
  subject: 'Your Free Chapter from AI-Born',
  html: `
    <h1>Thank you for your interest in AI-Born!</h1>
    <p>Hi ${name || 'there'},</p>
    <p>Here's your free chapter from <strong>AI-Born</strong>.</p>
    <p><a href="${downloadUrl}">Download Your Free Chapter</a></p>
    <p>This link is valid for 7 days.</p>
  `,
});
```

---

## Analytics & Logging

### Download Events

**Structure:**
```typescript
{
  event: 'excerpt_download',
  email: hash(email),  // Hashed for privacy
  source: string,
  timestamp: string,
  success: boolean,
  error?: string,
}
```

### Request Events

**Structure:**
```typescript
{
  event: 'excerpt_request',
  email: hash(email),  // Hashed for privacy
  source: string,
  timestamp: string,
  success: boolean,
  error?: string,
}
```

### Integration Points

**Google Tag Manager:**
```javascript
window.dataLayer.push({
  event: 'excerpt_download',
  source: 'hero_cta',
  timestamp: new Date().toISOString(),
});
```

**Plausible/Fathom:**
```javascript
plausible('Excerpt Download', {
  props: { source: 'hero_cta' }
});
```

---

## Testing

### Unit Tests

**Token generation:**
```typescript
import { generateExcerptToken, verifyExcerptToken } from '@/lib/tokens';

test('generates valid token', () => {
  const token = generateExcerptToken('test@example.com', 'Test User');
  expect(token).toBeTruthy();

  const result = verifyExcerptToken(token);
  expect(result.valid).toBe(true);
  expect(result.payload?.email).toBe('test@example.com');
});
```

**Token expiry:**
```typescript
test('rejects expired token', () => {
  // Create token with immediate expiry (mock Date.now)
  const token = generateExpiredToken();

  const result = verifyExcerptToken(token);
  expect(result.valid).toBe(false);
  expect(result.error).toBe('expired');
});
```

### Integration Tests

**Request flow:**
```typescript
test('excerpt request creates download token', async () => {
  const response = await POST('/api/excerpt/request', {
    email: 'test@example.com',
    name: 'Test User',
  });

  expect(response.status).toBe(200);
  expect(response.data.downloadUrl).toContain('token=');
});
```

**Download flow:**
```typescript
test('downloads PDF with valid token', async () => {
  const token = generateExcerptToken('test@example.com');

  const response = await GET(`/api/excerpt/download?token=${token}`);

  expect(response.status).toBe(200);
  expect(response.headers['content-type']).toBe('application/pdf');
});
```

### Manual Testing

**cURL Examples:**

Request excerpt:
```bash
curl -X POST https://ai-born.org/api/excerpt/request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

Download PDF:
```bash
curl -X GET "https://ai-born.org/api/excerpt/download?token=<jwt>" \
  --output excerpt.pdf
```

---

## Deployment Checklist

### Pre-deployment

- [ ] Set `NEXTAUTH_SECRET` in production environment
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Configure `RESEND_API_KEY` for email delivery
- [ ] Upload actual excerpt PDF to `/public/assets/ai-born-excerpt.pdf`
- [ ] Test rate limiting with multiple requests
- [ ] Verify email delivery in production
- [ ] Test token expiry edge cases

### Post-deployment

- [ ] Monitor error logs for token verification failures
- [ ] Track download success rate
- [ ] Monitor rate limit hits
- [ ] Verify email deliverability
- [ ] Check PDF download analytics
- [ ] Test from different geolocations

---

## Monitoring & Maintenance

### Key Metrics

1. **Request success rate:** `successful_requests / total_requests`
2. **Download success rate:** `successful_downloads / total_download_attempts`
3. **Rate limit hits:** `rate_limited_requests / total_requests`
4. **Token expiry rate:** `expired_tokens / total_download_attempts`

### Alerts

**Set up alerts for:**
- Request success rate < 95%
- Download success rate < 90%
- Rate limit hits > 5% of requests
- PDF file not found errors
- Token verification errors > 1%

### Logs to Monitor

```bash
# Request errors
[Excerpt Request] Error: <message>

# Download errors
[Excerpt Download] Error: <message>

# Token verification failures
[Token Verification Error] <details>

# Rate limit hits
Rate limit exceeded. Retrying in <time>ms...
```

---

## Troubleshooting

### Common Issues

**"TOKEN_SECRET not configured"**
- Set `NEXTAUTH_SECRET` or `EXCERPT_TOKEN_SECRET` environment variable
- Minimum 32 characters recommended

**"PDF file not found"**
- Verify file exists at `/public/assets/ai-born-excerpt.pdf`
- Check file permissions
- Ensure deployment includes public assets

**"Token verification failed: invalid"**
- Token secret mismatch between request and download
- Environment variable changed between token generation and verification
- Token may have been tampered with

**"Rate limit exceeded"**
- User made > 10 requests in 1 hour
- Consider increasing limit for testing
- For production, implement Redis-based rate limiting

**Email not delivered**
- Check `RESEND_API_KEY` is set correctly
- Verify sender domain is verified in Resend
- Check spam folder
- Review Resend dashboard for delivery status

---

## Future Enhancements

### Phase 2

- [ ] Redis-based rate limiting for multi-instance deployments
- [ ] Email delivery tracking and analytics
- [ ] A/B testing for email templates
- [ ] PDF versioning (multiple excerpt versions)
- [ ] Download link click tracking

### Phase 3

- [ ] Personalized PDF generation (user name in PDF)
- [ ] Multi-language excerpt support
- [ ] Advanced analytics (heatmaps, scroll depth)
- [ ] Integration with CRM (Salesforce, HubSpot)
- [ ] Automated follow-up sequences

---

## Support

For issues or questions:
- Email: hello@ai-born.org
- Documentation: `/docs/excerpt-delivery-system.md`
- API reference: This document

---

**Last updated:** October 18, 2025
**Version:** 1.0.0
