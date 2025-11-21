/**
 * Excerpt Download API Endpoint
 *
 * Serves the excerpt PDF file with secure token verification.
 * Prevents unauthorized downloads and tracks analytics.
 *
 * @route GET /api/excerpt/download?token=<jwt>
 */

import { type NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

import { verifyExcerptToken, extractToken } from '@/lib/tokens';
import type { ExcerptTokenPayload } from '@/lib/tokens';

// ============================================================================
// Configuration
// ============================================================================

const PDF_PATH = path.join(process.cwd(), 'public', 'assets', 'ai-born-excerpt.pdf');
const PDF_FILENAME = 'ai-born-excerpt.pdf';
const PDF_CONTENT_TYPE = 'application/pdf';

// ============================================================================
// Analytics & Logging
// ============================================================================

/**
 * Log download event for analytics
 */
function logDownload(data: {
  email: string;
  name?: string;
  source?: string;
  ip: string;
  timestamp: string;
  success: boolean;
  error?: string;
}) {
  // eslint-disable-next-line no-console
  console.log('[Excerpt Download]', JSON.stringify(data, null, 2));

  // TODO: Send to analytics service (GA4, Plausible, etc.)
  // trackEvent('excerpt_download', {
  //   email: hashEmail(data.email), // Hash for privacy
  //   source: data.source,
  //   timestamp: data.timestamp,
  // });
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return 'unknown';
}

// ============================================================================
// File Serving
// ============================================================================

/**
 * Check if PDF file exists
 */
async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Stream PDF file to response
 */
async function streamPDF(filePath: string): Promise<Response> {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const fileStats = await fs.stat(filePath);

    return new NextResponse(fileBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': PDF_CONTENT_TYPE,
        'Content-Length': fileStats.size.toString(),
        'Content-Disposition': `attachment; filename="${PDF_FILENAME}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        // Security headers
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
      },
    });
  } catch (error) {
    console.error('[Excerpt Download] Error reading PDF file:', error);
    throw new Error('Failed to read PDF file');
  }
}

// ============================================================================
// API Route Handler
// ============================================================================

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const clientIP = getClientIP(request);

  try {
    // Extract token from query parameter or Authorization header
    const queryToken = request.nextUrl.searchParams.get('token');
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader, queryToken);

    if (!token) {
      logDownload({
        email: 'unknown',
        ip: clientIP,
        timestamp,
        success: false,
        error: 'No token provided',
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Download token is required',
          errors: { token: ['Missing or invalid download token'] },
        },
        { status: 401 }
      );
    }

    // Verify token
    const verification = verifyExcerptToken(token);

    if (!verification.valid) {
      let errorMessage = 'Invalid download token';
      let errorDetail = 'The download token is invalid or malformed';

      if (verification.error === 'expired') {
        errorMessage = 'Download token has expired';
        errorDetail = 'This download link has expired. Please request a new excerpt.';
      } else if (verification.error === 'missing_secret') {
        errorMessage = 'Server configuration error';
        errorDetail = 'Token verification is not properly configured';

        // Log configuration error
        console.error('[Excerpt Download] TOKEN_SECRET not configured');
      }

      logDownload({
        email: verification.payload?.email || 'unknown',
        name: verification.payload?.name,
        source: verification.payload?.source,
        ip: clientIP,
        timestamp,
        success: false,
        error: `Token verification failed: ${verification.error}`,
      });

      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          errors: { token: [errorDetail] },
        },
        { status: 401 }
      );
    }

    // Token is valid, extract payload
    const payload: ExcerptTokenPayload = verification.payload!;

    // Check if PDF file exists
    const fileExists = await checkFileExists(PDF_PATH);

    if (!fileExists) {
      console.error('[Excerpt Download] PDF file not found at:', PDF_PATH);

      logDownload({
        email: payload.email,
        name: payload.name,
        source: payload.source,
        ip: clientIP,
        timestamp,
        success: false,
        error: 'PDF file not found',
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Excerpt PDF is currently unavailable',
          errors: { _form: ['The requested file could not be found'] },
        },
        { status: 404 }
      );
    }

    // Log successful download
    logDownload({
      email: payload.email,
      name: payload.name,
      source: payload.source,
      ip: clientIP,
      timestamp,
      success: true,
    });

    // Stream PDF file to client
    return await streamPDF(PDF_PATH);

  } catch (error) {
    // Log server error
    console.error('[Excerpt Download Error]', error);

    logDownload({
      email: 'unknown',
      ip: clientIP,
      timestamp,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred while downloading the excerpt',
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
    : (process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-born.org');

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
