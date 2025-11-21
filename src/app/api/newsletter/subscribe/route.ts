/**
 * Newsletter Subscription API Endpoint
 *
 * POST /api/newsletter/subscribe
 *
 * Features:
 * - Double opt-in flow (email confirmation required)
 * - GDPR/CCPA compliant
 * - Rate limiting (10 requests/hour per IP)
 * - Spam protection (honeypot field)
 * - Interest-based segmentation
 * - Source tracking for attribution
 *
 * @see CLAUDE.md Section 11: Email Capture + Social
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';

import { NewsletterSubscribeSchema, isHoneypotFilled } from '@/lib/validation';
import {
  checkRateLimit,
  getClientIP,
  EMAIL_CAPTURE_RATE_LIMIT,
} from '@/lib/rate-limit';
import { sendNewsletterConfirmationEmail } from '@/lib/email';
import {
  generateNewsletterConfirmationToken,
  generateNewsletterUnsubscribeToken,
} from '@/lib/tokens';
import { NewsletterStore, type NewsletterSubscriber } from '@/types/newsletter';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Log request for debugging and monitoring
 */
function logRequest(data: {
  ip: string;
  email: string;
  name?: string;
  source?: string;
  timestamp: string;
  success: boolean;
  error?: string;
  action?: string;
}) {
  console.log('[Newsletter Subscribe]', JSON.stringify(data, null, 2));
}

/**
 * Generate unique subscription ID
 */
function generateSubscriptionId(): string {
  return `sub_${crypto.randomBytes(16).toString('hex')}`;
}

