# AI-Born Authentication Deployment Checklist

**Use this checklist to ensure a smooth production deployment.**

---

## Pre-Deployment (Critical - Must Complete)

### 1. Fix Code Issues ⚠️

```bash
# Fix TypeScript compilation errors
npx tsc --noEmit

# Expected errors to fix:
# - auth.config.ts:321 (createdAt type assertion)
# - admin API routes (add await to checkAdminAuth)
# - user/preferences/route.ts (regenerate Prisma client)
# - app/api/user/delete/route.ts (implement or remove email function)
# - app/api/send-magic-link/route.ts (fix logger error property)
# - welcome-content.tsx (fix Framer Motion ease values)
```

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

---

### 2. Database Setup 🗄️

```bash
# Step 1: Generate Prisma client
npm run db:generate

# Step 2: Create initial migration
npx prisma migrate dev --name init

# Step 3: Verify schema
npm run db:verify

# Step 4: (Optional) Seed test data
npm run db:seed
```

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

**Production Database URL:**
```
DATABASE_URL=postgresql://user:pass@host:5432/aiborn_prod?sslmode=require
```

---

### 3. Environment Variables 🔑

Copy this template to your hosting provider (Vercel, etc.):

```bash
# ============================================================================
# CRITICAL - Required for app to start
# ============================================================================

# Generate this secret
NEXTAUTH_SECRET=__GENERATE_WITH_openssl_rand_-base64_32__

# Production URL
NEXTAUTH_URL=https://ai-born.org

# Database (Vercel Postgres, Supabase, Neon, etc.)
DATABASE_URL=postgresql://user:pass@host:5432/aiborn_prod?sslmode=require

# Email (Resend)
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EMAIL_FROM=AI-Born <excerpt@ai-born.org>
EMAIL_REPLY_TO=hello@ai-born.org
EMAIL_PR_TEAM=press@micpress.com

# ============================================================================
# IMPORTANT - Recommended for production
# ============================================================================

# Admin Access (comma-separated)
ADMIN_EMAILS=admin@micpress.com,mehran@adaptic.ai

# Rate Limiting (Upstash Redis - prevents abuse across serverless instances)
UPSTASH_REDIS_REST_URL=https://YOUR_INSTANCE.upstash.io
UPSTASH_REDIS_REST_TOKEN=YOUR_REDIS_TOKEN

# File Storage (Cloudflare R2 - recommended, zero egress fees)
R2_BUCKET=ai-born-assets
R2_ACCOUNT_ID=YOUR_CLOUDFLARE_ACCOUNT_ID
R2_ACCESS_KEY_ID=YOUR_R2_KEY
R2_SECRET_ACCESS_KEY=YOUR_R2_SECRET
R2_PUBLIC_URL=https://assets.ai-born.org

# Analytics (Google Tag Manager)
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Error Tracking (Sentry)
NEXT_PUBLIC_SENTRY_DSN=https://KEY@ORG.ingest.sentry.io/PROJECT
SENTRY_AUTH_TOKEN=sntrys_YOUR_AUTH_TOKEN
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=ai-born

# ============================================================================
# OPTIONAL - OAuth Providers
# ============================================================================

# Google OAuth (optional)
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET

# GitHub OAuth (optional)
GITHUB_ID=YOUR_GITHUB_CLIENT_ID
GITHUB_SECRET=YOUR_GITHUB_CLIENT_SECRET

# ============================================================================
# OPTIONAL - Advanced Features
# ============================================================================

# Receipt OCR (Anthropic Claude)
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY

# Performance Dashboard
ADMIN_API_KEY=__GENERATE_WITH_openssl_rand_-base64_32__

# Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
```

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

---

### 4. OAuth Provider Setup 🔐

#### Google OAuth
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Authorized redirect URIs:
   - `https://ai-born.org/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for testing)
4. Copy Client ID and Secret to env vars

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

#### GitHub OAuth
1. Go to https://github.com/settings/developers
2. Create new OAuth App
3. Authorization callback URL:
   - `https://ai-born.org/api/auth/callback/github`
4. Copy Client ID and Secret to env vars

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

---

### 5. Email Service (Resend) 📧

1. Sign up at https://resend.com
2. Add domain: `ai-born.org`
3. Verify domain (add DNS records):
   - SPF: `v=spf1 include:_spf.resend.com ~all`
   - DKIM: (provided by Resend)
   - DMARC: `v=DMARC1; p=quarantine; rua=mailto:dmarc@ai-born.org`
4. Create API key
5. Add to environment variables

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

