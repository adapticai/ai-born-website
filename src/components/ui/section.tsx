import * as React from 'react';

import { cn } from '@/lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * ID for anchor links and navigation
   */
  id?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Children elements
   */
  children: React.ReactNode;
  /**
   * Full-width background (extends beyond container)
   */
  fullWidth?: boolean;
  /**
   * Background color variant
   */
  variant?: 'default' | 'light' | 'dark' | 'accent';
}

/**
 * Section component - Wrapper for page sections with consistent spacing
 *
 * Provides consistent padding, max-width container, and supports full-width backgrounds.
 * Used as the primary layout wrapper for all major page sections.
 *
 * @example
 * ```tsx
 * <Section id="hero" variant="dark">
 *   <h1>Hero Content</h1>
 * </Section>
 * ```
 */
export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ id, className, children, fullWidth = false, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: '',
      light: 'bg-brand-porcelain',
      dark: 'bg-brand-obsidian text-brand-porcelain',
      accent: 'bg-gradient-to-br from-brand-obsidian to-brand-obsidian/90',
    };

    return (
      <section
        ref={ref}
        id={id}
        className={cn(
          'relative py-16 md:py-24',
          variantStyles[variant],
          fullWidth ? 'w-full' : 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = 'Section';
