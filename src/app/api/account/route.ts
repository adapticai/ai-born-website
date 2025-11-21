/**
 * Account API Route
 * Fetches user profile, entitlements, receipts, and bonus claims
 */

import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  AuthenticationError,
  NotFoundError,
  createSuccessResponse,
} from "@/lib/api-error-handler";
import { logger } from "@/lib/logger";
import { generateRequestId } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/account
 * Fetch user account data including entitlements and receipts
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const requestId = generateRequestId();

  // Require authentication
  const user = await getCurrentUser();

  if (!user || !user.email) {
    logger.warn({ requestId }, 'Unauthorized account access attempt');
    throw new AuthenticationError("Please sign in to view your account");
  }

  logger.info({
    requestId,
    userId: user.id,
    email: user.email,
  }, 'Fetching account data');

  // Fetch user data from database
  const userData = await prisma.user.findUnique({
      where: { email: user.email },
      include: {
        entitlements: {
          orderBy: { createdAt: "desc" },
          include: {
            code: {
              select: {
                code: true,
                type: true,
                description: true,
              },
            },
          },
        },
        receipts: {
          orderBy: { createdAt: "desc" },
          take: 10, // Limit to last 10 receipts
        },
        bonusClaims: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            receipt: {
              select: {
                retailer: true,
                format: true,
                purchaseDate: true,
              },
            },
          },
        },
        orgMemberships: {
          where: { status: "ACTIVE" },
          include: {
            org: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

  if (!userData) {
    logger.warn({ requestId, email: user.email }, 'User not found in database');
    throw new NotFoundError("User not found in database");
  }

    // Calculate entitlement flags
    const hasExcerpt = userData.entitlements.some(
      (e) =>
        (e.type === "EARLY_EXCERPT" || e.type === "BONUS_PACK") &&
        e.status === "ACTIVE"
    );

    const hasAgentCharterPack = userData.entitlements.some(
      (e) =>
        (e.type === "BONUS_PACK" || e.type === "ENHANCED_BONUS") &&
        e.status === "ACTIVE"
    );

    const hasPreordered = userData.receipts.some(
      (r) => r.status === "VERIFIED"
    );

    // Calculate available downloads
    const availableDownloads = [];

    if (hasExcerpt) {
      availableDownloads.push({
        id: "excerpt",
        title: "Free Excerpt",
        description: "Sample chapter from AI-Born",
        type: "pdf",
        url: "/api/bonus/download/excerpt",
      });
    }

    if (hasAgentCharterPack) {
      availableDownloads.push({
        id: "agent-charter-pack",
        title: "Agent Charter Pack",
        description:
          "VP-agent templates, sub-agent ladders, and escalation protocols",
        type: "zip",
        url: "/api/bonus/download/agent-charter-pack",
      });

      availableDownloads.push({
        id: "coi-diagnostic",
        title: "Cognitive Overhead Index Diagnostic",
        description: "Mini-tool for measuring institutional drag",
        type: "spreadsheet",
        url: "/api/bonus/download/coi-diagnostic",
      });
    }

    // Format response
    const accountData = {
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        emailVerified: userData.emailVerified,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      status: {
        hasExcerpt,
        hasAgentCharterPack,
        hasPreordered,
        entitlementCount: userData.entitlements.filter(
          (e) => e.status === "ACTIVE"
        ).length,
        receiptCount: userData.receipts.length,
        bonusClaimCount: userData.bonusClaims.length,
      },
      entitlements: userData.entitlements.map((e) => ({
        id: e.id,
        type: e.type,
        status: e.status,
        fulfilledAt: e.fulfilledAt,
        expiresAt: e.expiresAt,
        code: e.code
          ? {
              code: e.code.code,
              type: e.code.type,
              description: e.code.description,
            }
          : null,
        createdAt: e.createdAt,
      })),
      receipts: userData.receipts.map((r) => ({
        id: r.id,
        retailer: r.retailer,
        orderNumber: r.orderNumber,
        format: r.format,
        purchaseDate: r.purchaseDate,
        status: r.status,
        verifiedAt: r.verifiedAt,
        rejectionReason: r.rejectionReason,
        createdAt: r.createdAt,
      })),
      bonusClaims: userData.bonusClaims.map((b) => ({
        id: b.id,
        status: b.status,
        deliveryEmail: b.deliveryEmail,
        deliveredAt: b.deliveredAt,
        createdAt: b.createdAt,
        receipt: b.receipt,
      })),
      organizations: userData.orgMemberships.map((m) => ({
        id: m.org.id,
        name: m.org.name,
        type: m.org.type,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
    downloads: availableDownloads,
  };

  logger.info({
    requestId,
    userId: userData.id,
    entitlementCount: accountData.status.entitlementCount,
    receiptCount: accountData.status.receiptCount,
  }, 'Account data fetched successfully');

  return createSuccessResponse(accountData);
});
