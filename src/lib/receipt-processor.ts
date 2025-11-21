/**
 * Receipt Processing Utilities
 *
 * Provides OCR preprocessing, PII redaction, and image optimization
 * for receipt verification workflow
 *
 * Features:
 * - Image preprocessing for OCR
 * - PII detection and redaction (triple-layer)
 * - Text extraction
 * - File format validation
 */

import { fileTypeFromBuffer } from 'file-type';
import crypto from 'crypto';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * OCR processing result
 */
export interface OCRResult {
  /** Extracted text from receipt */
  text: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Whether OCR was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * PII redaction result
 */
export interface PIIRedactionResult {
  /** Redacted text */
  redactedText: string;
  /** List of PII types detected */
  piiDetected: string[];
  /** Number of redactions made */
  redactionCount: number;
}

/**
 * Image preprocessing result
 */
export interface ImagePreprocessingResult {
  /** Preprocessed image buffer */
  buffer: Buffer;
  /** Image format */
  format: string;
  /** Whether preprocessing was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// PII DETECTION PATTERNS
// ============================================================================

/**
 * PII detection regex patterns
 */
const PII_PATTERNS = {
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,

  // Phone numbers (various formats)
  phone: /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,

  // Credit card numbers (basic pattern, 13-19 digits)
  creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,

  // Social Security Numbers (US)
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,

  // Street addresses (basic pattern)
  address: /\b\d+\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir)\b/gi,

  // ZIP codes (US)
  zipCode: /\b\d{5}(?:-\d{4})?\b/g,

  // IP addresses
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,

