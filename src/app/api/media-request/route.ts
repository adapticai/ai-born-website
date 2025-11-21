import { type NextRequest, NextResponse } from "next/server";

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
import { sendMediaRequestNotification } from "@/lib/email";

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

    // Check rate limit (async with Upstash Redis)
    const rateLimitResult = await checkRateLimit(
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
      phone: data.phone ? sanitizeText(data.phone) : undefined,
      deadline: data.deadline,
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

    // Generate unique request ID
    const requestId = `MR-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Store submission in JSON file for tracking
    try {
      await storeSubmission("media-requests.json", { ...sanitizedData, requestId }, clientIp);
    } catch (error) {
      console.error("[STORAGE ERROR] Failed to store media request:", error);
      // Continue even if storage fails
    }

    // Send email notification to PR team
    console.log(
      `[MEDIA REQUEST] Sending notification to PR team for request ${requestId}`
    );

    try {
      const emailResult = await sendMediaRequestNotification({
        ...sanitizedData,
        requestId,
        phone: sanitizedData.phone,
        deadline: sanitizedData.deadline,
      });

      if (!emailResult.success) {
        console.error(
          `[EMAIL ERROR] Failed to send PR notification for ${requestId}:`,
          emailResult.error
        );
        // Don't fail the request if email fails - we still have the data stored
        // TODO: Set up a retry queue or alert system for failed notifications
      } else {
        console.log(
          `[EMAIL SUCCESS] PR notification sent for ${requestId} (Message ID: ${emailResult.messageId})`
        );
      }
    } catch (error) {
      console.error(
        `[EMAIL EXCEPTION] Exception while sending PR notification for ${requestId}:`,
        error
      );
      // Continue - the request data is stored, we can manually follow up
    }

    // Log structured data for monitoring
    console.log("=".repeat(80));
    console.log("[MEDIA REQUEST PROCESSED]");
    console.log("=".repeat(80));
    console.log(`Request ID: ${requestId}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`From IP: ${clientIp}`);
    console.log(`Name: ${sanitizedData.name}`);
    console.log(`Email: ${sanitizedData.email}`);
    console.log(`Outlet: ${sanitizedData.outlet}`);
    console.log(`Request Type: ${sanitizedData.requestType}`);
    if (sanitizedData.phone) {
      console.log(`Phone: ${sanitizedData.phone}`);
    }
    if (sanitizedData.deadline) {
      console.log(`Deadline: ${sanitizedData.deadline}`);
    }
    console.log(`Message:\n${sanitizedData.message}`);
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
          requestId,
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
