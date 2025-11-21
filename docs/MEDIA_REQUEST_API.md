# Media Request API Documentation

## Overview

The media request system allows journalists, media outlets, and partners to submit requests for:
- Advanced reader copies (ARCs/galleys)
- Interview requests
- Review copies
- Speaking engagements
- Partnership opportunities

## Architecture

### Components

1. **API Route**: `/api/media-request` (POST)
2. **Form Component**: `MediaRequestForm.tsx`
3. **Email Service**: `sendMediaRequestNotification()` in `lib/email.ts`
4. **Validation**: Zod schema in `lib/schemas/contact.ts`
5. **Storage**: JSON file storage in `lib/utils/storage.ts`

### Data Flow

```
User → MediaRequestForm → API Route → [Validation] → [Email PR Team] → [Store Data] → Response
                                           ↓
                                    PR Team Inbox
```

## API Specification

### Endpoint

```
POST /api/media-request
```

### Request Headers

```
Content-Type: application/json
```

### Request Body

```typescript
{
  name: string;           // Required: Contact name (min 2 chars)
  email: string;          // Required: Valid email address
  outlet: string;         // Required: Publication/organization name (min 2 chars)
  requestType: string;    // Required: One of: galley, interview, review-copy, speaking, partnership, other
  phone?: string;         // Optional: Phone number
  message: string;        // Required: Request details (10-2000 chars)
  deadline?: string;      // Optional: ISO 8601 datetime string
  honeypot?: string;      // Anti-spam field (should be empty)
}
```

### Response

#### Success (200)

```json
{
  "success": true,
  "message": "Thank you for your request. We will review it and get back to you within 24 hours.",
  "data": {
    "requestId": "MR-1234567890-ABC123",
    "requestType": "interview"
  }
}
```

#### Validation Error (400)

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "name: Name must be at least 2 characters, email: Invalid email format"
}
```

#### Rate Limit Exceeded (429)

```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again later.",
  "error": "Too many requests. Limit resets at 2025-10-18T15:30:00.000Z"
}
```

Headers:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1729266600000
Retry-After: 3600
```

#### Server Error (500)

```json
{
  "success": false,
  "message": "An unexpected error occurred. Please try again later.",
  "error": "Internal server error"
}
```

## Rate Limiting

- **Limit**: 5 requests per hour per IP address
- **Window**: 1 hour (3600000ms)
- **Identifier**: `media-request:{clientIp}`

Rate limit information is returned in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when limit resets
- `Retry-After`: Seconds until retry (429 responses only)

## Security Features

### 1. Honeypot Field

An invisible `honeypot` field catches automated spam bots:

```typescript
// In form (hidden from users)
<input type="text" name="honeypot" style="display: none" />

// In API - reject if filled
if (data.honeypot && data.honeypot.trim() !== "") {
  // Silently reject (return success to fool bots)
}
```

### 2. Input Sanitization

All text inputs are sanitized to prevent XSS attacks:

```typescript
import { sanitizeText, sanitizeEmail } from "@/lib/utils/sanitization";

const sanitizedData = {
  name: sanitizeText(data.name),
  email: sanitizeEmail(data.email),
  outlet: sanitizeText(data.outlet),
  message: sanitizeText(data.message),
};
```

### 3. Suspicious Content Detection

Checks for common XSS patterns:

```typescript
if (containsSuspiciousContent(sanitizedData.name) ||
    containsSuspiciousContent(sanitizedData.outlet) ||
    containsSuspiciousContent(sanitizedData.message)) {
  // Reject with 400 error
}
```

### 4. CORS Protection

Only allowed origins can make requests:

```typescript
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://ai-born.org",
  "https://www.ai-born.org",
];
```

## Email Notifications

When a valid request is received, an email notification is sent to the PR team.

### Configuration

Set the PR team email in environment variables:

```bash
EMAIL_PR_TEAM=press@micpress.com  # Default if not set
```

### Email Template

The notification email includes:

1. **Header**: Request ID and timestamp
2. **Contact Information Table**:
   - Name
   - Email (clickable mailto link)
   - Phone (if provided, clickable tel link)
   - Outlet/Publication
   - Request Type
   - Deadline (if provided, formatted with timezone)
3. **Message**: User's request details
4. **Recommended Actions**: Best practices for responding
5. **Quick Reply Button**: Pre-filled mailto link with subject including request ID

### Email Subject Format

```
Media Request: {Request Type} from {Outlet}
```

Examples:
- `Media Request: Interview Request from The New York Times`
- `Media Request: Advanced Reader Copy (ARC) from TechCrunch`

### Retry Logic

Email sending uses exponential backoff with enhanced retries for PR notifications:

```typescript
{
  maxRetries: 5,        // Higher than default (3)
  initialDelayMs: 2000, // 2 seconds
  maxDelayMs: 30000,    // 30 seconds max
}
```

