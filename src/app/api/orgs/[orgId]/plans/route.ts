/**
 * Organization Plans API Routes
 * POST /api/orgs/[orgId]/plans - Create/generate a new plan
 * GET /api/orgs/[orgId]/plans - List organization plans
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generalFormRateLimiter } from '@/lib/ratelimit';
import { generatePlan, parsePlanContent, validatePlanContent } from '@/lib/llm-plan-generator';
import type {
  GeneratePlanRequest,
  GeneratePlanResponse,
} from '@/types/organization';

/**
 * POST /api/orgs/[orgId]/plans
 * Generate a new plan using Claude AI
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

    // Rate limiting - expensive LLM operation
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';

    if (generalFormRateLimiter) {
      const { success: rateLimitOk } = await generalFormRateLimiter.limit(
        `plan-generate:${orgId}:${session.user.id}:${ip}`
      );

      if (!rateLimitOk) {
        return NextResponse.json(
          {
            success: false,
            error: 'Plan generation limit reached. Please try again later.',
          },
          { status: 429 }
        );
      }
    }

    // Verify user is a member with plan creation permission
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

    if (!membership || membership.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Not a member of this organization' },
        { status: 403 }
      );
    }

    // Members and above can create plans (viewers cannot)
    if (membership.role === 'VIEWER') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to create plans' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = (await request.json()) as GeneratePlanRequest;

    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Plan title is required' },
        { status: 400 }
      );
    }

    // Create plan record with GENERATING status
    const plan = await prisma.orgPlan.create({
      data: {
        orgId,
        createdBy: session.user.id,
        title: body.title.trim(),
        description: body.description?.trim(),
        privacy: body.privacy || 'PRIVATE',
        status: 'GENERATING',
        content: '', // Will be updated after generation
      },
    });

    try {
      // Generate plan using Claude AI
      const startTime = Date.now();

      const generationResult = await generatePlan({
        organizationName: membership.org.name,
        organizationType: membership.org.type,
        industry: body.organizationContext?.industry,
        size: body.organizationContext?.size,
        challenges: body.organizationContext?.challenges,
        goals: body.organizationContext?.goals,
      });

      const generationTime = Date.now() - startTime;

      // Validate generated content
      const validation = validatePlanContent(generationResult.content);

      if (!validation.valid) {
        throw new Error(`Generated plan validation failed: ${validation.errors.join(', ')}`);
      }

      // Parse content into structured JSON
      const contentJson = parsePlanContent(generationResult.content);

      // Update plan with generated content
      const updatedPlan = await prisma.orgPlan.update({
        where: { id: plan.id },
        data: {
          content: generationResult.content,
          contentJson: contentJson as any,
          status: 'READY',
          model: generationResult.metadata.model,
          generationTime,
          tokenCount: generationResult.metadata.tokenCount,
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

      const response: GeneratePlanResponse = {
        success: true,
        plan: {
          ...updatedPlan,
          creator: {
            id: session.user.id,
            name: session.user.name ?? null,
            email: session.user.email ?? '',
          },
        },
        generationTime,
      };

      return NextResponse.json(response, { status: 201 });
    } catch (error) {
      // Update plan status to indicate error
      await prisma.orgPlan.update({
        where: { id: plan.id },
        data: {
          status: 'DRAFT',
          content: `Error generating plan: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      });

      throw error;
    }
  } catch (error) {
    console.error('Error generating plan:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate plan',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orgs/[orgId]/plans
 * List plans accessible to the user
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

    // Get plans with privacy filtering
    const plans = await prisma.orgPlan.findMany({
      where: {
        orgId,
        OR: [
          // Public plans
          { privacy: 'PUBLIC' },

          // User's own plans
          { createdBy: session.user.id },

          // Shared plans where user has access
          {
            privacy: 'SHARED',
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
      include: {
        org: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            shares: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get creator info for each plan
    const creatorIds = [...new Set(plans.map((p) => p.createdBy))];
    const creators = await prisma.user.findMany({
      where: {
        id: {
          in: creatorIds,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const creatorMap = new Map(creators.map((c) => [c.id, c]));

    const plansWithCreators = plans.map((plan) => ({
      ...plan,
      creator: creatorMap.get(plan.createdBy) ?? {
        id: plan.createdBy,
        email: 'unknown@example.com',
        name: null,
      },
    }));

    return NextResponse.json({
      success: true,
      plans: plansWithCreators,
    });
  } catch (error) {
    console.error('Error fetching plans:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}
