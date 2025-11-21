# VIP Code Generation & Management System

Complete documentation for the VIP code system for AI-Born book launch.

## Overview

The VIP code system allows administrators to generate, distribute, and track unique access codes for:

- **VIP_PREVIEW** — Early access to book excerpt
- **VIP_BONUS** — Enhanced bonus pack
- **VIP_LAUNCH** — Launch event access
- **PARTNER** — Partner organization codes
- **MEDIA** — Media/press access
- **INFLUENCER** — Creator/influencer codes

## Architecture

### Components

1. **Database Schema** (`/prisma/schema.prisma`)
   - `Code` model with status tracking
   - `Entitlement` model for user benefits
   - Audit trail with creation tracking

2. **Code Generator** (`/src/lib/code-generator.ts`)
   - Generates unique 6-character alphanumeric codes
   - Excludes confusing characters (0/O, 1/I/l)
   - Batch generation with collision detection
   - CSV export functionality
   - Statistics aggregation

3. **Admin Authentication** (`/src/lib/admin-auth.ts`)
   - Token-based authentication
   - Rate limiting (100 requests/minute)
   - Audit logging
   - IP tracking

4. **Admin API** (`/src/app/api/admin/codes/`)
   - `POST /api/admin/codes/generate` — Generate codes
   - `GET /api/admin/codes/list` — List codes with filtering

5. **Admin Dashboard** (`/src/app/admin/codes/page.tsx`)
   - Web-based code management
   - Generation interface
   - Filtering and search
   - Statistics dashboard
   - CSV export

6. **CLI Tool** (`/scripts/generate-vip-codes.ts`)
   - Batch code generation
   - Command-line interface
   - CSV export

## Setup

### 1. Environment Variables

Add to `.env`:

```bash
# Admin API Token (generate with: openssl rand -base64 32)
ADMIN_API_TOKEN=your-secure-token-here

# Optional: Comma-separated admin emails
ADMIN_EMAILS=admin@example.com,admin2@example.com

# Database connection
DATABASE_URL=postgresql://user:password@localhost:5432/ai-born
```

### 2. Database Migration

```bash
# Apply schema
npx prisma migrate dev --name add_vip_codes

# Generate Prisma client
npx prisma generate
```

### 3. Install Dependencies

```bash
npm install
```

## Usage

### CLI Tool

#### Generate Codes

```bash
# Generate 1000 VIP preview codes
npx tsx scripts/generate-vip-codes.ts --count=1000 --type=VIP_PREVIEW

# Generate partner codes with expiration
npx tsx scripts/generate-vip-codes.ts \
  --count=500 \
  --type=PARTNER \
  --description="Launch partners" \
  --valid-until="2025-12-31"

# Generate and export to CSV
npx tsx scripts/generate-vip-codes.ts \
  --count=100 \
  --type=MEDIA \
  --output=media-codes.csv

# Generate multi-use codes
npx tsx scripts/generate-vip-codes.ts \
  --count=50 \
  --type=INFLUENCER \
  --description="YouTube creators" \
  --max-redemptions=10
```

#### CLI Options

- `--count` — Number of codes (required, 1-10000)
- `--type` — Code type (required)
- `--description` — Optional description
- `--max-redemptions` — Max uses per code (default: 1)
- `--valid-until` — Expiration date (ISO: YYYY-MM-DD)
- `--org-id` — Organization ID
- `--created-by` — Admin identifier
- `--output` — Output file path
- `--format` — Output format (json|csv)
- `--help` — Show help

### Admin API

#### Generate Codes (POST)

```bash
curl -X POST https://ai-born.org/api/admin/codes/generate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 100,
    "type": "VIP_PREVIEW",
    "description": "Launch week VIPs",
    "maxRedemptions": 1,
    "validUntil": "2025-12-31T23:59:59Z",
    "format": "json"
  }'
```

Response:
```json
{
  "success": true,
  "count": 100,
  "codes": [
    {
      "id": "clx...",
      "code": "A2B3C4",
      "type": "VIP_PREVIEW",
      "validFrom": "2025-01-01T00:00:00Z",
      "validUntil": "2025-12-31T23:59:59Z"
    }
  ]
}
```

#### Export to CSV

```bash
curl -X POST https://ai-born.org/api/admin/codes/generate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 100,
    "type": "PARTNER",
    "format": "csv"
  }' \
  --output partner-codes.csv
```

#### List Codes (GET)

```bash
curl -X GET "https://ai-born.org/api/admin/codes/list?page=1&limit=50&type=VIP_PREVIEW&includeStats=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Query Parameters:
- `page` — Page number (default: 1)
- `limit` — Results per page (max: 1000, default: 50)
- `type` — Filter by code type
- `status` — Filter by status (ACTIVE, REDEEMED, EXPIRED, REVOKED)
- `search` — Search by code
- `orgId` — Filter by organization
- `includeStats` — Include statistics (true/false)

Response:
```json
{
  "success": true,
  "data": {
    "codes": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1000,
      "totalPages": 20
    },
    "stats": {
      "totalCodes": 1000,
      "activeCount": 950,
      "redeemedCount": 50,
      "expiredCount": 0,
      "revokedCount": 0,
      "totalRedemptions": 50,
      "redemptionRate": 5.0
    }
  }
}
```

### Admin Dashboard

1. Navigate to: `https://ai-born.org/admin/codes`
2. Enter your admin API token
3. Use the web interface to:
   - Generate new codes
   - View existing codes
   - Filter and search
   - Export to CSV
   - View statistics

