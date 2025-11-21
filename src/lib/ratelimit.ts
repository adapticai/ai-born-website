/**
 * Production-Grade Rate Limiting with Upstash Redis
 *
 * This module provides distributed rate limiting using Upstash Redis.
 * Falls back to in-memory rate limiting when Redis is not configured (development).
 *
 * Features:
 * - Distributed rate limiting across multiple instances
 * - Multiple algorithms: sliding window, token bucket, fixed window
 * - Automatic fallback to in-memory for development
 * - Comprehensive error handling
 * - Standard HTTP headers (X-RateLimit-*)
 * - TypeScript-first with full type safety
 *
 * Usage:
 * ```typescript
 * const result = await checkRateLimit(identifier, apiRateLimiter);
 * if (!result.success) {
 *   return NextResponse.json(
 *     { error: 'Rate limit exceeded' },
 *     {
 *       status: 429,
 *       headers: getRateLimitHeaders(result)
 *     }
 *   );
 * }
 * ```
 *
 * Environment Variables:
 * - UPSTASH_REDIS_REST_URL: Redis REST API URL from Upstash
 * - UPSTASH_REDIS_REST_TOKEN: Redis REST API token from Upstash
 *
 * @see https://upstash.com/docs/redis/features/ratelimiting
 */

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import type { NextRequest } from 'next/server';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Optional custom prefix for Redis keys */
  prefix?: string;
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Number of requests allowed in the window */
  limit: number;
  /** Number of requests remaining */
  remaining: number;
  /** Time until rate limit resets (in seconds) */
  reset: number;
  /** Whether the limit has been exceeded */
  limited: boolean;
  /** Optional pending promise for asynchronous operations */
  pending?: Promise<unknown>;
}

/**
 * In-memory rate limit store (fallback)
 */
interface InMemoryRateLimitStore {
  count: number;
  resetTime: number;
}

// ============================================================================
// REDIS CLIENT INITIALIZATION
// ============================================================================

/**
 * Check if Redis is configured
 */
function isRedisConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

/**
 * Initialize Upstash Redis client
 * Returns null if Redis is not configured (development mode)
 */
function createRedisClient(): Redis | null {
  if (!isRedisConfigured()) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[Rate Limit] Redis not configured. Using in-memory fallback. ' +
          'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production.'
      );
    }
    return null;
  }

  try {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  } catch (error) {
    console.error('[Rate Limit] Failed to initialize Redis client:', error);
    return null;
  }
}

/**
 * Global Redis client instance
 */
const redis = createRedisClient();

// ============================================================================
// RATE LIMITER INSTANCES
// ============================================================================

/**
 * Create a rate limiter instance with the given configuration
 *
 * Uses sliding window algorithm for accurate rate limiting.
 * Falls back to in-memory if Redis is not configured.
 *
 * @param config - Rate limit configuration
 * @returns Ratelimit instance or null (uses in-memory fallback)
 */
function createRateLimiter(config: RateLimitConfig): Ratelimit | null {
  if (!redis) {
    return null; // Use in-memory fallback
  }

  try {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        config.maxRequests,
        `${config.windowMs} ms`
      ),
      prefix: config.prefix || 'ratelimit',
      analytics: true, // Enable analytics for monitoring
    });
  } catch (error) {
    console.error('[Rate Limit] Failed to create rate limiter:', error);
    return null;
  }
}

/**
 * API Routes: 100 requests per hour
 * General protection for all API endpoints
 */
export const apiRateLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  prefix: 'ratelimit:api',
});

/**
 * Email Capture: 10 requests per hour
 * Prevents email harvesting and spam
 */
export const emailCaptureRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
  prefix: 'ratelimit:email',
});

/**
 * Code Redemption: 10 requests per hour
 * Prevents brute force attacks on redemption codes
 */
export const codeRedemptionRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
  prefix: 'ratelimit:code',
});

/**
 * File Uploads: 5 requests per hour
 * Prevents storage abuse and spam
 */
export const fileUploadRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  prefix: 'ratelimit:upload',
});

/**
 * File Downloads: 20 requests per hour
 * Prevents download abuse while allowing legitimate use
 */