// ============================================================================
// API Route Handler
// ============================================================================

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  let clientIP = 'unknown';

  try {
    // Get client IP
    clientIP = getClientIP(request);

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      logRequest({
        ip: clientIP,
        email: '',
        timestamp,
        success: false,
        error: 'Invalid JSON',
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request body',
          errors: { _form: ['Invalid JSON format'] },
        },
        { status: 400 }
      );
    }

    // Check honeypot field (spam protection)
    if (isHoneypotFilled(body)) {
      // Silently accept but don't process (anti-spam)
      logRequest({
        ip: clientIP,
        email: body.email || 'unknown',
        name: body.name,
        source: body.source,
        timestamp,
        success: false,
        error: 'Honeypot triggered',
      });

      // Return fake success to fool bots
      return NextResponse.json(
        {
          success: true,
          message:
            'Thank you for subscribing! Please check your email to confirm your subscription.',
          subscriptionId: 'fake_' + crypto.randomBytes(8).toString('hex'),
        },
        { status: 200 }
      );
    }

    // Validate input
    let validatedData;
    try {
      validatedData = NewsletterSubscribeSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(issue.message);
        });

        logRequest({
          ip: clientIP,
          email: body.email || '',
          timestamp,
          success: false,
          error: 'Validation failed',
        });

        return NextResponse.json(
          {
            success: false,
            message: 'Please correct the errors below',
            errors,
          },
          { status: 400 }
        );
      }

      throw error;
    }

    // Check rate limit
    const rateLimit = checkRateLimit(clientIP, EMAIL_CAPTURE_RATE_LIMIT);
    if (!rateLimit.allowed) {
      logRequest({
        ip: clientIP,
        email: validatedData.email,
        name: validatedData.name,
        source: validatedData.source,
        timestamp,
        success: false,
        error: 'Rate limit exceeded',
      });

      return NextResponse.json(
        {
          success: false,
          message: `Rate limit exceeded. Please try again in ${rateLimit.resetIn} seconds.`,
          errors: {
            _form: [
              `Too many requests. Limit: ${EMAIL_CAPTURE_RATE_LIMIT.maxRequests} per hour.`,
            ],
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.resetIn.toString(),
          },
        }
      );
    }

    // Check if email already exists
    const existingSubscriber = NewsletterStore.findByEmail(validatedData.email);

    if (existingSubscriber) {
      // Handle re-subscription based on current status
      if (existingSubscriber.status === 'confirmed') {
        // Already confirmed - update interests if provided
        if (validatedData.interests && validatedData.interests.length > 0) {
          existingSubscriber.interests = [
            ...new Set([
              ...existingSubscriber.interests,
              ...validatedData.interests,
            ]),
          ];
          existingSubscriber.updatedAt = new Date();
          NewsletterStore.upsert(existingSubscriber);

          logRequest({
            ip: clientIP,
            email: validatedData.email,
            name: validatedData.name,
            source: validatedData.source,
            timestamp,
            success: true,
            action: 'Updated interests for existing subscriber',
          });
        }

        return NextResponse.json(
          {
            success: true,
            message:
              "You're already subscribed! We've updated your preferences.",
            subscriptionId: existingSubscriber.id,
          },
          { status: 200 }
        );
      }

      if (existingSubscriber.status === 'pending') {
        // Resend confirmation email
        const emailResult = await sendNewsletterConfirmationEmail(
          validatedData.email,
          existingSubscriber.confirmationToken!
        );

        if (!emailResult.success) {
          logRequest({
            ip: clientIP,
            email: validatedData.email,
            timestamp,
            success: false,
            error: `Resend confirmation email failed: ${emailResult.error}`,
          });

          return NextResponse.json(
            {
              success: false,
              message:
                'Failed to send confirmation email. Please try again or contact support.',
              errors: {
                _form: ['Email delivery failed. Please try again later.'],
              },
            },
            { status: 500 }
          );
        }

        logRequest({
          ip: clientIP,
          email: validatedData.email,
          timestamp,
          success: true,
          action: 'Resent confirmation email',
        });

        return NextResponse.json(
          {
            success: true,
            message:
              "We've resent your confirmation email. Please check your inbox.",
            subscriptionId: existingSubscriber.id,
          },
          { status: 200 }
        );
      }

      if (existingSubscriber.status === 'unsubscribed') {
        // Re-subscribe with new confirmation
        existingSubscriber.status = 'pending';
        existingSubscriber.confirmationToken = generateNewsletterConfirmationToken(
          validatedData.email
        );
        existingSubscriber.unsubscribeToken = generateNewsletterUnsubscribeToken(
          validatedData.email
        );
        existingSubscriber.source = validatedData.source || 'other';
        existingSubscriber.interests = validatedData.interests || [];
        existingSubscriber.updatedAt = new Date();
        existingSubscriber.unsubscribedAt = undefined;

        NewsletterStore.upsert(existingSubscriber);

        const emailResult = await sendNewsletterConfirmationEmail(
          validatedData.email,
          existingSubscriber.confirmationToken
        );

        if (!emailResult.success) {
          return NextResponse.json(
            {
              success: false,
              message: 'Failed to send confirmation email.',
              errors: { _form: ['Email delivery failed.'] },
            },
            { status: 500 }
          );
        }

        logRequest({
          ip: clientIP,
          email: validatedData.email,
          timestamp,
          success: true,
          action: 'Re-subscribed previously unsubscribed user',
        });

        return NextResponse.json(
          {
            success: true,
            message:
              'Welcome back! Please check your email to confirm your subscription.',
            subscriptionId: existingSubscriber.id,
          },
          { status: 200 }
        );
      }
    }

    // Create new subscriber
    const subscriptionId = generateSubscriptionId();
    const confirmationToken = generateNewsletterConfirmationToken(
      validatedData.email
    );
    const unsubscribeToken = generateNewsletterUnsubscribeToken(
      validatedData.email
    );

    const newSubscriber: NewsletterSubscriber = {
      id: subscriptionId,
      email: validatedData.email,
      name: validatedData.name || undefined,
      source: validatedData.source || 'other',
      interests: validatedData.interests || [],
      status: 'pending',
      confirmationToken,
      unsubscribeToken,
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent') || undefined,
    };

    // Store subscriber
    NewsletterStore.upsert(newSubscriber);

    // Send confirmation email via Resend
    const emailResult = await sendNewsletterConfirmationEmail(
      validatedData.email,
      confirmationToken
    );

    if (!emailResult.success) {
      logRequest({
        ip: clientIP,
        email: validatedData.email,
        name: validatedData.name,
        source: validatedData.source,
        timestamp,
        success: false,
        error: `Email send failed: ${emailResult.error}`,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            'Failed to send confirmation email. Please try again or contact support.',
          errors: {
            _form: ['Email delivery failed. Please try again later.'],
          },
        },
        { status: 500 }
      );
    }

    // Log success
    logRequest({
      ip: clientIP,
      email: validatedData.email,
      name: validatedData.name,
      source: validatedData.source,
      timestamp,
      success: true,
      action: 'New subscription created',
    });

    // Return success
    return NextResponse.json(
      {
        success: true,
        message:
          'Thank you for subscribing! Please check your email to confirm your subscription.',
        subscriptionId,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log server error
    console.error('[Newsletter Subscribe Error]', error);

    logRequest({
      ip: clientIP,
      email: 'unknown',
      timestamp,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
        errors: {
          _form: ['Internal server error'],
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// CORS Configuration
// ============================================================================

export async function OPTIONS() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const allowedOrigin = isDevelopment
    ? '*'
    : process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-born.org';

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
