'use client';

import * as React from 'react';

import NextLink from 'next/link';

import { ExternalLink } from 'lucide-react';

import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Link destination
   */
  href: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Children elements
   */
  children: React.ReactNode;
  /**
   * Show external link icon
   */
  showExternalIcon?: boolean;
  /**
   * Track analytics event on click
   */
  trackClick?: boolean;
  /**
   * Custom analytics event data
   */
  analyticsData?: Record<string, unknown>;
  /**
   * Force external link behavior
   */
  external?: boolean;
}

/**
 * Link component - Enhanced Next.js Link with analytics tracking
 *
 * Automatically detects external links and opens them in new tabs.
 * Tracks outbound link clicks using the analytics system.
 * Optionally displays an external link icon for visual indication.
 *
 * @example
 * ```tsx
 * // Internal link
 * <Link href="/about">About Us</Link>
 *
 * // External link with tracking
 * <Link href="https://example.com" showExternalIcon>
 *   Visit Example
 * </Link>
 *
 * // Custom analytics tracking
 * <Link
 *   href="/pre-order"
 *   analyticsData={{ event: 'preorder_click', source: 'hero' }}
 * >
 *   Pre-order Now
 * </Link>
 * ```
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      href,
      className,
      children,
      showExternalIcon = false,
      trackClick = true,
      analyticsData,
      external: forceExternal = false,
      onClick,
      ...props
    },
    ref
  ) => {
    // Detect if link is external
    const isExternal =
      forceExternal ||
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('//');

    // Handle click events
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      // Track analytics for external links
      if (trackClick && isExternal) {
        // Type assertion for generic event data - will be properly typed in actual analytics events
        trackEvent({
          event: 'outbound_link_click',
          link_url: href,
          link_text: typeof children === 'string' ? children : 'Link',
          ...analyticsData,
        } as any);
      }

      // Call custom onClick handler if provided
      if (onClick) {
        onClick(event);
      }
    };

    // Common link styling
    const linkStyles = cn(
      'inline-flex items-center gap-1 transition-colors hover:text-brand-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2',
      className
    );

    // Render external link
    if (isExternal) {
      return (
        <a
          ref={ref}
          href={href}
          className={linkStyles}
          onClick={handleClick}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
          {showExternalIcon && (
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          )}
        </a>
      );
    }

    // Render internal Next.js link
    return (
      <NextLink
        ref={ref}
        href={href}
        className={linkStyles}
        onClick={handleClick}
        {...props}
      >
        {children}
      </NextLink>
    );
  }
);

Link.displayName = 'Link';
