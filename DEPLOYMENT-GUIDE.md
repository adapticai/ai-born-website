# AI-Born Landing Page — Deployment Guide

**Project:** AI-Born Book Landing Page (ai-born.org)
**Version:** 1.0
**Last Updated:** 18 October 2025
**Target Platform:** Vercel (primary), Cloudflare Pages (alternative)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Local Development](#local-development)
5. [Build & Testing](#build--testing)
6. [CI/CD Pipeline Configuration](#cicd-pipeline-configuration)
7. [Staging Deployment](#staging-deployment)
8. [Production Deployment](#production-deployment)
9. [Post-Deployment Verification](#post-deployment-verification)
10. [Rollback Procedures](#rollback-procedures)
11. [Health Check Endpoints](#health-check-endpoints)
12. [Monitoring & Observability](#monitoring--observability)
13. [Security Checklist](#security-checklist)
14. [Troubleshooting](#troubleshooting)
15. [Performance Requirements](#performance-requirements)

---

## Prerequisites

### Required Software

- **Node.js:** v22.18.0 or higher (LTS recommended)
- **npm:** v10.0.0 or higher
- **Git:** v2.40.0 or higher

Verify installations:

```bash
node --version    # Should be >= v22.18.0
npm --version     # Should be >= v10.0.0
git --version     # Should be >= v2.40.0
```

### Required Accounts & Access

1. **Vercel Account** (or Cloudflare Pages)
   - Team access with deployment permissions
   - API tokens for CI/CD

2. **Email Service Provider** (one of the following)
   - SendGrid API key
   - Postmark server token
   - Resend API key

3. **Cloud Storage** (for press kit assets)
   - AWS S3 bucket + IAM credentials
   - Cloudflare R2 bucket + API token
   - Vercel Blob storage token

4. **Analytics Services**
   - Google Tag Manager container ID
   - Privacy-friendly analytics account (Plausible/Fathom)
   - Google Analytics 4 property ID (optional)

5. **Domain & DNS**
   - Domain registrar access (for ai-born.org)
   - DNS management console access

### Development Tools (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Install Lighthouse CLI for performance testing
npm install -g lighthouse

# Install axe-core CLI for accessibility testing
npm install -g @axe-core/cli
```

---

## Environment Configuration

### Environment Variables Overview

The application requires different environment variables for development, staging, and production environments.

### Required Environment Variables

Create a `.env.local` file in the project root (for local development):

```bash
# ============================================================================
# CORE CONFIGURATION
# ============================================================================

# Application environment (development | staging | production)
NODE_ENV=production

# Public site URL (used for Open Graph, canonical URLs, CORS)
NEXT_PUBLIC_SITE_URL=https://ai-born.org

# Alternative for staging
# NEXT_PUBLIC_SITE_URL=https://staging-ai-born.vercel.app

# ============================================================================
# EMAIL DELIVERY SERVICE
# ============================================================================
# Choose ONE email provider and configure accordingly

# Option 1: SendGrid
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@ai-born.org
SENDGRID_FROM_NAME=AI-Born Book

# Option 2: Postmark
# EMAIL_PROVIDER=postmark
# POSTMARK_SERVER_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# POSTMARK_FROM_EMAIL=noreply@ai-born.org

# Option 3: Resend
# EMAIL_PROVIDER=resend
# RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
# RESEND_FROM_EMAIL=noreply@ai-born.org

# Email templates
EMAIL_EXCERPT_TEMPLATE_ID=d-xxxxxxxxxxxxxxxx
EMAIL_BONUS_TEMPLATE_ID=d-xxxxxxxxxxxxxxxx
EMAIL_WELCOME_TEMPLATE_ID=d-xxxxxxxxxxxxxxxx

# ============================================================================
# CLOUD STORAGE (for press kit assets, uploaded receipts)
# ============================================================================
# Choose ONE storage provider

# Option 1: AWS S3
STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_S3_BUCKET_NAME=ai-born-assets
AWS_S3_BUCKET_REGION=us-east-1

# Option 2: Cloudflare R2
# STORAGE_PROVIDER=r2
# R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# R2_BUCKET_NAME=ai-born-assets
# R2_PUBLIC_URL=https://assets.ai-born.org

# Option 3: Vercel Blob
# STORAGE_PROVIDER=vercel-blob
# BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx

# ============================================================================
# ANALYTICS & TRACKING
# ============================================================================

# Google Tag Manager
NEXT_PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX

# Google Analytics 4 (optional, if using GA4 directly)
# NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Privacy-friendly analytics (Plausible/Fathom)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=ai-born.org
# Or for Fathom:
# NEXT_PUBLIC_FATHOM_SITE_ID=XXXXXXXX

# ============================================================================
# RATE LIMITING & SECURITY
# ============================================================================

# Rate limit configuration (requests per hour per IP)
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=3600000

# Honeypot field name (anti-spam)
HONEYPOT_FIELD_NAME=website_url

# File upload limits
MAX_FILE_SIZE_MB=5
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf

# ============================================================================
# OPTIONAL: DATABASE (if implementing persistence layer)
# ============================================================================
# Note: Current MVP uses in-memory storage
# Uncomment if adding database for email list, analytics

# PostgreSQL (via Vercel Postgres or Neon)
# DATABASE_URL=postgres://username:password@host:5432/database
# DATABASE_POOL_MAX=10

# Prisma configuration
# PRISMA_LOG_LEVEL=info

# ============================================================================
# OPTIONAL: SPAM PROTECTION
# ============================================================================

# Cloudflare Turnstile (recommended over hCaptcha for UX)
# NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAAxxxxxxxxxxxxxxxxx
# TURNSTILE_SECRET_KEY=0x4AAAAAAAxxxxxxxxxxxxxxxxx

# Alternative: hCaptcha
# NEXT_PUBLIC_HCAPTCHA_SITE_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# HCAPTCHA_SECRET_KEY=0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxF

# ============================================================================
# OPTIONAL: MAILING LIST SERVICE
# ============================================================================
# For newsletter subscriptions (if using external service)

# Mailchimp
# MAILCHIMP_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us12
# MAILCHIMP_AUDIENCE_ID=xxxxxxxxxx
# MAILCHIMP_SERVER_PREFIX=us12

# ConvertKit
# CONVERTKIT_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
# CONVERTKIT_FORM_ID=xxxxxxxx

# ============================================================================
# OPTIONAL: ERROR TRACKING
# ============================================================================

# Sentry
# NEXT_PUBLIC_SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxxxx
# SENTRY_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# SENTRY_ORG=ai-born
# SENTRY_PROJECT=landing-page

# ============================================================================
# DEVELOPMENT ONLY
# ============================================================================
# These should NOT be set in production

# Skip email sending in development (log to console instead)
# DEV_SKIP_EMAIL_SEND=true

# Mock storage uploads in development
# DEV_MOCK_STORAGE=true

# Disable rate limiting in development
# DEV_DISABLE_RATE_LIMIT=true
```

### Staging Environment Variables

Create `.env.staging` for staging-specific configuration:

```bash
NODE_ENV=staging
NEXT_PUBLIC_SITE_URL=https://staging-ai-born.vercel.app

# Use test/sandbox credentials
SENDGRID_API_KEY=SG.test_xxxxxxxxxxxxxxxxxxxxxxxxx
AWS_S3_BUCKET_NAME=ai-born-assets-staging

# Reduced rate limits for testing
RATE_LIMIT_MAX_REQUESTS=50

# Enable development features
DEV_SKIP_EMAIL_SEND=false
```

### Production Environment Variables

Production variables should be set directly in Vercel dashboard (never commit to git):

```bash
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://ai-born.org

# Production credentials (full access)
SENDGRID_API_KEY=<production-api-key>
AWS_S3_BUCKET_NAME=ai-born-assets-production

# Strict rate limits
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=3600000
```

### Setting Environment Variables in Vercel

#### Via Vercel Dashboard

1. Navigate to your project in Vercel dashboard
2. Go to **Settings** → **Environment Variables**
3. Add each variable with appropriate environment selection:
   - **Production**: Production deployments only
   - **Preview**: Branch preview deployments
   - **Development**: Local development with `vercel dev`

#### Via Vercel CLI

```bash
# Set production environment variable
vercel env add SENDGRID_API_KEY production

# Set preview environment variable
vercel env add SENDGRID_API_KEY preview

# Pull environment variables to local
vercel env pull .env.local
```

### Security Best Practices

1. **Never commit** `.env.local`, `.env.staging`, or `.env.production` to git
2. **Verify** `.gitignore` includes:
   ```
   .env*.local
   .env.staging
   .env.production
   ```
3. **Rotate** API keys quarterly and after team member departures
4. **Use** environment-specific credentials (staging vs production)
5. **Limit** access to production environment variables to essential personnel only

---

## Database Setup

### Current Implementation (MVP)

The MVP implementation uses **in-memory storage** for rate limiting and does not require a database. Email captures are logged and optionally forwarded to external services (SendGrid, Mailchimp).

### Future: Prisma + PostgreSQL (Optional)

If you need to persist email captures, analytics, or bonus claims, follow this setup:

#### 1. Install Prisma

```bash
npm install prisma @prisma/client --save-dev
```

#### 2. Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Database schema
- `.env` - Database connection string

#### 3. Configure Database Schema

Create `prisma/schema.prisma`:

```prisma
// This is your Prisma schema file

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Email captures for excerpt downloads
model EmailCapture {
  id          String   @id @default(cuid())
  email       String   @db.VarChar(255)
  name        String?  @db.VarChar(255)
  source      String?  @db.VarChar(100)
  ipAddress   String   @db.VarChar(45)
  userAgent   String?  @db.Text
  createdAt   DateTime @default(now())

  @@index([email])
  @@index([createdAt])
  @@map("email_captures")
}

// Newsletter subscriptions
model NewsletterSubscriber {
  id              String   @id @default(cuid())
  email           String   @unique @db.VarChar(255)
  name            String?  @db.VarChar(255)
  subscribed      Boolean  @default(true)
  sourceReferrer  String?  @db.VarChar(255)
  createdAt       DateTime @default(now())
  unsubscribedAt  DateTime?

  @@index([email])
  @@index([subscribed])
  @@map("newsletter_subscribers")
}

// Bonus claims (proof of purchase)
model BonusClaim {
  id             String   @id @default(cuid())
  email          String   @db.VarChar(255)
  retailer       String   @db.VarChar(100)
  orderIdHash    String   @db.VarChar(64)
  receiptUrl     String?  @db.Text
  status         String   @db.VarChar(50) // pending, approved, rejected
  ipAddress      String   @db.VarChar(45)
  createdAt      DateTime @default(now())
  processedAt    DateTime?
  bonusSentAt    DateTime?

  @@index([email])
  @@index([status])
  @@index([createdAt])
  @@map("bonus_claims")
}

// Media requests (press inquiries)
model MediaRequest {
  id           String   @id @default(cuid())
  name         String   @db.VarChar(255)
  email        String   @db.VarChar(255)
  outlet       String?  @db.VarChar(255)
  requestType  String   @db.VarChar(100)
  message      String   @db.Text
  ipAddress    String   @db.VarChar(45)
  status       String   @db.VarChar(50) @default("pending")
  createdAt    DateTime @default(now())
  processedAt  DateTime?

  @@index([email])
  @@index([status])
  @@index([createdAt])
  @@map("media_requests")
}

// Bulk order inquiries
model BulkOrder {
  id           String   @id @default(cuid())
  name         String   @db.VarChar(255)
  email        String   @db.VarChar(255)
  company      String?  @db.VarChar(255)
  quantity     Int
  qtyBand      String   @db.VarChar(50)
  message      String?  @db.Text
  ipAddress    String   @db.VarChar(45)
  status       String   @db.VarChar(50) @default("pending")
  createdAt    DateTime @default(now())
  processedAt  DateTime?

  @@index([email])
  @@index([status])
  @@index([createdAt])
  @@map("bulk_orders")
}

// Rate limiting (if using database instead of in-memory)
model RateLimit {
  id         String   @id @default(cuid())
  ipAddress  String   @unique @db.VarChar(45)
  endpoint   String   @db.VarChar(255)
  count      Int      @default(1)
  resetTime  DateTime
  updatedAt  DateTime @updatedAt

  @@index([ipAddress, endpoint])
  @@index([resetTime])
  @@map("rate_limits")
}
```

#### 4. Create Database Migration

```bash
# Generate migration files
npx prisma migrate dev --name init

# Apply migrations to production
npx prisma migrate deploy
```

#### 5. Generate Prisma Client

```bash
npx prisma generate
```

#### 6. Update Environment Variables

Add to `.env.local`:

```bash
# Vercel Postgres (recommended)
DATABASE_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb"

# Or Neon (alternative)
# DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb"

# Or Supabase (alternative)
# DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

#### 7. Prisma Studio (Database GUI)

```bash
# Open Prisma Studio for database management
npx prisma studio
```

### Database Deployment Checklist

- [ ] Database provisioned (Vercel Postgres, Neon, or Supabase)
- [ ] Connection string added to environment variables
- [ ] Migrations applied to staging database
- [ ] Migrations applied to production database
- [ ] Database backups configured (automatic daily backups)
- [ ] Connection pooling configured (max pool size: 10)
- [ ] Database monitoring enabled
- [ ] Read replicas configured (for high traffic)

---

## Local Development

### Initial Setup

```bash
# Clone repository
git clone https://github.com/yourusername/ai-born-website.git
cd ai-born-website

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure environment variables
nano .env.local  # Or use your preferred editor
```

### Development Server

```bash
# Start development server (with Turbopack)
npm run dev

# Server will start at http://localhost:3000
```

The development server includes:
- Hot module replacement (HMR)
- Fast refresh for React components
- TypeScript type checking
- ESLint warnings in console

### Code Quality Tools

```bash
# Run linter
npm run lint

# Fix auto-fixable linting issues
npm run lint -- --fix

# Format code with Prettier
npm run format

# Type check
npx tsc --noEmit
```

### Development Workflow Best Practices

1. **Branch Strategy**
   ```bash
   # Create feature branch
   git checkout -b feature/your-feature-name

   # Create fix branch
   git checkout -b fix/bug-description
   ```

2. **Pre-Commit Checks**
   ```bash
   # Run before committing
   npm run lint
   npm run format
   npx tsc --noEmit
   ```

3. **Testing Forms Locally**
   - Email captures log to console (no actual emails sent)
   - File uploads are mocked (no actual storage operations)
   - Rate limiting is disabled by default

---

## Build & Testing

### Production Build

```bash
# Create production build
npm run build

# Test production build locally
npm run start
```

Expected output:
```
✓ Creating an optimized production build
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (12/12)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         120 kB
├ ○ /about                               2.1 kB         115 kB
├ ○ /blog                                3.8 kB         118 kB
└ λ /api/email-capture                   0 kB           0 kB
```

### Performance Testing

#### Lighthouse Audit

```bash
# Build production version
npm run build
npm run start

# In separate terminal, run Lighthouse
lighthouse http://localhost:3000 \
  --output html \
  --output-path ./lighthouse-report.html \
  --view
```

**Required Scores (Production):**
- Performance: ≥95
- Accessibility: ≥95
- Best Practices: ≥95
- SEO: ≥95

#### Web Vitals Testing

```bash
# Test Core Web Vitals on 4G network
lighthouse http://localhost:3000 \
  --preset=desktop \
  --throttling-method=devtools \
  --throttling.cpuSlowdownMultiplier=4
```

**Performance Budget:**
- LCP (Largest Contentful Paint): ≤2.0s
- FID (First Input Delay): ≤100ms
- CLS (Cumulative Layout Shift): ≤0.1
- TBT (Total Blocking Time): ≤150ms

### Accessibility Testing

```bash
# Run axe accessibility audit
axe http://localhost:3000 --save accessibility-report.json

# Automated WCAG 2.2 AA compliance check
npx pa11y http://localhost:3000
```

**Manual Accessibility Checks:**
1. Keyboard navigation (Tab, Enter, Escape)
2. Screen reader testing (NVDA on Windows, VoiceOver on macOS)
3. Colour contrast verification (4.5:1 for body text)
4. Focus indicators visible on all interactive elements
5. Alt text present for all images

### Security Testing

```bash
# Scan for vulnerabilities in dependencies
npm audit

# Fix auto-fixable vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

### Cross-Browser Testing

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Pre-Deployment Checklist

- [ ] Production build succeeds without errors
- [ ] Lighthouse scores ≥95 on all metrics
- [ ] No accessibility violations (axe, pa11y)
- [ ] No console errors or warnings
- [ ] All forms submit successfully
- [ ] Email delivery tested (staging environment)
- [ ] File uploads work (staging environment)
- [ ] Rate limiting functions correctly
- [ ] Analytics events fire correctly
- [ ] Meta tags and Open Graph images correct
- [ ] Sitemap.xml generated and accessible
- [ ] Robots.txt configured correctly
- [ ] All links work (no 404s)
- [ ] Mobile responsive on all screen sizes
- [ ] Images optimized (WebP format)

---

## CI/CD Pipeline Configuration

### GitHub Actions for Vercel

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - main        # Production deployment
      - staging     # Staging deployment
  pull_request:
    branches:
      - main        # Preview deployment for PRs

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  # ============================================================================
  # Lint and Type Check
  # ============================================================================
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

  # ============================================================================
  # Build and Test
  # ============================================================================
  build:
    name: Build & Test
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build
        env:
          NODE_ENV: production

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
          uploadArtifacts: true
          temporaryPublicStorage: true

  # ============================================================================
  # Security Audit
  # ============================================================================
  security:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Run npm audit
        run: npm audit --audit-level=moderate

  # ============================================================================
  # Deploy to Vercel (Production)
  # ============================================================================
  deploy-production:
    name: Deploy to Production
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    needs: [lint, build, security]
    environment:
      name: production
      url: https://ai-born.org
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel
        id: deploy
        run: |
          vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }} > deployment-url.txt
          echo "deployment_url=$(cat deployment-url.txt)" >> $GITHUB_OUTPUT

      - name: Comment Deployment URL on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Deployed to production: ${{ steps.deploy.outputs.deployment_url }}'
            })

  # ============================================================================
  # Deploy to Vercel (Staging)
  # ============================================================================
  deploy-staging:
    name: Deploy to Staging
    if: github.ref == 'refs/heads/staging' && github.event_name == 'push'
    runs-on: ubuntu-latest
    needs: [lint, build]
    environment:
      name: staging
      url: https://staging-ai-born.vercel.app
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}

  # ============================================================================
  # Deploy Preview (Pull Requests)
  # ============================================================================
  deploy-preview:
    name: Deploy Preview
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    needs: [lint, build]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel
        id: deploy
        run: |
          vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }} > deployment-url.txt
          echo "deployment_url=$(cat deployment-url.txt)" >> $GITHUB_OUTPUT

      - name: Comment Preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🔍 Preview deployment ready: ${{ steps.deploy.outputs.deployment_url }}'
            })
```

### Required GitHub Secrets

Add these secrets to your GitHub repository:

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

```
VERCEL_TOKEN           # Vercel API token (from Vercel dashboard)
VERCEL_ORG_ID          # Vercel organization ID
VERCEL_PROJECT_ID      # Vercel project ID
```

To get these values:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Get project info
cat .vercel/project.json
```

### Deployment Triggers

| Branch/Event      | Deployment Target | URL                                    |
|-------------------|-------------------|----------------------------------------|
| `main` (push)     | Production        | https://ai-born.org                    |
| `staging` (push)  | Staging           | https://staging-ai-born.vercel.app     |
| Pull Request      | Preview           | https://ai-born-git-[branch].vercel.app|

---

## Staging Deployment

### Purpose

Staging environment allows testing in production-like conditions before deploying to production.

### Staging Environment Setup

1. **Create Staging Branch**
   ```bash
   git checkout -b staging
   git push -u origin staging
   ```

2. **Configure Vercel for Staging**
   - Create separate Vercel project for staging (recommended)
   - Or use Vercel preview deployments with staging branch

3. **Set Staging Environment Variables**

   In Vercel dashboard for staging project:
   ```
   NODE_ENV=staging
   NEXT_PUBLIC_SITE_URL=https://staging-ai-born.vercel.app
   SENDGRID_API_KEY=<staging-api-key>
   AWS_S3_BUCKET_NAME=ai-born-assets-staging
   ```

### Deploying to Staging

#### Automatic (via GitHub Actions)

```bash
# Push to staging branch
git checkout staging
git merge main
git push origin staging

# CI/CD will automatically deploy to staging
```

#### Manual (via Vercel CLI)

```bash
# Deploy to staging
vercel --env staging

# Or specify target explicitly
vercel deploy --target staging
```

### Staging Testing Checklist

- [ ] All forms submit successfully
- [ ] Email delivery works (check inbox)
- [ ] File uploads work and appear in staging bucket
- [ ] Rate limiting functions correctly
- [ ] Analytics events tracked in GTM preview mode
- [ ] No console errors
- [ ] Performance meets targets (Lighthouse ≥95)
- [ ] Mobile responsive
- [ ] Cross-browser compatibility
- [ ] SSL certificate valid
- [ ] Meta tags correct (og:url should be staging URL)

### Staging Approval Process

1. QA team tests on staging environment
2. Product owner reviews functionality
3. Performance audit passes
4. Security scan passes
5. Approval granted → Deploy to production

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All staging tests passed
- [ ] Approval from product owner
- [ ] Performance budget met (LCP ≤2.0s, CLS ≤0.1)
- [ ] Accessibility audit passed (WCAG 2.2 AA)
- [ ] Security audit passed (npm audit clean)
- [ ] Analytics tracking verified
- [ ] DNS records configured correctly
- [ ] SSL certificate valid and auto-renewal enabled
- [ ] Backup of current production version
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment window

### Deployment Methods

#### Option 1: Automatic Deployment (GitHub Actions)

**Recommended for most cases**

```bash
# Merge staging to main
git checkout main
git merge staging

# Push to trigger deployment
git push origin main

# Monitor GitHub Actions for deployment status
# Check https://github.com/yourusername/ai-born-website/actions
```

#### Option 2: Manual Deployment (Vercel CLI)

**Use for hotfixes or emergency deployments**

```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Deploy to production
vercel --prod

# Vercel will prompt for confirmation
# Review deployment summary
# Confirm deployment
```

#### Option 3: Vercel Dashboard Deployment

1. Go to Vercel dashboard
2. Select project
3. Go to **Deployments** tab
4. Find desired deployment
5. Click **...** → **Promote to Production**

### Deployment Process Timeline

**Preparation (15 minutes before deployment)**

```bash
# 1. Final checks
npm run build
npm run lint
npx tsc --noEmit

# 2. Verify environment variables in Vercel
vercel env ls production

# 3. Create deployment tag
git tag -a v1.0.0 -m "Production deployment v1.0.0"
git push origin v1.0.0
```

**Deployment Window (5-10 minutes)**

1. **Initiate deployment** (automatic or manual)
2. **Monitor build logs** in Vercel dashboard
3. **Wait for build completion** (typically 2-4 minutes)
4. **Automatic health checks** run post-deployment

**Post-Deployment (30 minutes)**

1. **Verify deployment URL** resolves correctly
2. **Run smoke tests** (see checklist below)
3. **Monitor error rates** in Sentry/logs
4. **Check analytics** events firing
5. **Verify CDN cache** warming

### Smoke Tests (Post-Deployment)

Run these tests immediately after production deployment:

```bash
# 1. Homepage loads
curl -I https://ai-born.org
# Expected: HTTP/2 200

# 2. Sitemap accessible
curl -I https://ai-born.org/sitemap.xml
# Expected: HTTP/2 200

# 3. Robots.txt accessible
curl -I https://ai-born.org/robots.txt
# Expected: HTTP/2 200

# 4. API endpoint health
curl https://ai-born.org/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

**Manual Tests:**

- [ ] Homepage loads correctly
- [ ] Hero CTA buttons work
- [ ] Retailer menu opens and links work
- [ ] Email capture form submits
- [ ] Bonus claim form submits
- [ ] Press kit download works
- [ ] FAQ accordion expands/collapses
- [ ] Footer links work
- [ ] Analytics events fire (check GTM preview)
- [ ] Mobile navigation works
- [ ] Search engines can access (check robots.txt)

### Domain Configuration

#### DNS Records (Cloudflare/Route53/Vercel DNS)

```
# A Records (if using Vercel DNS)
ai-born.org          A       76.76.21.21
www.ai-born.org      A       76.76.21.21

# CNAME Records (if using custom DNS)
ai-born.org          CNAME   cname.vercel-dns.com
www.ai-born.org      CNAME   cname.vercel-dns.com

# CAA Records (SSL certificate authorization)
ai-born.org          CAA     0 issue "letsencrypt.org"
ai-born.org          CAA     0 issuewild "letsencrypt.org"

# TXT Records (verification, SPF, DKIM)
ai-born.org          TXT     "v=spf1 include:sendgrid.net ~all"
_dmarc.ai-born.org   TXT     "v=DMARC1; p=quarantine; rua=mailto:dmarc@ai-born.org"
```

#### Vercel Domain Configuration

1. Go to Vercel project → **Settings** → **Domains**
2. Add domain: `ai-born.org`
3. Add domain: `www.ai-born.org`
4. Configure redirect: `www.ai-born.org` → `ai-born.org` (recommended)
5. Enable SSL (automatic via Let's Encrypt)
6. Verify DNS propagation (can take 24-48 hours)

### Production Monitoring Checklist

- [ ] Uptime monitoring active (UptimeRobot, Pingdom)
- [ ] Error tracking active (Sentry)
- [ ] Performance monitoring active (Vercel Analytics)
- [ ] Analytics tracking verified (GTM, Plausible)
- [ ] Log aggregation active (Logtail, Datadog)
- [ ] Alerts configured for:
  - [ ] Downtime (>1 minute)
  - [ ] Error rate spike (>10 errors/minute)
  - [ ] Performance degradation (LCP >3s)
  - [ ] High traffic spike (>1000 req/minute)

---

## Post-Deployment Verification

### Automated Verification Script

Create `scripts/verify-deployment.sh`:

```bash
#!/bin/bash

# Production URL
PROD_URL="https://ai-born.org"

echo "🔍 Verifying deployment to $PROD_URL"
echo "========================================"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
  local name=$1
  local url=$2
  local expected=$3

  echo -n "Testing $name... "

  response=$(curl -s -o /dev/null -w "%{http_code}" "$url")

  if [ "$response" -eq "$expected" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $response)"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAILED${NC} (Expected HTTP $expected, got HTTP $response)"
    ((FAILED++))
  fi
}

# Run tests
test_endpoint "Homepage" "$PROD_URL" 200
test_endpoint "Sitemap" "$PROD_URL/sitemap.xml" 200
test_endpoint "Robots.txt" "$PROD_URL/robots.txt" 200
test_endpoint "Privacy Policy" "$PROD_URL/privacy" 200
test_endpoint "Terms of Service" "$PROD_URL/terms" 200
test_endpoint "Health Check" "$PROD_URL/api/health" 200

# Check SSL certificate
echo -n "Testing SSL certificate... "
ssl_result=$(echo | openssl s_client -servername ai-born.org -connect ai-born.org:443 2>/dev/null | openssl x509 -noout -dates)
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ PASSED${NC}"
  echo "$ssl_result"
  ((PASSED++))
else
  echo -e "${RED}✗ FAILED${NC}"
  ((FAILED++))
fi

# Check Lighthouse performance
echo -n "Running Lighthouse audit... "
lighthouse "$PROD_URL" --quiet --output=json --output-path=./lighthouse-prod.json
perf_score=$(cat lighthouse-prod.json | jq '.categories.performance.score * 100')
echo -e "Performance Score: $perf_score"

if (( $(echo "$perf_score >= 95" | bc -l) )); then
  echo -e "${GREEN}✓ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ FAILED${NC} (Expected ≥95, got $perf_score)"
  ((FAILED++))
fi

# Summary
echo "========================================"
echo "Results: $PASSED passed, $FAILED failed"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed. Please investigate.${NC}"
  exit 1
fi
```

Run verification:

```bash
chmod +x scripts/verify-deployment.sh
./scripts/verify-deployment.sh
```

### Performance Verification

```bash
# Run Lighthouse audit on production
lighthouse https://ai-born.org \
  --output html \
  --output-path ./reports/lighthouse-prod-$(date +%Y%m%d).html \
  --view

# Check Core Web Vitals
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://ai-born.org&category=performance"
```

### Analytics Verification

1. **GTM Preview Mode**
   - Go to GTM container
   - Enable **Preview** mode
   - Visit production site
   - Verify all events firing correctly

2. **Check Analytics Dashboard**
   - Plausible/Fathom: Verify page views
   - Google Analytics 4: Check real-time reports
   - Conversion tracking: Test a form submission

3. **Test Event Tracking**
   ```javascript
   // Open browser console on production site
   // Trigger an event (e.g., click pre-order button)
   // Check dataLayer
   console.log(window.dataLayer);

   // Should show event objects like:
   // {event: 'hero_cta_click', cta_id: 'preorder', format: 'hardcover', ...}
   ```

### Security Verification

```bash
# Check security headers
curl -I https://ai-born.org | grep -i "strict-transport-security\|x-frame-options\|x-content-type-options"

# Expected headers:
# strict-transport-security: max-age=63072000
# x-frame-options: SAMEORIGIN
# x-content-type-options: nosniff

# Run security scan
npx snyk test --all-projects

# Check SSL certificate
openssl s_client -servername ai-born.org -connect ai-born.org:443 | openssl x509 -noout -dates
```

---

## Rollback Procedures

### Immediate Rollback (Vercel Dashboard)

**Use this for critical production issues**

1. Go to Vercel dashboard → Project → **Deployments**
2. Find the last known good deployment
3. Click **...** → **Promote to Production**
4. Confirm promotion
5. Wait ~30 seconds for rollback to complete

**Timeline:** 1-2 minutes

### Rollback via Vercel CLI

```bash
# List recent deployments
vercel ls

# Promote specific deployment to production
vercel promote <deployment-url>

# Example:
vercel promote https://ai-born-git-main-abc123.vercel.app
```

### Rollback via GitHub

**For reverting code changes**

```bash
# Option 1: Revert last commit
git revert HEAD
git push origin main

# Option 2: Revert to specific commit
git revert <commit-hash>
git push origin main

# Option 3: Hard reset (use with caution)
git reset --hard <good-commit-hash>
git push --force origin main  # WARNING: This rewrites history
```

### Database Rollback (If Using Prisma)

**Only needed if schema changes were deployed**

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back <migration-name>

# Apply previous migration
npx prisma migrate deploy
```

### Rollback Decision Matrix

| Issue Severity | Rollback Method | Timeline |
|----------------|-----------------|----------|
| Site down | Vercel dashboard → Promote previous | 1-2 min |
| Critical bug affecting core functionality | Vercel dashboard → Promote previous | 1-2 min |
| Performance regression (LCP >4s) | Vercel CLI rollback + investigate | 2-5 min |
| Minor UI bug | Create hotfix branch → Deploy fix | 10-20 min |
| Analytics not tracking | No rollback needed → Fix forward | N/A |
| Broken link | No rollback needed → Fix forward | N/A |

### Post-Rollback Actions

1. **Notify team** in Slack/email
2. **Create incident report** documenting:
   - What went wrong
   - When issue was detected
   - How rollback was performed
   - Root cause analysis
   - Prevention measures
3. **Re-test in staging** before re-deploying
4. **Update deployment checklist** if process gaps identified

---

## Health Check Endpoints

### API Health Check Endpoint

Create `src/app/api/health/route.ts`:

```typescript
/**
 * Health Check API Endpoint
 * Used by monitoring services to verify application health
 *
 * @route GET /api/health
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version: string;
  checks: {
    database?: 'ok' | 'error';
    storage?: 'ok' | 'error';
    email?: 'ok' | 'error';
  };
  uptime: number;
}

// Store startup time
const startTime = Date.now();

export async function GET() {
  const checks: HealthCheckResponse['checks'] = {};
  let overallStatus: 'ok' | 'degraded' | 'error' = 'ok';

  try {
    // Check database connection (if using database)
    if (process.env.DATABASE_URL) {
      try {
        // Add your database ping check here
        // Example: await prisma.$queryRaw`SELECT 1`
        checks.database = 'ok';
      } catch (error) {
        checks.database = 'error';
        overallStatus = 'degraded';
      }
    }

    // Check storage provider (if using cloud storage)
    if (process.env.AWS_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID) {
      try {
        // Add your storage health check here
        checks.storage = 'ok';
      } catch (error) {
        checks.storage = 'error';
        overallStatus = 'degraded';
      }
    }

    // Check email service
    if (process.env.SENDGRID_API_KEY || process.env.POSTMARK_SERVER_TOKEN) {
      try {
        // Add your email service health check here
        checks.email = 'ok';
      } catch (error) {
        checks.email = 'error';
        overallStatus = 'degraded';
      }
    }

    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      checks,
      uptime: Math.floor((Date.now() - startTime) / 1000), // uptime in seconds
    };

    const statusCode = overallStatus === 'ok' ? 200 : overallStatus === 'degraded' ? 207 : 503;

    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });

  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        checks: {},
        uptime: Math.floor((Date.now() - startTime) / 1000),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
```

### Readiness Check Endpoint

Create `src/app/api/ready/route.ts`:

```typescript
/**
 * Readiness Check Endpoint
 * Indicates whether the application is ready to serve traffic
 *
 * @route GET /api/ready
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Add checks for critical dependencies here
  // For now, simple 200 response

  return NextResponse.json(
    { ready: true, timestamp: new Date().toISOString() },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
```

### Liveness Check Endpoint

Create `src/app/api/alive/route.ts`:

```typescript
/**
 * Liveness Check Endpoint
 * Minimal check to verify the application is running
 *
 * @route GET /api/alive
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new NextResponse('OK', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-store',
    },
  });
}
```

### Health Check Usage

**UptimeRobot Configuration:**
- Monitor URL: `https://ai-born.org/api/health`
- Check interval: 5 minutes
- Alert on: HTTP status ≠ 200

**Pingdom Configuration:**
- Monitor URL: `https://ai-born.org/api/health`
- Check interval: 1 minute
- Alert on: HTTP status ≠ 200 OR response time >5s

**Vercel Health Checks:**
- Path: `/api/health`
- Interval: 60 seconds
- Timeout: 10 seconds

---

## Monitoring & Observability

### Vercel Analytics

**Enable Vercel Analytics:**

1. Go to Vercel project → **Analytics** tab
2. Enable **Web Analytics**
3. Add to `src/app/layout.tsx`:

```tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Error Tracking (Sentry)

**Install Sentry:**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Configure Sentry:**

File: `sentry.client.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

### Uptime Monitoring

**UptimeRobot Setup:**

1. Create monitor: `https://ai-born.org/api/health`
2. Monitor type: HTTP(s)
3. Interval: 5 minutes
4. Alert contacts: team@ai-born.org

**Pingdom Setup:**

1. Create uptime check: `https://ai-born.org`
2. Check interval: 1 minute
3. Alert after: 2 consecutive failures
4. Integrations: Slack, PagerDuty

### Log Aggregation

**Logtail (Recommended for Vercel):**

```bash
npm install @logtail/next
```

```typescript
// src/lib/logger.ts
import { Logtail } from '@logtail/next';

export const logger = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN!);

// Usage:
logger.info('Email captured', { email: 'user@example.com' });
logger.error('Email send failed', { error: error.message });
```

### Performance Monitoring

**Vercel Speed Insights:**

Automatically tracks:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to First Byte (TTFB)

**Custom Performance Tracking:**

```typescript
// src/lib/performance.ts
export function reportWebVitals(metric: any) {
  if (metric.label === 'web-vital') {
    // Log to analytics
    window.dataLayer?.push({
      event: 'web_vitals',
      metric_name: metric.name,
      metric_value: metric.value,
      metric_id: metric.id,
    });
  }
}
```

### Alert Configuration

**Critical Alerts (PagerDuty/Opsgenie):**
- Site down >2 minutes
- Error rate >100 errors/hour
- API response time >5s (p95)

**Warning Alerts (Slack):**
- Performance degradation (LCP >3s)
- Email delivery failures >10/hour
- Rate limit exceeded >50/hour
- Storage quota >80%

**Info Alerts (Email):**
- Daily deployment summary
- Weekly performance report
- Monthly analytics summary

---

## Security Checklist

### Pre-Deployment Security Audit

#### Dependency Security

```bash
# Audit dependencies for vulnerabilities
npm audit

# Fix auto-fixable vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated

# Update packages (with caution)
npm update
```

#### Environment Variables

- [ ] No secrets committed to git
- [ ] `.env.local` in `.gitignore`
- [ ] Production API keys rotate quarterly
- [ ] Separate credentials for staging/production
- [ ] Minimal IAM permissions (principle of least privilege)

#### HTTPS & Certificates

- [ ] SSL certificate valid (Let's Encrypt via Vercel)
- [ ] HSTS header enabled (`Strict-Transport-Security`)
- [ ] Force HTTPS redirects
- [ ] Certificate auto-renewal configured

#### Security Headers

Verify in `next.config.ts`:

```typescript
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

#### Input Validation & Sanitization

- [ ] All API endpoints use Zod validation
- [ ] Server-side validation (never trust client)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize user input)
- [ ] File upload validation (type, size, content)
- [ ] Rate limiting on all forms

#### CORS Configuration

```typescript
// src/app/api/*/route.ts
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? ['https://ai-born.org', 'https://www.ai-born.org']
    : ['http://localhost:3000'];

// Validate origin in OPTIONS requests
```

#### Authentication & Authorization

- [ ] No authentication required (public landing page)
- [ ] Admin endpoints (if any) protected
- [ ] API keys stored in environment variables
- [ ] No sensitive data in client-side code

#### Data Privacy

- [ ] GDPR compliance (privacy policy, cookie consent)
- [ ] CCPA compliance (opt-out mechanism)
- [ ] Email addresses encrypted at rest (if stored)
- [ ] PII hashed in analytics (order IDs, company names)
- [ ] Data retention policy documented

#### File Upload Security

- [ ] File type validation (whitelist only)
- [ ] File size limits enforced (5MB max)
- [ ] Virus scanning (if high volume)
- [ ] Uploaded files not executable
- [ ] Storage bucket permissions restrictive

### Security Monitoring

```bash
# Run security scan
npx snyk test

# Check for vulnerable dependencies
npm audit

# Scan for secrets in code
npx secretlint "**/*"
```

### Security Incident Response Plan

1. **Detection:** Monitor logs, Sentry alerts, security scans
2. **Assessment:** Determine severity (critical, high, medium, low)
3. **Containment:** Disable affected feature, rotate credentials
4. **Eradication:** Deploy fix, verify resolution
5. **Recovery:** Restore service, monitor for recurrence
6. **Post-Mortem:** Document incident, update processes

---

## Troubleshooting

### Common Deployment Issues

#### 1. Build Fails with TypeScript Errors

**Symptoms:**
```
Error: Type error: Property 'xyz' does not exist on type 'ABC'
```

**Solution:**
```bash
# Type check locally first
npx tsc --noEmit

# Fix type errors
# Then rebuild
npm run build
```

#### 2. Environment Variables Not Loading

**Symptoms:**
- API calls fail with "undefined API key"
- Features work locally but not in production

**Solution:**
```bash
# Verify environment variables in Vercel
vercel env ls production

# Add missing variables
vercel env add SENDGRID_API_KEY production

# Redeploy
vercel --prod
```

#### 3. Images Not Loading (404)

**Symptoms:**
- Broken image icons on production site
- Images load locally but not in production

**Solution:**
```bash
# Verify images are in /public directory
ls -la public/images/

# Check next.config.ts image domains configuration
# Add domain to remotePatterns if using external images

# Ensure images are committed to git
git add public/images/
git commit -m "Add missing images"
git push
```

#### 4. API Routes Return 500 Errors

**Symptoms:**
- Forms don't submit
- API endpoints return 500 Internal Server Error

**Solution:**
```bash
# Check Vercel function logs
vercel logs --prod

# Check for missing environment variables
# Check for runtime errors in Sentry

# Test API route locally
curl -X POST http://localhost:3000/api/email-capture \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

#### 5. Rate Limiting Not Working

**Symptoms:**
- Users can submit forms unlimited times
- No rate limit errors in logs

**Solution:**
```typescript
// Verify rate limit is enabled in production
// Check src/app/api/email-capture/route.ts

// Ensure environment variable is set
console.log('Rate limit enabled:', !process.env.DEV_DISABLE_RATE_LIMIT);

// Test rate limit locally
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/email-capture \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
done
# Should see 429 error after 10 requests
```

#### 6. Email Delivery Failing

**Symptoms:**
- Form submits successfully but no email received
- "Email sent" message shown but inbox empty

**Solution:**
```bash
# Check email service provider dashboard
# Verify API key is correct
# Check sender email is verified

# Test email service separately
node scripts/test-email.js

# Check logs for email service errors
vercel logs --prod | grep -i "email"

# Verify email templates exist in provider dashboard
```

#### 7. Analytics Not Tracking

**Symptoms:**
- No data in GTM/Google Analytics
- dataLayer events not firing

**Solution:**
```javascript
// Open browser console on production site
console.log(window.dataLayer);
// Should show array with events

// Verify GTM container ID
console.log(process.env.NEXT_PUBLIC_GTM_CONTAINER_ID);

// Test event manually
window.dataLayer.push({
  event: 'test_event',
  test: true,
});

// Check GTM preview mode
// Enable preview → Visit site → Verify events
```

#### 8. Performance Degradation (LCP >3s)

**Symptoms:**
- Lighthouse performance score drops
- Page feels slow to load

**Solution:**
```bash
# Run Lighthouse audit
lighthouse https://ai-born.org --view

# Check for:
# - Unoptimized images (should be WebP)
# - Missing font preloading
# - Large JavaScript bundles
# - Excessive third-party scripts

# Optimize images
npm run optimize-images

# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

#### 9. SSL Certificate Issues

**Symptoms:**
- "Your connection is not private" error
- SSL certificate expired or invalid

**Solution:**
```bash
# Check SSL certificate status
openssl s_client -servername ai-born.org -connect ai-born.org:443

# Verify certificate expiry
echo | openssl s_client -servername ai-born.org -connect ai-born.org:443 2>/dev/null | openssl x509 -noout -dates

# If expired, Vercel should auto-renew
# Force renewal in Vercel dashboard:
# Settings → Domains → Refresh SSL Certificate
```

#### 10. CORS Errors

**Symptoms:**
```
Access to fetch at 'https://api.ai-born.org/email-capture' from origin 'https://ai-born.org' has been blocked by CORS policy
```

**Solution:**
```typescript
// Update CORS configuration in API route
// src/app/api/email-capture/route.ts

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://ai-born.org',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
# In .env.local
DEBUG=true
NEXT_PUBLIC_DEBUG=true
LOG_LEVEL=debug

# Restart development server
npm run dev
```

### Support Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **Vercel Status Page:** https://vercel-status.com
- **Vercel Support:** support@vercel.com
- **Project GitHub Issues:** https://github.com/yourusername/ai-born-website/issues

---

## Performance Requirements

### Performance Budgets

| Metric | Target | Maximum |
|--------|--------|---------|
| LCP (Largest Contentful Paint) | ≤2.0s | ≤2.5s |
| FID (First Input Delay) | ≤100ms | ≤300ms |
| CLS (Cumulative Layout Shift) | ≤0.05 | ≤0.1 |
| TBT (Total Blocking Time) | ≤150ms | ≤300ms |
| TTFB (Time to First Byte) | ≤600ms | ≤800ms |
| Lighthouse Performance Score | ≥95 | ≥90 |

### Optimization Checklist

#### Images
- [ ] All images optimized (WebP format)
- [ ] Responsive srcsets for all images
- [ ] Hero image preloaded
- [ ] Below-fold images lazy loaded
- [ ] Image dimensions specified (prevent CLS)

#### Fonts
- [ ] Critical fonts preloaded
- [ ] `font-display: swap` for web fonts
- [ ] Font subsetting applied (only needed characters)

#### JavaScript
- [ ] Code splitting implemented
- [ ] Dynamic imports for large components
- [ ] Tree shaking enabled
- [ ] Third-party scripts lazy loaded

#### CSS
- [ ] Critical CSS inlined
- [ ] Unused CSS removed
- [ ] Tailwind CSS purged in production

#### Caching
- [ ] Static assets cached (1 year)
- [ ] API responses cached appropriately
- [ ] CDN edge caching enabled

### Performance Monitoring

```bash
# Weekly performance audit
lighthouse https://ai-born.org \
  --output html \
  --output-path ./reports/lighthouse-$(date +%Y%m%d).html

# Monitor Core Web Vitals
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://ai-born.org"
```

---

## Appendix

### A. Useful Commands Reference

```bash
# Development
npm run dev              # Start development server
npm run build            # Create production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run format           # Format code with Prettier

# Vercel CLI
vercel                   # Deploy to preview
vercel --prod            # Deploy to production
vercel env ls            # List environment variables
vercel env add           # Add environment variable
vercel logs              # View function logs
vercel domains ls        # List domains
vercel rollback          # Rollback deployment

# Database (Prisma)
npx prisma migrate dev   # Create migration
npx prisma migrate deploy # Apply migrations
npx prisma studio        # Open database GUI
npx prisma generate      # Generate Prisma client

# Testing
lighthouse <url>         # Performance audit
axe <url>                # Accessibility audit
npm audit                # Security audit
```

### B. Environment Variable Template

Create `.env.example` for team reference:

```bash
# Copy this file to .env.local and fill in actual values

# Core
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email Service (choose one)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-api-key-here
SENDGRID_FROM_EMAIL=noreply@ai-born.org

# Storage (choose one)
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your-key-here
AWS_SECRET_ACCESS_KEY=your-secret-here
AWS_S3_BUCKET_NAME=ai-born-assets

# Analytics
NEXT_PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX

# Optional: Database
# DATABASE_URL=postgresql://...

# Development only
DEV_SKIP_EMAIL_SEND=true
DEV_DISABLE_RATE_LIMIT=true
```

### C. Contact Information

**Technical Support:**
- Email: dev@ai-born.org
- Slack: #ai-born-tech

**Deployment Approvals:**
- Product Owner: [name@ai-born.org]
- Technical Lead: [name@ai-born.org]

**Emergency Contacts:**
- On-call Engineer: [phone]
- Vercel Support: support@vercel.com

---

**Document Version:** 1.0
**Last Updated:** 18 October 2025
**Next Review Date:** 18 November 2025
**Maintained By:** Technical Team
