# Protected Routes Guide

**Purpose:** Comprehensive guide for using the `ProtectedRoute` component to secure pages with authentication and authorization checks.

**Component Location:** `/src/components/auth/ProtectedRoute.tsx`

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Basic Usage](#basic-usage)
4. [Authentication Only](#authentication-only)
5. [Entitlement-Based Access](#entitlement-based-access)
6. [Admin-Only Access](#admin-only-access)
7. [Custom Components](#custom-components)
8. [Combined Authorization](#combined-authorization)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)
11. [API Reference](#api-reference)
12. [Migration Guide](#migration-guide)

---

## Overview

The `ProtectedRoute` component is a reusable server component wrapper that handles:

- **Authentication:** Ensures user is signed in
- **Authorization:** Checks entitlements or admin privileges
- **Redirection:** Automatically redirects to sign-in with callback URL
- **Error States:** Displays access denied messages with helpful CTAs
- **Loading States:** Shows loading UI during auth verification

This component replaces manual `requireAuth()` calls and provides consistent UX across all protected pages.

---

## Features

### Core Capabilities

- **Server-side rendering:** Works with Next.js App Router
- **Type-safe:** Full TypeScript support with generics
- **Flexible:** Supports authentication only, entitlements, or admin checks
- **Customizable:** Override loading and error components
- **User-friendly:** Helpful error messages with actionable links
- **Performance:** Uses React Suspense for optimal loading states

### Security

- **Server-side only:** All checks happen on the server
- **Fail-closed:** Denies access on errors
- **Session-based:** Integrates with Auth.js (NextAuth v5)
- **Rate limiting:** Leverages existing rate limit infrastructure

---

## Basic Usage

### Import the Component

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
```

### Wrap Your Page Content

```tsx
export default function AccountPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <h1>Your Account</h1>
        <p>This content is only visible to authenticated users.</p>
      </div>
    </ProtectedRoute>
  );
}
```

That's it! The component handles:
1. Checking if user is authenticated
2. Redirecting to `/auth/signin?callbackUrl=/account` if not
3. Showing loading state during check
4. Rendering children if authenticated

---

## Authentication Only

### Use Case

Protect pages that require a user to be signed in, but don't need specific permissions.

### Examples

#### User Account Page

```tsx
// src/app/account/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { getCurrentUser } from '@/lib/auth';

export default async function AccountPage() {
  // Get user data (guaranteed to exist inside ProtectedRoute)
  const user = await getCurrentUser();

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <h1>Welcome, {user?.name || 'User'}!</h1>
        <p>Email: {user?.email}</p>
      </div>
    </ProtectedRoute>
  );
}
```

#### Settings Page

```tsx
// src/app/settings/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SettingsForm } from '@/components/settings/SettingsForm';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <h1>Account Settings</h1>
        <SettingsForm />
      </div>
    </ProtectedRoute>
  );
}
```

---

## Entitlement-Based Access

### Use Case

Restrict access based on user entitlements (e.g., pre-order, excerpt, bonus pack).

### Available Entitlements

- **`preorder`** — User has submitted a verified receipt
- **`excerpt`** — User has claimed the free excerpt
- **`agentCharterPack`** — User has claimed the Agent Charter Pack bonus

### Examples

#### Excerpt Download Page

```tsx
// src/app/downloads/excerpt/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ExcerptDownloadButton } from '@/components/downloads/ExcerptDownloadButton';

export default function ExcerptDownloadPage() {
  return (
    <ProtectedRoute requiredEntitlement="excerpt">
      <div className="container mx-auto py-8">
        <h1>Download Your Free Excerpt</h1>
        <p>Thank you for your interest in AI-Born!</p>
        <ExcerptDownloadButton />
      </div>
    </ProtectedRoute>
  );
}
```

**What happens:**
- User must be authenticated AND have claimed the excerpt
- If not authenticated → redirects to sign-in
- If authenticated but no excerpt → shows access denied with "Claim your free excerpt" link

#### Agent Charter Pack Page

```tsx
// src/app/downloads/agent-charter-pack/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { BonusPackAssets } from '@/components/downloads/BonusPackAssets';

export default function AgentCharterPackPage() {
  return (
    <ProtectedRoute requiredEntitlement="agentCharterPack">
      <div className="container mx-auto py-8">
        <h1>Agent Charter Pack</h1>
        <p>Your exclusive pre-order bonus materials.</p>
        <BonusPackAssets />
      </div>
    </ProtectedRoute>
  );
}
```

**What happens:**
- User must have verified pre-order receipt and claimed bonus
- Shows "Claim your bonus pack" link if they don't have it

#### Pre-order Only Content

```tsx
// src/app/exclusive/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ExclusiveContentPage() {
  return (
    <ProtectedRoute requiredEntitlement="preorder">
      <div className="container mx-auto py-8">
        <h1>Exclusive Pre-order Content</h1>
        <p>Thank you for pre-ordering AI-Born!</p>
        {/* Exclusive content here */}
      </div>
    </ProtectedRoute>
  );
}
```

---

## Admin-Only Access

### Use Case

Restrict access to pages that require administrator privileges.

### Configuration

Admin emails are configured in the `ADMIN_EMAILS` environment variable:

```env
# .env.local
ADMIN_EMAILS=admin@ai-born.org,mehran@adaptic.ai
```

### Examples

#### Admin Dashboard

```tsx
// src/app/admin/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <div className="container mx-auto py-8">
        <h1>Admin Dashboard</h1>
        <AdminDashboard />
      </div>
    </ProtectedRoute>
  );
}
```

**What happens:**
- User must be authenticated
- User email must be in `ADMIN_EMAILS` list
- If not admin → shows "Admin Access Required" error

#### VIP Code Management

```tsx
// src/app/admin/vip-codes/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { VipCodeManager } from '@/components/admin/VipCodeManager';

