# Email Service Documentation

## Overview

Production-ready email service integration using [Resend](https://resend.com) for transactional email delivery. Includes automatic retry logic, rate limiting, comprehensive error handling, and CAN-SPAM compliant templates.

## Features

- **Reliable Delivery**: Exponential backoff retry logic (up to 3 attempts)
- **Rate Limiting**: Per-recipient rate limiting (5 emails/hour) to prevent spam
- **Error Handling**: Comprehensive error tracking with detailed logging
- **CAN-SPAM Compliance**: All emails include unsubscribe links and sender info
- **Type Safety**: Full TypeScript support with detailed type definitions
- **Monitoring**: Event logging for analytics and debugging

## Setup

### 1. Install Dependencies

```bash
npm install resend
```

### 2. Configure Environment Variables

Add to your `.env.local`:

```bash
# Required
RESEND_API_KEY=re_your_api_key_here

# Optional (defaults shown)
EMAIL_FROM=AI-Born <excerpt@ai-born.org>
EMAIL_REPLY_TO=hello@ai-born.org
NEXT_PUBLIC_SITE_URL=https://ai-born.org
```

### 3. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Navigate to API Keys
3. Create a new API key
4. Copy to `RESEND_API_KEY` environment variable

### 4. Verify Domain

To send from your custom domain (e.g., `excerpt@ai-born.org`):

1. Go to Domains in Resend dashboard
2. Add your domain
3. Add DNS records (SPF, DKIM, DMARC)
4. Verify domain

Without domain verification, emails will send from `onboarding@resend.dev` (testing only).

## Available Functions

### `sendExcerptEmail(email: string)`

Sends free excerpt PDF to new subscribers.

**Usage:**
```typescript
import { sendExcerptEmail } from '@/lib/email';

const result = await sendExcerptEmail('user@example.com');

if (result.success) {
  console.log('Email sent!', result.messageId);
} else {
  console.error('Failed:', result.error);
}
```

**Returns:**
```typescript
{
  success: boolean;
  messageId?: string;    // Resend message ID
  error?: string;        // Error message if failed
  errorCode?: EmailErrorCode;
}
```

### `sendBonusPackEmail(email: string, orderId: string)`

Sends pre-order bonus pack after purchase verification.

**Usage:**
```typescript
import { sendBonusPackEmail } from '@/lib/email';

const result = await sendBonusPackEmail(
  'user@example.com',
  'ORDER-123456'
);
```

### `sendOrgInviteEmail(email: string, orgName: string, inviteLink: string)`

Sends bulk order invitation for corporate purchases.

**Usage:**
```typescript
import { sendOrgInviteEmail } from '@/lib/email';

const result = await sendOrgInviteEmail(
  'employee@company.com',
  'Acme Corp',
  'https://ai-born.org/bulk/invite/abc123'
);
```

### `sendMagicLinkEmail(email: string, token: string)`

Sends passwordless authentication magic link.

**Usage:**
```typescript
import { sendMagicLinkEmail } from '@/lib/email';

const result = await sendMagicLinkEmail(
  'user@example.com',
  'secure_token_here'
);
```

### `testEmailService()`

Health check for email service configuration.

**Usage:**
```typescript
import { testEmailService } from '@/lib/email';

const status = await testEmailService();

if (status.configured) {
  console.log('Email service ready!');
} else {
  console.error('Issues:', status.issues);
}
```

## Error Handling

### Error Codes

- `CONFIG_ERROR`: Missing or invalid configuration (e.g., no API key)
- `RATE_LIMIT_ERROR`: Recipient has exceeded rate limit
- `SEND_ERROR`: Email send failed (network, API error)
- `RETRY_EXHAUSTED`: All retry attempts failed
- `VALIDATION_ERROR`: Invalid input (email format, missing fields)

### Example Error Handling

```typescript
const result = await sendExcerptEmail(email);

if (!result.success) {
  switch (result.errorCode) {
    case 'RATE_LIMIT_ERROR':
      return 'Too many emails sent. Please try again later.';

    case 'VALIDATION_ERROR':
      return 'Invalid email address.';

    case 'CONFIG_ERROR':
      // Log to monitoring service
      console.error('Email service misconfigured!');
      return 'Email service unavailable.';

    default:
      return 'Failed to send email. Please try again.';
  }
}
```

## Rate Limiting

### Default Limits

- **Per Recipient**: 5 emails per hour
- **Scope**: Email address (case-insensitive)
- **Storage**: In-memory (resets on server restart)

### Customize Rate Limits

Edit `EMAIL_RATE_LIMIT` in `/src/lib/email.ts`:

```typescript
const EMAIL_RATE_LIMIT = {
  maxRequests: 10,           // 10 emails
  windowMs: 60 * 60 * 1000,  // per hour
};
```

### Production Considerations

For multi-instance deployments (e.g., serverless functions), consider using distributed rate limiting:

- **Redis**: Via Upstash or self-hosted
- **Vercel Edge Config**: Built-in key-value store
- **Database**: Track email sends in PostgreSQL/MongoDB

## Retry Logic

### Configuration

Default retry settings (exponential backoff):

```typescript
{
  maxRetries: 3,        // Try up to 3 times
  initialDelayMs: 1000, // Start with 1 second
  maxDelayMs: 10000,    // Cap at 10 seconds
}
```

### Retry Schedule

- **Attempt 1**: Immediate
- **Attempt 2**: +1 second delay
- **Attempt 3**: +2 seconds delay
- **Attempt 4**: +4 seconds delay (capped at maxDelayMs)

### Customize Retries

Pass custom config to `sendEmailWithRetry`:

```typescript
const result = await sendEmailWithRetry(
  email,
  subject,
  html,
  'excerpt',
  {
    maxRetries: 5,
    initialDelayMs: 2000,
    maxDelayMs: 30000,
  }
);
```

## Email Templates

### Template Structure

All emails use a consistent branded template:

- **Header**: AI-Born logo and tagline
- **Content**: Message-specific HTML
- **Footer**: Unsubscribe link, privacy policy, company info

### Customize Templates

Edit template functions in `/src/lib/email.ts`:

```typescript
function getEmailTemplate(content: string, recipient: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <!-- Your custom template here -->
      ${content}
      ${getUnsubscribeFooter(recipient)}
    </html>
  `;
}
```

### Add New Email Type

1. Create email template function:

```typescript
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<EmailResult> {
  const content = `
    <h2>Welcome, ${name}!</h2>
    <p>Thanks for joining AI-Born.</p>
  `;

  const html = getEmailTemplate(content, email);

  return sendEmailWithRetry(
    email,
    'Welcome to AI-Born',
    html,
    'welcome'
  );
}
```

2. Update email event logging types in `/src/types/email.ts`

## Monitoring & Logging

### Event Logging

All email events are logged to console:

```javascript
[Email Service] Sent: {
  timestamp: "2025-10-18T...",
  recipient: "user@example.com",
  emailType: "excerpt",
  status: "sent",
  messageId: "msg_abc123"
}
```

### Production Monitoring

In production, send logs to monitoring service:

```typescript
// In logEmailEvent() function
if (process.env.NODE_ENV === 'production') {
  // Send to Datadog
  await datadog.log(logEntry);

  // Or Sentry
  Sentry.captureMessage('Email sent', {
    level: 'info',
    extra: logEntry,
  });

  // Or custom webhook
  await fetch('https://your-monitoring.com/events', {
    method: 'POST',
    body: JSON.stringify(logEntry),
  });
}
```

### Key Metrics to Track

- **Send Success Rate**: `sent / (sent + failed)`
- **Rate Limit Hits**: Track `rate_limited` events
- **Average Retry Count**: Monitor retry patterns
- **Error Distribution**: Group by `errorCode`

## CAN-SPAM Compliance

### Required Elements

All emails include:

1. **Unsubscribe Link**: One-click unsubscribe
2. **Physical Address**: Mic Press, LLC, New York, NY
3. **Sender Identification**: Clear "from" address
4. **Honest Subject Lines**: No misleading subjects

### Unsubscribe Implementation

Create unsubscribe page at `/app/unsubscribe/page.tsx`:

```typescript
export default function UnsubscribePage({
  searchParams,
}: {
  searchParams: { email: string };
}) {
  const email = searchParams.email;

  // Handle unsubscribe logic
  // - Remove from mailing list
  // - Update database
  // - Show confirmation

  return <div>You've been unsubscribed.</div>;
}
```

## Testing

### Test in Development

1. Set test API key in `.env.local`
2. Use your own email for testing
3. Check console logs for events

```bash
# Run dev server
npm run dev

