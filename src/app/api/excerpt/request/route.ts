/**
 * Excerpt Request API Endpoint
 *
 * Handles requests for free book excerpt delivery.
 * Implements rate limiting, spam protection, and email delivery via Resend.
 *
 * @route POST /api/excerpt/request
 */

import { type NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

import { EmailCaptureSchema, isHoneypotFilled } from '@/lib/validation';
import { generateExcerptToken } from '@/lib/tokens';

// ============================================================================
// Rate Limiting (In-Memory)
// ============================================================================

// TODO: Move rate limiting to Redis for multi-instance support
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Rate limit configuration: 10 requests per hour per IP
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Check if IP has exceeded rate limit
 */
function checkRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Clean up expired entries periodically (1% chance on each request)
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }

  if (!entry) {
    // First request from this IP
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true };
  }

  // Check if rate limit window has expired
  if (now > entry.resetTime) {
    // Reset the counter
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true };
  }

  // Check if limit exceeded
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, resetTime: entry.resetTime };
  }

  // Increment counter
  entry.count += 1;
  return { allowed: true };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  // Try various headers for IP (in order of preference)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, use the first one
    return forwardedFor.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback to a generic identifier
  return 'unknown';
}

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
}) {
  // eslint-disable-next-line no-console
  console.log('[Excerpt Request]', JSON.stringify(data, null, 2));
}

/**
 * Send excerpt email via Resend
 * TODO: Implement actual Resend integration
 */
async function sendExcerptEmail(email: string, name?: string): Promise<void> {
  // Check if Resend is configured
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
     
    console.warn('[Excerpt Request] RESEND_API_KEY not configured - skipping email send');
    return;
  }

  try {
    // TODO: Replace with actual Resend SDK integration
    // For now, just log what would be sent
    // eslint-disable-next-line no-console
    console.log('[Excerpt Request] Would send email to:', email);
    // eslint-disable-next-line no-console
    console.log('[Excerpt Request] Recipient name:', name || 'Not provided');
    // eslint-disable-next-line no-console
    console.log('[Excerpt Request] Email content: AI-Born Excerpt PDF');

    // Example Resend implementation (commented out until installed):
    /*
    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);

    await resend.emails.send({
      from: 'AI-Born <excerpt@ai-born.org>',
      to: email,
      subject: 'Your Free Chapter from AI-Born',
      html: `
        <h1>Thank you for your interest in AI-Born!</h1>
        <p>Hi ${name || 'there'},</p>
        <p>Here's your free chapter from <strong>AI-Born: The Machine Core, the Human Cortex, and the Next Economy of Being</strong>.</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/assets/ai-born-excerpt.pdf">Download Your Free Chapter</a></p>
        <p>We'll also keep you updated on the book launch and related insights.</p>
        <p>Best regards,<br/>The AI-Born Team</p>
      `,
      attachments: [
        {
          filename: 'ai-born-excerpt.pdf',
          path: `${process.env.NEXT_PUBLIC_SITE_URL}/assets/ai-born-excerpt.pdf`,
        },
      ],
    });
    */
  } catch (error) {
     
    console.error('[Excerpt Request] Error sending email:', error);
    throw new Error('Failed to send excerpt email');
  }
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
          message: 'Thank you! Check your email for the excerpt.',
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

    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      const resetTime = rateLimit.resetTime || Date.now() + RATE_LIMIT_WINDOW_MS;
      const resetDate = new Date(resetTime);

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
          message: `Rate limit exceeded. Please try again after ${resetDate.toLocaleTimeString()}.`,
          errors: {
            _form: [`Too many requests. Limit: ${RATE_LIMIT_MAX_REQUESTS} per hour.`],
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Send excerpt email
    try {
      await sendExcerptEmail(validatedData.email, validatedData.name);
    } catch (error) {
      logRequest({
        ip: clientIP,
        email: validatedData.email,
        name: validatedData.name,
        source: validatedData.source,
        timestamp,
        success: false,
        error: 'Email send failed',
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send excerpt. Please try again later.',
          errors: {
            _form: ['Email delivery service error'],
          },
        },
        { status: 500 }
      );
    }

    // Generate secure download token (valid for 7 days)
    const downloadToken = generateExcerptToken(
      validatedData.email,
      validatedData.name,
      validatedData.source
    );

    // Construct secure download URL with token
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-born.org';
    const downloadUrl = `${siteUrl}/api/excerpt/download?token=${downloadToken}`;

    // Log successful request
    logRequest({
      ip: clientIP,
      email: validatedData.email,
      name: validatedData.name,
      source: validatedData.source,
      timestamp,
      success: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! Check your email for the excerpt.',
        downloadUrl,
      },
      { status: 200 }
    );

  } catch (err) {
    // Log server error

    console.error('[Excerpt Request Error]', err);

    logRequest({
      ip: clientIP,
      email: 'unknown',
      timestamp,
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
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