export default function VipCodesAdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <div className="container mx-auto py-8">
        <h1>VIP Code Management</h1>
        <VipCodeManager />
      </div>
    </ProtectedRoute>
  );
}
```

---

## Custom Components

### Use Case

Override default loading or access denied components with custom UI.

### Examples

#### Custom Loading Component

```tsx
// src/app/custom-protected/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function CustomLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-pulse rounded-full bg-brand-cyan" />
        <p className="text-brand-porcelain">Verifying access...</p>
      </div>
    </div>
  );
}

export default function CustomProtectedPage() {
  return (
    <ProtectedRoute loadingComponent={<CustomLoader />}>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

#### Custom Access Denied Component

```tsx
// src/app/premium/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function CustomAccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Premium Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This content is available exclusively to pre-order customers.</p>
          <div className="flex gap-4">
            <Button asChild>
              <a href="/#preorder">Pre-order Now</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/">Back to Home</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PremiumPage() {
  return (
    <ProtectedRoute
      requiredEntitlement="preorder"
      accessDeniedComponent={<CustomAccessDenied />}
    >
      <div>Premium pre-order content</div>
    </ProtectedRoute>
  );
}
```

---

## Combined Authorization

### Use Case

Require both authentication and admin privileges, or multiple entitlements.

### Examples

#### Admin with Entitlement

If you need admin access AND a specific entitlement, you can combine props:

```tsx
// src/app/admin/bonus-review/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AdminBonusReviewPage() {
  return (
    <ProtectedRoute requireAdmin requiredEntitlement="agentCharterPack">
      <div className="container mx-auto py-8">
        <h1>Admin Bonus Pack Review</h1>
        {/* Admin can test bonus pack experience */}
      </div>
    </ProtectedRoute>
  );
}
```

#### Multiple Entitlements

For multiple entitlements, nest `ProtectedRoute` components:

```tsx
// src/app/vip-content/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function VipContentPage() {
  return (
    <ProtectedRoute requiredEntitlement="preorder">
      <ProtectedRoute requiredEntitlement="agentCharterPack">
        <div className="container mx-auto py-8">
          <h1>VIP Exclusive Content</h1>
          <p>Only for users with both pre-order and bonus pack.</p>
        </div>
      </ProtectedRoute>
    </ProtectedRoute>
  );
}
```

**Note:** This creates two separate checks. Consider creating a custom component if you need this pattern frequently.

---

## Error Handling

### Default Error States

The component handles three error scenarios automatically:

#### 1. Not Authenticated

**Trigger:** User is not signed in
**Action:** Redirects to `/auth/signin?callbackUrl={currentPath}`
**User sees:** Sign-in page with callback to return after login

#### 2. Missing Entitlement

**Trigger:** User authenticated but lacks required entitlement
**User sees:** Card with:
- Error title: "Access Denied"
- Description: "This content requires {entitlement}."
- CTA link to claim the entitlement
- "Return to home page" link

#### 3. Not Admin

**Trigger:** User authenticated but not in `ADMIN_EMAILS`
**User sees:** Card with:
- Error title: "Admin Access Required"
- Description: "You do not have administrator privileges..."
- Contact support email
- "Return to home page" link

### Custom Error Handling

Override default errors with `accessDeniedComponent`:

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function MyCustomError() {
  return <div>Custom error message</div>;
}

export default function Page() {
  return (
    <ProtectedRoute
      requiredEntitlement="excerpt"
      accessDeniedComponent={<MyCustomError />}
    >
      <div>Content</div>
    </ProtectedRoute>
  );
}
```

---

## Best Practices

### 1. Place at Top Level

Wrap entire page content, not individual components:

```tsx
// ✅ GOOD
export default function AccountPage() {
  return (
    <ProtectedRoute>
      <Header />
      <MainContent />
      <Footer />
    </ProtectedRoute>
  );
}

// ❌ BAD
export default function AccountPage() {
  return (
    <>
      <Header />
      <ProtectedRoute>
        <MainContent />
      </ProtectedRoute>
      <Footer />
    </>
  );
}
```

**Why:** If protection fails, user shouldn't see any page chrome (header/footer).

### 2. Use Server Components

`ProtectedRoute` is a server component. Keep page as server component:

```tsx
// ✅ GOOD - Server Component
export default async function AccountPage() {
  const user = await getCurrentUser();

  return (
    <ProtectedRoute>
      <div>Welcome, {user?.name}</div>
    </ProtectedRoute>
  );
}

// ❌ BAD - Don't add "use client" unless necessary
'use client';

export default function AccountPage() {
  // This breaks server-side auth checks
}
```

### 3. Specify Redirect Paths

For better UX, specify where to redirect after sign-in:

```tsx
export default function BonusPage() {
  return (
    <ProtectedRoute
      requiredEntitlement="agentCharterPack"
      redirectTo="/downloads/agent-charter-pack"
    >
      <div>Bonus content</div>
    </ProtectedRoute>
  );
}
```

### 4. Combine with Metadata

Add page metadata for SEO and browser tabs:

```tsx
import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Account Settings | AI-Born',
  description: 'Manage your AI-Born account settings',
  robots: 'noindex', // Don't index protected pages
};

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div>Settings content</div>
    </ProtectedRoute>
  );
}
```

### 5. Don't Over-Protect

Only use `ProtectedRoute` for pages that truly require authentication:

```tsx
// ✅ GOOD - Public marketing page
export default function HomePage() {
  return <div>Welcome to AI-Born</div>;
}

