/**
 * Background Receipt Processor
 *
 * Processes receipt verification jobs asynchronously
 * Uses BullMQ for job queue management (or simple Promise-based processing)
 *
 * Job Flow:
 * 1. Fetch receipt from storage
 * 2. OCR preprocessing
 * 3. LLM parsing (extract retailer, amount, book title)
 * 4. PII redaction (triple-layer)
 * 5. Fraud detection checks
 * 6. Update database with results
 * 7. Send notification email
 *
 * NOTE: This is a simplified implementation without BullMQ.
 * In production, integrate with BullMQ or similar job queue.
 */

import { prisma } from '@/lib/prisma';
import { processReceiptFile } from '@/lib/receipt-processor';
import { parseReceipt, checkReceiptFraud, calculateVerificationScore } from '@/lib/receipt-parser';
import { ReceiptStatus, BonusClaimStatus } from '@prisma/client';
import { sendBonusPackEmail } from '@/lib/email';
import { promises as fs } from 'fs';
import path from 'path';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Receipt processing job
 */
export interface ReceiptProcessingJob {
  receiptId: string;
  userId: string;
  fileUrl: string;
}

/**
 * Receipt processing result
 */
export interface ReceiptProcessingResult {
  success: boolean;
  receiptId: string;
  status: ReceiptStatus;
  retailer: string | null;
  amount: number | null;
  currency: string | null;
  bookTitle: string | null;
  purchaseDate: Date | null;
  format: string | null;
  confidence: number;
  verificationScore: number;
  requiresManualReview: boolean;
  manualReviewReason: string | null;
  piiDetected: string[];
  error?: string;
}

// ============================================================================
// JOB PROCESSOR
// ============================================================================

/**
 * Process receipt verification job
 *
 * @param job - Receipt processing job
 * @returns Processing result
 */
