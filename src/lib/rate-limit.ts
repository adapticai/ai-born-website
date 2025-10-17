/**
 * Rate Limiting Utility
 * Simple in-memory rate limiting for API endpoints
 *
 * For production, consider using:
 * - Redis for distributed rate limiting
 * - Upstash Rate Limit
 * - Vercel Edge Config with rate limiting
 */

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (resets on server restart)
const rateLimitStore = new Map<string, RateLimitStore>();

/**
 * Configuration for rate limiting
 */
interface RateLimitConfig {
  /** Maximum number of requests allowed */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

/**
 * Result of rate limit check
 */
export interface RateLimitResult {
  /** Whether the request should be allowed */
  allowed: boolean;
  /** Number of requests remaining */
  remaining: number;
  /** Time until rate limit resets (in seconds) */
  resetIn: number;
  /** HTTP status code to return if rate limited */
  statusCode: number;
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (usually IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;

  // Clean up expired entries (basic garbage collection)
  cleanupExpiredEntries(now);

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    const resetIn = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetIn,
      statusCode: 429,
    };
  }

  // Increment counter
  entry.count++;
  const remaining = config.maxRequests - entry.count;
  const resetIn = Math.ceil((entry.resetTime - now) / 1000);

  return {
    allowed: true,
    remaining,
    resetIn,
    statusCode: 200,
  };
}

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupExpiredEntries(now: number): void {
  const keysToDelete: string[] = [];

  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetTime) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => {
    rateLimitStore.delete(key);
  });
}

/**
 * Get client IP address from request headers
 * Supports various proxy headers
 */
export function getClientIP(request: Request): string {
  // Check various headers for IP address
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  // X-Forwarded-For can contain multiple IPs, take the first one
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback to 'unknown' if no IP found
  return 'unknown';
}

/**
 * Pre-configured rate limit for bonus claim endpoint
 * 3 requests per hour per IP
 */
export const BONUS_CLAIM_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
};

/**
 * Pre-configured rate limit for email capture endpoint
 * 10 requests per hour per IP
 */
export const EMAIL_CAPTURE_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
};

/**
 * Pre-configured rate limit for media/bulk requests
 * 5 requests per hour per IP
 */
export const GENERAL_FORM_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
};