// ❌ BAD - Don't protect public pages
export default function HomePage() {
  return (
    <ProtectedRoute>
      <div>Welcome to AI-Born</div>
    </ProtectedRoute>
  );
}
```

### 6. Leverage Type Safety

Use TypeScript to catch errors at compile time:

```tsx
import { ProtectedRoute, RequiredEntitlement } from '@/components/auth/ProtectedRoute';

const entitlement: RequiredEntitlement = "excerpt"; // Type-safe

export default function Page() {
  return (
    <ProtectedRoute requiredEntitlement={entitlement}>
      <div>Content</div>
    </ProtectedRoute>
  );
}
```

---

## API Reference

### `ProtectedRoute` Component

```typescript
interface ProtectedRouteProps {
  /**
   * The content to render if user is authorized
   */
  children: ReactNode;

  /**
   * Optional entitlement required to access this route
   * Options: "preorder" | "excerpt" | "agentCharterPack"
   */
  requiredEntitlement?: RequiredEntitlement;

  /**
   * Optional flag to restrict access to admin users only
   * Admin emails configured in ADMIN_EMAILS environment variable
   */
  requireAdmin?: boolean;

  /**
   * Custom redirect path after successful authentication
   * Defaults to current page path
   */
  redirectTo?: string;

  /**
   * Custom loading component to show during auth check
   */
  loadingComponent?: ReactNode;

  /**
   * Custom access denied component
   * If not provided, uses default Card-based error UI
   */
  accessDeniedComponent?: ReactNode;
}
```

### `RequiredEntitlement` Type

```typescript
type RequiredEntitlement = "preorder" | "excerpt" | "agentCharterPack";
```

**Entitlement Checks:**
- `preorder` — User has verified receipt (checks `receipts` table)
- `excerpt` — User has EARLY_EXCERPT entitlement (checks `entitlements` table)
- `agentCharterPack` — User has delivered bonus claim (checks `bonusClaims` table)

### Related Functions

Import from `@/lib/auth`:

```typescript
import {
  requireAuth,      // Require authentication, redirect if not
  getCurrentUser,   // Get current user (or null)
  hasEntitlement,   // Check specific entitlement
  canAccessResource, // Check access to resource type
} from '@/lib/auth';
```

Import from `@/lib/admin-auth`:

```typescript
import {
  isAdmin,       // Check if user is admin
  requireAdmin,  // Require admin access, redirect if not
  isAdminEmail,  // Check if email is in ADMIN_EMAILS
} from '@/lib/admin-auth';
```

---

## Migration Guide

### Migrating from Manual `requireAuth()`

**Before:**

```tsx
// Old pattern
import { requireAuth } from '@/lib/auth';

