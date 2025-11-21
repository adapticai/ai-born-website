# Database Architecture - AI-Born Landing Page

This document describes the complete database schema, relationships, and implementation details for the AI-Born landing page.

## Table of Contents

- [Overview](#overview)
- [Schema Design](#schema-design)
- [Models Reference](#models-reference)
- [Relationships](#relationships)
- [Indexes & Performance](#indexes--performance)
- [Data Flows](#data-flows)
- [Security Considerations](#security-considerations)

## Overview

### Technology Stack

- **ORM**: Prisma 6.x
- **Database**: PostgreSQL 15+
- **Client**: Next.js 15 with App Router
- **Deployment**: Vercel (recommended) with Vercel Postgres

### Key Features

- VIP code system for exclusive access
- Multi-tier entitlement management
- Receipt verification workflow
- Email capture with UTM tracking
- Retailer smart rotation
- Media and bulk order processing
- Analytics event storage

## Schema Design

### Core Principles

1. **Immutability**: Events and captures are append-only
2. **Audit Trail**: All records have timestamps
3. **Soft Deletes**: Use status flags instead of deletion where applicable
4. **Normalized Data**: Reduce redundancy while maintaining query performance
5. **Flexible Metadata**: Use JSON fields for extensible data

### Entity Relationship Diagram

```
User 1──────* Entitlement *──────1 Code
  │                                │
  │                                │
  1                                1
  │                                │
  *                                *
Receipt                           Org
  │                                │
  1                                │
  │                                1
  │                                │
BonusClaim                    BulkOrder
```

## Models Reference

### User

Core authentication and identity model.

**Fields:**
- `id` (String, CUID): Primary identifier
- `email` (String, unique): User email address
- `name` (String?, optional): Display name
- `emailVerified` (DateTime?): Email verification timestamp
- `createdAt` (DateTime): Account creation
- `updatedAt` (DateTime): Last update

**Relations:**
- `entitlements`: User's granted benefits
- `receipts`: Uploaded proof of purchase
- `bonusClaims`: Bonus pack requests

**Indexes:**
- `email` (unique, for auth lookups)

### Code

VIP access codes with redemption tracking.

**Types** (CodeType enum):
- `VIP_PREVIEW`: Early access to excerpt
- `VIP_BONUS`: Enhanced bonus pack
- `VIP_LAUNCH`: Launch event access
- `PARTNER`: Partner organization code
- `MEDIA`: Media/press access
- `INFLUENCER`: Creator/influencer code

**Status** (CodeStatus enum):
- `ACTIVE`: Can be redeemed
- `REDEEMED`: Fully redeemed (single-use codes)
- `EXPIRED`: Past validity period
- `REVOKED`: Administratively disabled

**Fields:**
- `id` (String): Primary key
- `code` (String, unique): The actual code (e.g., "VIP-PREVIEW-2025")
- `type` (CodeType): Code category
- `status` (CodeStatus): Current state
- `description` (String?): Admin notes
- `maxRedemptions` (Int?): Null = unlimited
- `redemptionCount` (Int): Current redemptions
- `validFrom` (DateTime): Start of validity
- `validUntil` (DateTime?): End of validity (null = no expiry)
- `createdBy` (String?): Admin identifier
- `orgId` (String?): Associated organization

**Indexes:**
- `code` (unique)
- `type`
- `status`
- `[validFrom, validUntil]` (compound, for validity checks)

**Query Examples:**

```typescript
// Find active codes
const activeCodes = await prisma.code.findMany({
  where: {
    status: 'ACTIVE',
    validFrom: { lte: new Date() },
    OR: [
      { validUntil: null },
      { validUntil: { gte: new Date() } }
    ]
  }
});

// Redeem code
await prisma.$transaction(async (tx) => {
  const code = await tx.code.findUnique({
    where: { code: 'VIP-PREVIEW-2025' }
  });

  if (!code || code.status !== 'ACTIVE') {
    throw new Error('Invalid code');
  }

  if (code.maxRedemptions && code.redemptionCount >= code.maxRedemptions) {
    throw new Error('Code fully redeemed');
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

### Entitlement

User benefits granted via codes or purchases.

**Types** (EntitlementType enum):
- `EARLY_EXCERPT`: Free excerpt access
- `BONUS_PACK`: Agent Charter Pack
- `ENHANCED_BONUS`: VIP bonus pack (enhanced)
- `LAUNCH_EVENT`: Launch event access
- `PRIORITY_SUPPORT`: Priority customer support
- `BULK_DISCOUNT`: Corporate bulk discount

**Status** (EntitlementStatus enum):
- `PENDING`: Granted but not yet active
- `ACTIVE`: Currently valid
- `FULFILLED`: Delivered/consumed
- `EXPIRED`: Past expiration date
- `REVOKED`: Administratively removed

**Fields:**
- `id` (String): Primary key
- `userId` (String): Owner
- `codeId` (String?): Source code (if applicable)
- `type` (EntitlementType): Benefit type
- `status` (EntitlementStatus): Current state
- `fulfilledAt` (DateTime?): When delivered
- `expiresAt` (DateTime?): Expiration (null = no expiry)
- `metadata` (Json?): Flexible data (URLs, event details, etc.)

**Indexes:**
- `userId` (for user lookup)
- `codeId` (for code tracking)
- `type` (for benefit queries)
- `status` (for active entitlements)
- `expiresAt` (for expiration processing)

### Receipt

Proof of purchase uploads for bonus claims.

**Status** (ReceiptStatus enum):
- `PENDING`: Uploaded, awaiting verification
- `VERIFIED`: Confirmed valid
- `REJECTED`: Invalid or fraudulent
- `DUPLICATE`: Already claimed

**Fields:**
- `id` (String): Primary key
- `userId` (String): Uploader
- `retailer` (String): Purchase source
- `orderNumber` (String?): Optional order ID
- `purchaseDate` (DateTime?): Purchase date
- `format` (String?): Book format
- `status` (ReceiptStatus): Verification state
- `verifiedAt` (DateTime?): Verification timestamp
- `verifiedBy` (String?): Admin who verified
- `rejectionReason` (String?): Why rejected
- `fileUrl` (String): S3/R2 storage URL
- `fileHash` (String, unique): SHA-256 for duplicate detection
- `ipAddress` (String?): Upload IP (fraud prevention)
- `userAgent` (String?): Browser info

**Indexes:**
- `fileHash` (unique, prevents duplicates)
- `userId`
- `status`
- `retailer`
- `createdAt`

### Org

Organizations for partner codes and bulk orders.

**Types** (OrgType enum):
- `CORPORATE`: Corporate client
- `MEDIA`: Media outlet
- `PARTNER`: Strategic partner
- `ACADEMIC`: University/institution
- `EVENT`: Event organizer

**Fields:**
- `id` (String): Primary key
- `name` (String): Organization name
- `type` (OrgType): Category
- `contactEmail` (String?): Primary contact
- `contactName` (String?): Contact person
- `domain` (String?): Email domain (for auto-assignment)
- `notes` (String?): Admin notes

**Relations:**
- `codes`: Associated VIP codes
- `bulkOrders`: Bulk order requests

**Indexes:**
- `domain` (for email-based org detection)
- `type`

### EmailCapture

Newsletter signups and email list building.

**Sources** (EmailCaptureSource enum):
- `HERO_EXCERPT`: Hero section "Get Free Excerpt"
- `FOOTER`: Footer newsletter signup
- `POPUP`: Exit-intent popup
- `BONUS_CLAIM`: During bonus claim flow
- `SOCIAL`: Social media campaign
- `REFERRAL`: Referral program
- `OTHER`: Other source

**Fields:**
- `id` (String): Primary key
- `email` (String): Email address
- `name` (String?): Optional name
- `source` (EmailCaptureSource): Where captured
- `marketingConsent` (Boolean): Marketing opt-in
- `doubleOptIn` (Boolean): Verified via confirmation email
- `verifiedAt` (DateTime?): Verification timestamp
- `referrer` (String?): HTTP referrer
- `utmSource` (String?): UTM source
- `utmMedium` (String?): UTM medium
- `utmCampaign` (String?): UTM campaign
- `ipAddress` (String?): User IP
- `userAgent` (String?): Browser info
- `geo` (String?): Geographic region (US/UK/EU/AU)

**Indexes:**
- `[email, source]` (unique compound)
- `email`
- `source`
- `createdAt`
- `[doubleOptIn, verifiedAt]`

### BonusClaim

Agent Charter Pack delivery workflow.

**Status** (BonusClaimStatus enum):
- `PENDING`: Receipt uploaded
- `PROCESSING`: Under review
- `APPROVED`: Verified, bonus sent
- `REJECTED`: Invalid receipt
- `DELIVERED`: Bonus pack delivered

**Fields:**
- `id` (String): Primary key
- `userId` (String): Claimant
- `receiptId` (String, unique): Associated receipt
- `status` (BonusClaimStatus): Current state
- `deliveryEmail` (String): Where to send (may differ from user email)
- `deliveredAt` (DateTime?): Delivery timestamp
- `deliveryTrackingId` (String?): Email delivery ID
- `adminNotes` (String?): Internal notes
- `processedBy` (String?): Admin who processed
- `processedAt` (DateTime?): Processing timestamp

**Indexes:**
- `receiptId` (unique)
- `userId`
- `status`
- `createdAt`

### MediaRequest

Press and media inquiries.

**Types** (MediaRequestType enum):
- `GALLEY_REQUEST`: Request review copy
- `INTERVIEW`: Interview request
- `PRESS_KIT`: Press kit download
- `SPEAKING`: Speaking engagement
- `PODCAST`: Podcast appearance
- `OTHER`: Other media request

**Status** (MediaRequestStatus enum):
- `NEW`: Unreviewed
- `IN_REVIEW`: Being considered
- `APPROVED`: Accepted
- `FULFILLED`: Completed
- `DECLINED`: Rejected
- `SPAM`: Marked as spam

**Fields:**
- `id` (String): Primary key
- `name` (String): Contact name
- `email` (String): Contact email
- `organization` (String): Media outlet
- `title` (String?): Contact's title
- `type` (MediaRequestType): Request category
- `status` (MediaRequestStatus): Current state
- `message` (String): Request details
- `deadline` (DateTime?): Response deadline
- `responseNotes` (String?): Response/notes
- `respondedAt` (DateTime?): Response timestamp
- `respondedBy` (String?): Who responded

**Indexes:**
- `email`
- `status`
- `type`
- `createdAt`

### BulkOrder

Corporate and institutional sales.

**Status** (BulkOrderStatus enum):
- `INQUIRY`: Initial inquiry
- `QUOTE_SENT`: Quote provided
- `NEGOTIATING`: In negotiation
- `CONFIRMED`: Order confirmed
- `FULFILLED`: Order completed
- `CANCELLED`: Cancelled

**Fields:**
- `id` (String): Primary key
- `contactName` (String): Contact person
- `contactEmail` (String): Contact email
- `contactPhone` (String?): Phone number
- `orgId` (String?): Associated organization
- `orgName` (String): Organization name
- `quantity` (Int): Number of books
- `format` (String): Format (hardcover/ebook/mixed)
- `requestedPrice` (Float?): Customer's target price
- `quotedPrice` (Float?): Our quote
- `distributionNotes` (String?): NYT-friendly distribution plan
- `preferredRetailers` (String?): Preferred retailers
- `status` (BulkOrderStatus): Current state
- `invoiceUrl` (String?): Invoice link
- `deliveryDate` (DateTime?): Expected delivery
- `trackingInfo` (String?): Shipment tracking
- `assignedTo` (String?): Sales rep
- `internalNotes` (String?): Admin notes

**Indexes:**
- `contactEmail`
- `status`
- `orgId`
- `createdAt`

### RetailerSelection

Smart retailer rotation and tracking.

**Geo** (RetailerGeo enum):
- `US`: United States
- `UK`: United Kingdom
- `EU`: European Union
- `AU`: Australia
- `GLOBAL`: Worldwide

**Fields:**
- `id` (String): Primary key
- `retailerName` (String): Retailer name
- `retailerSlug` (String): URL-safe identifier
- `geo` (RetailerGeo): Geographic region
- `hardcoverUrl` (String?): Hardcover product URL
- `ebookUrl` (String?): eBook product URL
- `audiobookUrl` (String?): Audiobook product URL
- `displayName` (String): User-facing name
- `logoUrl` (String?): Logo asset URL
- `priority` (Int): Display order (higher = first)
- `isActive` (Boolean): Currently shown
- `clickCount` (Int): Total clicks
- `conversionCount` (Int): Estimated conversions
- `nytEligible` (Boolean): NYT bestseller eligible

**Indexes:**
- `[retailerSlug, geo]` (unique compound)
- `[geo, isActive, priority]` (for sorted queries)
- `nytEligible`

### AnalyticsEvent

GTM dataLayer event storage.

**Event Types** (AnalyticsEventType enum):
- `HERO_CTA_CLICK`
- `RETAILER_MENU_OPEN`
- `PREORDER_CLICK`
- `LEAD_CAPTURE_SUBMIT`
- `BONUS_CLAIM_SUBMIT`
- `FRAMEWORK_CARD_OPEN`
- `OVERVIEW_READ_DEPTH`
- `SOCIAL_PROOF_VIEW`
- `PRESSKIT_DOWNLOAD`
- `MEDIA_REQUEST_SUBMIT`
- `BULK_INTEREST_SUBMIT`
- `FAQ_OPEN`
- `NEWSLETTER_SUBSCRIBED`
- `ENDORSEMENT_EXPAND`

**Fields:**
- `id` (String): Primary key
- `eventType` (AnalyticsEventType): Event category
- `eventName` (String): Raw event name
- `properties` (Json?): Event data
- `sessionId` (String?): Session identifier
- `userId` (String?): User identifier
- `ipAddress` (String?): User IP
- `userAgent` (String?): Browser info
- `referrer` (String?): HTTP referrer
- `utmSource` (String?): UTM source
- `utmMedium` (String?): UTM medium
- `utmCampaign` (String?): UTM campaign
- `utmContent` (String?): UTM content
- `utmTerm` (String?): UTM term
- `geo` (String?): Geographic region
- `timestamp` (DateTime): Event time

**Indexes:**
- `eventType`
- `sessionId`
- `userId`
- `timestamp`

## Relationships

### One-to-Many

- `User` → `Entitlement`: A user has many entitlements
- `User` → `Receipt`: A user can upload multiple receipts
- `User` → `BonusClaim`: A user can make multiple claims
- `Code` → `Entitlement`: A code can grant many entitlements
- `Org` → `Code`: An organization can have multiple codes
- `Org` → `BulkOrder`: An organization can place multiple orders
- `Receipt` → `BonusClaim`: One receipt per claim (1:1)

### Foreign Key Constraints

All foreign keys use `onDelete: Cascade` for user-owned data (receipts, claims, entitlements) to ensure GDPR compliance and data cleanup.

## Indexes & Performance

### Query Optimization

1. **Email Lookups**: Indexed for auth
2. **Code Validation**: Compound index on validity dates
3. **Entitlement Checks**: Indexed by user, type, status
4. **Analytics**: Time-series queries optimized with timestamp index
5. **Geo-Routing**: Compound index on retailer geo + priority

### Write Performance

Most writes are single-record inserts with minimal contention. Exceptions:

- **Code Redemption**: Uses transactions to prevent race conditions
- **Analytics Events**: High-volume, consider batching or async queue

## Data Flows

### VIP Code Redemption

```
1. User enters code
2. Validate code (status, redemption limit, validity dates)
3. Transaction:
   a. Increment code.redemptionCount
   b. Create entitlement (type based on code type)
4. Grant access to benefit
```

### Bonus Claim Workflow

```
1. User uploads receipt
   → Create Receipt (status: PENDING)

2. Create BonusClaim (status: PENDING)

3. Admin reviews
   a. APPROVED → Receipt.status = VERIFIED
      → BonusClaim.status = APPROVED
      → Send bonus pack email
      → BonusClaim.status = DELIVERED

   b. REJECTED → Receipt.status = REJECTED
      → BonusClaim.status = REJECTED
```

### Email Capture

```
1. User submits email
   → Create EmailCapture (doubleOptIn: false)
   → Send confirmation email

2. User clicks confirmation link
   → Update EmailCapture (doubleOptIn: true, verifiedAt: now)

3. Add to email service provider (Resend)
```

## Security Considerations

### Data Protection

1. **PII**: Email, name, IP addresses stored - GDPR/CCPA compliant
2. **File Hashing**: SHA-256 for receipt deduplication
3. **Soft Deletes**: Status flags instead of hard deletes
4. **Audit Trail**: All records timestamped

### Access Control

1. **User Data**: Only accessible by owner or admins
2. **Receipts**: File URLs should be signed/expiring (S3 presigned)
3. **Codes**: Public validation endpoint must rate-limit
4. **Admin Actions**: Track `verifiedBy`, `processedBy`, `respondedBy`

### Rate Limiting

Recommended limits (per IP):

- Email capture: 5/hour
- Receipt upload: 3/hour
- Code redemption: 10/hour
- Media requests: 2/hour

### Data Retention

- **Analytics Events**: 90 days (for GDPR compliance)
- **Email Captures**: Until unsubscribe
- **Receipts**: 1 year post-launch
- **User Data**: Until account deletion

## Backup & Recovery

### Automated Backups

- **Frequency**: Daily
- **Retention**: 30 days
- **Point-in-Time Recovery**: Enable for production

### Disaster Recovery

1. Database snapshots (daily)
2. Transaction logs (continuous)
3. Migration history (git-tracked)
4. Seed script (reproducible test data)

## Monitoring

### Key Metrics

- Active entitlements by type
- Code redemption rates
- Receipt verification backlog
- Email capture conversion rate
- Retailer click-through rates
- Bonus claim fulfillment time

### Alerts

- Receipt backlog > 50
- Media request age > 24 hours
- Code redemption failures (spike)
- Database connection pool exhaustion

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)
- [Next.js Database Integration](https://nextjs.org/docs/app/building-your-application/data-fetching)
