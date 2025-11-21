# Auth-Aware CTAButton Component

## Overview

The `CTAButton` component now includes authentication-aware functionality, allowing buttons to automatically adapt their text, behavior, and analytics based on the user's authentication state.

## Features

### Core Capabilities

1. **Auth-Aware Text** - Display different button text based on authentication status
2. **Auto Sign-In Redirect** - Automatically redirect unauthenticated users to sign-in
3. **Custom Auth Handling** - Override default behavior with custom logic
4. **Enhanced Analytics** - Track authentication state with all button clicks
5. **Loading States** - Support custom loading text for async operations
6. **Flexible Callbacks** - Configure post-sign-in redirect URLs

## Quick Start

### Server Component (Recommended)

```tsx
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
      eventData={{ event: 'excerpt_download_click' }}
      variant="primary"
    />
  );
}
```

### Client Component

```tsx
'use client';

import { CTAButton } from '@/components/CTAButton';
import { useSession } from 'next-auth/react';

export function MyClientComponent() {
  const { data: session } = useSession();

  return (
    <CTAButton
      ctaId="bonus-claim"
      requireAuth
      isAuthenticated={!!session}
      authAwareText={{
        authenticated: 'Claim Bonus',
        unauthenticated: 'Sign In to Claim'
      }}
      variant="primary"
    />
  );
}
```

## Props Reference

### New Auth-Aware Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `requireAuth` | `boolean` | `false` | Whether authentication is required |
| `isAuthenticated` | `boolean` | `false` | Current authentication state |
| `authAwareText` | `AuthAwareText` | `undefined` | Text to display based on auth state |
| `signInCallbackUrl` | `string` | `window.location.pathname` | URL to redirect after sign-in |
| `autoRedirectToSignIn` | `boolean` | `requireAuth` | Whether to auto-redirect on click |

### AuthAwareText Interface

```typescript
interface AuthAwareText {
  authenticated: string;     // Text when user is signed in
  unauthenticated: string;   // Text when user is signed out
  loading?: string;          // Optional text during loading
}
```

### Existing Props (Still Supported)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ctaId` | `string` | **required** | Unique identifier for analytics |
| `eventData` | `Partial<AnalyticsEvent>` | `undefined` | Custom analytics data |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'outline'` | `'primary'` | Button style variant |
| `loading` | `boolean` | `false` | Loading state |
| `onClick` | `(event) => void` | `undefined` | Click handler |
| `disabled` | `boolean` | `false` | Disabled state |
| `size` | `ButtonSize` | `'lg'` | Button size |

## Usage Patterns

### Pattern 1: Basic Auth Gate

Simplest use case - require authentication to perform an action:

```tsx
<CTAButton
  ctaId="protected-download"
  requireAuth
  isAuthenticated={!!session}
  authAwareText={{
    authenticated: 'Download',
    unauthenticated: 'Sign In to Download'
  }}
/>
```

**Behavior:**
- If authenticated → shows "Download", executes normal onClick
- If not authenticated → shows "Sign In to Download", redirects to sign-in

### Pattern 2: Custom Auth Handling

Disable auto-redirect and provide custom logic:

```tsx
<CTAButton
  ctaId="custom-action"
  requireAuth
  isAuthenticated={!!session}
  autoRedirectToSignIn={false}
  onClick={(e) => {
    if (!session) {
      // Show custom modal, tooltip, etc.
      openSignInModal();
    } else {
      // Perform authenticated action
      performAction();
    }
  }}
  authAwareText={{
    authenticated: 'Perform Action',
    unauthenticated: 'Sign In Required'
  }}
/>
```

**Behavior:**
- Always shows button text based on auth state
- Never auto-redirects
- Executes custom onClick logic

### Pattern 3: Contextual Callbacks

Different post-sign-in destinations based on context:

```tsx
// In hero section
<CTAButton
  ctaId="hero-cta"
  requireAuth
  isAuthenticated={!!user}
  signInCallbackUrl="/get-started"
  authAwareText={{
    authenticated: 'Get Started',
    unauthenticated: 'Sign In to Start'
  }}
/>

// In media kit section
<CTAButton
  ctaId="media-kit-cta"
  requireAuth
  isAuthenticated={!!user}
  signInCallbackUrl="/media-kit"
  authAwareText={{
    authenticated: 'Download Media Kit',
    unauthenticated: 'Sign In for Media Kit'
  }}
