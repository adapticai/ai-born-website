/**
 * Receipt Parser with LLM Integration
 *
 * Uses Claude API to extract and verify receipt information
 * Provides confidence scoring and structured output parsing
 *
 * Features:
 * - Retailer detection
 * - Purchase amount extraction
 * - Book title verification
 * - Date extraction
 * - Confidence scoring
 * - PII redaction recommendations
 */

import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Receipt parsing result
 */
export interface ReceiptParsingResult {
  /** Whether the receipt was successfully parsed */
  success: boolean;
  /** Detected retailer name */
  retailer: string | null;
  /** Purchase amount */
  amount: number | null;
  /** Currency code (USD, GBP, EUR, etc.) */
  currency: string | null;
  /** Book title detected */
  bookTitle: string | null;
  /** Purchase date */
  purchaseDate: Date | null;
  /** Order number/ID */
  orderNumber: string | null;
  /** Format detected (hardcover, ebook, audiobook) */
  format: 'hardcover' | 'ebook' | 'audiobook' | null;
  /** Overall confidence score (0-1) */
  confidence: number;
  /** Whether manual review is recommended */
  requiresManualReview: boolean;
  /** Reason for manual review */
  manualReviewReason: string | null;
  /** PII detected in receipt */
  piiDetected: string[];
  /** Raw extraction data for debugging */
  rawData: Record<string, unknown>;
}

/**
 * LLM extraction response
 */
interface LLMExtractionResponse {
  retailer: string | null;
  retailerConfidence: number;
  amount: number | null;
  currency: string | null;
  amountConfidence: number;
  bookTitle: string | null;
  bookTitleConfidence: number;
  purchaseDate: string | null;
  orderNumber: string | null;
  format: string | null;
  piiDetected: string[];
  requiresManualReview: boolean;
  manualReviewReason: string | null;
  overallConfidence: number;
}

// ============================================================================
// CLAUDE CLIENT INITIALIZATION
// ============================================================================

/**
 * Initialize Anthropic client
 */
function createAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('[Receipt Parser] ANTHROPIC_API_KEY not configured');
    return null;
  }

  try {
    return new Anthropic({
      apiKey,
    });
  } catch (error) {
    console.error('[Receipt Parser] Failed to initialize Anthropic client:', error);
    return null;
  }
}

// ============================================================================
// RECEIPT PARSING PROMPT
// ============================================================================

/**
 * Generate receipt parsing prompt
 */
function generateReceiptParsingPrompt(ocrText: string): string {
  return `You are a receipt verification expert. Analyze the following receipt text and extract key information.

RECEIPT TEXT:
${ocrText}

TASK:
Extract the following information from this receipt:

1. RETAILER: Identify the retailer/bookstore name (Amazon, Barnes & Noble, Bookshop.org, Apple Books, Google Play, Kobo, indie bookstore, etc.)
2. AMOUNT: Purchase total amount (numeric value only)
3. CURRENCY: Currency code (USD, GBP, EUR, AUD, etc.)
4. BOOK TITLE: Check if "AI-Born" or "AI-Born: The Machine Core, the Human Cortex, and the Next Economy of Being" is mentioned
5. PURCHASE DATE: Date of purchase (YYYY-MM-DD format)
6. ORDER NUMBER: Order ID or transaction number
7. FORMAT: Book format (hardcover, ebook, or audiobook)
8. PII: List any personally identifiable information detected (names, addresses, phone numbers, email addresses, credit card numbers)

VERIFICATION CRITERIA:
- The receipt MUST be for the book "AI-Born" by Mehran Granfar
- The receipt should be from a legitimate book retailer
- The amount should be reasonable for a book purchase ($15-$50 for hardcover, $10-$20 for ebook)
- The receipt should look authentic (proper formatting, valid retailer details)

CONFIDENCE SCORING:
Rate your confidence (0.0 to 1.0) for:
- Retailer identification
- Amount extraction
- Book title match
- Overall authenticity

MANUAL REVIEW:
Set requiresManualReview to true if:
- Confidence score is below 0.7
- Receipt appears suspicious or fraudulent
- Book title doesn't match "AI-Born"
- Amount is outside expected range
- Receipt quality is poor
- Important information is missing

IMPORTANT: Respond ONLY with valid JSON matching this exact structure:
{
  "retailer": string | null,
  "retailerConfidence": number,
  "amount": number | null,
  "currency": string | null,
  "amountConfidence": number,
  "bookTitle": string | null,
  "bookTitleConfidence": number,
  "purchaseDate": string | null,
  "orderNumber": string | null,
  "format": "hardcover" | "ebook" | "audiobook" | null,
  "piiDetected": string[],
  "requiresManualReview": boolean,
  "manualReviewReason": string | null,
  "overallConfidence": number
}`;
}

