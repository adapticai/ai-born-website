/**
 * Admin API: List VIP Codes
 *
 * GET /api/admin/codes/list
 *
 * List VIP codes with filtering and pagination.
 * Requires admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { CodeType, CodeStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCodeStatistics } from '@/lib/code-generator';
import { checkAdminAuth } from '@/lib/admin-auth';

/**
 * Query parameters
 */
interface ListCodesQuery {
  page?: number;
  limit?: number;
  type?: CodeType;
  status?: CodeStatus;
  search?: string; // Search by code
  orgId?: string;
  includeStats?: boolean;
}

/**
 * Parse query parameters
 */
function parseQuery(searchParams: URLSearchParams): ListCodesQuery {
  return {
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: Math.min(parseInt(searchParams.get('limit') || '50', 10), 1000),
    type: (searchParams.get('type') as CodeType) || undefined,
    status: (searchParams.get('status') as CodeStatus) || undefined,
    search: searchParams.get('search') || undefined,
    orgId: searchParams.get('orgId') || undefined,
    includeStats: searchParams.get('includeStats') === 'true',
  };
}

/**
 * GET handler
 */
export async function GET(request: NextRequest) {
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

    // Parse query
    const query = parseQuery(request.nextUrl.searchParams);
    const { page = 1, limit = 50, type, status, search, orgId, includeStats } = query;

    // Build where clause
    const where: {
      type?: CodeType;
      status?: CodeStatus;
      code?: { contains: string; mode: 'insensitive' };
      orgId?: string;
    } = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (search) where.code = { contains: search, mode: 'insensitive' };
    if (orgId) where.orgId = orgId;

    // Count total
    const total = await prisma.code.count({ where });

    // Fetch codes
    const codes = await prisma.code.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        code: true,
        type: true,
        status: true,
        description: true,
        maxRedemptions: true,
        redemptionCount: true,
        validFrom: true,
        validUntil: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
        orgId: true,
        org: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    // Optionally fetch statistics
    let stats = undefined;
    if (includeStats) {
      stats = await getCodeStatistics(type);
    }

    return NextResponse.json({
      success: true,
      data: {
        codes: codes.map((c) => ({
          id: c.id,
          code: c.code,
          type: c.type,
          status: c.status,
          description: c.description,
          maxRedemptions: c.maxRedemptions,
          redemptionCount: c.redemptionCount,
          validFrom: c.validFrom.toISOString(),
          validUntil: c.validUntil?.toISOString() || null,
          createdBy: c.createdBy,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
          orgId: c.orgId,
          org: c.org,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats,
      },
    });
  } catch (error) {
    console.error('[API] List codes error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch codes',
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
        'Allow': 'GET, OPTIONS',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    }
  );
}