## Code Format

### Structure

- **Length:** 6 characters
- **Character set:** `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (31 chars)
- **Excluded:** 0, O, 1, I, l (prevents confusion)
- **Example:** `A2B3C4`, `XYZ789`, `PQR234`

### Display Formatting

```typescript
// Raw: ABC123
formatCode('ABC123', false)  // "ABC123"
formatCode('ABC123', true)   // "ABC-123"
```

## Code Validation

### Validation Flow

1. Normalize input (remove spaces, hyphens, uppercase)
2. Check if code exists
3. Verify status (not REVOKED or EXPIRED)
4. Check validity period (validFrom ≤ now ≤ validUntil)
5. Check redemption limit (redemptionCount < maxRedemptions)

### Example

```typescript
import { validateCode, redeemCode } from '@/lib/code-generator';

const result = await validateCode('ABC-123');

if (result.valid) {
  // Code is valid, redeem it
  await redeemCode(result.code.id);

  // Grant entitlement to user
  // ...
} else {
  console.error(result.error);
}
```

## Statistics

### Available Metrics

- **Total Codes** — All codes in system
- **Active Count** — Currently active codes
- **Redeemed Count** — Fully redeemed codes
- **Expired Count** — Expired codes
- **Revoked Count** — Revoked codes
- **Total Redemptions** — Sum of all redemptions
- **Redemption Rate** — (redemptions / total codes) × 100

### Fetch Statistics

```typescript
import { getCodeStatistics } from '@/lib/code-generator';

// All codes
const allStats = await getCodeStatistics();

// Specific type
const vipStats = await getCodeStatistics('VIP_PREVIEW');
```

## Security

### Authentication

- Token-based admin authentication
- Store `ADMIN_API_TOKEN` securely (never commit to git)
- Rotate tokens regularly

### Rate Limiting

- 100 requests per minute per admin
- Applies to all admin endpoints
- Returns 429 status when exceeded

### Audit Logging

All admin actions are logged with:
- Timestamp
- Admin identifier
- Action type
- Resource details
- IP address
- User agent

Example log:
```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "adminId": "admin@example.com",
  "action": "GENERATE_CODES",
  "resource": "codes",
  "details": {
    "count": 1000,
    "type": "VIP_PREVIEW"
  },
  "ipAddress": "203.0.113.42",
  "userAgent": "Mozilla/5.0..."
}
```

### Best Practices

1. **Never expose codes publicly** — Distribute through secure channels
2. **Use single-use codes** — Set `maxRedemptions: 1` for most use cases
3. **Set expiration dates** — Prevent indefinite validity
4. **Monitor redemptions** — Track usage patterns
5. **Rotate admin tokens** — Change tokens quarterly
6. **Review audit logs** — Check for suspicious activity

## Database Schema

### Code Model

```prisma
model Code {
  id              String       @id @default(cuid())
  code            String       @unique
  type            CodeType     // VIP_PREVIEW, VIP_BONUS, etc.
  status          CodeStatus   // ACTIVE, REDEEMED, EXPIRED, REVOKED

  description     String?
  maxRedemptions  Int?         // null = unlimited
  redemptionCount Int          @default(0)

  validFrom       DateTime     @default(now())
  validUntil      DateTime?

  createdBy       String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  entitlements    Entitlement[]
  orgId           String?
  org             Org?         @relation(fields: [orgId], references: [id])
}
```

### Entitlement Model

```prisma
model Entitlement {
  id          String             @id @default(cuid())
  userId      String
  codeId      String?
  type        EntitlementType    // EARLY_EXCERPT, BONUS_PACK, etc.
  status      EntitlementStatus  // PENDING, ACTIVE, FULFILLED, etc.

  fulfilledAt DateTime?
  expiresAt   DateTime?
  metadata    Json?

  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  user        User               @relation(fields: [userId], references: [id])
  code        Code?              @relation(fields: [codeId], references: [id])
}
```

## Troubleshooting

### Code Generation Fails

**Error:** "Failed to generate unique code after 10 attempts"

**Solution:** Database may be saturated. This occurs when too many codes exist. With 31 characters and 6-digit codes, theoretical max is 31^6 ≈ 887 million codes. In practice, collisions become frequent around 10 million codes.

### Authentication Fails

**Error:** "Unauthorized: Invalid admin credentials"

**Solution:** Verify `ADMIN_API_TOKEN` in `.env` matches the token in your request header.

### Rate Limit Exceeded

**Error:** "Rate limit exceeded"

**Solution:** Wait 1 minute before retrying. Consider batching requests or increasing the rate limit in `/src/lib/admin-auth.ts`.

## Future Enhancements

- [ ] Multi-admin role support (read-only, generator, super-admin)
- [ ] OAuth integration (Auth0, Clerk, NextAuth)
- [ ] Bulk code revocation
- [ ] Code usage analytics dashboard
- [ ] Automated email distribution
- [ ] QR code generation for physical distribution
- [ ] Code reservation system (pre-generate, assign later)
- [ ] Webhook notifications on code redemption
- [ ] Integration with CRM systems

## Support

For issues or questions:

1. Check this documentation
2. Review audit logs
3. Contact technical lead

## License

Proprietary — Mic Press, LLC
