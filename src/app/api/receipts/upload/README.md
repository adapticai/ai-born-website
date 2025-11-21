# Receipt Upload API

Production-ready receipt upload handler with comprehensive security and validation.

## Endpoint

```
POST /api/receipts/upload
```

## Authentication

Requires authentication via NextAuth session. User must be logged in.

## Request

**Content-Type:** `multipart/form-data`

**Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | Receipt image or PDF (max 10MB) |
| `retailer` | string | Yes | Retailer name (e.g., "amazon", "barnes-noble") |
| `orderNumber` | string | No | Order/transaction number |
| `format` | string | No | Book format: "hardcover", "ebook", or "audiobook" |
| `purchaseDate` | string | No | Purchase date (ISO 8601 format) |

## Response

**Success (201):**

```json
{
  "success": true,
  "message": "Receipt uploaded successfully! We will verify it within 24 hours.",
  "data": {
    "receiptId": "cm1abc123xyz",
    "status": "PENDING",
    "fileUrl": "https://your-bucket.r2.dev/receipts/receipt-123456789-abc123.jpg"
  }
}
```

**Error Responses:**

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | `MISSING_FILE` | Receipt file not provided |
| 400 | `MISSING_RETAILER` | Retailer not specified |
| 400 | `INVALID_FILE` | File validation failed (type, size, or content) |
| 400 | `INVALID_FORMAT` | Invalid book format |
| 400 | `SECURITY_SCAN_FAILED` | File failed virus scan |
| 401 | `UNAUTHORIZED` | User not authenticated |
| 409 | `DUPLICATE_RECEIPT` | Receipt already uploaded |
| 409 | `DUPLICATE_RECEIPT_SAME_USER` | User already uploaded this receipt |
| 413 | File too large | File exceeds 10MB limit |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many uploads (5 per hour) |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error |

## Security Features

### 1. File Validation

- **MIME type verification:** Checks actual file content, not just extension
- **Allowed types:** JPEG, PNG, PDF only
- **Size limits:** Maximum 10MB
- **Magic byte validation:** Prevents extension spoofing

### 2. Virus Scanning

- Basic executable signature detection (placeholder for ClamAV/VirusTotal)
- Suspicious file pattern detection
- Header validation

### 3. Duplicate Detection

- SHA-256 file hash calculation
- Database lookup to prevent duplicate claims
- Per-user duplicate checking

### 4. Rate Limiting

- **Limit:** 5 uploads per hour per user/IP combination
- **Implementation:** Upstash Redis with fallback to in-memory
- **Headers:** Returns `X-RateLimit-*` headers

### 5. Access Control

- Requires NextAuth authentication
- User session validation
- IP address logging for audit trail

## Storage Options

### Production: Cloudflare R2 (Recommended)

```bash
# .env
R2_BUCKET=ai-born-receipts
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_PUBLIC_URL=https://receipts.ai-born.org
```

**Advantages:**
- Zero egress fees
- S3-compatible API
- Free tier: 10GB storage, 10M reads/month
- Automatic public URL support

### Alternative: AWS S3

```bash
# .env
AWS_S3_BUCKET=ai-born-receipts
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_PUBLIC_URL=https://ai-born-receipts.s3.us-east-1.amazonaws.com
```

### Development: Local Storage

If no cloud storage is configured, files are stored locally in:
```
public/uploads/receipts/
```

⚠️ **Note:** Local storage is for development only. Not suitable for production.

## Database Schema

Receipt records are stored in PostgreSQL via Prisma:

```prisma
model Receipt {
  id              String         @id @default(cuid())
  userId          String
  retailer        String
  orderNumber     String?
  format          String?        // "hardcover", "ebook", "audiobook"
  purchaseDate    DateTime?
  status          ReceiptStatus  @default(PENDING)
  verifiedAt      DateTime?
  verifiedBy      String?
  rejectionReason String?
  fileUrl         String
  fileHash        String         @unique
  ipAddress       String?
  userAgent       String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  user            User           @relation(fields: [userId], references: [id])
  bonusClaim      BonusClaim?
}
```

## Workflow

1. **Upload:** User submits receipt via form
2. **Validation:** File type, size, and content validated
3. **Virus Scan:** Basic malware detection
4. **Duplicate Check:** Hash-based duplicate detection
5. **Storage:** Upload to R2/S3 (or local for dev)
6. **Database:** Create Receipt record with PENDING status
7. **Queue:** Trigger background verification job (TODO)
8. **Notification:** Send confirmation email (TODO)

