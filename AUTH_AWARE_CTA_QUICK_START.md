# Auth-Aware CTAButton - Quick Start Guide

## TL;DR

The CTAButton now supports authentication-aware behavior. Add `requireAuth` and `isAuthenticated` props to make buttons adapt based on auth state.

```tsx
import { CTAButton } from '@/components/CTAButton';
import { getCurrentUser } from '@/lib/auth';

export default async function MyPage() {
  const user = await getCurrentUser();

  return (
    <CTAButton
      ctaId="download"
      requireAuth
      isAuthenticated={!!user}
      authAwareText={{
        authenticated: 'Download',
        unauthenticated: 'Sign In to Download'
      }}
    />
  );
}
```

## Common Patterns

### Pattern 1: Protected Download

```tsx
const user = await getCurrentUser();

<CTAButton
  ctaId="excerpt-download"
  requireAuth
  isAuthenticated={!!user}
  authAwareText={{
    authenticated: 'Download Excerpt',
    unauthenticated: 'Sign In to Download'
  }}
  signInCallbackUrl="/excerpt"
/>
```

**Result:**
- Not signed in → Shows "Sign In to Download", redirects to sign-in
- Signed in → Shows "Download Excerpt", executes download

### Pattern 2: Protected Action with Custom Handling

```tsx
<CTAButton
  ctaId="bonus-claim"
  requireAuth
  isAuthenticated={!!user}
  autoRedirectToSignIn={false}
  onClick={() => {
    if (!user) {
      showSignInModal();
    } else {
      processClaim();
    }
  }}
  authAwareText={{
    authenticated: 'Claim Bonus',
    unauthenticated: 'Sign In to Claim'
  }}
/>
```

**Result:**
- Not signed in → Shows "Sign In to Claim", calls custom handler
- Signed in → Shows "Claim Bonus", processes claim

### Pattern 3: Loading State

```tsx
const [loading, setLoading] = React.useState(false);

<CTAButton
  ctaId="download"
  requireAuth
  isAuthenticated={!!user}
  loading={loading}
  authAwareText={{
    authenticated: 'Download',
    unauthenticated: 'Sign In',
    loading: 'Downloading...'
  }}
  onClick={async () => {
    setLoading(true);
    await download();
    setLoading(false);
  }}
/>
```

**Result:**
- Loading → Shows "Downloading..." with spinner
- Not signed in → Shows "Sign In"
- Signed in → Shows "Download"

## New Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `requireAuth` | `boolean` | `false` | Require authentication |
| `isAuthenticated` | `boolean` | `false` | Current auth state |
| `authAwareText` | `object` | - | Dynamic text config |
| `signInCallbackUrl` | `string` | current page | Post-sign-in redirect |
| `autoRedirectToSignIn` | `boolean` | `requireAuth` | Auto-redirect behavior |

## AuthAwareText Config

```typescript
authAwareText={{
  authenticated: 'Text when signed in',
  unauthenticated: 'Text when signed out',
  loading: 'Text when loading' // optional
}}
```

## Getting Auth State

### Server Component (Recommended)

```tsx
import { getCurrentUser } from '@/lib/auth';

export default async function MyPage() {
  const user = await getCurrentUser();
  const isAuthenticated = !!user;

  return <CTAButton isAuthenticated={isAuthenticated} />;
}
```

### Client Component

```tsx
'use client';
import { useSession } from 'next-auth/react';

export function MyComponent() {
  const { data: session } = useSession();
  const isAuthenticated = !!session;

  return <CTAButton isAuthenticated={isAuthenticated} />;
}
```

## Analytics

All auth-aware buttons automatically track:

```javascript
{
  event: 'your_event_name',
  cta_id: 'your-cta-id',
  is_authenticated: true/false,
  ...your_custom_data
}
```

Plus, when auth is required but user is not authenticated:

```javascript
{
  event: 'auth_required_cta_click',
  cta_id: 'your-cta-id'
}
```

## Examples by Use Case

### Use Case: Download Gated Content

```tsx
const user = await getCurrentUser();

<CTAButton
  ctaId="download-content"
  requireAuth
  isAuthenticated={!!user}
  authAwareText={{
    authenticated: 'Download Now',
    unauthenticated: 'Sign In to Download'
  }}
  signInCallbackUrl="/downloads"
  onClick={() => downloadFile()}
/>
```

### Use Case: Claim Pre-order Bonus

```tsx
const user = await getCurrentUser();

<CTAButton
  ctaId="bonus-claim"
  requireAuth
  isAuthenticated={!!user}
  authAwareText={{
    authenticated: 'Claim Your Bonus',
    unauthenticated: 'Sign In to Claim'
  }}
  signInCallbackUrl="/bonus-claim"
  onClick={() => router.push('/bonus-claim')}
/>
```

