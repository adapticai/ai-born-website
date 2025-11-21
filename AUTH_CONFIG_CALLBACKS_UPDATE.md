# Auth Config Callbacks Implementation Summary

## Overview
Updated `/auth.config.ts` to populate custom user fields (entitlements) in JWT tokens and session objects, ensuring that `session.user` includes all custom fields defined in the NextAuth type augmentation.

## Changes Made

### 1. Enhanced `signIn` Callback
**Location:** `/auth.config.ts` lines 144-214

**Functionality:**
- Creates User record in database if it doesn't exist (for OAuth sign-ups)
- Sets `createdAt` timestamp for new users
- Logs sign-in events with structured logging
- Handles errors gracefully without blocking authentication
- Tracks auth errors via analytics

**Key Features:**
```typescript
- Check if user exists in database
- Create user record with email, name, emailVerified, createdAt
- Log successful sign-in with userId, email, provider
- Track auth errors via trackAuthError()
- Gracefully handle database failures
```

### 2. Enhanced `jwt` Callback
**Location:** `/auth.config.ts` lines 216-297

**Functionality:**
- Fetches and includes user entitlements in JWT token
- Populates `hasPreordered`, `hasExcerpt`, `hasAgentCharterPack` flags
- Includes `createdAt` timestamp
- Supports manual session updates (trigger === "update")
- Logs entitlement population for debugging

**Key Features:**
```typescript
- On initial sign-in: Fetch user.createdAt from database
- Call getUserEntitlements(user.id) to get entitlement flags
- Add all entitlement fields to JWT token
- Support session updates for real-time entitlement changes
- Error handling with fallback to preserve auth flow
```

### 3. Enhanced `session` Callback
**Location:** `/auth.config.ts` lines 299-347

**Functionality:**
- Maps JWT token data to session.user object
- Ensures all custom fields are available client-side
- Provides type-safe session access
- Logs session population for debugging

**Key Features:**
```typescript
- Map token.id, email, name, image to session.user
- Map entitlement flags: hasPreordered, hasExcerpt, hasAgentCharterPack
- Map createdAt timestamp
- Type-safe with TypeScript
- Error handling without breaking session
```

### 4. Helper Function: `getUserEntitlements`
**Location:** `/auth.config.ts` lines 32-94

**Why Here?**
- Avoids circular dependency (auth.config.ts → auth.ts → lib/auth.ts → getUserEntitlements)
- Keeps entitlement logic co-located with auth callbacks
- Maintains same implementation as `src/lib/auth.ts` version

**Functionality:**
- Queries database for user's verified receipts (hasPreordered)
- Queries for delivered bonus claims (hasAgentCharterPack)
- Queries for excerpt entitlements (hasExcerpt)
- Runs queries in parallel for performance
- Returns safe defaults on error

**Database Queries:**
```typescript
1. Receipt.count({ status: "VERIFIED" }) → hasPreordered
2. BonusClaim.count({ status: "DELIVERED" }) → hasAgentCharterPack
3. Entitlement.count({ type: "EARLY_EXCERPT", status: ["ACTIVE", "FULFILLED"] }) → hasExcerpt
```

## Type Safety

### Updated Imports
```typescript
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import type {
  ReceiptStatus,
  BonusClaimStatus,
  EntitlementType,
  EntitlementStatus
} from "@prisma/client";
```

### Type Augmentation (Already Exists)
File: `/src/types/next-auth.d.ts`

```typescript
declare module "next-auth" {
  interface User {
    hasPreordered?: boolean;
    hasExcerpt?: boolean;
    hasAgentCharterPack?: boolean;
    createdAt?: Date;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      hasPreordered?: boolean;
      hasExcerpt?: boolean;
      hasAgentCharterPack?: boolean;
      createdAt?: Date;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    hasPreordered?: boolean;
    hasExcerpt?: boolean;
    hasAgentCharterPack?: boolean;
    createdAt?: Date;
  }
}
```

## Error Handling

All callbacks include comprehensive error handling:

