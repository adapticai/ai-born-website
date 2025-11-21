'use client';

import * as React from 'react';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button, type buttonVariants } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { getSignInUrl } from '@/lib/auth';
import { cn } from '@/lib/utils';
import type { AnalyticsEvent } from '@/types';

import type { VariantProps } from 'class-variance-authority';

/**
 * Extended button variants with brand-specific styles
 */
const ctaButtonVariants = {
  primary: 'bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 font-outfit font-semibold transition-colors rounded-none',
  secondary: 'bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-outfit font-semibold transition-colors rounded-none',
  ghost: 'hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-black dark:hover:text-white font-outfit rounded-none',
};

/**
 * Auth-aware text configuration
 */
export interface AuthAwareText {
  /**
   * Text to show when user is authenticated
   */
  authenticated: string;

  /**
   * Text to show when user is not authenticated
   */
  unauthenticated: string;

  /**
   * Optional loading text (defaults to authenticated text)
   */
  loading?: string;
}

export interface CTAButtonProps
  extends Omit<React.ComponentProps<typeof Button>, 'variant'>,
    Omit<VariantProps<typeof buttonVariants>, 'variant'> {
  /**
   * CTA identifier for analytics tracking
   */
  ctaId: string;

  /**
   * Analytics event data to track on click
   */
  eventData?: Partial<AnalyticsEvent>;

  /**
   * Button variant - uses brand-specific styles
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';

  /**
   * Loading state - shows spinner and disables button
   */
  loading?: boolean;

  /**
   * Optional click handler (called after analytics tracking)
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Whether to check authentication status
   * When true, button will adapt based on auth state
   */
  requireAuth?: boolean;

  /**
   * Whether the user is authenticated
   * Pass this from server component or session hook
   */
  isAuthenticated?: boolean;

  /**
   * Auth-aware text configuration
   * Customize button text based on authentication state
   */
  authAwareText?: AuthAwareText;

  /**
   * URL to redirect to after sign-in
   * If not provided, redirects to current page
   */
  signInCallbackUrl?: string;

  /**
   * Whether to automatically redirect to sign-in when clicked while unauthenticated
   * Default: true if requireAuth is true
   */
  autoRedirectToSignIn?: boolean;
}

/**
 * CTAButton - Analytics-enabled, auth-aware button component
 *
 * Extends shadcn Button with automatic click tracking, brand styling,
 * and authentication-aware behavior.
 *
 * Features:
 * - Automatic analytics tracking on click
 * - Auth-aware text and behavior
 * - Auto-redirect to sign-in for protected actions
 * - Loading states with custom text
 * - Brand-specific styling variants
 *
 * @example
 * ```tsx
 * // Basic usage
 * <CTAButton
 *   ctaId="hero-preorder"
 *   eventData={{ event: 'hero_cta_click', format: 'hardcover' }}
 *   variant="primary"
 * >
 *   Pre-order Now
 * </CTAButton>
 * ```
 *
 * @example
 * ```tsx
 * // Auth-aware button
 * <CTAButton
 *   ctaId="download-excerpt"
 *   requireAuth
 *   isAuthenticated={!!session}
 *   authAwareText={{
 *     authenticated: 'Download Now',
 *     unauthenticated: 'Sign In to Download'
 *   }}
 *   signInCallbackUrl="/excerpt"
 *   eventData={{ event: 'excerpt_download_click' }}
 *   variant="primary"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Custom auth handling
 * <CTAButton
 *   ctaId="bonus-claim"
 *   requireAuth
 *   isAuthenticated={!!session}
 *   autoRedirectToSignIn={false}
 *   onClick={(e) => {
 *     if (!session) {
 *       // Custom sign-in flow
 *       showSignInModal();
 *     } else {
 *       // Process claim
 *       processBonusClaim();
 *     }
 *   }}
 * >
 *   {session ? 'Claim Bonus' : 'Sign In to Claim'}
 * </CTAButton>
 * ```
 */
export function CTAButton({
  ctaId,
  eventData,
  variant = 'primary',
  loading = false,
  onClick,
  disabled,
  className,
  children,
  size = 'lg',
  requireAuth = false,
  isAuthenticated = false,
  authAwareText,
  signInCallbackUrl,
  autoRedirectToSignIn,
  ...props
}: CTAButtonProps) {
  const router = useRouter();

  // Determine if we should auto-redirect
  const shouldAutoRedirect = autoRedirectToSignIn ?? requireAuth;

  // Determine button text based on auth state
  const buttonText = React.useMemo(() => {
    if (!authAwareText) {
      return children;
    }

    if (loading && authAwareText.loading) {
      return authAwareText.loading;
    }

    if (requireAuth && !isAuthenticated) {
      return authAwareText.unauthenticated;
    }

    return authAwareText.authenticated;
  }, [authAwareText, children, loading, requireAuth, isAuthenticated]);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      // Track analytics event (always track, even if redirecting)
      if (eventData) {
        trackEvent({
          ...eventData,
          cta_id: ctaId,
          is_authenticated: isAuthenticated,
        } as AnalyticsEvent);
      }

      // Check authentication requirement
      if (requireAuth && !isAuthenticated) {
        // Track auth requirement with a generic event
        // Note: Not using trackEvent here as 'auth_required_cta_click' is not in AnalyticsEvent type
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'auth_required_cta_click',
            cta_id: ctaId,
          });
        }

        // Auto-redirect to sign-in if enabled
        if (shouldAutoRedirect) {
          event.preventDefault();
          const callbackUrl = signInCallbackUrl || window.location.pathname;
          router.push(getSignInUrl(callbackUrl));
          return;
        }
      }

      // Call custom onClick handler if provided
      if (onClick) {
        onClick(event);
      }
    },
    [
      ctaId,
      eventData,
      isAuthenticated,
      onClick,
      requireAuth,
      router,
      shouldAutoRedirect,
      signInCallbackUrl,
    ]
  );

  // Map variant to className
  const variantClassName = variant === 'outline'
    ? undefined // Use default shadcn outline variant
    : ctaButtonVariants[variant] || ctaButtonVariants.primary;

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || loading}
      className={cn(
        variantClassName,
        'relative',
        loading && 'cursor-not-allowed opacity-70',
        className
      )}
      variant={variant === 'outline' ? 'outline' : undefined}
      size={size}
      data-cta-id={ctaId}
      data-requires-auth={requireAuth}
      data-is-authenticated={isAuthenticated}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
      )}
      {buttonText}
    </Button>
  );
}
