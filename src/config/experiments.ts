/**
 * A/B Test Experiment Definitions
 * Based on CLAUDE.md test candidates:
 * - Hero headline variants (3 options)
 * - CTA label variants (2 options)
 * - Bonus placement variants (2 options)
 *
 * All experiments are configured with proper traffic allocation,
 * variant weights, and tracking integration.
 */

import { type Experiment } from '@/lib/ab-testing';

// ==================== Experiment IDs ====================

/**
 * Enum of all experiment IDs
 * Used for type-safe experiment references
 */
export const ExperimentIds = {
  HERO_HEADLINE: 'hero-headline',
  CTA_LABEL: 'cta-label',
  BONUS_PLACEMENT: 'bonus-placement',
} as const;

export type ExperimentId = typeof ExperimentIds[keyof typeof ExperimentIds];

// ==================== Experiment Definitions ====================

/**
 * Hero Headline A/B Test
 *
 * Tests three different headline variants to optimize engagement:
 * - Variant A: "The job title is dying." (provocative, labour-focused)
 * - Variant B: "Three people. Thirty thousand outcomes." (scale/efficiency focus)
 * - Variant C: "From AI-enabled to AI-born." (transformation narrative)
 *
 * Primary metric: Hero CTA click-through rate
 * Secondary metrics: Scroll depth, time on page, pre-order conversion
 */
export const heroHeadlineExperiment: Experiment = {
  id: ExperimentIds.HERO_HEADLINE,
  name: 'Hero Headline Variant Test',
  description: 'Test three different headline variants to maximize engagement and conversions',
  active: true,
  variants: [
    {
      id: 'A',
      name: 'Labour Focus',
      weight: 0.33,
      description: 'The job title is dying.',
    },
    {
      id: 'B',
      name: 'Scale Focus',
      weight: 0.33,
      description: 'Three people. Thirty thousand outcomes.',
    },
    {
      id: 'C',
      name: 'Transformation Focus',
      weight: 0.34,
      description: 'From AI-enabled to AI-born.',
    },
  ],
  trafficAllocation: 1.0, // 100% of users
  // startDate: '2025-10-18T00:00:00Z', // Uncomment to set start date
  // endDate: '2025-11-18T00:00:00Z',   // Uncomment to set end date (30 days)
};

/**
 * CTA Label A/B Test
 *
 * Tests two different call-to-action labels:
 * - Variant A: "Pre-order now" (urgency, action-oriented)
 * - Variant B: "Reserve your copy" (exclusivity, commitment)
 *
 * Primary metric: CTA click-through rate
 * Secondary metrics: Retailer menu open rate, pre-order conversion
 */
export const ctaLabelExperiment: Experiment = {
  id: ExperimentIds.CTA_LABEL,
  name: 'CTA Label Variant Test',
  description: 'Test different CTA labels to optimize click-through rate',
  active: true,
  variants: [
    {
      id: 'A',
      name: 'Pre-order Now',
      weight: 0.5,
      description: 'Pre-order now (urgency)',
    },
    {
      id: 'B',
      name: 'Reserve Your Copy',
      weight: 0.5,
      description: 'Reserve your copy (exclusivity)',
    },
  ],
  trafficAllocation: 1.0,
};

/**
 * Bonus Placement A/B Test
 *
 * Tests two different placements for pre-order bonus:
 * - Variant A: Hero section (immediate visibility, high attention)
 * - Variant B: Dedicated section (focused presentation, more detail)
 *
 * Primary metric: Bonus claim rate
 * Secondary metrics: Pre-order conversion, email capture rate
 */
export const bonusPlacementExperiment: Experiment = {
  id: ExperimentIds.BONUS_PLACEMENT,
  name: 'Bonus Placement Test',
  description: 'Test different placements for pre-order bonus to maximize claims',
  active: true,
  variants: [
    {
      id: 'A',
      name: 'Hero Section',
      weight: 0.5,
      description: 'Display bonus in hero section',
    },
    {
      id: 'B',
      name: 'Dedicated Section',
      weight: 0.5,
      description: 'Display bonus in dedicated section',
    },
  ],
  trafficAllocation: 1.0,
};

// ==================== Experiment Registry ====================

