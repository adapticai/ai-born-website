/**
 * API Route: Check Excerpt Entitlement
 *
 * Checks if the authenticated user has access to the excerpt
 * and returns the download URL if available.
 *
 * @route GET /api/excerpt/check-entitlement
 */

import { getCurrentUser, hasEntitlement } from "@/lib/auth";
import {
  withErrorHandler,
  AuthenticationError,
  createSuccessResponse,
} from "@/lib/api-error-handler";
import { logger } from "@/lib/logger";
import { generateRequestId } from "@/lib/logger";

/**
 * GET /api/excerpt/check-entitlement
 *
 * Check if the current user has excerpt entitlement
 *
 * @returns JSON response with entitlement status and download URL
 */
export const GET = withErrorHandler(async () => {
  const requestId = generateRequestId();

  // Get current authenticated user
  const user = await getCurrentUser();

  if (!user) {
    logger.warn({ requestId }, 'Excerpt entitlement check without authentication');
    throw new AuthenticationError("Please sign in to check excerpt access");
  }

  logger.info({
    requestId,
    userId: user.id,
  }, 'Checking excerpt entitlement');

  // Check if user has excerpt entitlement
  const hasExcerptAccess = await hasEntitlement("excerpt");

  if (!hasExcerptAccess) {
    logger.info({
      requestId,
      userId: user.id,
    }, 'User does not have excerpt entitlement');

    return createSuccessResponse({
      hasEntitlement: false,
      message: "No excerpt entitlement found",
    });
  }

  // User has entitlement - generate download URL
  // In production, this would be a signed URL to the excerpt PDF
  const downloadUrl = `/api/excerpt/download?userId=${user.id}`;

  logger.info({
    requestId,
    userId: user.id,
  }, 'Excerpt access granted');

  return createSuccessResponse({
    hasEntitlement: true,
    downloadUrl,
    message: "Excerpt access granted",
  });
});
