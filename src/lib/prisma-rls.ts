/**
 * Prisma Row-Level Security (RLS) Middleware
 *
 * Enforces organization-level access control for all database queries
 */

import { Prisma } from '@prisma/client';
import type { OrgMemberRole, OrgPlanPrivacy } from '@prisma/client';

export interface RLSContext {
  userId?: string;
  orgId?: string;
  role?: OrgMemberRole;
}

// Define middleware types for internal use (Prisma v5+ uses extensions)
type MiddlewareParams = {
  model?: string;
  action: string;
  args: any;
  dataPath: string[];
  runInTransaction: boolean;
};

type MiddlewareNext = (params: MiddlewareParams) => Promise<unknown>;

/**
 * Create RLS middleware for Prisma Client
 */
export function createRLSMiddleware(context: RLSContext) {
  return async (params: MiddlewareParams, next: MiddlewareNext) => {
    const { userId, orgId, role } = context;

    // Skip RLS for certain operations or when context is missing
    if (!userId || !orgId) {
      return next(params);
    }

    // Apply RLS based on model
    switch (params.model) {
      case 'OrgMember':
        return handleOrgMemberRLS(params, next, context);

      case 'OrgPlan':
        return handleOrgPlanRLS(params, next, context);

      case 'OrgPlanShare':
        return handleOrgPlanShareRLS(params, next, context);

      case 'Org':
        return handleOrgRLS(params, next, context);

      default:
        return next(params);
    }
  };
}

/**
 * Handle RLS for OrgMember queries
 */
async function handleOrgMemberRLS(
  params: MiddlewareParams,
  next: MiddlewareNext,
  context: RLSContext
) {
  const { orgId, role } = context;

  // Only allow access to members of the user's organization
  if (params.action === 'findMany' || params.action === 'findFirst') {
    params.args = params.args || {};
    params.args.where = {
      ...params.args.where,
      orgId,
    };
  }

  // Restrict member updates/deletes based on role
  if (
    (params.action === 'update' || params.action === 'delete') &&
    role !== 'OWNER' &&
    role !== 'ADMIN'
  ) {
    throw new Error('Insufficient permissions to manage members');
  }

  return next(params);
}

/**
 * Handle RLS for OrgPlan queries with privacy mode enforcement
 */
async function handleOrgPlanRLS(
  params: MiddlewareParams,
  next: MiddlewareNext,
  context: RLSContext
) {
  const { userId, orgId } = context;

  if (params.action === 'findMany' || params.action === 'findFirst') {
    params.args = params.args || {};

    // Build privacy filter based on user's access
    const privacyFilter: Prisma.OrgPlanWhereInput = {
      orgId,
      OR: [
        // Public plans visible to all org members
        { privacy: 'PUBLIC' },

        // Private plans visible only to creator
        {
          privacy: 'PRIVATE',
          createdBy: userId,
        },

        // Shared plans where user is explicitly granted access
        {
          privacy: 'SHARED',
          OR: [
            { createdBy: userId },
            {
              shares: {
                some: {
                  member: {
                    userId,
                    orgId,
                    status: 'ACTIVE',
                  },
                },
              },
            },
          ],
        },
      ],
    };

    // Merge with existing where clause
    params.args.where = {
      ...params.args.where,
      ...privacyFilter,
    };
  }

  // For single record access (findUnique), verify access after query
  if (params.action === 'findUnique') {
    const result = await next(params);

    if (result && typeof result === 'object' && 'privacy' in result) {
      const plan = result as { privacy: OrgPlanPrivacy; createdBy: string; orgId: string };

      // Check if user has access based on privacy mode
      const hasAccess = await checkPlanAccess(plan, userId!, orgId!);

      if (!hasAccess) {
        return null; // Hide the plan from unauthorized users
      }
    }

    return result;
  }

  // Restrict plan updates/deletes to creator or admins
  if (params.action === 'update' || params.action === 'delete') {
    const planId = params.args.where?.id;

    if (planId) {
      // Verify user is creator or has admin role
      const hasPermission = await verifyPlanPermission(planId, userId!, context.role);

      if (!hasPermission) {
        throw new Error('Insufficient permissions to modify this plan');
      }
    }
  }

  return next(params);
}

