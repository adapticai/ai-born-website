# Auth-Aware CTAButton Implementation Summary

## Overview

The CTAButton component has been enhanced with authentication-aware functionality, allowing buttons to automatically adapt their text, behavior, and analytics based on user authentication status.

## Changes Made

### 1. Updated Component: `/src/components/CTAButton.tsx`

**New Props Added:**
- `requireAuth?: boolean` - Whether authentication is required
- `isAuthenticated?: boolean` - Current authentication state
- `authAwareText?: AuthAwareText` - Text to display based on auth state
- `signInCallbackUrl?: string` - URL to redirect after sign-in
- `autoRedirectToSignIn?: boolean` - Whether to auto-redirect on click

**New Features:**
- Automatic sign-in redirect for unauthenticated users
- Dynamic button text based on auth state
- Enhanced analytics with auth state tracking
- Custom loading text support
- Data attributes for testing (`data-requires-auth`, `data-is-authenticated`)

### 2. New Documentation: `/src/components/AUTH_AWARE_CTA_BUTTON.md`

Comprehensive documentation including:
- Quick start guides
- Props reference
- Usage patterns
- Common use cases
- Best practices
- Migration guide
- Testing examples
- Troubleshooting guide

### 3. New Examples: `/src/components/examples/AuthAwareCTAButtonExample.tsx`

Eight real-world examples demonstrating:
1. Basic auth-aware button (server component)
2. Client-side auth-aware button
3. Custom auth handling (no auto-redirect)
4. Contextual callback URLs
5. Entitlement-based buttons
6. Loading states with auth
7. Multiple variants with auth
8. Analytics-rich auth buttons

## Key Features

### Auto Sign-In Redirect

When `requireAuth={true}` and user is not authenticated:
- Button automatically redirects to sign-in page
- Preserves callback URL for return after sign-in
- Tracks analytics event: `auth_required_cta_click`

### Dynamic Text

Button text adapts based on state:
```tsx
authAwareText={{
  authenticated: 'Download Now',
  unauthenticated: 'Sign In to Download',
  loading: 'Downloading...'  // optional
}}
```

### Enhanced Analytics

All clicks automatically track:
- `cta_id` - Button identifier
- `is_authenticated` - Authentication state
- Custom `eventData` - Your analytics properties

### Backward Compatibility

All new props are optional - existing CTAButton usage continues to work without changes.

## Usage Examples

### Simple Example

```tsx
// Server Component
import { CTAButton } from '@/components/CTAButton';
import { getCurrentUser } from '@/lib/auth';

export default async function MyPage() {
  const user = await getCurrentUser();

  return (
    <CTAButton
      ctaId="download-excerpt"
      requireAuth
      isAuthenticated={!!user}
      authAwareText={{
        authenticated: 'Download Now',
        unauthenticated: 'Sign In to Download'
      }}
      signInCallbackUrl="/excerpt"
      variant="primary"
    />
  );
}
```

### Advanced Example with Entitlements

```tsx
const user = await getCurrentUser();
const hasExcerpt = (user as any)?.hasExcerpt || false;

if (!user) {
  // Not signed in - prompt to sign in
  return (
    <CTAButton
      ctaId="excerpt-signin"
      requireAuth
      isAuthenticated={false}
      authAwareText={{
        authenticated: 'Download',
        unauthenticated: 'Sign In to Download'
      }}
    />
  );
}

if (!hasExcerpt) {
  // Signed in but no excerpt - show claim button
  return (
    <CTAButton
      ctaId="excerpt-claim"
      onClick={() => router.push('/excerpt/claim')}
    >
      Get Free Excerpt
    </CTAButton>
  );
}

// Has excerpt - show download button
return (
  <CTAButton
    ctaId="excerpt-download"
    onClick={() => downloadExcerpt()}
  >
    Download Your Excerpt
  </CTAButton>
);
```

## Benefits

