/**
 * Magic Link API Endpoint
 * Example implementation for passwordless authentication
 *
 * @route POST /api/send-magic-link
 */

import { type NextRequest } from 'next/server';
import crypto from 'crypto';

import { sendMagicLinkEmail } from '@/lib/email';
import {
  checkRateLimit,
  getClientIP,
  EMAIL_CAPTURE_RATE_LIMIT,
} from '@/lib/rate-limit';
import {
  withErrorHandler,
  RateLimitError,
  ValidationError,
  validateEmail,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import { generateRequestId } from '@/lib/logger';

interface RequestBody {
  email: string;
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  const requestId = generateRequestId();

  // Get client IP for rate limiting
  const clientIP = getClientIP(request);

  // Check rate limit
  const rateLimit = checkRateLimit(clientIP, EMAIL_CAPTURE_RATE_LIMIT);
  if (!rateLimit.allowed) {
    logger.warn({
      requestId,
      clientIP,
      resetIn: rateLimit.resetIn,
    }, 'Magic link rate limit exceeded');

    throw new RateLimitError(
      `Too many requests. Please try again in ${rateLimit.resetIn} seconds.`
    );
  }

  // Parse request body
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError('Invalid request body', { error: 'INVALID_JSON' });
  }

  const { email } = body;

  // Validate email
  if (!email) {
    throw new ValidationError('Email address is required');
  }

  validateEmail(email);

  // Generate secure token
  const token = crypto.randomBytes(32).toString('base64url');

  // TODO: Store token in database with expiration (15 minutes)
  // Example:
  // await db.magicLinks.create({
  //   email,
  //   token,
  //   expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  // });

  logger.info({
    requestId,
    email,
  }, 'Magic link token generated');

  // Send magic link email
  const emailResult = await sendMagicLinkEmail(email, token);

  if (!emailResult.success) {
    logger.error({
      requestId,
      email,
      err: emailResult.error,
    }, 'Failed to send magic link email');

    throw new Error('Failed to send magic link. Please try again.');
  }

  logger.info({
    requestId,
    email,
    messageId: emailResult.messageId,
  }, 'Magic link email sent successfully');

  // Return success (don't reveal if email exists in system)
  return createSuccessResponse(
    {
      message: 'If an account exists with that email, a magic link has been sent.',
    },
    { status: 200 }
  );
});