## Data Storage

Media requests are stored in a JSON file for backup and tracking:

### File Location

```
data/media-requests.json
```

### Storage Format

```json
{
  "timestamp": "2025-10-18T14:30:00.000Z",
  "clientIp": "192.168.1.1",
  "data": {
    "requestId": "MR-1234567890-ABC123",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "outlet": "Tech Magazine",
    "requestType": "interview",
    "phone": "+1 (555) 123-4567",
    "message": "I would like to interview the author...",
    "deadline": "2025-10-25T10:00:00.000Z"
  }
}
```

### Notes

- Storage failures do not prevent request submission
- Email is the primary notification channel
- JSON storage is for backup and manual review
- Consider migrating to database (Prisma) for production at scale

## Analytics Tracking

The form tracks the following events:

### 1. Form Submission Attempt

```javascript
trackEvent({
  event: 'media_request_submit',
  request_type: 'interview', // or 'galley', 'review-copy', 'speaking', 'other'
});
```

### 2. Successful Submission

```javascript
trackEvent({
  event: 'media_request_submit',
  request_type: 'interview',
  success: true,
});
```

### 3. Form Error

```javascript
trackEvent({
  event: 'form_error',
  form_id: 'media-request',
  error_type: 'network',
});
```

## Form Component Usage

### Basic Usage

```tsx
import { MediaRequestForm } from '@/components/forms/MediaRequestForm';

export function MediaSection() {
  return (
    <div>
      <h2>Request Media Kit</h2>
      <MediaRequestForm />
    </div>
  );
}
```

### With Success Callback

```tsx
import { MediaRequestForm } from '@/components/forms/MediaRequestForm';

export function MediaSection() {
  const handleSuccess = () => {
    console.log('Media request submitted successfully');
    // Optional: Track conversion, show thank you page, etc.
  };

  return (
    <MediaRequestForm onSuccess={handleSuccess} />
  );
}
```

## Form Fields

### Required Fields

1. **Name**: Contact person's full name
   - Validation: Min 2 characters, max 100 characters
   - Auto-complete: `name`

2. **Email**: Contact email address
   - Validation: Valid email format, domain check
   - Auto-complete: `email`
   - Lowercase transformation

3. **Outlet/Organization**: Publication or company name
   - Validation: Min 2 characters, max 200 characters
   - Auto-complete: `organization`

4. **Request Type**: Nature of the request
   - Options:
     - Advanced Reader Copy (ARC)
     - Interview Request
     - Review Copy
     - Speaking Engagement
     - Partnership Opportunity
     - Other

5. **Message**: Request details
   - Validation: Min 20 characters, max 2000 characters
   - Description shows character count hint

### Optional Fields

1. **Phone**: Contact phone number
   - Validation: Phone number format (digits, spaces, +, -, (, ))
   - Max 20 characters
   - Auto-complete: `tel`

2. **Deadline**: Request deadline
   - Format: `datetime-local` input
   - Stored as ISO 8601 string
   - Converted to readable format in email notification

## Error Handling

### Client-Side Validation

Real-time validation using React Hook Form + Zod:

```typescript
const form = useForm<MediaRequestFormData>({
  resolver: zodResolver(mediaRequestSchema),
  defaultValues: {
    name: '',
    email: '',
    outlet: '',
    requestType: 'other',
    message: '',
    honeypot: '', // Hidden anti-spam field
  },
});
```

### Server-Side Validation

All inputs are validated server-side with detailed error messages:

```typescript
const validationResult = mediaRequestSchema.safeParse(body);

if (!validationResult.success) {
  const errors = validationResult.error.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  return NextResponse.json({
    success: false,
    message: "Validation failed",
    error: errors.map((e) => `${e.field}: ${e.message}`).join(", "),
  }, { status: 400 });
}
```

### Network Error Handling

Graceful degradation with user-friendly error messages:

```typescript
try {
  const response = await submitMediaRequest(data);
} catch (error) {
  const message = getErrorMessage(error);
  setErrorMessage(message);

  trackEvent({
    event: 'form_error',
    form_id: 'media-request',
    error_type: 'network',
  });
}
```

## Testing

### Manual Testing Checklist

- [ ] Submit valid request - should succeed
- [ ] Submit with invalid email - should show error
- [ ] Submit with too short message (<20 chars) - should show error
- [ ] Submit 6 times in 1 hour - 6th should be rate limited
- [ ] Fill honeypot field - should silently reject
- [ ] Check PR team receives email notification
- [ ] Verify data stored in JSON file
- [ ] Test deadline field with various date formats
- [ ] Test phone field with various phone formats

### API Testing with cURL

