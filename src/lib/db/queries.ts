/**
 * Database Query Helpers
 *
 * Common database queries for the AI-Born landing page.
 * Organized by domain for easy reuse across API routes and server actions.
 */

import { prisma } from '@/lib/prisma';
import type {
  Code,
  CodeType,
  Entitlement,
  EntitlementType,
  User,
  RetailerGeo,
  EmailCaptureSource,
  AnalyticsEventType,
} from '@prisma/client';

// ============================================================================
// USER QUERIES
// ============================================================================

export const userQueries = {
  /**
   * Find or create user by email
   */
  findOrCreate: async (email: string, name?: string): Promise<User> => {
    return prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name,
        emailVerified: null,
      },
    });
  },

  /**
   * Get user with all entitlements
   */
  withEntitlements: async (userId: string) => {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        entitlements: {
          where: { status: 'ACTIVE' },
          include: { code: true },
        },
      },
    });
  },

  /**
   * Get user's active entitlements by type
   */
  getActiveEntitlements: async (
    userId: string,
    type?: EntitlementType
  ): Promise<Entitlement[]> => {
    return prisma.entitlement.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        ...(type && { type }),
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      include: { code: true },
    });
  },
};

// ============================================================================
// VIP CODE QUERIES
// ============================================================================

export const codeQueries = {
  /**
   * Validate code and check redemption eligibility
   */
  validate: async (code: string): Promise<{
    valid: boolean;
    code?: Code;
    reason?: string;
  }> => {
    const vipCode = await prisma.code.findUnique({
      where: { code },
    });

    if (!vipCode) {
      return { valid: false, reason: 'Code not found' };
    }

    if (vipCode.status !== 'ACTIVE') {
      return { valid: false, reason: 'Code is not active' };
    }

    const now = new Date();
    if (vipCode.validFrom > now) {
      return { valid: false, reason: 'Code is not yet valid' };
    }

    if (vipCode.validUntil && vipCode.validUntil < now) {
      return { valid: false, reason: 'Code has expired' };
    }

    if (
      vipCode.maxRedemptions &&
      vipCode.redemptionCount >= vipCode.maxRedemptions
    ) {
      return { valid: false, reason: 'Code has reached redemption limit' };
    }

    return { valid: true, code: vipCode };
  },

  /**
   * Redeem code for user (atomic transaction)
   */
  redeem: async (
    code: string,
    userId: string,
    entitlementType: EntitlementType,
    metadata?: Record<string, unknown>
  ): Promise<{ success: boolean; entitlement?: Entitlement; error?: string }> => {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const vipCode = await tx.code.findUnique({
          where: { code },
        });

        if (!vipCode || vipCode.status !== 'ACTIVE') {
          throw new Error('Invalid code');
        }

        if (
          vipCode.maxRedemptions &&
          vipCode.redemptionCount >= vipCode.maxRedemptions
        ) {
          throw new Error('Code redemption limit reached');
        }

        // Increment redemption count
        await tx.code.update({
          where: { id: vipCode.id },
          data: { redemptionCount: { increment: 1 } },
        });

        // Create entitlement
        const entitlement = await tx.entitlement.create({
          data: {
            userId,
            codeId: vipCode.id,
            type: entitlementType,
            status: 'ACTIVE',
            metadata: (metadata as any) || undefined,
          },
        });

        return entitlement;
      });

      return { success: true, entitlement: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Redemption failed',
      };
    }
  },

  /**
   * Get active codes by type
   */
  getActiveByType: async (type: CodeType): Promise<Code[]> => {
    const now = new Date();
    return prisma.code.findMany({
      where: {
        type,
        status: 'ACTIVE',
        validFrom: { lte: now },
        OR: [{ validUntil: null }, { validUntil: { gte: now } }],
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};

// ============================================================================
// RETAILER QUERIES
// ============================================================================

export const retailerQueries = {
  /**
   * Get active retailers for a geo region, sorted by priority
   */
  getByGeo: async (geo: RetailerGeo) => {
    return prisma.retailerSelection.findMany({
      where: {
        geo,
        isActive: true,
      },
      orderBy: { priority: 'desc' },
    });
  },

  /**
   * Track retailer click
   */
  trackClick: async (retailerId: string) => {
    return prisma.retailerSelection.update({
      where: { id: retailerId },
      data: { clickCount: { increment: 1 } },
    });
  },

  /**
   * Get NYT-eligible retailers
   */
  getNYTEligible: async (geo: RetailerGeo) => {
    return prisma.retailerSelection.findMany({
      where: {
        geo,
        isActive: true,
        nytEligible: true,
      },
      orderBy: { priority: 'desc' },
    });
  },
};

// ============================================================================
// EMAIL CAPTURE QUERIES
// ============================================================================

export const emailQueries = {
  /**
   * Capture email lead with tracking data
   */
  capture: async (data: {
    email: string;
    name?: string;
    source: EmailCaptureSource;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    referrer?: string;
    ipAddress?: string;
    userAgent?: string;
    geo?: string;
  }) => {
    return prisma.emailCapture.upsert({
      where: {
        email_source: {
          email: data.email,
          source: data.source,
        },
      },
      update: {
        name: data.name || undefined,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        referrer: data.referrer,
        geo: data.geo,
      },
      create: data,
    });
  },

  /**
   * Verify email (double opt-in)
   */
  verify: async (email: string, source: EmailCaptureSource) => {
    return prisma.emailCapture.update({
      where: {
        email_source: { email, source },
      },
      data: {
        doubleOptIn: true,
        verifiedAt: new Date(),
      },
    });
  },

  /**
   * Get unverified emails (for follow-up)
   */
  getUnverified: async (source?: EmailCaptureSource) => {
    return prisma.emailCapture.findMany({
      where: {
        doubleOptIn: false,
        verifiedAt: null,
        ...(source && { source }),
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};

// ============================================================================
// RECEIPT & BONUS CLAIM QUERIES
// ============================================================================

export const receiptQueries = {
  /**
   * Create receipt upload
   */
  create: async (data: {
    userId: string;
    retailer: string;
    orderNumber?: string;
    purchaseDate?: Date;
    format?: string;
    fileUrl: string;
    fileHash: string;
    ipAddress?: string;
    userAgent?: string;
  }) => {
    // Check for duplicate hash
    const existing = await prisma.receipt.findUnique({
      where: { fileHash: data.fileHash },
    });

    if (existing) {
      throw new Error('This receipt has already been uploaded');
    }

    return prisma.receipt.create({
      data: {
        ...data,
        status: 'PENDING',
      },
    });
  },

  /**
   * Create bonus claim from receipt
   */
  createBonusClaim: async (
    receiptId: string,
    userId: string,
    deliveryEmail: string
  ) => {
    return prisma.bonusClaim.create({
      data: {
        receiptId,
        userId,
        deliveryEmail,
        status: 'PENDING',
      },
    });
  },

  /**
   * Approve bonus claim (admin action)
   */
  approveClaim: async (claimId: string, adminId: string) => {
    return prisma.$transaction(async (tx) => {
      const claim = await tx.bonusClaim.findUnique({
        where: { id: claimId },
        include: { receipt: true },
      });

      if (!claim) throw new Error('Claim not found');

      // Update receipt
      await tx.receipt.update({
        where: { id: claim.receiptId },
        data: {
          status: 'VERIFIED',
          verifiedAt: new Date(),
          verifiedBy: adminId,
        },
      });

      // Update claim
      await tx.bonusClaim.update({
        where: { id: claimId },
        data: {
          status: 'APPROVED',
          processedBy: adminId,
          processedAt: new Date(),
        },
      });

      return claim;
    });
  },

  /**
   * Get pending receipts (admin queue)
   */
  getPending: async () => {
    return prisma.receipt.findMany({
      where: { status: 'PENDING' },
      include: {
        user: true,
        bonusClaim: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  },
};

// ============================================================================
// MEDIA REQUEST QUERIES
// ============================================================================

export const mediaQueries = {
  /**
   * Submit media request
   */
  submit: async (data: {
    name: string;
    email: string;
    organization: string;
    title?: string;
    type: string;
    message: string;
    deadline?: Date;
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
  }) => {
    return prisma.mediaRequest.create({
      data: {
        ...data,
        type: data.type as any,
        status: 'NEW',
      },
    });
  },

  /**
   * Get new media requests (admin queue)
   */
  getNew: async () => {
    return prisma.mediaRequest.findMany({
      where: {
        status: { in: ['NEW', 'IN_REVIEW'] },
      },
      orderBy: { createdAt: 'asc' },
    });
  },
};

// ============================================================================
// BULK ORDER QUERIES
// ============================================================================

export const bulkOrderQueries = {
  /**
   * Submit bulk order inquiry
   */
  submit: async (data: {
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    orgName: string;
    quantity: number;
    format: string;
    requestedPrice?: number;
    distributionNotes?: string;
    preferredRetailers?: string;
  }) => {
    return prisma.bulkOrder.create({
      data: {
        ...data,
        status: 'INQUIRY',
      },
    });
  },

  /**
   * Get active bulk order inquiries (admin)
   */
  getActive: async () => {
    return prisma.bulkOrder.findMany({
      where: {
        status: { in: ['INQUIRY', 'QUOTE_SENT', 'NEGOTIATING', 'CONFIRMED'] },
      },
      include: { org: true },
      orderBy: { createdAt: 'desc' },
    });
  },
};

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

export const analyticsQueries = {
  /**
   * Track event
   */
  track: async (data: {
    eventType: AnalyticsEventType;
    eventName: string;
    properties?: Record<string, unknown>;
    sessionId?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
    geo?: string;
  }) => {
    return prisma.analyticsEvent.create({
      data: {
        ...data,
        properties: (data.properties as any) || undefined,
      },
    });
  },

  /**
   * Get event count by type
   */
  getCountByType: async (
    eventType: AnalyticsEventType,
    since?: Date
  ): Promise<number> => {
    return prisma.analyticsEvent.count({
      where: {
        eventType,
        ...(since && { timestamp: { gte: since } }),
      },
    });
  },

  /**
   * Get conversion funnel
   */
  getFunnel: async (since?: Date) => {
    const where = since ? { timestamp: { gte: since } } : {};

    const [
      heroClicks,
      menuOpens,
      preorders,
      leadCaptures,
      bonusClaims,
    ] = await Promise.all([
      prisma.analyticsEvent.count({
        where: { ...where, eventType: 'HERO_CTA_CLICK' },
      }),
      prisma.analyticsEvent.count({
        where: { ...where, eventType: 'RETAILER_MENU_OPEN' },
      }),
      prisma.analyticsEvent.count({
        where: { ...where, eventType: 'PREORDER_CLICK' },
      }),
      prisma.analyticsEvent.count({
        where: { ...where, eventType: 'LEAD_CAPTURE_SUBMIT' },
      }),
      prisma.analyticsEvent.count({
        where: { ...where, eventType: 'BONUS_CLAIM_SUBMIT' },
      }),
    ]);

    return {
      heroClicks,
      menuOpens,
      preorders,
      leadCaptures,
      bonusClaims,
      conversionRate: heroClicks > 0 ? preorders / heroClicks : 0,
    };
  },
};
