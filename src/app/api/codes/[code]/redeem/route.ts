/**
 * Code Redemption API Endpoint
 *
 * Validates and redeems unique book purchase codes for authenticated users.
 * Implements strict anti-abuse controls and comprehensive error handling.
 *
 * @route POST /api/codes/:code/redeem
 *
 * Specification: ~/ai-born/outputs/website/specs/api-contracts.md
 * Database Schema: ~/ai-born/outputs/website/specs/data-models.sql
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
  codeRedemptionRateLimiter,
} from '@/lib/ratelimit';
import { hashString } from '@/lib/security';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Code redemption request body schema
 */
const CodeRedemptionSchema = z.object({
  retailer: z.string().min(1, 'Retailer is required'),
  deviceFingerprint: z.string().optional(),
  consentToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms of service to redeem this code',
  }),
});

type CodeRedemptionInput = z.infer<typeof CodeRedemptionSchema>;

/**
 * Code status enum (matches database schema)
 */
enum CodeStatus {
  PENDING = 'pending',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

/**
 * Book format enum (matches database schema)
 */
enum BookFormat {
  HARDCOVER = 'hardcover',
  PAPERBACK = 'paperback',
  EBOOK = 'ebook',
  AUDIOBOOK = 'audiobook',
}

/**
 * Mock code record structure (replace with actual Prisma model)
 */
interface CodeRecord {
  id: string;
  code: string;
  format: BookFormat;
  status: CodeStatus;
  org_id: string | null;
  user_id: string | null;
  retailer: string | null;
  redeemed_at: Date | null;
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Mock entitlement record
 */
interface EntitlementRecord {
  id: string;
  user_id: string;
  code_id: string;
  entitlement_type: string;
  granted_at: Date;
}

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Rate limit configuration: 10 attempts per hour per IP
 * (API contracts specify 5/hour per user, but we use 10/hour per IP for anonymous pre-auth)
 */
const CODE_REDEMPTION_RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
  prefix: 'ratelimit:code',
};

// ============================================================================
// MOCK DATABASE FUNCTIONS
// ============================================================================
// TODO: Replace with actual Prisma queries when database is connected

/**
 * In-memory store for codes (development only - replace with database)
 */
const mockCodeStore = new Map<string, CodeRecord>();

/**
 * Find code by code string
 */
async function findCodeByCode(codeStr: string): Promise<CodeRecord | null> {
  // TODO: Replace with Prisma query
  // const code = await prisma.code.findUnique({
  //   where: { code: codeStr },
  // });

  const code = mockCodeStore.get(codeStr);
  return code || null;
}

/**
 * Check if user already has a code for this format
 */
async function userHasFormatCode(
  userId: string,
  format: BookFormat
): Promise<boolean> {
  // TODO: Replace with Prisma query
  // const existingCode = await prisma.code.findFirst({
  //   where: {
  //     user_id: userId,
  //     format: format,
  //     status: CodeStatus.REDEEMED,
  //   },
  // });
  // return existingCode !== null;

  const codes = Array.from(mockCodeStore.values());
  for (const code of codes) {
    if (
      code.user_id === userId &&
      code.format === format &&
      code.status === CodeStatus.REDEEMED
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Redeem code for user
 */
async function redeemCode(
  codeRecord: CodeRecord,
  userId: string,
  retailer: string,
  deviceFingerprint: string | undefined,
  ipAddress: string
): Promise<CodeRecord> {
  // TODO: Replace with Prisma transaction
  // const updatedCode = await prisma.code.update({
  //   where: { id: codeRecord.id },
  //   data: {
  //     status: CodeStatus.REDEEMED,
  //     user_id: userId,
  //     retailer: retailer,
  //     redeemed_at: new Date(),
  //     device_fingerprint: deviceFingerprint,
  //     ip_address: ipAddress,
  //   },
  // });

  const updatedCode: CodeRecord = {
    ...codeRecord,
    status: CodeStatus.REDEEMED,
    user_id: userId,
    retailer: retailer,
    redeemed_at: new Date(),
    updated_at: new Date(),
  };

  mockCodeStore.set(codeRecord.code, updatedCode);
  return updatedCode;
}

/**
 * Create entitlement for user
 */
async function createEntitlement(
  userId: string,
  codeId: string
): Promise<EntitlementRecord> {
  // TODO: Replace with Prisma query
  // const entitlement = await prisma.entitlement.create({
  //   data: {
  //     user_id: userId,
  //     code_id: codeId,
  //     entitlement_type: 'toolkit',
  //     granted_at: new Date(),
  //   },
  // });

  const entitlement: EntitlementRecord = {
    id: crypto.randomUUID(),
    user_id: userId,
    code_id: codeId,
    entitlement_type: 'toolkit',
    granted_at: new Date(),
  };

  return entitlement;
}

/**
 * Log audit event
 */
async function logAuditEvent(
  eventType: string,
  userId: string | null,
  entityId: string,
  changes: Record<string, unknown>
): Promise<void> {
  // TODO: Replace with Prisma audit log insert
  // await prisma.auditLog.create({
  //   data: {
  //     event_type: eventType,
  //     actor_user_id: userId,
  //     entity_type: 'code',
  //     entity_id: entityId,
  //     changes: changes,
  //     event_timestamp: new Date(),
  //   },
  // });

  console.log('[AUDIT]', {
    eventType,
    userId,
    entityId,
    changes,
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// AUTHENTICATION HELPER
// ============================================================================

/**
 * Get authenticated user from session
 * TODO: Replace with actual Auth.js session retrieval
 */
async function getAuthenticatedUser(
  request: NextRequest
): Promise<{ id: string; email: string } | null> {
  // TODO: Implement Auth.js session validation
  // const session = await getServerSession(authOptions);
  // if (!session?.user?.id) {
  //   return null;
  // }
  // return {
  //   id: session.user.id,
  //   email: session.user.email,
  // };

  // Mock authentication - check for dev-only session cookie
  const sessionCookie = request.cookies.get('dev-session-user-id');
  if (sessionCookie?.value) {
    return {
      id: sessionCookie.value,
      email: 'dev@example.com',
    };
  }

  return null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate code format (6-character alphanumeric uppercase)
 */
function isValidCodeFormat(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}

/**
 * Get retailer redirect URL
 * TODO: Integrate with retailer configuration
 */
function getRetailerRedirectUrl(
  retailer: string,
  format: BookFormat
): string {
  // TODO: Replace with actual retailer URL configuration
  const baseUrls: Record<string, string> = {
    amazon: 'https://amazon.com/AI-Born-dp/...',
    'barnes-noble': 'https://barnesandnoble.com/w/ai-born/...',
    bookshop: 'https://bookshop.org/books/ai-born/...',
    'apple-books': 'https://books.apple.com/us/book/ai-born/...',
    'google-play': 'https://play.google.com/store/books/details/AI_Born/...',
    kobo: 'https://kobo.com/us/en/ebook/ai-born/...',
    audible: 'https://audible.com/pd/AI-Born-Audiobook/...',
    spotify: 'https://open.spotify.com/show/ai-born/...',
  };

  return baseUrls[retailer] || baseUrls.amazon;
}

/**
 * Log request for monitoring
 */
function logRequest(data: {
  code: string;
  userId: string | null;
  ip: string;
  success: boolean;
  error?: string;
  retailer?: string;
  timestamp: string;
}) {
  console.log('[Code Redemption]', JSON.stringify(data, null, 2));
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const timestamp = new Date().toISOString();
  let clientIP = 'unknown';
  let user: { id: string; email: string } | null = null;

  try {
    // Get client IP for rate limiting and fraud detection
    clientIP = getClientIP(request);

    // Extract code from URL parameter
    const { code: codeParam } = await context.params;
    const codeUpper = codeParam.toUpperCase().trim();

    // Validate code format (6-character alphanumeric)
    if (!isValidCodeFormat(codeUpper)) {
      logRequest({
        code: codeParam,
        userId: null,
        ip: clientIP,
        success: false,
        error: 'Invalid code format',
        timestamp,
      });

      return NextResponse.json(
        {
          error: {
            code: 'INVALID_CODE',
            message: 'The redemption code format is invalid',
            details: {
              code: codeParam,
              reason: 'invalid_format',
            },
          },
          meta: {
            requestId: crypto.randomUUID(),
            timestamp,
          },
        },
        { status: 400 }
      );
    }

    // Check authentication
    user = await getAuthenticatedUser(request);
    if (!user) {
      logRequest({
        code: codeUpper,
        userId: null,
        ip: clientIP,
        success: false,
        error: 'Not authenticated',
        timestamp,
      });

      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to redeem a code',
            details: {
              reason: 'authentication_required',
            },
          },
          meta: {
            requestId: crypto.randomUUID(),
            timestamp,
          },
        },
        { status: 401 }
      );
    }

    // Check rate limit (10 attempts per hour per IP)
    const rateLimitResult = await checkRateLimit(
      clientIP,
      codeRedemptionRateLimiter,
      CODE_REDEMPTION_RATE_LIMIT
    );

    if (!rateLimitResult.success) {
      logRequest({
        code: codeUpper,
        userId: user.id,
        ip: clientIP,
        success: false,
        error: 'Rate limit exceeded',
        timestamp,
      });

      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many redemption attempts. Please try again later.',
            details: {
              limit: rateLimitResult.limit,
              window: '1 hour',
              resetIn: rateLimitResult.reset,
            },
          },
          meta: {
            requestId: crypto.randomUUID(),
            timestamp,
          },
        },
        {
          status: 429,
          headers: {
            ...getRateLimitHeaders(rateLimitResult),
          },
        }
      );
    }

    // Parse and validate request body
    let body: CodeRedemptionInput;
    try {
      const rawBody = await request.json();
      body = CodeRedemptionSchema.parse(rawBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(issue.message);
        });

        logRequest({
          code: codeUpper,
          userId: user.id,
          ip: clientIP,
          success: false,
          error: 'Validation failed',
          timestamp,
        });

        return NextResponse.json(
          {
            error: {
              code: 'INVALID_REQUEST',
              message: 'Request validation failed',
              details: errors,
            },
            meta: {
              requestId: crypto.randomUUID(),
              timestamp,
            },
          },
          { status: 400 }
        );
      }

      throw error;
    }

    // Find code in database
    const codeRecord = await findCodeByCode(codeUpper);
    if (!codeRecord) {
      logRequest({
        code: codeUpper,
        userId: user.id,
        ip: clientIP,
        success: false,
        error: 'Code not found',
        timestamp,
      });

      return NextResponse.json(
        {
          error: {
            code: 'CODE_NOT_FOUND',
            message: 'The redemption code does not exist',
            details: {
              code: codeUpper,
              reason: 'not_found',
            },
          },
          meta: {
            requestId: crypto.randomUUID(),
            timestamp,
          },
        },
        { status: 404 }
      );
    }

    // Check if code is already redeemed
    if (codeRecord.status === CodeStatus.REDEEMED) {
      logRequest({
        code: codeUpper,
        userId: user.id,
        ip: clientIP,
        success: false,
        error: 'Code already redeemed',
        timestamp,
      });

      return NextResponse.json(
        {
          error: {
            code: 'CODE_ALREADY_REDEEMED',
            message: 'This code has already been redeemed',
            details: {
              code: codeUpper,
              reason: 'already_redeemed',
              redeemedAt: codeRecord.redeemed_at?.toISOString(),
            },
          },
          meta: {
            requestId: crypto.randomUUID(),
            timestamp,
          },
        },
        { status: 409 }
      );
    }

    // Check if code is expired
    if (
      codeRecord.status === CodeStatus.EXPIRED ||
      (codeRecord.expires_at && codeRecord.expires_at < new Date())
    ) {
      logRequest({
        code: codeUpper,
        userId: user.id,
        ip: clientIP,
        success: false,
        error: 'Code expired',
        timestamp,
      });

      return NextResponse.json(
        {
          error: {
            code: 'CODE_EXPIRED',
            message: 'This code has expired and can no longer be redeemed',
            details: {
              code: codeUpper,
              reason: 'expired',
              expiresAt: codeRecord.expires_at?.toISOString(),
            },
          },
          meta: {
            requestId: crypto.randomUUID(),
            timestamp,
          },
        },
        { status: 410 }
      );
    }

    // Check if code is revoked
    if (codeRecord.status === CodeStatus.REVOKED) {
      logRequest({
        code: codeUpper,
        userId: user.id,
        ip: clientIP,
        success: false,
        error: 'Code revoked',
        timestamp,
      });

      return NextResponse.json(
        {
          error: {
            code: 'CODE_REVOKED',
            message: 'This code has been revoked and cannot be redeemed',
            details: {
              code: codeUpper,
              reason: 'revoked',
            },
          },
          meta: {
            requestId: crypto.randomUUID(),
            timestamp,
          },
        },
        { status: 403 }
      );
    }

    // Check if user already has a code for this format (anti-abuse)
    const userHasFormat = await userHasFormatCode(user.id, codeRecord.format);
    if (userHasFormat) {
      logRequest({
        code: codeUpper,
        userId: user.id,
        ip: clientIP,
        success: false,
        error: 'User already has format',
        timestamp,
      });

      return NextResponse.json(
        {
          error: {
            code: 'USER_ALREADY_HAS_FORMAT',
            message: `You have already redeemed a code for the ${codeRecord.format} format`,
            details: {
              code: codeUpper,
              format: codeRecord.format,
              reason: 'duplicate_format',
            },
          },
          meta: {
            requestId: crypto.randomUUID(),
            timestamp,
          },
        },
        { status: 409 }
      );
    }

    // Redeem the code (database transaction)
    const updatedCode = await redeemCode(
      codeRecord,
      user.id,
      body.retailer,
      body.deviceFingerprint,
      clientIP
    );

    // Create entitlement for user
    const entitlement = await createEntitlement(user.id, updatedCode.id);

    // Log audit event
    await logAuditEvent('code_redeemed', user.id, updatedCode.id, {
      before: { status: codeRecord.status },
      after: { status: CodeStatus.REDEEMED, retailer: body.retailer },
    });

    // Get retailer redirect URL
    const redirectUrl = getRetailerRedirectUrl(
      body.retailer,
      codeRecord.format as BookFormat
    );

    // Success response
    logRequest({
      code: codeUpper,
      userId: user.id,
      ip: clientIP,
      success: true,
      retailer: body.retailer,
      timestamp,
    });

    return NextResponse.json(
      {
        data: {
          status: 'redeemed',
          redirectUrl,
          retailer: body.retailer,
          format: updatedCode.format,
          nextSteps:
            'Complete your purchase at the retailer, then upload your receipt to unlock the toolkit.',
          receiptUploadUrl: '/api/receipts/upload',
          toolkitAccess: false,
          entitlement: {
            type: entitlement.entitlement_type,
            grantedAt: entitlement.granted_at.toISOString(),
          },
        },
        meta: {
          requestId: crypto.randomUUID(),
          timestamp,
        },
      },
      {
        status: 200,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    // Log server error
    console.error('[Code Redemption Error]', error);

    logRequest({
      code: 'unknown',
      userId: user?.id || null,
      ip: clientIP,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp,
    });

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred. Please try again later.',
          details: {
            error:
              process.env.NODE_ENV === 'development'
                ? error instanceof Error
                  ? error.message
                  : 'Unknown error'
                : undefined,
          },
        },
        meta: {
          requestId: crypto.randomUUID(),
          timestamp,
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

/**
 * Seed mock codes for development
 * TODO: Remove in production
 */
if (process.env.NODE_ENV === 'development') {
  // Seed a few test codes
  mockCodeStore.set('ABC123', {
    id: 'code_1',
    code: 'ABC123',
    format: BookFormat.HARDCOVER,
    status: CodeStatus.PENDING,
    org_id: null,
    user_id: null,
    retailer: null,
    redeemed_at: null,
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    created_at: new Date(),
    updated_at: new Date(),
  });

  mockCodeStore.set('XYZ789', {
    id: 'code_2',
    code: 'XYZ789',
    format: BookFormat.EBOOK,
    status: CodeStatus.PENDING,
    org_id: null,
    user_id: null,
    retailer: null,
    redeemed_at: null,
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    created_at: new Date(),
    updated_at: new Date(),
  });

  mockCodeStore.set('USED99', {
    id: 'code_3',
    code: 'USED99',
    format: BookFormat.HARDCOVER,
    status: CodeStatus.REDEEMED,
    org_id: null,
    user_id: 'user_test',
    retailer: 'amazon',
    redeemed_at: new Date(),
    expires_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  });
}
