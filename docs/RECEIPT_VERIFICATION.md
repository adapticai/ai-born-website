# Receipt Verification System

Production-ready receipt verification API with LLM-powered parsing, OCR preprocessing, PII redaction, and fraud detection.

## Features

- **LLM-Powered Parsing**: Uses Claude API to extract receipt information with high accuracy
- **OCR Integration**: Supports AWS Textract for advanced text extraction
- **Triple-Layer PII Redaction**: Regex + LLM + manual review for maximum privacy
- **Fraud Detection**: Automated checks for suspicious receipts
- **Confidence Scoring**: 0-100 verification score for each receipt
- **Background Processing**: Asynchronous job processing (BullMQ-ready)
- **Admin Review Queue**: Manual review interface for edge cases
- **Rate Limiting**: 5 uploads per hour per IP
- **Comprehensive Error Handling**: Graceful degradation and fallbacks

## Architecture

```
Receipt Upload
    ↓
File Validation
    ↓
Queue Processing Job
    ↓
┌─────────────────────┐
│ Background Processor│
├─────────────────────┤
│ 1. OCR Preprocessing│
│ 2. Text Extraction  │
│ 3. PII Redaction    │
│ 4. LLM Parsing      │
│ 5. Fraud Detection  │
│ 6. Status Update    │
│ 7. Email Notification│
└─────────────────────┘
    ↓
Database Update
    ↓
Bonus Pack Delivery (if verified)
```

## Installation

### 1. Install Dependencies

```bash
npm install @anthropic-ai/sdk
```

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Required for receipt parsing
ANTHROPIC_API_KEY=sk-ant-api03-your-api-key-here

# Optional but recommended for OCR
AWS_TEXTRACT_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key