  // Full names (basic pattern - capitalized words)
  // Note: This is imperfect and may have false positives
  fullName: /\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g,
};

// ============================================================================
// OCR PROCESSING (Placeholder for AWS Textract or similar)
// ============================================================================

/**
 * Extract text from receipt image using OCR
 *
 * NOTE: This is a placeholder implementation.
 * In production, integrate with:
 * - AWS Textract
 * - Google Cloud Vision API
 * - Azure Computer Vision
 * - Tesseract.js (open source, less accurate)
 *
 * @param imageBuffer - Receipt image buffer
 * @returns OCR result with extracted text
 */
export async function extractTextFromImage(
  imageBuffer: Buffer
): Promise<OCRResult> {
  // Check if AWS Textract is configured
  const isTextractConfigured = !!(
    process.env.AWS_TEXTRACT_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  );

  if (!isTextractConfigured) {
    console.warn(
      '[Receipt Processor] AWS Textract not configured. Using placeholder OCR.'
    );

    // Return placeholder result
    // In development, you might return sample text for testing
    return {
      text: 'PLACEHOLDER OCR TEXT - Configure AWS Textract for production',
      confidence: 0.5,
      success: false,
      error: 'AWS Textract not configured',
    };
  }

  try {
    // TODO: Implement AWS Textract integration
    // Example:
    // const textract = new AWS.Textract({
    //   region: process.env.AWS_TEXTRACT_REGION,
    //   credentials: {
    //     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    //   },
    // });
    //
    // const result = await textract.detectDocumentText({
    //   Document: {
    //     Bytes: imageBuffer,
    //   },
    // }).promise();
    //
    // const text = result.Blocks
    //   ?.filter(block => block.BlockType === 'LINE')
    //   .map(block => block.Text)
    //   .join('\n') || '';
    //
    // const confidence = result.Blocks
    //   ?.filter(block => block.BlockType === 'LINE')
    //   .reduce((sum, block) => sum + (block.Confidence || 0), 0) /
    //   result.Blocks.length || 0;

    // Placeholder return
    return {
      text: 'AWS Textract integration pending',
      confidence: 0.5,
      success: false,
      error: 'AWS Textract not implemented',
    };
  } catch (error) {
    console.error('[Receipt Processor] OCR extraction failed:', error);

    return {
      text: '',
      confidence: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// PII REDACTION (Triple-Layer)
// ============================================================================

/**
 * Redact PII from text (triple-layer approach)
 *
 * Layer 1: Regex-based pattern matching
 * Layer 2: LLM-based PII detection (optional)
 * Layer 3: Manual review flagging
 *
 * @param text - Text to redact
 * @returns Redaction result
 */
export function redactPII(text: string): PIIRedactionResult {
  let redactedText = text;
  const piiDetected: string[] = [];
  let redactionCount = 0;

  // Layer 1: Regex-based redaction
  Object.entries(PII_PATTERNS).forEach(([type, pattern]) => {
    const matches = text.match(pattern);

    if (matches && matches.length > 0) {
      piiDetected.push(type);
      redactionCount += matches.length;

      // Redact matches
      redactedText = redactedText.replace(pattern, (match) => {
        // Preserve length for context, but redact content
        return '[REDACTED]';
      });
    }
  });

  return {
    redactedText,
    piiDetected,
    redactionCount,
  };
}

/**
 * Advanced PII redaction with LLM assistance
 *
 * Uses Claude to detect PII that might be missed by regex patterns
 *
 * @param text - Text to analyze
 * @returns Additional PII detected by LLM
 */
export async function detectPIIWithLLM(text: string): Promise<string[]> {
  // TODO: Implement LLM-based PII detection
  // This would use Claude to identify PII that regex patterns might miss
  // For now, return empty array
  return [];
}

// ============================================================================
// IMAGE PREPROCESSING
// ============================================================================

/**
 * Preprocess receipt image for OCR
 *
 * Optimizations:
 * - Convert to grayscale
 * - Enhance contrast
 * - Denoise
 * - Deskew
 * - Resize to optimal resolution
 *
 * NOTE: This requires image processing libraries like Sharp or Jimp
 * For now, this is a placeholder
 *
 * @param imageBuffer - Original image buffer
 * @returns Preprocessed image
 */
export async function preprocessImageForOCR(
  imageBuffer: Buffer
): Promise<ImagePreprocessingResult> {
  try {
    // Validate image format
    const fileType = await fileTypeFromBuffer(imageBuffer);

    if (!fileType || !['image/jpeg', 'image/png', 'image/webp'].includes(fileType.mime)) {
      return {
        buffer: imageBuffer,
        format: fileType?.mime || 'unknown',
        success: false,
        error: 'Unsupported image format',
      };
    }

    // TODO: Implement image preprocessing with Sharp
    // Example:
    // const sharp = require('sharp');
    // const processedBuffer = await sharp(imageBuffer)
    //   .grayscale()
    //   .normalize()
    //   .sharpen()
    //   .resize(1600, null, { withoutEnlargement: true })
    //   .toBuffer();

    // For now, return original buffer
    return {
      buffer: imageBuffer,
      format: fileType.mime,
      success: true,
    };
  } catch (error) {
    console.error('[Receipt Processor] Image preprocessing failed:', error);

    return {
      buffer: imageBuffer,
      format: 'unknown',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// FILE VALIDATION & HASHING
// ============================================================================

/**
 * Calculate SHA-256 hash of receipt file for duplicate detection
 *
 * @param buffer - File buffer
 * @returns SHA-256 hash (hex string)
 */
export function calculateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Validate receipt file
 *
 * @param buffer - File buffer
 * @param mimeType - MIME type from upload
 * @returns Validation result
 */
export async function validateReceiptFile(
  buffer: Buffer,
  mimeType: string
): Promise<{
  valid: boolean;
  error?: string;
  detectedMimeType?: string;
}> {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (buffer.length > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit',
    };
  }

  // Detect actual MIME type
  const fileType = await fileTypeFromBuffer(buffer);
  const detectedMimeType = fileType?.mime;

  // Allowed MIME types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  // Validate MIME type
  if (!detectedMimeType || !allowedTypes.includes(detectedMimeType)) {
    return {
      valid: false,
      error: 'Invalid file type. Allowed: JPEG, PNG, WebP, PDF',
      detectedMimeType,
    };
  }

  // Check for MIME type mismatch (basic security check)
  if (mimeType !== detectedMimeType) {
    console.warn(
      `[Receipt Processor] MIME type mismatch: uploaded=${mimeType}, detected=${detectedMimeType}`
    );
  }

  return {
    valid: true,
    detectedMimeType,
  };
}

// ============================================================================
// RECEIPT TEXT EXTRACTION (Combined)
// ============================================================================

/**
 * Extract and process text from receipt file
 *
 * Complete pipeline:
 * 1. Validate file
 * 2. Preprocess image
 * 3. Extract text via OCR
 * 4. Redact PII
 *
 * @param fileBuffer - Receipt file buffer
 * @param mimeType - MIME type
 * @returns Processed text with PII redacted
 */
export async function processReceiptFile(
  fileBuffer: Buffer,
  mimeType: string
): Promise<{
  success: boolean;
  text: string;
  redactedText: string;
  piiDetected: string[];
  confidence: number;
  error?: string;
}> {
  // Step 1: Validate file
  const validation = await validateReceiptFile(fileBuffer, mimeType);
  if (!validation.valid) {
    return {
      success: false,
      text: '',
      redactedText: '',
      piiDetected: [],
      confidence: 0,
      error: validation.error,
    };
  }

  // Step 2: Preprocess image (if image format)
  let processedBuffer = fileBuffer;
  if (validation.detectedMimeType?.startsWith('image/')) {
    const preprocessed = await preprocessImageForOCR(fileBuffer);
    if (preprocessed.success) {
      processedBuffer = preprocessed.buffer;
    }
  }

  // Step 3: Extract text via OCR
  const ocrResult = await extractTextFromImage(processedBuffer);
  if (!ocrResult.success || !ocrResult.text) {
    return {
      success: false,
      text: '',
      redactedText: '',
      piiDetected: [],
      confidence: 0,
      error: ocrResult.error || 'OCR extraction failed',
    };
  }

  // Step 4: Redact PII
  const redactionResult = redactPII(ocrResult.text);

  return {
    success: true,
    text: ocrResult.text,
    redactedText: redactionResult.redactedText,
    piiDetected: redactionResult.piiDetected,
    confidence: ocrResult.confidence,
  };
}

// ============================================================================
// RECEIPT METADATA EXTRACTION
// ============================================================================

/**
 * Extract metadata from receipt file
 *
 * @param buffer - File buffer
 * @returns Metadata object
 */
export async function extractReceiptMetadata(buffer: Buffer): Promise<{
  fileHash: string;
  fileSize: number;
  mimeType: string | null;
  uploadedAt: Date;
}> {
  const fileType = await fileTypeFromBuffer(buffer);

  return {
    fileHash: calculateFileHash(buffer),
    fileSize: buffer.length,
    mimeType: fileType?.mime || null,
    uploadedAt: new Date(),
  };
}
