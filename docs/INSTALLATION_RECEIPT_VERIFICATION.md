# Receipt Verification System - Installation Guide

Step-by-step guide to set up the receipt verification system in production.

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Upstash Redis (for rate limiting)
- Anthropic API account
- AWS account (optional, for Textract OCR)

## Step 1: Install Required Dependencies

```bash
npm install @anthropic-ai/sdk
```

## Step 2: Configure Environment Variables

Add these to your `.env` file:

```bash
# ============================================================================
# Receipt Verification & Processing
# ============================================================================

# REQUIRED: Anthropic API for receipt parsing
ANTHROPIC_API_KEY=sk-ant-api03-your-api-key-here

# OPTIONAL: AWS Textract for OCR (recommended for production)
AWS_TEXTRACT_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key

# Receipt processing configuration
RECEIPT_VERIFICATION_THRESHOLD=0.7
FRAUD_DETECTION_SENSITIVITY=medium
MAX_RECEIPT_FILE_SIZE=10
```

### Getting API Keys

#### Anthropic API Key (Required)
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create new API key
5. Copy key (starts with `sk-ant-api03-`)

#### AWS Textract (Optional but Recommended)
1. Log in to AWS Console
2. Go to IAM → Users → Create User
3. Attach policy: `AmazonTextractFullAccess`
4. Create access keys
5. Save Access Key ID and Secret Access Key
6. Choose region (recommend `us-east-1`)

**Cost**: AWS Textract charges ~$1.50 per 1,000 pages. For receipts, budget approximately:
- 100 receipts/day = ~$5/month
- 1,000 receipts/day = ~$50/month

#### Alternative: Google Cloud Vision API
If you prefer Google Cloud Vision over AWS Textract:

```bash
# In .env file
GOOGLE_CLOUD_VISION_API_KEY=your-google-vision-api-key
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

## Step 3: Database Setup

The receipt verification system uses the existing Prisma schema. No additional migrations needed.

```bash
# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

## Step 4: File Storage Configuration

Configure file storage for receipt uploads:

### Option A: Local Storage (Development)

No configuration needed. Files stored in `/public/uploads/receipts/`

### Option B: Cloudflare R2 (Recommended for Production)

```bash
# In .env file
R2_BUCKET=your-r2-bucket-name
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_PUBLIC_URL=https://your-custom-domain.com
```

### Option C: AWS S3

```bash
# In .env file
AWS_S3_BUCKET=your-s3-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
S3_PUBLIC_URL=https://your-s3-bucket.s3.amazonaws.com
```

## Step 5: Test the System

### Test Receipt Upload

```bash
# Start development server
npm run dev

# Upload test receipt (use Postman or curl)
curl -X POST http://localhost:3000/api/bonus-claim \
  -F "email=test@example.com" \
  -F "orderId=TEST-12345" \
  -F "retailer=Amazon" \
  -F "format=hardcover" \
  -F "receipt=@test-receipt.jpg"
```

### Test Receipt Verification

```bash
curl -X POST http://localhost:3000/api/receipts/verify \
  -H "Content-Type: application/json" \
  -d '{"receiptId":"receipt_abc123"}'
```

## Step 6: Production Deployment

### Vercel Deployment

1. Add environment variables to Vercel:
   ```bash
   vercel env add ANTHROPIC_API_KEY
   vercel env add AWS_TEXTRACT_REGION
   vercel env add AWS_ACCESS_KEY_ID
   vercel env add AWS_SECRET_ACCESS_KEY
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

### Environment-Specific Configuration

**Development** (`.env.local`):
```bash
ANTHROPIC_API_KEY=sk-ant-api03-dev-key
AWS_TEXTRACT_REGION=us-east-1
RECEIPT_VERIFICATION_THRESHOLD=0.5  # Lower threshold for testing
```

**Staging** (Vercel staging environment):
```bash
ANTHROPIC_API_KEY=sk-ant-api03-staging-key
RECEIPT_VERIFICATION_THRESHOLD=0.6
FRAUD_DETECTION_SENSITIVITY=low  # Less strict for QA
```

**Production** (Vercel production environment):
```bash
ANTHROPIC_API_KEY=sk-ant-api03-prod-key
RECEIPT_VERIFICATION_THRESHOLD=0.7
FRAUD_DETECTION_SENSITIVITY=medium
```

## Step 7: Background Job Processing (Optional)

For high-volume production use, integrate BullMQ for job queuing:

### Install BullMQ

```bash
npm install bullmq
```

### Configure Worker

Create `workers/receipt-processor.worker.ts`:

```typescript
import { Worker } from 'bullmq';
import { Redis } from '@upstash/redis';
import { processReceiptVerification } from '@/jobs/receipt-processor';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const worker = new Worker(
  'receipt-processing',
  async (job) => {
    const result = await processReceiptVerification(job.data);
    return result;
  },
  {
    connection: redis,
    concurrency: 5, // Process 5 receipts concurrently
  }
);

