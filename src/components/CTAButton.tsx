'use client';

import * as React from 'react';

import type { VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import type { AnalyticsEvent } from '@/types';

/**
 * Extended button variants with brand-specific styles
 */
const ctaButtonVariants = {
  primary: 'bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 font-outfit font-semibold transition-colors rounded-none',
  secondary: 'bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-outfit font-semibold transition-colors rounded-none',
  ghost: 'hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-black dark:hover:text-white font-outfit rounded-none',
};

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
}

/**
 * CTAButton - Analytics-enabled button component
 *
 * Extends shadcn Button with automatic click tracking and brand styling.
 * Supports loading states and custom analytics event data.
 *
 * @example
 * ```tsx
 * <CTAButton
 *   ctaId="hero-preorder"
 *   eventData={{ event: 'hero_cta_click', format: 'hardcover' }}
 *   variant="primary"
 * >
 *   Pre-order Now
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
  ...props
}: CTAButtonProps) {
  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      // Track analytics event
      if (eventData) {
        trackEvent({
          ...eventData,
          cta_id: ctaId,
        } as AnalyticsEvent);
      }

      // Call custom onClick handler if provided
      if (onClick) {
        onClick(event);
      }
    },
    [ctaId, eventData, onClick]
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
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
      )}
      {children}
    </Button>
  );
}