```bash
# Valid request
curl -X POST http://localhost:3000/api/media-request \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "outlet": "Tech Magazine",
    "requestType": "interview",
    "message": "I would like to interview the author about AI-native organisations."
  }'

# With optional fields
curl -X POST http://localhost:3000/api/media-request \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john@publication.com",
    "outlet": "Business Weekly",
    "requestType": "review-copy",
    "phone": "+1 (555) 123-4567",
    "deadline": "2025-10-25T10:00:00.000Z",
    "message": "Requesting a review copy for our December issue feature on AI in business."
  }'

# Invalid email
curl -X POST http://localhost:3000/api/media-request \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "outlet": "Test Outlet",
    "requestType": "other",
    "message": "This should fail validation."
  }'
```

## Performance

### Benchmarks

- Average response time: <500ms
- Email delivery: <2s (with retries)
- Rate limiting check: <10ms

### Monitoring

Track these metrics in production:

1. Request volume by request type
2. Email delivery success rate
3. Rate limit hit rate
4. Average response time
5. Error rate by type

### Optimization Tips

1. **Email delivery**: Runs async, doesn't block response
2. **Storage**: Fire-and-forget, failures don't block
3. **Rate limiting**: In-memory for dev, Redis for production
4. **Caching**: CORS preflight responses cached 24 hours

## Production Deployment

### Environment Variables

Required:
```bash
RESEND_API_KEY=re_xxxxx              # Email service
NEXT_PUBLIC_SITE_URL=https://ai-born.org  # Site URL
EMAIL_FROM=AI-Born <excerpt@ai-born.org>  # From address
EMAIL_PR_TEAM=press@micpress.com     # PR team inbox
```

Optional:
```bash
EMAIL_REPLY_TO=hello@ai-born.org     # Reply-to address
UPSTASH_REDIS_REST_URL=...           # For distributed rate limiting
UPSTASH_REDIS_REST_TOKEN=...         # Redis auth token
```

### Vercel Deployment

1. Add environment variables in Vercel dashboard
2. Ensure `RESEND_API_KEY` is set
3. Configure `EMAIL_PR_TEAM` for production PR inbox
4. Enable Redis for distributed rate limiting (recommended)

### Domain Configuration

Verify domain in Resend dashboard:
1. Go to https://resend.com/domains
2. Add domain (e.g., `ai-born.org`)
3. Configure DNS records (SPF, DKIM, DMARC)
4. Update `EMAIL_FROM` to use verified domain

## Troubleshooting

### Email Not Sending

1. Check `RESEND_API_KEY` is set correctly
2. Verify domain is verified in Resend dashboard
3. Check logs for email service errors
4. Ensure `EMAIL_PR_TEAM` is a valid email address
5. Review rate limits (5 emails/hour per recipient)

### Rate Limiting Issues

1. In production, use Redis (Upstash) for distributed rate limiting
2. Check rate limit configuration matches requirements
3. Consider IP whitelisting for known media outlets
4. Monitor rate limit headers in responses

### Storage Failures

1. Ensure `data/` directory exists and is writable
2. Check disk space
3. Review file permissions
4. Consider migrating to database for reliability

### Form Validation Errors

1. Check schema in `lib/schemas/contact.ts` matches form
2. Ensure request types match between schema and form
3. Verify phone/deadline optional field handling
4. Test with various input combinations

## Future Enhancements

### Database Integration

Replace JSON file storage with Prisma:

```prisma
model MediaRequest {
  id          String   @id @default(cuid())
  requestId   String   @unique
  name        String
  email       String
  outlet      String
  requestType String
  phone       String?
  message     String
  deadline    DateTime?
  clientIp    String
  createdAt   DateTime @default(now())
  status      String   @default("pending") // pending, reviewed, contacted, completed
}
```

### CRM Integration

Integrate with HubSpot, Salesforce, or similar:

```typescript
// Sync to CRM after successful submission
await syncToCRM({
  firstName: extractFirstName(data.name),
  lastName: extractLastName(data.name),
  email: data.email,
  company: data.outlet,
  leadSource: 'Website - Media Request',
  requestType: data.requestType,
});
```

### Slack Notifications

Real-time alerts for urgent requests:

```typescript
if (data.deadline && isWithin24Hours(data.deadline)) {
  await sendSlackNotification({
    channel: '#pr-team',
    text: `🚨 Urgent media request from ${data.outlet}`,
    deadline: data.deadline,
  });
}
```

### Auto-responder

Send confirmation email to requester:

```typescript
await sendMediaRequestConfirmation({
  email: data.email,
  name: data.name,
  requestId: requestId,
  expectedResponseTime: '24-48 hours',
});
```

## Support

For technical issues or questions:
- Email: dev@micpress.com
- Documentation: https://ai-born.org/docs
- Repository: [Add GitHub URL when available]

---

**Last Updated**: October 18, 2025
**Version**: 1.0.0
**Maintained By**: Development Team
