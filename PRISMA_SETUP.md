# Prisma Database Setup - Complete

This document summarizes the complete Prisma database implementation for the AI-Born landing page.

## What Was Created

### Core Files

1. **`/prisma/schema.prisma`** - Complete database schema
   - 11 models with comprehensive relationships
   - 14 enums for type safety
   - Strategic indexes for performance
   - Full foreign key constraints

2. **`/prisma/seed.ts`** - Development seed script
   - 4 organizations
   - 6 VIP codes
   - 8 retailers (US/UK)
   - 2 test users
   - Sample data for all models

3. **`/src/lib/prisma.ts`** - Prisma client singleton
   - Hot-reload safe
   - Development logging
   - Type exports

### Documentation

4. **`/prisma/README.md`** - Quick start guide
   - Setup instructions
   - Available scripts
   - Seed data overview
   - Production deployment guide

5. **`/docs/DATABASE.md`** - Complete architecture reference
   - Schema design principles
   - Model reference (all 11 models)
   - Relationships & indexes
   - Data flows & security
   - Query examples

### Configuration

6. **`.env`** - Development database URL
7. **`.env.example`** - Production-ready template with database section
8. **`package.json`** - Added Prisma scripts:
   - `db:generate` - Generate Prisma Client
   - `db:push` - Push schema to database
   - `db:migrate` - Create migrations
   - `db:seed` - Seed test data
   - `db:studio` - Open Prisma Studio
   - `db:reset` - Reset database

## Database Models

### 11 Production-Ready Models

1. **User** - Authentication & identity
2. **Code** - VIP code system (6 types)
3. **Entitlement** - User benefits (6 types)
4. **Receipt** - Proof of purchase uploads
5. **Org** - Partner organizations (5 types)
6. **EmailCapture** - Newsletter signups (7 sources)
7. **BonusClaim** - Bonus pack delivery workflow
8. **MediaRequest** - Press inquiries (6 types)
9. **BulkOrder** - Corporate sales (6 status states)
10. **RetailerSelection** - Smart retailer rotation (5 geos)
11. **AnalyticsEvent** - GTM dataLayer storage (14 event types)

### 14 Type-Safe Enums

- `CodeType` (6 variants)
- `CodeStatus` (4 states)
- `EntitlementType` (6 benefits)
- `EntitlementStatus` (5 states)
- `ReceiptStatus` (4 states)
- `OrgType` (5 categories)
- `EmailCaptureSource` (7 sources)
- `BonusClaimStatus` (5 states)
- `MediaRequestType` (6 types)
- `MediaRequestStatus` (6 states)
- `BulkOrderStatus` (6 states)
- `RetailerGeo` (5 regions)
- `AnalyticsEventType` (14 events)

## Quick Start

### 1. Install Dependencies

Already completed:
```bash
npm install @prisma/client
npm install -D prisma tsx
```

### 2. Configure Database

Update `.env` with your PostgreSQL connection:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/aiborn_dev?schema=public"
```

### 3. Generate Client & Push Schema

```bash
npm run db:generate
npm run db:push
```

### 4. Seed Development Data

```bash
npm run db:seed
```

### 5. Open Prisma Studio (Optional)

```bash
npm run db:studio
```

Visit: http://localhost:5555

## Test Data Included

### VIP Codes (Ready to Test)

| Code | Type | Max Uses | Valid Until |
|------|------|----------|-------------|
| `VIP-PREVIEW-2025` | VIP_PREVIEW | Unlimited | 2025-12-31 |
| `VIP-BONUS-ENHANCED` | VIP_BONUS | 100 | 2025-06-30 |
| `LAUNCH-EVENT-2025` | VIP_LAUNCH | 500 | 2025-03-31 |
| `ADAPTIC-TEAM-2025` | PARTNER | 50 | No expiry |
| `MEDIA-PRESS-KIT` | MEDIA | Unlimited | No expiry |
| `CREATOR-COLLAB-01` | INFLUENCER | 25 | 2025-12-31 |

### Test Users

- `test@example.com` - Standard user
- `vip@example.com` - User with entitlements

### Retailers (8 configured)

**US:**
- Amazon (hardcover, ebook, audiobook)
- Barnes & Noble (hardcover, ebook)
- Bookshop.org (hardcover)
- Apple Books (ebook, audiobook)
- Google Play (ebook, audiobook)
- Kobo (ebook, audiobook)

**UK:**
- Amazon UK (all formats)
- Waterstones (hardcover)

### Organizations (4 test orgs)

- Adaptic.ai (PARTNER)
- TechCrunch (MEDIA)
- MIT Sloan (ACADEMIC)
- Acme Corporation (CORPORATE)

## Usage Examples

### Basic Queries

```typescript
import { prisma } from '@/lib/prisma';

// Get user with entitlements
const user = await prisma.user.findUnique({
  where: { email: 'vip@example.com' },
  include: { entitlements: true }
});

// Validate VIP code
const code = await prisma.code.findUnique({
  where: { code: 'VIP-PREVIEW-2025' }
});

