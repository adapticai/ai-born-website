/**
 * Public API: Validate VIP Code
 *
 * POST /api/codes/validate
 *
 * Validates a VIP code and returns its details (without redeeming).
 * Public endpoint with rate limiting.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCode } from '@/lib/code-generator';
import { getClientIp } from '@/lib/admin-auth';

// Simple in-memory rate limiting for code validation
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(identifier);

  if (!limit || limit.resetAt < now) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + 60000, // 1 minute window
    });
    return false;
  }

  if (limit.count >= 10) {
    // Max 10 validations per minute
    return true;
  }

  limit.count++;
  return false;
}

/**
 * Request body schema
 */
interface ValidateCodeRequest {
  code: string;
}

/**
 * POST handler
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request) || 'unknown';
    if (checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request
    const body = await request.json();
    const { code } = body as ValidateCodeRequest;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request. Code is required.' },
        { status: 400 }
      );
    }

    // Validate code
    const result = await validateCode(code);

    if (!result.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: result.error,
        },
        { status: 200 } // 200 even for invalid codes (not an error in request)
      );
    }

    // Return valid code details
    return NextResponse.json({
      valid: true,
      code: {
        type: result.code!.type,
        redemptionsRemaining:
          result.code!.maxRedemptions !== null
            ? result.code!.maxRedemptions - result.code!.redemptionCount
            : null, // null = unlimited
      },
    });
  } catch (error) {
    console.error('[API] Code validation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to validate code',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler (CORS)
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Allow': 'POST, OPTIONS',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
