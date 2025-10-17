'use client';

import * as React from 'react';

import { CTAButton } from '@/components/CTAButton';
import type { CTAButtonProps } from '@/components/CTAButton';
import { cn } from '@/lib/utils';


export interface DualCTAProps {
  /**
   * Primary CTA button text
   */
  primaryText: string;

  /**
   * Primary CTA button click handler
   */
  primaryAction: () => void;

  /**
   * Primary CTA button props (extends CTAButtonProps)
   */
  primaryProps?: Partial<Omit<CTAButtonProps, 'children' | 'onClick'>>;

  /**
   * Secondary CTA button text
   */
  secondaryText: string;

  /**
   * Secondary CTA button click handler
   */
  secondaryAction: () => void;

  /**
   * Secondary CTA button props (extends CTAButtonProps)
   */
  secondaryProps?: Partial<Omit<CTAButtonProps, 'children' | 'onClick'>>;

  /**
   * Layout orientation
   * - 'horizontal': side-by-side on all screen sizes
   * - 'responsive': side-by-side on desktop, stacked on mobile (default)
   * - 'vertical': stacked on all screen sizes
   */
  layout?: 'horizontal' | 'responsive' | 'vertical';

  /**
   * Container className
   */
  className?: string;
}

/**
 * DualCTA - Side-by-side or stacked CTA buttons
 *
 * Displays two CTA buttons in a flexible layout that adapts to screen size.
 * Commonly used in hero sections with a primary action (pre-order) and
 * secondary action (read excerpt, learn more, etc.).
 *
 * @example
 * ```tsx
 * <DualCTA
 *   primaryText="Pre-order Now"
 *   primaryAction={() => handlePreorder()}
 *   primaryProps={{
 *     ctaId: 'hero-preorder',
 *     variant: 'primary',
 *     eventData: { event: 'hero_cta_click', cta_id: 'preorder' }
 *   }}
 *   secondaryText="Read Free Excerpt"
 *   secondaryAction={() => handleExcerpt()}
 *   secondaryProps={{
 *     ctaId: 'hero-excerpt',
 *     variant: 'outline',
 *     eventData: { event: 'hero_cta_click', cta_id: 'excerpt' }
 *   }}
 * />
 * ```
 */
export function DualCTA({
  primaryText,
  primaryAction,
  primaryProps,
  secondaryText,
  secondaryAction,
  secondaryProps,
  layout = 'responsive',
  className,
}: DualCTAProps) {
  // Determine flex direction based on layout
  const layoutClasses = {
    horizontal: 'flex-row',
    responsive: 'flex-col sm:flex-row',
    vertical: 'flex-col',
  };

  return (
    <div
      className={cn(
        'flex gap-4 items-center',
        layoutClasses[layout],
        layout === 'responsive' && 'w-full sm:w-auto',
        className
      )}
    >
      <CTAButton
        variant="primary"
        {...primaryProps}
        onClick={primaryAction}
        ctaId={primaryProps?.ctaId || 'dual-cta-primary'}
        className={cn(
          layout === 'responsive' && 'w-full sm:w-auto',
          primaryProps?.className
        )}
      >
        {primaryText}
      </CTAButton>

      <CTAButton
        variant="outline"
        {...secondaryProps}
        onClick={secondaryAction}
        ctaId={secondaryProps?.ctaId || 'dual-cta-secondary'}
        className={cn(
          layout === 'responsive' && 'w-full sm:w-auto',
          secondaryProps?.className
        )}
      >
        {secondaryText}
      </CTAButton>
    </div>
  );
}