**Test email sending:**
```bash
# Use Resend dashboard "Send Test Email" feature
# Or test via API route after deployment
curl -X POST https://ai-born.org/api/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

### 6. Rate Limiting (Upstash Redis) 🚦

1. Sign up at https://console.upstash.com
2. Create Redis database (Free tier: 10K commands/day)
3. Copy REST URL and token
4. Add to environment variables

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

**Why required:** In-memory rate limiting won't work across serverless instances. Without Redis, users can bypass limits by hitting different instances.

---

### 7. File Storage (Cloudflare R2) 📦

1. Sign up at https://dash.cloudflare.com/r2
2. Create R2 bucket: `ai-born-assets`
3. Create API token with R2 permissions
4. Configure CORS:
   ```json
   [
     {
       "AllowedOrigins": ["https://ai-born.org"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```
5. Add credentials to environment variables

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

**Alternative:** AWS S3 (see `.env.example` for S3 configuration)

---

## Pre-Deployment (Recommended)

### 8. Error Tracking (Sentry) 🐛

1. Create account at https://sentry.io
2. Create new project: "AI-Born Landing Page"
3. Copy DSN (safe to expose client-side)
4. Create auth token for source map uploads
   - Scopes: `project:releases`, `project:write`
5. Add to environment variables

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

---

### 9. Analytics (Google Tag Manager) 📊

1. Create account at https://tagmanager.google.com
2. Create container: "AI-Born Landing Page"
3. Copy GTM ID (format: `GTM-XXXXXXX`)
4. Configure tags:
   - Google Analytics 4
   - Conversion tracking
   - Custom events (sign-in, sign-out, pre-order)
5. Set up consent mode (cookie consent integration)

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

---

### 10. Create Missing Pages 📄

#### Unauthorized Page
Create: `/Users/iroselli/ai-born-website/src/app/unauthorized/page.tsx`

```tsx
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-obsidian">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-brand-porcelain mb-4">
          Access Denied
        </h1>
        <p className="text-brand-porcelain/70 mb-8">
          You don't have permission to access this page.
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-brand-cyan text-brand-obsidian rounded-lg hover:opacity-90"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}
```

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

---

### 11. Build & Test Locally 🧪

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run type check
npx tsc --noEmit

# Build for production
npm run build

# Start production server locally
npm start

# Run tests
npm run test
npm run test:e2e
```

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

**Check for:**
- ✅ No TypeScript errors
- ✅ No build errors
- ✅ App starts without crashes
- ✅ Can sign in with email
- ✅ Can sign in with OAuth (if configured)
- ✅ Protected routes redirect correctly
- ✅ Admin routes work for admin users

---

## Deployment

### 12. Deploy to Vercel (or hosting provider) 🚀

#### Vercel Deployment

1. **Connect GitHub Repository**
   ```bash
   # Push code to GitHub
   git add .
   git commit -m "Production-ready authentication system"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to https://vercel.com/new
   - Import `ai-born-website` repository
   - Select framework: Next.js

3. **Configure Environment Variables**
   - Copy all variables from section 3 above
   - Paste into Vercel project settings
   - **Important:** Use production values (not localhost)

4. **Database Setup**
   - Option A: Vercel Postgres
     ```bash
     # In Vercel dashboard, add Vercel Postgres
     # It will auto-populate DATABASE_URL
     ```
   - Option B: External (Supabase, Neon, etc.)
     ```bash
     # Manually set DATABASE_URL in env vars
     DATABASE_URL=postgresql://...
     ```

5. **Deploy**
   ```bash
   # Vercel will automatically build and deploy
   # Watch build logs for errors
   ```

6. **Run Migrations**
   ```bash
   # After first deployment, run migrations
   # Option A: Via Vercel CLI
   vercel env pull .env.local
   npm run db:migrate

   # Option B: Use build command
   # Add to package.json:
   "vercel-build": "prisma migrate deploy && next build"
   ```

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

**Deployment URL:** https://ai-born.org

---

## Post-Deployment

### 13. Smoke Tests 🧪

Test all critical flows in production:

#### Authentication
- [ ] Sign up with email (magic link)
- [ ] Sign in with Google OAuth
- [ ] Sign in with GitHub OAuth
- [ ] Sign out
- [ ] Session persists across refreshes
- [ ] Protected route redirects work

#### Database
- [ ] User created in database on first sign-in
- [ ] Entitlements are queryable
- [ ] Account page loads user data

#### Admin
- [ ] Admin user can access `/admin/codes`
- [ ] Non-admin user gets "Access Denied"

#### Email
- [ ] Magic link email received (check spam folder)
- [ ] Email template looks professional
- [ ] Links work and sign user in

#### File Upload (if configured)
- [ ] Receipt upload creates file in R2/S3
- [ ] File is retrievable via URL

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

---

### 14. Monitoring Setup 📡

1. **Sentry Alerts**
   - Set up Slack/email notifications
   - Configure alert rules:
     - Error rate > 1% (15 min window)
     - New issue detected
     - Performance degradation (P95 > 2s)

2. **Vercel Analytics**
   - Enable Web Analytics in Vercel dashboard
   - Monitor Core Web Vitals (LCP, FID, CLS)

3. **Google Tag Manager**
   - Verify events are firing:
     - `sign_in`
     - `sign_out`
     - `sign_up`
     - `auth_error`
   - Check in GTM debug mode

4. **Database Monitoring**
   - Set up slow query alerts (if supported by provider)
   - Monitor connection pool usage

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

---

### 15. Security Audit 🔒

- [ ] HTTPS enforced (no HTTP access)
- [ ] CSP headers present in response
- [ ] Rate limiting active (test with 100+ requests)
- [ ] Secure cookies set (check browser DevTools)
- [ ] Admin routes protected
- [ ] No secrets in client-side code
- [ ] File upload validation working
- [ ] SQL injection protection (Prisma handles this)

**Tools:**
```bash
# Security headers check
curl -I https://ai-born.org

# SSL/TLS check
https://www.ssllabs.com/ssltest/analyze.html?d=ai-born.org

# OWASP ZAP scan (optional)
```

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

---

### 16. Performance Audit ⚡

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --collect.url=https://ai-born.org

# Target scores:
# Performance: ≥95
# Accessibility: ≥95
# Best Practices: ≥95
# SEO: ≥95
```

**Check:**
- [ ] LCP < 2.0s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Time to Interactive < 3.0s

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

---

### 17. Backup & Recovery Plan 💾

1. **Database Backups**
   - Verify automated backups enabled (Vercel Postgres auto-backs up)
   - Test restore procedure
   - Document recovery steps

2. **Environment Variables Backup**
   ```bash
   # Export from Vercel
   vercel env pull .env.production.backup

   # Store securely (1Password, AWS Secrets Manager, etc.)
   ```

3. **Code Backup**
   - Ensure GitHub repository is private
   - Enable branch protection on `main`
   - Tag production releases:
     ```bash
     git tag -a v1.0.0 -m "Production release"
     git push origin v1.0.0
     ```

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

---

## Launch Day

### 18. Pre-Launch Checklist ✈️

**1 Hour Before:**
- [ ] All team members have admin access
- [ ] Monitoring dashboards open and visible
- [ ] Support email inbox monitored
- [ ] Rollback plan documented
- [ ] Incident response plan ready

**Launch:**
- [ ] Remove any "staging" or "beta" banners
- [ ] Update DNS if needed (ai-born.org → Vercel)
- [ ] Announce to team
- [ ] Monitor error rates for first hour

**First 24 Hours:**
- [ ] Watch Sentry for errors
- [ ] Check sign-up conversion rate
- [ ] Monitor database performance
- [ ] Review authentication success rate
- [ ] Check email delivery rate (Resend dashboard)

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

---

### 19. Rollback Plan 🔄

If critical issues arise:

```bash
# Option 1: Revert deployment in Vercel
# Go to Vercel dashboard → Deployments → Previous deployment → "Promote to Production"

# Option 2: Revert git commit
git revert HEAD
git push origin main
# Vercel will auto-deploy previous version

# Option 3: Disable authentication
# In Vercel dashboard, set:
MAINTENANCE_MODE=true
# Update middleware.ts to show maintenance page
```

**Rollback Triggers:**
- Error rate > 5%
- Database connection failures
- Authentication completely broken
- Security vulnerability discovered

**Status:** Documented ✅

---

## Post-Launch (First Week)

### 20. Monitor & Optimize 📈

**Daily Checks:**
- [ ] Review Sentry errors
- [ ] Check authentication success rate
- [ ] Monitor database query performance
- [ ] Review email delivery rate
- [ ] Check rate limiting effectiveness

**Weekly Reviews:**
- [ ] Analyze sign-up sources (OAuth vs email)
- [ ] Review most common auth errors
- [ ] Check admin action logs
- [ ] Performance metrics (LCP, FID, CLS)
- [ ] User feedback on authentication experience

**Status:** ❌ Not started | ⏳ In progress | ✅ Complete

---

## Completion Summary

### Critical (Must Complete Before Launch)
- [ ] 1. Fix TypeScript errors
- [ ] 2. Database setup & migrations
- [ ] 3. Environment variables configured
- [ ] 4. OAuth providers set up
- [ ] 5. Email service configured
- [ ] 6. Rate limiting (Upstash Redis)
- [ ] 7. File storage (R2/S3)

### Recommended (Before Launch)
- [ ] 8. Error tracking (Sentry)
- [ ] 9. Analytics (GTM)
- [ ] 10. Create unauthorized page
- [ ] 11. Build & test locally

### Deployment
- [ ] 12. Deploy to Vercel/hosting
- [ ] 13. Smoke tests in production
- [ ] 14. Monitoring setup
- [ ] 15. Security audit
- [ ] 16. Performance audit
- [ ] 17. Backup & recovery plan

### Launch Day
- [ ] 18. Pre-launch checklist
- [ ] 19. Rollback plan ready
- [ ] 20. Monitor & optimize

---

## Support

**Questions or Issues?**
- Review: `/Users/iroselli/ai-born-website/FINAL_CODE_REVIEW_REPORT.md`
- Documentation: `/Users/iroselli/ai-born-website/docs/`
- Quick Start: `/Users/iroselli/ai-born-website/AUTH_QUICK_START.md`

**Emergency Contacts:**
- Technical Lead: [email]
- DevOps: [email]
- Security: [email]

---

**Last Updated:** 2025-10-19
**Next Review:** After production deployment
