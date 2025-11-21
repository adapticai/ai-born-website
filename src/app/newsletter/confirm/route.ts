/**
 * Newsletter Confirmation Route
 *
 * GET /newsletter/confirm?token=...
 *
 * Verifies confirmation token and activates newsletter subscription.
 * Redirects to thank you page on success.
 *
 * @see CLAUDE.md Section 11: Email Capture + Social
 */

import { type NextRequest, NextResponse } from 'next/server';
import { verifyNewsletterToken } from '@/lib/tokens';
import { NewsletterStore } from '@/types/newsletter';
import { sendNewsletterWelcomeEmail } from '@/lib/email';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-born.org';

/**
 * Handle newsletter confirmation
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  // Validate token presence
  if (!token) {
    console.error('[Newsletter Confirm] Missing token');
    return NextResponse.redirect(
      `${SITE_URL}/?newsletter_error=missing_token`,
      { status: 302 }
    );
  }

  try {
    // Verify token
    const verification = verifyNewsletterToken(token);

    if (!verification.valid) {
      console.error('[Newsletter Confirm] Invalid token:', verification.error);

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
        `${SITE_URL}/?newsletter_error=${errorParam}`,
        { status: 302 }
      );
    }

    const { payload } = verification;

    if (!payload || payload.type !== 'confirmation') {
      console.error('[Newsletter Confirm] Invalid token type');
      return NextResponse.redirect(
        `${SITE_URL}/?newsletter_error=invalid_type`,
        { status: 302 }
      );
    }

    // Find subscriber by email
    const subscriber = NewsletterStore.findByEmail(payload.email);

    if (!subscriber) {
      console.error('[Newsletter Confirm] Subscriber not found:', payload.email);
      return NextResponse.redirect(
        `${SITE_URL}/?newsletter_error=not_found`,
        { status: 302 }
      );
    }

    // Check if already confirmed
    if (subscriber.status === 'confirmed') {
      console.log(
        '[Newsletter Confirm] Already confirmed:',
        subscriber.email
      );
      return NextResponse.redirect(
        `${SITE_URL}/?newsletter_success=already_confirmed`,
        { status: 302 }
      );
    }

    // Confirm subscription
    subscriber.status = 'confirmed';
    subscriber.confirmedAt = new Date();
    subscriber.updatedAt = new Date();

    // Update subscriber in store
    NewsletterStore.upsert(subscriber);

    console.log('[Newsletter Confirm] Confirmed:', {
      email: subscriber.email,
      source: subscriber.source,
      interests: subscriber.interests,
      confirmedAt: subscriber.confirmedAt,
    });

    // Send welcome email (fire and forget - don't block redirect)
    sendNewsletterWelcomeEmail(subscriber.email, subscriber.name).catch(
      (error) => {
        console.error('[Newsletter Confirm] Welcome email failed:', error);
      }
    );

    // Redirect to thank you page with success message
    return NextResponse.redirect(
      `${SITE_URL}/?newsletter_success=confirmed&email=${encodeURIComponent(subscriber.email)}`,
      { status: 302 }
    );
  } catch (error) {
    console.error('[Newsletter Confirm] Error:', error);
    return NextResponse.redirect(
      `${SITE_URL}/?newsletter_error=server_error`,
      { status: 302 }
    );
  }
}
