# VIP Code System — Quick Start Guide

5-minute setup guide to start generating VIP codes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Project dependencies installed (`npm install`)

## Step 1: Generate Admin Token

```bash
# Generate a secure admin token
openssl rand -base64 32
```

Copy the output (e.g., `AbCd1234...`).

## Step 2: Configure Environment

Add to `.env.local`:

```bash
# Admin authentication
ADMIN_API_TOKEN=paste-your-generated-token-here

# Database (if not already configured)
DATABASE_URL=postgresql://postgres:password@localhost:5432/aiborn_dev?schema=public
```

## Step 3: Apply Database Schema

```bash
# Run migration
npx prisma migrate dev --name add_vip_codes

# Generate Prisma client
npx prisma generate
```

## Step 4: Test Code Generation (CLI)

```bash
# Generate 10 test codes
npx tsx scripts/generate-vip-codes.ts --count=10 --type=VIP_PREVIEW

# Generate and export to CSV
npx tsx scripts/generate-vip-codes.ts --count=100 --type=PARTNER --output=test-codes.csv
```

Expected output:
```
═══════════════════════════════════════
  VIP Code Generator
═══════════════════════════════════════

ℹ Configuration:
  Count:            10
  Type:             VIP_PREVIEW
  Max Redemptions:  1
  Created By:       cli-script
  Output Format:    csv

ℹ Generating codes...
✓ Generated 10 codes in 145ms
```

## Step 5: Test Admin API

```bash
# Test code generation via API
curl -X POST http://localhost:3000/api/admin/codes/generate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 5,
    "type": "VIP_PREVIEW",
    "description": "Test batch",
    "maxRedemptions": 1,
    "format": "json"
  }'
```

Expected response:
```json
{
  "success": true,
  "count": 5,
  "codes": [
    {
      "id": "clx...",
      "code": "A2B3C4",
      "type": "VIP_PREVIEW",
      "validFrom": "2025-01-15T10:00:00Z",
      "validUntil": null
    }
  ]
}
```

## Step 6: Access Admin Dashboard

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/admin/codes`

3. Enter your admin token

4. Use the dashboard to:
   - Generate codes
   - View existing codes
   - Export to CSV
   - View statistics

## Production Deployment Checklist

- [ ] Generate secure `ADMIN_API_TOKEN` (different from dev)
- [ ] Add `ADMIN_API_TOKEN` to hosting environment variables
- [ ] Set `DATABASE_URL` to production database
- [ ] Test API endpoints with production URL
- [ ] Verify admin dashboard loads correctly
- [ ] Enable HTTPS for all admin endpoints
- [ ] Set up IP allowlisting (optional, recommended)
- [ ] Configure audit log destination (Sentry, Datadog, etc.)
- [ ] Test rate limiting with production load
- [ ] Document admin credentials in secure location (1Password, Vault, etc.)

## Common Commands

### Generate Preview Codes
```bash
npx tsx scripts/generate-vip-codes.ts --count=1000 --type=VIP_PREVIEW
```

### Generate Partner Codes with Expiration
```bash
npx tsx scripts/generate-vip-codes.ts \
  --count=500 \
  --type=PARTNER \
  --description="Launch week partners" \
  --valid-until="2025-12-31"
```

### Generate Media Codes (Export CSV)
```bash
npx tsx scripts/generate-vip-codes.ts \
  --count=100 \
  --type=MEDIA \
  --output=media-codes-$(date +%Y%m%d).csv
```

### View Code Statistics
```bash
# CLI output includes stats automatically
npx tsx scripts/generate-vip-codes.ts --count=1 --type=VIP_PREVIEW
```

### Export Existing Codes via API
```bash
curl -X GET "http://localhost:3000/api/admin/codes/list?type=VIP_PREVIEW&limit=1000" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  > exported-codes.json
```

## Troubleshooting

### "Database schema not in sync"

```bash
npx prisma migrate reset
npx prisma migrate dev
```

### "Unauthorized: Invalid admin credentials"

Check that `ADMIN_API_TOKEN` in `.env.local` matches your request header.

### "Module not found" errors

```bash
npm install
npx prisma generate
```

## Next Steps

- Read full documentation: `/docs/VIP_CODE_SYSTEM.md`
- Integrate code validation into user flow
- Set up code redemption endpoint
- Configure entitlement delivery
- Implement email distribution system

## Support

For detailed documentation, see: `/docs/VIP_CODE_SYSTEM.md`