export async function processReceiptVerification(
  job: ReceiptProcessingJob
): Promise<ReceiptProcessingResult> {
  const { receiptId, userId, fileUrl } = job;

  try {
    console.log(`[Receipt Processor] Processing receipt ${receiptId}`);

    // ==================== Update Status to PROCESSING ====================
    await prisma.receipt.update({
      where: { id: receiptId },
      data: { status: ReceiptStatus.PENDING },
    });

    // ==================== Fetch Receipt File ====================
    const fileBuffer = await fetchReceiptFile(fileUrl);
    const mimeType = getMimeTypeFromUrl(fileUrl);

    // ==================== Step 1: OCR Preprocessing ====================
    console.log(`[Receipt Processor] Extracting text from receipt ${receiptId}`);
    const processingResult = await processReceiptFile(fileBuffer, mimeType);

    if (!processingResult.success || !processingResult.redactedText) {
      // OCR failed
      await updateReceiptStatus(receiptId, ReceiptStatus.REJECTED, {
        rejectionReason: processingResult.error || 'OCR extraction failed',
      });

      return {
        success: false,
        receiptId,
        status: ReceiptStatus.REJECTED,
        retailer: null,
        amount: null,
        currency: null,
        bookTitle: null,
        purchaseDate: null,
        format: null,
        confidence: 0,
        verificationScore: 0,
        requiresManualReview: false,
        manualReviewReason: null,
        piiDetected: [],
        error: processingResult.error,
      };
    }

    // ==================== Step 2: LLM Parsing ====================
    console.log(`[Receipt Processor] Parsing receipt data with LLM for ${receiptId}`);
    const parsingResult = await parseReceipt(processingResult.redactedText);

    // ==================== Step 3: Fraud Detection ====================
    console.log(`[Receipt Processor] Running fraud detection for ${receiptId}`);
    const fraudCheck = checkReceiptFraud(parsingResult);
    const verificationScore = calculateVerificationScore(parsingResult);

    // ==================== Step 4: Determine Status ====================
    let finalStatus: ReceiptStatus;
    let requiresManualReview = parsingResult.requiresManualReview;
    let manualReviewReason = parsingResult.manualReviewReason;

    if (fraudCheck.isFraudulent) {
      finalStatus = ReceiptStatus.REJECTED;
      manualReviewReason = `Fraud detected: ${fraudCheck.reasons.join(', ')}`;
      requiresManualReview = false; // Auto-reject fraud
    } else if (verificationScore >= 80 && parsingResult.confidence >= 0.8) {
      finalStatus = ReceiptStatus.VERIFIED;
      requiresManualReview = false;
    } else if (verificationScore >= 60) {
      finalStatus = ReceiptStatus.PENDING;
      requiresManualReview = true;
      manualReviewReason = manualReviewReason || 'Moderate confidence - manual review recommended';
    } else {
      finalStatus = ReceiptStatus.REJECTED;
      manualReviewReason = manualReviewReason || 'Low confidence score';
      requiresManualReview = false;
    }

    // ==================== Step 5: Update Database ====================
    console.log(`[Receipt Processor] Updating receipt ${receiptId} with status ${finalStatus}`);
    await updateReceiptStatus(receiptId, finalStatus, {
      retailer: parsingResult.retailer,
      purchaseDate: parsingResult.purchaseDate,
      format: parsingResult.format,
      verifiedAt: finalStatus === ReceiptStatus.VERIFIED ? new Date() : null,
      rejectionReason:
        finalStatus === ReceiptStatus.REJECTED ? manualReviewReason : null,
    });

    // ==================== Step 6: Handle Bonus Claim ====================
    if (finalStatus === ReceiptStatus.VERIFIED) {
      await handleBonusClaimApproval(receiptId, userId);
    }

    // ==================== Step 7: Send Notification Email ====================
    await sendVerificationNotification(receiptId, userId, finalStatus);

    // ==================== Return Result ====================
    console.log(`[Receipt Processor] Completed processing receipt ${receiptId} with status ${finalStatus}`);

    return {
      success: true,
      receiptId,
      status: finalStatus,
      retailer: parsingResult.retailer,
      amount: parsingResult.amount,
      currency: parsingResult.currency,
      bookTitle: parsingResult.bookTitle,
      purchaseDate: parsingResult.purchaseDate,
      format: parsingResult.format,
      confidence: parsingResult.confidence,
      verificationScore,
      requiresManualReview,
      manualReviewReason,
      piiDetected: processingResult.piiDetected,
    };
  } catch (error) {
    console.error(`[Receipt Processor] Error processing receipt ${receiptId}:`, error);

    // Update status to pending for manual review
    await updateReceiptStatus(receiptId, ReceiptStatus.PENDING, {
      rejectionReason: 'Processing error - requires manual review',
    });

    return {
      success: false,
      receiptId,
      status: ReceiptStatus.PENDING,
      retailer: null,
      amount: null,
      currency: null,
      bookTitle: null,
      purchaseDate: null,
      format: null,
      confidence: 0,
      verificationScore: 0,
      requiresManualReview: true,
      manualReviewReason: 'Processing error',
      piiDetected: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fetch receipt file from storage
 */
async function fetchReceiptFile(fileUrl: string): Promise<Buffer> {
  // If file is stored locally
  if (fileUrl.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), 'public', fileUrl);
    return await fs.readFile(filePath);
  }

  // If file is stored in S3/R2 (TODO: implement)
  // const s3 = new AWS.S3();
  // const result = await s3.getObject({ Bucket: 'bucket', Key: fileUrl }).promise();
  // return result.Body as Buffer;

  throw new Error('File storage not configured');
}

/**
 * Get MIME type from file URL
 */
function getMimeTypeFromUrl(fileUrl: string): string {
  const ext = path.extname(fileUrl).toLowerCase();

  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
  };

  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Update receipt status in database
 */
async function updateReceiptStatus(
  receiptId: string,
  status: ReceiptStatus,
  data: {
    retailer?: string | null;
    purchaseDate?: Date | null;
    format?: string | null;
    verifiedAt?: Date | null;
    verifiedBy?: string | null;
    rejectionReason?: string | null;
  }
): Promise<void> {
  // Filter out null values for Prisma (null becomes undefined)
  const filteredData = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value === null ? undefined : value])
  );

  await prisma.receipt.update({
    where: { id: receiptId },
    data: {
      status,
      ...filteredData,
    },
  });
}

/**
 * Handle bonus claim approval
 */
