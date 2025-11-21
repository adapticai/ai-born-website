/**
 * Token Generation & Verification Utilities
 *
 * Provides secure JWT-based tokens for excerpt PDF downloads.
 * Tokens expire after 7 days and are signed using NEXTAUTH_SECRET.
 */

import crypto from 'crypto';

// ============================================================================
// Configuration
// ============================================================================

const TOKEN_SECRET = process.env.NEXTAUTH_SECRET || process.env.EXCERPT_TOKEN_SECRET;
const TOKEN_EXPIRY_DAYS = 7;
const TOKEN_ALGORITHM = 'HS256';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ExcerptTokenPayload {
  email: string;
  name?: string;
  source?: string;
  timestamp: number;
  expiresAt: number;
}

export interface TokenVerificationResult {
  valid: boolean;
  payload?: ExcerptTokenPayload;
  error?: 'expired' | 'invalid' | 'malformed' | 'missing_secret';
}

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Generate a signed token for excerpt PDF download
 *
 * @param email - User's email address
 * @param name - Optional user name
 * @param source - Optional source tracking parameter
 * @returns Signed JWT token valid for 7 days
 */
export function generateExcerptToken(
  email: string,
  name?: string,
  source?: string
): string {
  if (!TOKEN_SECRET) {
    throw new Error('TOKEN_SECRET not configured. Set NEXTAUTH_SECRET or EXCERPT_TOKEN_SECRET.');
  }

  const now = Date.now();
  const expiresAt = now + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 7 days

  const payload: ExcerptTokenPayload = {
    email,
    name,
    source,
    timestamp: now,
    expiresAt,
  };

  return createJWT(payload, TOKEN_SECRET);
}

/**
 * Create a simple JWT token
 *
 * @param payload - Token payload data
 * @param secret - Secret key for signing
 * @returns JWT token string
 */
function createJWT(payload: ExcerptTokenPayload, secret: string): string {
  // Create header
  const header = {
    alg: TOKEN_ALGORITHM,
    typ: 'JWT',
  };

  // Encode header and payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  // Create signature
  const signature = createSignature(
    `${encodedHeader}.${encodedPayload}`,
    secret
  );

  // Return complete token
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Create HMAC-SHA256 signature for JWT
 */
function createSignature(data: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  return base64UrlEncode(hmac.digest());
}

/**
 * Base64 URL-safe encoding
 */
function base64UrlEncode(input: string | Buffer): string {
  const buffer = typeof input === 'string' ? Buffer.from(input) : input;
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// ============================================================================
// Token Verification
// ============================================================================

/**
 * Verify and decode an excerpt token
 *
 * @param token - JWT token to verify
 * @returns Verification result with payload if valid
 */
export function verifyExcerptToken(token: string): TokenVerificationResult {
  if (!TOKEN_SECRET) {
    return {
      valid: false,
      error: 'missing_secret',
    };
  }

  try {
    // Split token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      return {
        valid: false,
        error: 'malformed',
      };
    }

    const [encodedHeader, encodedPayload, providedSignature] = parts;

    // Verify signature
    const expectedSignature = createSignature(
      `${encodedHeader}.${encodedPayload}`,
      TOKEN_SECRET
    );

    if (providedSignature !== expectedSignature) {
      return {
        valid: false,
        error: 'invalid',
      };
    }

    // Decode and parse payload
    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: ExcerptTokenPayload = JSON.parse(payloadJson);

    // Check expiration
    const now = Date.now();
    if (payload.expiresAt < now) {
      return {
        valid: false,
        error: 'expired',
        payload, // Return payload even if expired for logging
      };
    }

    // Token is valid
    return {
      valid: true,
      payload,
    };
  } catch (error) {
    // Log error for debugging
    console.error('[Token Verification Error]', error);

    return {
      valid: false,
      error: 'malformed',
    };
  }
}

/**
 * Base64 URL-safe decoding
 */
function base64UrlDecode(input: string): string {
  // Add padding if needed
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  if (padding > 0) {
    base64 += '='.repeat(4 - padding);
  }

  return Buffer.from(base64, 'base64').toString('utf8');
}

// ============================================================================
// Token Utilities
// ============================================================================

/**
 * Extract token from Authorization header or query parameter
 *
 * @param authHeader - Authorization header value
 * @param queryToken - Token from query parameter
 * @returns Extracted token or null
 */
export function extractToken(
  authHeader?: string | null,
  queryToken?: string | null
): string | null {
  // Check Authorization header first (Bearer token)
  if (authHeader) {
    const match = authHeader.match(/^Bearer (.+)$/);
    if (match) {
      return match[1];
    }
  }

  // Fall back to query parameter
  if (queryToken) {
    return queryToken;
  }

  return null;
}

