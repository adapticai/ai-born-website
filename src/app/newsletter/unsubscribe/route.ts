/**
 * Newsletter Unsubscribe Route
 *
 * GET /newsletter/unsubscribe?token=...
 *
 * Unsubscribes user from newsletter.
 * CAN-SPAM & GDPR compliant one-click unsubscribe.
 * Redirects to confirmation page.
 *
 * @see CLAUDE.md Section 11: Email Capture + Social
 */

import { type NextRequest, NextResponse } from 'next/server';
import { verifyNewsletterToken } from '@/lib/tokens';
import { NewsletterStore } from '@/types/newsletter';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-born.org';

/**
 * Handle newsletter unsubscribe
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  // Validate token presence
  if (!token) {
    console.error('[Newsletter Unsubscribe] Missing token');
    return NextResponse.redirect(
      `${SITE_URL}/?unsubscribe_error=missing_token`,
      { status: 302 }
    );
  }

  try {
    // Verify token
    const verification = verifyNewsletterToken(token);

    if (!verification.valid) {
      console.error(
        '[Newsletter Unsubscribe] Invalid token:',
        verification.error
      );

      const errorMessages: Record<string, string> = {
        expired: 'expired',
        invalid: 'invalid',
        malformed: 'invalid',
        missing_secret: 'config_error',
      };

      const errorParam = verification.error
        ? errorMessages[verification.error] || 'invalid'
        : 'invalid';

      return NextResponse.redirect(
        `${SITE_URL}/?unsubscribe_error=${errorParam}`,
        { status: 302 }
      );
    }

    const { payload } = verification;

    if (!payload || payload.type !== 'unsubscribe') {
      console.error('[Newsletter Unsubscribe] Invalid token type');
      return NextResponse.redirect(
        `${SITE_URL}/?unsubscribe_error=invalid_type`,
        { status: 302 }
      );
    }

    // Find subscriber by email
    const subscriber = NewsletterStore.findByEmail(payload.email);

    if (!subscriber) {
      console.error(
        '[Newsletter Unsubscribe] Subscriber not found:',
        payload.email
      );
      // Don't reveal whether email exists (privacy/security)
      return NextResponse.redirect(
        `${SITE_URL}/?unsubscribe_success=true`,
        { status: 302 }
      );
    }

    // Check if already unsubscribed
    if (subscriber.status === 'unsubscribed') {
      console.log(
        '[Newsletter Unsubscribe] Already unsubscribed:',
        subscriber.email
      );
      return NextResponse.redirect(
        `${SITE_URL}/?unsubscribe_success=already_unsubscribed`,
        { status: 302 }
      );
    }

    // Unsubscribe
    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = new Date();
    subscriber.updatedAt = new Date();

    // Update subscriber in store
    NewsletterStore.upsert(subscriber);

    console.log('[Newsletter Unsubscribe] Unsubscribed:', {
      email: subscriber.email,
      unsubscribedAt: subscriber.unsubscribedAt,
      previousStatus: subscriber.status,
    });

    // Redirect to confirmation page
    return NextResponse.redirect(
      `${SITE_URL}/?unsubscribe_success=true&email=${encodeURIComponent(subscriber.email)}`,
      { status: 302 }
    );
  } catch (error) {
    console.error('[Newsletter Unsubscribe] Error:', error);
    return NextResponse.redirect(
      `${SITE_URL}/?unsubscribe_error=server_error`,
      { status: 302 }
    );
  }
}

/**
 * Handle POST unsubscribe (for form submissions)
 * Allows unsubscribe via email address without token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email?.toLowerCase().trim();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please provide a valid email address',
        },
        { status: 400 }
      );
    }

    const subscriber = NewsletterStore.findByEmail(email);

    if (!subscriber) {
      // Don't reveal whether email exists
      return NextResponse.json(
        {
          success: true,
          message:
            "If you're subscribed, you've been removed from our newsletter.",
        },
        { status: 200 }
      );
    }

    if (subscriber.status === 'unsubscribed') {
      return NextResponse.json(
        {
          success: true,
          message: "You're already unsubscribed.",
        },
        { status: 200 }
      );
    }

    // Unsubscribe
    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = new Date();
    subscriber.updatedAt = new Date();
    NewsletterStore.upsert(subscriber);

    console.log('[Newsletter Unsubscribe POST] Unsubscribed:', email);

    return NextResponse.json(
      {
        success: true,
        message: "You've been successfully unsubscribed from our newsletter.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Newsletter Unsubscribe POST] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * CORS configuration
 */
export async function OPTIONS() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const allowedOrigin = isDevelopment
    ? '*'
    : process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-born.org';

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
