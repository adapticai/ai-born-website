# Receipt Upload Integration Guide

This guide shows how to integrate the new receipt upload system into your existing bonus claim flow.

## Current vs. New Architecture

### Current Implementation
- Location: `/src/components/forms/BonusClaimForm.tsx`
- API: `/src/app/api/bonus-claim/route.ts`
- Storage: Local filesystem (`public/uploads/receipts/`)
- Features: Basic file upload, form validation

### New Implementation
- Component: `/src/components/forms/ReceiptUploadForm.tsx`
- API: `/src/app/api/receipts/upload/route.ts`
- Storage: Cloudflare R2 or AWS S3 (with local fallback)
- Features: Enhanced security, drag-and-drop, duplicate detection, virus scanning

## Integration Approaches

### Approach 1: Replace Entire Form (Recommended)

Replace the existing `BonusClaimForm` with the new `ReceiptUploadForm`.

**Advantages:**
- Better UX with drag-and-drop
- Enhanced security features
- Cloud storage for scalability
- Duplicate detection
- Better error handling

**Steps:**

1. Update the bonus claim section component:

```typescript
// Before (in your bonus claim section/page)
import { BonusClaimForm } from '@/components/forms/BonusClaimForm';

export function BonusClaimSection() {
  return (
    <section>
      <h2>Claim Your Agent Charter Pack</h2>
      <BonusClaimForm onSuccess={() => {
        // Handle success
      }} />
    </section>
  );
}

// After
import { ReceiptUploadForm } from '@/components/forms/ReceiptUploadForm';

export function BonusClaimSection() {
  return (
    <section>
      <h2>Claim Your Agent Charter Pack</h2>
      <ReceiptUploadForm
        onSuccess={(receiptId) => {
          console.log('Receipt uploaded:', receiptId);
          // Show success message or redirect
        }}
        onError={(error) => {
          console.error('Upload failed:', error);
          // Show error message
        }}
      />
    </section>
  );
}
```

2. **Optional:** Keep the old form as backup or for specific use cases:

```typescript
// Rename old component
mv src/components/forms/BonusClaimForm.tsx src/components/forms/BonusClaimFormLegacy.tsx
```

### Approach 2: Hybrid (Use New Upload, Keep Old Form)

Keep the existing form UI but replace just the file upload logic.

**Advantages:**
- Minimal changes to existing code
- Keep existing styling and layout
- Use new upload infrastructure

**Steps:**

1. Update the file upload section in `BonusClaimForm.tsx`:

```typescript
// Add import at top
import { validateReceiptFile, uploadToStorage, generateSecureFilename } from '@/lib/upload';
import { calculateFileHash } from '@/lib/upload';

// In the onSubmit function, replace the file handling:

const onSubmit = async (data: BonusClaimFormData) => {
  try {
    // ... existing code ...

    if (!data.receipt) {
      setErrorMessage('Please upload a receipt file');
      return;
    }

    // NEW: Use enhanced validation
    const fileBuffer = Buffer.from(await data.receipt.arrayBuffer());
    const validation = await validateReceiptFile(
      fileBuffer,
      data.receipt.type,
      data.receipt.size
    );

    if (!validation.valid) {
      setErrorMessage(validation.error || 'File validation failed');
      return;
    }

    // NEW: Upload to cloud storage instead of local
    const filename = generateSecureFilename(
      data.receipt.name,
      validation.mimeType!,
      'user-id' // Replace with actual user ID from session
    );

    const fileUrl = await uploadToStorage(fileBuffer, filename, {
      folder: 'receipts',
      contentType: validation.mimeType,
    });

    // NEW: Calculate hash for duplicate detection
    const fileHash = validation.hash || calculateFileHash(fileBuffer);

    // Continue with existing form submission...
    // Pass fileUrl and fileHash to your API
  } catch (error) {
    // ... existing error handling ...
  }
};
```

2. Update API endpoint to accept new fields:

```typescript
// In /src/app/api/bonus-claim/route.ts
// Add fileHash parameter and duplicate check
```

### Approach 3: Two-Step Flow (Email Then Receipt)

Keep both forms and use them in sequence.

**Advantages:**
- Collect email first (lead capture)
- Upload receipt as second step
- Better conversion tracking

**Implementation:**

```typescript
'use client';

import { useState } from 'react';
import { EmailCaptureForm } from '@/components/forms/EmailCaptureForm';
import { ReceiptUploadForm } from '@/components/forms/ReceiptUploadForm';

export function BonusClaimFlow() {
  const [step, setStep] = useState<'email' | 'receipt' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [receiptId, setReceiptId] = useState('');

  if (step === 'success') {
    return (
      <div className="text-center">
        <h2>Success!</h2>
        <p>Your Agent Charter Pack will arrive at {email} within 24 hours.</p>
        <p className="text-sm text-gray-500">Receipt ID: {receiptId}</p>
      </div>
    );
  }

  if (step === 'receipt') {
    return (
      <div>
        <h2>Upload Your Receipt</h2>
        <p className="text-sm mb-4">
          Almost done! Upload your proof of purchase to claim your bonus.
        </p>
        <ReceiptUploadForm
          onSuccess={(id) => {
            setReceiptId(id);
            setStep('success');
          }}
          onError={(error) => {
            console.error('Upload failed:', error);
          }}
        />
        <button
          onClick={() => setStep('email')}
          className="mt-4 text-sm text-gray-500 underline"
        >
          Back to email
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>Get Your Free Agent Charter Pack</h2>
      <EmailCaptureForm
        onSuccess={(capturedEmail) => {
          setEmail(capturedEmail);
          setStep('receipt');
        }}
      />
    </div>
  );
}
```

