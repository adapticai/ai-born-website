/**
 * Auth-Aware CTAButton Examples
 *
 * Demonstrates various use cases for the auth-aware CTAButton component.
 * Shows how to integrate with authentication state and customize behavior.
 *
 * @module components/examples/AuthAwareCTAButtonExample
 */

import * as React from 'react';

import { CTAButton } from '@/components/CTAButton';
import { getCurrentUser } from '@/lib/auth';

/**
 * Example 1: Basic Auth-Aware Button (Server Component)
 *
 * Fetches authentication state server-side and passes to CTAButton.
 * Best for initial page load when you want auth state available immediately.
 */
export async function BasicAuthAwareButton() {
  const user = await getCurrentUser();

  return (
    <CTAButton
      ctaId="download-excerpt"
      requireAuth
      isAuthenticated={!!user}
      authAwareText={{
        authenticated: 'Download Now',
        unauthenticated: 'Sign In to Download',
      }}
      signInCallbackUrl="/excerpt"
      eventData={{ event: 'lead_capture_submit', source: 'hero-excerpt' }}
      variant="primary"
    />
  );
}

/**
 * Example 2: Auth-Aware Button with Client Session
 *
 * For use in client components where you have session from useSession hook.
 * NOTE: This requires 'use client' and next-auth/react
 */
export function ClientAuthAwareButton() {
  // Uncomment if using next-auth/react in a client component:
  // const { data: session } = useSession();

  const session = null; // Replace with actual session hook

  return (
    <CTAButton
      ctaId="bonus-claim"
      requireAuth
      isAuthenticated={!!session}
      authAwareText={{
        authenticated: 'Claim Your Bonus',
        unauthenticated: 'Sign In to Claim',
        loading: 'Processing...',
      }}
      signInCallbackUrl="/bonus-claim"
      eventData={{ event: 'bonus_claim_submit', retailer: 'unknown' }}
      variant="primary"
    />
  );
}

/**
 * Example 3: Custom Auth Handling (No Auto-Redirect)
 *
 * Disables automatic redirect and provides custom onClick handler.
 * Useful when you want to show a modal or custom sign-in flow.
 */
export function CustomAuthHandlingButton() {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Custom logic here - could open a modal, show tooltip, etc.
    console.log('Custom auth handling');
  };

  return (
    <CTAButton
      ctaId="custom-download"
      requireAuth
      isAuthenticated={false}
      autoRedirectToSignIn={false}
      onClick={handleClick}
      authAwareText={{
        authenticated: 'Download',
        unauthenticated: 'Sign In Required',
      }}
      eventData={{ event: 'lead_capture_submit', source: 'hero-excerpt' }}
      variant="secondary"
    />
  );
}

/**
 * Example 4: Different Callback URLs by Context
 *
 * Shows how to customize the sign-in redirect based on where the button is used.
 */
export async function ContextualCallbackButton({ context }: { context: string }) {
  const user = await getCurrentUser();

  const callbackUrls = {
    hero: '/get-started',
    excerpt: '/excerpt/download',
    bonus: '/bonus-claim',
    presskit: '/media-kit',
  };

  const callbackUrl = callbackUrls[context as keyof typeof callbackUrls] || '/';

  return (
    <CTAButton
      ctaId={`${context}-cta`}
      requireAuth
      isAuthenticated={!!user}
      authAwareText={{
        authenticated: 'Continue',
        unauthenticated: 'Sign In to Continue',
      }}
      signInCallbackUrl={callbackUrl}
      variant="primary"
    />
  );
}

/**
 * Example 5: Entitlement-Based Button
 *
 * Shows different text/behavior based on user entitlements.
 * Requires checking user properties beyond just authentication.
 */
export async function EntitlementBasedButton() {
  const user = await getCurrentUser();

  // Type assertion for user with entitlements
  const hasExcerpt = (user as any)?.hasExcerpt || false;

  if (!user) {
    return (
      <CTAButton
        ctaId="excerpt-entitlement"
        requireAuth
        isAuthenticated={false}
        authAwareText={{
          authenticated: 'Download Excerpt',
          unauthenticated: 'Sign In to Get Excerpt',
        }}
        signInCallbackUrl="/excerpt"
        variant="primary"
      />
    );
  }

  if (!hasExcerpt) {
    return (
      <CTAButton
        ctaId="excerpt-claim"
        isAuthenticated
        onClick={() => {
          // Redirect to claim flow
          window.location.href = '/excerpt/claim';
        }}
        variant="primary"
      >
        Get Free Excerpt
      </CTAButton>
    );
  }

  return (
    <CTAButton
      ctaId="excerpt-download"
      isAuthenticated
      onClick={() => {
        // Direct download
        window.location.href = '/api/excerpt/download';
      }}
      variant="primary"
    >
      Download Your Excerpt
    </CTAButton>
  );
}

