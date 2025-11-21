/**
 * A/B Testing React Hooks
 *
 * Custom hooks for integrating A/B tests into React components:
 * - useExperiment: Get assigned variant for an experiment
 * - useTrackExperiment: Track conversion events for experiments
 *
 * These hooks handle all the complexity of variant assignment,
 * persistence, and analytics tracking.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getVariant, trackExperiment as trackExperimentLib } from '@/lib/ab-testing';
import { getExperiment } from '@/config/experiments';

// ==================== useExperiment Hook ====================

/**
 * Get assigned variant for an experiment
 * Handles variant assignment, persistence, and returns the variant ID
 *
 * @param experimentId - Experiment ID from experiments.ts
 * @returns Assigned variant ID (A, B, C, etc.)
 *
 * @example
 * ```tsx
 * function HeroSection() {
 *   const variant = useExperiment('hero-headline');
 *
 *   const headline = {
 *     A: 'The job title is dying.',
 *     B: 'Three people. Thirty thousand outcomes.',
 *     C: 'From AI-enabled to AI-born.',
 *   }[variant];
 *
 *   return <h1>{headline}</h1>;
 * }
 * ```
 */
export function useExperiment(experimentId: string): string {
  // Get experiment configuration
  const experiment = getExperiment(experimentId);

  // State for variant (initially undefined for SSR)
  const [variant, setVariant] = useState<string>(() => {
    // Return first variant as default (will be updated on client)
    return experiment?.variants[0]?.id || 'A';
  });

  // Effect to assign variant on client side
  useEffect(() => {
    if (!experiment) {
      console.warn(`[useExperiment] Experiment not found: ${experimentId}`);
      return;
    }

    // Get or assign variant
    const assignedVariant = getVariant(experimentId, experiment);
    setVariant(assignedVariant);
  }, [experimentId, experiment]);

  return variant;
}

// ==================== useTrackExperiment Hook ====================

/**
 * Track conversion events for experiments
 * Returns a function to track conversions with proper experiment context
 *
 * @param experimentId - Experiment ID from experiments.ts
 * @returns Track function for logging conversions
 *
 * @example
 * ```tsx
 * function CTAButton() {
 *   const variant = useExperiment('cta-label');
 *   const trackConversion = useTrackExperiment('cta-label');
 *
 *   const handleClick = () => {
 *     trackConversion('hero_cta_click', undefined, {
 *       cta_id: 'preorder',
 *       format: 'hardcover',
 *     });
 *   };
 *
 *   return <button onClick={handleClick}>Pre-order Now</button>;
 * }
 * ```
 */
export function useTrackExperiment(experimentId: string) {
  /**
   * Track a conversion event for this experiment
   *
   * @param eventName - Name of the conversion event
   * @param value - Optional conversion value
   * @param metadata - Optional additional metadata
   */
  const trackConversion = useCallback(
    (eventName: string, value?: number, metadata?: Record<string, unknown>) => {
      trackExperimentLib(experimentId, eventName, value, metadata);
    },
    [experimentId]
  );

  return trackConversion;
}

// ==================== useExperimentVariant Hook ====================

