# Authentication Documentation

**AI-Born Landing Page Authentication System**
**Version:** 1.0
**Date:** October 19, 2025
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Environment Setup](#environment-setup)
4. [Database Schema](#database-schema)
5. [User Flows](#user-flows)
6. [Protected Routes](#protected-routes)
7. [Entitlements System](#entitlements-system)
8. [Admin Authentication](#admin-authentication)
9. [API Authentication](#api-authentication)
10. [Testing Locally](#testing-locally)
11. [Troubleshooting](#troubleshooting)
12. [Security Best Practices](#security-best-practices)
13. [GDPR/CCPA Compliance](#gdpr-ccpa-compliance)

---

## Overview

### Technology Stack

The AI-Born authentication system is built on **NextAuth v5** (Auth.js) with the following key technologies:

- **Framework:** Next.js 14+ (App Router)
- **Auth Library:** NextAuth v5 (beta)
- **Database:** PostgreSQL via Prisma ORM
- **Adapter:** @auth/prisma-adapter
- **Session Strategy:** JWT with database persistence
- **Email Service:** Resend (for magic links)

### Authentication Methods

The system supports three authentication methods:

1. **Google OAuth 2.0** - Social sign-in via Google account
2. **GitHub OAuth 2.0** - Social sign-in via GitHub account
3. **Email Magic Links** - Passwordless authentication via Resend

### Key Features

- **JWT Sessions** - Fast, stateless session management
- **Database Persistence** - User data stored in PostgreSQL
- **Protected Routes** - Middleware-based route protection
- **Entitlements System** - Granular permission control
- **Admin Authorization** - Role-based access control
- **GDPR/CCPA Compliant** - Built-in privacy controls
- **Security Hardened** - CSP, CSRF, rate limiting

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Auth Pages  │  │  Components  │  │  Protected Routes    │  │
│  │  /auth/*     │  │  SessionProv │  │  /account, /admin    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
└─────────┼──────────────────┼─────────────────────┼──────────────┘
          │                  │                     │
          │                  │                     │
          ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js Server                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Middleware                           │  │
│  │  - Route protection                                      │  │
│  │  - Session validation                                    │  │
│  │  - Admin authorization                                   │  │
│  │  - Security headers (CSP, HSTS, etc.)                   │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │                                             │
│  ┌────────────────▼──────────────────────────────────────────┐ │
│  │              NextAuth v5 Core                            │ │
│  │  /api/auth/[...nextauth]/route.ts                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │ │
│  │  │  Providers  │  │  Callbacks  │  │     Events      │  │ │
│  │  │  - Google   │  │  - JWT      │  │  - signIn       │  │ │
│  │  │  - GitHub   │  │  - Session  │  │  - signOut      │  │ │
│  │  │  - Email    │  │  - Redirect │  │  - createUser   │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │ │
│  └────────────────┬──────────────────────────────────────────┘ │
│                   │                                             │
│  ┌────────────────▼──────────────────────────────────────────┐ │
│  │              Auth Helpers (/src/lib/auth.ts)             │ │
│  │  - getCurrentUser()                                       │ │
│  │  - requireAuth()                                          │ │
│  │  - hasEntitlement()                                       │ │
│  │  - getUserEntitlements()                                  │ │
│  └────────────────┬──────────────────────────────────────────┘ │
└───────────────────┼──────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                            │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │   Users    │  │ Entitlements │  │  Receipts & Claims  │    │
│  │  - id      │  │  - userId    │  │  - userId           │    │
│  │  - email   │  │  - type      │  │  - status           │    │
│  │  - name    │  │  - status    │  │  - verifiedAt       │    │
│  └────────────┘  └──────────────┘  └─────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

External Services:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    Google    │  │    GitHub    │  │    Resend    │
│    OAuth     │  │    OAuth     │  │   (Email)    │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Request Flow

#### Sign-In Flow

1. **User visits `/auth/signin`**
   - Displays authentication options (Google, GitHub, Email)

2. **User selects provider**
   - OAuth: Redirects to provider (Google/GitHub)
   - Email: Displays email input form

3. **Authentication occurs**
   - OAuth: Provider verifies and returns to callback URL
   - Email: Magic link sent via Resend

4. **NextAuth processes authentication**
   - Validates credentials/token
   - Creates or updates user in database
   - Generates JWT session token

5. **User redirected to destination**
   - Default: `/` (homepage)
   - Or: Original `callbackUrl` if provided

#### Protected Route Access

1. **User requests protected route** (e.g., `/account`)

2. **Middleware intercepts request**
   - Checks if route is protected via `isProtectedRoute()`
   - Extracts JWT token from cookies

3. **Session validation**
   - Verifies JWT signature and expiry
   - Decodes user information

4. **Authorization check**
   - For admin routes: Verifies email in `ADMIN_EMAILS`
   - For user routes: Confirms valid session

5. **Response**
   - **Authorized**: Proceeds to page
   - **Unauthorized**: Redirects to `/auth/signin?callbackUrl=/account`

---

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# ============================================================================
# Core Configuration
# ============================================================================

# Site URL (required for OAuth callbacks)
NEXT_PUBLIC_SITE_URL=https://ai-born.org
NEXTAUTH_URL=https://ai-born.org  # Or http://localhost:3000 for dev

# NextAuth Secret (REQUIRED - minimum 32 characters)
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-key-here-minimum-32-characters

# ============================================================================
# Database (PostgreSQL)
# ============================================================================

# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

# ============================================================================
# Authentication Providers
# ============================================================================

# Google OAuth (optional)
# Get from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (optional)
# Get from: https://github.com/settings/developers
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Email Provider (Resend - for magic links)
# Get from: https://resend.com/api-keys
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=AI-Born <auth@ai-born.org>

# ============================================================================
# Admin Access
# ============================================================================

# Comma-separated list of admin email addresses
ADMIN_EMAILS=admin@example.com,support@example.com

# Admin API token (for admin endpoints)
# Generate with: openssl rand -base64 32
ADMIN_API_TOKEN=your-secure-admin-token-here
```

### OAuth Provider Setup

#### Google OAuth Setup

1. **Create Google Cloud Project**
   - Visit: https://console.cloud.google.com/
   - Create new project or select existing

2. **Enable Google+ API**
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth Credentials**
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://ai-born.org/api/auth/callback/google` (production)

4. **Copy Credentials**
   - Copy Client ID → `GOOGLE_CLIENT_ID`
   - Copy Client Secret → `GOOGLE_CLIENT_SECRET`

#### GitHub OAuth Setup

1. **Register OAuth App**
   - Visit: https://github.com/settings/developers
   - Click "New OAuth App"

2. **Configure Application**
   - Application name: "AI-Born"
   - Homepage URL: `https://ai-born.org`
   - Authorization callback URL:
     - `http://localhost:3000/api/auth/callback/github` (development)
     - `https://ai-born.org/api/auth/callback/github` (production)

3. **Generate Client Secret**
   - Click "Generate a new client secret"
   - Copy Client ID → `GITHUB_ID`
   - Copy Client Secret → `GITHUB_SECRET`

#### Resend Email Setup

1. **Create Resend Account**
   - Visit: https://resend.com/signup

2. **Generate API Key**
   - Navigate to "API Keys"
   - Click "Create API Key"
   - Copy key → `RESEND_API_KEY`

3. **Verify Domain** (for production)
   - Add domain: `ai-born.org`
   - Add DNS records as instructed
   - Verify domain ownership

---

## Database Schema

### NextAuth Tables

NextAuth uses the Prisma adapter which requires specific tables. These are automatically created when you run migrations.

#### User Table

```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  emailVerified DateTime?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  // User preferences
  preferences   Json?

  // Relations
  entitlements  Entitlement[]
  receipts      Receipt[]
  bonusClaims   BonusClaim[]
  orgMemberships OrgMember[]

  @@index([email])
  @@map("users")
}
```

**Fields:**
- `id` - Unique user identifier (CUID)
- `email` - User's email address (unique)
- `name` - Display name (optional)
- `emailVerified` - Email verification timestamp
- `preferences` - JSON blob for user settings
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

#### Entitlements Table

```prisma
enum EntitlementType {
  EARLY_EXCERPT    // Free excerpt access
  BONUS_PACK       // Agent Charter Pack
  ENHANCED_BONUS   // VIP bonus pack (enhanced)
  LAUNCH_EVENT     // Launch event access
  PRIORITY_SUPPORT // Priority customer support
  BULK_DISCOUNT    // Corporate bulk discount
}

enum EntitlementStatus {
  PENDING
  ACTIVE
  FULFILLED
  EXPIRED
  REVOKED
}

model Entitlement {
  id          String             @id @default(cuid())
  userId      String
  codeId      String?
  type        EntitlementType
  status      EntitlementStatus  @default(PENDING)

  // Fulfillment
  fulfilledAt DateTime?
  expiresAt   DateTime?

  // Metadata
  metadata    Json?

  // Tracking
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  // Relations
  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  code        Code?              @relation(fields: [codeId], references: [id])

  @@index([userId])
  @@index([type])
  @@index([status])
  @@map("entitlements")
}
```

#### Receipts Table (for pre-order verification)

```prisma
enum ReceiptStatus {
  PENDING    // Uploaded, awaiting verification
  VERIFIED   // Confirmed valid
  REJECTED   // Invalid or fraudulent
  DUPLICATE  // Already claimed
}

model Receipt {
  id              String         @id @default(cuid())
  userId          String

  // Purchase details
  retailer        String
  orderNumber     String?
  purchaseDate    DateTime?
  format          String?

  // Verification
  status          ReceiptStatus  @default(PENDING)
  verifiedAt      DateTime?
  verifiedBy      String?
  rejectionReason String?

  // File storage
  fileUrl         String
  fileHash        String

  // Tracking
  ipAddress       String?
  userAgent       String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  // Relations
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  bonusClaim      BonusClaim?

  @@unique([fileHash])
  @@index([userId])
  @@index([status])
  @@map("receipts")
}
```

### Running Migrations

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Apply migrations to production
npx prisma migrate deploy

# View database in Prisma Studio
npx prisma studio
```

---

## User Flows

### Sign-Up Flow (New User)

```
1. User visits site
   └─> Clicks "Get Free Excerpt" or "Sign In"

2. Redirected to /auth/signin
   └─> Displays authentication options

3. User selects provider:

   ┌─ Google OAuth ────────────────────┐
   │ → Redirects to Google consent     │
   │ → User approves                   │
   │ → Returns to /api/auth/callback   │
   └───────────────────────────────────┘

   ┌─ GitHub OAuth ────────────────────┐
   │ → Redirects to GitHub consent     │
   │ → User approves                   │
   │ → Returns to /api/auth/callback   │
   └───────────────────────────────────┘

   ┌─ Email Magic Link ────────────────┐
   │ → User enters email               │
   │ → System sends magic link         │
   │ → User clicks link in email       │
   │ → Token validated, session created│
   └───────────────────────────────────┘

4. NextAuth processes authentication:
   - Creates User record in database
   - Triggers 'createUser' event
   - Triggers 'signIn' event (isNewUser: true)
   - Generates JWT session token
   - Sets secure session cookie

5. User redirected to /welcome (new user flow)
   - Welcome message displayed
   - Optional: Onboarding steps
   - Optional: Profile completion

6. Session established
   - User can access protected routes
   - Session persists for 30 days
```

### Sign-In Flow (Returning User)

```
1. User visits /auth/signin
   └─> Or clicks "Sign In" button

2. User selects authentication method
   └─> Process same as sign-up (see above)

3. NextAuth processes authentication:
   - Finds existing User record by email
   - Triggers 'signIn' event (isNewUser: false)
   - Updates 'lastLogin' timestamp (if tracked)
   - Generates new JWT session token
   - Sets secure session cookie

4. User redirected to callbackUrl or homepage
   - Default: / (homepage)
   - Or: Original requested URL

5. Session active
   - Access to account, downloads, etc.
```

### Sign-Out Flow

```
1. User clicks "Sign Out" button
   └─> Triggers signOut() function

2. NextAuth processes sign-out:
   - Triggers 'signOut' event
   - Invalidates JWT token
   - Clears session cookie
   - Optional: Logs sign-out event

3. User redirected to homepage
   └─> Session terminated
   └─> Protected routes now inaccessible
```

### Email Verification (Magic Link)

```
1. User enters email on /auth/signin
   └─> Clicks "Send Magic Link"

2. Server generates verification token:
   - Creates unique token linked to email
   - Token expires in 24 hours
   - Stored in database (verification_tokens table)

3. Resend sends email:
   - Professional HTML template
   - Brand-styled with AI-Born colours
   - Contains magic link: /api/auth/callback/email?token=...
   - Includes plain text fallback

4. User receives email:
   - Subject: "Sign in to AI-Born"
   - Clicks magic link button

5. Token validation:
   - Verifies token signature
   - Checks expiration (24 hours)
   - Ensures not already used
   - Validates email match

6. Session creation:
   - Creates or updates User record
   - Sets emailVerified timestamp
   - Generates session JWT
   - Redirects to destination

Error cases:
- Expired token → Show error, offer to resend
- Invalid token → Redirect to /auth/error
- Already used → Redirect to /auth/signin
```

### Password Reset (Future)

Currently, the system uses **passwordless authentication only**. There are no passwords to reset. If password-based authentication is added in the future:

```
1. Add CredentialsProvider to NextAuth config
2. Implement password hashing (bcrypt/argon2)
3. Create password reset flow:
   - Generate reset token
   - Send reset email
   - Validate token
   - Update password
   - Invalidate token
```

---

## Protected Routes

### Route Protection Mechanism

The authentication system uses **middleware-based route protection** to secure routes before they're rendered.

### Configuration

Protected routes are defined in `/src/lib/auth.ts`:

```typescript
/**
 * Check if a route requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/account",
    "/settings",
    "/bonus-claim",
    "/downloads",
    "/admin",  // Also requires admin privileges
  ];

  return protectedPaths.some((path) => pathname.startsWith(path));
}

/**
 * Check if a route requires admin privileges
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}
```

### Middleware Implementation

The middleware in `/src/middleware.ts` enforces route protection:

```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  if (isProtectedRoute(pathname)) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Redirect to sign-in if not authenticated
    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Additional check for admin routes
    if (isAdminRoute(pathname)) {
      const userEmail = token.email as string | undefined;

      if (!userEmail || !isAdminEmail(userEmail)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  return NextResponse.next();
}
```

### Adding New Protected Routes

To protect a new route:

1. **Add to protected paths list** in `/src/lib/auth.ts`:

```typescript
export function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/account",
    "/settings",
    "/bonus-claim",
    "/downloads",
    "/admin",
    "/my-new-route",  // ← Add your route here
  ];

  return protectedPaths.some((path) => pathname.startsWith(path));
}
```

2. **Use `requireAuth()` in page component** (Server Component):

```typescript
// /src/app/my-new-route/page.tsx
import { requireAuth } from '@/lib/auth';

export default async function MyProtectedPage() {
  // This will redirect to /auth/signin if not authenticated
  const user = await requireAuth();

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>This page is protected</p>
    </div>
  );
}
```

3. **For Client Components**, use session check:

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function MyProtectedClientPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/auth/signin?callbackUrl=/my-new-route');
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
    </div>
  );
}
```

### Public vs Protected Routes

| Route Pattern | Protection | Notes |
|--------------|-----------|-------|
| `/` | Public | Homepage |
| `/about` | Public | Static content |
| `/pricing` | Public | Static content |
| `/faq` | Public | Static content |
| `/auth/*` | Public | Auth pages |
| `/account` | Protected | User account |
| `/settings` | Protected | User settings |
| `/downloads` | Protected | Bonus content |
| `/bonus-claim` | Protected | Receipt upload |
| `/admin/*` | Admin Only | Admin dashboard |
| `/api/auth/*` | Public | NextAuth endpoints |
| `/api/account/*` | Protected | Account APIs |
| `/api/admin/*` | Admin Only | Admin APIs |

---

## Entitlements System

### Overview

The **Entitlements System** manages user permissions and access rights to premium content and features. It provides granular control over what users can access based on their actions (pre-orders, email sign-ups, VIP codes, etc.).

### Entitlement Types

```typescript
enum EntitlementType {
  EARLY_EXCERPT    // Free excerpt access (email gate)
  BONUS_PACK       // Agent Charter Pack (pre-order bonus)
  ENHANCED_BONUS   // VIP bonus pack (special promotions)
  LAUNCH_EVENT     // Launch event access
  PRIORITY_SUPPORT // Priority customer support
  BULK_DISCOUNT    // Corporate bulk discount
}
```

### Entitlement Status

```typescript
enum EntitlementStatus {
  PENDING    // Entitlement created, not yet active
  ACTIVE     // User can access the benefit
  FULFILLED  // Benefit delivered (e.g., download completed)
  EXPIRED    // Time-limited entitlement expired
  REVOKED    // Manually revoked (fraud, violation)
}
```

### Checking Entitlements

#### Server-Side (Recommended)

```typescript
import { hasEntitlement } from '@/lib/auth';

export default async function BonusPage() {
  // Check if user has Agent Charter Pack entitlement
  const hasPack = await hasEntitlement('agentCharterPack');

  if (!hasPack) {
    return (
      <div>
        <h1>Pre-order Required</h1>
        <p>Upload a receipt to unlock the Agent Charter Pack.</p>
        <a href="/bonus-claim">Claim Bonus</a>
      </div>
    );
  }

  return (
    <div>
      <h1>Download Agent Charter Pack</h1>
      <DownloadButton />
    </div>
  );
}
```

#### Get All User Entitlements

```typescript
import { requireAuth, getUserEntitlements } from '@/lib/auth';

export default async function BenefitsPage() {
  const user = await requireAuth();
  const entitlements = await getUserEntitlements(user.id);

  return (
    <div>
      <h1>Your Benefits</h1>
      <ul>
        <li>Free Excerpt: {entitlements.hasExcerpt ? '✓' : '✗'}</li>
        <li>Pre-order: {entitlements.hasPreordered ? '✓' : '✗'}</li>
        <li>Agent Charter Pack: {entitlements.hasAgentCharterPack ? '✓' : '✗'}</li>
      </ul>
    </div>
  );
}
```

### Granting Entitlements

#### Manual Grant (Admin)

```typescript
import { prisma } from '@/lib/prisma';

// Grant excerpt access to user
async function grantExcerptAccess(userId: string) {
  await prisma.entitlement.create({
    data: {
      userId,
      type: 'EARLY_EXCERPT',
      status: 'ACTIVE',
    },
  });
}
```

#### Automatic Grant (Receipt Verification)

```typescript
// After receipt verification
async function processVerifiedReceipt(receiptId: string, userId: string) {
  // Grant bonus pack entitlement
  await prisma.entitlement.create({
    data: {
      userId,
      type: 'BONUS_PACK',
      status: 'ACTIVE',
    },
  });

  // Create bonus claim record
  await prisma.bonusClaim.create({
    data: {
      userId,
      receiptId,
      status: 'DELIVERED',
      deliveryEmail: user.email,
      deliveredAt: new Date(),
    },
  });
}
```

#### VIP Code Redemption

```typescript
// When user redeems VIP code
async function redeemVipCode(code: string, userId: string) {
  const vipCode = await prisma.code.findUnique({
    where: { code },
  });

  if (!vipCode || vipCode.status !== 'ACTIVE') {
    throw new Error('Invalid or expired code');
  }

  // Grant entitlement based on code type
  const entitlementType = getEntitlementForCodeType(vipCode.type);

  await prisma.entitlement.create({
    data: {
      userId,
      codeId: vipCode.id,
      type: entitlementType,
      status: 'ACTIVE',
    },
  });

  // Update code redemption count
  await prisma.code.update({
    where: { id: vipCode.id },
    data: {
      redemptionCount: { increment: 1 },
    },
  });
}
```

### Resource Access Control

Use the `canAccessResource()` helper for fine-grained access control:

```typescript
import { canAccessResource } from '@/lib/auth';

export default async function DownloadPage({ params }: { params: { id: string } }) {
  // Check if user can access Agent Charter Pack
  const canAccess = await canAccessResource('agentCharterPack', params.id);

  if (!canAccess) {
    return <AccessDenied />;
  }

  return <DownloadButton resourceId={params.id} />;
}
```

---

## Admin Authentication

### Admin Configuration

Admins are defined by email addresses in the `ADMIN_EMAILS` environment variable:

```bash
# .env.local
ADMIN_EMAILS=admin@micpress.com,mehran@adaptic.ai,support@ai-born.org
```

### Admin Route Protection

Admin routes are protected by both authentication and authorization checks:

```typescript
// /src/app/admin/dashboard/page.tsx
import { requireAdmin } from '@/lib/admin-auth';

export default async function AdminDashboard() {
  // This redirects to /auth/signin if not authenticated
  // Or to /unauthorized if authenticated but not admin
  const admin = await requireAdmin();

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {admin.email}</p>
    </div>
  );
}
```

### Admin API Endpoints

Protect admin API routes with `checkAdminAuth()`:

```typescript
// /src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  // Verify admin authentication
  const auth = await checkAdminAuth(request);

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.rateLimited ? 429 : 401 }
    );
  }

  // Admin is authenticated, proceed with operation
  const users = await prisma.user.findMany();

  return NextResponse.json(users);
}
```

### Admin Helper Functions

#### Check if User is Admin

```typescript
import { isAdmin } from '@/lib/admin-auth';

const admin = await isAdmin(user);
if (admin) {
  // Show admin UI
}
```

#### Get Admin Email List

```typescript
import { getAdminEmails } from '@/lib/admin-auth';

const admins = getAdminEmails();
// ['admin@example.com', 'support@example.com']
```

### Admin Audit Logging

All admin actions should be logged for security compliance:

```typescript
import { logAdminAction } from '@/lib/admin-auth';

// Log admin action
logAdminAction({
  timestamp: new Date(),
  adminId: admin.email,
  action: 'DELETE_USER',
  resource: 'users',
  resourceId: userId,
  details: { reason: 'GDPR deletion request' },
  ipAddress: getClientIp(request),
  userAgent: request.headers.get('user-agent') || undefined,
});
```

---

## API Authentication

### Protected API Routes

API routes can be protected using session validation:

```typescript
// /src/app/api/account/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  // Get authenticated session
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // User is authenticated
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return NextResponse.json(user);
}
```

### Client-Side API Calls

When calling protected APIs from the client:

```typescript
'use client';

import { useSession } from 'next-auth/react';

export function ProfileEditor() {
  const { data: session } = useSession();

  async function updateProfile(data: any) {
    // Session cookie is automatically included in request
    const response = await fetch('/api/account/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      // Session expired, redirect to sign-in
      window.location.href = '/auth/signin';
      return;
    }

    return response.json();
  }

  // ...
}
```

### API Token Authentication (Admin)

For admin API endpoints, use token-based authentication:

```typescript
// /src/app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get bearer token from Authorization header
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  // Verify token
  if (token !== process.env.ADMIN_API_TOKEN) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Proceed with admin operation
  const analytics = await getAnalytics();
  return NextResponse.json(analytics);
}
```

**Usage:**

```bash
curl -H "Authorization: Bearer your-admin-api-token" \
  https://ai-born.org/api/admin/analytics
```

---

## Testing Locally

### 1. Set Up Environment

```bash
# Copy example environment file
cp .env.example .env.local

# Generate NextAuth secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=http://localhost:3000
```

### 2. Configure Database

```bash
# Start PostgreSQL (if using Docker)
docker run --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=aiborn_dev \
  -p 5432:5432 \
  -d postgres:15

# Update .env.local
DATABASE_URL=postgresql://postgres:password@localhost:5432/aiborn_dev

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 3. Configure OAuth Providers (Optional)

For local testing, you can use OAuth providers or skip them:

```bash
# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-dev-client-id
GOOGLE_CLIENT_SECRET=your-dev-client-secret

# GitHub OAuth (optional)
GITHUB_ID=your-dev-client-id
GITHUB_SECRET=your-dev-client-secret

# Email provider (required for magic links)
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=AI-Born <dev@ai-born.org>
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Test Authentication Flows

#### Test Sign-In

1. Visit: http://localhost:3000/auth/signin
2. Try each provider:
   - Google OAuth
   - GitHub OAuth
   - Email magic link

#### Test Protected Routes

1. Visit: http://localhost:3000/account (should redirect to sign-in)
2. Sign in
3. Visit: http://localhost:3000/account (should load account page)

#### Test Session Persistence

1. Sign in
2. Close browser
3. Reopen http://localhost:3000
4. Check if still signed in (session cookie persists)

#### Test Sign-Out

1. Sign in
2. Click "Sign Out"
3. Try visiting protected route (should redirect to sign-in)

### 6. Test Admin Access

```bash
# Add your email to admin list
ADMIN_EMAILS=your-email@example.com

# Restart dev server
npm run dev

# Sign in with your email
# Visit: http://localhost:3000/admin
# Should grant access
```

### 7. Debug Authentication Issues

Enable debug logging:

```bash
# .env.local
NEXTAUTH_DEBUG=true
```

Check logs in terminal for detailed authentication flow information.

### Testing Checklist

- [ ] Sign in with Google OAuth
- [ ] Sign in with GitHub OAuth
- [ ] Sign in with email magic link
- [ ] Sign out successfully
- [ ] Session persists after browser close
- [ ] Protected route redirects when not authenticated
- [ ] Protected route allows access when authenticated
- [ ] Admin route blocks non-admin users
- [ ] Admin route allows admin users
- [ ] Email verification sends correctly
- [ ] Magic link works and creates session

---

## Troubleshooting

### Common Issues

#### Issue: "Invalid OAuth callback URL"

**Symptom:** OAuth sign-in fails with redirect URI mismatch error

**Solution:**
1. Check OAuth provider settings (Google/GitHub console)
2. Ensure callback URL matches exactly:
   - Dev: `http://localhost:3000/api/auth/callback/google`
   - Prod: `https://ai-born.org/api/auth/callback/google`
3. Include both dev and prod URLs in OAuth config

---

#### Issue: "NEXTAUTH_SECRET is not set"

**Symptom:** Error on startup or authentication fails silently

**Solution:**
1. Generate secret: `openssl rand -base64 32`
2. Add to `.env.local`:
   ```bash
   NEXTAUTH_SECRET=your-generated-secret-here
   ```
3. Restart dev server

---

#### Issue: "Database connection failed"

**Symptom:** Prisma errors, can't read/write users

**Solution:**
1. Check PostgreSQL is running:
   ```bash
   psql -U postgres -h localhost
   ```
2. Verify `DATABASE_URL` in `.env.local`
3. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

---

#### Issue: "Session not persisting"

**Symptom:** User gets logged out on page refresh

**Solution:**
1. Check cookie settings in browser (allow cookies)
2. Verify `NEXTAUTH_URL` matches current URL
3. For local development:
   ```bash
   NEXTAUTH_URL=http://localhost:3000
   ```
4. Clear browser cookies and try again

---

#### Issue: "Magic link not received"

**Symptom:** Email sign-in doesn't send email

**Solution:**
1. Check Resend API key is set:
   ```bash
   RESEND_API_KEY=re_...
   ```
2. Verify domain is verified in Resend dashboard
3. Check spam folder
4. Check Resend logs for delivery status
5. For testing, use Resend sandbox mode:
   ```bash
   EMAIL_FROM=onboarding@resend.dev
   ```

---

#### Issue: "Protected route not redirecting"

**Symptom:** Can access protected route without signing in

**Solution:**
1. Verify route is in protected paths list (`/src/lib/auth.ts`)
2. Check middleware matcher config includes route
3. Ensure middleware is running:
   ```typescript
   // src/middleware.ts
   export const config = {
     matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)).*)',
   };
   ```

---

#### Issue: "Admin route shows 'Unauthorized'"

**Symptom:** Admin email can't access admin routes

**Solution:**
1. Verify email in `ADMIN_EMAILS`:
   ```bash
   ADMIN_EMAILS=admin@example.com,other@example.com
   ```
2. Ensure no extra spaces or typos
3. Email must match exactly (case-insensitive)
4. Restart dev server after changing env vars

---

#### Issue: "Token expired" error

**Symptom:** Session expires too quickly

**Solution:**
1. Check session duration in config:
   ```typescript
   // auth.config.ts
   session: {
     maxAge: 30 * 24 * 60 * 60, // 30 days
   }
   ```
2. Verify system clock is correct
3. Check JWT token expiry in browser dev tools

---

### Debug Tools

#### Enable Debug Mode

```bash
# .env.local
NEXTAUTH_DEBUG=true
LOG_LEVEL=debug
```

This will output detailed logs for:
- Provider authentication flows
- Token generation and validation
- Callback processing
- Session creation

#### Inspect Session in Browser

```javascript
// Browser console
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log)
```

#### Check Database Records

```bash
# Open Prisma Studio
npx prisma studio

# Query users
npx prisma db execute --stdin <<EOF
SELECT * FROM users;
EOF
```

#### Verify JWT Token

```javascript
// Decode JWT (client-side)
const token = document.cookie
  .split('; ')
  .find(row => row.startsWith('next-auth.session-token='))
  ?.split('=')[1];

if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('JWT Payload:', payload);
}
```

---

## Security Best Practices

### 1. Environment Variables

**Never commit secrets to version control:**

```bash
# ✅ Good: .env.local (gitignored)
NEXTAUTH_SECRET=actual-secret-here

# ❌ Bad: .env.example (committed)
NEXTAUTH_SECRET=your-secret-here
```

**Use strong secrets:**

```bash
# ✅ Strong (32+ characters, random)
openssl rand -base64 32

# ❌ Weak
NEXTAUTH_SECRET=mysecret123
```

---

### 2. Session Security

**Use secure cookies in production:**

```typescript
// auth.config.ts
export const authConfig = {
  useSecureCookies: process.env.NODE_ENV === 'production',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
```

**Implement session timeout:**

```typescript
// Refresh session every 24 hours
session: {
  updateAge: 24 * 60 * 60, // 24 hours
}
```

---

### 3. HTTPS Enforcement

**Always use HTTPS in production:**

```typescript
// middleware.ts
if (
  process.env.NODE_ENV === 'production' &&
  request.headers.get('x-forwarded-proto') !== 'https'
) {
  return NextResponse.redirect(
    `https://${request.headers.get('host')}${pathname}`,
    301
  );
}
```

---

### 4. Rate Limiting

**Protect auth endpoints from brute force:**

```typescript
// Rate limit sign-in attempts
const rateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
  const identifier = getClientIP(request);

  try {
    await rateLimiter.check(identifier, 10); // 10 requests per minute
  } catch {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Process sign-in
}
```

---

### 5. CSRF Protection

**NextAuth includes built-in CSRF protection:**

- All state-changing operations require CSRF token
- Tokens are automatically generated and validated
- No additional configuration needed

---

### 6. XSS Prevention

**Sanitize user input:**

```typescript
import DOMPurify from 'dompurify';

// ✅ Sanitize before rendering
const safeName = DOMPurify.sanitize(user.name);

// ✅ Use React's built-in escaping
<p>{user.name}</p>  // Automatically escaped

// ❌ Dangerous: Raw HTML
<div dangerouslySetInnerHTML={{ __html: user.bio }} />
```

---

### 7. SQL Injection Prevention

**Prisma automatically prevents SQL injection:**

```typescript
// ✅ Safe: Prisma parameterizes queries
await prisma.user.findMany({
  where: { email: userInput },
});

// ❌ Dangerous: Raw SQL with user input
await prisma.$executeRawUnsafe(
  `SELECT * FROM users WHERE email = '${userInput}'`
);
```

---

### 8. Content Security Policy

**CSP headers are applied via middleware:**

```typescript
// middleware.ts
response.headers.set('Content-Security-Policy', buildCSP(nonce));
```

Includes:
- Script-src with nonces
- Frame-ancestors 'none'
- Upgrade-insecure-requests
- Block-all-mixed-content

---

### 9. Secure Password Storage (Future)

If adding password authentication:

```typescript
import bcrypt from 'bcrypt';

// Hash password with bcrypt (10 rounds minimum)
const hashedPassword = await bcrypt.hash(password, 12);

// Verify password
const valid = await bcrypt.compare(inputPassword, hashedPassword);
```

**Never store plain text passwords.**

---

### 10. Audit Logging

**Log security-relevant events:**

```typescript
// Track authentication events
events: {
  async signIn({ user, account, isNewUser }) {
    await logSecurityEvent({
      type: 'SIGN_IN',
      userId: user.id,
      provider: account.provider,
      isNewUser,
      timestamp: new Date(),
    });
  },

  async signOut({ token }) {
    await logSecurityEvent({
      type: 'SIGN_OUT',
      userId: token.sub,
      timestamp: new Date(),
    });
  },
}
```

---

## GDPR/CCPA Compliance

### Data Collection

The authentication system collects the following personal data:

| Data Type | Purpose | Legal Basis (GDPR) |
|-----------|---------|-------------------|
| Email address | Account identification, authentication | Legitimate interest / Consent |
| Name | User identification, personalization | Consent |
| Profile image | User experience enhancement | Consent (via OAuth) |
| IP address | Security, fraud prevention | Legitimate interest |
| Session data | Authentication, user experience | Legitimate interest |

### User Rights

#### Right to Access (GDPR Art. 15)

Users can request their data:

```typescript
// GET /api/account/data-export
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      entitlements: true,
      receipts: true,
      bonusClaims: true,
    },
  });

  return NextResponse.json(user);
}
```

#### Right to Deletion (GDPR Art. 17)

Users can request account deletion:

```typescript
// DELETE /api/account
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return unauthorized();

  // Delete user and all related data (cascade)
  await prisma.user.delete({
    where: { id: session.user.id },
  });

  // Sign out
  await signOut();

  return NextResponse.json({ success: true });
}
```

#### Right to Rectification (GDPR Art. 16)

Users can update their information:

```typescript
// PUT /api/account/profile
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) return unauthorized();

  const body = await request.json();

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: body.name,
      // Other updateable fields
    },
  });

  return NextResponse.json(updated);
}
```

#### Right to Data Portability (GDPR Art. 20)

Users can export their data in JSON format:

```typescript
// GET /api/account/data-export?format=json
// Returns all user data in machine-readable format
```

### Consent Management

#### Email Marketing Consent

```typescript
// Track explicit consent
await prisma.emailCapture.create({
  data: {
    email: user.email,
    marketingConsent: true,  // Explicit opt-in
    doubleOptIn: false,
    source: 'HERO_EXCERPT',
  },
});
```

#### Cookie Consent

Implement cookie consent banner (already included):

```typescript
// src/components/CookieConsent.tsx
// Manages cookie preferences
// Stores consent in localStorage
// Respects user choice for analytics cookies
```

### Data Retention

**Default retention periods:**

| Data Type | Retention Period | Reason |
|-----------|-----------------|---------|
| User accounts | Until deletion requested | Service provision |
| Session data | 30 days | Session management |
| Audit logs | 1 year | Security, compliance |
| Email captures | Until unsubscribe | Marketing |
| Receipts | 7 years | Tax compliance |

**Implement automatic deletion:**

```typescript
// Cleanup job (run daily)
async function cleanupExpiredData() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Delete expired sessions
  await prisma.session.deleteMany({
    where: {
      expires: { lt: thirtyDaysAgo },
    },
  });

  // Delete unverified accounts (30 days old)
  await prisma.user.deleteMany({
    where: {
      emailVerified: null,
      createdAt: { lt: thirtyDaysAgo },
    },
  });
}
```

### Privacy Policy

Ensure privacy policy includes:

- [ ] What data is collected
- [ ] Why data is collected
- [ ] How data is stored
- [ ] Who data is shared with (none, or third parties)
- [ ] User rights (access, deletion, portability)
- [ ] Contact information for data requests
- [ ] Cookie policy
- [ ] Third-party services (Google, GitHub, Resend)

**Link to privacy policy:**
- Sign-in page
- Footer
- Email communications

### CCPA Compliance (California)

**"Do Not Sell My Personal Information"**

Since AI-Born does not sell personal information, include statement:

```
"We do not sell personal information to third parties."
```

**Opt-Out Option:**

Provide opt-out link in footer and privacy policy.

### Cookie Policy

**Cookies used:**

| Cookie Name | Type | Purpose | Duration |
|------------|------|---------|----------|
| `next-auth.session-token` | Essential | Authentication | 30 days |
| `next-auth.csrf-token` | Essential | CSRF protection | Session |
| `next-auth.callback-url` | Essential | OAuth redirect | Session |
| `_ga` | Analytics | Google Analytics (if consent given) | 2 years |

**Essential cookies** (authentication) do not require consent.

**Analytics cookies** require consent (managed by CookieConsent component).

---

## Additional Resources

### Official Documentation

- **NextAuth v5:** https://authjs.dev/
- **Prisma:** https://www.prisma.io/docs
- **Next.js:** https://nextjs.org/docs

### Related Documentation

- [AUTH_SETUP.md](/AUTH_SETUP.md) - Initial setup guide
- [AUTH_QUICK_START.md](/AUTH_QUICK_START.md) - 5-minute quick start
- [DATABASE.md](/docs/DATABASE.md) - Database schema reference
- [SECURITY.md](/SECURITY.md) - Security guidelines

### Code Examples

- Sign-in buttons: `/src/components/auth/AuthButtons.tsx`
- Protected page: `/src/app/account/page.tsx`
- Admin page: `/src/app/admin/dashboard/page.tsx`
- API route: `/src/app/api/account/profile/route.ts`

---

## Support

For issues or questions:

1. **Check documentation** - Review this guide and related docs
2. **Check existing issues** - Search GitHub issues
3. **Enable debug mode** - Set `NEXTAUTH_DEBUG=true`
4. **Open an issue** - Create detailed bug report

---

**Last Updated:** October 19, 2025
**Maintained By:** AI-Born Development Team
**Version:** 1.0