export const fileDownloadRateLimiter = createRateLimiter({
  maxRequests: 20,
  windowMs: 60 * 60 * 1000, // 1 hour
  prefix: 'ratelimit:download',
});

/**
 * General Forms: 5 requests per hour
 * For contact forms, media requests, bulk orders
 */
export const generalFormRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  prefix: 'ratelimit:form',
});

// ============================================================================
// IN-MEMORY FALLBACK (Development)
// ============================================================================

/**
 * In-memory rate limit store (used when Redis is not available)
 */
const inMemoryStore = new Map<string, InMemoryRateLimitStore>();

/**
 * Clean up expired entries from in-memory store
 */
function cleanupInMemoryStore(now: number): void {
  const keysToDelete: string[] = [];

  inMemoryStore.forEach((entry, key) => {
    if (now > entry.resetTime) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => {
    inMemoryStore.delete(key);
  });
}

/**
 * Check rate limit using in-memory fallback
 */
function checkInMemoryRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = `${config.prefix || 'ratelimit'}:${identifier}`;

  // Clean up expired entries
  cleanupInMemoryStore(now);

  // Get or create rate limit entry
  let entry = inMemoryStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    inMemoryStore.set(key, entry);
  }

  // Check if limit exceeded
  const resetInSeconds = Math.ceil((entry.resetTime - now) / 1000);

  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: resetInSeconds,
      limited: true,
    };
  }

  // Increment counter
  entry.count++;
  const remaining = config.maxRequests - entry.count;

  return {
    success: true,
    limit: config.maxRequests,
    remaining,
    reset: resetInSeconds,
    limited: false,
  };
}

// ============================================================================
// MAIN RATE LIMITING FUNCTIONS
// ============================================================================

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (usually IP address)
 * @param limiter - Rate limiter instance from createRateLimiter
 * @param config - Rate limit configuration (required if limiter is null for fallback)
 * @returns Rate limit result
 *
 * @example
 * ```typescript
 * const result = await checkRateLimit(clientIP, emailCaptureRateLimiter);
 * if (!result.success) {
 *   return NextResponse.json(
 *     { error: 'Too many requests' },
 *     {
 *       status: 429,
 *       headers: getRateLimitHeaders(result)
 *     }
 *   );
 * }
 * ```
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit | null,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  // Use Upstash rate limiter if available
  if (limiter) {
    try {
      const result = await limiter.limit(identifier);

      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: Math.ceil((result.reset - Date.now()) / 1000),
        limited: !result.success,
        pending: result.pending,
      };
    } catch (error) {
      console.error('[Rate Limit] Upstash rate limit check failed:', error);
      // Fall through to in-memory fallback
    }
  }

  // In-memory fallback
  if (!config) {
    console.warn(
      '[Rate Limit] No config provided for in-memory fallback. Using default.'
    );
    config = {
      maxRequests: 100,
      windowMs: 60 * 60 * 1000,
      prefix: 'ratelimit:default',
    };
  }

  return checkInMemoryRateLimit(identifier, config);
}

/**
 * Get standard HTTP rate limit headers
 *
 * @param result - Rate limit check result
 * @returns Headers object with X-RateLimit-* headers
 *
 * @example
 * ```typescript
 * const result = await checkRateLimit(clientIP, apiRateLimiter);
 * const headers = getRateLimitHeaders(result);
 * return NextResponse.json(data, { headers });
 * ```
 */
export function getRateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
    ...(result.limited && { 'Retry-After': result.reset.toString() }),
  };
}

/**
 * Handle rate limit exceeded response
 *
 * @param result - Rate limit check result
 * @param customMessage - Optional custom error message
 * @returns Standard rate limit exceeded response
 *
 * @example
 * ```typescript
 * const result = await checkRateLimit(clientIP, emailCaptureRateLimiter);
 * if (!result.success) {
 *   return handleRateLimitExceeded(result, 'Too many email capture attempts');
 * }
 * ```
 */
export function handleRateLimitExceeded(
  result: RateLimitResult,
  customMessage?: string
): Response {
  const message =
    customMessage ||
    `Too many requests. Please try again in ${result.reset} seconds.`;

  return new Response(
    JSON.stringify({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message,
      retryAfter: result.reset,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...getRateLimitHeaders(result),
      },
    }
  );
}

