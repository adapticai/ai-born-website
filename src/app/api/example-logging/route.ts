/**
 * Example API Route with logging
 *
 * Demonstrates:
 * - Request logging with withLogging wrapper
 * - Manual logging with request logger
 * - Error logging
 * - Performance tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { withLogging, getRequestLogger } from '@/middleware/logging';
import { logger, logExecutionTime } from '@/lib/logger';

// ============================================================================
// Example 1: Using withLogging wrapper (Recommended)
// ============================================================================

export const GET = withLogging(async (request: NextRequest) => {
  const log = getRequestLogger(request);

  // Log with context
  log.info({ query: request.nextUrl.searchParams.toString() }, 'Processing GET request');

  try {
    // Simulate some work
    const result = await logExecutionTime(
      'fetchData',
      async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { data: 'example' };
      },
      { source: 'example-api' }
    );

    log.info({ resultSize: JSON.stringify(result).length }, 'Request successful');

    return NextResponse.json(result);

  } catch (error) {
    // Error automatically logged by withLogging wrapper
    log.error({ err: error }, 'Failed to fetch data');

    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
});

// ============================================================================
// Example 2: Manual logging (more control)
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const log = getRequestLogger(request);

  try {
    const body = await request.json();

    log.info({ bodyKeys: Object.keys(body) }, 'Received POST request');

    // Validate input
    if (!body.email) {
      log.warn({ body }, 'Missing required field: email');

      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Log analytics event
    logger.analytics({
      event: 'api_call',
      properties: {
        endpoint: '/api/example-logging',
        method: 'POST',
      },
    });

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 50));

    const duration = Date.now() - startTime;

    log.info({ duration }, 'POST request completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Data processed',
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    log.error(
      {
        err: error,
        duration,
      },
      'POST request failed'
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Example 3: Different log levels
// ============================================================================

export async function PUT(request: NextRequest) {
  const log = getRequestLogger(request);

  // Debug: detailed information for development
  log.debug({ headers: Object.fromEntries(request.headers) }, 'Request headers');

  // Info: general informational messages
  log.info('Processing PUT request');

  // Warn: warning messages (non-critical issues)
  log.warn({ reason: 'deprecated' }, 'Using deprecated endpoint');

  // Error: error messages
  try {
    throw new Error('Example error');
  } catch (error) {
    log.error({ err: error }, 'Operation failed');
  }

  return NextResponse.json({ status: 'logged' });
}
