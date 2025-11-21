/**
 * API endpoint for client-side error logging
 *
 * Receives client errors and logs them with proper context
 */

import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@/middleware/logging';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// ============================================================================
// Schema
// ============================================================================

const ClientErrorSchema = z.object({
  message: z.string(),
  stack: z.string().optional(),
  componentStack: z.string().optional(),
  url: z.string().url(),
  userAgent: z.string(),
  timestamp: z.string(),
});

// ============================================================================
// Route Handler
// ============================================================================

export const POST = withLogging(async (request: NextRequest) => {
  try {
    const body = await request.json();

    // Validate
    const errorData = ClientErrorSchema.parse(body);

    // Extract client info
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const referer = request.headers.get('referer');

    // Log client error
    // Create an Error object for the logger
    const err = new Error(errorData.message);
    if (errorData.stack) {
      err.stack = errorData.stack;
    }

    logger.error(
      {
        err,
        type: 'client-error',
        clientError: {
          message: errorData.message,
          stack: errorData.stack,
          componentStack: errorData.componentStack,
          url: errorData.url,
          userAgent: errorData.userAgent,
          timestamp: errorData.timestamp,
        },
        clientIp: ip,
        referer,
      },
      `Client error: ${errorData.message}`
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn({ issues: error.issues }, 'Invalid client error payload');

      return NextResponse.json(
        { error: 'Invalid error data' },
        { status: 400 }
      );
    }

    logger.error({ err: error }, 'Failed to log client error');

    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
});