/>
```

**Behavior:**
- Each button redirects to different page after sign-in
- User lands on context-appropriate destination

### Pattern 4: Loading States with Auth

Show custom text during async operations:

```tsx
const [loading, setLoading] = React.useState(false);

<CTAButton
  ctaId="async-download"
  requireAuth
  isAuthenticated={!!session}
  loading={loading}
  authAwareText={{
    authenticated: 'Download',
    unauthenticated: 'Sign In to Download',
    loading: 'Preparing Download...'
  }}
  onClick={async () => {
    setLoading(true);
    try {
      await downloadFile();
    } finally {
      setLoading(false);
    }
  }}
/>
```

**Behavior:**
- Shows appropriate text based on auth + loading state
- Disabled during loading
- Shows spinner icon automatically

### Pattern 5: Entitlement-Based Actions

Different behavior based on user entitlements:

```tsx
const user = await getCurrentUser();
const hasExcerpt = (user as any)?.hasExcerpt || false;

if (!user) {
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
  return (
    <CTAButton
      ctaId="excerpt-claim"
      isAuthenticated
      onClick={() => router.push('/excerpt/claim')}
    >
      Get Free Excerpt
    </CTAButton>
  );
}

return (
  <CTAButton
    ctaId="excerpt-download"
    isAuthenticated
    onClick={() => downloadExcerpt()}
  >
    Download Your Excerpt
  </CTAButton>
);
```

**Behavior:**
- Shows appropriate action based on user state
- Guides user through multi-step flow

## Analytics Integration

### Automatic Analytics Properties

All auth-aware buttons automatically track:

```typescript
{
  cta_id: string;           // From ctaId prop
  is_authenticated: boolean; // Automatically added
  ...eventData              // Your custom event data
}
```

### Auth Required Event

When unauthenticated user clicks auth-required button:

```typescript
{
  event: 'auth_required_cta_click',
  cta_id: string;  // Your button's ctaId
}
```

### Example Analytics Events

```tsx
<CTAButton
  ctaId="hero-preorder"
  requireAuth
  isAuthenticated={!!session}
  eventData={{
    event: 'preorder_click',
    format: 'hardcover',
    source: 'hero',
    campaign: 'launch-week'
  }}
/>
```

**Tracked events:**
1. If authenticated and clicked:
   ```js
   {
     event: 'preorder_click',
     cta_id: 'hero-preorder',
     is_authenticated: true,
     format: 'hardcover',
     source: 'hero',
     campaign: 'launch-week'
   }
   ```

2. If unauthenticated and clicked:
   ```js
   {
     event: 'preorder_click',
     cta_id: 'hero-preorder',
     is_authenticated: false,
     format: 'hardcover',
     source: 'hero',
     campaign: 'launch-week'
   }
   // AND
   {
     event: 'auth_required_cta_click',
     cta_id: 'hero-preorder'
   }
   ```

## Data Attributes

For testing and debugging, each auth-aware button includes:

```html
<button
  data-cta-id="download-excerpt"
  data-requires-auth="true"
  data-is-authenticated="true"
>
  Download Now
</button>
```

**Usage in tests:**

```typescript
// Find auth-required buttons
const authButtons = screen.getAllByRole('button', {
  selector: '[data-requires-auth="true"]'
});

// Check authentication state
expect(button).toHaveAttribute('data-is-authenticated', 'true');

