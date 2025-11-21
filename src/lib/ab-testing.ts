/**
 * A/B Testing Framework
 * Production-ready utilities for running experiments on the AI-Born landing page
 *
 * Features:
 * - Deterministic variant assignment based on user ID
 * - Cookie-based persistence for consistent experience
 * - Statistical significance calculation (Chi-squared test)
 * - Integration with GTM dataLayer for tracking
 * - Type-safe experiment configuration
 *
 * Based on CLAUDE.md A/B test candidates:
 * - Hero headline variants (3 options)
 * - CTA label variants
 * - Bonus placement variants
 */

import { isBrowser } from './utils';

// ==================== Types ====================

/**
 * Experiment variant configuration
 */
export interface ExperimentVariant {
  /** Unique variant identifier (A, B, C, etc.) */
  id: string;
  /** Human-readable variant name */
  name: string;
  /** Variant weight for traffic allocation (0-1, sum must equal 1) */
  weight: number;
  /** Variant description for documentation */
  description?: string;
}

/**
 * Experiment configuration
 */
export interface Experiment {
  /** Unique experiment identifier */
  id: string;
  /** Human-readable experiment name */
  name: string;
  /** Experiment description */
  description: string;
  /** Array of variant configurations */
  variants: ExperimentVariant[];
  /** Whether experiment is currently active */
  active: boolean;
  /** Start date (ISO 8601) */
  startDate?: string;
  /** End date (ISO 8601) */
  endDate?: string;
  /** Traffic allocation (0-1, percentage of users to include) */
  trafficAllocation?: number;
}

/**
 * Experiment assignment result
 */
export interface ExperimentAssignment {
  /** Experiment ID */
  experimentId: string;
  /** Assigned variant ID */
  variantId: string;
  /** Assigned variant name */
  variantName: string;
  /** Assignment timestamp (ISO 8601) */
  assignedAt: string;
}

/**
 * Experiment conversion event
 */
export interface ExperimentConversion {
  /** Experiment ID */
  experimentId: string;
  /** Variant ID */
  variantId: string;
  /** Conversion event name */
  eventName: string;
  /** Conversion value (optional) */
  value?: number;
  /** Conversion metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Experiment metrics for a single variant
 */
export interface VariantMetrics {
  /** Variant ID */
  variantId: string;
  /** Variant name */
  variantName: string;
  /** Number of users assigned to variant */
  participants: number;
  /** Number of conversions */
  conversions: number;
  /** Conversion rate (0-1) */
  conversionRate: number;
  /** Total conversion value */
  totalValue?: number;
  /** Average conversion value */
  averageValue?: number;
}

/**
 * Statistical significance result
 */
export interface SignificanceResult {
  /** Whether result is statistically significant */
  isSignificant: boolean;
  /** Confidence level (0-1) */
  confidence: number;
  /** Chi-squared statistic */
  chiSquared: number;
  /** P-value */
  pValue: number;
  /** Degrees of freedom */
  degreesOfFreedom: number;
  /** Winning variant ID (if significant) */
  winningVariant?: string;
  /** Relative improvement over control (percentage) */
  improvement?: number;
}

/**
 * Complete experiment results
 */
export interface ExperimentResults {
  /** Experiment ID */
  experimentId: string;
  /** Experiment name */
  experimentName: string;
  /** Variant metrics */
  variants: VariantMetrics[];
  /** Statistical significance result */
  significance: SignificanceResult;
  /** Total participants across all variants */
  totalParticipants: number;
  /** Total conversions across all variants */
  totalConversions: number;
  /** Overall conversion rate */
  overallConversionRate: number;
  /** Experiment start date */
  startDate?: string;
  /** Experiment end date */
  endDate?: string;
}

// ==================== Constants ====================

/**
 * Cookie name for storing experiment assignments
 */
const EXPERIMENT_COOKIE_NAME = 'ab_experiments';

/**
 * Cookie expiration (90 days)
 */
const COOKIE_MAX_AGE = 90 * 24 * 60 * 60 * 1000;

/**
 * Default traffic allocation (100%)
 */
const DEFAULT_TRAFFIC_ALLOCATION = 1.0;

/**
 * Chi-squared critical values for different confidence levels
 * Degrees of freedom = 1 (comparing 2 variants)
 */
const CHI_SQUARED_CRITICAL_VALUES: Record<number, number> = {
  90: 2.706,  // 90% confidence
  95: 3.841,  // 95% confidence
  99: 6.635,  // 99% confidence
  99.9: 10.828 // 99.9% confidence
};

// ==================== Utility Functions ====================

/**
 * Hash a string to a number between 0 and 1
 * Uses simple hash function for deterministic results
 *
 * @param str - String to hash
 * @returns Number between 0 and 1
 */
function hashString(str: string): number {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to positive number between 0 and 1
  return Math.abs(hash) / 2147483647;
}

/**
 * Get or create a unique user ID
 * Stored in localStorage for persistence
 *
 * @returns User ID string
 */
function getUserId(): string {
  if (!isBrowser()) {
    return 'server';
  }

  const storageKey = 'ab_user_id';

  try {
    let userId = localStorage.getItem(storageKey);

    if (!userId) {
      // Generate random ID
      userId = `user_${Math.random().toString(36).substring(2, 15)}${Date.now()}`;
      localStorage.setItem(storageKey, userId);
    }

    return userId;
  } catch (error) {
    // Fallback if localStorage is not available
    console.warn('localStorage not available for user ID:', error);
    return `session_${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * Get all experiment assignments from cookie
 *
 * @returns Map of experiment ID to assignment
 */
function getAssignmentsFromCookie(): Map<string, ExperimentAssignment> {
  if (!isBrowser()) {
    return new Map();
  }

  try {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${EXPERIMENT_COOKIE_NAME}=`))
      ?.split('=')[1];

