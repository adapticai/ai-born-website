/**
 * Organization Members API Routes
 * POST /api/orgs/[orgId]/members - Add member to organization
 * GET /api/orgs/[orgId]/members - List organization members
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generalFormRateLimiter } from '@/lib/ratelimit';
import type { AddMemberRequest, AddMemberResponse } from '@/types/organization';
import { isEmailFromDomain } from '@/lib/domain-verification';

/**
 * POST /api/orgs/[orgId]/members
 * Add a member to the organization
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orgId } = await params;

    // Rate limiting - use generalFormRateLimiter directly
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';

    if (generalFormRateLimiter) {
      const rateLimitResult = await generalFormRateLimiter.limit(`org-member-add:${orgId}:${ip}`);

      if (!rateLimitResult.success) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
    }

    // Verify user has permission to add members
    const membership = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId: session.user.id,
        },
      },
      include: {
        org: true,
      },
    });

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to add members' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = (await request.json()) as AddMemberRequest;

    if (!body.email || !body.email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const email = body.email.toLowerCase().trim();

    // Check domain verification if applicable
    if (
      membership.org.domain &&
      membership.org.domainVerified &&
      !isEmailFromDomain(email, membership.org.domain)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Email must be from verified domain: ${membership.org.domain}`,
        },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create a new user account
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Use email prefix as default name
        },
      });
    }

    // Check if already a member
    const existingMember = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      if (existingMember.status === 'ACTIVE') {
        return NextResponse.json(
          { success: false, error: 'User is already a member' },
          { status: 400 }
        );
      }

      // Reactivate if previously removed
      const updatedMember = await prisma.orgMember.update({
        where: { id: existingMember.id },
        data: {
          status: 'ACTIVE',
          role: body.role || 'MEMBER',
          joinedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      const response: AddMemberResponse = {
        success: true,
        member: updatedMember,
        message: 'Member reactivated successfully',
      };

      return NextResponse.json(response);
    }

    // Create new member
    const newMember = await prisma.orgMember.create({
      data: {
        orgId,
        userId: user.id,
        role: body.role || 'MEMBER',
        status: 'ACTIVE',
        invitedBy: session.user.id,
        invitedAt: new Date(),
        joinedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // TODO: Send invitation email

    const response: AddMemberResponse = {
      success: true,
      member: newMember,
      message: 'Member added successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error adding member:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to add member' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orgs/[orgId]/members
 * List organization members
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orgId } = await params;

    // Verify user is a member
    const membership = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId: session.user.id,
        },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Not a member of this organization' },
        { status: 403 }
      );
    }

    // Get all active members
    const members = await prisma.orgMember.findMany({
      where: {
        orgId,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      members,
    });
  } catch (error) {
    console.error('Error fetching members:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}
