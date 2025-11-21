/**
 * Email Capture API Endpoint
 *
 * Captures email addresses for the free excerpt download and mailing list.
 * Implements rate limiting, spam protection, and validation.
 *
 * @route POST /api/email-capture
 */

import { type NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

import { EmailCaptureSchema, isHoneypotFilled } from '@/lib/validation';
import {
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
  emailCaptureRateLimiter,
  EMAIL_CAPTURE_RATE_LIMIT,
} from '@/lib/ratelimit';
import { sendExcerptEmail } from '@/lib/email';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Log request for debugging
 */
function logRequest(data: {
  ip: string;
  email: string;
  name?: string;
  source?: string;
  timestamp: string;
  success: boolean;
  error?: string;
}) {
  // eslint-disable-next-line no-console
  console.log('[Email Capture]', JSON.stringify(data, null, 2));
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

      // Return success to fool bots
      return NextResponse.json(
        {
          success: true,
          message: 'Thank you for subscribing! Check your email for the excerpt.',
          downloadUrl: '/assets/ai-born-excerpt.pdf',
        },
        { status: 200 }
      );
    }

    // Validate input
    let validatedData;
    try {
      validatedData = EmailCaptureSchema.parse(body);
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

    // Check rate limit (Upstash Redis with in-memory fallback)
    const rateLimit = await checkRateLimit(
      clientIP,
      emailCaptureRateLimiter,
      EMAIL_CAPTURE_RATE_LIMIT
    );

    if (!rateLimit.success) {
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
          message: `Rate limit exceeded. Please try again in ${rateLimit.reset} seconds.`,
          errors: {
            _form: [
              `Too many requests. Limit: ${rateLimit.limit} per hour.`,
            ],
          },
        },
        {
          status: 429,
          headers: {
            ...getRateLimitHeaders(rateLimit),
          },
        }
      );
    }

    // Send excerpt email via Resend
    const emailResult = await sendExcerptEmail(validatedData.email);

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
            'Failed to send excerpt email. Please try again or contact support.',
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
    });

    // TODO: Add to mailing list service (Mailchimp/ConvertKit)
    console.log('[Email Capture] New subscriber:', {
      email: validatedData.email,
      name: validatedData.name || 'Not provided',
      source: validatedData.source || 'Direct',
      messageId: emailResult.messageId,
    });

    const downloadUrl = '/assets/ai-born-excerpt.pdf';

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for subscribing! Check your email for the excerpt.',
        downloadUrl,
      },
      {
        status: 200,
        headers: getRateLimitHeaders(rateLimit),
      }
    );

  } catch (error) {
    // Log server error
     
    console.error('[Email Capture Error]', error);

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
  // For development: Allow all origins
  // For production: Restrict to production domain
  const isDevelopment = process.env.NODE_ENV === 'development';
  const allowedOrigin = isDevelopment
    ? '*'
    : (process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-born.org');

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
