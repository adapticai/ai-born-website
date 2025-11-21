# Database Setup Guide

**AI-Born Landing Page - PostgreSQL Database Configuration**

This guide covers setting up PostgreSQL, running migrations, and seeding the database for the AI-Born landing page project.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Schema Overview](#database-schema-overview)
3. [Setup Options](#setup-options)
   - [Option 1: Local PostgreSQL](#option-1-local-postgresql-recommended-for-development)
   - [Option 2: Railway](#option-2-railway-managed-postgresql)
   - [Option 3: Supabase](#option-3-supabase-managed-postgresql)
   - [Option 4: Neon](#option-4-neon-serverless-postgresql)
   - [Option 5: Vercel Postgres](#option-5-vercel-postgres-for-production)
4. [Running Migrations](#running-migrations)
5. [Generating Prisma Client](#generating-prisma-client)
6. [Seeding the Database](#seeding-the-database)
7. [Verifying Setup](#verifying-setup)
8. [Troubleshooting](#troubleshooting)
9. [Production Considerations](#production-considerations)
10. [Quick Reference Commands](#quick-reference-commands)

---

## Prerequisites

- **Node.js:** 18.x or later
- **npm:** 9.x or later (or yarn/pnpm)
- **Prisma:** Installed as dev dependency (already in package.json)
- **PostgreSQL:** 14+ (local or managed)

---

## Database Schema Overview

The Prisma schema includes the following models:

### Authentication & Users
- **User** - User accounts with email authentication
- **OrgMember** - Organization membership and roles
- **Org** - Organizations (corporate, media, academic, partners)
- **OrgPlan** - LLM-generated organizational plans
- **OrgPlanShare** - Plan sharing and permissions

### VIP Code System
- **Code** - VIP codes for preview access, bonuses, launch events
- **Entitlement** - User benefits granted via codes or purchases

### Pre-order & Bonus System
- **Receipt** - Uploaded purchase receipts (proof of purchase)
- **BonusClaim** - Bonus pack claims tied to receipts
- **EmailCapture** - Newsletter signups and lead capture
- **BulkOrder** - Corporate bulk order inquiries

### Media & Press
- **MediaRequest** - Press inquiries, interview requests, galley requests
- **RetailerSelection** - Retailer links (geo-aware, NYT-eligible tracking)

### Analytics
- **AnalyticsEvent** - Event tracking for GTM dataLayer

**Total Models:** 14
**Enums:** 14 (CodeType, CodeStatus, EntitlementType, etc.)

---

## Setup Options

### Option 1: Local PostgreSQL (Recommended for Development)

#### Step 1: Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download and install from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)

#### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE aiborn_dev;

# Create user (optional, if not using default postgres user)
CREATE USER aiborn_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE aiborn_dev TO aiborn_user;

# Exit psql
\q
```

#### Step 3: Configure Environment

Create or update `.env.local`:

```bash
# Development database (local PostgreSQL)
DATABASE_URL=postgresql://postgres:password@localhost:5432/aiborn_dev?schema=public

# Or if using custom user:
# DATABASE_URL=postgresql://aiborn_user:your_secure_password@localhost:5432/aiborn_dev?schema=public
```

---

### Option 2: Railway (Managed PostgreSQL)

Railway offers free PostgreSQL for development with easy scaling.

#### Step 1: Create Railway Account
1. Visit [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

#### Step 2: Add PostgreSQL
1. Click "New" → "Database" → "Add PostgreSQL"
2. Wait for provisioning (usually < 1 minute)
3. Copy the connection string from the "Connect" tab

#### Step 3: Configure Environment

```bash
# Railway PostgreSQL (copy from Railway dashboard)
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

**Pricing:** Free tier includes:
- 512 MB RAM
- 1 GB storage
- $5 credit/month

---

### Option 3: Supabase (Managed PostgreSQL)

Supabase provides PostgreSQL with connection pooling (ideal for serverless).

#### Step 1: Create Supabase Project
1. Visit [supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Wait for database provisioning (2-3 minutes)

#### Step 2: Get Connection Strings
1. Go to Project Settings → Database
2. Copy **Connection string** (for migrations)
3. Copy **Connection pooling string** (for application runtime)

#### Step 3: Configure Environment

```bash
# Supabase - Use pooled connection for serverless
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# For migrations/seeding (direct connection)
DATABASE_URL_NON_POOLING=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**Important:** Use the pooled connection (`?pgbouncer=true`) in production. Use direct connection for migrations.

**Pricing:** Free tier includes:
- 500 MB database storage
- 2 GB bandwidth
- 50k monthly active users

---

### Option 4: Neon (Serverless PostgreSQL)

Neon offers serverless PostgreSQL with auto-scaling and branching.

#### Step 1: Create Neon Account
1. Visit [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Database is provisioned instantly

#### Step 2: Get Connection String
1. Go to your project dashboard
2. Copy the **Pooled connection** string

#### Step 3: Configure Environment

```bash
# Neon - Pooled connection (recommended)
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# For migrations (direct connection, if needed)
# DATABASE_URL_NON_POOLING=postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pooler=false
```

**Pricing:** Free tier includes:
- 3 GB storage
- 100 hours compute/month (auto-suspend after inactivity)
- Unlimited database branches

---

### Option 5: Vercel Postgres (for Production)

Vercel Postgres integrates seamlessly with Vercel deployments.

#### Step 1: Create Database
1. Go to Vercel dashboard → Storage → Create Database
2. Select "Postgres"
3. Choose region closest to your primary users

#### Step 2: Connect to Project
1. Link database to your Vercel project
2. Vercel automatically adds environment variables:
   - `POSTGRES_URL` - Pooled connection (use this)
   - `POSTGRES_URL_NON_POOLING` - Direct connection (for migrations)
   - `POSTGRES_PRISMA_URL` - Optimized for Prisma (recommended)

#### Step 3: Configure Locally

```bash
# Copy from Vercel dashboard → Project Settings → Environment Variables
DATABASE_URL=your_vercel_postgres_url_here
```

**Pricing:** Starts at $20/month
- 256 MB storage (free tier)
- 60 compute hours/month

---

## Running Migrations

Once you have configured `DATABASE_URL`, run migrations to create the database schema.

### Initial Migration (First Time)

```bash
# Generate migration files and apply to database
npx prisma migrate dev --name init
```

This command:
1. Creates `/prisma/migrations/` directory
2. Generates SQL migration files
3. Applies migrations to database
4. Generates Prisma Client

### Subsequent Migrations

After schema changes:

```bash
# Create and apply new migration
npx prisma migrate dev --name descriptive_migration_name
```

Example migration names:
- `add_org_workspace_tables`
- `add_receipt_verification`
- `add_analytics_events`

### Production Migrations

**IMPORTANT:** In production, use `migrate deploy` (NOT `migrate dev`):

```bash
# Apply pending migrations (production/staging)
npx prisma migrate deploy
```

Add to your deployment pipeline (e.g., Vercel build command):

```json
{
  "scripts": {
    "vercel-build": "prisma migrate deploy && next build"
  }
}
```

---

## Generating Prisma Client

Prisma Client must be generated whenever the schema changes.

```bash
# Generate Prisma Client
npm run db:generate

# Or directly:
npx prisma generate
```

**When to regenerate:**
- After pulling schema changes from git
- After running migrations
- Before running the application for the first time

**Auto-generation:** Prisma Client is automatically generated during `prisma migrate dev`.

---

## Seeding the Database

The seed script populates the database with initial data for development and testing.

### What Gets Seeded

The seed script (`/prisma/seed.ts`) creates:

1. **Organizations (4):**
   - Adaptic.ai (Partner)
   - TechCrunch (Media)
   - MIT Sloan (Academic)
   - Acme Corporation (Corporate)

2. **VIP Codes (6):**
   - `VIP-PREVIEW-2025` - Early excerpt access (unlimited)
   - `VIP-BONUS-ENHANCED` - Enhanced bonus pack (100 redemptions)
   - `LAUNCH-EVENT-2025` - Launch event access (500 redemptions)
   - `ADAPTIC-TEAM-2025` - Partner code for Adaptic team (50)
   - `MEDIA-PRESS-KIT` - Media access (unlimited)
   - `CREATOR-COLLAB-01` - Influencer program (25)

3. **Retailer Selections (8):**
   - US: Amazon, Barnes & Noble, Bookshop.org, Apple Books, Google Play, Kobo
   - UK: Amazon UK, Waterstones

4. **Test Data:**
   - 2 test users
   - 2 entitlements
   - 2 email captures
   - 2 media requests
   - 2 bulk orders

### Running the Seed

```bash
# Seed the database
npm run db:seed

# Or directly:
npx tsx prisma/seed.ts
```

**Expected Output:**
```
🌱 Starting database seed...
📦 Creating organizations...
✅ Created 4 organizations
🎟️  Creating VIP codes...
✅ Created 6 VIP codes
🏪 Creating retailer selections...
✅ Created 8 retailer selections
👤 Creating test users...
✅ Created 2 test users
🎁 Creating test entitlements...
✅ Created test entitlements
📧 Creating test email captures...
✅ Created 2 email captures
🎤 Creating test media requests...
✅ Created test media requests
📦 Creating test bulk orders...
✅ Created test bulk orders

🎉 Seed completed successfully!
```

### Resetting the Database

To wipe the database and re-seed:

```bash
# WARNING: Deletes all data and resets migrations
npm run db:reset

# Confirms with prompt, then:
# 1. Drops all tables
# 2. Re-runs all migrations
# 3. Runs seed script
```

**Production Warning:** NEVER run `db:reset` in production. Use only in development.

---

## Verifying Setup

### 1. Check Database Connection

```bash
# Open Prisma Studio (GUI for database)
npm run db:studio

# Opens browser at http://localhost:5555
```

Verify:
- All tables appear in sidebar
- Seeded data is present
- No errors in console

### 2. Test Query (Optional)

Create a test file `/scripts/test-db.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Test query
  const userCount = await prisma.user.count();
  const codeCount = await prisma.code.count();
  const retailerCount = await prisma.retailerSelection.count();

  console.log('Database connection successful!');
  console.log(`Users: ${userCount}`);
  console.log(`VIP Codes: ${codeCount}`);
  console.log(`Retailers: ${retailerCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run:
```bash
npx tsx scripts/test-db.ts
```

### 3. Verify Environment Variables

```bash
# Check that DATABASE_URL is set
echo $DATABASE_URL

# If empty, check your .env.local file
cat .env.local | grep DATABASE_URL
```

---

## Troubleshooting

### Problem: "P1001: Can't reach database server"

**Causes:**
- Database not running
- Incorrect connection string
- Firewall blocking connection

**Solutions:**

```bash
# Check if PostgreSQL is running (local)
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# Test connection with psql
psql postgresql://user:password@host:5432/database

# Verify DATABASE_URL format
echo $DATABASE_URL
```

### Problem: "P3005: Schema does not match migrations"

**Cause:** Prisma schema and database are out of sync.

**Solutions:**

```bash
# Option 1: Reset database (development only)
npm run db:reset

# Option 2: Create a new migration
npx prisma migrate dev --name sync_schema

# Option 3: Push schema without migrations (dev only)
npx prisma db push
```

### Problem: "Environment variable not found: DATABASE_URL"

**Cause:** `.env.local` not loaded or missing.

**Solutions:**

```bash
# 1. Verify .env.local exists and contains DATABASE_URL
cat .env.local | grep DATABASE_URL

# 2. Restart development server
npm run dev

# 3. Manually load env vars (temporary)
export $(cat .env.local | xargs)
```

### Problem: Seed fails with unique constraint error

**Cause:** Seed script already ran, trying to create duplicate records.

**Solutions:**

```bash
# Option 1: Reset and re-seed
npm run db:reset

# Option 2: Delete conflicting records in Prisma Studio
npm run db:studio
# Then manually delete conflicting records

# Option 3: Modify seed script to use upsert (already done)
```

### Problem: "Invalid DATABASE_URL"

**Common Issues:**

```bash
# Missing schema parameter
# WRONG:
DATABASE_URL=postgresql://localhost:5432/aiborn
# CORRECT:
DATABASE_URL=postgresql://localhost:5432/aiborn?schema=public

# Special characters in password (must be URL-encoded)
# If password is: p@ss#word
# URL-encoded: p%40ss%23word
DATABASE_URL=postgresql://user:p%40ss%23word@host:5432/db

# Missing SSL mode (required for cloud databases)
# WRONG:
DATABASE_URL=postgresql://user@cloud-host:5432/db
# CORRECT:
DATABASE_URL=postgresql://user@cloud-host:5432/db?sslmode=require
```

### Problem: Slow queries or connection pool exhaustion

**Cause:** Serverless environments need connection pooling.

**Solutions:**

1. **Use connection pooling URLs:**
   - Supabase: Add `?pgbouncer=true`
   - Neon: Use pooled connection string
   - Vercel: Use `POSTGRES_PRISMA_URL`

2. **Configure Prisma connection limits:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add connection pool limits
  relationMode = "prisma"
}
```

Add to `.env.local`:
```bash
# Limit connections for serverless
DATABASE_CONNECTION_LIMIT=10
```

### Problem: "Error: P1017: Server has closed the connection"

**Cause:** Database went to sleep (common with Neon free tier).

**Solutions:**

```bash
# Neon auto-suspends after inactivity
# Wait 5-10 seconds, then retry

# Or configure in Neon dashboard:
# Settings → Compute → Auto-suspend delay → Increase to 5 minutes
```

---

## Production Considerations

### 1. Connection Pooling

Always use connection pooling in production:

```bash
# Supabase
DATABASE_URL=postgresql://...?pgbouncer=true

# Neon
DATABASE_URL=postgresql://...  # Pooled by default

# Vercel Postgres
DATABASE_URL=$POSTGRES_PRISMA_URL  # Use Prisma-optimized URL
```

### 2. Migration Strategy

```bash
# DEVELOPMENT
npm run db:migrate  # Prisma migrate dev

# PRODUCTION (add to build pipeline)
npx prisma migrate deploy  # Never use "migrate dev"
```

**Vercel Example:**

```json
// package.json
{
  "scripts": {
    "build": "prisma migrate deploy && prisma generate && next build"
  }
}
```

### 3. Backup Strategy

**Managed Services (Automatic):**
- Supabase: Daily backups (7-day retention on free tier)
- Neon: Point-in-time restore (7 days on free tier)
- Railway: Snapshots available on paid plans
- Vercel Postgres: Daily backups

**Manual Backups:**

```bash
# PostgreSQL dump
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

### 4. Security Checklist

- ✅ Use `DATABASE_URL` from environment variables (never hardcode)
- ✅ Enable SSL for cloud databases (`?sslmode=require`)
- ✅ Restrict database access by IP (if possible)
- ✅ Use least-privilege database user (not `postgres` superuser)
- ✅ Rotate database credentials regularly
- ✅ Enable connection limits to prevent exhaustion

### 5. Monitoring

**Key Metrics:**
- Connection pool usage
- Query performance (slow queries)
- Database size growth
- Error rates

**Tools:**
- Prisma Studio: `npm run db:studio`
- Supabase Dashboard: Built-in metrics
- Neon Dashboard: Connection metrics
- Sentry: Database error tracking (already configured)

---

## Quick Reference Commands

```bash
# Database Operations
npm run db:generate       # Generate Prisma Client
npm run db:push           # Push schema changes (dev only, no migration files)
npm run db:migrate        # Create and apply migration
npm run db:seed           # Seed database with initial data
npm run db:studio         # Open Prisma Studio GUI
npm run db:reset          # Reset database (DESTRUCTIVE)

# Direct Prisma Commands
npx prisma migrate dev --name migration_name  # Create migration (dev)
npx prisma migrate deploy                     # Apply migrations (production)
npx prisma migrate status                     # Check migration status
npx prisma db push                            # Push schema without migration
npx prisma db pull                            # Pull schema from existing database
npx prisma studio                             # Open database GUI
npx prisma format                             # Format schema file
npx prisma validate                           # Validate schema

# Verification
npx tsx scripts/test-db.ts                    # Test database connection
psql $DATABASE_URL                            # Connect with psql client
```

---

## Environment Variable Requirements

### Minimal Setup (Development)

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/aiborn_dev?schema=public
NEXTAUTH_SECRET=your-32-character-secret-here
RESEND_API_KEY=re_your_api_key_here
```

### Full Production Setup

See `.env.example` for complete list. Critical variables:

```bash
# Database
DATABASE_URL=postgresql://...  # Pooled connection
DATABASE_URL_NON_POOLING=postgresql://...  # For migrations

# Authentication
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://ai-born.org

# Email
RESEND_API_KEY=...

# Rate Limiting
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# File Storage (R2 or S3)
R2_BUCKET=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=...
SENTRY_AUTH_TOKEN=...

# LLM (for receipt verification & org plans)
ANTHROPIC_API_KEY=...

# Admin
ADMIN_API_TOKEN=...
```

---

## Additional Resources

- **Prisma Docs:** [prisma.io/docs](https://www.prisma.io/docs)
- **Prisma Schema Reference:** [prisma.io/docs/reference/api-reference/prisma-schema-reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- **PostgreSQL Downloads:** [postgresql.org/download](https://www.postgresql.org/download/)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Neon Docs:** [neon.tech/docs](https://neon.tech/docs)
- **Railway Docs:** [docs.railway.app](https://docs.railway.app)

---

## Next Steps

After database setup:

1. ✅ Verify database connection: `npm run db:studio`
2. ✅ Test authentication flow: `/api/auth/signin`
3. ✅ Test VIP code redemption: `/redeem`
4. ✅ Configure email service (Resend): See `EMAIL_SERVICE_IMPLEMENTATION.md`
5. ✅ Set up rate limiting (Upstash): See `RATE_LIMITING_IMPLEMENTATION.md`
6. ✅ Configure file storage (R2/S3): See `RECEIPT_VERIFICATION_SETUP.md`

---

**Last Updated:** 19 October 2025
**Maintained By:** Development team
**Questions?** See troubleshooting section or contact dev team.
