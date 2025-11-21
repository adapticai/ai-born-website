/**
 * Organization API Routes
 * POST /api/orgs - Create a new organization
 * GET /api/orgs - List user's organizations
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generalFormRateLimiter } from '@/lib/ratelimit';
import type { CreateOrgRequest, CreateOrgResponse } from '@/types/organization';
import { isValidDomain } from '@/lib/domain-verification';

/**
 * POST /api/orgs
 * Create a new organization
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';

    if (generalFormRateLimiter) {
      const { success: rateLimitOk } = await generalFormRateLimiter.limit(
        `org-create:${session.user.id}:${ip}`
      );

      if (!rateLimitOk) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
    }

    // Parse request body
    const body = (await request.json()) as CreateOrgRequest;

    // Validate required fields
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Organization name is required' },
        { status: 400 }
      );
    }

    if (!body.type) {
      return NextResponse.json(
        { success: false, error: 'Organization type is required' },
        { status: 400 }
      );
    }

    // Validate domain if provided
    if (body.domain && !isValidDomain(body.domain)) {
      return NextResponse.json(
        { success: false, error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Create organization and add creator as owner in a transaction
    const org = await prisma.$transaction(async (tx) => {
      const newOrg = await tx.org.create({
        data: {
          name: body.name.trim(),
          type: body.type,
          contactEmail: body.contactEmail?.trim(),
          contactName: body.contactName?.trim(),
          domain: body.domain?.toLowerCase().trim(),
        },
      });

      // Add creator as owner
      await tx.orgMember.create({
        data: {
          orgId: newOrg.id,
          userId: session.user.id,
          role: 'OWNER',
          status: 'ACTIVE',
          joinedAt: new Date(),
        },
      });

      return newOrg;
    });

    const response: CreateOrgResponse = {
      success: true,
      orgId: org.id,
      org,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating organization:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orgs
 * List organizations the user is a member of
 */
export async function GET() {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's organization memberships
    const memberships = await prisma.orgMember.findMany({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
      include: {
        org: {
          include: {
            _count: {
              select: {
                members: true,
                codes: true,
                plans: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const organizations = memberships.map((membership) => ({
      ...membership.org,
      userRole: membership.role,
      joinedAt: membership.joinedAt,
    }));

    return NextResponse.json({
      success: true,
      organizations,
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}
