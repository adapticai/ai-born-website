# Excerpt Request API

## Overview

This API endpoint handles free excerpt requests for the AI-Born book. It includes:

- Email validation with Zod
- Rate limiting (10 requests/hour per IP)
- Spam protection via honeypot field
- Email delivery via Resend
- Analytics event tracking

## Endpoint

```
POST /api/excerpt/request
```

## Request Body

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "source": "hero-excerpt"
}
```

### Fields

- `email` (required): Valid email address
- `name` (optional): User's name for personalization
- `source` (optional): Source of the request for analytics tracking
- `honeypot` (hidden): Anti-spam field (should be empty)

## Response

### Success (200)

```json
{
  "success": true,
  "message": "Thank you! Check your email for the excerpt.",
  "downloadUrl": "/assets/ai-born-excerpt.pdf"
}
```

### Validation Error (400)

```json
{
  "success": false,
  "message": "Please correct the errors below",
  "errors": {
    "email": ["Please enter a valid email address"]
  }
}
```

### Rate Limit Exceeded (429)

```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again after 3:45 PM.",
  "errors": {
    "_form": ["Too many requests. Limit: 10 per hour."]
  }
}
```

### Server Error (500)

```json
{
  "success": false,
  "message": "An unexpected error occurred. Please try again later.",
  "errors": {
    "_form": ["Internal server error"]
  }
}
```

## Email Integration

### Resend Setup

1. **Install Resend SDK** (optional, already included in dependencies):
   ```bash
   npm install resend
   ```

2. **Get API Key**:
   - Sign up at [resend.com](https://resend.com)
   - Create an API key in your dashboard
   - Add to `.env.local`:
     ```
     RESEND_API_KEY=re_your_api_key_here
     ```

3. **Configure Domain** (for production):
   - Add and verify your domain in Resend dashboard
   - Update `EMAIL_FROM` in environment variables

### Email Template

The endpoint sends a transactional email with:

- **Subject**: "Your Free Chapter from AI-Born"
- **From**: `AI-Born <excerpt@ai-born.org>`
- **Content**: HTML email with download link
- **Attachment**: PDF excerpt (optional)

### Implementation

To enable actual email sending, uncomment the Resend code in `/src/app/api/excerpt/request/route.ts`:

```typescript
const { Resend } = await import('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'AI-Born <excerpt@ai-born.org>',
  to: email,
  subject: 'Your Free Chapter from AI-Born',
  html: `...email template...`,
  attachments: [
    {
      filename: 'ai-born-excerpt.pdf',
      path: '/path/to/excerpt.pdf',
    },
  ],
});
```

## Rate Limiting

### Current Implementation

- **In-memory storage**: Works for single-instance deployments
- **Limit**: 10 requests per hour per IP
- **Window**: Rolling 1-hour window
- **Cleanup**: Automatic cleanup of expired entries (1% probability per request)

### Production Considerations

For multi-instance deployments, migrate to Redis or Upstash KV:

```typescript
// Example with Upstash
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

async function checkRateLimit(ip: string) {
  const key = `rate-limit:excerpt:${ip}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 3600); // 1 hour
  }

  return {
    allowed: count <= 10,
    resetTime: Date.now() + 3600000,
  };
}
```

## Security Features

### Honeypot Protection

Hidden field that should remain empty. If filled, the request is silently accepted but not processed (fools spam bots).

### Input Validation

All inputs validated with Zod schemas:
- Email format validation
- String length limits
- Type checking

### CORS

- **Development**: Allows all origins (`*`)
- **Production**: Restricted to `NEXT_PUBLIC_SITE_URL`

### Rate Limiting

Prevents abuse by limiting requests per IP address.

## Analytics

The endpoint triggers the following analytics events:

### Lead Capture Submit

```javascript
{
  event: 'lead_capture_submit',
  source: 'hero-excerpt',
  success: true
}
```

### Form Error

```javascript
{
  event: 'form_error',
  form_id: 'excerpt-modal',
  error_type: 'rate-limit' | 'server' | 'validation'
}
```

## Testing

### Manual Testing

```bash
# Success case
curl -X POST http://localhost:3000/api/excerpt/request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# Validation error
curl -X POST http://localhost:3000/api/excerpt/request \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email"}'

# Rate limit (send 11+ requests from same IP)
for i in {1..12}; do
  curl -X POST http://localhost:3000/api/excerpt/request \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test${i}@example.com\"}"
done
```

### Automated Testing

```typescript
// Example test with Vitest
import { POST } from './route';

describe('POST /api/excerpt/request', () => {
  it('should accept valid email', async () => {
    const request = new NextRequest('http://localhost:3000/api/excerpt/request', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

## Logs

The endpoint logs all requests for monitoring:

```json
{
  "ip": "192.168.1.1",
  "email": "user@example.com",
  "name": "John Doe",
  "source": "hero-excerpt",
  "timestamp": "2025-10-18T12:00:00.000Z",
  "success": true
}
```

Failed requests include error details:

```json
{
  "ip": "192.168.1.1",
  "email": "user@example.com",
  "timestamp": "2025-10-18T12:00:00.000Z",
  "success": false,
  "error": "Rate limit exceeded"
}
```

## Environment Variables

Required:

```env
# Email service
RESEND_API_KEY=re_your_api_key_here

# Site URL (for CORS and email links)
NEXT_PUBLIC_SITE_URL=https://ai-born.org
```

Optional:

```env
# Customize rate limiting
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=3600000

# Email configuration
EMAIL_FROM="AI-Born <excerpt@ai-born.org>"
```

## Troubleshooting

### "RESEND_API_KEY not configured"

The API key is not set. Add it to `.env.local`:

```env
RESEND_API_KEY=re_your_actual_key_here
```

### Rate limit exceeded

Wait for the rate limit window to expire (1 hour) or clear the in-memory map by restarting the server.

### Email not received

1. Check Resend dashboard for delivery logs
2. Verify domain is configured and verified
3. Check spam folder
4. Ensure `EMAIL_FROM` matches verified domain

### CORS errors

Ensure `NEXT_PUBLIC_SITE_URL` is set correctly:

```env
NEXT_PUBLIC_SITE_URL=https://ai-born.org
```

## Future Enhancements

- [ ] Double opt-in confirmation
- [ ] Email template with React Email
- [ ] Redis-based rate limiting for multi-instance
- [ ] Email queue for better reliability
- [ ] Unsubscribe handling
- [ ] GDPR compliance features (data export, deletion)
- [ ] A/B testing for email templates
- [ ] Email open/click tracking
