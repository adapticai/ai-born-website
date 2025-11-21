/**
 * Rate Limiter Utility (Wrapper for main ratelimit module)
 *
 * This module provides backward compatibility for routes using the old API.
 * It wraps the new Upstash Redis rate limiting functionality.
 *
 * @deprecated Use @/lib/ratelimit directly for new code
 */

import {
  checkRateLimit as checkUpstashRateLimit,
  getClientIP as getUpstashClientIP,
  generalFormRateLimiter,
  type RateLimitResult as UpstashRateLimitResult,
} from '@/lib/ratelimit';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if a request should be rate limited
 *
 * This wraps the new Upstash rate limiter with backward compatible API.
 *
 * @param key - Unique identifier (typically IP address with prefix)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 *
 * @deprecated Use checkRateLimit from @/lib/ratelimit directly
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // Use the general form rate limiter with the config as fallback
  const result = await checkUpstashRateLimit(
    key,
    generalFormRateLimiter,
    {
      ...config,
      prefix: 'ratelimit:legacy',
    }
  );

  // Convert Upstash result format to legacy format
  // Upstash reset is in seconds from now, we need timestamp
  const resetTimestamp = Date.now() + (result.reset * 1000);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: resetTimestamp,
  };
}

/**
 * Get client IP address from request headers
 * Handles various proxy headers (Vercel, Cloudflare, etc.)
 *
 * @deprecated Use getClientIP from @/lib/ratelimit directly
 */
export function getClientIp(request: Request): string {
  return getUpstashClientIP(request);
}