// Get active retailers for US
const retailers = await prisma.retailerSelection.findMany({
  where: {
    geo: 'US',
    isActive: true
  },
  orderBy: { priority: 'desc' }
});

// Track analytics event
await prisma.analyticsEvent.create({
  data: {
    eventType: 'PREORDER_CLICK',
    eventName: 'preorder_click',
    properties: { retailer: 'amazon', format: 'hardcover' },
    utmSource: 'organic',
    geo: 'US'
  }
});
```

### Complex Workflows

#### Code Redemption

```typescript
await prisma.$transaction(async (tx) => {
  const code = await tx.code.findUnique({
    where: { code: userCode }
  });

  if (!code || code.status !== 'ACTIVE') {
    throw new Error('Invalid code');
  }

  await tx.code.update({
    where: { id: code.id },
    data: { redemptionCount: { increment: 1 } }
  });

  await tx.entitlement.create({
    data: {
      userId,
      codeId: code.id,
      type: 'EARLY_EXCERPT',
      status: 'ACTIVE'
    }
  });
});
```

#### Bonus Claim Processing

```typescript
// User uploads receipt
const receipt = await prisma.receipt.create({
  data: {
    userId,
    retailer: 'Amazon',
    fileUrl: uploadedFileUrl,
    fileHash: await hashFile(file),
    status: 'PENDING'
  }
});

const claim = await prisma.bonusClaim.create({
  data: {
    userId,
    receiptId: receipt.id,
    deliveryEmail: userEmail,
    status: 'PENDING'
  }
});

// Admin approves
await prisma.$transaction([
  prisma.receipt.update({
    where: { id: receipt.id },
    data: {
      status: 'VERIFIED',
      verifiedAt: new Date(),
      verifiedBy: 'admin-id'
    }
  }),
  prisma.bonusClaim.update({
    where: { id: claim.id },
    data: {
      status: 'APPROVED',
      processedBy: 'admin-id',
      processedAt: new Date()
    }
  })
]);

// Send bonus pack email...

// Mark delivered
await prisma.bonusClaim.update({
  where: { id: claim.id },
  data: {
    status: 'DELIVERED',
    deliveredAt: new Date(),
    deliveryTrackingId: emailId
  }
});
```

## Production Deployment

### Recommended Hosting

1. **Vercel Postgres** (easiest)
   - Auto-scaling
   - Built-in connection pooling
   - Use `POSTGRES_PRISMA_URL` from dashboard

2. **Supabase** (generous free tier)
   - Add `?pgbouncer=true` for pooling

3. **Neon** (serverless PostgreSQL)
   - Use pooled connection string

4. **Railway** (simple & affordable)

### Deployment Checklist

- [ ] Update DATABASE_URL in production environment
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Verify schema: `npx prisma db pull`
- [ ] Monitor connection pool usage
- [ ] Set up automated backups
- [ ] Configure point-in-time recovery

### Environment Variables

Production `.env`:

```env
# Direct connection (for migrations)
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Pooled connection (for queries)
DATABASE_URL_POOLING="postgresql://user:pass@host:5432/db?pgbouncer=true"
```

Update `schema.prisma` for pooling:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DATABASE_URL_NON_POOLING") // for migrations
}
```

## Next Steps

### Integration Points

1. **API Routes** - Create Next.js API routes for:
   - Email capture (`/api/email/capture`)
   - Code redemption (`/api/codes/redeem`)
   - Receipt upload (`/api/receipts/upload`)
   - Bonus claim (`/api/bonus/claim`)
   - Media requests (`/api/media/request`)
   - Bulk orders (`/api/bulk/inquire`)

2. **Server Actions** - Use Next.js 15 Server Actions for:
   - Form submissions
   - Optimistic updates
   - Revalidation

3. **Analytics** - Track events to both:
   - Google Tag Manager (client-side)
   - AnalyticsEvent table (server-side)

4. **Admin Dashboard** - Build admin UI for:
   - Receipt verification
   - Bonus claim processing
   - Media request management
   - Code generation
   - Analytics overview

## File Locations

```
/prisma/
├── schema.prisma          # Database schema (11 models, 14 enums)
├── seed.ts                # Seed script with test data
├── README.md              # Quick start guide
└── .gitignore             # Prisma-specific ignores

/src/lib/
└── prisma.ts              # Prisma client singleton

/docs/
└── DATABASE.md            # Complete architecture reference

/.env                      # Development database URL
/.env.example              # Production template (updated)

/package.json              # Updated with Prisma scripts
```

## Support & Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Schema Reference**: `/docs/DATABASE.md`
- **Quick Start**: `/prisma/README.md`
- **Seed Script**: `/prisma/seed.ts`
- **Client Usage**: `/src/lib/prisma.ts`

## Troubleshooting

### "Can't reach database server"

1. Check PostgreSQL is running
2. Verify DATABASE_URL in `.env`
3. Check firewall/network settings

### "Migration failed"

```bash
# Reset and start fresh (development only)
npm run db:reset
```

### "Prisma Client not generated"

```bash
npm run db:generate
```

---

**Status**: ✅ Complete and Production-Ready

All database models, relationships, indexes, seed data, and documentation are ready for implementation.