## Migration Checklist

### Pre-Migration
- [ ] Review existing `BonusClaimForm` implementation
- [ ] Decide on integration approach
- [ ] Set up S3 or R2 bucket
- [ ] Configure environment variables
- [ ] Test new upload system in development

### Migration
- [ ] Update imports in bonus claim pages/sections
- [ ] Replace or integrate upload component
- [ ] Update API calls if needed
- [ ] Test file uploads end-to-end
- [ ] Verify database records created
- [ ] Check cloud storage files

### Post-Migration
- [ ] Monitor upload success rates
- [ ] Check error logs
- [ ] Verify analytics events
- [ ] Test rate limiting
- [ ] Validate duplicate detection
- [ ] Confirm email notifications (if implemented)

## Code Comparison

### Old Approach (Current)

```typescript
// Simple file input
<Input
  type="file"
  accept="image/*,application/pdf"
  onChange={handleFileChange}
/>

// Basic API call
const response = await submitBonusClaim(
  email,
  orderId,
  receipt,
  retailer
);

// Local file storage
const uploadDir = '/uploads/receipts';
await saveFile(fileBuffer, uniqueFilename, uploadDir);
```

### New Approach (Enhanced)

```typescript
// Drag-and-drop with preview
<ReceiptUploadForm
  onSuccess={(receiptId) => {
    // Handle success
  }}
  onError={(error) => {
    // Handle error
  }}
/>

// Enhanced API with validation
const validation = await validateReceiptFile(
  fileBuffer,
  file.type,
  file.size
);

const fileUrl = await uploadToStorage(fileBuffer, filename, {
  folder: 'receipts',
  contentType: validation.mimeType,
});

// Cloud storage (R2/S3)
// Automatic duplicate detection
// Virus scanning
// Rate limiting
```

## Environment Variables

Update `.env` with storage configuration:

```bash
# Cloudflare R2 (Recommended)
R2_BUCKET=ai-born-receipts
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_PUBLIC_URL=https://receipts.ai-born.org

# Or AWS S3
# AWS_S3_BUCKET=ai-born-receipts
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
```

## Testing After Integration

1. **Upload a valid receipt:**
```bash
curl -X POST http://localhost:3000/api/receipts/upload \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -F "file=@receipt.jpg" \
  -F "retailer=amazon"
```

2. **Verify database record:**
```bash
npm run db:studio
# Navigate to Receipt table
```

3. **Check cloud storage:**
- R2: Check Cloudflare dashboard
- S3: Check AWS console

4. **Test duplicate detection:**
- Upload same file twice
- Should receive 409 Conflict error

5. **Test rate limiting:**
- Upload 6 files quickly
- 6th should receive 429 error

## Rollback Plan

If issues occur, you can quickly rollback:

1. **Revert to old form:**
```bash
git checkout HEAD -- src/components/forms/BonusClaimForm.tsx
```

2. **Switch back in component:**
```typescript
// Change import back
import { BonusClaimForm } from '@/components/forms/BonusClaimFormLegacy';
```

3. **Remove new API route (optional):**
```bash
rm -rf src/app/api/receipts
```

## Performance Considerations

### Before (Local Storage)
- ❌ Files stored on server filesystem
- ❌ No CDN acceleration
- ❌ Scaling requires disk space
- ❌ No redundancy

### After (Cloud Storage)
- ✅ Files on R2/S3
- ✅ CDN-accelerated delivery
- ✅ Infinite scalability
- ✅ Built-in redundancy
- ✅ Global availability

## Cost Comparison

### Cloudflare R2 (Recommended)
- **Free tier:** 10GB storage, 10M reads/month, 1M writes/month
- **Zero egress fees** (no bandwidth charges)
- **Pricing beyond free tier:** $0.015/GB storage, $0.36/million writes

### AWS S3
- **Free tier:** 5GB storage, 20,000 GET requests (first year only)
- **Egress fees:** $0.09/GB after 100GB/month
- **Pricing:** $0.023/GB storage, $0.005/1000 PUT requests

**Recommendation:** Use Cloudflare R2 for zero egress fees.

## Support

### Documentation
- **API Docs:** `/src/app/api/receipts/upload/README.md`
- **Implementation Guide:** `/RECEIPT_UPLOAD_IMPLEMENTATION.md`
- **Summary:** `/RECEIPT_UPLOAD_SUMMARY.md`

### Troubleshooting
- Check logs: `npm run dev`
- Database: `npm run db:studio`
- Storage: Check R2/S3 dashboard

### Contact
- Email: engineering@micpress.com
- Issues: Create GitHub issue

---

## Quick Start (TL;DR)

1. **Install dependency (already done):**
```bash
npm install @aws-sdk/client-s3
```

2. **Configure storage in `.env`:**
```bash
R2_BUCKET=your-bucket
R2_ACCESS_KEY_ID=your-key
R2_SECRET_ACCESS_KEY=your-secret
R2_PUBLIC_URL=https://your-domain.com
```

3. **Replace form component:**
```typescript
import { ReceiptUploadForm } from '@/components/forms/ReceiptUploadForm';
// Use instead of BonusClaimForm
```

4. **Deploy:**
```bash
git add .
git commit -m "Integrate enhanced receipt upload"
git push
```

Done! Your receipt upload system is now production-ready with cloud storage, security features, and better UX.
