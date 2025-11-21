# Bonus Pack Delivery System - Setup Guide

Complete documentation for the AI-Born pre-order bonus pack delivery system.

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Asset Structure](#asset-structure)
4. [Setup Instructions](#setup-instructions)
5. [API Endpoints](#api-endpoints)
6. [Security & Tokens](#security--tokens)
7. [Email Templates](#email-templates)
8. [Database Schema](#database-schema)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### Purpose

The Bonus Pack Delivery System enables secure, time-limited delivery of pre-order bonus materials to customers who submit proof of purchase. It implements the requirements from CLAUDE.md Section 5: Free Excerpt & Pre-order Bonus.

### Features

- **Secure Downloads**: HMAC-SHA256 signed tokens with 24-hour expiration
- **Automated Delivery**: Email with individual download links sent upon claim approval
- **Receipt Verification**: File upload with duplicate detection and hash verification
- **Rate Limiting**: Protection against abuse (3 claims/hour, 20 downloads/hour)
- **Analytics Tracking**: Full download and claim event tracking
- **Database Integration**: Prisma with PostgreSQL for claim management

### Bonus Pack Contents

According to CLAUDE.md, the pre-order bonus includes:

1. **Agent Charter Pack** - VP-agent templates, sub-agent ladders, escalation/override protocols
2. **Cognitive Overhead Index (COI) Diagnostic** - Interactive spreadsheet tool (Excel/Google Sheets)
3. **VP-Agent Templates** - Ready-to-use templates for top-level autonomous agents
4. **Sub-Agent Ladders** - Hierarchical organization patterns
5. **Escalation & Override Protocols** - Human oversight frameworks
6. **Implementation Guide** - Step-by-step setup instructions
7. **Complete Bonus Pack** - All materials in a single ZIP archive

---

## System Architecture

### Flow Diagram

```
User Submits Receipt → API Validates → Creates Records → Generates Tokens
                                            ↓
                                     Sends Email with Links
                                            ↓
                              User Clicks Link → Token Verified → File Downloaded
```

### Components

1. **Frontend**: Bonus claim form (React Hook Form + Zod validation)
2. **API Routes**:
   - `/api/bonus/claim` - POST: Submit bonus claim with receipt
   - `/api/bonus/download/[asset]` - GET: Download asset with token
3. **Database**: PostgreSQL with Prisma ORM
4. **Email**: Resend transactional email service
5. **Storage**: S3/R2 for receipt uploads (with local fallback)
6. **Security**: Token-based authentication, rate limiting, file validation

---

## Asset Structure

### Directory Layout

All bonus pack assets must be placed in the `public/bonus-pack/` directory:

```
public/
└── bonus-pack/
    ├── agent-charter-pack.pdf
    ├── cognitive-overhead-index.xlsx
    ├── vp-agent-templates.pdf
    ├── sub-agent-ladders.pdf
    ├── escalation-override-protocols.pdf
    ├── implementation-guide.pdf
    └── ai-born-bonus-pack-complete.zip
```

### Asset Specifications

| Asset | Filename | Type | Recommended Size | Description |
|-------|----------|------|------------------|-------------|
| Agent Charter Pack | `agent-charter-pack.pdf` | PDF | ~2.5 MB | Complete VP-agent templates and sub-agent hierarchy framework |
| COI Diagnostic | `cognitive-overhead-index.xlsx` | Excel | ~850 KB | Interactive spreadsheet for measuring institutional drag |
| VP-Agent Templates | `vp-agent-templates.pdf` | PDF | ~1.2 MB | Ready-to-use templates for top-level autonomous agents |
| Sub-Agent Ladders | `sub-agent-ladders.pdf` | PDF | ~980 KB | Hierarchical organization patterns and delegation protocols |
| Escalation Protocols | `escalation-override-protocols.pdf` | PDF | ~750 KB | Human oversight frameworks and emergency intervention patterns |
| Implementation Guide | `implementation-guide.pdf` | PDF | ~1.5 MB | Step-by-step setup and deployment instructions |
| Complete Pack | `ai-born-bonus-pack-complete.zip` | ZIP | ~8.5 MB | All bonus materials in a single archive |

### MIME Types

Configured in `/src/lib/bonus-pack-tokens.ts`:

- PDF: `application/pdf`
- Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- ZIP: `application/zip`

---

## Setup Instructions

### 1. Environment Variables

Add to `.env.local`:

```bash
# Required: Secret for token signing
NEXTAUTH_SECRET=your-secret-key-here

# Email configuration (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM="AI-Born <excerpt@ai-born.org>"
EMAIL_REPLY_TO="hello@ai-born.org"

# Site URL (for email links)
NEXT_PUBLIC_SITE_URL=https://ai-born.org

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/aiborn

# Optional: Cloud storage (S3/R2)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=ai-born-receipts
```

### 2. Database Setup

Run Prisma migrations:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations (production)
npm run db:migrate
```

### 3. Create Bonus Pack Assets

Create placeholder or real assets in `public/bonus-pack/`:

```bash
# Create directory
mkdir -p public/bonus-pack

# Create placeholder PDFs (replace with real assets in production)
touch public/bonus-pack/agent-charter-pack.pdf
touch public/bonus-pack/cognitive-overhead-index.xlsx
touch public/bonus-pack/vp-agent-templates.pdf
touch public/bonus-pack/sub-agent-ladders.pdf
touch public/bonus-pack/escalation-override-protocols.pdf
touch public/bonus-pack/implementation-guide.pdf

# Create ZIP archive
cd public/bonus-pack
zip ai-born-bonus-pack-complete.zip *.pdf *.xlsx
```

### 4. Test Email Configuration

```bash
# Test Resend API key
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "AI-Born <excerpt@ai-born.org>",
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<p>Email configuration working!</p>"
  }'
```

### 5. Deploy

```bash
# Build for production
npm run build

# Deploy to Vercel (or your platform)
vercel deploy --prod
```

---

## API Endpoints

### POST /api/bonus/claim

Submit bonus claim with receipt upload.

**Request:**
```http
POST /api/bonus/claim
Content-Type: multipart/form-data

email: user@example.com
orderId: AMZ-123456789
retailer: Amazon
format: hardcover
receipt: [File]
honeypot: [leave empty]
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Bonus claim submitted successfully! Check your email for download links. Links expire in 24 hours.",
  "data": {
    "claimId": "clvxxxxxxxxxxxx",
    "status": "APPROVED",
    "deliveryEmail": "user@example.com",
    "deliveredAt": "2025-10-18T12:34:56.789Z"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "This receipt has already been submitted.",
  "error": "DUPLICATE_RECEIPT"
}
```

**Rate Limits:**
- 3 requests per hour per IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

### GET /api/bonus/download/[asset]?token=xxx

Download bonus pack asset with signed token.

**Valid Asset Types:**
- `agent-charter-pack`
- `coi-diagnostic`
- `vp-agent-templates`
- `sub-agent-ladders`
- `escalation-protocols`
- `implementation-guide`
- `full-bonus-pack`

**Request:**
```http
GET /api/bonus/download/agent-charter-pack?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success):**
```http
200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="agent-charter-pack.pdf"
Content-Length: 2621440

[Binary file data]
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Download link has expired. Please contact support for a new link.",
  "error": "EXPIRED"
}
```

**Rate Limits:**
- 20 downloads per hour per user
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Security & Tokens

### Token Generation

Tokens are generated using HMAC-SHA256 signing:

```typescript
import { generateBonusPackToken } from '@/lib/bonus-pack-tokens';

const token = generateBonusPackToken(
  'user@example.com',
  'claim-123',
  'agent-charter-pack'
);
```

### Token Structure

JWT format with three parts: `header.payload.signature`

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "email": "user@example.com",
  "claimId": "clvxxxxxxxxxxxx",
  "asset": "agent-charter-pack",
  "timestamp": 1729252496789,
  "expiresAt": 1729338896789,
  "version": 1
}
```

**Signature:**
- HMAC-SHA256 using `NEXTAUTH_SECRET` or `BONUS_PACK_TOKEN_SECRET`
- Base64 URL-encoded

### Token Expiration

- **Validity Period**: 24 hours from generation
- **Security**: Single-use recommended (implement tracking if needed)
- **Renewal**: Users must contact support for new links after expiration

### Security Measures

1. **File Validation**:
   - MIME type verification (actual file content, not just extension)
   - File size limit: 5MB
   - Allowed types: PDF, PNG, JPG, JPEG
   - SHA-256 hash for duplicate detection

2. **Rate Limiting**:
   - Claim submission: 3/hour per IP
   - File downloads: 20/hour per user
   - Upstash Redis for distributed rate limiting

3. **Spam Prevention**:
   - Honeypot field (invisible to users)
   - Email format validation
   - Order ID length validation (5-100 chars)

4. **Access Control**:
   - Token required for all downloads
   - Email verification (token email must match claim)
   - Claim status verification (must be APPROVED or DELIVERED)

---

## Email Templates

### Bonus Pack Delivery Email

Sent automatically when claim is approved.

**Subject**: "Your AI-Born Pre-order Bonus Pack is Ready"

**Key Elements**:
- Primary CTA: Download Complete Bonus Pack (ZIP)
- Individual download links for each asset
- 24-hour expiration warning
- Claim ID for support reference
- Branded template with AI-Born colors

**Email sent via**: `sendBonusPackEmail()` in `/src/lib/email.ts`

**Example call**:
```typescript
import { sendBonusPackEmail } from '@/lib/email';
import { generateAllBonusPackUrls } from '@/lib/bonus-pack-tokens';

const downloadUrls = generateAllBonusPackUrls(
  'user@example.com',
  'claim-123',
  'https://ai-born.org'
);

await sendBonusPackEmail(
  'user@example.com',
  'claim-123',
  downloadUrls
);
```

---

## Database Schema

### Models

**User**
```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  emailVerified DateTime?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  receipts      Receipt[]
  bonusClaims   BonusClaim[]
}
```

**Receipt**
```prisma
model Receipt {
  id              String         @id @default(cuid())
  userId          String
  retailer        String
  orderNumber     String?
  format          String?
  status          ReceiptStatus  @default(PENDING)
  fileUrl         String
  fileHash        String         @unique
  ipAddress       String?
  userAgent       String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  bonusClaim      BonusClaim?
}
```

**BonusClaim**
```prisma
model BonusClaim {
  id                 String            @id @default(cuid())
  userId             String
  receiptId          String            @unique
  status             BonusClaimStatus  @default(PENDING)
  deliveryEmail      String
  deliveredAt        DateTime?
  deliveryTrackingId String?
  adminNotes         String?
  processedBy        String?
  processedAt        DateTime?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  user               User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  receipt            Receipt           @relation(fields: [receiptId], references: [id])
}
```

### Enums

**ReceiptStatus**
- `PENDING` - Uploaded, awaiting verification
- `VERIFIED` - Confirmed valid
- `REJECTED` - Invalid or fraudulent
- `DUPLICATE` - Already claimed

**BonusClaimStatus**
- `PENDING` - Receipt uploaded
- `PROCESSING` - Under review
- `APPROVED` - Verified, bonus sent
- `REJECTED` - Invalid receipt
- `DELIVERED` - Bonus pack delivered

---

## Testing

### Manual Testing Checklist

1. **Claim Submission**:
   - [ ] Submit claim with valid receipt
   - [ ] Verify email received
   - [ ] Check database records created
   - [ ] Test duplicate receipt rejection
   - [ ] Test invalid file types
   - [ ] Test file size limits
   - [ ] Test rate limiting

2. **Download Flow**:
   - [ ] Click download link from email
   - [ ] Verify file downloads correctly
   - [ ] Test all 7 asset types
   - [ ] Test expired token (wait 24h or manipulate)
   - [ ] Test invalid token
   - [ ] Test download rate limiting

3. **Email Delivery**:
   - [ ] Verify email styling
   - [ ] Check all links work
   - [ ] Test unsubscribe link
   - [ ] Check mobile rendering

### Test with cURL

**Submit Claim:**
```bash
curl -X POST http://localhost:3000/api/bonus/claim \
  -F "email=test@example.com" \
  -F "orderId=TEST-12345" \
  -F "retailer=Amazon" \
  -F "format=hardcover" \
  -F "receipt=@test-receipt.pdf"
```

**Download Asset (use token from email):**
```bash
curl "http://localhost:3000/api/bonus/download/agent-charter-pack?token=YOUR_TOKEN_HERE" \
  --output agent-charter-pack.pdf
```

### Automated Tests

```typescript
// Example test (Vitest)
import { POST } from '@/app/api/bonus/claim/route';

describe('Bonus Claim API', () => {
  it('should reject duplicate receipts', async () => {
    // Test implementation
  });

  it('should enforce rate limits', async () => {
    // Test implementation
  });
});
```

---

## Troubleshooting

### Common Issues

**1. "Email send failed"**
- Check `RESEND_API_KEY` is set correctly
- Verify email domain is verified in Resend dashboard
- Check Resend API logs for specific error

**2. "File not found" when downloading**
- Ensure assets exist in `public/bonus-pack/`
- Check file names match exactly (case-sensitive)
- Verify file permissions (should be readable)

**3. "Token verification failed"**
- Check `NEXTAUTH_SECRET` is set and matches
- Verify token hasn't expired (24 hours)
- Ensure token wasn't modified in transit

**4. "Database error"**
- Check `DATABASE_URL` is correct
- Run `npm run db:push` to sync schema
- Check database connection and credentials

**5. "Rate limit exceeded"**
- Wait for rate limit window to reset
- Check Redis/Upstash configuration
- Adjust limits in `/src/lib/ratelimit.ts` if needed

### Debugging

Enable detailed logging:

```typescript
// In API routes
console.log('[Bonus Claim] Debug:', {
  email,
  orderId,
  fileHash,
  userId,
  claimId,
});
```

Check logs:
```bash
# Vercel
vercel logs

# Local
npm run dev
```

### Support Workflow

When users report issues:

1. **Get claim ID** from email or support request
2. **Check database**:
   ```sql
   SELECT * FROM bonus_claims WHERE id = 'clvxxxxxxxxxxxx';
   SELECT * FROM receipts WHERE id = 'receipt_id_here';
   ```
3. **Verify email delivery** in Resend dashboard
4. **Check file exists** in storage/public directory
5. **Generate new tokens** if needed:
   ```typescript
   const newUrls = generateAllBonusPackUrls(email, claimId, SITE_URL);
   // Send new email manually or via support system
   ```

---

## Production Deployment

### Pre-Launch Checklist

- [ ] Environment variables configured (production values)
- [ ] All 7 bonus pack assets uploaded to `public/bonus-pack/`
- [ ] Database migrated and seeded (if applicable)
- [ ] Email templates tested and rendering correctly
- [ ] Resend domain verified and production API key active
- [ ] S3/R2 bucket created and credentials configured
- [ ] Rate limits configured appropriately
- [ ] Analytics tracking verified
- [ ] Error monitoring setup (Sentry)
- [ ] Legal pages updated (Privacy Policy, Terms)
- [ ] Admin dashboard for claim management (optional)

### Monitoring

**Key Metrics**:
- Claim submission rate
- Email delivery rate
- Download completion rate
- Token expiration rate
- Error rate (4xx, 5xx)
- Average download time

**Alerts**:
- Email delivery failures (> 5%)
- API error rate (> 1%)
- Storage failures
- Rate limit exceeded threshold
- Duplicate receipt attempts (potential fraud)

---

## Future Enhancements

1. **Admin Dashboard**: Manual claim approval, status management
2. **Receipt OCR**: Automated verification using AI/OCR
3. **Retailer API Integration**: Verify orders directly with retailers
4. **Download Analytics**: Track which assets are most popular
5. **Token Renewal**: Allow users to request new links
6. **Multi-language Support**: Translate emails and assets
7. **PDF Watermarking**: Add user email to PDFs for tracking
8. **Usage Limits**: Prevent excessive downloads of same file

---

## References

- CLAUDE.md Section 5: Free Excerpt & Pre-order Bonus
- [Resend API Documentation](https://resend.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**Last Updated**: 2025-10-18
**Maintained By**: AI-Born Development Team
