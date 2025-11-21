/**
 * Performance Dashboard API
 *
 * GET /api/admin/performance
 *
 * Returns comprehensive performance metrics:
 * - Average response times
 * - P95, P99 latencies
 * - Error rates
 * - Slowest endpoints
 * - Budget compliance
 *
 * Protected endpoint - requires authentication in production
 */

import { NextResponse } from 'next/server';
import { getPerformanceStats, getMetrics } from '@/lib/performance';
import {
  checkMultipleMetrics,
  generateBudgetReport,
  calculatePerformanceScore,
  getPerformanceGrade,
  getBudgetComplianceRate,
  getBudgetHistory,
} from '@/lib/performance-budgets';
import { logger } from '@/lib/logger';

// ============================================================================
// Types
// ============================================================================

interface EndpointStats {
  name: string;
  count: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
}

interface PerformanceDashboard {
  timestamp: string;
  summary: {
    totalRequests: number;
    averageResponseTime: number;
    p95: number;
    p99: number;
    errorRate: number;
    performanceScore: number;
    performanceGrade: string;
  };
  endpoints: EndpointStats[];
  slowestEndpoints: EndpointStats[];
  budgetCompliance: {
    overallRate: number;
    byMetric: Record<string, number>;
    recentViolations: number;
  };
  budgetReport?: {
    passRate: number;
    violations: number;
    recommendations: string[];
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get statistics for all endpoints
 */
function getEndpointStats(): EndpointStats[] {
  const metrics = getMetrics();
  const endpointNames = Array.from(new Set(metrics.map((m) => m.name)));

  return endpointNames
    .map((name) => {
      const stats = getPerformanceStats(name);
      return {
        name,
        ...stats,
      };
    })
    .filter((s) => s.count > 0);
}

/**
 * Get slowest endpoints by P95 latency
 */
function getSlowestEndpoints(limit = 10): EndpointStats[] {
  const stats = getEndpointStats();
  return stats.sort((a, b) => b.p95 - a.p95).slice(0, limit);
}

/**
 * Calculate error rate from metrics
 */
function calculateErrorRate(): number {
  const metrics = getMetrics();
  if (metrics.length === 0) return 0;

  const failures = metrics.filter((m) => !m.success).length;
  return (failures / metrics.length) * 100;
}

/**
 * Generate performance dashboard data
 */
function generateDashboard(): PerformanceDashboard {
  const allStats = getPerformanceStats();
  const endpointStats = getEndpointStats();
  const slowestEndpoints = getSlowestEndpoints(10);
  const errorRate = calculateErrorRate();

  // Get budget compliance
  const overallComplianceRate = getBudgetComplianceRate();
  const recentViolations = getBudgetHistory({
    onlyViolations: true,
    since: new Date(Date.now() - 60 * 60 * 1000), // Last hour
  }).length;

  // Calculate compliance by metric
  const metricNames = ['LCP', 'TBT', 'CLS', 'API_ROUTE', 'DATABASE_QUERY'];
  const complianceByMetric: Record<string, number> = {};
  metricNames.forEach((metric) => {
    complianceByMetric[metric] = getBudgetComplianceRate(metric);
  });

  // Generate recent budget report if we have recent metrics
  const recentMetrics = getMetrics({ limit: 100 });
  let budgetReport;
  if (recentMetrics.length > 0) {
    // Create sample budget checks from recent metrics
    const checks = checkMultipleMetrics({
      API_ROUTE: allStats.avg,
    });
    const report = generateBudgetReport(checks);
    budgetReport = {
      passRate: report.passRate,
      violations: report.violations.length,
      recommendations: report.recommendations,
    };
  }

  // Calculate performance score
  const performanceScore = budgetReport
    ? calculatePerformanceScore(
        checkMultipleMetrics({
          API_ROUTE: allStats.avg,
        })
      )
    : 100;

  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalRequests: allStats.count,
      averageResponseTime: Math.round(allStats.avg),
      p95: Math.round(allStats.p95),
      p99: Math.round(allStats.p99),
      errorRate: Math.round(errorRate * 100) / 100,
      performanceScore,
      performanceGrade: getPerformanceGrade(performanceScore),
    },
    endpoints: endpointStats,
    slowestEndpoints,
    budgetCompliance: {
      overallRate: Math.round(overallComplianceRate * 100) / 100,
      byMetric: Object.fromEntries(
        Object.entries(complianceByMetric).map(([k, v]) => [
          k,
          Math.round(v * 100) / 100,
        ])
      ),
      recentViolations,
    },
    budgetReport,
  };
}

// ============================================================================
// Route Handler
// ============================================================================

/**
 * GET /api/admin/performance
 * Returns performance dashboard data
 */
export async function GET(request: Request) {
  const start = Date.now();

  try {
    // TODO: Add authentication check in production
    // const session = await getServerSession();
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // In development, allow access without auth
    // In production, this should be protected
    if (process.env.NODE_ENV === 'production') {
      // Simple API key protection for now
      const authHeader = request.headers.get('authorization');
      const apiKey = process.env.ADMIN_API_KEY;

      if (apiKey && authHeader !== `Bearer ${apiKey}`) {
        logger.warn(
          {
            endpoint: '/api/admin/performance',
            ip: request.headers.get('x-forwarded-for') ?? undefined,
          },
          'Unauthorized access attempt to performance dashboard'
        );

        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Generate dashboard data
    const dashboard = generateDashboard();
    const duration = Date.now() - start;

    logger.info(
      {
        endpoint: '/api/admin/performance',
        duration,
        requestCount: dashboard.summary.totalRequests,
      },
      'Performance dashboard accessed'
    );

    return NextResponse.json(dashboard, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    const duration = Date.now() - start;

    logger.error(
      {
        err: error,
        endpoint: '/api/admin/performance',
        duration,
      },
      'Failed to generate performance dashboard'
    );

    return NextResponse.json(
      {
        error: 'Internal server error',
        message:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Additional Endpoints
// ============================================================================

/**
 * POST /api/admin/performance/reset
 * Reset performance metrics (useful for testing)
 */
export async function POST(request: Request) {
  try {
    // Authentication check
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization');
      const apiKey = process.env.ADMIN_API_KEY;

      if (apiKey && authHeader !== `Bearer ${apiKey}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { clearMetrics } = await import('@/lib/performance');
    const { clearBudgetHistory } = await import('@/lib/performance-budgets');

    clearMetrics();
    clearBudgetHistory();

    logger.info('Performance metrics and budget history cleared');

    return NextResponse.json({
      success: true,
      message: 'Performance metrics reset',
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to reset performance metrics');

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
