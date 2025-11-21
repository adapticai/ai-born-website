/**
 * Bonus Pack Download API Endpoint
 * Secure file downloads with signed token verification
 *
 * Route: /api/bonus/download/[asset]?token=xxx
 * Method: GET
 *
 * Security:
 * - Token-based authentication (24-hour expiration)
 * - Asset-specific permissions
 * - Rate limiting per user
 * - Download tracking for analytics
 * - No public access without valid token
 */

import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyBonusPackToken,
  extractBonusToken,
  getBonusPackAssetMetadata,
  getBonusPackAssetPath,
  type BonusPackAssetType,
} from '@/lib/bonus-pack-tokens';
import { checkRateLimit, getClientIP, getRateLimitHeaders, fileDownloadRateLimiter } from '@/lib/ratelimit';
import { readFile } from 'fs/promises';
import path from 'path';
import { BonusClaimStatus } from '@prisma/client';

/**
 * Rate limit: 20 downloads per hour per user
 */
const DOWNLOAD_RATE_LIMIT = {
  maxRequests: 20,
  windowMs: 60 * 60 * 1000, // 1 hour
};

/**
 * Valid asset types
 */
const VALID_ASSETS: BonusPackAssetType[] = [
  'agent-charter-pack',
  'coi-diagnostic',
  'vp-agent-templates',
  'sub-agent-ladders',
  'escalation-protocols',
  'implementation-guide',
  'full-bonus-pack',
];