/**
 * Get experiment variant with additional metadata
 * Returns both variant ID and full experiment configuration
 *
 * @param experimentId - Experiment ID from experiments.ts
 * @returns Experiment metadata and variant
 *
 * @example
 * ```tsx
 * function Component() {
 *   const { variant, variantName, experiment } = useExperimentVariant('hero-headline');
 *
 *   return (
 *     <div>
 *       <p>Experiment: {experiment?.name}</p>
 *       <p>Variant: {variantName}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useExperimentVariant(experimentId: string) {
  const variant = useExperiment(experimentId);
  const experiment = getExperiment(experimentId);

  const variantConfig = experiment?.variants.find(v => v.id === variant);

  return {
    variant,
    variantName: variantConfig?.name || variant,
    variantDescription: variantConfig?.description,
    experiment,
    isActive: experiment?.active || false,
  };
}

// ==================== useMultipleExperiments Hook ====================

/**
 * Get variants for multiple experiments at once
 * Useful when multiple experiments affect the same component
 *
 * @param experimentIds - Array of experiment IDs
 * @returns Map of experiment ID to variant ID
 *
 * @example
 * ```tsx
 * function HeroSection() {
 *   const variants = useMultipleExperiments([
 *     'hero-headline',
 *     'cta-label',
 *     'bonus-placement'
 *   ]);
 *
 *   const headline = getHeadlineForVariant(variants['hero-headline']);
 *   const ctaLabel = getCTAForVariant(variants['cta-label']);
 *
 *   return (
 *     <div>
 *       <h1>{headline}</h1>
 *       <button>{ctaLabel}</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useMultipleExperiments(experimentIds: string[]): Record<string, string> {
  const [variants, setVariants] = useState<Record<string, string>>(() => {
    // Initialize with first variant of each experiment
    return experimentIds.reduce((acc, id) => {
      const experiment = getExperiment(id);
      acc[id] = experiment?.variants[0]?.id || 'A';
      return acc;
    }, {} as Record<string, string>);
  });

  useEffect(() => {
    const newVariants: Record<string, string> = {};

    for (const experimentId of experimentIds) {
      const experiment = getExperiment(experimentId);

      if (!experiment) {
        console.warn(`[useMultipleExperiments] Experiment not found: ${experimentId}`);
        continue;
      }

      newVariants[experimentId] = getVariant(experimentId, experiment);
    }

    setVariants(newVariants);
  }, [experimentIds]);

  return variants;
}

// ==================== useExperimentTracking Hook ====================

/**
 * Automatic experiment tracking with common events
 * Provides pre-configured tracking functions for common conversion events
 *
 * @param experimentId - Experiment ID from experiments.ts
 * @returns Object with tracking functions for common events
 *
 * @example
 * ```tsx
 * function HeroSection() {
 *   const variant = useExperiment('hero-headline');
 *   const { trackCTAClick, trackPreorderClick, trackLeadCapture } = useExperimentTracking('hero-headline');
 *
 *   return (
 *     <div>
 *       <button onClick={() => trackCTAClick('preorder')}>
 *         Pre-order Now
 *       </button>
 *       <button onClick={() => trackCTAClick('excerpt')}>
 *         Get Excerpt
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useExperimentTracking(experimentId: string) {
  const trackConversion = useTrackExperiment(experimentId);

  return {
    /**
     * Track hero CTA click
     * @param ctaId - CTA identifier ('preorder' or 'excerpt')
     * @param metadata - Additional metadata
     */
    trackCTAClick: useCallback(
      (ctaId: 'preorder' | 'excerpt', metadata?: Record<string, unknown>) => {
        trackConversion('hero_cta_click', undefined, { cta_id: ctaId, ...metadata });
      },
      [trackConversion]
    ),

    /**
     * Track pre-order click
     * @param retailer - Retailer name
     * @param metadata - Additional metadata
     */
    trackPreorderClick: useCallback(
      (retailer: string, metadata?: Record<string, unknown>) => {
        trackConversion('preorder_click', undefined, { retailer, ...metadata });
      },
      [trackConversion]
    ),

    /**
     * Track lead capture submission
     * @param source - Lead capture source
     * @param success - Whether submission was successful
     */
    trackLeadCapture: useCallback(
      (source: string, success: boolean = true) => {
        trackConversion('lead_capture_submit', undefined, { source, success });
      },
      [trackConversion]
    ),

    /**
     * Track bonus claim submission
     * @param retailer - Retailer name
     * @param success - Whether submission was successful
     */
    trackBonusClaim: useCallback(
      (retailer: string, success: boolean = true) => {
        trackConversion('bonus_claim_submit', undefined, { retailer, success });
      },
      [trackConversion]
    ),

    /**
     * Track scroll depth milestone
     * @param percentage - Scroll depth percentage (25, 50, 75, 100)
     */
    trackScrollDepth: useCallback(
      (percentage: 25 | 50 | 75 | 100) => {
        trackConversion(`scroll_depth_${percentage}`, undefined, { pct: percentage });
      },
      [trackConversion]
    ),

    /**
     * Track framework card open
     * @param slug - Framework slug
     */
    trackFrameworkOpen: useCallback(
      (slug: string) => {
        trackConversion('framework_card_open', undefined, { slug });
      },
      [trackConversion]
    ),

    /**
     * Track retailer menu open
     */
    trackRetailerMenuOpen: useCallback(() => {
      trackConversion('retailer_menu_open');
    }, [trackConversion]),

    /**
     * Track generic conversion event
     * @param eventName - Event name
     * @param value - Optional conversion value
     * @param metadata - Optional metadata
     */
    track: trackConversion,
  };
}