// ============================================================================
// IP ADDRESS EXTRACTION
// ============================================================================

/**
 * Get client IP address from request headers
 *
 * Supports various proxy headers in order of preference:
 * 1. CF-Connecting-IP (Cloudflare)
 * 2. X-Real-IP (Nginx)
 * 3. X-Forwarded-For (Standard proxy header)
 *
 * @param request - Next.js request object
 * @returns Client IP address or 'unknown'
 *
 * @example
 * ```typescript
 * const clientIP = getClientIP(request);
 * const result = await checkRateLimit(clientIP, apiRateLimiter);
 * ```
 */
export function getClientIP(request: NextRequest | Request): string {
  // Cloudflare connecting IP (most reliable if using Cloudflare)
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // X-Real-IP (used by Nginx and other proxies)
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // X-Forwarded-For (can contain multiple IPs, take the first one)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // Fallback to 'unknown' if no IP found
  // In production, you might want to reject requests without IP
  return 'unknown';
}

/**
 * Get user identifier for rate limiting
 *
 * Uses authenticated user ID if available, otherwise falls back to IP address.
 * This allows for more accurate rate limiting for authenticated users.
 *
 * @param request - Next.js request object
 * @param userId - Optional authenticated user ID
 * @returns User identifier for rate limiting
 *
 * @example
 * ```typescript
 * const identifier = getUserIdentifier(request, session?.user?.id);
 * const result = await checkRateLimit(identifier, apiRateLimiter);
 * ```
 */
export function getUserIdentifier(
  request: NextRequest | Request,
  userId?: string | null
): string {
  if (userId) {
    return `user:${userId}`;
  }

  const ip = getClientIP(request);
  return `ip:${ip}`;
}

// ============================================================================
// MIDDLEWARE HELPER
// ============================================================================

/**
 * Rate limit middleware wrapper
 *
 * Automatically applies rate limiting to an API handler.
 *
 * @param handler - API route handler
 * @param limiter - Rate limiter instance
 * @param config - Fallback configuration for in-memory rate limiting
 * @returns Wrapped handler with rate limiting
 *
 * @example
 * ```typescript
 * export const POST = withRateLimit(
 *   async (request) => {
 *     // Your handler logic
 *     return NextResponse.json({ success: true });
 *   },
 *   emailCaptureRateLimiter,
 *   { maxRequests: 10, windowMs: 60 * 60 * 1000 }
 * );
 * ```
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>,
  limiter: Ratelimit | null,
  config?: RateLimitConfig
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest) => {
    const identifier = getClientIP(request);
    const result = await checkRateLimit(identifier, limiter, config);

    if (!result.success) {
      return handleRateLimitExceeded(result);
    }

    // Call the original handler
    const response = await handler(request);

    // Add rate limit headers to response
    const headers = new Headers(response.headers);
    Object.entries(getRateLimitHeaders(result)).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

// ============================================================================
// LEGACY EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================================================

/**
 * Legacy rate limit configuration (for backward compatibility)
 * @deprecated Use rate limiter instances instead (emailCaptureRateLimiter, etc.)
 */
export const EMAIL_CAPTURE_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 60 * 1000,
  prefix: 'ratelimit:email',
};

/**
 * @deprecated Use rate limiter instances instead
 */
export const BONUS_CLAIM_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60 * 60 * 1000,
  prefix: 'ratelimit:upload',
};

/**
 * @deprecated Use rate limiter instances instead
 */
export const GENERAL_FORM_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60 * 60 * 1000,
  prefix: 'ratelimit:form',
};

// ============================================================================
// DIAGNOSTICS & MONITORING
// ============================================================================

/**
 * Get rate limiter status (for health checks and monitoring)
 */
export function getRateLimiterStatus(): {
  redisConfigured: boolean;
  inMemoryStoreSize: number;
  mode: 'redis' | 'in-memory';
} {
  return {
    redisConfigured: isRedisConfigured(),
    inMemoryStoreSize: inMemoryStore.size,
    mode: redis ? 'redis' : 'in-memory',
  };
}

/**
 * Clear in-memory rate limit store (for testing)
 * @internal
 */
export function clearInMemoryStore(): void {
  inMemoryStore.clear();
}