// Verify CTA ID
expect(button).toHaveAttribute('data-cta-id', 'download-excerpt');
```

## Common Use Cases

### Use Case 1: Protected Downloads

```tsx
export async function ExcerptDownloadButton() {
  const user = await getCurrentUser();

  return (
    <CTAButton
      ctaId="excerpt-download"
      requireAuth
      isAuthenticated={!!user}
      authAwareText={{
        authenticated: 'Download Excerpt',
        unauthenticated: 'Sign In to Download'
      }}
      signInCallbackUrl="/excerpt"
      eventData={{ event: 'excerpt_download_click' }}
      onClick={async () => {
        window.location.href = '/api/excerpt/download';
      }}
      variant="primary"
    />
  );
}
```

### Use Case 2: Bonus Claim Flow

```tsx
export async function BonusClaimButton() {
  const user = await getCurrentUser();

  return (
    <CTAButton
      ctaId="bonus-claim"
      requireAuth
      isAuthenticated={!!user}
      authAwareText={{
        authenticated: 'Claim Your Bonus Pack',
        unauthenticated: 'Sign In to Claim Bonus'
      }}
      signInCallbackUrl="/bonus-claim"
      eventData={{ event: 'bonus_claim_click' }}
      onClick={() => {
        // Navigate to claim form
        window.location.href = '/bonus-claim';
      }}
      variant="primary"
    />
  );
}
```

### Use Case 3: Newsletter with Benefits

```tsx
export async function NewsletterSignupButton() {
  const user = await getCurrentUser();

  if (user) {
    // Already signed in - show different action
    return (
      <CTAButton
        ctaId="newsletter-preferences"
        onClick={() => router.push('/account/preferences')}
      >
        Manage Preferences
      </CTAButton>
    );
  }

  return (
    <CTAButton
      ctaId="newsletter-signup"
      requireAuth
      isAuthenticated={false}
      authAwareText={{
        authenticated: 'Subscribe',
        unauthenticated: 'Sign Up & Subscribe'
      }}
      signInCallbackUrl="/newsletter"
      eventData={{ event: 'newsletter_signup_click' }}
      variant="secondary"
    />
  );
}
```

### Use Case 4: Multi-Step Conversion Funnel

```tsx
export async function ConversionFunnelButton({ step }: { step: 1 | 2 | 3 }) {
  const user = await getCurrentUser();

  const config = {
    1: {
      authenticated: 'Continue to Step 2',
      unauthenticated: 'Sign In to Continue',
      callback: '/funnel/step-2',
      event: 'funnel_step_1_complete'
    },
    2: {
      authenticated: 'Continue to Step 3',
      unauthenticated: 'Sign In to Continue',
      callback: '/funnel/step-3',
      event: 'funnel_step_2_complete'
    },
    3: {
      authenticated: 'Complete Pre-Order',
      unauthenticated: 'Sign In to Pre-Order',
      callback: '/checkout',
      event: 'funnel_step_3_complete'
    }
  };

  const stepConfig = config[step];

  return (
    <CTAButton
      ctaId={`funnel-step-${step}`}
      requireAuth
      isAuthenticated={!!user}
      authAwareText={{
        authenticated: stepConfig.authenticated,
        unauthenticated: stepConfig.unauthenticated
      }}
      signInCallbackUrl={stepConfig.callback}
      eventData={{
        event: stepConfig.event,
        funnel_step: step,
        has_account: !!user
      }}
      variant="primary"
    />
  );
}
```

## Best Practices

### 1. Server-Side Auth Check (Preferred)

Always fetch authentication state server-side when possible:

```tsx
// ✅ Good - Server Component
export default async function MyPage() {
  const user = await getCurrentUser();
  return <CTAButton isAuthenticated={!!user} />;
}

// ❌ Avoid - Client Component with loading state
'use client';
export default function MyPage() {
  const { data: session, status } = useSession();
  if (status === 'loading') return <div>Loading...</div>;
  return <CTAButton isAuthenticated={!!session} />;
}
```

**Why:** Server-side auth eliminates loading states and improves perceived performance.

### 2. Meaningful Button Text

Use clear, action-oriented text:

```tsx
// ✅ Good - Clear action
authAwareText={{
  authenticated: 'Download Excerpt',
  unauthenticated: 'Sign In to Download'
}}

// ❌ Poor - Vague action
authAwareText={{
  authenticated: 'Click Here',
  unauthenticated: 'Sign In'
}}
```

### 3. Contextual Callbacks

Set appropriate post-sign-in destinations:

```tsx
// ✅ Good - Returns to relevant content
<CTAButton
  signInCallbackUrl="/excerpt"
  // User signs in and immediately sees excerpt page
/>

// ❌ Poor - Generic redirect
<CTAButton
  signInCallbackUrl="/"
  // User signs in but loses context
/>
```

### 4. Consistent Event Naming

Follow consistent analytics naming:

```tsx
// ✅ Good - Consistent naming
eventData={{
  event: 'excerpt_download_click',
  source: 'hero'
}}

// ❌ Poor - Inconsistent naming
eventData={{
  event: 'ExcerptDownloaded',
  from: 'topOfPage'
}}
```

### 5. Handle Loading States

Always manage loading states for async operations:

```tsx
// ✅ Good - Loading state managed
const [loading, setLoading] = React.useState(false);
<CTAButton
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

// ❌ Poor - No loading feedback
<CTAButton
  onClick={async () => {
    await download(); // User has no feedback
  }}
