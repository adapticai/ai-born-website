/**
 * Receipt Upload API Endpoint
 * Handles receipt file uploads with validation and storage
 *
 * Method: POST
 * Content-Type: multipart/form-data
 * Body: { file: File, retailer: string, orderNumber?: string, format?: string, purchaseDate?: string }
 *
 * Security:
 * - Rate limiting: 5 uploads per hour per IP
 * - File validation: MIME type, size, virus scanning
 * - Duplicate detection via file hash
 * - Authentication required (user must be logged in)
 * - Input sanitization
 */

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sanitizeString } from '@/lib/validation';
import {
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
  fileUploadRateLimiter,
} from '@/lib/ratelimit';
import {
  validateReceiptFile,
  uploadToStorage,
  generateSecureFilename,
  scanFileForVirus,
  checkDuplicateFile,
  isStorageConfigured,
  getStorageProvider,
  calculateFileHash,
} from '@/lib/upload';
import type { ReceiptUploadResponse } from '@/types/receipt';
import { ReceiptStatus } from '@prisma/client';

/**
 * Rate limit: 5 uploads per hour per IP
 */
const UPLOAD_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
};

/**
 * POST /api/receipts/upload
 * Handle receipt file upload
 */
export async function POST(request: NextRequest) {
  try {
    // ==================== Authentication ====================
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json<ReceiptUploadResponse>(
        {
          success: false,
          message: 'Authentication required',
          error: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || undefined,
          emailVerified: new Date(),
        },
      });
    }

    // ==================== Rate Limiting ====================
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(
      `receipt-upload:${user.id}:${clientIP}`,
      fileUploadRateLimiter,
      UPLOAD_RATE_LIMIT
    );

    if (!rateLimitResult.success) {
      return NextResponse.json<ReceiptUploadResponse>(
        {
          success: false,
          message: `Too many uploads. Please try again in ${Math.ceil(rateLimitResult.reset / 60)} minutes.`,
          error: 'RATE_LIMIT_EXCEEDED',
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // ==================== Parse FormData ====================
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    const retailer = formData.get('retailer') as string | null;
    const orderNumber = formData.get('orderNumber') as string | null;
    const format = formData.get('format') as string | null;
    const purchaseDate = formData.get('purchaseDate') as string | null;

    // ==================== Validate Required Fields ====================
    if (!file) {
      return NextResponse.json<ReceiptUploadResponse>(
        {
          success: false,
          message: 'Receipt file is required',
          error: 'MISSING_FILE',
        },
        { status: 400 }
      );
    }

    if (!retailer) {
      return NextResponse.json<ReceiptUploadResponse>(
        {
          success: false,
          message: 'Retailer is required',
          error: 'MISSING_RETAILER',
        },
        { status: 400 }
      );
    }

    // Validate file is actually a File instance
    if (!(file instanceof File)) {
      return NextResponse.json<ReceiptUploadResponse>(
        {
          success: false,
          message: 'Invalid file upload',
          error: 'INVALID_FILE',
        },
        { status: 400 }
      );
    }

    // ==================== Validate Format ====================
    const validFormats = ['hardcover', 'ebook', 'audiobook'];
    if (format && !validFormats.includes(format)) {
      return NextResponse.json<ReceiptUploadResponse>(
        {
          success: false,
          message: 'Invalid book format',
          error: 'INVALID_FORMAT',
        },
        { status: 400 }
      );
    }

    // ==================== Validate File ====================
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const validation = await validateReceiptFile(
      fileBuffer,
      file.type,
      file.size
    );

    if (!validation.valid) {
      return NextResponse.json<ReceiptUploadResponse>(
        {
          success: false,
          message: validation.error || 'File validation failed',
          error: 'INVALID_FILE',
        },
        { status: 400 }
      );
    }

    // ==================== Virus Scanning ====================
    const isClean = await scanFileForVirus(fileBuffer);

    if (!isClean) {
      return NextResponse.json<ReceiptUploadResponse>(
        {
          success: false,
          message: 'File failed security scan',
          error: 'SECURITY_SCAN_FAILED',
        },
        { status: 400 }
      );
    }

    // ==================== Duplicate Detection ====================
    const fileHash = validation.hash || calculateFileHash(fileBuffer);
    const duplicateCheck = await checkDuplicateFile(fileHash, prisma);

    if (duplicateCheck.isDuplicate) {
      // Check if it's the same user re-uploading
      if (duplicateCheck.existingUserId === user.id) {
        return NextResponse.json<ReceiptUploadResponse>(
          {
            success: false,
            message: 'You have already uploaded this receipt',
            error: 'DUPLICATE_RECEIPT_SAME_USER',
          },
          { status: 409 }
        );
      }

      // Different user trying to use same receipt
      return NextResponse.json<ReceiptUploadResponse>(
        {
          success: false,
          message: 'This receipt has already been used',
          error: 'DUPLICATE_RECEIPT',
        },
        { status: 409 }
      );
    }

    // ==================== Upload to Storage ====================
    let fileUrl: string;

    if (isStorageConfigured()) {
      // Upload to S3/R2
      const filename = generateSecureFilename(
        file.name,
        validation.mimeType!,
        user.id
      );

      fileUrl = await uploadToStorage(fileBuffer, filename, {
        folder: 'receipts',
        contentType: validation.mimeType,
        metadata: {
          userId: user.id,
          retailer: sanitizeString(retailer),
          uploadedAt: new Date().toISOString(),
        },
      });

      console.log(
        `[Receipt Upload] Uploaded to ${getStorageProvider()}: ${filename}`
      );
    } else {
      // Fallback: local storage for development
      console.warn(
        '[Receipt Upload] Storage not configured. Using local fallback.'
      );

      const { saveFile } = await import('@/lib/file-utils');
      const sanitizedFilename = generateSecureFilename(
        file.name,
        validation.mimeType!,
        user.id
      );

      fileUrl = await saveFile(fileBuffer, sanitizedFilename, '/uploads/receipts');
    }

    // ==================== Create Receipt Record ====================
    const receipt = await prisma.receipt.create({
      data: {
        userId: user.id,
        retailer: sanitizeString(retailer),
        orderNumber: orderNumber ? sanitizeString(orderNumber) : null,
        format: format || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        status: ReceiptStatus.PENDING,
        fileUrl,
        fileHash,
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    // ==================== Log Success ====================
    console.log('=== RECEIPT UPLOADED ===');
    console.log('Receipt ID:', receipt.id);
    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    console.log('Retailer:', receipt.retailer);
    console.log('Order Number:', receipt.orderNumber || 'N/A');
    console.log('Format:', receipt.format || 'N/A');
    console.log('File URL:', fileUrl);
    console.log('File Hash:', fileHash.substring(0, 16) + '...');
    console.log('Status:', receipt.status);
    console.log('========================');

    // TODO: Trigger receipt processing job
    // Example with BullMQ:
    // await receiptQueue.add('verify-receipt', {
    //   receiptId: receipt.id,
    //   fileUrl,
    //   retailer: receipt.retailer,
    //   orderNumber: receipt.orderNumber,
    //   userId: user.id,
    //   createdAt: receipt.createdAt.toISOString(),
    // });

    // TODO: Send confirmation email to user
    // await sendReceiptUploadConfirmation(user.email, receipt.id);

    // ==================== Return Success Response ====================
    return NextResponse.json<ReceiptUploadResponse>(
      {
        success: true,
        message:
          'Receipt uploaded successfully! We will verify it within 24 hours.',
        data: {
          receiptId: receipt.id,
          status: receipt.status as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          fileUrl: isStorageConfigured() ? fileUrl : undefined,
        },
      },
      {
        status: 201,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error: unknown) {
    console.error('Receipt upload API error:', error);

    // Log error details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json<ReceiptUploadResponse>(
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
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