## Background Processing (TODO)

Implement with BullMQ or similar:

```typescript
// Queue receipt for verification
await receiptQueue.add('verify-receipt', {
  receiptId: receipt.id,
  fileUrl,
  retailer: receipt.retailer,
  userId: user.id,
});
```

## Analytics Events

The following events are tracked:

- `bonus_claim_file_select`: User selects file
- `bonus_claim_submit`: Upload attempt (success/failure)
- `form_error`: Validation or upload errors

## Usage Example

### Client-Side (React)

```typescript
import { ReceiptUploadForm } from '@/components/forms/ReceiptUploadForm';

function BonusClaimPage() {
  return (
    <ReceiptUploadForm
      onSuccess={(receiptId) => {
        console.log('Receipt uploaded:', receiptId);
        // Redirect or show success message
      }}
      onError={(error) => {
        console.error('Upload failed:', error);
      }}
    />
  );
}
```

### Direct API Call

```typescript
const formData = new FormData();
formData.append('file', receiptFile);
formData.append('retailer', 'amazon');
formData.append('orderNumber', '123-4567890-1234567');
formData.append('format', 'hardcover');

const response = await fetch('/api/receipts/upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
```

## Testing

### Manual Testing

1. Start development server: `npm run dev`
2. Navigate to bonus claim form
3. Upload test receipt (JPEG, PNG, or PDF)
4. Verify receipt appears in database
5. Check file in storage (R2/S3 or local)

### Test Files

Use these test cases:

- **Valid:** JPEG/PNG image or PDF under 10MB
- **Invalid type:** .exe, .zip, or other file types
- **Too large:** File over 10MB
- **Duplicate:** Upload same file twice
- **Malicious:** File with executable headers

### Rate Limit Testing

```bash
# Upload 6 times in quick succession
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/receipts/upload \
    -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
    -F "file=@receipt.jpg" \
    -F "retailer=amazon"
done
```

## Monitoring

### Logs

All uploads are logged with:
- Receipt ID
- User ID and email
- Retailer and order number
- File URL and hash
- Upload status

### Metrics to Track

- Upload success rate
- Average upload duration
- Storage usage
- Duplicate detection rate
- Virus scan failures
- Rate limit hits

## Production Checklist

- [ ] Configure R2 or S3 bucket with proper CORS
- [ ] Set up public URL or CloudFront distribution
- [ ] Enable virus scanning (ClamAV or cloud service)
- [ ] Configure rate limiting with Upstash Redis
- [ ] Implement background processing queue
- [ ] Set up monitoring and alerts
- [ ] Add admin dashboard for manual verification
- [ ] Implement automated verification (OCR or retailer API)
- [ ] Configure email notifications
- [ ] Set up backup and disaster recovery

## Future Enhancements

1. **OCR Integration:** Extract order details from receipt images
2. **Retailer API Verification:** Auto-verify purchases via retailer APIs
3. **Image Optimization:** Compress images to reduce storage costs
4. **Metadata Stripping:** Remove EXIF data for privacy
5. **Multi-file Upload:** Support multiple receipt images
6. **Admin Dashboard:** Manual review interface
7. **Fraud Detection:** ML-based fraud detection
8. **Webhook Notifications:** Real-time verification updates

## Troubleshooting

### "Storage configuration not found"

Ensure you've set either R2 or S3 environment variables in `.env`:

```bash
# Cloudflare R2
R2_BUCKET=your-bucket
R2_ACCESS_KEY_ID=your-key
R2_SECRET_ACCESS_KEY=your-secret

# OR AWS S3
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

### "Failed to upload file to storage"

Check:
1. Bucket exists and is accessible
2. Access keys have write permissions
3. Bucket CORS allows uploads
4. Network connectivity to storage endpoint

### Rate limit errors

- Wait for rate limit window to reset (1 hour)
- Check Upstash Redis connection
- Verify UPSTASH_REDIS_REST_URL is set

### Duplicate detection false positives

If legitimate different receipts are flagged as duplicates:
- Check file hash calculation
- Verify database uniqueness constraint
- Review duplicate detection logic

## Support

For issues or questions:
- Check logs: `npm run dev` (development)
- Review Prisma Studio: `npm run db:studio`
- Contact: engineering@micpress.com
