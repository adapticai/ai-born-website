# Prisma Database Setup

This directory contains the Prisma database schema, migrations, and seed data for the AI-Born landing page.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Update your `.env` file with your database connection string:

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/aiborn_dev?schema=public"
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Push Schema to Database

For development (no migration history):

```bash
npm run db:push
```

Or create a migration (recommended for production):

```bash
npm run db:migrate
```

### 5. Seed Development Data

```bash
npm run db:seed
```

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `db:generate` | `prisma generate` | Generate Prisma Client from schema |
| `db:push` | `prisma db push` | Push schema changes to database (dev) |
| `db:migrate` | `prisma migrate dev` | Create and apply migrations |
| `db:seed` | `tsx prisma/seed.ts` | Seed database with test data |
| `db:studio` | `prisma studio` | Open Prisma Studio GUI |
| `db:reset` | `prisma migrate reset` | Reset database and re-seed |

## Database Schema Overview

### Core Models

#### User
- Authentication and user management
- Email verification
- Related to: Entitlements, Receipts, BonusClaims

#### Code (VIP Codes)
- Types: VIP_PREVIEW, VIP_BONUS, VIP_LAUNCH, PARTNER, MEDIA, INFLUENCER
- Redemption tracking and limits
- Validity periods
- Organization associations

#### Entitlement
- User benefits and access grants
- Types: EARLY_EXCERPT, BONUS_PACK, ENHANCED_BONUS, LAUNCH_EVENT, etc.
- Fulfillment tracking
- Expiration management

#### Receipt
- Proof of purchase uploads
- Verification workflow
- Duplicate detection via file hash
- Links to bonus claims

#### Org (Organizations)
- Types: CORPORATE, MEDIA, PARTNER, ACADEMIC, EVENT
- Manages partner codes and bulk orders
- Domain-based auto-assignment

### Lead Generation

#### EmailCapture
- Newsletter signups
- Source tracking (HERO_EXCERPT, FOOTER, SOCIAL, etc.)
- UTM parameter capture
- Double opt-in support
- Geo-location tracking

### Fulfillment

#### BonusClaim
- Agent Charter Pack delivery
- Receipt verification workflow
- Admin processing
- Delivery tracking

#### MediaRequest
- Press and media inquiries
- Types: GALLEY_REQUEST, INTERVIEW, PRESS_KIT, SPEAKING, PODCAST
- Status workflow management

#### BulkOrder
- Corporate and institutional orders
- NYT-friendly distribution tracking
- Quote and negotiation workflow

### Commerce

#### RetailerSelection
- Smart retailer rotation
- Geo-based routing (US, UK, EU, AU)
- Multiple format support (hardcover, ebook, audiobook)
- Click and conversion tracking
- NYT eligibility flags

### Analytics

#### AnalyticsEvent
- GTM dataLayer event storage
- UTM tracking
- Session and user correlation
- Event properties (JSON)

## Seed Data

The seed script (`prisma/seed.ts`) creates:

- **4 Organizations**: Adaptic.ai, TechCrunch, MIT Sloan, Acme Corp
- **6 VIP Codes**: Preview, bonus, launch, partner, media, influencer codes
- **8 Retailers**: Amazon (US/UK), Barnes & Noble, Bookshop.org, etc.
- **2 Test Users**: test@example.com, vip@example.com
- **2 Test Entitlements**: Early excerpt, launch event access
- **2 Email Captures**: Newsletter and social sources
- **2 Media Requests**: Interview and podcast requests
- **2 Bulk Orders**: Corporate and academic orders

### Test VIP Codes

Use these codes in development:

| Code | Type | Redemptions | Valid Until |
|------|------|-------------|-------------|
| `VIP-PREVIEW-2025` | VIP_PREVIEW | Unlimited | 2025-12-31 |
| `VIP-BONUS-ENHANCED` | VIP_BONUS | 100 | 2025-06-30 |
| `LAUNCH-EVENT-2025` | VIP_LAUNCH | 500 | 2025-03-31 |
| `ADAPTIC-TEAM-2025` | PARTNER | 50 | No expiry |
| `MEDIA-PRESS-KIT` | MEDIA | Unlimited | No expiry |
| `CREATOR-COLLAB-01` | INFLUENCER | 25 | 2025-12-31 |

## Production Deployment

### Database Providers

Recommended PostgreSQL hosting options:

1. **Vercel Postgres** (recommended for Vercel deployments)
   - Automatic scaling
   - Built-in connection pooling
   - Use `POSTGRES_PRISMA_URL` from Vercel dashboard

2. **Supabase**
   - Generous free tier
   - Real-time capabilities
   - Built-in auth (optional)
   - Use pooled connection: `?pgbouncer=true`

3. **Neon**
   - Serverless PostgreSQL
   - Automatic scaling
   - Branching for preview deployments
   - Use pooled connection string

4. **Railway**
   - Simple deployment
   - Fair pricing
   - Good for small-medium projects

### Migration Workflow

```bash
# 1. Create migration from schema changes
npm run db:migrate

# 2. Review migration in prisma/migrations/

# 3. Deploy to production
# - Vercel: automatic on git push
# - Manual: run migrations in production environment
npx prisma migrate deploy
```

### Connection Pooling

For serverless environments (Vercel, AWS Lambda), use connection pooling:

```env
# Pooled connection (for queries)
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true"

# Direct connection (for migrations)
DATABASE_URL_NON_POOLING="postgresql://user:pass@host:5432/db"
```

Update `schema.prisma` for pooling:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DATABASE_URL_NON_POOLING")
}
```

## Prisma Studio

Launch the visual database editor:

```bash
npm run db:studio
```

Access at: http://localhost:5555

## Common Tasks

### Add a New Model

1. Edit `prisma/schema.prisma`
2. Generate client: `npm run db:generate`
3. Create migration: `npm run db:migrate`
4. Update seed script if needed

### Reset Database

```bash
npm run db:reset
```

This will:
1. Drop the database
2. Create a new database
3. Run all migrations
4. Run seed script

### Check Migration Status

```bash
npx prisma migrate status
```

### Format Schema

```bash
npx prisma format
```

## Troubleshooting

### "Can't reach database server"

Check:
1. PostgreSQL is running: `pg_isready` (if local)
2. DATABASE_URL is correct in `.env`
3. Firewall allows connections
4. SSL mode is correct for cloud databases

### "Column does not exist"

Run:
```bash
npm run db:generate
npm run db:push
```

### "Unique constraint violation"

The seed script uses `upsert` to avoid duplicates. If you see this error:
1. Check for manual data conflicts
2. Run `npm run db:reset` to start fresh

### "Migration failed"

1. Check `prisma/migrations/` for failed migration
2. Manually fix database or rollback
3. Run `npx prisma migrate resolve --rolled-back [migration_name]`
4. Re-run migration

## Best Practices

1. **Always generate client after schema changes**
   ```bash
   npm run db:generate
   ```

2. **Use migrations in production, push in development**
   - Dev: `npm run db:push` (fast iteration)
   - Prod: `npm run db:migrate` (version control)

3. **Keep seed script updated**
   - Add representative test data
   - Use upsert to avoid duplicates
   - Include all enum values

4. **Use transactions for related writes**
   ```typescript
   await prisma.$transaction([
     prisma.user.create(...),
     prisma.entitlement.create(...),
   ]);
   ```

5. **Index frequently queried fields**
   - Already configured in schema
   - Review query performance regularly

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
- [Next.js + Prisma Guide](https://www.prisma.io/nextjs)
