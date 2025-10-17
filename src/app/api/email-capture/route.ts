/**
 * Email Capture API Endpoint
 *
 * Captures email addresses for the free excerpt download and mailing list.
 * Implements rate limiting, spam protection, and validation.
 *
 * @route POST /api/email-capture
 */

import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

import { EmailCaptureSchema, isHoneypotFilled } from '@/lib/validation';

// ============================================================================
// Rate Limiting (In-Memory)
// ============================================================================

// TODO: Move rate limiting to Redis for multi-instance support
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Rate limit configuration
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Check if IP has exceeded rate limit
 */
function checkRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Clean up expired entries periodically
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

    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetTime!);

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
            'Retry-After': Math.ceil((rateLimit.resetTime! - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // TODO: Integrate SendGrid/Postmark/Resend for email delivery
    // For MVP: Log to console and return download URL

    // TODO: Add to mailing list service (Mailchimp/ConvertKit)
    // For MVP: Log subscriber info

    logRequest({
      ip: clientIP,
      email: validatedData.email,
      name: validatedData.name,
      source: validatedData.source,
      timestamp,
      success: true,
    });

    // MVP: Return success with download URL
    // In production, this would trigger an email with the PDF link
    const downloadUrl = '/assets/ai-born-excerpt.pdf';

    // eslint-disable-next-line no-console
    console.log('--- NEW EMAIL CAPTURE ---');
    // eslint-disable-next-line no-console
    console.log('Email:', validatedData.email);
    // eslint-disable-next-line no-console
    console.log('Name:', validatedData.name || 'Not provided');
    // eslint-disable-next-line no-console
    console.log('Source:', validatedData.source || 'Direct');
    // eslint-disable-next-line no-console
    console.log('Download URL:', downloadUrl);
    // eslint-disable-next-line no-console
    console.log('TODO: Send email with excerpt PDF');
    // eslint-disable-next-line no-console
    console.log('TODO: Add to mailing list');
    // eslint-disable-next-line no-console
    console.log('------------------------');

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for subscribing! Check your email for the excerpt.',
        downloadUrl,
      },
      { status: 200 }
    );

  } catch (error) {
    // Log server error
    // eslint-disable-next-line no-console
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
