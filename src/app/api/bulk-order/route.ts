import { NextRequest, NextResponse } from "next/server";

import {
  bulkOrderSchema,
  type BulkOrderInput,
} from "@/lib/schemas/contact";
import {
  checkRateLimit,
  getClientIp,
  type RateLimitConfig,
} from "@/lib/utils/rate-limiter";
import {
  sanitizeText,
  sanitizeEmail,
  containsSuspiciousContent,
} from "@/lib/utils/sanitization";
import { storeSubmission } from "@/lib/utils/storage";

// Rate limit configuration: 5 requests per hour per IP
const RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
};

// CORS configuration
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://ai-born.org",
  "https://www.ai-born.org",
];

interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

/**
 * Get quantity band for analytics
 */
function getQuantityBand(quantity: number): string {
  if (quantity < 50) return "10-49";
  if (quantity < 100) return "50-99";
  if (quantity < 250) return "100-249";
  if (quantity < 500) return "250-499";
  if (quantity < 1000) return "500-999";
  return "1000+";
}

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") || "";

  if (ALLOWED_ORIGINS.includes(origin)) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  return new NextResponse(null, { status: 403 });
}

/**
 * POST /api/bulk-order
 * Handle bulk order inquiry submissions
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // Check rate limit
    const rateLimitResult = checkRateLimit(
      `bulk-order:${clientIp}`,
      RATE_LIMIT_CONFIG
    );

    if (!rateLimitResult.success) {
      const resetDate = new Date(rateLimitResult.reset);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Rate limit exceeded. Please try again later.",
          error: `Too many requests. Limit resets at ${resetDate.toISOString()}`,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
            "Retry-After": Math.ceil(
              (rateLimitResult.reset - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Invalid request body",
          error: "Request body must be valid JSON",
        },
        { status: 400 }
      );
    }

    // Validate with Zod schema
    const validationResult = bulkOrderSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Validation failed",
          error: errors.map((e) => `${e.field}: ${e.message}`).join(", "),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data as BulkOrderInput;

    // Check honeypot field (anti-spam)
    if (data.honeypot && data.honeypot.trim() !== "") {
      // Silently reject spam submissions
      console.log(
        `[SPAM DETECTED] Bulk order from ${clientIp} - honeypot filled`
      );

      // Return success to not reveal spam detection
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          message:
            "Thank you for your inquiry. We will review your request and contact you within 24-48 hours.",
        },
        { status: 200 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeText(data.name),
      email: sanitizeEmail(data.email),
      company: sanitizeText(data.company),
      quantity: data.quantity,
      message: sanitizeText(data.message),
    };

    // Check for suspicious content
    if (
      containsSuspiciousContent(sanitizedData.name) ||
      containsSuspiciousContent(sanitizedData.company) ||
      containsSuspiciousContent(sanitizedData.message)
    ) {
      console.log(
        `[SUSPICIOUS CONTENT] Bulk order from ${clientIp} - XSS attempt detected`
      );

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Invalid content detected",
          error: "Your submission contains invalid characters",
        },
        { status: 400 }
      );
    }

    // Get quantity band for analytics
    const quantityBand = getQuantityBand(sanitizedData.quantity);

    // Store submission in JSON file for tracking
    try {
      await storeSubmission(
        "bulk-orders.json",
        {
          ...sanitizedData,
          quantityBand,
        },
        clientIp
      );
    } catch (error) {
      console.error("[STORAGE ERROR] Failed to store bulk order:", error);
      // Continue even if storage fails
    }

    // TODO: Email service integration
    // For MVP: Log to console with structured format
    console.log("=".repeat(80));
    console.log("[BULK ORDER INQUIRY RECEIVED]");
    console.log("=".repeat(80));
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`From IP: ${clientIp}`);
    console.log(`Name: ${sanitizedData.name}`);
    console.log(`Email: ${sanitizedData.email}`);
    console.log(`Company: ${sanitizedData.company}`);
    console.log(`Quantity: ${sanitizedData.quantity} copies`);
    console.log(`Quantity Band: ${quantityBand}`);
    console.log(`Message:\n${sanitizedData.message}`);
    console.log("=".repeat(80));
    console.log(
      "TODO: Integrate email service (SendGrid, Postmark, or Resend)"
    );
    console.log("TODO: Send to sales inbox (sales@adaptic.ai)");
    console.log(
      `TODO: Email subject: "Bulk Order Inquiry: ${sanitizedData.company} (${sanitizedData.quantity} copies)"`
    );
    console.log("TODO: Consider CRM integration (HubSpot, Salesforce)");
    console.log(
      "TODO: Setup notification webhooks (Slack for high-value leads)"
    );
    console.log("TODO: Auto-route high-quantity orders to priority queue");
    console.log("=".repeat(80));

    // TODO: Track analytics event
    // trackEvent('bulk_interest_submit', { qty_band: quantityBand, quantity: sanitizedData.quantity })

    const processingTime = Date.now() - startTime;
    console.log(`[PERFORMANCE] Request processed in ${processingTime}ms`);

    // Return success response
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message:
          "Thank you for your inquiry. Our sales team will review your request and contact you within 24-48 hours to discuss pricing and fulfillment options.",
        data: {
          inquiryId: `BLK-${Date.now()}`,
          quantity: sanitizedData.quantity,
          quantityBand,
          estimatedResponseTime: "24-48 hours",
        },
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.reset.toString(),
        },
      }
    );
  } catch (error) {
    console.error("[FATAL ERROR] Bulk order endpoint:", error);

    // Don't expose internal errors to client
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Reject all other HTTP methods
 */
export async function GET() {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      message: "Method not allowed",
      error: "This endpoint only accepts POST requests",
    },
    {
      status: 405,
      headers: {
        Allow: "POST, OPTIONS",
      },
    }
  );
}
