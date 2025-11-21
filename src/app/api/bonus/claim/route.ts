/**
 * Bonus Claim API Endpoint (Database-Integrated Version)
 * Handles pre-order bonus pack redemption with Prisma database
 *
 * Method: POST
 * Body: FormData { email, orderId, retailer, format, receipt (File) }
 *
 * Flow:
 * 1. Rate limit check
 * 2. Validate inputs
 * 3. Upload receipt to storage
 * 4. Create User (if not exists)
 * 5. Create Receipt record
 * 6. Create BonusClaim record
 * 7. Queue bonus pack delivery (or auto-approve for MVP)
 * 8. Send bonus pack email with secure download links
 *
 * Security:
 * - Rate limiting: 3 requests/hour per IP
 * - File type validation (MIME type checked, not just extension)
 * - File size limit: 5MB
 * - Input sanitization
 * - Honeypot spam prevention
 */

import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeString } from '@/lib/validation';
import { sendBonusPackEmail } from '@/lib/email';
import { generateAllBonusPackUrls } from '@/lib/bonus-pack-tokens';
import {
  validateFileType,
  validateFileSize,
  generateUniqueFilename,
  sanitizeFilename,
  getFileExtension,
  calculateFileHash,
} from '@/lib/file-utils';
import {
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
  fileUploadRateLimiter,
  BONUS_CLAIM_RATE_LIMIT,
} from '@/lib/ratelimit';
import {
  uploadToStorage,
  generateSecureFilename,
  isStorageConfigured,
  getStorageProvider,
} from '@/lib/upload';
import { ReceiptStatus, BonusClaimStatus } from '@prisma/client';
import type { BonusClaimSubmitEvent } from '@/types/analytics';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-born.org';

/**
 * POST /api/bonus/claim
 * Handle bonus claim submission with database integration
 */
