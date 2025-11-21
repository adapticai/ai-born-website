# Bonus Pack Delivery - Quick Start Guide

Fast setup guide for developers working with the bonus pack delivery system.

---

## 5-Minute Setup

### 1. Install Dependencies

Already installed (included in package.json):
- `@prisma/client` - Database ORM
- `resend` - Email service
- `@upstash/ratelimit` - Rate limiting

### 2. Configure Environment

Add to `.env.local`:

```env
NEXTAUTH_SECRET="your-secret-key-at-least-32-chars"
RESEND_API_KEY="re_xxxxxxxxxxxxx"
DATABASE_URL="postgresql://user:pass@localhost:5432/aiborn"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 3. Setup Database

```bash
npm run db:push
```

### 4. Add Assets

Assets are already created as placeholders in `public/bonus-pack/`. Replace with real content before production.

### 5. Test Locally

```bash
npm run dev
```

Visit: http://localhost:3000

---

## Quick Test

### Submit Bonus Claim

```bash
curl -X POST http://localhost:3000/api/bonus/claim \
  -F "email=test@example.com" \
  -F "orderId=TEST-123" \
  -F "retailer=Amazon" \
  -F "format=hardcover" \
  -F "receipt=@test-file.pdf"
```

### Check Email

Look for email from `excerpt@ai-born.org` with subject "Your AI-Born Pre-order Bonus Pack is Ready"

### Download Asset

Use token from email:

```bash
curl "http://localhost:3000/api/bonus/download/agent-charter-pack?token=YOUR_TOKEN" \
  --output test-download.pdf
```

---

## File Structure

```
src/
├── app/api/bonus/
│   ├── claim/route.ts           # Submit bonus claim
│   └── download/[asset]/route.ts # Download with token
├── lib/
│   ├── bonus-pack-tokens.ts     # Token generation
│   └── email.ts                 # Email templates
└── types/
    └── analytics.ts             # Event types

public/
└── bonus-pack/                  # Asset files (7 total)
```

---

## Common Tasks

### Generate Download Token

```typescript
import { generateBonusPackToken } from '@/lib/bonus-pack-tokens';

const token = generateBonusPackToken(
  'user@example.com',
  'claim-abc123',
  'agent-charter-pack'
);
```

### Send Bonus Email

```typescript
import { sendBonusPackEmail } from '@/lib/email';
import { generateAllBonusPackUrls } from '@/lib/bonus-pack-tokens';

const urls = generateAllBonusPackUrls(
  'user@example.com',
  'claim-abc123',
  'https://ai-born.org'
);

await sendBonusPackEmail('user@example.com', 'claim-abc123', urls);
```

### Query Claims

```typescript
import { prisma } from '@/lib/prisma';

// Get all approved claims
const claims = await prisma.bonusClaim.findMany({
  where: { status: 'APPROVED' },
  include: { user: true, receipt: true }
});

// Get claim by ID
const claim = await prisma.bonusClaim.findUnique({
  where: { id: 'claim-abc123' }
});
```

---

## Troubleshooting

### Email Not Sending

1. Check `RESEND_API_KEY` is set
2. Verify domain in Resend dashboard
3. Check API logs in Resend

### Token Invalid

1. Verify `NEXTAUTH_SECRET` matches
2. Check token hasn't expired (24h)
3. Ensure token wasn't modified

### File Not Found

1. Check file exists in `public/bonus-pack/`
2. Verify filename matches exactly
3. Check file permissions

### Database Error

1. Run `npm run db:push`
2. Check `DATABASE_URL` is correct
3. Verify database is running

---

## Production Deployment

### Pre-Deploy Checklist

- [ ] Replace placeholder PDFs with real assets
- [ ] Set production environment variables
- [ ] Verify Resend domain
- [ ] Test end-to-end in staging
- [ ] Configure S3/R2 (optional)

### Deploy

```bash
npm run build
vercel deploy --prod
```

---

## API Reference

### POST /api/bonus/claim

Submit bonus claim with receipt.

**Rate Limit**: 3 requests/hour per IP

**Request**:
```
email: string
orderId: string
retailer: string
format: 'hardcover' | 'ebook' | 'audiobook'
receipt: File (PDF/PNG/JPG, max 5MB)
```

**Response**:
```json
{
  "success": true,
  "data": {
    "claimId": "clv...",
    "status": "APPROVED"
  }
}
```

---

### GET /api/bonus/download/[asset]?token=xxx

Download bonus asset.

**Rate Limit**: 20 downloads/hour per user

**Assets**:
- `agent-charter-pack`
- `coi-diagnostic`
- `vp-agent-templates`
- `sub-agent-ladders`
- `escalation-protocols`
- `implementation-guide`
- `full-bonus-pack`

**Response**: Binary file download

---

## Support

- **Full Documentation**: See `BONUS_PACK_SETUP.md`
- **Implementation Summary**: See `BONUS_PACK_IMPLEMENTATION_SUMMARY.md`
- **Asset Structure**: See `public/bonus-pack/README.md`

---

**Last Updated**: 2025-10-18
