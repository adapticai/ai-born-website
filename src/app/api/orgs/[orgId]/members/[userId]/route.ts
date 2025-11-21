/**
 * Organization Member Detail API Routes
 * DELETE /api/orgs/[orgId]/members/[userId] - Remove member from organization
 * PATCH /api/orgs/[orgId]/members/[userId] - Update member role/status
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { RemoveMemberResponse, UpdateMemberInput } from '@/types/organization';

/**
 * DELETE /api/orgs/[orgId]/members/[userId]
 * Remove a member from the organization
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orgId, userId } = await params;

    // Verify user has permission to remove members
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
        { success: false, error: 'Insufficient permissions to remove members' },
        { status: 403 }
      );
    }

    // Get target member
    const targetMember = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
    });

    if (!targetMember) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    // Prevent removing the owner unless there's another owner
    if (targetMember.role === 'OWNER') {
      const ownerCount = await prisma.orgMember.count({
        where: {
          orgId,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      });

      if (ownerCount <= 1) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot remove the only owner. Transfer ownership first.',
          },
          { status: 400 }
        );
      }
    }

    // Prevent non-owners from removing owners
    if (membership.role !== 'OWNER' && targetMember.role === 'OWNER') {
      return NextResponse.json(
        { success: false, error: 'Cannot remove an owner' },
        { status: 403 }
      );
    }

    // Update member status to REMOVED instead of deleting
    await prisma.orgMember.update({
      where: { id: targetMember.id },
      data: {
        status: 'REMOVED',
      },
    });

    const response: RemoveMemberResponse = {
      success: true,
      message: 'Member removed successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error removing member:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orgs/[orgId]/members/[userId]
 * Update member role or status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orgId, userId } = await params;

    // Verify user has permission to update members
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
        { success: false, error: 'Insufficient permissions to update members' },
        { status: 403 }
      );
    }

    // Get target member
    const targetMember = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
    });

    if (!targetMember) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = (await request.json()) as UpdateMemberInput;

    // Prevent non-owners from changing owner roles
    if (
      membership.role !== 'OWNER' &&
      (targetMember.role === 'OWNER' || body.role === 'OWNER')
    ) {
      return NextResponse.json(
        { success: false, error: 'Only owners can change owner roles' },
        { status: 403 }
      );
    }

    // Update member
    const updatedMember = await prisma.orgMember.update({
      where: { id: targetMember.id },
      data: {
        role: body.role,
        status: body.status,
        metadata: body.metadata as any,
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

    return NextResponse.json({
      success: true,
      member: updatedMember,
    });
  } catch (error) {
    console.error('Error updating member:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to update member' },
      { status: 500 }
    );
  }
}
