/**
 * Performance Budget Utilities
 *
 * Automated checking and alerting for performance budget violations
 * based on CLAUDE.md specifications:
 * - LCP ≤2.0s on 4G
 * - TBT ≤150ms
 * - CLS ≤0.1
 *
 * Features:
 * - Budget violation detection
 * - Automated alerts (logging, Sentry, custom webhooks)
 * - Budget trend analysis
 * - Performance scoring
 */

import { logger } from './logger';
import { PERFORMANCE_BUDGETS, checkBudgetViolation } from './performance';
import type { PerformanceBudget } from './performance';

// ============================================================================
// Types
// ============================================================================

export interface BudgetCheck {
  metric: string;
  value: number;
  budget: PerformanceBudget;
  passed: boolean;
  violation?: {
    exceeded: number;
    percentage: number;
  };
  timestamp: string;
}

export interface BudgetReport {
  timestamp: string;
  checks: BudgetCheck[];
  passRate: number;
  violations: BudgetCheck[];
  recommendations: string[];
}

export interface AlertConfig {
  enabled: boolean;
  threshold: number; // Percentage over budget to trigger alert
  destinations: ('log' | 'sentry' | 'webhook')[];
  webhookUrl?: string;
}

// ============================================================================
// Budget Checking
// ============================================================================

/**
 * Check a single metric against its budget
 *
 * @param metricName - Name of the metric (must exist in PERFORMANCE_BUDGETS)
 * @param value - Measured value
 * @returns Budget check result
 *
 * @example
 * ```typescript
 * const check = checkMetricBudget('LCP', 2500);
 * if (!check.passed) {
 *   console.warn(`LCP exceeded budget by ${check.violation?.exceeded}ms`);
 * }
 * ```
 */
