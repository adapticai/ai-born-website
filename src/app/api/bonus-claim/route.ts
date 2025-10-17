/**
 * Bonus Claim API Endpoint
 * Handles pre-order bonus pack redemption
 *
 * Method: POST
 * Body: FormData { email, orderId, retailer, format, receipt (File) }
 *
 * Security:
 * - Rate limiting: 3 requests/hour per IP
 * - File type validation (MIME type checked, not just extension)
 * - File size limit: 5MB
 * - Input sanitization
 * - Honeypot spam prevention
 *
 * TODO: Production improvements
 * - TODO: Integrate email service for bonus delivery
 * - TODO: Move receipt storage to S3/R2 (Cloudflare R2 or AWS S3)
 * - TODO: Automated verification (OCR or retailer API integration)
 * - TODO: Admin dashboard for manual verification
 * - TODO: Malware scanning (ClamAV or cloud scanning service)
 */

import { NextRequest, NextResponse } from 'next/server';

import { promises as fs } from 'fs';
import path from 'path';

import {
  validateFileType,
  validateFileSize,
  generateUniqueFilename,
  saveFile,
  sanitizeFilename,
  getFileExtension,
} from '@/lib/file-utils';
import {
  checkRateLimit,
  getClientIP,
  BONUS_CLAIM_RATE_LIMIT,
} from '@/lib/rate-limit';
import { sanitizeString } from '@/lib/validation';

/**
 * Bonus claim record structure
 */
interface BonusClaimRecord {
  id: string;
  email: string;
  orderId: string;
  retailer: string;
  format: 'hardcover' | 'ebook' | 'audiobook';
  receiptPath: string;
  receiptFilename: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  ipAddress: string;
}


/**
 * POST /api/bonus-claim
 * Handle bonus claim submission
 */
export async function POST(request: NextRequest) {
  try {
    // ==================== Rate Limiting ====================
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP, BONUS_CLAIM_RATE_LIMIT);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many requests. Please try again in ${rateLimitResult.resetIn} seconds.`,
          error: 'RATE_LIMIT_EXCEEDED',
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.resetIn.toString(),
            'X-RateLimit-Limit': BONUS_CLAIM_RATE_LIMIT.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetIn.toString(),
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

    // Check if receipt is a File
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

    // Validate MIME type (checks actual file content, not just extension)
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

    // ==================== Generate Unique Filename ====================
    const sanitizedOriginalName = sanitizeFilename(receipt.name);
    const fileExtension = typeValidation.extension || getFileExtension(sanitizedOriginalName);
    const uniqueFilename = generateUniqueFilename(sanitizedOriginalName, fileExtension);

    // ==================== Save Receipt File ====================
    // TODO: Move this to S3/R2 in production for better scalability and security
    const uploadDir = '/uploads/receipts';
    let receiptPath: string;

    try {
      receiptPath = await saveFile(fileBuffer, uniqueFilename, uploadDir);
    } catch (saveError) {
      // eslint-disable-next-line no-console
      console.error('Error saving receipt file:', saveError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to save receipt file. Please try again.',
          error: 'FILE_SAVE_ERROR',
        },
        { status: 500 }
      );
    }

    // ==================== Create Claim Record ====================
    const claimRecord: BonusClaimRecord = {
      id: generateClaimId(),
      email: sanitizeString(email.toLowerCase().trim()),
      orderId: sanitizeString(orderId.trim()),
      retailer: sanitizeString(retailer.trim()),
      format: format as 'hardcover' | 'ebook' | 'audiobook',
      receiptPath,
      receiptFilename: uniqueFilename,
      timestamp: new Date().toISOString(),
      status: 'pending',
      ipAddress: clientIP,
    };

    // ==================== Store Claim Record ====================
    // For MVP: Store in JSON file
    // TODO: Move to database (PostgreSQL, MongoDB, or Supabase) in production
    try {
      await saveClaimRecord(claimRecord);
    } catch (recordError) {
      // eslint-disable-next-line no-console
      console.error('Error saving claim record:', recordError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to save claim record. Please try again.',
          error: 'RECORD_SAVE_ERROR',
        },
        { status: 500 }
      );
    }

    // ==================== Send Confirmation Email ====================
    // TODO: Integrate email service (SendGrid, Postmark, Resend, etc.)
    // For MVP: Log to console
    /* eslint-disable no-console */
    console.log('=== BONUS CLAIM SUBMITTED ===');
    console.log('Claim ID:', claimRecord.id);
    console.log('Email:', claimRecord.email);
    console.log('Order ID:', claimRecord.orderId);
    console.log('Retailer:', claimRecord.retailer);
    console.log('Format:', claimRecord.format);
    console.log('Receipt Path:', claimRecord.receiptPath);
    console.log('Status:', claimRecord.status);
    console.log('Timestamp:', claimRecord.timestamp);
    console.log('=============================');
    /* eslint-enable no-console */

    // TODO: Send confirmation email to user
    // await sendConfirmationEmail(claimRecord);

    // TODO: Send notification email to admin for manual verification
    // await sendAdminNotification(claimRecord);

    // ==================== Return Success Response ====================
    return NextResponse.json(
      {
        success: true,
        message:
          'Bonus claim submitted successfully! Your claim will be verified within 24 hours, and you will receive your bonus pack via email.',
        data: {
          claimId: claimRecord.id,
          status: claimRecord.status,
          timestamp: claimRecord.timestamp,
        },
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        },
      }
    );
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Bonus claim API error:', error);

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
 * Generate a unique claim ID
 */
function generateClaimId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `claim-${timestamp}-${random}`;
}

/**
 * Save claim record to JSON file (MVP implementation)
 * TODO: Replace with database in production
 */
async function saveClaimRecord(record: BonusClaimRecord): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data');
  const filePath = path.join(dataDir, 'bonus-claims.json');

  try {
    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });

    // Read existing claims
    let claims: BonusClaimRecord[] = [];
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      claims = JSON.parse(fileContent);
    } catch {
      // File doesn't exist or is empty, start with empty array
      claims = [];
    }

    // Add new claim
    claims.push(record);

    // Write back to file with pretty formatting
    await fs.writeFile(filePath, JSON.stringify(claims, null, 2), 'utf-8');
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Error saving claim record to file:', error);
    throw error;
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