// ============================================================================
// RECEIPT PARSING FUNCTION
// ============================================================================

/**
 * Parse receipt text using LLM
 *
 * @param ocrText - Text extracted from receipt image via OCR
 * @returns Receipt parsing result
 */
export async function parseReceipt(ocrText: string): Promise<ReceiptParsingResult> {
  const client = createAnthropicClient();

  if (!client) {
    // Return error result if client not configured
    return {
      success: false,
      retailer: null,
      amount: null,
      currency: null,
      bookTitle: null,
      purchaseDate: null,
      orderNumber: null,
      format: null,
      confidence: 0,
      requiresManualReview: true,
      manualReviewReason: 'LLM client not configured',
      piiDetected: [],
      rawData: {},
    };
  }

  try {
    // Call Claude API
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0, // Deterministic output for consistency
      messages: [
        {
          role: 'user',
          content: generateReceiptParsingPrompt(ocrText),
        },
      ],
    });

    // Extract text response
    const responseText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => ('text' in block ? block.text : ''))
      .join('');

    // Parse JSON response
    const extraction = parseExtractionResponse(responseText);

    // Convert to standard result format
    return {
      success: true,
      retailer: extraction.retailer,
      amount: extraction.amount,
      currency: extraction.currency || 'USD',
      bookTitle: extraction.bookTitle,
      purchaseDate: extraction.purchaseDate
        ? parsePurchaseDate(extraction.purchaseDate)
        : null,
      orderNumber: extraction.orderNumber,
      format: normalizeFormat(extraction.format),
      confidence: extraction.overallConfidence,
      requiresManualReview: extraction.requiresManualReview,
      manualReviewReason: extraction.manualReviewReason,
      piiDetected: extraction.piiDetected,
      rawData: extraction as unknown as Record<string, unknown>,
    };
  } catch (error) {
    console.error('[Receipt Parser] Failed to parse receipt:', error);

    return {
      success: false,
      retailer: null,
      amount: null,
      currency: null,
      bookTitle: null,
      purchaseDate: null,
      orderNumber: null,
      format: null,
      confidence: 0,
      requiresManualReview: true,
      manualReviewReason: `Parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      piiDetected: [],
      rawData: { error: String(error) },
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse LLM extraction response (JSON)
 */
function parseExtractionResponse(responseText: string): LLMExtractionResponse {
  try {
    // Try to extract JSON from response (in case LLM adds extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    return {
      retailer: parsed.retailer ?? null,
      retailerConfidence: parsed.retailerConfidence ?? 0,
      amount: parsed.amount ?? null,
      currency: parsed.currency ?? null,
      amountConfidence: parsed.amountConfidence ?? 0,
      bookTitle: parsed.bookTitle ?? null,
      bookTitleConfidence: parsed.bookTitleConfidence ?? 0,
      purchaseDate: parsed.purchaseDate ?? null,
      orderNumber: parsed.orderNumber ?? null,
      format: parsed.format ?? null,
      piiDetected: Array.isArray(parsed.piiDetected) ? parsed.piiDetected : [],
      requiresManualReview: parsed.requiresManualReview ?? true,
      manualReviewReason: parsed.manualReviewReason ?? null,
      overallConfidence: parsed.overallConfidence ?? 0,
    };
  } catch (error) {
    console.error('[Receipt Parser] Failed to parse extraction response:', error);

    // Return default values on parse error
    return {
      retailer: null,
      retailerConfidence: 0,
      amount: null,
      currency: null,
      amountConfidence: 0,
      bookTitle: null,
      bookTitleConfidence: 0,
      purchaseDate: null,
      orderNumber: null,
      format: null,
      piiDetected: [],
      requiresManualReview: true,
      manualReviewReason: 'Failed to parse LLM response',
      overallConfidence: 0,
    };
  }
}

/**
 * Parse purchase date string to Date object
 */
function parsePurchaseDate(dateString: string): Date | null {
  try {
    const date = new Date(dateString);

    // Validate date is valid
    if (isNaN(date.getTime())) {
      return null;
    }

    // Validate date is not in the future
    if (date > new Date()) {
      return null;
    }

    return date;
  } catch {
    return null;
  }
}

/**
 * Normalize format string to standard values
 */
function normalizeFormat(
  format: string | null
): 'hardcover' | 'ebook' | 'audiobook' | null {
  if (!format) return null;

  const normalized = format.toLowerCase().trim();

  if (
    normalized.includes('hard') ||
    normalized.includes('physical') ||
    normalized.includes('print')
  ) {
    return 'hardcover';
  }

  if (
    normalized.includes('ebook') ||
    normalized.includes('e-book') ||
    normalized.includes('kindle') ||
    normalized.includes('digital')
  ) {
    return 'ebook';
  }

  if (
    normalized.includes('audio') ||
    normalized.includes('audible') ||
    normalized.includes('audiobook')
  ) {
    return 'audiobook';
  }

  return null;
}

// ============================================================================
// FRAUD DETECTION HELPERS
// ============================================================================

/**
 * Check if receipt appears fraudulent
 */
export function checkReceiptFraud(
  result: ReceiptParsingResult,
  expectedRetailer?: string
): {
  isFraudulent: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  // Check confidence threshold
  if (result.confidence < 0.5) {
    reasons.push('Low confidence score');
  }

  // Check book title match
  if (!result.bookTitle || !result.bookTitle.toLowerCase().includes('ai-born')) {
    reasons.push('Book title does not match AI-Born');
  }

  // Check amount range
  if (result.amount !== null) {
    if (result.format === 'hardcover' && (result.amount < 15 || result.amount > 100)) {
      reasons.push('Hardcover price outside expected range ($15-$100)');
    }
    if (result.format === 'ebook' && (result.amount < 5 || result.amount > 30)) {
      reasons.push('Ebook price outside expected range ($5-$30)');
    }
    if (result.format === 'audiobook' && (result.amount < 10 || result.amount > 50)) {
      reasons.push('Audiobook price outside expected range ($10-$50)');
    }
  }

  // Check retailer match (if provided)
  if (expectedRetailer && result.retailer) {
    if (
      !result.retailer.toLowerCase().includes(expectedRetailer.toLowerCase())
    ) {
      reasons.push('Retailer mismatch');
    }
  }

  // Check purchase date (not in future, not too old)
  if (result.purchaseDate) {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (result.purchaseDate > now) {
      reasons.push('Purchase date is in the future');
    }

    if (result.purchaseDate < sixMonthsAgo) {
      reasons.push('Purchase date is more than 6 months old');
    }
  }

  return {
    isFraudulent: reasons.length > 0,
    reasons,
  };
}

/**
 * Calculate verification score (0-100)
 */
export function calculateVerificationScore(
  result: ReceiptParsingResult
): number {
  let score = 0;

  // Base confidence (0-40 points)
  score += result.confidence * 40;

  // Book title match (0-20 points)
  if (result.bookTitle && result.bookTitle.toLowerCase().includes('ai-born')) {
    score += 20;
  }

  // Retailer detected (0-15 points)
  if (result.retailer) {
    score += 15;
  }

  // Amount in valid range (0-15 points)
  if (result.amount !== null && result.amount > 0 && result.amount < 200) {
    score += 15;
  }

  // Purchase date valid (0-10 points)
  if (result.purchaseDate && result.purchaseDate <= new Date()) {
    score += 10;
  }

  return Math.min(100, Math.round(score));
}
