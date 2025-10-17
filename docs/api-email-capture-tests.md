# Email Capture API - Test Examples

This document provides test examples for the `/api/email-capture` endpoint.

## Endpoint Details

- **URL**: `/api/email-capture`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Rate Limit**: 10 requests per hour per IP

## Request Body Schema

```json
{
  "name": "string (optional)",
  "email": "string (required, valid email format)",
  "source": "string (optional, e.g., 'hero', 'footer', 'modal')",
  "honeypot": "string (optional, should be empty for legitimate requests)"
}
```

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Thank you for subscribing! Check your email for the excerpt.",
  "downloadUrl": "/assets/ai-born-excerpt.pdf"
}
```

### Validation Error (400 Bad Request)

```json
{
  "success": false,
  "message": "Please correct the errors below",
  "errors": {
    "email": ["Please enter a valid email address"],
    "name": ["Name is required"]
  }
}
```

### Rate Limit Error (429 Too Many Requests)

```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again after 3:45:00 PM.",
  "errors": {
    "_form": ["Too many requests. Limit: 10 per hour."]
  }
}
```

### Server Error (500 Internal Server Error)

```json
{
  "success": false,
  "message": "An unexpected error occurred. Please try again later.",
  "errors": {
    "_form": ["Internal server error"]
  }
}
```

## Test Examples with cURL

### Test 1: Valid Request (with name)

```bash
curl -X POST http://localhost:3000/api/email-capture \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "source": "hero"
  }'
```

**Expected Response**: 200 OK with success message and download URL

---

### Test 2: Valid Request (email only, no name)

```bash
curl -X POST http://localhost:3000/api/email-capture \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com"
  }'
```

**Expected Response**: 200 OK with success message

---

### Test 3: Invalid Email Format

```bash
curl -X POST http://localhost:3000/api/email-capture \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invalid User",
    "email": "not-an-email"
  }'
```

**Expected Response**: 400 Bad Request with validation error

```json
{
  "success": false,
  "message": "Please correct the errors below",
  "errors": {
    "email": ["Please enter a valid email address"]
  }
}
```

---

### Test 4: Missing Email Field

```bash
curl -X POST http://localhost:3000/api/email-capture \
  -H "Content-Type: application/json" \
  -d '{
    "name": "No Email User"
  }'
```

**Expected Response**: 400 Bad Request with validation error

---

### Test 5: Honeypot Filled (Spam Detection)

```bash
curl -X POST http://localhost:3000/api/email-capture \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bot User",
    "email": "bot@example.com",
    "honeypot": "I am a bot"
  }'
```

**Expected Response**: 200 OK (silently accepts but doesn't process - anti-spam measure)

---

### Test 6: Invalid JSON

```bash
curl -X POST http://localhost:3000/api/email-capture \
  -H "Content-Type: application/json" \
  -d 'invalid json'
```

**Expected Response**: 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid request body",
  "errors": {
    "_form": ["Invalid JSON format"]
  }
}
```

---

### Test 7: Rate Limit Test (Run 11 times quickly)

```bash
# Run this script to test rate limiting
for i in {1..11}; do
  echo "Request $i:"
  curl -X POST http://localhost:3000/api/email-capture \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"test${i}@example.com\",
      \"source\": \"rate-limit-test\"
    }"
  echo -e "\n---\n"
done
```

**Expected Response**: First 10 requests succeed, 11th request returns 429 (Rate Limit Exceeded)

---

### Test 8: CORS Preflight Request

```bash
curl -X OPTIONS http://localhost:3000/api/email-capture \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

**Expected Response**: 200 OK with CORS headers:
- `Access-Control-Allow-Origin: *` (development)
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

---

### Test 9: With Source Parameter

```bash
curl -X POST http://localhost:3000/api/email-capture \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "source": "footer-newsletter"
  }'
```

**Expected Response**: 200 OK, with source logged in console

---

## Production Testing

For production environment (https://ai-born.org):

```bash
# Replace localhost:3000 with ai-born.org
curl -X POST https://ai-born.org/api/email-capture \
  -H "Content-Type: application/json" \
  -d '{
    "email": "production@example.com",
    "source": "production-test"
  }'
```

**Note**: Production CORS will only allow requests from `https://ai-born.org` domain.

---

## Server Logs

When a successful request is processed, the following will be logged to the console:

```
[Email Capture] {
  "ip": "127.0.0.1",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "source": "hero",
  "timestamp": "2025-10-16T12:30:45.123Z",
  "success": true
}

--- NEW EMAIL CAPTURE ---
Email: john.doe@example.com
Name: John Doe
Source: hero
Download URL: /assets/ai-born-excerpt.pdf
TODO: Send email with excerpt PDF
TODO: Add to mailing list
------------------------
```

---

## Integration Checklist

- [x] Input validation with Zod schema
- [x] Honeypot spam protection
- [x] Rate limiting (10 req/hour per IP)
- [x] Error handling (400, 429, 500)
- [x] CORS configuration
- [x] Request logging for debugging
- [ ] **TODO**: Integrate transactional email service (SendGrid/Postmark/Resend)
- [ ] **TODO**: Add to mailing list service (Mailchimp/ConvertKit)
- [ ] **TODO**: Move rate limiting to Redis for multi-instance support
- [ ] **TODO**: Create excerpt PDF asset at `/public/assets/ai-born-excerpt.pdf`
- [ ] **TODO**: Set up email templates for excerpt delivery
- [ ] **TODO**: Configure environment variables for email service
- [ ] **TODO**: Add monitoring/alerting for API errors

---

## Frontend Integration Example

```typescript
// Example usage in a React component
async function handleEmailCapture(data: { name?: string; email: string }) {
  try {
    const response = await fetch('/api/email-capture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        source: 'hero-cta',
        honeypot: '', // Important: keep empty
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 429) {
        // Handle rate limit
        alert(result.message);
        return;
      }

      if (response.status === 400) {
        // Handle validation errors
        console.error('Validation errors:', result.errors);
        return;
      }

      throw new Error(result.message);
    }

    // Success!
    console.log('Success:', result.message);
    console.log('Download URL:', result.downloadUrl);

    // Optionally redirect to download
    window.location.href = result.downloadUrl;

  } catch (error) {
    console.error('Error:', error);
    alert('An unexpected error occurred. Please try again.');
  }
}
```

---

## Security Features

1. **Email Validation**: Format validation using Zod schema
2. **Honeypot Field**: Hidden field that should remain empty (bots fill it)
3. **Rate Limiting**: 10 requests per hour per IP address
4. **Input Sanitization**: Validated through Zod schema
5. **CORS Protection**: Restricted to production domain in production environment
6. **Error Logging**: All requests logged with IP, timestamp, success status

---

## Next Steps

1. Create the excerpt PDF asset
2. Set up transactional email service (SendGrid/Postmark/Resend)
3. Configure email templates
4. Integrate mailing list service
5. Set up Redis for distributed rate limiting (for multi-instance deployments)
6. Add monitoring and alerting
7. Create automated tests
8. Set up analytics tracking for email captures

---

**Last Updated**: 2025-10-16
**API Version**: 1.0.0
**Status**: MVP Complete ✓
