# Auth Callbacks Quick Start

## What Was Implemented

The auth callbacks in `/auth.config.ts` now automatically populate user entitlements in the session object. This means every authenticated user's session includes:

- `hasPreordered` - Whether user has a verified pre-order receipt
- `hasExcerpt` - Whether user has access to the free excerpt
- `hasAgentCharterPack` - Whether user has claimed the bonus pack
- `createdAt` - When the user account was created

## How to Use in Your Code

### Server Components (Recommended)

```typescript
import { auth } from "@/auth";

export default async function MyServerComponent() {
  const session = await auth();

  if (!session?.user) {
    return <div>Please sign in</div>;
  }

  // All entitlement fields are available
  const { hasPreordered, hasExcerpt, hasAgentCharterPack, createdAt } = session.user;

  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
      <p>Member since: {createdAt?.toLocaleDateString()}</p>

      {hasPreordered ? (
        <div>✓ Thank you for pre-ordering!</div>
      ) : (
        <a href="/pricing">Pre-order now</a>
      )}

      {hasExcerpt && <a href="/downloads/excerpt">Download Excerpt</a>}
      {hasAgentCharterPack && <a href="/downloads/bonus-pack">Download Bonus Pack</a>}
    </div>
  );
}
```

### Client Components

```typescript
"use client";
import { useSession } from "next-auth/react";

export default function MyClientComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      {session.user.hasPreordered && (
        <div className="badge">Pre-order Customer</div>
      )}

      {session.user.hasAgentCharterPack && (
        <button onClick={() => window.location.href = '/downloads/bonus-pack'}>
          Download Your Bonus Pack
        </button>
      )}
    </div>
  );
}
```

### API Routes

```typescript
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Check entitlements
  if (!session.user.hasAgentCharterPack) {
    return new Response("Access denied. Bonus pack not claimed.", { status: 403 });
  }

  // Return protected resource
  return new Response("Download URL...");
}
```

## Updating Entitlements in Real-Time

When a user's entitlements change (e.g., they upload a receipt), you need to refresh their session:

### Server Actions

```typescript
"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function handleBonusClaim() {
  const session = await auth();

  // Process bonus claim...

  // Session will automatically refresh with new entitlements on next request
  // because JWT callback fetches latest entitlements
  revalidatePath("/");
}
```

### Client-Side Session Update

```typescript
"use client";
import { useSession } from "next-auth/react";

export default function BonusClaimForm() {
  const { update } = useSession();

  async function handleSubmit() {
    // Upload receipt via API...
    const response = await fetch("/api/bonus/claim", { method: "POST", ... });

    if (response.ok) {
      // Manually trigger session refresh
      // This will call the JWT callback which fetches latest entitlements
      await update();

      // Or update specific fields
      await update({
        hasAgentCharterPack: true,
      });
    }
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## How It Works Behind the Scenes

### 1. Sign In Flow

```
User signs in → signIn callback → Create user in DB if new
              → jwt callback → Fetch entitlements from DB → Add to JWT
              → session callback → Map JWT fields to session object
              → Session available to app with all fields
```

### 2. Session Refresh Flow

```
Page load → Next.js checks JWT → jwt callback runs if token expired
         → Fetches latest entitlements from DB
         → Updates JWT with fresh data
         → session callback maps to session object
```

### 3. Manual Update Flow

```
User action → update({ hasPreordered: true }) → jwt callback (trigger="update")
           → Merges update into JWT
           → session callback maps to session object
           → UI re-renders with new session
```

## Database Queries

The JWT callback runs these queries in parallel to populate entitlements:

```typescript
// 1. Check verified receipts (hasPreordered)
await prisma.receipt.count({
  where: { userId, status: "VERIFIED" }
});

// 2. Check delivered bonus claims (hasAgentCharterPack)
await prisma.bonusClaim.count({
  where: { userId, status: "DELIVERED" }
});

// 3. Check excerpt entitlements (hasExcerpt)
await prisma.entitlement.count({
  where: {
    userId,
    type: "EARLY_EXCERPT",
    status: { in: ["ACTIVE", "FULFILLED"] }
  }
});
```

## Common Patterns

### Conditional CTA Button

```typescript
import { auth } from "@/auth";

export default async function CTAButton() {
  const session = await auth();

  if (session?.user.hasPreordered) {
    return <button>View Your Order</button>;
  }

  return <button>Pre-order Now</button>;
}
```

### Gated Content

```typescript
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function BonusPackPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/downloads/bonus-pack");
  }

  if (!session.user.hasAgentCharterPack) {
    return (
      <div>
        <h1>Claim Your Bonus Pack</h1>
        <p>Upload your receipt to access the Agent Charter Pack.</p>
        <a href="/bonus-pack/claim">Claim Now</a>
      </div>
    );
  }

  return (
    <div>
      <h1>Your Bonus Pack</h1>
      <DownloadButton />
    </div>
  );
}
```

### User Profile Display

```typescript
import { auth } from "@/auth";
import { formatUserDisplayName } from "@/lib/auth";

export default async function UserProfile() {
  const session = await auth();

  if (!session?.user) return null;

  const { user } = session;

  return (
    <div className="profile-card">
      <img src={user.image || "/default-avatar.png"} alt={user.name || "User"} />
      <h2>{formatUserDisplayName(user)}</h2>
      <p className="text-muted">Member since {user.createdAt?.toLocaleDateString()}</p>

      <div className="badges">
        {user.hasPreordered && <span className="badge">Pre-order Customer</span>}
        {user.hasExcerpt && <span className="badge">Excerpt Access</span>}
        {user.hasAgentCharterPack && <span className="badge">Bonus Pack Claimed</span>}
      </div>
    </div>
  );
}
```

## TypeScript Support

All fields are fully typed via NextAuth type augmentation in `/src/types/next-auth.d.ts`:

```typescript
// IntelliSense will show all custom fields
const session = await auth();

session?.user.hasPreordered;        // boolean | undefined (autocomplete works!)
session?.user.hasExcerpt;           // boolean | undefined
session?.user.hasAgentCharterPack;  // boolean | undefined
session?.user.createdAt;            // Date | undefined
```

## Performance Notes

- **JWT Strategy:** Entitlements cached in JWT token, no DB query per request
- **Parallel Queries:** All entitlement checks run simultaneously
- **Token Refresh:** Entitlements updated when JWT expires (default: 24 hours)
- **Manual Refresh:** Use `update()` to force immediate refresh

## Troubleshooting

### Session doesn't include entitlements

1. Check user is authenticated: `session?.user` exists
2. Check JWT callback logs: Should see "JWT token populated with user entitlements"
3. Verify database has entitlement records for user
4. Try forcing session refresh: `await update()`

### Entitlements not updating after action

1. Call `update()` after the action completes
2. Or wait for JWT to expire (24 hours)
3. Check database to verify entitlement was created
4. Check logs for errors in JWT callback

### TypeScript errors

1. Ensure `/src/types/next-auth.d.ts` is in tsconfig includes
2. Restart TypeScript server in IDE
3. Check type augmentation is correct

## Related Documentation

- Main Implementation: `/AUTH_CONFIG_CALLBACKS_UPDATE.md`
- Auth Helpers: `/src/lib/auth.ts`
- Type Definitions: `/src/types/next-auth.d.ts`
- Database Schema: `/prisma/schema.prisma`
- NextAuth Docs: https://next-auth.js.org/

## Support

For issues or questions:
1. Check logs with structured logging enabled
2. Verify database has correct entitlement records
3. Review auth callback implementation in `/auth.config.ts`
4. Test with `console.log(session)` to inspect session object
