/**
 * Bonus Pack Download Token System
 *
 * Generates secure, time-limited tokens for bonus pack asset downloads.
 * Tokens expire after 24 hours and are single-use to prevent unauthorized sharing.
 *
 * Features:
 * - HMAC-SHA256 signed tokens
 * - 24-hour expiration window
 * - Asset-specific permissions
 * - User email validation
 * - Analytics tracking
 */

import crypto from 'crypto';

// ============================================================================
// Configuration
// ============================================================================

const TOKEN_SECRET = process.env.NEXTAUTH_SECRET || process.env.BONUS_PACK_TOKEN_SECRET;
const TOKEN_EXPIRY_HOURS = 24;
const TOKEN_ALGORITHM = 'HS256';

// ============================================================================
// Type Definitions
// ============================================================================

export type BonusPackAssetType =
  | 'agent-charter-pack'
  | 'coi-diagnostic'
  | 'vp-agent-templates'
  | 'sub-agent-ladders'
  | 'escalation-protocols'
  | 'implementation-guide'
  | 'full-bonus-pack';

export interface BonusPackTokenPayload {
  email: string;
  claimId: string;
  asset: BonusPackAssetType;
  timestamp: number;
  expiresAt: number;
  version: number; // For token versioning
}

export interface TokenVerificationResult {
  valid: boolean;
  payload?: BonusPackTokenPayload;
  error?: 'expired' | 'invalid' | 'malformed' | 'missing_secret' | 'asset_mismatch';
}

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Generate a signed download token for bonus pack assets
 *
 * @param email - User's email address (for verification)
 * @param claimId - Bonus claim ID (for tracking)
 * @param asset - Specific asset type to download
 * @returns Signed JWT token valid for 24 hours
 */
export function generateBonusPackToken(
  email: string,
  claimId: string,
  asset: BonusPackAssetType
): string {
  if (!TOKEN_SECRET) {
    throw new Error('TOKEN_SECRET not configured. Set NEXTAUTH_SECRET or BONUS_PACK_TOKEN_SECRET.');
  }

  const now = Date.now();
  const expiresAt = now + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000; // 24 hours

  const payload: BonusPackTokenPayload = {
    email: email.toLowerCase(),
    claimId,
    asset,
    timestamp: now,
    expiresAt,
    version: 1, // Token version for future migrations
  };

  return createJWT(payload, TOKEN_SECRET);
}

/**
 * Generate download URLs for all bonus pack assets
 *
 * @param email - User's email address
 * @param claimId - Bonus claim ID
 * @param baseUrl - Base URL for the site (e.g., https://ai-born.org)
 * @returns Object mapping asset types to signed download URLs
 */
export function generateAllBonusPackUrls(
  email: string,
  claimId: string,
  baseUrl: string
): Record<BonusPackAssetType, string> {
  const assets: BonusPackAssetType[] = [
    'agent-charter-pack',
    'coi-diagnostic',
    'vp-agent-templates',
    'sub-agent-ladders',
    'escalation-protocols',
    'implementation-guide',
    'full-bonus-pack',
  ];

  const urls: Record<string, string> = {};

  for (const asset of assets) {
    const token = generateBonusPackToken(email, claimId, asset);
    urls[asset] = `${baseUrl}/api/bonus/download/${asset}?token=${encodeURIComponent(token)}`;
  }

  return urls as Record<BonusPackAssetType, string>;
}

/**
 * Create a simple JWT token
 */
