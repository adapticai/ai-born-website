'use client';

import * as React from 'react';

import { motion, type HTMLMotionProps } from 'framer-motion';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';

import { cn } from '@/lib/utils';

export interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Children elements
   */
  children: React.ReactNode;
  /**
   * Enable hover animation
   */
  enableHover?: boolean;
  /**
   * Enable tap animation
   */
  enableTap?: boolean;
  /**
   * Custom hover scale
   */
  hoverScale?: number;
  /**
   * Custom tap scale
   */
  tapScale?: number;
  /**
   * Animation duration in seconds
   */
  duration?: number;
  /**
   * Disable reduced motion (use with caution)
   */
  disableReducedMotion?: boolean;
}

/**
 * AnimatedCard component - Card with Framer Motion animations
 *
 * Uses shadcn Card as the base component with smooth hover and tap animations.
 * Respects prefers-reduced-motion by default for accessibility.
 * Ideal for framework cards, feature cards, and interactive elements.
 *
 * @example
 * ```tsx
 * <AnimatedCard>
 *   <CardHeader>
 *     <CardTitle>Framework Title</CardTitle>
 *     <CardDescription>Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Card content here</p>
 *   </CardContent>
 * </AnimatedCard>
 * ```
 */
export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  (
    {
      className,
      children,
      enableHover = true,
      enableTap = true,
      hoverScale = 1.02,
      tapScale = 0.98,
      duration = 0.2,
      disableReducedMotion = false,
      ...props
    },
    ref
  ) => {
    // Check for reduced motion preference
    const [shouldReduceMotion, setShouldReduceMotion] = React.useState(false);

    React.useEffect(() => {
      if (disableReducedMotion) return;

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setShouldReduceMotion(mediaQuery.matches);

      const handleChange = (event: MediaQueryListEvent) => {
        setShouldReduceMotion(event.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }, [disableReducedMotion]);

    // Animation variants - using any to avoid Framer Motion Variants type complexity
    const variants: any = {
      initial: {
        scale: 1,
      },
      hover: {
        scale: shouldReduceMotion ? 1 : enableHover ? hoverScale : 1,
        transition: {
          duration,
          ease: 'easeOut',
        },
      },
      tap: {
        scale: shouldReduceMotion ? 1 : enableTap ? tapScale : 1,
        transition: {
          duration: duration * 0.5,
          ease: 'easeOut',
        },
      },
    };

    return (
      <motion.div
        ref={ref}
        variants={variants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className={cn('cursor-pointer', className)}
        {...props}
      >
        <Card
          className={cn(
            'transition-shadow duration-200 ease-out',
            enableHover && 'hover:shadow-xl hover:border-brand-cyan/50'
          )}
        >
          {children}
        </Card>
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

// Re-export Card subcomponents for convenience
export { CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
