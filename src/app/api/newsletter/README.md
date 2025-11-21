# Newsletter Subscription System

Comprehensive double opt-in newsletter subscription system with GDPR/CCPA compliance.

## Features

- **Double Opt-In Flow**: Email confirmation required to activate subscription
- **GDPR/CCPA Compliant**: Full compliance with data protection regulations
- **Rate Limiting**: 10 requests/hour per IP to prevent abuse
- **Spam Protection**: Honeypot field for bot detection
- **Interest-Based Segmentation**: Subscribers can select topics of interest
- **Source Tracking**: Attribution tracking for marketing analytics
- **Secure Tokens**: JWT-based confirmation and unsubscribe tokens
- **Email Automation**: Confirmation and welcome emails via Resend
- **Accessible**: WCAG 2.2 AA compliant forms
- **Analytics Integration**: GTM dataLayer events for tracking

## Architecture

### API Endpoints

#### `POST /api/newsletter/subscribe`

Subscribe to the newsletter. Sends confirmation email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",  // optional
  "source": "hero",  // hero, footer, excerpt, bonus, blog, popup, other
  "interests": [  // optional
    "ai-native-org",
    "governance",
    "agent-architecture",
    "defensibility",
    "launch-updates",
    "speaking-events"
  ],
  "honeypot": ""  // must be empty (spam protection)
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Thank you for subscribing! Please check your email to confirm your subscription.",
  "subscriptionId": "sub_abc123..."
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Please correct the errors below",
  "errors": {
    "email": ["Please enter a valid email address"]
  }
}
```

**Rate Limit:** 10 requests/hour per IP

---

#### `GET /newsletter/confirm?token=...`

Confirm newsletter subscription via email link.

**Query Parameters:**
- `token` (required): JWT confirmation token from email

**Response:**
- Redirects to `/?newsletter_success=confirmed` on success
- Redirects to `/?newsletter_error=...` on failure

**Side Effects:**
- Updates subscriber status to `confirmed`
- Sends welcome email
- Tracks analytics event

---

#### `GET /newsletter/unsubscribe?token=...`

Unsubscribe from newsletter via email link.

**Query Parameters:**
- `token` (required): JWT unsubscribe token from email footer

**Response:**
- Redirects to `/?unsubscribe_success=true` on success
- Redirects to `/?unsubscribe_error=...` on failure

**Side Effects:**
- Updates subscriber status to `unsubscribed`
- Tracks analytics event

---

#### `POST /newsletter/unsubscribe`

Unsubscribe via email address (alternative method).

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "You've been successfully unsubscribed from our newsletter."
}
```

## Data Model

### NewsletterSubscriber

```typescript
interface NewsletterSubscriber {
  id: string;                      // Unique subscription ID
  email: string;                   // Subscriber email (lowercase, trimmed)
  name?: string;                   // Optional name
  source: NewsletterSource;        // Attribution source
  interests: NewsletterInterest[]; // Selected topics
  status: SubscriptionStatus;      // pending, confirmed, unsubscribed, bounced, complained
  confirmedAt?: Date;              // When subscription was confirmed
  unsubscribedAt?: Date;           // When user unsubscribed
  createdAt: Date;                 // Initial subscription date
  updatedAt: Date;                 // Last update
  ipAddress?: string;              // IP address (for compliance)
  userAgent?: string;              // User agent (for compliance)
  confirmationToken?: string;      // JWT token for confirmation
  unsubscribeToken?: string;       // JWT token for unsubscribe
}
```

### Subscription Status

- **`pending`**: Awaiting email confirmation (double opt-in)
- **`confirmed`**: Confirmed and active
- **`unsubscribed`**: User unsubscribed
- **`bounced`**: Email bounced
- **`complained`**: Spam complaint

### Source Types

- `hero`: Hero section form
- `footer`: Footer form
- `excerpt`: Free excerpt download
- `bonus`: Pre-order bonus claim
- `blog`: Blog post subscription
- `popup`: Modal/popup form
- `other`: Other sources

### Interest Types

- `ai-native-org`: AI-Native Organisation Design
- `governance`: Governance & Trust
- `agent-architecture`: Agent Architecture
- `defensibility`: Strategic Defensibility
- `launch-updates`: Launch Updates
- `speaking-events`: Speaking Events

## Email Templates

### Confirmation Email

**Subject:** Confirm Your AI-Born Newsletter Subscription

