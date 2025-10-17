import { NextRequest, NextResponse } from "next/server";

import {
  mediaRequestSchema,
  type MediaRequestInput,
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
 * POST /api/media-request
 * Handle media request submissions
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // Check rate limit
    const rateLimitResult = checkRateLimit(
      `media-request:${clientIp}`,
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
    const validationResult = mediaRequestSchema.safeParse(body);

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

    const data = validationResult.data as MediaRequestInput;

    // Check honeypot field (anti-spam)
    if (data.honeypot && data.honeypot.trim() !== "") {
      // Silently reject spam submissions
      console.log(
        `[SPAM DETECTED] Media request from ${clientIp} - honeypot filled`
      );

      // Return success to not reveal spam detection
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          message:
            "Thank you for your request. We will review it and get back to you soon.",
        },
        { status: 200 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeText(data.name),
      email: sanitizeEmail(data.email),
      outlet: sanitizeText(data.outlet),
      requestType: data.requestType,
      message: sanitizeText(data.message),
    };

    // Check for suspicious content
    if (
      containsSuspiciousContent(sanitizedData.name) ||
      containsSuspiciousContent(sanitizedData.outlet) ||
      containsSuspiciousContent(sanitizedData.message)
    ) {
      console.log(
        `[SUSPICIOUS CONTENT] Media request from ${clientIp} - XSS attempt detected`
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

    // Store submission in JSON file for tracking
    try {
      await storeSubmission("media-requests.json", sanitizedData, clientIp);
    } catch (error) {
      console.error("[STORAGE ERROR] Failed to store media request:", error);
      // Continue even if storage fails
    }

    // TODO: Email service integration
    // For MVP: Log to console with structured format
    console.log("=".repeat(80));
    console.log("[MEDIA REQUEST RECEIVED]");
    console.log("=".repeat(80));
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`From IP: ${clientIp}`);
    console.log(`Name: ${sanitizedData.name}`);
    console.log(`Email: ${sanitizedData.email}`);
    console.log(`Outlet: ${sanitizedData.outlet}`);
    console.log(`Request Type: ${sanitizedData.requestType}`);
    console.log(`Message:\n${sanitizedData.message}`);
    console.log("=".repeat(80));
    console.log(
      "TODO: Integrate email service (SendGrid, Postmark, or Resend)"
    );
    console.log("TODO: Send to PR inbox (pr@adaptic.ai)");
    console.log(
      `TODO: Email subject: "Media Request: ${sanitizedData.requestType} from ${sanitizedData.outlet}"`
    );
    console.log("TODO: Consider CRM integration (HubSpot, Salesforce)");
    console.log("TODO: Setup notification webhooks (Slack, Discord)");
    console.log("=".repeat(80));

    // TODO: Track analytics event
    // trackEvent('media_request_submit', { requestType: sanitizedData.requestType })

    const processingTime = Date.now() - startTime;
    console.log(`[PERFORMANCE] Request processed in ${processingTime}ms`);

    // Return success response
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message:
          "Thank you for your request. We will review it and get back to you within 24 hours.",
        data: {
          requestId: `MR-${Date.now()}`,
          requestType: sanitizedData.requestType,
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
    console.error("[FATAL ERROR] Media request endpoint:", error);

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
