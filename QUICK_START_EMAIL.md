# Email Service Quick Start

Get the email service running in 5 minutes.

## Step 1: Install Dependencies ✅

Already done! The `resend` package is installed.

## Step 2: Get Resend API Key

1. Go to [resend.com/signup](https://resend.com/signup)
2. Sign up for free account
3. Navigate to **API Keys** in dashboard
4. Click **Create API Key**
5. Copy the key (starts with `re_`)

## Step 3: Configure Environment

Create `.env.local` in project root:

```bash
# Required
RESEND_API_KEY=re_paste_your_api_key_here

# Optional (these are the defaults)
EMAIL_FROM=AI-Born <excerpt@ai-born.org>
EMAIL_REPLY_TO=hello@ai-born.org
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 4: Test Configuration

```bash
npx tsx scripts/test-email-service.ts
```

You should see:
```
✅ Email service is properly configured
```

## Step 5: Send Test Email

```bash
npx tsx scripts/test-email-service.ts send your@email.com
```

Replace `your@email.com` with your actual email address.

You should see:
```
✅ Email sent successfully!
   Message ID: msg_abc123
   Check inbox at: your@email.com
```

**Check your inbox!** You should receive an excerpt email.

## Step 6: Test API Routes

Start dev server:
```bash
npm run dev
```

Test excerpt email:
```bash
curl -X POST http://localhost:3000/api/email-capture \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com"}'
```

Test magic link:
```bash
curl -X POST http://localhost:3000/api/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com"}'
```

## Using in Your Code

### Send Excerpt Email

```typescript
import { sendExcerptEmail } from '@/lib/email';

const result = await sendExcerptEmail('user@example.com');

if (result.success) {
  console.log('Sent!', result.messageId);
} else {
  console.error('Failed:', result.error);
}
```

### Send Bonus Pack

```typescript
import { sendBonusPackEmail } from '@/lib/email';

const result = await sendBonusPackEmail(
  'user@example.com',
  'ORDER-123456'
);
```

### Send Magic Link

```typescript
import { sendMagicLinkEmail } from '@/lib/email';

const token = crypto.randomBytes(32).toString('base64url');
const result = await sendMagicLinkEmail('user@example.com', token);
```

### Check Health

```typescript
import { testEmailService } from '@/lib/email';

const status = await testEmailService();
console.log(status.configured); // true or false
console.log(status.issues);     // array of issues if any
```

## Production Setup (Optional for Now)

### Verify Your Domain

To send from `excerpt@ai-born.org` instead of `onboarding@resend.dev`:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter `ai-born.org`
4. Add DNS records shown (SPF, DKIM, DMARC)
5. Wait for verification (usually < 1 hour)

Once verified, update `.env.local`:
```bash
EMAIL_FROM=AI-Born <excerpt@ai-born.org>
```

## Troubleshooting

### "RESEND_API_KEY not set"
- Check `.env.local` exists in project root
- Verify key starts with `re_`
- Restart dev server after adding

### Emails not arriving
- Check spam folder
- Verify API key is active in Resend dashboard
- Look for errors in console logs

### Rate limit errors
- You've sent > 5 emails/hour to same recipient
- Wait 1 hour or test with different email
- Increase limit in `/src/lib/email.ts` if needed

## Documentation

- **Full Documentation**: `/src/lib/EMAIL_SERVICE_README.md`
- **Implementation Summary**: `/EMAIL_SERVICE_IMPLEMENTATION.md`
- **Source Code**: `/src/lib/email.ts`

## Need Help?

1. Check [Resend docs](https://resend.com/docs)
2. Review error logs in console
3. Run health check: `npx tsx scripts/test-email-service.ts`
4. Check [Resend status](https://status.resend.com)

---

**You're all set!** The email service is ready to use. 🚀