/**
 * Example 6: Loading State with Auth
 *
 * Demonstrates loading state management with auth-aware text.
 */
export function LoadingAuthButton() {
  const [loading, setLoading] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Process download/claim/etc
    } finally {
      setLoading(false);
    }
  };

  return (
    <CTAButton
      ctaId="async-download"
      requireAuth
      isAuthenticated={isAuthenticated}
      loading={loading}
      authAwareText={{
        authenticated: 'Download',
        unauthenticated: 'Sign In to Download',
        loading: 'Preparing Download...',
      }}
      onClick={handleClick}
      variant="primary"
    />
  );
}

/**
 * Example 7: Multiple Variants with Auth
 *
 * Shows how different button styles work with auth awareness.
 */
export async function MultiVariantAuthButtons() {
  const user = await getCurrentUser();
  const isAuthenticated = !!user;

  return (
    <div className="flex gap-4">
      {/* Primary variant */}
      <CTAButton
        ctaId="primary-auth"
        requireAuth
        isAuthenticated={isAuthenticated}
        authAwareText={{
          authenticated: 'Download',
          unauthenticated: 'Sign In',
        }}
        variant="primary"
      />

      {/* Secondary variant */}
      <CTAButton
        ctaId="secondary-auth"
        requireAuth
        isAuthenticated={isAuthenticated}
        authAwareText={{
          authenticated: 'Preview',
          unauthenticated: 'Sign In to Preview',
        }}
        variant="secondary"
      />

      {/* Ghost variant */}
      <CTAButton
        ctaId="ghost-auth"
        requireAuth
        isAuthenticated={isAuthenticated}
        authAwareText={{
          authenticated: 'Learn More',
          unauthenticated: 'Sign In for Details',
        }}
        variant="ghost"
      />
    </div>
  );
}

/**
 * Example 8: Analytics-Rich Auth Button
 *
 * Demonstrates comprehensive analytics tracking with auth state.
 */
export async function AnalyticsRichAuthButton({ source }: { source: string }) {
  const user = await getCurrentUser();

  return (
    <CTAButton
      ctaId={`excerpt-${source}`}
      requireAuth
      isAuthenticated={!!user}
      authAwareText={{
        authenticated: 'Download Excerpt',
        unauthenticated: 'Sign In to Download',
      }}
      signInCallbackUrl="/excerpt"
      variant="primary"
    />
  );
}

/**
 * Usage Notes:
 *
 * 1. **Server Components (Recommended for initial load)**
 *    - Use `getCurrentUser()` from `@/lib/auth`
 *    - Pass `isAuthenticated={!!user}` to CTAButton
 *    - Best performance, no client-side flash
 *
 * 2. **Client Components**
 *    - Use `useSession()` from next-auth/react (if needed)
 *    - Add 'use client' directive
 *    - Good for interactive components that need to update
 *
 * 3. **Auto-Redirect Behavior**
 *    - Default: `autoRedirectToSignIn` matches `requireAuth`
 *    - Set `autoRedirectToSignIn={false}` for custom handling
 *    - Tracks `auth_required_cta_click` event on redirect
 *
 * 4. **Analytics Events**
 *    - Always includes `cta_id` from the ctaId prop
 *    - Automatically adds `is_authenticated` boolean
 *    - Custom `eventData` merged with defaults
 *
 * 5. **Button Text Priority**
 *    - Loading + authAwareText.loading → use loading text
 *    - Unauthenticated + authAwareText → use unauthenticated text
 *    - Authenticated + authAwareText → use authenticated text
 *    - No authAwareText → use children prop
 *
 * 6. **Callback URLs**
 *    - Default: current pathname (window.location.pathname)
 *    - Custom: pass `signInCallbackUrl` prop
 *    - Automatically URL-encoded
 *
 * 7. **Data Attributes (for testing/debugging)**
 *    - `data-cta-id`: The CTA identifier
 *    - `data-requires-auth`: Whether auth is required
 *    - `data-is-authenticated`: Current auth state
 */