/**
 * Central registry of all experiments
 * Used by components and hooks to access experiment configurations
 */
export const experiments: Record<string, Experiment> = {
  [ExperimentIds.HERO_HEADLINE]: heroHeadlineExperiment,
  [ExperimentIds.CTA_LABEL]: ctaLabelExperiment,
  [ExperimentIds.BONUS_PLACEMENT]: bonusPlacementExperiment,
};

/**
 * Get experiment by ID
 *
 * @param experimentId - Experiment ID
 * @returns Experiment configuration or undefined
 */
export function getExperiment(experimentId: string): Experiment | undefined {
  return experiments[experimentId];
}

/**
 * Get all active experiments
 *
 * @returns Array of active experiments
 */
export function getActiveExperiments(): Experiment[] {
  return Object.values(experiments).filter(exp => exp.active);
}

/**
 * Get all experiments
 *
 * @returns Array of all experiments
 */
export function getAllExperiments(): Experiment[] {
  return Object.values(experiments);
}

// ==================== Experiment Content Variants ====================

/**
 * Hero headline content variants
 * Maps variant ID to actual headline text
 */
export const heroHeadlineVariants = {
  A: 'The job title is dying.',
  B: 'Three people. Thirty thousand outcomes.',
  C: 'From AI-enabled to AI-born.',
} as const;

/**
 * CTA label content variants
 * Maps variant ID to actual CTA text
 */
export const ctaLabelVariants = {
  A: 'Pre-order now',
  B: 'Reserve your copy',
} as const;

/**
 * Bonus placement content variants
 * Maps variant ID to placement location
 */
export const bonusPlacementVariants = {
  A: 'hero',
  B: 'dedicated',
} as const;

// ==================== Type Exports ====================

export type HeroHeadlineVariant = keyof typeof heroHeadlineVariants;
export type CTALabelVariant = keyof typeof ctaLabelVariants;
export type BonusPlacementVariant = keyof typeof bonusPlacementVariants;

// ==================== Helper Functions ====================

/**
 * Get hero headline text for a variant
 *
 * @param variantId - Variant ID (A, B, or C)
 * @returns Headline text
 */
export function getHeroHeadline(variantId: string): string {
  return heroHeadlineVariants[variantId as HeroHeadlineVariant] || heroHeadlineVariants.A;
}

/**
 * Get CTA label text for a variant
 *
 * @param variantId - Variant ID (A or B)
 * @returns CTA label text
 */
export function getCTALabel(variantId: string): string {
  return ctaLabelVariants[variantId as CTALabelVariant] || ctaLabelVariants.A;
}

/**
 * Get bonus placement location for a variant
 *
 * @param variantId - Variant ID (A or B)
 * @returns Placement location
 */
export function getBonusPlacement(variantId: string): 'hero' | 'dedicated' {
  return bonusPlacementVariants[variantId as BonusPlacementVariant] || bonusPlacementVariants.A;
}

// ==================== Conversion Event Names ====================

/**
 * Standard conversion event names for experiments
 * Used with trackExperiment() function
 */
export const ConversionEvents = {
  // Hero CTA events
  HERO_CTA_CLICK: 'hero_cta_click',
  HERO_EXCERPT_CLICK: 'hero_excerpt_click',
  HERO_PREORDER_CLICK: 'hero_preorder_click',

  // Retailer events
  RETAILER_MENU_OPEN: 'retailer_menu_open',
  PREORDER_CLICK: 'preorder_click',

  // Lead capture events
  LEAD_CAPTURE_SUBMIT: 'lead_capture_submit',
  NEWSLETTER_SUBSCRIBE: 'newsletter_subscribed',

  // Bonus events
  BONUS_CLAIM_SUBMIT: 'bonus_claim_submit',

  // Engagement events
  SCROLL_DEPTH_25: 'scroll_depth_25',
  SCROLL_DEPTH_50: 'scroll_depth_50',
  SCROLL_DEPTH_75: 'scroll_depth_75',
  SCROLL_DEPTH_100: 'scroll_depth_100',
  FRAMEWORK_CARD_OPEN: 'framework_card_open',
  FAQ_OPEN: 'faq_open',
} as const;

export type ConversionEvent = typeof ConversionEvents[keyof typeof ConversionEvents];