worker.on('completed', (job) => {
  console.log(`Receipt ${job.id} processed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Receipt ${job.id} failed:`, err);
});
```

### Deploy Worker

Add to `package.json`:

```json
{
  "scripts": {
    "worker:receipts": "tsx workers/receipt-processor.worker.ts"
  }
}
```

Deploy worker to separate instance or use Vercel Edge Functions.

## Step 8: Monitoring & Alerts

### Configure Sentry (Already integrated)

Receipt verification errors are automatically sent to Sentry.

### Custom Monitoring

Create admin dashboard to monitor:

```typescript
// pages/admin/receipts/dashboard.tsx
import { prisma } from '@/lib/prisma';
import { ReceiptStatus } from '@prisma/client';

export async function getReceiptStats() {
  const stats = await prisma.receipt.groupBy({
    by: ['status'],
    _count: true,
  });

  const pending = stats.find(s => s.status === ReceiptStatus.PENDING)?._count || 0;
  const verified = stats.find(s => s.status === ReceiptStatus.VERIFIED)?._count || 0;
  const rejected = stats.find(s => s.status === ReceiptStatus.REJECTED)?._count || 0;

  return { pending, verified, rejected };
}
```

### Set Up Alerts

Configure alerts for:
- Manual review queue > 100 receipts
- Auto-verification rate < 60%
- Processing errors > 5%
- LLM API quota warnings

## Step 9: Security Hardening

### Enable Malware Scanning (Recommended)

Integrate with ClamAV or cloud scanning service:

```bash
npm install clamscan
```

```typescript
// In file-utils.ts
import NodeClam from 'clamscan';

const ClamScan = await new NodeClam().init({
  clamdscan: {
    host: process.env.CLAMAV_HOST || 'localhost',
    port: process.env.CLAMAV_PORT || 3310,
  },
});

export async function scanFile(buffer: Buffer): Promise<boolean> {
  const { isInfected } = await ClamScan.scanBuffer(buffer);
  return !isInfected;
}
```

### Configure CORS (If needed)

```typescript
// In route.ts
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': 'https://ai-born.org',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

## Step 10: Performance Optimization

### Enable CDN for Receipt Storage

Configure Cloudflare CDN in front of R2:

1. Create R2 bucket
2. Set up custom domain
3. Enable Cloudflare CDN
4. Configure cache rules

### Optimize OCR Processing

Use image preprocessing to improve OCR accuracy:

```bash
npm install sharp
```

```typescript
// In receipt-processor.ts
import sharp from 'sharp';

const optimizedBuffer = await sharp(imageBuffer)
  .grayscale()
  .normalize()
  .sharpen()
  .resize(1600, null, { withoutEnlargement: true })
  .toBuffer();
```

## Verification Checklist

Before going live:

- [ ] Anthropic API key configured and tested
- [ ] AWS Textract credentials verified (or Google Vision)
- [ ] Database migrations run
- [ ] File storage configured (R2 or S3)
- [ ] Rate limiting enabled (Upstash Redis)
- [ ] Environment variables set in production
- [ ] Sentry error tracking enabled
- [ ] Test receipt upload works end-to-end
- [ ] Test receipt verification API
- [ ] Admin review queue accessible
- [ ] Monitoring dashboard deployed
- [ ] Alerts configured
- [ ] Security hardening complete
- [ ] Documentation reviewed

## Cost Estimates

### Monthly Costs (Based on 1,000 receipts/month)

| Service | Cost | Notes |
|---------|------|-------|
| Anthropic API | $15-30 | ~$0.015-0.03 per receipt |
| AWS Textract | $1.50 | ~$0.0015 per receipt |
| Upstash Redis | $0 | Free tier sufficient |
| Cloudflare R2 | $0.15 | 10GB storage |
| **Total** | **$17-32** | |

### At Scale (10,000 receipts/month)

| Service | Cost | Notes |
|---------|------|-------|
| Anthropic API | $150-300 | Volume discounts available |
| AWS Textract | $15 | |
| Upstash Redis | $10 | Upgraded plan |
| Cloudflare R2 | $1.50 | 100GB storage |
| **Total** | **$177-327** | |

## Troubleshooting

### Common Issues

**Issue**: "ANTHROPIC_API_KEY not configured"
- **Solution**: Add API key to `.env` file and restart server

**Issue**: OCR returns empty text
- **Solution**: Check image quality, ensure AWS credentials correct

**Issue**: High manual review rate (>50%)
- **Solution**: Lower confidence threshold, improve image preprocessing

**Issue**: Rate limit errors
- **Solution**: Configure Upstash Redis, verify connection

**Issue**: File upload fails
- **Solution**: Check file size limit, verify storage configuration

## Support

Need help? Contact:
- Technical Support: dev@micpress.com
- Documentation: `/docs/RECEIPT_VERIFICATION.md`
- GitHub Issues: (if open source)