# Test email endpoint
curl -X POST http://localhost:3000/api/email-capture \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Test Health Check

```typescript
// In a route or script
import { testEmailService } from '@/lib/email';

const status = await testEmailService();
console.log(status);
// { configured: true, issues: [] }
```

### Manual Testing

Create a test route at `/app/api/test-email/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { sendExcerptEmail } from '@/lib/email';

export async function GET() {
  const result = await sendExcerptEmail('your-email@example.com');
  return NextResponse.json(result);
}
```

Visit `/api/test-email` to trigger test email.

## Troubleshooting

### Email Not Sending

1. **Check API Key**: Verify `RESEND_API_KEY` is set correctly
2. **Check Domain**: Ensure domain is verified in Resend
3. **Check Logs**: Look for error messages in console
4. **Test Connection**: Run `testEmailService()`

### Rate Limit Issues

- Check if recipient has exceeded 5 emails/hour
- Wait for rate limit window to reset
- Increase limit if needed (see Rate Limiting section)

### Delivery Issues

- Check spam folder
- Verify SPF/DKIM/DMARC records
- Review Resend dashboard for bounces
- Test with different email provider

### Performance Issues

- Monitor retry count (high retries = Resend API issues)
- Check server logs for timeout errors
- Consider increasing timeout for slow connections

## Security Best Practices

1. **Never Log API Keys**: Ensure `RESEND_API_KEY` stays in env vars
2. **Validate Inputs**: Always validate email addresses
3. **Rate Limit**: Prevent abuse with per-recipient limits
4. **Sanitize Content**: Escape user-provided content in emails
5. **Use HTTPS**: Ensure all links in emails use HTTPS
6. **Token Security**: Use cryptographically secure tokens for magic links

## Migration from Other Services

### From SendGrid

```typescript
// Old (SendGrid)
await sgMail.send({
  to: email,
  from: 'noreply@ai-born.org',
  subject: 'Welcome',
  html: '<p>Hello</p>',
});

// New (Resend via our service)
await sendEmailWithRetry(
  email,
  'Welcome',
  getEmailTemplate('<p>Hello</p>', email),
  'welcome'
);
```

### From Postmark

```typescript
// Old (Postmark)
await client.sendEmail({
  From: 'noreply@ai-born.org',
  To: email,
  Subject: 'Welcome',
  HtmlBody: '<p>Hello</p>',
});

// New (Resend via our service)
await sendExcerptEmail(email);
```

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Dashboard](https://resend.com/overview)
- [CAN-SPAM Act Compliance](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)
- [Email Best Practices](https://postmarkapp.com/guides/transactional-email-best-practices)

## Support

For issues or questions:

1. Check [Resend Status](https://status.resend.com)
2. Review [Resend Community](https://resend.com/community)
3. Contact Resend Support via dashboard
4. File bug report in project repository