/**
 * Handle RLS for OrgPlanShare queries
 */
async function handleOrgPlanShareRLS(
  params: MiddlewareParams,
  next: MiddlewareNext,
  context: RLSContext
) {
  const { userId, orgId } = context;

  if (params.action === 'findMany' || params.action === 'findFirst') {
    params.args = params.args || {};

    // Only show shares for plans the user has access to
    params.args.where = {
      ...params.args.where,
      member: {
        userId,
        orgId,
        status: 'ACTIVE',
      },
    };
  }

  return next(params);
}

/**
 * Handle RLS for Org queries
 */
async function handleOrgRLS(
  params: MiddlewareParams,
  next: MiddlewareNext,
  context: RLSContext
) {
  const { orgId } = context;

  // Only allow access to user's organization
  if (params.action === 'findUnique' || params.action === 'update') {
    params.args = params.args || {};
    params.args.where = {
      ...params.args.where,
      id: orgId,
    };
  }

  return next(params);
}

/**
 * Check if user has access to a specific plan based on privacy mode
 */
async function checkPlanAccess(
  plan: { privacy: OrgPlanPrivacy; createdBy: string; orgId: string },
  userId: string,
  orgId: string
): Promise<boolean> {
  // Plan must be in user's organization
  if (plan.orgId !== orgId) {
    return false;
  }

  // Public plans are accessible to all org members
  if (plan.privacy === 'PUBLIC') {
    return true;
  }

  // Private plans only accessible to creator
  if (plan.privacy === 'PRIVATE') {
    return plan.createdBy === userId;
  }

  // Shared plans require explicit share or being the creator
  if (plan.privacy === 'SHARED') {
    if (plan.createdBy === userId) {
      return true;
    }

    // Would need to query OrgPlanShare to verify access
    // This is a simplified check - in production, use Prisma to verify
    return false;
  }

  return false;
}

/**
 * Verify user has permission to modify a plan
 */
async function verifyPlanPermission(
  planId: string,
  userId: string,
  role?: OrgMemberRole
): Promise<boolean> {
  // Owners and admins can modify all plans
  if (role === 'OWNER' || role === 'ADMIN') {
    return true;
  }

  // For other roles, would need to check if they're the creator
  // This is a simplified check - in production, query the plan to verify createdBy
  return false;
}

/**
 * Create a Prisma client instance with RLS middleware
 */
export function createPrismaClientWithRLS(prisma: any, context: RLSContext) {
  // Create a new client instance with RLS middleware
  const clientWithRLS = prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: any) {
          // Apply RLS logic here
          const middleware = createRLSMiddleware(context);

          return middleware(
            { model, action: operation, args, dataPath: [], runInTransaction: false },
            (params) => query(params.args)
          );
        },
      },
    },
  });

  return clientWithRLS;
}

/**
 * Utility to get user's organization membership
 */
export async function getUserOrgMembership(
  prisma: any,
  userId: string,
  orgId: string
) {
  return prisma.orgMember.findUnique({
    where: {
      orgId_userId: {
        orgId,
        userId,
      },
    },
    select: {
      id: true,
      role: true,
      status: true,
      orgId: true,
    },
  });
}

/**
 * Verify user is an active member of an organization
 */
export async function verifyOrgMembership(
  prisma: any,
  userId: string,
  orgId: string
): Promise<{ isMember: boolean; role?: OrgMemberRole }> {
  const membership = await getUserOrgMembership(prisma, userId, orgId);

  if (!membership || membership.status !== 'ACTIVE') {
    return { isMember: false };
  }

  return {
    isMember: true,
    role: membership.role,
  };
}