    if (!cookieValue) {
      return new Map();
    }

    const assignments = JSON.parse(decodeURIComponent(cookieValue));
    return new Map(Object.entries(assignments));
  } catch (error) {
    console.error('Error reading experiment assignments:', error);
    return new Map();
  }
}

/**
 * Save experiment assignments to cookie
 *
 * @param assignments - Map of experiment ID to assignment
 */
function saveAssignmentsToCookie(assignments: Map<string, ExperimentAssignment>): void {
  if (!isBrowser()) {
    return;
  }

  try {
    const assignmentsObj = Object.fromEntries(assignments);
    const cookieValue = encodeURIComponent(JSON.stringify(assignmentsObj));
    const expires = new Date(Date.now() + COOKIE_MAX_AGE).toUTCString();

    document.cookie = `${EXPERIMENT_COOKIE_NAME}=${cookieValue}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (error) {
    console.error('Error saving experiment assignments:', error);
  }
}

/**
 * Select a variant based on user ID and variant weights
 * Uses deterministic hashing for consistent assignment
 *
 * @param userId - User ID
 * @param experimentId - Experiment ID
 * @param variants - Array of variants with weights
 * @returns Selected variant
 */
function selectVariant(
  userId: string,
  experimentId: string,
  variants: ExperimentVariant[]
): ExperimentVariant {
  // Hash the user ID + experiment ID to get a deterministic value
  const hash = hashString(`${userId}:${experimentId}`);

  // Use cumulative weights to select variant
  let cumulativeWeight = 0;

  for (const variant of variants) {
    cumulativeWeight += variant.weight;

    if (hash <= cumulativeWeight) {
      return variant;
    }
  }

  // Fallback to first variant (should never happen if weights sum to 1)
  return variants[0];
}

/**
 * Check if user should be included in experiment based on traffic allocation
 *
 * @param userId - User ID
 * @param experimentId - Experiment ID
 * @param trafficAllocation - Traffic allocation (0-1)
 * @returns Whether user should be included
 */
function shouldIncludeUser(
  userId: string,
  experimentId: string,
  trafficAllocation: number
): boolean {
  const hash = hashString(`traffic:${userId}:${experimentId}`);
  return hash <= trafficAllocation;
}

// ==================== Core A/B Testing Functions ====================

/**
 * Get the variant for a user in an experiment
 * Returns cached assignment if available, otherwise assigns new variant
 *
 * @param experimentId - Experiment ID
 * @param experiment - Experiment configuration
 * @returns Variant ID
 *
 * @example
 * ```ts
 * const variant = getVariant('hero-headline', heroHeadlineExperiment);
 * ```
 */
export function getVariant(
  experimentId: string,
  experiment: Experiment
): string {
  // Return first variant if experiment is inactive
  if (!experiment.active) {
    return experiment.variants[0].id;
  }

  // Get user ID
  const userId = getUserId();

  // Check traffic allocation
  const trafficAllocation = experiment.trafficAllocation ?? DEFAULT_TRAFFIC_ALLOCATION;

  if (!shouldIncludeUser(userId, experimentId, trafficAllocation)) {
    // User not included in experiment, return control variant
    return experiment.variants[0].id;
  }

  // Check for existing assignment
  const assignments = getAssignmentsFromCookie();
  const existingAssignment = assignments.get(experimentId);

  if (existingAssignment) {
    return existingAssignment.variantId;
  }

  // Assign new variant
  const selectedVariant = selectVariant(userId, experimentId, experiment.variants);

  const assignment: ExperimentAssignment = {
    experimentId,
    variantId: selectedVariant.id,
    variantName: selectedVariant.name,
    assignedAt: new Date().toISOString(),
  };

  // Save assignment
  assignments.set(experimentId, assignment);
  saveAssignmentsToCookie(assignments);

  // Track assignment event
  trackExperimentAssignment(experimentId, selectedVariant.id, selectedVariant.name);

  return selectedVariant.id;
}

/**
 * Track experiment variant assignment
 * Pushes event to GTM dataLayer
 *
 * @param experimentId - Experiment ID
 * @param variantId - Variant ID
 * @param variantName - Variant name
 */
function trackExperimentAssignment(
  experimentId: string,
  variantId: string,
  variantName: string
): void {
  if (!isBrowser() || typeof window.dataLayer === 'undefined') {
    return;
  }

  window.dataLayer?.push({
    event: 'experiment_assigned',
    experiment_id: experimentId,
    variant_id: variantId,
    variant_name: variantName,
    timestamp: new Date().toISOString(),
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('[A/B Test Assignment]', {
      experimentId,
      variantId,
      variantName,
    });
  }
}

/**
 * Track experiment conversion event
 * Used to track goal completions for experiment variants
 *
 * @param experimentId - Experiment ID
 * @param eventName - Conversion event name (e.g., 'preorder_click', 'lead_capture')
 * @param value - Optional conversion value
 * @param metadata - Optional metadata
 *
 * @example
 * ```ts
 * trackExperiment('hero-headline', 'preorder_click', 29.99, {
 *   retailer: 'amazon',
 *   format: 'hardcover'
 * });
 * ```
 */
export function trackExperiment(
  experimentId: string,
  eventName: string,
  value?: number,
  metadata?: Record<string, unknown>
): void {
  if (!isBrowser() || typeof window.dataLayer === 'undefined') {
    return;
  }

  // Get current variant assignment
  const assignments = getAssignmentsFromCookie();
  const assignment = assignments.get(experimentId);

  if (!assignment) {
    console.warn(`No assignment found for experiment: ${experimentId}`);
    return;
  }

  // Push conversion event to dataLayer
  window.dataLayer?.push({
    event: 'experiment_conversion',
    experiment_id: experimentId,
    variant_id: assignment.variantId,
    variant_name: assignment.variantName,
    conversion_event: eventName,
    conversion_value: value,
    ...metadata,
    timestamp: new Date().toISOString(),
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('[A/B Test Conversion]', {
      experimentId,
      variantId: assignment.variantId,
      eventName,
      value,
      metadata,
    });
  }
}

/**
 * Get all active experiment assignments for current user
 *
 * @returns Map of experiment ID to assignment
 */
export function getAllAssignments(): Map<string, ExperimentAssignment> {
  return getAssignmentsFromCookie();
}

/**
 * Clear all experiment assignments
 * Useful for testing or debugging
 */
export function clearAllAssignments(): void {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${EXPERIMENT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

  if (process.env.NODE_ENV === 'development') {
    console.log('[A/B Test] All assignments cleared');
  }
}

/**
 * Force a specific variant for an experiment
 * Useful for testing or previewing variants
 *
 * @param experimentId - Experiment ID
 * @param variantId - Variant ID to force
 * @param variantName - Variant name
 */
export function forceVariant(
  experimentId: string,
  variantId: string,
  variantName: string
): void {
  const assignments = getAssignmentsFromCookie();

  const assignment: ExperimentAssignment = {
    experimentId,
    variantId,
    variantName,
    assignedAt: new Date().toISOString(),
  };

  assignments.set(experimentId, assignment);
  saveAssignmentsToCookie(assignments);

  if (process.env.NODE_ENV === 'development') {
    console.log('[A/B Test] Forced variant:', { experimentId, variantId, variantName });
  }
}

// ==================== Statistical Analysis ====================

/**
 * Calculate chi-squared statistic for experiment results
 * Used to determine statistical significance
 *
 * @param variants - Array of variant metrics
 * @returns Chi-squared statistic and p-value
 */
function calculateChiSquared(variants: VariantMetrics[]): {
  chiSquared: number;
  pValue: number;
  degreesOfFreedom: number;
} {
  if (variants.length < 2) {
    return { chiSquared: 0, pValue: 1, degreesOfFreedom: 0 };
  }

  // Calculate overall conversion rate
  const totalParticipants = variants.reduce((sum, v) => sum + v.participants, 0);
  const totalConversions = variants.reduce((sum, v) => sum + v.conversions, 0);
  const overallRate = totalConversions / totalParticipants;

  // Calculate chi-squared statistic
  let chiSquared = 0;

  for (const variant of variants) {
    const expected = variant.participants * overallRate;
    const observed = variant.conversions;

    if (expected > 0) {
      chiSquared += Math.pow(observed - expected, 2) / expected;
    }
  }

  // Calculate p-value (simplified approximation)
  // For more accurate p-value, use a proper chi-squared distribution function
  const degreesOfFreedom = variants.length - 1;
  let pValue = 1.0;

  // Compare against critical values
  if (chiSquared >= CHI_SQUARED_CRITICAL_VALUES[99.9]) {
    pValue = 0.001;
  } else if (chiSquared >= CHI_SQUARED_CRITICAL_VALUES[99]) {
    pValue = 0.01;
  } else if (chiSquared >= CHI_SQUARED_CRITICAL_VALUES[95]) {
    pValue = 0.05;
  } else if (chiSquared >= CHI_SQUARED_CRITICAL_VALUES[90]) {
    pValue = 0.1;
  } else {
    pValue = 0.2; // Not significant
  }

  return { chiSquared, pValue, degreesOfFreedom };
}

/**
 * Calculate statistical significance of experiment results
 *
 * @param variants - Array of variant metrics
 * @param confidenceLevel - Desired confidence level (90, 95, 99, 99.9)
 * @returns Statistical significance result
 *
 * @example
 * ```ts
 * const significance = calculateSignificance(variantMetrics, 95);
 * if (significance.isSignificant) {
 *   console.log('Winner:', significance.winningVariant);
 *   console.log('Improvement:', significance.improvement);
 * }
 * ```
 */
export function calculateSignificance(
  variants: VariantMetrics[],
  confidenceLevel: 90 | 95 | 99 | 99.9 = 95
): SignificanceResult {
  if (variants.length < 2) {
    return {
      isSignificant: false,
      confidence: 0,
      chiSquared: 0,
      pValue: 1,
      degreesOfFreedom: 0,
    };
  }

  // Calculate chi-squared
  const { chiSquared, pValue, degreesOfFreedom } = calculateChiSquared(variants);

  // Check significance
  const criticalValue = CHI_SQUARED_CRITICAL_VALUES[confidenceLevel];
  const isSignificant = chiSquared >= criticalValue;

  // Find winning variant (highest conversion rate)
  const sortedVariants = [...variants].sort((a, b) => b.conversionRate - a.conversionRate);
  const winner = sortedVariants[0];
  const control = variants[0]; // Assume first variant is control

  // Calculate relative improvement
  const improvement = control.conversionRate > 0
    ? ((winner.conversionRate - control.conversionRate) / control.conversionRate) * 100
    : 0;

  return {
    isSignificant,
    confidence: confidenceLevel,
    chiSquared,
    pValue,
    degreesOfFreedom,
    winningVariant: isSignificant ? winner.variantId : undefined,
    improvement: isSignificant ? improvement : undefined,
  };
}

/**
 * Calculate variant metrics from raw data
 * Helper function for computing conversion rates and values
 *
 * @param variantId - Variant ID
 * @param variantName - Variant name
 * @param participants - Number of participants
 * @param conversions - Number of conversions
 * @param totalValue - Total conversion value (optional)
 * @returns Variant metrics
 */
export function calculateVariantMetrics(
  variantId: string,
  variantName: string,
  participants: number,
  conversions: number,
  totalValue?: number
): VariantMetrics {
  const conversionRate = participants > 0 ? conversions / participants : 0;
  const averageValue = conversions > 0 && totalValue ? totalValue / conversions : undefined;

  return {
    variantId,
    variantName,
    participants,
    conversions,
    conversionRate,
    totalValue,
    averageValue,
  };
}

// ==================== Helper Functions ====================

/**
 * Check if an experiment is currently active
 * Considers active flag and date range
 *
 * @param experiment - Experiment configuration
 * @returns Whether experiment is active
 */
export function isExperimentActive(experiment: Experiment): boolean {
  if (!experiment.active) {
    return false;
  }

  const now = Date.now();

  if (experiment.startDate) {
    const startTime = new Date(experiment.startDate).getTime();
    if (now < startTime) {
      return false;
    }
  }

  if (experiment.endDate) {
    const endTime = new Date(experiment.endDate).getTime();
    if (now > endTime) {
      return false;
    }
  }

  return true;
}

/**
 * Get variant name from variant ID
 *
 * @param experiment - Experiment configuration
 * @param variantId - Variant ID
 * @returns Variant name
 */
export function getVariantName(experiment: Experiment, variantId: string): string {
  const variant = experiment.variants.find(v => v.id === variantId);
  return variant?.name || variantId;
}

/**
 * Validate experiment configuration
 * Checks that weights sum to 1 and all required fields are present
 *
 * @param experiment - Experiment configuration
 * @returns Validation result
 */
export function validateExperiment(experiment: Experiment): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!experiment.id) {
    errors.push('Experiment ID is required');
  }

  if (!experiment.name) {
    errors.push('Experiment name is required');
  }

  if (!experiment.variants || experiment.variants.length < 2) {
    errors.push('Experiment must have at least 2 variants');
  }

  // Check variant weights
  if (experiment.variants) {
    const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);

    if (Math.abs(totalWeight - 1.0) > 0.001) {
      errors.push(`Variant weights must sum to 1.0 (currently ${totalWeight})`);
    }

    // Check for duplicate variant IDs
    const variantIds = new Set(experiment.variants.map(v => v.id));
    if (variantIds.size !== experiment.variants.length) {
      errors.push('Duplicate variant IDs detected');
    }
  }

  // Check traffic allocation
  if (experiment.trafficAllocation !== undefined) {
    if (experiment.trafficAllocation < 0 || experiment.trafficAllocation > 1) {
      errors.push('Traffic allocation must be between 0 and 1');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
