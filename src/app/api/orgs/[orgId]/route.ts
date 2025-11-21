/**
 * Organization Detail API Routes
 * GET /api/orgs/[orgId] - Get organization details
 * PATCH /api/orgs/[orgId] - Update organization
 * DELETE /api/orgs/[orgId] - Delete organization
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyOrgMembership } from '@/lib/prisma-rls';
import type { GetOrgResponse, UpdateOrganizationInput } from '@/types/organization';

/**
 * GET /api/orgs/[orgId]
 * Get organization details with statistics
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
    const membership = await verifyOrgMembership(
      prisma,
      session.user.id,
      orgId
    );

    if (!membership.isMember) {
      return NextResponse.json(
        { success: false, error: 'Not a member of this organization' },
        { status: 403 }
      );
    }

    // Fetch organization with relations
    const org = await prisma.org.findUnique({
      where: { id: orgId },
      include: {
        members: {
          where: { status: 'ACTIVE' },
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
        },
        codes: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        plans: {
          where: {
            OR: [
              { privacy: 'PUBLIC' },
              { createdBy: session.user.id },
              {
                privacy: 'SHARED',
                shares: {
                  some: {
                    member: {
                      userId: session.user.id,
                    },
                  },
                },
              },
            ],
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        bulkOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            members: true,
            codes: true,
            bulkOrders: true,
            plans: true,
          },
        },
      },
    });

    if (!org) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Calculate statistics
    const stats = {
      totalMembers: org._count.members,
      activeMembers: org.members.length,
      totalCodes: org._count.codes,
      activeCodes: org.codes.filter((c) => c.status === 'ACTIVE').length,
      totalCodeRedemptions: org.codes.reduce(
        (sum, code) => sum + code.redemptionCount,
        0
      ),
      totalPlans: org._count.plans,
      publishedPlans: org.plans.filter((p) => p.status === 'PUBLISHED').length,
    };

    // Get user's membership info
    const userMembership = org.members.find(
      (m) => m.userId === session.user.id
    );

    const response: GetOrgResponse = {
      success: true,
      org,
      stats,
      userMembership,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching organization:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orgs/[orgId]
 * Update organization details
 */
export async function PATCH(
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

    // Verify user has admin/owner role
    const membership = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId: session.user.id,
        },
      },
    });

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = (await request.json()) as UpdateOrganizationInput;

    // Update organization
    const org = await prisma.org.update({
      where: { id: orgId },
      data: {
        name: body.name?.trim(),
        type: body.type,
        contactEmail: body.contactEmail?.trim(),
        contactName: body.contactName?.trim(),
        domain: body.domain?.toLowerCase().trim(),
        notes: body.notes,
        allowAutoJoin: body.allowAutoJoin,
        settings: body.settings as any,
      },
    });

    return NextResponse.json({
      success: true,
      org,
    });
  } catch (error) {
    console.error('Error updating organization:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orgs/[orgId]
 * Delete organization (owner only)
 */
export async function DELETE(
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

    // Verify user is the owner
    const membership = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId: session.user.id,
        },
      },
    });

    if (!membership || membership.role !== 'OWNER') {
      return NextResponse.json(
        { success: false, error: 'Only organization owner can delete' },
        { status: 403 }
      );
    }

    // Delete organization (cascade will handle relations)
    await prisma.org.delete({
      where: { id: orgId },
    });

    return NextResponse.json({
      success: true,
      message: 'Organization deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting organization:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
