/**
 * A/B Test Wrapper Component
 *
 * Renders different content based on experiment variant assignment.
 * Automatically assigns users to variants and tracks assignments to GTM.
 *
 * @example
 * ```tsx
 * <ABTest experiment="hero-headline">
 *   <ABVariant name="A">
 *     <h1>The job title is dying.</h1>
 *   </ABVariant>
 *   <ABVariant name="B">
 *     <h1>Three people. Thirty thousand outcomes.</h1>
 *   </ABVariant>
 *   <ABVariant name="C">
 *     <h1>From AI-enabled to AI-born.</h1>
 *   </ABVariant>
 * </ABTest>
 * ```
 */

'use client';

import { type ReactNode, type ReactElement } from 'react';
import { useExperiment } from '@/hooks/useExperiment';
import { type ExperimentId } from '@/config/experiments';

// ==================== Types ====================

/**
 * Props for ABTest component
 */
export interface ABTestProps {
  /** Experiment ID from experiments.ts */
  experiment: ExperimentId | string;
  /** Child ABVariant components */
  children: ReactNode;
  /** Optional fallback content if no variant matches */
  fallback?: ReactNode;
  /** Optional className for wrapper */
  className?: string;
}

/**
 * Props for ABVariant component
 * Internal - used by ABTest to identify variants
 */
export interface ABVariantProps {
  /** Variant name/ID (A, B, C, etc.) */
  name: string;
  /** Content to render for this variant */
  children: ReactNode;
}

// ==================== Component ====================

/**
 * ABTest component
 * Wrapper that selects and renders the appropriate variant
 */
export function ABTest({ experiment, children, fallback, className }: ABTestProps) {
  // Get assigned variant for this experiment
  const variant = useExperiment(experiment);

  // Find matching variant from children
  const variantElement = findVariant(children, variant);

  // Render matched variant or fallback
  if (variantElement) {
    return className ? <div className={className}>{variantElement}</div> : <>{variantElement}</>;
  }

  if (fallback) {
    return className ? <div className={className}>{fallback}</div> : <>{fallback}</>;
  }

  // No match and no fallback - render nothing
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[ABTest] No matching variant found for experiment "${experiment}", variant "${variant}"`);
  }

  return null;
}

// ==================== Helper Functions ====================

/**
 * Find variant child matching the assigned variant ID
 *
 * @param children - React children (ABVariant components)
 * @param variantId - Assigned variant ID
 * @returns Matching variant content or null
 */
function findVariant(children: ReactNode, variantId: string): ReactNode {
  // Convert children to array for easier processing
  const childArray = Array.isArray(children) ? children : [children];

  // Find matching variant
  for (const child of childArray) {
    // Check if child is a React element with ABVariant props
    if (isVariantElement(child) && child.props.name === variantId) {
      return child.props.children;
    }
  }

  return null;
}

/**
 * Type guard to check if a ReactNode is a valid ABVariant element
 *
 * @param node - React node to check
 * @returns Whether node is a valid ABVariant
 */
function isVariantElement(node: ReactNode): node is ReactElement<ABVariantProps> {
  return (
    typeof node === 'object' &&
    node !== null &&
    'props' in node &&
    typeof (node as { props?: unknown }).props === 'object' &&
    (node as { props: unknown }).props !== null &&
    'name' in ((node as { props: Record<string, unknown> }).props)
  );
}

// ==================== ABVariant Component ====================

/**
 * ABVariant component
 * Defines content for a specific variant
 * This component doesn't render directly - it's used by ABTest to identify variants
 */
export function ABVariant({ children }: ABVariantProps) {
  return <>{children}</>;
}

// Mark component for better debugging
ABVariant.displayName = 'ABVariant';
ABTest.displayName = 'ABTest';