# Receipt processing config
RECEIPT_VERIFICATION_THRESHOLD=0.7
FRAUD_DETECTION_SENSITIVITY=medium
MAX_RECEIPT_FILE_SIZE=10
```

### 3. Run Database Migrations

The receipt verification system uses the existing Prisma schema:

```bash
npm run db:push
```

## API Endpoints

### POST /api/receipts/verify

Check receipt verification status.

**Request:**
```json
{
  "receiptId": "receipt_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "receiptId": "receipt_abc123",
    "status": "VERIFIED",
    "verified": true,
    "retailer": "Amazon",
    "amount": 28.99,
    "currency": "USD",
    "bookTitle": "AI-Born",
    "purchaseDate": "2025-10-15T00:00:00.000Z",
    "format": "hardcover",
    "confidence": 0.95,
    "requiresManualReview": false,
    "verifiedAt": "2025-10-18T12:00:00.000Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request
- `404` - Receipt not found
- `429` - Rate limit exceeded
- `500` - Server error

## Background Processing

### Manual Processing

To manually trigger receipt processing:

```typescript
import { processReceiptVerification } from '@/jobs/receipt-processor';

const result = await processReceiptVerification({
  receiptId: 'receipt_abc123',
  userId: 'user_xyz',
  fileUrl: '/uploads/receipts/receipt.jpg'
});
```

### Queue-Based Processing (Production)

For production, integrate with BullMQ:

```typescript
import { Queue } from 'bullmq';
import { Redis } from '@upstash/redis';

const queue = new Queue('receipt-processing', {
  connection: redis,
});

// Queue a receipt for processing
await queue.add('process-receipt', {
  receiptId: 'receipt_abc123',
  userId: 'user_xyz',
  fileUrl: '/uploads/receipts/receipt.jpg'
}, {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
});
```

## Admin Review Queue

### Fetching Pending Receipts

```typescript
import { prisma } from '@/lib/prisma';
import { ReceiptStatus } from '@prisma/client';

const pendingReceipts = await prisma.receipt.findMany({
  where: {
    status: ReceiptStatus.PENDING,
  },
  include: {
    user: {
      select: { email: true },
    },
    bonusClaim: true,
  },
  orderBy: {
    createdAt: 'asc',
  },
});
```

### Manual Approval

```typescript
import { manuallyApproveReceipt } from '@/jobs/receipt-processor';

await manuallyApproveReceipt(
  'receipt_abc123',
  'admin_user_id',
  'Verified manually - receipt quality poor but valid'
);
```

### Manual Rejection

```typescript
import { manuallyRejectReceipt } from '@/jobs/receipt-processor';

await manuallyRejectReceipt(
  'receipt_abc123',
  'admin_user_id',
  'Book title does not match AI-Born'
);
```

## Receipt Parsing

The LLM-powered parser extracts:

1. **Retailer**: Amazon, Barnes & Noble, Bookshop.org, etc.
2. **Amount**: Purchase total (numeric)
3. **Currency**: USD, GBP, EUR, AUD, etc.
4. **Book Title**: Must match "AI-Born"
5. **Purchase Date**: Date of purchase
6. **Order Number**: Transaction ID
7. **Format**: Hardcover, ebook, or audiobook
8. **PII**: Names, addresses, emails, phone numbers, etc.

### Verification Criteria

Receipts are **auto-verified** if:
- Confidence score ≥ 0.8
- Verification score ≥ 80
- Book title matches "AI-Born"
- Amount within expected range
- No fraud indicators

Receipts are **rejected** if:
- Fraud detected
- Book title mismatch
- Verification score < 60

Receipts require **manual review** if:
- Confidence score < 0.8
- Verification score 60-80
- Missing critical information
- Suspicious patterns detected

## Fraud Detection

The system checks for:

1. **Price Anomalies**
   - Hardcover: $15-$100
   - Ebook: $5-$30
   - Audiobook: $10-$50

2. **Date Validation**
   - Not in the future
   - Not older than 6 months

3. **Book Title Match**
   - Must contain "AI-Born"
   - Fuzzy matching for variations

4. **Retailer Validation**
   - Known book retailers
   - Consistent formatting

5. **Duplicate Detection**
   - SHA-256 file hash
   - Prevents same receipt multiple times

## PII Redaction

Three-layer approach:

### Layer 1: Regex Patterns
- Email addresses
- Phone numbers
- Credit card numbers
- Social Security Numbers
- Street addresses
- ZIP codes
- IP addresses

### Layer 2: LLM Detection
- Context-aware PII identification
- Names, dates of birth
- Account numbers
- Custom PII patterns

### Layer 3: Manual Review
- Human verification of sensitive data
- Final check before storage

## Configuration

### Confidence Thresholds

```typescript
// In receipt-parser.ts
const CONFIDENCE_THRESHOLDS = {
  AUTO_APPROVE: 0.8,    // Auto-verify
  MANUAL_REVIEW: 0.6,   // Requires review
  AUTO_REJECT: 0.5,     // Auto-reject
};
```

### Verification Score Weights

```typescript
// In receipt-parser.ts
const SCORE_WEIGHTS = {
  CONFIDENCE: 40,       // Base LLM confidence
  BOOK_TITLE: 20,       // Title match
  RETAILER: 15,         // Retailer detected
  AMOUNT: 15,           // Valid price
  PURCHASE_DATE: 10,    // Valid date
};
```

## Error Handling

The system gracefully handles:

1. **OCR Failures**: Falls back to placeholder, flags for manual review
2. **LLM Errors**: Marks receipt as pending, requires manual processing
3. **Network Issues**: Retry logic with exponential backoff
4. **Invalid Files**: Clear error messages, validation before processing
5. **Database Errors**: Transaction rollback, maintain data integrity

## Monitoring

Key metrics to track:

- **Auto-verification rate**: Target ≥70%
- **Average processing time**: Target <30 seconds
- **Fraud detection rate**: Monitor false positives
- **Manual review queue size**: Keep below 100
- **LLM API errors**: Track for quota management

## Security Considerations

1. **File Validation**
   - MIME type verification
   - File size limits (10MB)
   - Malware scanning (recommended)

2. **Rate Limiting**
   - 5 uploads per hour per IP
   - Distributed rate limiting with Redis

3. **PII Protection**
   - Triple-layer redaction
   - Encrypted storage
   - Automatic deletion after 90 days

4. **Access Control**
   - Admin authentication required
   - Role-based permissions
   - Audit logging

## Testing

### Unit Tests

```bash
npm run test src/lib/receipt-parser.test.ts
npm run test src/lib/receipt-processor.test.ts
```

### Integration Tests

```bash
npm run test:e2e tests/receipt-verification.test.ts
```

### Manual Testing

```bash
# Upload test receipt
curl -X POST http://localhost:3000/api/bonus-claim \
  -F email=test@example.com \
  -F orderId=AMZ-123456 \
  -F retailer=Amazon \
  -F format=hardcover \
  -F receipt=@test-receipt.jpg

# Check verification status
curl -X POST http://localhost:3000/api/receipts/verify \
  -H "Content-Type: application/json" \
  -d '{"receiptId":"receipt_abc123"}'
```

## Troubleshooting

### OCR Not Working

**Problem**: OCR extraction fails or returns empty text

**Solutions**:
1. Verify AWS Textract credentials
2. Check image quality (minimum 300 DPI)
3. Ensure supported format (JPEG, PNG, WebP, PDF)
4. Review Textract quotas and limits

### LLM Parsing Errors

**Problem**: Claude API returns errors or invalid JSON

**Solutions**:
1. Check ANTHROPIC_API_KEY is valid
2. Verify API quota not exceeded
3. Review prompt template for errors
4. Check network connectivity

### High Manual Review Rate

**Problem**: Too many receipts requiring manual review (>30%)

**Solutions**:
1. Lower confidence threshold (0.7 → 0.6)
2. Improve OCR preprocessing
3. Update LLM prompt with examples
4. Review fraud detection rules

### False Fraud Positives

**Problem**: Valid receipts flagged as fraudulent

**Solutions**:
1. Adjust price ranges for different regions
2. Review fraud detection patterns
3. Update retailer whitelist
4. Tune confidence thresholds

## Future Enhancements

- [ ] Multi-region support (EUR, GBP pricing)
- [ ] Blockchain verification for receipts
- [ ] ML-based fraud detection
- [ ] Real-time retailer API integration
- [ ] Automated email receipt parsing
- [ ] Mobile app with camera capture
- [ ] Bulk receipt upload
- [ ] Advanced analytics dashboard

## Support

For issues or questions:
- Documentation: `/docs/RECEIPT_VERIFICATION.md`
- API Reference: `/docs/api/receipts.md`
- Email: dev@micpress.com