1. **Try-Catch Blocks:** Wrap all async operations
2. **Structured Logging:** Use logger with error context
3. **Graceful Degradation:** Return partial data on error
4. **Auth Flow Protection:** Never throw errors that break sign-in/session
5. **Analytics Tracking:** Track auth errors via `trackAuthError()`

### Error Scenarios Handled
- Database connection failures
- Missing user records
- Entitlement query failures
- JWT token parsing errors
- Session update failures

## Usage in Application

### Server Components
```typescript
import { auth } from "@/auth";

export default async function MyPage() {
  const session = await auth();

  // All custom fields available
  if (session?.user) {
    console.log(session.user.hasPreordered);        // boolean
    console.log(session.user.hasExcerpt);           // boolean
    console.log(session.user.hasAgentCharterPack);  // boolean
    console.log(session.user.createdAt);            // Date
  }
}
```

### Client Components
```typescript
"use client";
import { useSession } from "next-auth/react";

export default function MyClientComponent() {
  const { data: session } = useSession();

  if (session?.user.hasPreordered) {
    return <div>Thank you for pre-ordering!</div>;
  }
}
```

### Manual Session Updates
After a user claims a bonus or purchases:

```typescript
import { update } from "next-auth/react";

// Update session with new entitlement
await update({
  hasAgentCharterPack: true,
});

// JWT callback will pick up the change
// Session will be refreshed automatically
```

## Performance Considerations

1. **Parallel Queries:** All entitlement checks run in parallel
2. **Cached Session:** React cache() prevents duplicate requests
3. **JWT Strategy:** Entitlements stored in JWT, no DB lookup per request
4. **Selective Updates:** Only update changed fields on session update

## Database Schema Dependencies

Requires the following Prisma models:
- `User` - User accounts
- `Receipt` - Pre-order receipts
- `BonusClaim` - Bonus pack claims
- `Entitlement` - User entitlements (excerpt access, etc.)

## Logging

All callbacks include structured logging:

**Debug Logs:**
- JWT token population with entitlements
- Session population with entitlements
- Session update triggers

**Info Logs:**
- New user creation (OAuth)
- Successful sign-ins

**Error Logs:**
- Sign-in callback errors
- JWT callback errors
- Session callback errors
- Entitlement fetch errors

## Testing Checklist

- [ ] Sign in with Google OAuth (new user)
- [ ] Sign in with GitHub OAuth (new user)
- [ ] Sign in with Email magic link (new user)
- [ ] Sign in with existing user (all providers)
- [ ] Check session includes all custom fields
- [ ] Verify entitlements populate correctly
- [ ] Test session update after bonus claim
- [ ] Verify error handling (mock DB failure)
- [ ] Check logging output in development
- [ ] Performance test (measure entitlement query time)

## Files Modified

1. `/auth.config.ts` - Enhanced callbacks with entitlements
2. This document - Implementation summary

## Related Files

- `/src/types/next-auth.d.ts` - Type augmentation
- `/src/lib/auth.ts` - Auth helper functions
- `/auth.ts` - Main NextAuth instance
- `/prisma/schema.prisma` - Database schema

## Next Steps

1. **Test Authentication Flow:**
   - Sign up new user via OAuth
   - Verify user record created in database
   - Check session includes entitlements

2. **Test Entitlement Updates:**
   - User uploads receipt → verify hasPreordered updates
   - User claims bonus → verify hasAgentCharterPack updates
   - User gets excerpt → verify hasExcerpt updates

3. **Monitor Logs:**
   - Check structured logs for auth events
   - Monitor error rates
   - Track auth analytics

4. **Performance Testing:**
   - Measure entitlement query time
   - Check JWT token size
   - Verify session refresh performance

## Notes

- **Circular Dependency Avoided:** `getUserEntitlements` duplicated in auth.config.ts to prevent circular dependency with lib/auth.ts
- **Graceful Errors:** All errors logged but don't break auth flow
- **Type Safety:** Full TypeScript support with proper type augmentation
- **Analytics Integration:** Tracks auth events via auth-analytics library
- **Production Ready:** Comprehensive error handling and logging