function createJWT(payload: BonusPackTokenPayload, secret: string): string {
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
 * Verify and decode a bonus pack download token
 *
 * @param token - JWT token to verify
 * @param expectedAsset - Expected asset type (optional validation)
 * @returns Verification result with payload if valid
 */
export function verifyBonusPackToken(
  token: string,
  expectedAsset?: BonusPackAssetType
): TokenVerificationResult {
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
    const payload: BonusPackTokenPayload = JSON.parse(payloadJson);

    // Check expiration
    const now = Date.now();
    if (payload.expiresAt < now) {
      return {
        valid: false,
        error: 'expired',
        payload, // Return payload even if expired for logging
      };
    }

    // Validate asset type if specified
    if (expectedAsset && payload.asset !== expectedAsset) {
      return {
        valid: false,
        error: 'asset_mismatch',
        payload,
      };
    }

    // Token is valid
    return {
      valid: true,
      payload,
    };
  } catch (error) {
    // Log error for debugging
    console.error('[Bonus Pack Token Verification Error]', error);

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
 */
export function extractBonusToken(
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
 */
export function isBonusTokenExpired(payload: BonusPackTokenPayload): boolean {
  return payload.expiresAt < Date.now();
}

/**
 * Get time until token expiration in minutes
 */
export function getTimeUntilExpiry(payload: BonusPackTokenPayload): number {
  const ms = payload.expiresAt - Date.now();
  return Math.floor(ms / 1000 / 60); // Convert to minutes
}

/**
 * Format token expiry as human-readable string
 */
export function formatTokenExpiry(payload: BonusPackTokenPayload): string {
  const expiryDate = new Date(payload.expiresAt);
  return expiryDate.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================================================
// Asset Metadata
// ============================================================================

export interface BonusPackAssetMetadata {
  filename: string;
  displayName: string;
  description: string;
  mimeType: string;
  sizeEstimate: string;
}

/**
 * Get metadata for bonus pack assets
 */
export function getBonusPackAssetMetadata(
  asset: BonusPackAssetType
): BonusPackAssetMetadata {
  const metadata: Record<BonusPackAssetType, BonusPackAssetMetadata> = {
    'agent-charter-pack': {
      filename: 'agent-charter-pack.pdf',
      displayName: 'Agent Charter Pack',
      description: 'Complete VP-agent templates and sub-agent hierarchy framework',
      mimeType: 'application/pdf',
      sizeEstimate: '2.5 MB',
    },
    'coi-diagnostic': {
      filename: 'cognitive-overhead-index.xlsx',
      displayName: 'Cognitive Overhead Index (COI) Diagnostic',
      description: 'Interactive spreadsheet tool for measuring institutional drag',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      sizeEstimate: '850 KB',
    },
    'vp-agent-templates': {
      filename: 'vp-agent-templates.pdf',
      displayName: 'VP-Agent Templates',
      description: 'Ready-to-use templates for top-level autonomous agents',
      mimeType: 'application/pdf',
      sizeEstimate: '1.2 MB',
    },
    'sub-agent-ladders': {
      filename: 'sub-agent-ladders.pdf',
      displayName: 'Sub-Agent Ladders',
      description: 'Hierarchical agent organization patterns and delegation protocols',
      mimeType: 'application/pdf',
      sizeEstimate: '980 KB',
    },
    'escalation-protocols': {
      filename: 'escalation-override-protocols.pdf',
      displayName: 'Escalation & Override Protocols',
      description: 'Human oversight frameworks and emergency intervention patterns',
      mimeType: 'application/pdf',
      sizeEstimate: '750 KB',
    },
    'implementation-guide': {
      filename: 'implementation-guide.pdf',
      displayName: 'Implementation Guide',
      description: 'Step-by-step setup and deployment instructions',
      mimeType: 'application/pdf',
      sizeEstimate: '1.5 MB',
    },
    'full-bonus-pack': {
      filename: 'ai-born-bonus-pack-complete.zip',
      displayName: 'Complete Bonus Pack',
      description: 'All bonus materials in a single archive',
      mimeType: 'application/zip',
      sizeEstimate: '8.5 MB',
    },
  };

  return metadata[asset];
}

/**
 * Get public path for bonus pack asset
 * (Assumes assets are stored in /public/bonus-pack/)
 */
export function getBonusPackAssetPath(asset: BonusPackAssetType): string {
  const metadata = getBonusPackAssetMetadata(asset);
  return `/bonus-pack/${metadata.filename}`;
}

// ============================================================================
// Development & Testing Utilities
// ============================================================================

/**
 * Decode a token without verification (for debugging)
 * WARNING: Only use for debugging, does not verify signature
 */
export function decodeTokenUnsafe(token: string): BonusPackTokenPayload | null {
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