**Content:**
- Clear call-to-action button
- List of benefits
- Expiration notice (7 days)
- Unsubscribe link in footer (CAN-SPAM)

### Welcome Email

**Subject:** Welcome to AI-Born Updates

**Sent:** Immediately after confirmation

**Content:**
- Personalized greeting
- What to expect
- Links to excerpt and pre-order
- Unsubscribe link in footer

## Security

### Token Generation

- **Algorithm:** HMAC-SHA256 (HS256)
- **Secret:** `NEXTAUTH_SECRET` or `EXCERPT_TOKEN_SECRET`
- **Confirmation Token Expiry:** 7 days
- **Unsubscribe Token Expiry:** 100 years (effectively never)

### Rate Limiting

- **Limit:** 10 requests/hour per IP
- **Window:** Rolling 1-hour window
- **Storage:** In-memory (reset on server restart)
- **Production:** Use Redis for distributed rate limiting

### Spam Protection

- **Honeypot Field:** Hidden `honeypot` field must be empty
- **Email Validation:** Server-side Zod validation
- **Rate Limiting:** Per-IP request throttling

## GDPR/CCPA Compliance

### Data Collection

- **Explicit Consent:** Double opt-in required
- **Clear Purpose:** Subscribers know what they're signing up for
- **Privacy Policy:** Link in form and email footer

### User Rights

- **Right to Access:** Export subscriber data via `NewsletterStore.exportData()`
- **Right to Erasure:** Delete subscriber via `NewsletterStore.delete()`
- **Right to Portability:** Export all data in JSON format
- **Right to Unsubscribe:** One-click unsubscribe in every email

### Data Retention

- **Active Subscribers:** Indefinite
- **Unsubscribed:** Kept for compliance (with status flag)
- **Pending (Unconfirmed):** Auto-delete after 30 days (recommended)

### CAN-SPAM Compliance

- **Unsubscribe Link:** Present in all emails
- **Physical Address:** Mic Press, LLC, New York, NY (in footer)
- **Sender Identity:** Clear "From" name
- **Honour Unsubscribe:** Immediate (no delay)

## Analytics Events

### Newsletter Subscribed

```typescript
{
  event: 'newsletter_subscribed',
  source_referrer: 'hero' | 'footer' | 'excerpt' | ...,
  success: boolean,
  book: 'ai-born',
  timestamp: string (ISO 8601)
}
```

Fired when:
- User successfully subscribes
- Confirmation email is sent

### Newsletter Confirmed

```typescript
{
  event: 'newsletter_confirmed',
  source: string,
  email_hash: string, // SHA-256 hash for privacy
  timestamp: string
}
```

Fired when:
- User clicks confirmation link
- Subscription is activated

### Newsletter Unsubscribed

```typescript
{
  event: 'newsletter_unsubscribed',
  method: 'link' | 'form',
  timestamp: string
}
```

Fired when:
- User unsubscribes via email link
- User unsubscribes via form

## Usage Examples

### Basic Form (Hero Section)

```tsx
import { NewsletterForm } from '@/components/NewsletterForm';

export function HeroSection() {
  return (
    <section>
      <h2>Stay Updated</h2>
      <NewsletterForm
        source="hero"
        showInterests
        submitText="Get Launch Updates"
      />
    </section>
  );
}
```

### Compact Form (Footer)

```tsx
import { CompactNewsletterForm } from '@/components/NewsletterForm';

export function Footer() {
  return (
    <footer>
      <h3>Newsletter</h3>
      <CompactNewsletterForm source="footer" />
    </footer>
  );
}
```

### With Callback

```tsx
<NewsletterForm
  source="popup"
  onSuccess={(email) => {
    console.log('User subscribed:', email);
    // Track custom analytics, close modal, etc.
  }}
/>
```

## Storage

### Current: In-Memory

**Implementation:** `NewsletterStore` (Map-based)

**Pros:**
- Simple, no database required
- Fast reads/writes
- Good for MVP/testing

**Cons:**
- Data lost on server restart
- Not suitable for production
- No persistence across deployments

### Production: Database

**Recommended:** PostgreSQL, MongoDB, or Supabase

**Migration Path:**

1. **Create Database Table:**
```sql
CREATE TABLE newsletter_subscribers (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  source VARCHAR(50) NOT NULL,
  interests TEXT[], -- Array of interest slugs
  status VARCHAR(20) NOT NULL,
  confirmed_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  confirmation_token TEXT,
  unsubscribe_token TEXT,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

2. **Replace `NewsletterStore`:**
```typescript
// Replace Map-based storage with database queries
class NewsletterRepository {
  static async upsert(subscriber: NewsletterSubscriber) {
    return await db.newsletterSubscribers.upsert({ ... });
  }

