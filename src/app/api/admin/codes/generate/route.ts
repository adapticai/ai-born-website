/**
 * Admin API: Generate VIP Codes
 *
 * POST /api/admin/codes/generate
 *
 * Generate batch VIP codes with specified parameters.
 * Requires admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { CodeType } from '@prisma/client';
import {
  generateAndSaveCodes,
  exportCodesToCsv,
  type CodeGenerationOptions,
} from '@/lib/code-generator';
import {
  checkAdminAuth,
  logAdminAction,
  getClientIp,
} from '@/lib/admin-auth';

/**
 * Request body schema
 */
interface GenerateCodesRequest {
  count: number;
  type: CodeType;
  description?: string;
  maxRedemptions?: number;
  validFrom?: string; // ISO date string
  validUntil?: string; // ISO date string
  orgId?: string;
  format?: 'json' | 'csv'; // Response format
}

/**
 * Validate request body
 */
function validateRequest(body: unknown): {
  valid: boolean;
  data?: GenerateCodesRequest;
  error?: string;
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const req = body as Partial<GenerateCodesRequest>;

  // Validate count
  if (typeof req.count !== 'number' || req.count <= 0 || req.count > 10000) {
    return {
      valid: false,
      error: 'Count must be a number between 1 and 10,000',
    };
  }

  // Validate type
  const validTypes: CodeType[] = [
    'VIP_PREVIEW',
    'VIP_BONUS',
    'VIP_LAUNCH',
    'PARTNER',
    'MEDIA',
    'INFLUENCER',
  ];
  if (!req.type || !validTypes.includes(req.type)) {
    return {
      valid: false,
      error: `Type must be one of: ${validTypes.join(', ')}`,
    };
  }

  // Validate maxRedemptions
  if (
    req.maxRedemptions !== undefined &&
    (typeof req.maxRedemptions !== 'number' || req.maxRedemptions < 1)
  ) {
    return {
      valid: false,
      error: 'maxRedemptions must be a positive number',
    };
  }

  // Validate dates
  if (req.validFrom && isNaN(Date.parse(req.validFrom))) {
    return { valid: false, error: 'validFrom must be a valid ISO date' };
  }

  if (req.validUntil && isNaN(Date.parse(req.validUntil))) {
    return { valid: false, error: 'validUntil must be a valid ISO date' };
  }

  // Validate format
  if (req.format && !['json', 'csv'].includes(req.format)) {
    return { valid: false, error: 'format must be "json" or "csv"' };
  }

  return { valid: true, data: req as GenerateCodesRequest };
}

/**
 * POST handler
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await checkAdminAuth(request);
    if (!authResult.authorized) {
      return NextResponse.json(
        {
          error: authResult.error,
          rateLimited: authResult.rateLimited,
        },
        { status: authResult.rateLimited ? 429 : 401 }
      );
    }

    const adminId = authResult.adminId!;

    // Parse request body
    const body = await request.json();

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const {
      count,
      type,
      description,
      maxRedemptions,
      validFrom,
      validUntil,
      orgId,
      format = 'json',
    } = validation.data!;

    // Prepare options
    const options: CodeGenerationOptions = {
      count,
      type,
      description,
      maxRedemptions,
      validFrom: validFrom ? new Date(validFrom) : undefined,
      validUntil: validUntil ? new Date(validUntil) : undefined,
      createdBy: adminId,
      orgId,
    };

    // Generate codes
    const codes = await generateAndSaveCodes(options);

    // Log action
    logAdminAction({
      timestamp: new Date(),
      adminId,
      action: 'GENERATE_CODES',
      resource: 'codes',
      details: {
        count,
        type,
        description,
        maxRedemptions,
        validFrom,
        validUntil,
        orgId,
      },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // Return response
    if (format === 'csv') {
      const csv = exportCodesToCsv(codes);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="vip-codes-${type}-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        count: codes.length,
        codes: codes.map((c) => ({
          id: c.id,
          code: c.code,
          type: c.type,
          validFrom: c.validFrom.toISOString(),
          validUntil: c.validUntil?.toISOString() || null,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Code generation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate codes',
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
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    }
  );
}