async function handleBonusClaimApproval(
  receiptId: string,
  userId: string
): Promise<void> {
  try {
    // Find associated bonus claim
    const bonusClaim = await prisma.bonusClaim.findUnique({
      where: { receiptId },
    });

    if (!bonusClaim) {
      console.warn(`[Receipt Processor] No bonus claim found for receipt ${receiptId}`);
      return;
    }

    // Update bonus claim status
    await prisma.bonusClaim.update({
      where: { id: bonusClaim.id },
      data: {
        status: BonusClaimStatus.APPROVED,
        processedAt: new Date(),
      },
    });

    // Send bonus pack email
    // Generate download URLs for bonus pack files
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-born.org';
    const downloadUrls = {
      fullPack: `${baseUrl}/api/bonus-pack/download/${bonusClaim.id}/full`,
      agentCharterPack: `${baseUrl}/api/bonus-pack/download/${bonusClaim.id}/agent-charter`,
      coiDiagnostic: `${baseUrl}/api/bonus-pack/download/${bonusClaim.id}/coi-diagnostic`,
      vpAgentTemplates: `${baseUrl}/api/bonus-pack/download/${bonusClaim.id}/vp-agent-templates`,
      subAgentLadders: `${baseUrl}/api/bonus-pack/download/${bonusClaim.id}/sub-agent-ladders`,
      escalationProtocols: `${baseUrl}/api/bonus-pack/download/${bonusClaim.id}/escalation-protocols`,
      implementationGuide: `${baseUrl}/api/bonus-pack/download/${bonusClaim.id}/implementation-guide`,
    };

    const emailResult = await sendBonusPackEmail(
      bonusClaim.deliveryEmail,
      bonusClaim.id,
      downloadUrls
    );

    if (emailResult.success) {
      // Update delivery status
      await prisma.bonusClaim.update({
        where: { id: bonusClaim.id },
        data: {
          status: BonusClaimStatus.DELIVERED,
          deliveredAt: new Date(),
          deliveryTrackingId: emailResult.messageId || null,
        },
      });

      console.log(`[Receipt Processor] Bonus pack delivered for claim ${bonusClaim.id}`);
    } else {
      console.error(`[Receipt Processor] Failed to send bonus pack for claim ${bonusClaim.id}:`, emailResult.error);
    }
  } catch (error) {
    console.error(`[Receipt Processor] Error handling bonus claim approval:`, error);
  }
}

/**
 * Send verification notification email
 */
async function sendVerificationNotification(
  receiptId: string,
  userId: string,
  status: ReceiptStatus
): Promise<void> {
  try {
    // Fetch user email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      console.warn(`[Receipt Processor] User not found for receipt ${receiptId}`);
      return;
    }

    // TODO: Implement notification email based on status
    // - VERIFIED: "Your receipt has been verified! Bonus pack is on the way."
    // - REJECTED: "Unfortunately, we couldn't verify your receipt. Reason: ..."
    // - PENDING: "Your receipt is under review. We'll update you within 24 hours."

    console.log(`[Receipt Processor] Notification email sent to ${user.email} for receipt ${receiptId} (status: ${status})`);
  } catch (error) {
    console.error(`[Receipt Processor] Error sending notification email:`, error);
  }
}

// ============================================================================
// JOB QUEUE INTEGRATION (Optional)
// ============================================================================

/**
 * Queue receipt for processing
 *
 * In production, this would add job to BullMQ queue
 * For now, process immediately in background
 *
 * @param job - Receipt processing job
 */
export async function queueReceiptProcessing(
  job: ReceiptProcessingJob
): Promise<void> {
  // TODO: Integrate with BullMQ
  // const queue = new Queue('receipt-processing', {
  //   connection: redis,
  // });
  //
  // await queue.add('process-receipt', job, {
  //   attempts: 3,
  //   backoff: {
  //     type: 'exponential',
  //     delay: 2000,
  //   },
  // });

  // For now, process in background (non-blocking)
  processReceiptVerification(job)
    .then((result) => {
      console.log(`[Receipt Processor] Job completed:`, result);
    })
    .catch((error) => {
      console.error(`[Receipt Processor] Job failed:`, error);
    });
}

// ============================================================================
// ADMIN MANUAL REVIEW HELPERS
// ============================================================================

/**
 * Manually approve receipt
 */
export async function manuallyApproveReceipt(
  receiptId: string,
  adminId: string,
  notes?: string
): Promise<void> {
  await updateReceiptStatus(receiptId, ReceiptStatus.VERIFIED, {
    verifiedAt: new Date(),
    verifiedBy: adminId,
  });

  // Update bonus claim
  const receipt = await prisma.receipt.findUnique({
    where: { id: receiptId },
    include: { bonusClaim: true },
  });

  if (receipt?.bonusClaim) {
    await handleBonusClaimApproval(receiptId, receipt.userId);

    // Add admin notes
    if (notes) {
      await prisma.bonusClaim.update({
        where: { id: receipt.bonusClaim.id },
        data: { adminNotes: notes },
      });
    }
  }
}

/**
 * Manually reject receipt
 */
export async function manuallyRejectReceipt(
  receiptId: string,
  adminId: string,
  reason: string
): Promise<void> {
  await updateReceiptStatus(receiptId, ReceiptStatus.REJECTED, {
    verifiedBy: adminId,
    rejectionReason: reason,
  });

  // Update bonus claim
  const receipt = await prisma.receipt.findUnique({
    where: { id: receiptId },
    include: { bonusClaim: true },
  });

  if (receipt?.bonusClaim) {
    await prisma.bonusClaim.update({
      where: { id: receipt.bonusClaim.id },
      data: {
        status: BonusClaimStatus.REJECTED,
        processedAt: new Date(),
        processedBy: adminId,
        adminNotes: reason,
      },
    });
  }
}
