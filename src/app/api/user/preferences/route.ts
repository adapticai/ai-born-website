/**
 * User Preferences API Route
 *
 * Handles retrieval and updates of user preferences.
 *
 * Endpoints:
 * - GET /api/user/preferences - Fetch current user preferences
 * - PUT /api/user/preferences - Update user preferences
 *
 * Features:
 * - Authentication required via getCurrentUser()
 * - Rate limiting (100 requests/hour for GET, 20 requests/hour for PUT)
 * - Zod validation for PUT requests
 * - JSONB storage in PostgreSQL
 * - Default preferences if none exist
 * - Proper error handling with status codes
 *
 * @module api/user/preferences
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  apiRateLimiter,
  getClientIP,
  getRateLimitHeaders,
} from "@/lib/ratelimit";
import {
  defaultUserPreferences,
  sanitizePreferences,
  type UserPreferences,
  type PreferencesResponse,
  type PreferencesErrorResponse,
} from "@/types/user";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Email notifications schema
 */
const emailNotificationsSchema = z.object({
  newsletter: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  productUpdates: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  bonusNotifications: z.boolean().optional(),
  launchEvents: z.boolean().optional(),
});

/**
 * Communication preferences schema
 */
const communicationPreferencesSchema = z.object({
  preferredChannel: z.enum(["email", "none"]).optional(),
  emailFrequency: z.enum(["immediate", "daily", "weekly", "never"]).optional(),
  mediaContact: z.boolean().optional(),
  bulkOrderContact: z.boolean().optional(),
});

/**
 * Complete preferences validation schema for PUT requests
 */
const updatePreferencesSchema = z.object({
  emailNotifications: emailNotificationsSchema.optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.enum(["en", "en-GB"]).optional(),
  communication: communicationPreferencesSchema.optional(),
});

// ============================================================================
// GET /api/user/preferences
// ============================================================================

/**
 * GET handler - Fetch user preferences
 *
 * Returns user preferences from database or default preferences if none exist.
 * Requires authentication.
 *
 * @returns {PreferencesResponse} User preferences object
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/user/preferences');
 * const data = await response.json();
 * console.log(data.preferences.theme); // "system"
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHORIZED",
          message: "Authentication required",
          statusCode: 401,
        } satisfies PreferencesErrorResponse,
        { status: 401 }
      );
    }

    // Rate limiting (100 requests/hour for reads)
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(
      `user-prefs-get:${user.id}:${clientIP}`,
      apiRateLimiter,
      { maxRequests: 100, windowMs: 60 * 60 * 1000, prefix: "ratelimit:user-prefs-get" }
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: `Too many requests. Please try again in ${rateLimitResult.reset} seconds.`,
          statusCode: 429,
        } satisfies PreferencesErrorResponse,
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Fetch user from database with preferences
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { preferences: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        {
          success: false,
          error: "USER_NOT_FOUND",
          message: "User not found",
          statusCode: 404,
        } satisfies PreferencesErrorResponse,
        { status: 404 }
      );
    }

    // Parse preferences from JSONB or use defaults
    let preferences: UserPreferences;

    if (dbUser.preferences && typeof dbUser.preferences === "object") {
      // Sanitize existing preferences to ensure they match schema
      preferences = sanitizePreferences(dbUser.preferences as Partial<UserPreferences>);
    } else {
      // Use default preferences if none exist
      preferences = defaultUserPreferences;
    }

    return NextResponse.json(
      {
        success: true,
        preferences,
      } satisfies PreferencesResponse,
      {
        status: 200,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error("[Preferences API] GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "Failed to fetch preferences",
        statusCode: 500,
      } satisfies PreferencesErrorResponse,
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/user/preferences
// ============================================================================

/**
 * PUT handler - Update user preferences
 *
 * Updates user preferences in database with validation.
 * Merges partial updates with existing preferences.
 * Requires authentication.
 *
 * @param request - Request with preferences in body
 * @returns {PreferencesResponse} Updated preferences
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/user/preferences', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     theme: 'dark',
 *     emailNotifications: { newsletter: true }
 *   })
 * });
 * ```
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHORIZED",
          message: "Authentication required",
          statusCode: 401,
        } satisfies PreferencesErrorResponse,
        { status: 401 }
      );
    }

    // Rate limiting (20 requests/hour for writes)
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(
      `user-prefs-put:${user.id}:${clientIP}`,
      apiRateLimiter,
      { maxRequests: 20, windowMs: 60 * 60 * 1000, prefix: "ratelimit:user-prefs-put" }
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: `Too many requests. Please try again in ${rateLimitResult.reset} seconds.`,
          statusCode: 429,
        } satisfies PreferencesErrorResponse,
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_JSON",
          message: "Invalid JSON in request body",
          statusCode: 400,
        } satisfies PreferencesErrorResponse,
        { status: 400 }
      );
    }

    // Validate with Zod schema
    const validationResult = updatePreferencesSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message: "Invalid preferences data",
          statusCode: 400,
        } satisfies PreferencesErrorResponse,
        { status: 400 }
      );
    }

    const updates = validationResult.data;

    // Fetch current preferences
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { preferences: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        {
          success: false,
          error: "USER_NOT_FOUND",
          message: "User not found",
          statusCode: 404,
        } satisfies PreferencesErrorResponse,
        { status: 404 }
      );
    }

    // Merge updates with existing preferences
    const currentPreferences =
      dbUser.preferences && typeof dbUser.preferences === "object"
        ? sanitizePreferences(dbUser.preferences as Partial<UserPreferences>)
        : defaultUserPreferences;

    const updatedPreferences: UserPreferences = {
      ...currentPreferences,
      ...updates,
      emailNotifications: {
        ...currentPreferences.emailNotifications,
        ...(updates.emailNotifications || {}),
      },
      communication: {
        ...currentPreferences.communication,
        ...(updates.communication || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    // Update in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        preferences: updatedPreferences as any, // Prisma Json type
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        preferences: updatedPreferences,
        message: "Preferences updated successfully",
      } satisfies PreferencesResponse,
      {
        status: 200,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error("[Preferences API] PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "Failed to update preferences",
        statusCode: 500,
      } satisfies PreferencesErrorResponse,
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS (CORS preflight)
// ============================================================================

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Allow": "GET, PUT, OPTIONS",
        "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
