/**
 * Rate Limiting Examples
 *
 * This file demonstrates various ways to implement rate limiting
 * in Next.js API routes using the production-grade Upstash Redis
 * rate limiter.
 */

import { type NextRequest, NextResponse } from 'next/server';
import {
  checkRateLimit,
  getClientIP,
  getUserIdentifier,
  getRateLimitHeaders,
  handleRateLimitExceeded,
  withRateLimit,
  apiRateLimiter,
  emailCaptureRateLimiter,
  codeRedemptionRateLimiter,
  fileUploadRateLimiter,
  generalFormRateLimiter,
} from '@/lib/ratelimit';

// ============================================================================
// Example 1: Basic Rate Limiting
// ============================================================================

/**
 * Simple rate limiting with standard response
 */
export async function POST_Example1(request: NextRequest) {
  const clientIP = getClientIP(request);

  // Check rate limit with automatic fallback config
  const result = await checkRateLimit(
    clientIP,
    apiRateLimiter,
    { maxRequests: 100, windowMs: 3600000 } // Fallback for dev
  );

  // Handle rate limit exceeded
  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${result.reset} seconds.`,
      },
      {
        status: 429,
        headers: getRateLimitHeaders(result),
      }
    );
  }

  // Process your request logic here...
  const data = { success: true, message: 'Request processed' };

  // Return success with rate limit headers
  return NextResponse.json(data, {
    status: 200,
    headers: getRateLimitHeaders(result),
  });
}

// ============================================================================
// Example 2: Using Helper Function
// ============================================================================

/**
 * Simplified rate limit handling with helper
 */
export async function POST_Example2(request: NextRequest) {
  const clientIP = getClientIP(request);
  const result = await checkRateLimit(clientIP, emailCaptureRateLimiter);

  if (!result.success) {
    // Use helper to return standard 429 response
    return handleRateLimitExceeded(
      result,
      'Too many email capture attempts. Please try again later.'
    );
  }

  // Your logic here...
  return NextResponse.json(
    { success: true },
    { headers: getRateLimitHeaders(result) }
  );
}

// ============================================================================
// Example 3: Middleware Wrapper (Simplest)
// ============================================================================

/**
 * One-line rate limiting with middleware wrapper
 */
export const POST_Example3 = withRateLimit(
  async (request: NextRequest) => {
    // Rate limiting is handled automatically
    // Just implement your logic
    const body = await request.json();

    // Process request...
    return NextResponse.json({ success: true, data: body });
  },
  apiRateLimiter,
  { maxRequests: 100, windowMs: 3600000 } // Fallback config
);

// ============================================================================
// Example 4: User-Based Rate Limiting
// ============================================================================

/**
 * Rate limit by user ID for authenticated users
 */
export async function POST_Example4(request: NextRequest) {
  // Get user session (example - adapt to your auth)
  // const session = await auth();
  const userId: string | undefined = undefined; // Replace with: session?.user?.id

  // Use user ID if authenticated, otherwise fall back to IP
  const identifier = getUserIdentifier(request, userId);

  const result = await checkRateLimit(identifier, codeRedemptionRateLimiter);

  if (!result.success) {
    return handleRateLimitExceeded(result);
  }

  // Your logic here...
  return NextResponse.json(
    { success: true },
    { headers: getRateLimitHeaders(result) }
  );
}

// ============================================================================
// Example 5: Multiple Rate Limits
// ============================================================================

/**
 * Apply different rate limits based on operation type
 */
export async function POST_Example5(request: NextRequest) {
  const clientIP = getClientIP(request);
  const body = await request.json();

  let rateLimiter;

  // Choose rate limiter based on operation
  if (body.operation === 'upload') {
    rateLimiter = fileUploadRateLimiter;
  } else if (body.operation === 'redeem') {
    rateLimiter = codeRedemptionRateLimiter;
  } else {
    rateLimiter = generalFormRateLimiter;
  }

  const result = await checkRateLimit(clientIP, rateLimiter);

  if (!result.success) {
    return handleRateLimitExceeded(result);
  }

  // Process request...
  return NextResponse.json(
    { success: true },
    { headers: getRateLimitHeaders(result) }
  );
}

// ============================================================================
// Example 6: Custom Rate Limit Configuration
// ============================================================================

/**
 * Create a custom rate limiter for specific needs
 */
export async function POST_Example6(request: NextRequest) {
  const clientIP = getClientIP(request);

  // Use custom configuration for this endpoint
  const customConfig = {
    maxRequests: 50,
    windowMs: 15 * 60 * 1000, // 15 minutes
    prefix: 'ratelimit:custom',
  };

  const result = await checkRateLimit(
    clientIP,
    null, // No pre-configured limiter
    customConfig // Custom config
  );

  if (!result.success) {
    return handleRateLimitExceeded(result);
  }

  // Your logic here...
  return NextResponse.json(
    { success: true },
    { headers: getRateLimitHeaders(result) }
  );
}

// ============================================================================
// Example 7: Comprehensive Error Handling
// ============================================================================

/**
 * Production-ready with comprehensive error handling
 */
export async function POST_Example7(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);

    // Check rate limit
    const result = await checkRateLimit(clientIP, apiRateLimiter);

    if (!result.success) {
      // Log rate limit violation
      console.warn('[Rate Limit] Exceeded', {
        endpoint: '/api/example',
        ip: clientIP,
        limit: result.limit,
        reset: result.reset,
        timestamp: new Date().toISOString(),
      });

      return handleRateLimitExceeded(result);
    }

    // Parse and validate request
    const body = await request.json();

    // Validate input (example)
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        {
          status: 400,
          headers: getRateLimitHeaders(result),
        }
      );
    }

    // Process request...
    const data = { success: true, message: 'Processed successfully' };

    // Log success
    console.log('[API] Request processed', {
      endpoint: '/api/example',
      ip: clientIP,
      remaining: result.remaining,
      timestamp: new Date().toISOString(),
    });

    // Return success with rate limit headers
    return NextResponse.json(data, {
      status: 200,
      headers: getRateLimitHeaders(result),
    });

  } catch (error) {
    console.error('[API Error]', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Example 8: Rate Limiting with Validation
// ============================================================================

/**
 * Combine rate limiting with input validation
 */
export async function POST_Example8(request: NextRequest) {
  const clientIP = getClientIP(request);

  // Check rate limit first (before expensive operations)
  const result = await checkRateLimit(clientIP, emailCaptureRateLimiter);

  if (!result.success) {
    return handleRateLimitExceeded(result);
  }

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      {
        status: 400,
        headers: getRateLimitHeaders(result),
      }
    );
  }

  // Validate input with Zod (example)
  // const validated = schema.parse(body);

  // Check honeypot (anti-spam)
  if (body.honeypot) {
    // Silently reject spam
    return NextResponse.json(
      { success: true }, // Fake success
      {
        status: 200,
        headers: getRateLimitHeaders(result),
      }
    );
  }

  // Process valid request...
  return NextResponse.json(
    { success: true },
    { headers: getRateLimitHeaders(result) }
  );
}

// ============================================================================
// Example 9: Different Limits for Authenticated vs Anonymous
// ============================================================================

/**
 * Higher limits for authenticated users
 */
export async function POST_Example9(request: NextRequest) {
  // const session = await auth();
  const userId: string | undefined = undefined; // Replace with: session?.user?.id

  // Use different configs based on authentication
  const config = userId
    ? { maxRequests: 1000, windowMs: 3600000 } // Authenticated: 1000/hour
    : { maxRequests: 10, windowMs: 3600000 };  // Anonymous: 10/hour

  const identifier = getUserIdentifier(request, userId);
  const result = await checkRateLimit(identifier, null, config);

  if (!result.success) {
    const message = userId
      ? 'Rate limit exceeded for your account'
      : 'Rate limit exceeded. Sign in for higher limits.';

    return handleRateLimitExceeded(result, message);
  }

  // Your logic here...
  return NextResponse.json(
    {
      success: true,
      authenticated: !!userId,
      limit: result.limit,
      remaining: result.remaining,
    },
    { headers: getRateLimitHeaders(result) }
  );
}

// ============================================================================
// Example 10: Rate Limiting with CORS
// ============================================================================

/**
 * Rate limiting with CORS support
 */
export async function POST_Example10(request: NextRequest) {
  const clientIP = getClientIP(request);
  const result = await checkRateLimit(clientIP, generalFormRateLimiter);

  if (!result.success) {
    return handleRateLimitExceeded(result);
  }

  // Process request...
  const data = { success: true };

  // Add CORS headers
  const headers = new Headers(getRateLimitHeaders(result));
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return NextResponse.json(data, {
    status: 200,
    headers,
  });
}

/**
 * Handle CORS preflight with rate limit headers
 */
export async function OPTIONS_Example10() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// ============================================================================
// Production Best Practices Summary
// ============================================================================

/**
 * Production-Ready Template
 *
 * Copy this template for new API routes:
 */
export async function POST_ProductionTemplate(request: NextRequest) {
  try {
    // 1. Get client identifier
    const clientIP = getClientIP(request);

    // 2. Check rate limit (with fallback config)
    const result = await checkRateLimit(
      clientIP,
      apiRateLimiter,
      { maxRequests: 100, windowMs: 3600000 }
    );

    // 3. Handle rate limit exceeded
    if (!result.success) {
      console.warn('[Rate Limit]', {
        endpoint: request.nextUrl.pathname,
        ip: clientIP,
        limit: result.limit,
        reset: result.reset,
      });
      return handleRateLimitExceeded(result);
    }

    // 4. Parse and validate input
    const body = await request.json();
    // Add your validation here (e.g., Zod schema)

    // 5. Check honeypot (optional but recommended)
    if (body.honeypot) {
      return NextResponse.json(
        { success: true },
        { headers: getRateLimitHeaders(result) }
      );
    }

    // 6. Process your business logic
    // ... your code here ...

    // 7. Return success with rate limit headers
    return NextResponse.json(
      { success: true, data: { /* your data */ } },
      {
        status: 200,
        headers: getRateLimitHeaders(result),
      }
    );

  } catch (error) {
    // 8. Handle errors gracefully
    console.error('[API Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