/**
 * GET /api/bonus/download/[asset]
 * Download bonus pack asset with token verification
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ asset: string }> }
) {
  try {
    // ==================== Extract Route Parameters ====================
    const { asset } = await context.params;

    // Validate asset type
    if (!VALID_ASSETS.includes(asset as BonusPackAssetType)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid asset type',
          error: 'INVALID_ASSET',
        },
        { status: 400 }
      );
    }

    const assetType = asset as BonusPackAssetType;

    // ==================== Extract & Verify Token ====================
    const authHeader = request.headers.get('Authorization');
    const queryToken = request.nextUrl.searchParams.get('token');
    const token = extractBonusToken(authHeader, queryToken);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing download token. Please use the link from your email.',
          error: 'MISSING_TOKEN',
        },
        { status: 401 }
      );
    }

    // Verify token
    const verification = verifyBonusPackToken(token, assetType);

    if (!verification.valid) {
      const errorMessages = {
        expired: 'Download link has expired. Please contact support for a new link.',
        invalid: 'Invalid download token. Please use the link from your email.',
        malformed: 'Malformed download token. Please use the link from your email.',
        missing_secret: 'Server configuration error. Please contact support.',
        asset_mismatch: 'Token does not match requested asset.',
      };

      return NextResponse.json(
        {
          success: false,
          message: errorMessages[verification.error!] || 'Token verification failed',
          error: verification.error?.toUpperCase(),
        },
        { status: verification.error === 'expired' ? 410 : 401 }
      );
    }

    const { payload } = verification;

    // Ensure payload exists
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid token payload',
          error: 'INVALID_TOKEN',
        },
        { status: 401 }
      );
    }

    // ==================== Rate Limiting ====================
    const clientIP = getClientIP(request);
    const rateLimitKey = `bonus-download:${payload.email}:${clientIP}`;
    const rateLimitResult = await checkRateLimit(
      rateLimitKey,
      fileDownloadRateLimiter,
      DOWNLOAD_RATE_LIMIT
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many downloads. Please try again in ${Math.ceil(rateLimitResult.reset / 60)} minutes.`,
          error: 'RATE_LIMIT_EXCEEDED',
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // ==================== Verify Claim Status ====================
    try {
      const bonusClaim = await prisma.bonusClaim.findUnique({
        where: { id: payload.claimId },
        include: {
          user: true,
          receipt: true,
        },
      });

      if (!bonusClaim) {
        console.warn(`[Bonus Download] Claim not found: ${payload.claimId}`);
        return NextResponse.json(
          {
            success: false,
            message: 'Bonus claim not found. Please contact support.',
            error: 'CLAIM_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      // Verify claim is approved or delivered
      if (bonusClaim.status !== BonusClaimStatus.APPROVED &&
          bonusClaim.status !== BonusClaimStatus.DELIVERED) {
        console.warn(
          `[Bonus Download] Claim not approved: ${payload.claimId} (status: ${bonusClaim.status})`
        );
        return NextResponse.json(
          {
            success: false,
            message: 'Bonus claim is still being processed. Please check your email for updates.',
            error: 'CLAIM_NOT_APPROVED',
          },
          { status: 403 }
        );
      }

      // Verify email matches
      if (bonusClaim.deliveryEmail.toLowerCase() !== payload.email.toLowerCase()) {
        console.warn(
          `[Bonus Download] Email mismatch: ${payload.email} vs ${bonusClaim.deliveryEmail}`
        );
        return NextResponse.json(
          {
            success: false,
            message: 'Token email does not match claim. Please use the link from your email.',
            error: 'EMAIL_MISMATCH',
          },
          { status: 403 }
        );
      }
    } catch (dbError) {
      console.error('[Bonus Download] Database error:', dbError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to verify bonus claim. Please try again later.',
          error: 'DATABASE_ERROR',
        },
        { status: 500 }
      );
    }

    // ==================== Serve File ====================
    const metadata = getBonusPackAssetMetadata(assetType);
    const assetPath = getBonusPackAssetPath(assetType);
    const filePath = path.join(process.cwd(), 'public', assetPath);

    let fileBuffer: Buffer;

    try {
      fileBuffer = await readFile(filePath);
    } catch (fileError) {
      console.error(`[Bonus Download] File not found: ${filePath}`, fileError);
      return NextResponse.json(
        {
          success: false,
          message: `Asset file not found: ${metadata.displayName}. Please contact support.`,
          error: 'FILE_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // ==================== Track Download Analytics ====================
    // Fire and forget - don't wait for analytics
    trackBonusDownload(payload.claimId, payload.email, assetType, clientIP).catch((err) => {
      console.error('[Bonus Download] Analytics tracking failed:', err);
    });

    // ==================== Log Download ====================
    console.log('=== BONUS PACK DOWNLOAD ===');
    console.log('Claim ID:', payload.claimId);
    console.log('Email:', payload.email);
    console.log('Asset:', assetType);
    console.log('File:', metadata.filename);
    console.log('Size:', fileBuffer.length, 'bytes');
    console.log('IP:', clientIP);
    console.log('===========================');

    // ==================== Return File ====================
    // Convert Buffer to Uint8Array for NextResponse
    const fileData = new Uint8Array(fileBuffer);

    return new NextResponse(fileData, {
      status: 200,
      headers: {
        'Content-Type': metadata.mimeType,
        'Content-Disposition': `attachment; filename="${metadata.filename}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...getRateLimitHeaders(rateLimitResult),
      },
    });
  } catch (error: unknown) {
    console.error('Bonus pack download API error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
        error: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Track bonus pack download in analytics
 */
async function trackBonusDownload(
  claimId: string,
  email: string,
  asset: BonusPackAssetType,
  ipAddress: string
): Promise<void> {
  try {
    // Update claim status to DELIVERED if not already
    await prisma.bonusClaim.updateMany({
      where: {
        id: claimId,
        status: BonusClaimStatus.APPROVED,
      },
      data: {
        status: BonusClaimStatus.DELIVERED,
        deliveredAt: new Date(),
      },
    });

    // Track analytics event
    const metadata = getBonusPackAssetMetadata(asset);

    await prisma.analyticsEvent.create({
      data: {
        eventType: 'BONUS_CLAIM_SUBMIT', // Reusing existing enum
        eventName: 'bonus_pack_download',
        properties: {
          claimId,
          email,
          asset,
          assetFilename: metadata.filename,
          assetSize: metadata.sizeEstimate,
        },
        ipAddress,
      },
    });

    console.log(`[Analytics] Bonus download tracked: ${claimId} - ${asset}`);
  } catch (error) {
    console.error('[Analytics] Failed to track bonus download:', error);
    // Don't throw - analytics failure shouldn't block downloads
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
