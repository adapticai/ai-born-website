import * as React from 'react';

import { cn } from '@/lib/utils';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * Text variant
   */
  variant?: 'body' | 'large' | 'small' | 'caption';
  /**
   * HTML element to render
   */
  as?: 'p' | 'span' | 'div';
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
 * Text component - Body text component with Inter font and variants
 *
 * Uses Inter font family (from layout.tsx font-inter variable) for optimal
 * readability. Provides consistent sizing and line-height for body text.
 *
 * @example
 * ```tsx
 * <Text variant="large">
 *   A definitive blueprint for organisations designed around autonomous intelligence.
 * </Text>
 * <Text variant="body">Regular body text for descriptions.</Text>
 * <Text variant="small">Fine print and auxiliary text.</Text>
 * ```
 */
export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ variant = 'body', as = 'p', className, children, ...props }, ref) => {
    const Component = as;

    const variantStyles = {
      large: 'font-inter text-xl leading-relaxed md:text-2xl',
      body: 'font-inter text-base leading-relaxed',
      small: 'font-inter text-sm leading-normal',
      caption: 'font-inter text-xs leading-normal text-muted-foreground',
    };

    return React.createElement(
      Component,
      {
        ref,
        className: cn(variantStyles[variant], className),
        ...props,
      },
      children
    );
  }
);

Text.displayName = 'Text';
