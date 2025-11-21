/**
 * Organization Plan Detail API Routes
 * GET /api/orgs/[orgId]/plans/[planId] - Get plan details
 * PATCH /api/orgs/[orgId]/plans/[planId] - Update plan
 * DELETE /api/orgs/[orgId]/plans/[planId] - Delete plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { UpdatePlanInput } from '@/types/organization';

/**
 * GET /api/orgs/[orgId]/plans/[planId]
 * Get plan details with access tracking
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; planId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orgId, planId } = await params;

    // Get plan with access check
    const plan = await prisma.orgPlan.findFirst({
      where: {
        id: planId,
        orgId,
        OR: [
          { privacy: 'PUBLIC' },
          { createdBy: session.user.id },
          {
            privacy: 'SHARED',
            OR: [
              { createdBy: session.user.id },
              {
                shares: {
                  some: {
                    member: {
                      userId: session.user.id,
                      status: 'ACTIVE',
                    },
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        org: {
          select: {
            id: true,
            name: true,
          },
        },
        shares: {
          include: {
            member: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            shares: true,
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found or access denied' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.orgPlan.update({
      where: { id: planId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    // Get creator info
    const creator = await prisma.user.findUnique({
      where: { id: plan.createdBy },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json({
      success: true,
      plan: {
        ...plan,
        creator: creator ?? {
          id: plan.createdBy,
          email: 'unknown@example.com',
          name: null,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching plan:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orgs/[orgId]/plans/[planId]
 * Update plan details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; planId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orgId, planId } = await params;

    // Get plan
    const plan = await prisma.orgPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || plan.orgId !== orgId) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Check if user can edit (creator or admin/owner)
    const membership = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId: session.user.id,
        },
      },
    });

    const canEdit =
      plan.createdBy === session.user.id ||
      (membership && ['OWNER', 'ADMIN'].includes(membership.role));

    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to edit this plan' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = (await request.json()) as UpdatePlanInput;

    // Update plan
    const updatedPlan = await prisma.orgPlan.update({
      where: { id: planId },
      data: {
        title: body.title?.trim(),
        description: body.description?.trim(),
        status: body.status,
        privacy: body.privacy,
        content: body.content,
        contentJson: body.contentJson as any,
        publishedAt: body.status === 'PUBLISHED' ? new Date() : undefined,
      },
      include: {
        org: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
    });
  } catch (error) {
    console.error('Error updating plan:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orgs/[orgId]/plans/[planId]
 * Delete plan
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; planId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orgId, planId } = await params;

    // Get plan
    const plan = await prisma.orgPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || plan.orgId !== orgId) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Check if user can delete (creator or owner)
    const membership = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId: session.user.id,
        },
      },
    });

    const canDelete =
      plan.createdBy === session.user.id ||
      (membership && membership.role === 'OWNER');

    if (!canDelete) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions to delete this plan',
        },
        { status: 403 }
      );
    }

    // Delete plan
    await prisma.orgPlan.delete({
      where: { id: planId },
    });

    return NextResponse.json({
      success: true,
      message: 'Plan deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting plan:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to delete plan' },
      { status: 500 }
    );
  }
}