/>
```

## Migration Guide

### From Regular CTAButton

**Before:**
```tsx
<CTAButton
  ctaId="download"
  onClick={() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    download();
  }}
>
  {session ? 'Download' : 'Sign In'}
</CTAButton>
```

**After:**
```tsx
<CTAButton
  ctaId="download"
  requireAuth
  isAuthenticated={!!session}
  authAwareText={{
    authenticated: 'Download',
    unauthenticated: 'Sign In to Download'
  }}
  onClick={() => download()}
/>
```

**Benefits:**
- Less code
- Automatic analytics
- Consistent behavior
- Better accessibility (data attributes)

## Testing

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import { CTAButton } from '@/components/CTAButton';

describe('CTAButton - Auth Awareness', () => {
  it('shows authenticated text when user is signed in', () => {
    render(
      <CTAButton
        ctaId="test"
        requireAuth
        isAuthenticated={true}
        authAwareText={{
          authenticated: 'Download',
          unauthenticated: 'Sign In'
        }}
      />
    );

    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('shows unauthenticated text when user is signed out', () => {
    render(
      <CTAButton
        ctaId="test"
        requireAuth
        isAuthenticated={false}
        authAwareText={{
          authenticated: 'Download',
          unauthenticated: 'Sign In'
        }}
      />
    );

    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('sets correct data attributes', () => {
    const { container } = render(
      <CTAButton
        ctaId="test-id"
        requireAuth
        isAuthenticated={true}
      />
    );

    const button = container.querySelector('button');
    expect(button).toHaveAttribute('data-cta-id', 'test-id');
    expect(button).toHaveAttribute('data-requires-auth', 'true');
    expect(button).toHaveAttribute('data-is-authenticated', 'true');
  });
});
```

### Integration Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { CTAButton } from '@/components/CTAButton';

describe('CTAButton - Auth Flow', () => {
  it('redirects to sign-in when unauthenticated user clicks', () => {
    const mockPush = jest.fn();
    jest.mock('next/navigation', () => ({
      useRouter: () => ({ push: mockPush })
    }));

    render(
      <CTAButton
        ctaId="test"
        requireAuth
        isAuthenticated={false}
        signInCallbackUrl="/callback"
      />
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockPush).toHaveBeenCalledWith(
      '/auth/signin?callbackUrl=%2Fcallback'
    );
  });
});
```

## Troubleshooting

### Button text not changing

**Issue:** Button always shows the same text regardless of auth state.

**Solution:** Make sure you're passing `authAwareText` prop:

```tsx
// ❌ Missing authAwareText
<CTAButton requireAuth isAuthenticated={!!user}>
  Download
</CTAButton>

// ✅ With authAwareText
<CTAButton
  requireAuth
  isAuthenticated={!!user}
  authAwareText={{
    authenticated: 'Download',
    unauthenticated: 'Sign In'
  }}
/>
```

### Not redirecting to sign-in

**Issue:** Button doesn't redirect when clicked while unauthenticated.

**Solution:** Ensure `requireAuth` is true and `autoRedirectToSignIn` isn't false:

```tsx
// ✅ Will redirect
<CTAButton
  requireAuth={true}
  isAuthenticated={false}
/>

// ❌ Won't redirect
<CTAButton
  requireAuth={true}
  isAuthenticated={false}
  autoRedirectToSignIn={false}
/>
```

### Auth state not updating

**Issue:** Button doesn't reflect current auth state.

**Solution:** Make sure you're passing current auth state, not stale data:

```tsx
// ✅ Fresh auth state
const user = await getCurrentUser();
<CTAButton isAuthenticated={!!user} />

// ❌ Stale/cached state
const isAuth = localStorage.getItem('isAuth'); // Don't do this
<CTAButton isAuthenticated={!!isAuth} />
```

## API Reference

See the [CTAButton component source](/Users/iroselli/ai-born-website/src/components/CTAButton.tsx) for complete prop definitions and implementation details.

See [usage examples](/Users/iroselli/ai-born-website/src/components/examples/AuthAwareCTAButtonExample.tsx) for comprehensive code samples.

## Related Documentation

- [Authentication System](/Users/iroselli/ai-born-website/AUTH_QUICK_START.md)
- [Analytics Integration](/Users/iroselli/ai-born-website/ANALYTICS_QUICKSTART.md)
- [Component Library](/Users/iroselli/ai-born-website/src/components/ui/)