1. **Consistency** - All auth-gated actions work the same way
2. **Less Code** - No manual auth checks or redirect logic needed
3. **Better Analytics** - Automatic tracking of auth state
4. **Better UX** - Clear messaging about auth requirements
5. **Better Testing** - Data attributes for test selectors
6. **Type Safety** - Full TypeScript support

## Integration Points

### Works With Existing Code

- **DualCTA component** - All new props are optional
- **RetailerMenu component** - Backward compatible
- **All page components** - No changes required to existing usage

### Integrates With Auth System

- Uses `getCurrentUser()` from `/src/lib/auth.ts`
- Uses `getSignInUrl()` helper for redirects
- Compatible with NextAuth session management

### Integrates With Analytics

- Uses existing `trackEvent()` from `/src/lib/analytics.ts`
- Follows established event naming conventions
- Adds `is_authenticated` to all events

## Testing

The component includes:
- Data attributes for test selectors
- Clear behavior contracts
- Example test cases in documentation

Example test:
```typescript
const button = screen.getByRole('button');
expect(button).toHaveAttribute('data-requires-auth', 'true');
expect(button).toHaveAttribute('data-is-authenticated', 'false');
expect(button).toHaveTextContent('Sign In to Download');
```

## Migration Path

**No breaking changes** - existing code continues to work.

To adopt auth-aware features:
1. Add `requireAuth` prop
2. Pass authentication state via `isAuthenticated`
3. Configure `authAwareText` for dynamic text
4. Optionally set `signInCallbackUrl` for custom redirect

## Files Modified

- `/src/components/CTAButton.tsx` - Enhanced with auth awareness

## Files Created

- `/src/components/AUTH_AWARE_CTA_BUTTON.md` - Comprehensive documentation
- `/src/components/examples/AuthAwareCTAButtonExample.tsx` - Usage examples
- `/AUTH_AWARE_CTA_SUMMARY.md` - This summary

## Next Steps

### Recommended Implementation Order

1. **Hero Section** - Add auth awareness to "Get Free Excerpt" button
2. **Bonus Claim** - Protect bonus claim flow with auth
3. **Media Kit** - Gate media kit downloads (if needed)
4. **Newsletter** - Integrate with newsletter sign-up

### Example Implementation: Hero Section

```tsx
// src/components/sections/BookHero.tsx
import { getCurrentUser } from '@/lib/auth';

export async function BookHero() {
  const user = await getCurrentUser();

  return (
    <section>
      {/* ... other content ... */}

      <DualCTA
        primaryText="Pre-order Hardcover"
        primaryAction={() => openRetailerMenu()}
        primaryProps={{
          ctaId: 'hero-preorder',
          eventData: { event: 'hero_cta_click', cta_id: 'preorder' }
        }}
        secondaryText={user ? 'Download Excerpt' : 'Sign In to Download'}
        secondaryAction={() => handleExcerpt()}
        secondaryProps={{
          ctaId: 'hero-excerpt',
          requireAuth: true,
          isAuthenticated: !!user,
          authAwareText: {
            authenticated: 'Download Excerpt',
            unauthenticated: 'Sign In to Download'
          },
          signInCallbackUrl: '/excerpt',
          eventData: { event: 'hero_cta_click', cta_id: 'excerpt' }
        }}
      />
    </section>
  );
}
```

## Support

- **Documentation**: `/src/components/AUTH_AWARE_CTA_BUTTON.md`
- **Examples**: `/src/components/examples/AuthAwareCTAButtonExample.tsx`
- **Component**: `/src/components/CTAButton.tsx`

## Questions?

Common questions answered in the main documentation:
- How do I customize sign-in behavior?
- How do I handle loading states?
- How do I check entitlements?
- How do I test auth-aware buttons?
- What analytics events are tracked?

See the [complete documentation](/src/components/AUTH_AWARE_CTA_BUTTON.md) for detailed answers.
