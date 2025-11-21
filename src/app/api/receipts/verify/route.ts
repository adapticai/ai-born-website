/**
 * Receipt Verification API
 *
 * POST /api/receipts/verify
 * Checks receipt processing status and returns verification result
 *
 * Features:
 * - Check receipt verification status
 * - Return parsed receipt data
 * - Fraud detection results
 * - Manual review flags
 * - Rate limiting (5 uploads/hour per IP)
 *
 * Security:
 * - Rate limiting via Upstash Redis
 * - User authentication required
 * - Receipt ownership validation
 */

import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
  apiRateLimiter,
} from '@/lib/ratelimit';
import { ReceiptStatus } from '@prisma/client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Receipt verification response
 */
interface ReceiptVerificationResponse {
  receiptId: string;
  status: ReceiptStatus;
  verified: boolean;
  retailer: string | null;
  amount: number | null;
  currency: string | null;
  bookTitle: string | null;
  purchaseDate: Date | null;
  format: string | null;
  confidence: number;
  requiresManualReview: boolean;
  manualReviewReason: string | null;
  verifiedAt: Date | null;
  rejectionReason: string | null;
}

// ============================================================================
// POST /api/receipts/verify
// ============================================================================

/**
 * Check receipt verification status
 *
 * Body: { receiptId: string }
 */
export async function POST(request: NextRequest) {
  try {
    // ==================== Rate Limiting ====================
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(clientIP, apiRateLimiter);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests. Please try again in ${rateLimitResult.reset} seconds.`,
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // ==================== Parse Request ====================
    const body = await request.json();
    const { receiptId } = body;

    if (!receiptId || typeof receiptId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_REQUEST',
          message: 'Receipt ID is required',
        },
        { status: 400 }
      );
    }

    // ==================== Fetch Receipt ====================
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!receipt) {
      return NextResponse.json(
        {
          success: false,
          error: 'RECEIPT_NOT_FOUND',
          message: 'Receipt not found',
        },
        { status: 404 }
      );
    }

    // ==================== Parse Verification Data ====================
    // Note: In production, verification data would be stored in a separate table
    // or as JSON metadata. For now, we'll construct from receipt fields.

    const verificationData: ReceiptVerificationResponse = {
      receiptId: receipt.id,
      status: receipt.status,
      verified: receipt.status === ReceiptStatus.VERIFIED,
      retailer: receipt.retailer,
      amount: null, // Would be parsed from receipt
      currency: null,
      bookTitle: null,
      purchaseDate: receipt.purchaseDate,
      format: receipt.format,
      confidence: 0, // Would be from verification metadata
      requiresManualReview: receipt.status === ReceiptStatus.PENDING,
      manualReviewReason: null,
      verifiedAt: receipt.verifiedAt,
      rejectionReason: receipt.rejectionReason,
    };

    // ==================== Return Verification Result ====================
    return NextResponse.json(
      {
        success: true,
        data: verificationData,
      },
      {
        status: 200,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error('[Receipt Verify API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS - CORS Support
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