### Use Case: Newsletter Sign-up

```tsx
const user = await getCurrentUser();

<CTAButton
  ctaId="newsletter"
  requireAuth
  isAuthenticated={!!user}
  authAwareText={{
    authenticated: 'Subscribe to Newsletter',
    unauthenticated: 'Sign In & Subscribe'
  }}
  signInCallbackUrl="/newsletter"
  onClick={() => subscribeToNewsletter()}
/>
```

### Use Case: Media Kit Access

```tsx
const user = await getCurrentUser();

// Option 1: No auth required (public)
<CTAButton
  ctaId="presskit-download"
  onClick={() => downloadPressKit()}
>
  Download Press Kit
</CTAButton>

// Option 2: Auth required (private)
<CTAButton
  ctaId="presskit-download"
  requireAuth
  isAuthenticated={!!user}
  authAwareText={{
    authenticated: 'Download Press Kit',
    unauthenticated: 'Sign In for Press Kit'
  }}
  onClick={() => downloadPressKit()}
/>
```

## Testing

Test auth-aware buttons using data attributes:

```typescript
// Find button
const button = screen.getByRole('button', {
  selector: '[data-cta-id="download"]'
});

// Check auth requirement
expect(button).toHaveAttribute('data-requires-auth', 'true');

// Check auth state
expect(button).toHaveAttribute('data-is-authenticated', 'false');

// Check text
expect(button).toHaveTextContent('Sign In to Download');
```

## Backward Compatibility

All new props are optional. Existing CTAButton usage works without changes:

```tsx
// This still works exactly as before
<CTAButton ctaId="old-button" onClick={() => action()}>
  Click Me
</CTAButton>
```

## Migration

### Before (Manual Auth Check)

```tsx
<CTAButton
  ctaId="download"
  onClick={() => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/downloads');
      return;
    }
    download();
  }}
>
  {session ? 'Download' : 'Sign In'}
</CTAButton>
```

### After (Auth-Aware)

```tsx
<CTAButton
  ctaId="download"
  requireAuth
  isAuthenticated={!!session}
  authAwareText={{
    authenticated: 'Download',
    unauthenticated: 'Sign In to Download'
  }}
  signInCallbackUrl="/downloads"
  onClick={() => download()}
/>
```

**Benefits:**
- Less code
- Automatic analytics
- Consistent behavior
- Better accessibility

## Troubleshooting

### Button not redirecting to sign-in

Make sure `requireAuth={true}`:

```tsx
<CTAButton
  requireAuth={true}  // ✅ Required
  isAuthenticated={false}
/>
```

### Button text not changing

Make sure you're passing `authAwareText`:

```tsx
<CTAButton
  requireAuth
  isAuthenticated={!!user}
  authAwareText={{  // ✅ Required for dynamic text
    authenticated: 'Download',
    unauthenticated: 'Sign In'
  }}
/>
```

### Want custom behavior instead of redirect

Set `autoRedirectToSignIn={false}`:

```tsx
<CTAButton
  requireAuth
  isAuthenticated={false}
  autoRedirectToSignIn={false}  // ✅ Disable auto-redirect
  onClick={customHandler}
/>
```

## Complete Documentation

For comprehensive documentation, see:
- [Full Documentation](/src/components/AUTH_AWARE_CTA_BUTTON.md)
- [Code Examples](/src/components/examples/AuthAwareCTAButtonExample.tsx)
- [Implementation Summary](/AUTH_AWARE_CTA_SUMMARY.md)

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│ Auth-Aware CTAButton Quick Reference                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Import                                                   │
│    import { CTAButton } from '@/components/CTAButton';      │
│    import { getCurrentUser } from '@/lib/auth';             │
│                                                             │
│ 2. Get auth state (server component)                       │
│    const user = await getCurrentUser();                     │
│                                                             │
│ 3. Use auth-aware props                                    │
│    <CTAButton                                               │
│      ctaId="my-button"                                      │
│      requireAuth                                            │
│      isAuthenticated={!!user}                               │
│      authAwareText={{                                       │
│        authenticated: 'Download',                           │
│        unauthenticated: 'Sign In'                           │
│      }}                                                     │
│      signInCallbackUrl="/downloads"                         │
│    />                                                       │
│                                                             │
│ Behavior:                                                   │
│   • Not auth'd → Shows "Sign In", redirects to sign-in     │
│   • Auth'd → Shows "Download", executes action             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