function checkMetricBudget(
  metricName: string,
  value: number
): BudgetCheck {
  const budget = PERFORMANCE_BUDGETS[metricName];

  if (!budget) {
    throw new Error(`Unknown metric: ${metricName}`);
  }

  // Convert budget to same unit as value (milliseconds for time-based metrics)
  const threshold =
    budget.unit === 's' ? budget.threshold * 1000 : budget.threshold;

  const violation = checkBudgetViolation(metricName, value);

  return {
    metric: metricName,
    value,
    budget,
    passed: violation === null,
    violation: violation
      ? {
          exceeded: violation.exceeded,
          percentage: violation.percentage,
        }
      : undefined,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check multiple metrics against their budgets
 *
 * @param metrics - Object mapping metric names to values
 * @returns Array of budget check results
 *
 * @example
 * ```typescript
 * const checks = checkMultipleMetrics({
 *   LCP: 2500,
 *   TBT: 180,
 *   CLS: 0.05
 * });
 * const violations = checks.filter(c => !c.passed);
 * ```
 */
function checkMultipleMetrics(
  metrics: Record<string, number>
): BudgetCheck[] {
  return Object.entries(metrics).map(([metric, value]) =>
    checkMetricBudget(metric, value)
  );
}

/**
 * Generate a comprehensive budget report
 *
 * @param checks - Array of budget checks
 * @returns Detailed budget report with recommendations
 */
function generateBudgetReport(checks: BudgetCheck[]): BudgetReport {
  const violations = checks.filter((c) => !c.passed);
  const passRate = (checks.length - violations.length) / checks.length;

  const recommendations: string[] = [];

  // Analyze violations and provide recommendations
  violations.forEach((v) => {
    const exceededPct = v.violation?.percentage.toFixed(1);

    switch (v.metric) {
      case 'LCP':
        recommendations.push(
          `LCP is ${exceededPct}% over budget. Consider: 1) Optimize images, 2) Preload critical resources, 3) Reduce server response time`
        );
        break;
      case 'TBT':
        recommendations.push(
          `TBT is ${exceededPct}% over budget. Consider: 1) Code splitting, 2) Defer non-critical JavaScript, 3) Reduce main thread work`
        );
        break;
      case 'CLS':
        recommendations.push(
          `CLS is ${exceededPct}% over budget. Consider: 1) Reserve space for images/ads, 2) Avoid inserting content above existing content, 3) Use CSS aspect-ratio`
        );
        break;
      case 'API_ROUTE':
        recommendations.push(
          `API route is ${exceededPct}% over budget. Consider: 1) Database query optimization, 2) Add caching, 3) Reduce payload size`
        );
        break;
      case 'DATABASE_QUERY':
        recommendations.push(
          `Database query is ${exceededPct}% over budget. Consider: 1) Add indexes, 2) Optimize query, 3) Use database connection pooling`
        );
        break;
    }
  });

  return {
    timestamp: new Date().toISOString(),
    checks,
    passRate,
    violations,
    recommendations,
  };
}

// ============================================================================
// Budget Alerting
// ============================================================================

/**
 * Default alert configuration
 */
const DEFAULT_ALERT_CONFIG: AlertConfig = {
  enabled: process.env.NODE_ENV === 'production',
  threshold: 10, // Alert if >10% over budget
  destinations: ['log'],
};

/**
 * Send budget violation alert
 *
 * @param check - Budget check with violation
 * @param config - Alert configuration
 */
async function sendBudgetAlert(
  check: BudgetCheck,
  config: AlertConfig = DEFAULT_ALERT_CONFIG
): Promise<void> {
  if (!config.enabled || !check.violation) {
    return;
  }

  // Only alert if violation exceeds threshold
  if (check.violation.percentage < config.threshold) {
    return;
  }

  const message = `Performance budget violated: ${check.metric} is ${check.violation.percentage.toFixed(1)}% over budget (${check.value}${check.budget.unit} > ${check.budget.threshold}${check.budget.unit})`;

  // Log alert
  if (config.destinations.includes('log')) {
    logger.warn(
      {
        metric: check.metric,
        value: check.value,
        budget: check.budget.threshold,
        exceeded: check.violation.exceeded,
        percentage: check.violation.percentage,
      },
      message
    );
  }

  // Send to Sentry (if available and configured)
  if (config.destinations.includes('sentry')) {
    try {
      const Sentry = await import('@sentry/nextjs');
      Sentry.captureMessage(message, {
        level: 'warning',
        tags: {
          metric: check.metric,
          budget_exceeded: 'true',
        },
        extra: {
          value: check.value,
          budget: check.budget.threshold,
          exceeded: check.violation.exceeded,
          percentage: check.violation.percentage,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'Failed to send Sentry alert');
    }
  }

  // Send to webhook (if configured)
  if (config.destinations.includes('webhook') && config.webhookUrl) {
    try {
      await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'performance_budget_violation',
          message,
          check,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      logger.error(
        { err: error, webhook: config.webhookUrl },
        'Failed to send webhook alert'
      );
    }
  }
}

/**
 * Send alert for budget report with multiple violations
 *
 * @param report - Budget report
 * @param config - Alert configuration
 */
async function sendBudgetReportAlert(
  report: BudgetReport,
  config: AlertConfig = DEFAULT_ALERT_CONFIG
): Promise<void> {
  if (!config.enabled || report.violations.length === 0) {
    return;
  }

  const significantViolations = report.violations.filter(
    (v) => (v.violation?.percentage ?? 0) >= config.threshold
  );

  if (significantViolations.length === 0) {
    return;
  }

  const message = `${significantViolations.length} performance budget violations detected (pass rate: ${(report.passRate * 100).toFixed(1)}%)`;

  // Log alert with recommendations
  if (config.destinations.includes('log')) {
    logger.warn(
      {
        violations: significantViolations.length,
        passRate: report.passRate,
        recommendations: report.recommendations,
      },
      message
    );
  }

  // Send to Sentry
  if (config.destinations.includes('sentry')) {
    try {
      const Sentry = await import('@sentry/nextjs');
      Sentry.captureMessage(message, {
        level: 'warning',
        tags: {
          violations_count: significantViolations.length.toString(),
        },
        extra: {
          report,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'Failed to send Sentry report alert');
    }
  }

  // Send to webhook
  if (config.destinations.includes('webhook') && config.webhookUrl) {
    try {
      await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'performance_budget_report',
          message,
          report,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      logger.error(
        { err: error, webhook: config.webhookUrl },
        'Failed to send webhook report alert'
      );
    }
  }
}

// ============================================================================
// Performance Scoring
// ============================================================================

/**
 * Calculate a performance score (0-100) based on budget compliance
 *
 * @param checks - Array of budget checks
 * @returns Score from 0-100
 *
 * @example
 * ```typescript
 * const score = calculatePerformanceScore(checks);
 * if (score < 90) {
 *   console.warn('Performance score below target');
 * }
 * ```
 */
function calculatePerformanceScore(checks: BudgetCheck[]): number {
  if (checks.length === 0) {
    return 100;
  }

  let totalScore = 0;

  checks.forEach((check) => {
    if (check.passed) {
      totalScore += 100;
    } else {
      // Calculate score based on how much over budget
      const overBudget = check.violation?.percentage ?? 0;
      // Penalize more heavily as percentage increases
      // 10% over = 90 points, 25% over = 75 points, 50% over = 50 points, etc.
      const score = Math.max(0, 100 - overBudget);
      totalScore += score;
    }
  });

  return Math.round(totalScore / checks.length);
}

/**
 * Get performance grade (A-F) based on score
 */
function getPerformanceGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 65) return 'D+';
  if (score >= 60) return 'D';
  return 'F';
}

// ============================================================================
// Continuous Monitoring
// ============================================================================

/**
 * Storage for budget check history
 */
const budgetHistory: BudgetCheck[] = [];
const MAX_HISTORY = 1000;

/**
 * Record a budget check for trend analysis
 */
function recordBudgetCheck(check: BudgetCheck): void {
  budgetHistory.push(check);

  // Keep only last MAX_HISTORY checks
  if (budgetHistory.length > MAX_HISTORY) {
    budgetHistory.shift();
  }
}

/**
 * Get budget check history
 */
function getBudgetHistory(filter?: {
  metric?: string;
  since?: Date;
  onlyViolations?: boolean;
}): BudgetCheck[] {
  let history = [...budgetHistory];

  if (filter?.metric) {
    history = history.filter((c) => c.metric === filter.metric);
  }

  if (filter?.since) {
    history = history.filter((c) => new Date(c.timestamp) >= filter.since!);
  }

  if (filter?.onlyViolations) {
    history = history.filter((c) => !c.passed);
  }

  return history;
}

/**
 * Get budget compliance rate over time
 */
function getBudgetComplianceRate(
  metric?: string,
  since?: Date
): number {
  const history = getBudgetHistory({ metric, since });

  if (history.length === 0) {
    return 100;
  }

  const passed = history.filter((c) => c.passed).length;
  return (passed / history.length) * 100;
}

/**
 * Clear budget history (useful for testing)
 */
function clearBudgetHistory(): void {
  budgetHistory.length = 0;
}

// ============================================================================
// Exports
// ============================================================================

export {
  checkMetricBudget,
  checkMultipleMetrics,
  generateBudgetReport,
  sendBudgetAlert,
  sendBudgetReportAlert,
  calculatePerformanceScore,
  getPerformanceGrade,
  recordBudgetCheck,
  getBudgetHistory,
  getBudgetComplianceRate,
  clearBudgetHistory,
};