export async function POST(request: NextRequest) {
  try {
    // ==================== Rate Limiting ====================
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(
      clientIP,
      fileUploadRateLimiter,
      BONUS_CLAIM_RATE_LIMIT
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many requests. Please try again in ${rateLimitResult.reset} seconds.`,
          error: 'RATE_LIMIT_EXCEEDED',
        },
        {
          status: 429,
          headers: {
            ...getRateLimitHeaders(rateLimitResult),
          },
        }
      );
    }

    // ==================== Parse FormData ====================
    const formData = await request.formData();

    const email = formData.get('email') as string;
    const orderId = formData.get('orderId') as string;
    const retailer = formData.get('retailer') as string;
    const format = formData.get('format') as string;
    const receipt = formData.get('receipt') as File;
    const honeypot = formData.get('honeypot') as string;

    // ==================== Honeypot Check ====================
    if (honeypot && honeypot.length > 0) {
      // Silently reject spam
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid submission',
          error: 'INVALID_REQUEST',
        },
        { status: 400 }
      );
    }

    // ==================== Validate Required Fields ====================
    if (!email || !orderId || !retailer || !format || !receipt) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
          error: 'MISSING_FIELDS',
          details: {
            email: !email ? 'Email is required' : undefined,
            orderId: !orderId ? 'Order ID is required' : undefined,
            retailer: !retailer ? 'Retailer is required' : undefined,
            format: !format ? 'Format is required' : undefined,
            receipt: !receipt ? 'Receipt file is required' : undefined,
          },
        },
        { status: 400 }
      );
    }

    // ==================== Validate Email Format ====================
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email address',
          error: 'INVALID_EMAIL',
        },
        { status: 400 }
      );
    }

    // ==================== Validate Format ====================
    const validFormats = ['hardcover', 'ebook', 'audiobook'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid book format',
          error: 'INVALID_FORMAT',
        },
        { status: 400 }
      );
    }

    // ==================== Validate Order ID ====================
    if (orderId.length < 5 || orderId.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order ID must be between 5 and 100 characters',
          error: 'INVALID_ORDER_ID',
        },
        { status: 400 }
      );
    }

    // ==================== Validate File ====================
    if (!(receipt instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Receipt must be a file',
          error: 'INVALID_FILE',
        },
        { status: 400 }
      );
    }

    // Validate file size
    const sizeValidation = validateFileSize(receipt.size);
    if (!sizeValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: sizeValidation.error,
          error: 'FILE_TOO_LARGE',
        },
        { status: 413 }
      );
    }

    // Read file buffer for MIME type validation
    const arrayBuffer = await receipt.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Validate MIME type
    const typeValidation = await validateFileType(fileBuffer, receipt.type);
    if (!typeValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: typeValidation.error,
          error: 'INVALID_FILE_TYPE',
        },
        { status: 400 }
      );
    }

    // ==================== Check for Duplicate Receipt ====================
    const fileHash = calculateFileHash(fileBuffer);

    const existingReceipt = await prisma.receipt.findUnique({
      where: { fileHash },
      include: { user: true },
    });

    if (existingReceipt) {
      return NextResponse.json(
        {
          success: false,
          message: 'This receipt has already been submitted. Each receipt can only be used once.',
          error: 'DUPLICATE_RECEIPT',
        },
        { status: 409 }
      );
    }

    // ==================== Upload Receipt File ====================
    let fileUrl: string;

    if (isStorageConfigured()) {
      // Upload to S3/R2
      const sanitizedOriginalName = sanitizeFilename(receipt.name);
      const fileExtension = typeValidation.extension || getFileExtension(sanitizedOriginalName);
      const filename = generateSecureFilename(
        sanitizedOriginalName,
        typeValidation.mimeType!,
        email // Use email as user identifier
      );

      fileUrl = await uploadToStorage(fileBuffer, filename, {
        folder: 'receipts',
        contentType: typeValidation.mimeType,
        metadata: {
          email: sanitizeString(email),
          retailer: sanitizeString(retailer),
          orderId: sanitizeString(orderId),
          uploadedAt: new Date().toISOString(),
        },
      });

      console.log(`[Bonus Claim] Uploaded to ${getStorageProvider()}: ${filename}`);
    } else {
      // Fallback: local storage for development
      console.warn('[Bonus Claim] Storage not configured. Using local fallback.');

      const { saveFile } = await import('@/lib/file-utils');
      const sanitizedOriginalName = sanitizeFilename(receipt.name);
      const fileExtension = typeValidation.extension || getFileExtension(sanitizedOriginalName);
      const uniqueFilename = generateUniqueFilename(sanitizedOriginalName, fileExtension);

      fileUrl = await saveFile(fileBuffer, uniqueFilename, '/uploads/receipts');
    }

    // ==================== Create or Get User ====================
    const sanitizedEmail = sanitizeString(email.toLowerCase().trim());

    let user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: sanitizedEmail,
          emailVerified: new Date(), // Auto-verify since they provided receipt
        },
      });
      console.log(`[Bonus Claim] Created new user: ${user.id}`);
    }

    // ==================== Create Receipt Record ====================
    const receiptRecord = await prisma.receipt.create({
      data: {
        userId: user.id,
        retailer: sanitizeString(retailer),
        orderNumber: sanitizeString(orderId),
        format,
        status: ReceiptStatus.PENDING,
        fileUrl,
        fileHash,
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    console.log(`[Bonus Claim] Created receipt: ${receiptRecord.id}`);

    // ==================== Create Bonus Claim ====================
    const bonusClaim = await prisma.bonusClaim.create({
      data: {
        userId: user.id,
        receiptId: receiptRecord.id,
        deliveryEmail: sanitizedEmail,
        status: BonusClaimStatus.APPROVED, // Auto-approve for MVP
        processedAt: new Date(),
        processedBy: 'system-auto', // Auto-approval
      },
    });

    console.log(`[Bonus Claim] Created claim: ${bonusClaim.id}`);

    // ==================== Generate Download URLs ====================
    const downloadUrls = generateAllBonusPackUrls(
      sanitizedEmail,
      bonusClaim.id,
      SITE_URL
    );

    // ==================== Send Bonus Pack Email ====================
    const emailResult = await sendBonusPackEmail(
      sanitizedEmail,
      bonusClaim.id,
      {
        fullPack: downloadUrls['full-bonus-pack'],
        agentCharterPack: downloadUrls['agent-charter-pack'],
        coiDiagnostic: downloadUrls['coi-diagnostic'],
        vpAgentTemplates: downloadUrls['vp-agent-templates'],
        subAgentLadders: downloadUrls['sub-agent-ladders'],
        escalationProtocols: downloadUrls['escalation-protocols'],
        implementationGuide: downloadUrls['implementation-guide'],
      }
    );

    if (emailResult.success) {
      // Update claim with delivery tracking
      await prisma.bonusClaim.update({
        where: { id: bonusClaim.id },
        data: {
          deliveryTrackingId: emailResult.messageId,
        },
      });
    }

    // ==================== Log Success ====================
    console.log('=== BONUS CLAIM SUBMITTED ===');
    console.log('Claim ID:', bonusClaim.id);
    console.log('User ID:', user.id);
    console.log('Receipt ID:', receiptRecord.id);
    console.log('Email:', sanitizedEmail);
    console.log('Order ID:', orderId);
    console.log('Retailer:', retailer);
    console.log('Format:', format);
    console.log('Receipt URL:', fileUrl);
    console.log('Email Sent:', emailResult.success);
    console.log('Message ID:', emailResult.messageId || 'N/A');
    console.log('=============================');

    if (!emailResult.success) {
      console.warn(
        `[Bonus Claim] Email send failed for ${sanitizedEmail}:`,
        emailResult.error
      );
      // Note: We don't fail the claim submission if email fails
      // Admin can manually resend bonus pack if needed
    }

    // ==================== Track Analytics ====================
    const analyticsEvent: BonusClaimSubmitEvent = {
      event: 'bonus_claim_submit',
      retailer,
      order_id_hash: fileHash.substring(0, 16),
      receipt_uploaded: true,
      success: true,
    };

    // Fire-and-forget analytics tracking
    trackBonusClaimAnalytics(analyticsEvent, clientIP).catch((err) => {
      console.error('[Bonus Claim] Analytics tracking failed:', err);
    });

    // ==================== Return Success Response ====================
    return NextResponse.json(
      {
        success: true,
        message:
          'Bonus claim submitted successfully! Check your email for download links. Links expire in 24 hours.',
        data: {
          claimId: bonusClaim.id,
          status: bonusClaim.status,
          deliveryEmail: bonusClaim.deliveryEmail,
          deliveredAt: bonusClaim.deliveredAt,
        },
      },
      {
        status: 200,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error: unknown) {
    console.error('Bonus claim API error:', error);

    // Log error details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

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
 * Track bonus claim analytics event
 */
async function trackBonusClaimAnalytics(
  event: BonusClaimSubmitEvent,
  ipAddress: string
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'BONUS_CLAIM_SUBMIT',
        eventName: event.event,
        properties: {
          retailer: event.retailer,
          order_id_hash: event.order_id_hash,
          receipt_uploaded: event.receipt_uploaded,
          success: event.success,
        },
        ipAddress,
      },
    });

    console.log(`[Analytics] Bonus claim tracked: ${event.retailer}`);
  } catch (error) {
    console.error('[Analytics] Failed to track bonus claim:', error);
    // Don't throw - analytics failure shouldn't block claims
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