/**
 * Check if a token is expired
 *
 * @param payload - Token payload
 * @returns True if token is expired
 */
export function isTokenExpired(payload: ExcerptTokenPayload): boolean {
  return payload.expiresAt < Date.now();
}

/**
 * Get time until token expiration
 *
 * @param payload - Token payload
 * @returns Milliseconds until expiration (negative if expired)
 */
export function getTimeUntilExpiry(payload: ExcerptTokenPayload): number {
  return payload.expiresAt - Date.now();
}

/**
 * Format token expiry as human-readable string
 *
 * @param payload - Token payload
 * @returns Human-readable expiry date
 */
export function formatTokenExpiry(payload: ExcerptTokenPayload): string {
  const expiryDate = new Date(payload.expiresAt);
  return expiryDate.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ============================================================================
// Newsletter Token Generation
// ============================================================================

export interface NewsletterTokenPayload {
  email: string;
  type: 'confirmation' | 'unsubscribe';
  timestamp: number;
  expiresAt: number;
}

/**
 * Generate a confirmation token for newsletter double opt-in
 * @param email - Subscriber's email address
 * @returns Signed JWT token valid for 7 days
 */
export function generateNewsletterConfirmationToken(email: string): string {
  if (!TOKEN_SECRET) {
    throw new Error('TOKEN_SECRET not configured. Set NEXTAUTH_SECRET or EXCERPT_TOKEN_SECRET.');
  }

  const now = Date.now();
  const expiresAt = now + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 7 days

  const payload: NewsletterTokenPayload = {
    email: email.toLowerCase(),
    type: 'confirmation',
    timestamp: now,
    expiresAt,
  };

  return createNewsletterJWT(payload, TOKEN_SECRET);
}

/**
 * Generate an unsubscribe token (never expires)
 * @param email - Subscriber's email address
 * @returns Signed JWT token
 */
export function generateNewsletterUnsubscribeToken(email: string): string {
  if (!TOKEN_SECRET) {
    throw new Error('TOKEN_SECRET not configured. Set NEXTAUTH_SECRET or EXCERPT_TOKEN_SECRET.');
  }

  const now = Date.now();
  // Unsubscribe tokens don't expire
  const expiresAt = now + 100 * 365 * 24 * 60 * 60 * 1000; // 100 years

  const payload: NewsletterTokenPayload = {
    email: email.toLowerCase(),
    type: 'unsubscribe',
    timestamp: now,
    expiresAt,
  };

  return createNewsletterJWT(payload, TOKEN_SECRET);
}

/**
 * Create a JWT token for newsletter operations
 */
function createNewsletterJWT(payload: NewsletterTokenPayload, secret: string): string {
  const header = {
    alg: TOKEN_ALGORITHM,
    typ: 'JWT',
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  const signature = createSignature(
    `${encodedHeader}.${encodedPayload}`,
    secret
  );

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify and decode a newsletter token
 * @param token - JWT token to verify
 * @returns Verification result with payload if valid
 */
export function verifyNewsletterToken(token: string): {
  valid: boolean;
  payload?: NewsletterTokenPayload;
  error?: 'expired' | 'invalid' | 'malformed' | 'missing_secret';
} {
  if (!TOKEN_SECRET) {
    return {
      valid: false,
      error: 'missing_secret',
    };
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return {
        valid: false,
        error: 'malformed',
      };
    }

    const [encodedHeader, encodedPayload, providedSignature] = parts;

    // Verify signature
    const expectedSignature = createSignature(
      `${encodedHeader}.${encodedPayload}`,
      TOKEN_SECRET
    );

    if (providedSignature !== expectedSignature) {
      return {
        valid: false,
        error: 'invalid',
      };
    }

    // Decode and parse payload
    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: NewsletterTokenPayload = JSON.parse(payloadJson);

    // Check expiration
    const now = Date.now();
    if (payload.expiresAt < now) {
      return {
        valid: false,
        error: 'expired',
        payload,
      };
    }

    return {
      valid: true,
      payload,
    };
  } catch (error) {
    console.error('[Newsletter Token Verification Error]', error);
    return {
      valid: false,
      error: 'malformed',
    };
  }
}

// ============================================================================
// Development & Testing Utilities
// ============================================================================

/**
 * Decode a token without verification (for debugging)
 * WARNING: Only use for debugging, does not verify signature
 */
export function decodeTokenUnsafe(token: string): ExcerptTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payloadJson = base64UrlDecode(parts[1]);
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}
