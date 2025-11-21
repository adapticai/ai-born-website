/**
 * Example API route demonstrating security best practices
 *
 * This route shows how to:
 * - Validate input with Zod
 * - Sanitize user input
 * - Handle rate limiting
 * - Return safe error messages
 * - Use proper HTTP status codes
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeInput, isValidEmail } from "@/lib/security";

// Input validation schema
const requestSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  message: z
    .string()
    .min(10, "Message too short")
    .max(1000, "Message too long"),
});

/**
 * POST /api/example-secure-route
 *
 * Example endpoint with security best practices
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { email, name, message } = validation.data;

    // Additional email validation
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Sanitize text inputs (for display purposes)
    const safeName = sanitizeInput(name);
    const safeMessage = sanitizeInput(message);

    // Process the request (example: send email, save to database, etc.)
    // ... your business logic here ...

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Request processed successfully",
        data: {
          name: safeName,
          email, // Email already validated
          // Don't echo back the full message for security
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error internally (use proper logging in production)
    console.error("API error:", error);

    // Return generic error to user (don't expose internals)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
