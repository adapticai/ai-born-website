import * as React from 'react';

import { cn } from '@/lib/utils';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Heading level
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /**
   * Visual variant (independent of semantic level)
   */
  variant?: 'h1' | 'h2' | 'h3' | 'h4';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Children elements
   */
  children: React.ReactNode;
}

/**
 * Heading component - Typography component for headings with brand styling
 *
 * Uses Outfit font family (from layout.tsx font-outfit variable) with consistent
 * sizing scale. Supports semantic HTML (as prop) separate from visual styling (variant).
 *
 * @example
 * ```tsx
 * <Heading as="h1" variant="h1">The job title is dying.</Heading>
 * <Heading as="h2" variant="h2">Key Frameworks</Heading>
 * ```
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as, variant, className, children, ...props }, ref) => {
    // Default: semantic level matches visual variant
    const Component = as || variant || 'h2';
    const visualVariant = (variant || as || 'h2') as 'h1' | 'h2' | 'h3' | 'h4';

    const variantStyles: Record<'h1' | 'h2' | 'h3' | 'h4', string> = {
      h1: 'font-outfit text-5xl font-bold leading-tight tracking-tight md:text-7xl',
      h2: 'font-outfit text-4xl font-bold leading-tight tracking-tight md:text-5xl',
      h3: 'font-outfit text-3xl font-semibold leading-snug tracking-tight md:text-4xl',
      h4: 'font-outfit text-2xl font-semibold leading-snug tracking-tight md:text-3xl',
    };

    return React.createElement(
      Component,
      {
        ref,
        className: cn(variantStyles[visualVariant], className),
        ...props,
      },
      children
    );
  }
);

Heading.displayName = 'Heading';