export default async function AccountPage() {
  const user = await requireAuth();

  return (
    <div>
      <h1>Account</h1>
      <p>Welcome, {user.name}</p>
    </div>
  );
}
```

**After:**

```tsx
// New pattern with ProtectedRoute
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { getCurrentUser } from '@/lib/auth';

export default async function AccountPage() {
  const user = await getCurrentUser();

  return (
    <ProtectedRoute>
      <div>
        <h1>Account</h1>
        <p>Welcome, {user?.name}</p>
      </div>
    </ProtectedRoute>
  );
}
```

**Benefits:**
- Consistent loading states
- Better error messages
- Easier to add entitlement checks later

### Migrating from Manual Entitlement Checks

**Before:**

```tsx
// Old pattern
import { requireAuth, hasEntitlement } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function BonusPage() {
  const user = await requireAuth();
  const hasBonus = await hasEntitlement('agentCharterPack');

  if (!hasBonus) {
    redirect('/unauthorized');
  }

  return <div>Bonus content</div>;
}
```

**After:**

```tsx
// New pattern with ProtectedRoute
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function BonusPage() {
  return (
    <ProtectedRoute requiredEntitlement="agentCharterPack">
      <div>Bonus content</div>
    </ProtectedRoute>
  );
}
```

**Benefits:**
- Less boilerplate
- Automatic error UI with helpful CTAs
- Type-safe entitlement names

### Migrating from Manual Admin Checks

**Before:**

```tsx
// Old pattern
import { requireAuth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const user = await requireAuth();
  const admin = await isAdmin(user);

  if (!admin) {
    redirect('/unauthorized');
  }

  return <div>Admin content</div>;
}
```

**After:**

```tsx
// New pattern with ProtectedRoute
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <div>Admin content</div>
    </ProtectedRoute>
  );
}
```

---

## Troubleshooting

### Issue: Infinite Redirect Loop

**Symptoms:** Page keeps redirecting to sign-in
**Cause:** User is authenticated but session not detected
**Solution:**
1. Check `auth.ts` configuration
2. Verify session cookies are set
3. Check middleware isn't blocking auth routes

### Issue: Access Denied Despite Having Entitlement

**Symptoms:** User has entitlement but sees access denied
**Cause:** Database query mismatch or cache issue
**Solution:**
1. Check `hasEntitlement()` logic in `/src/lib/auth.ts`
2. Verify database records (receipts, entitlements, bonusClaims)
3. Clear Next.js cache: `npm run dev -- --turbo`

### Issue: Admin Check Fails

**Symptoms:** Admin user sees "Admin Access Required"
**Cause:** Email not in `ADMIN_EMAILS` or case mismatch
**Solution:**
1. Verify `.env.local` has `ADMIN_EMAILS=your@email.com`
2. Check email is lowercase in environment variable
3. Restart dev server after changing `.env.local`

### Issue: Loading State Never Resolves

**Symptoms:** Spinner shows indefinitely
**Cause:** Auth check hanging or error thrown
**Solution:**
1. Check server logs for errors
2. Verify Prisma database connection
3. Add error boundary around ProtectedRoute

---

## Examples Repository

See full working examples in:

- **Basic auth:** `/src/app/account/page.tsx`
- **Entitlement:** `/src/app/downloads/excerpt/page.tsx`
- **Admin:** `/src/app/admin/page.tsx`
- **Custom UI:** `/src/app/settings/page.tsx`

---

## Related Documentation

- [Authentication Setup](/docs/AUTH_SETUP.md)
- [Admin Authentication](/docs/ADMIN_AUTH.md)
- [Entitlements System](/docs/ENTITLEMENTS.md)
- [Middleware Configuration](/docs/MIDDLEWARE.md)

---

## Support

For questions or issues:

- **GitHub Issues:** [ai-born-website/issues](https://github.com/yourusername/ai-born-website/issues)
- **Email:** support@ai-born.org
- **Internal:** Slack #ai-born-dev

---

**Last Updated:** 19 October 2025
**Maintained By:** Engineering Team