  static async findByEmail(email: string) {
    return await db.newsletterSubscribers.findUnique({
      where: { email }
    });
  }

  // ... other methods
}
```

3. **Use Prisma/Drizzle:**
```typescript
import { prisma } from '@/lib/prisma';

export const newsletterRepository = {
  upsert: (data) => prisma.newsletterSubscriber.upsert({
    where: { email: data.email },
    update: data,
    create: data,
  }),
  // ...
};
```

## Environment Variables

### Required

```env
RESEND_API_KEY=re_...                      # Resend API key for email delivery
NEXTAUTH_SECRET=your_secret_key_here       # Secret for JWT token signing (min 32 chars)
NEXT_PUBLIC_SITE_URL=https://ai-born.org  # Production site URL
```

### Optional

```env
EMAIL_FROM="AI-Born <newsletter@ai-born.org>"  # Sender email
EMAIL_REPLY_TO="hello@ai-born.org"             # Reply-to address
```

## Testing

### Manual Testing

1. **Subscribe:**
   ```bash
   curl -X POST http://localhost:3000/api/newsletter/subscribe \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "source": "hero",
       "interests": ["launch-updates"]
     }'
   ```

2. **Check Email:**
   - Open confirmation email
   - Click "Confirm Subscription" button

3. **Verify Confirmation:**
   - Should redirect to `/?newsletter_success=confirmed`
   - Should receive welcome email

4. **Unsubscribe:**
   - Click "Unsubscribe" link in any email
   - Should redirect to `/?unsubscribe_success=true`

### Automated Testing

```typescript
import { POST } from '@/app/api/newsletter/subscribe/route';

describe('Newsletter Subscription', () => {
  it('should accept valid email', async () => {
    const request = new Request('http://localhost/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', source: 'hero' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should reject invalid email', async () => {
    // ... test cases
  });

  it('should trigger honeypot on spam', async () => {
    // ... test cases
  });
});
```

## Monitoring & Observability

### Metrics to Track

- **Subscription Rate:** New subscriptions per day
- **Confirmation Rate:** % of pending → confirmed
- **Unsubscribe Rate:** % of confirmed → unsubscribed
- **Bounce Rate:** % of emails that bounce
- **Source Distribution:** Which forms drive most signups
- **Interest Distribution:** Popular topics

### Logging

All operations logged with context:

```typescript
{
  timestamp: "2025-01-15T10:30:00Z",
  event: "newsletter_subscribe",
  ip: "192.168.1.1",
  email: "user@example.com",
  source: "hero",
  success: true,
  action: "New subscription created"
}
```

### Error Handling

- Email send failures logged to console
- Rate limit violations tracked
- Validation errors returned to user
- Server errors logged with stack trace

## Future Enhancements

### Phase 2 (Recommended)

- [ ] Database persistence (PostgreSQL/MongoDB)
- [ ] Email service integration (Mailchimp, ConvertKit)
- [ ] Segmentation campaigns
- [ ] A/B testing for forms
- [ ] Analytics dashboard
- [ ] Email engagement tracking (opens, clicks)

### Phase 3 (Optional)

- [ ] Subscriber tagging system
- [ ] Custom email sequences
- [ ] Preference center
- [ ] Email template builder
- [ ] Webhook integrations
- [ ] Multi-language support

## Troubleshooting

### Emails Not Sending

**Check:**
1. `RESEND_API_KEY` is set correctly
2. Resend domain is verified
3. Email FROM address matches verified domain
4. Check Resend dashboard for errors

### Confirmation Link Not Working

**Check:**
1. `NEXTAUTH_SECRET` is set (min 32 chars)
2. Token hasn't expired (7 days)
3. URL matches `NEXT_PUBLIC_SITE_URL`

### Rate Limiting Issues

**Solution:**
- Use Redis for distributed rate limiting
- Increase limits in production
- Whitelist trusted IPs

### Subscriber Not Found After Subscribe

**Issue:** In-memory storage cleared on server restart

**Solution:**
- Implement database persistence
- Use serverless storage (Upstash, Supabase)

## Support

For questions or issues:
- **Email:** hello@micpress.com
- **Docs:** See CLAUDE.md Section 11
- **GitHub:** Open an issue

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Maintainer:** AI-Born Development Team
