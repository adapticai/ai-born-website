# Auth.js (NextAuth v5) Setup Guide

Complete authentication system for AI-Born landing page using Auth.js v5 with TypeScript, Prisma, and multiple authentication providers.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Protected Routes](#protected-routes)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Components](#components)
- [Troubleshooting](#troubleshooting)

---

## Features

- **Multiple Auth Providers**
  - Google OAuth
  - GitHub OAuth
  - Email magic links (via Resend)

- **Session Management**
  - JWT-based sessions with database persistence
  - Automatic session refresh
  - Secure cookie handling

- **Protected Routes**
  - Middleware-based route protection
  - Automatic redirects to sign-in
  - Callback URL preservation

- **User Entitlements**
  - Pre-order tracking
  - Excerpt access
  - Agent Charter Pack eligibility

- **Production Ready**
  - TypeScript type safety
  - Error handling
  - Security headers
  - Rate limiting integration

---

## Architecture

```
auth.config.ts              # NextAuth configuration
src/
├── app/
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts    # Auth API handler
├── components/
│   └── auth/
│       ├── SessionProvider.tsx # Client-side session wrapper
│       ├── SignInButton.tsx    # Sign-in components
│       ├── SignOutButton.tsx   # Sign-out component
│       ├── UserNav.tsx         # User navigation menu
│       └── index.ts            # Barrel export
├── lib/
│   └── auth.ts                 # Server-side auth helpers
├── types/
│   └── auth.ts                 # TypeScript definitions
└── middleware.ts               # Auth + security middleware
```

---

## Installation

Packages are already installed:

```bash
# Auth.js v5 (beta)
next-auth@beta

# Prisma adapter for database sessions
@auth/prisma-adapter

# Avatar UI component
@radix-ui/react-avatar
```

---

## Configuration

### 1. Environment Variables

Add to your `.env` file:

```bash
# NextAuth Secret (REQUIRED)
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-minimum-32-characters"

# NextAuth URL (required for production)
NEXTAUTH_URL="http://localhost:3000"  # Change in production

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (optional)
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Email provider uses existing RESEND_API_KEY
```

### 2. OAuth Provider Setup

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   https://ai-born.org/api/auth/callback/google
   ```
4. Copy Client ID and Secret to `.env`

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Add callback URL:
   ```
   http://localhost:3000/api/auth/callback/github
   https://ai-born.org/api/auth/callback/github
   ```
4. Copy Client ID and Secret to `.env`

### 3. Database Setup

You'll need Prisma schema for user/session tables. Add to `prisma/schema.prisma`:

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model User {
  id                   String    @id @default(cuid())
  name                 String?
  email                String    @unique
  emailVerified        DateTime?
  image                String?

  # Entitlements
  hasPreordered        Boolean   @default(false)
  hasExcerpt           Boolean   @default(false)
  hasAgentCharterPack  Boolean   @default(false)

  # Timestamps
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  # Relations
  accounts             Account[]
  sessions             Session[]

  @@map("users")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

Run migration:

```bash
npx prisma migrate dev --name add-auth-tables
npx prisma generate
```

---

## Usage

### Server Components

Use server-side helpers for authentication:

```tsx
// app/profile/page.tsx
import { requireAuth, getCurrentUser } from '@/lib/auth';

export default async function ProfilePage() {
  // Require authentication (redirects if not signed in)
  const user = await requireAuth();

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### Client Components

Use React hooks for authentication state:

```tsx
// components/UserProfile.tsx
'use client';

import { useSession } from 'next-auth/react';
import { SignInButton } from '@/components/auth';

export function UserProfile() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <SignInButton />;
  }

  return <div>Hello, {session.user.name}!</div>;
}
```

### Wrap App with SessionProvider

Add to your root layout:

```tsx
// app/layout.tsx
import { SessionProvider } from '@/components/auth';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

## Protected Routes

### Middleware Protection

Routes are automatically protected by middleware:

```typescript
// Protected paths (defined in src/lib/auth.ts)
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/account',
  '/settings',
  '/bonus-claim',
  '/downloads',
];
```

Unauthenticated users are redirected to `/auth/signin?callbackUrl=<original-path>`

### Manual Protection

For fine-grained control:

```tsx
import { requireAuth, canAccessResource } from '@/lib/auth';

export default async function BonusPage() {
  // Require authentication
  const user = await requireAuth('/bonus-claim');

  // Check specific entitlement
  const hasAccess = await canAccessResource('agentCharterPack');

  if (!hasAccess) {
    return <div>Pre-order required</div>;
  }

  return <DownloadButton />;
}
```

---

## Database Schema

### Users Table

Stores user profiles and entitlements:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique user ID (cuid) |
| `email` | String | User email (unique) |
| `name` | String? | Display name |
| `image` | String? | Avatar URL |
| `emailVerified` | DateTime? | Email verification timestamp |
| `hasPreordered` | Boolean | Pre-order entitlement |
| `hasExcerpt` | Boolean | Excerpt access |
| `hasAgentCharterPack` | Boolean | Bonus pack access |
| `createdAt` | DateTime | Account creation |
| `updatedAt` | DateTime | Last update |

### Sessions Table

Stores active sessions:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Session ID |
| `sessionToken` | String | Unique token |
| `userId` | String | Foreign key to User |
| `expires` | DateTime | Expiration time |

### Accounts Table

Stores OAuth provider connections:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Account ID |
| `userId` | String | Foreign key to User |
| `provider` | String | OAuth provider (google, github) |
| `providerAccountId` | String | Provider's user ID |
| `access_token` | String? | OAuth access token |
| `refresh_token` | String? | OAuth refresh token |

---

## API Reference

### Server-Side Helpers

#### `getCurrentUser()`

Get the currently authenticated user.

```typescript
const user = await getCurrentUser();
// Returns: User | null
```

#### `getSession()`

Get the full session object.

```typescript
const session = await getSession();
// Returns: Session | null
```

#### `requireAuth(redirectTo?: string)`

Require authentication, redirect if not signed in.

```typescript
const user = await requireAuth('/profile');
// Returns: User (or redirects)
```

#### `hasEntitlement(entitlement)`

Check if user has a specific entitlement.

```typescript
const hasPack = await hasEntitlement('agentCharterPack');
// Returns: boolean
```

#### `canAccessResource(resourceType, resourceId?)`

Check resource access permission.

```typescript
const canDownload = await canAccessResource('agentCharterPack');
// Returns: boolean
```

### Client-Side Hooks

#### `useSession()`

React hook for session state.

```typescript
const { data: session, status } = useSession();
// status: 'loading' | 'authenticated' | 'unauthenticated'
```

#### `signIn(provider, options)`

Trigger sign-in flow.

```typescript
import { signIn } from 'next-auth/react';

await signIn('google', { callbackUrl: '/dashboard' });
```

#### `signOut(options)`

Trigger sign-out flow.

```typescript
import { signOut } from 'next-auth/react';

await signOut({ callbackUrl: '/' });
```

---

## Components

### SessionProvider

Wraps app to provide auth context.

```tsx
import { SessionProvider } from '@/components/auth';

<SessionProvider>
  {children}
</SessionProvider>
```

### SignInButton

Trigger sign-in with various providers.

```tsx
import {
  SignInButton,
  GoogleSignInButton,
  GitHubSignInButton,
  EmailSignInButton
} from '@/components/auth';

// Generic (shows provider selection)
<SignInButton />

// Provider-specific
<GoogleSignInButton />
<GitHubSignInButton />
<EmailSignInButton />

// Custom
<SignInButton provider="google" callbackUrl="/dashboard">
  Sign in with Google
</SignInButton>
```

### SignOutButton

Trigger sign-out.

```tsx
import { SignOutButton } from '@/components/auth';

<SignOutButton callbackUrl="/">
  Sign out
</SignOutButton>
```

### UserNav

Complete user navigation with dropdown menu.

```tsx
import { UserNav } from '@/components/auth';

<UserNav />
```

Shows sign-in button when unauthenticated, user avatar with menu when authenticated.

---

## Troubleshooting

### Issue: "Configuration error"

**Cause:** Missing `NEXTAUTH_SECRET`

**Solution:** Add to `.env`:
```bash
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
```

### Issue: "Callback URL mismatch"

**Cause:** OAuth provider callback URL not configured

**Solution:** Add these URLs to your OAuth app:
- Google: `{NEXTAUTH_URL}/api/auth/callback/google`
- GitHub: `{NEXTAUTH_URL}/api/auth/callback/github`

### Issue: "Email sending failed"

**Cause:** Missing or invalid `RESEND_API_KEY`

**Solution:** Get API key from [Resend](https://resend.com/api-keys) and add to `.env`

### Issue: "Database error"

**Cause:** Prisma schema not migrated

**Solution:** Run migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

### Issue: "Session not persisting"

**Cause:** Cookies blocked or secure cookies in development

**Solution:**
- Check browser cookie settings
- Ensure `NEXTAUTH_URL` matches current host
- In development, use `http://localhost:3000` (not `https`)

### Issue: "Middleware redirects in loop"

**Cause:** Protected route misconfiguration

**Solution:** Ensure auth routes are excluded:
```typescript
// middleware.ts already handles this
if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth')) {
  return NextResponse.next();
}
```

---

## Security Considerations

1. **NEXTAUTH_SECRET**: Must be at least 32 characters, generated randomly
2. **HTTPS**: Required in production (`useSecureCookies: true`)
3. **CORS**: Configured in middleware for API routes
4. **CSP**: Content Security Policy headers applied
5. **Rate Limiting**: Integrated with existing rate limiter
6. **Email Verification**: Magic links expire in 24 hours
7. **Session Expiry**: 30 days, auto-refresh every 24 hours

---

## Next Steps

1. **Add Prisma Schema**: Copy database schema to `prisma/schema.prisma`
2. **Run Migrations**: `npx prisma migrate dev`
3. **Configure OAuth**: Set up Google/GitHub OAuth apps
4. **Add SessionProvider**: Wrap root layout
5. **Test Sign-In**: Visit `/auth/signin`
6. **Protect Routes**: Add paths to `isProtectedRoute()` in `src/lib/auth.ts`
7. **Implement Entitlements**: Connect pre-order/excerpt logic to user database

---

## Resources

- [NextAuth v5 Docs](https://authjs.dev)
- [Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [Google OAuth Setup](https://console.cloud.google.com/apis/credentials)
- [GitHub OAuth Setup](https://github.com/settings/developers)
- [Resend API](https://resend.com/docs)

---

**Last Updated:** October 18, 2025
**Version:** 1.0.0
**Status:** Production Ready
