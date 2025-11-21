/**
 * VIP Code System — Type Definitions
 *
 * Centralized type definitions for VIP code system.
 * Import from Prisma for database types, extend here for API types.
 */

import { CodeType, CodeStatus, EntitlementType } from '@prisma/client';

/**
 * Export Prisma enums for convenience
 */
export { CodeType, CodeStatus, EntitlementType };

/**
 * Code generation request (admin API)
 */
export interface GenerateCodesRequest {
  count: number;
  type: CodeType;
  description?: string;
  maxRedemptions?: number;
  validFrom?: string; // ISO date string
  validUntil?: string; // ISO date string
  orgId?: string;
  format?: 'json' | 'csv';
}

/**
 * Code generation response
 */
export interface GenerateCodesResponse {
  success: true;
  count: number;
  codes: Array<{
    id: string;
    code: string;
    type: CodeType;
    validFrom: string;
    validUntil: string | null;
  }>;
}

/**
 * Code validation request (public API)
 */
export interface ValidateCodeRequest {
  code: string;
}

/**
 * Code validation response (valid)
 */
export interface ValidateCodeResponseValid {
  valid: true;
  code: {
    type: CodeType;
    redemptionsRemaining: number | null;
  };
}

/**
 * Code validation response (invalid)
 */
export interface ValidateCodeResponseInvalid {
  valid: false;
  error: string;
}

/**
 * Code validation response (union)
 */
export type ValidateCodeResponse =
  | ValidateCodeResponseValid
  | ValidateCodeResponseInvalid;

/**
 * Code list query parameters
 */
export interface ListCodesQuery {
  page?: number;
  limit?: number;
  type?: CodeType;
  status?: CodeStatus;
  search?: string;
  orgId?: string;
  includeStats?: boolean;
}

/**
 * Code list response
 */
export interface ListCodesResponse {
  success: true;
  data: {
    codes: Array<{
      id: string;
      code: string;
      type: CodeType;
      status: CodeStatus;
      description: string | null;
      maxRedemptions: number | null;
      redemptionCount: number;
      validFrom: string;
      validUntil: string | null;
      createdBy: string | null;
      createdAt: string;
      updatedAt: string;
      orgId: string | null;
      org: {
        id: string;
        name: string;
        type: string;
      } | null;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    stats?: CodeStatistics;
  };
}

/**
 * Code statistics
 */
export interface CodeStatistics {
  totalCodes: number;
  activeCount: number;
  redeemedCount: number;
  expiredCount: number;
  revokedCount: number;
  totalRedemptions: number;
  redemptionRate: number;
}

/**
 * Error response
 */
export interface ErrorResponse {
  error: string;
  message?: string;
  rateLimited?: boolean;
}

/**
 * Admin authentication result
 */
export interface AdminAuthResult {
  authorized: boolean;
  adminId?: string;
  error?: string;
  rateLimited?: boolean;
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  timestamp: Date;
  adminId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Code generation options (internal)
 */
export interface CodeGenerationOptions {
  count: number;
  type: CodeType;
  description?: string;
  maxRedemptions?: number;
  validFrom?: Date;
  validUntil?: Date;
  createdBy?: string;
  orgId?: string;
  entitlementTypes?: string[];
}

/**
 * Code validation result (internal)
 */
export interface CodeValidationResult {
  valid: boolean;
  code?: {
    id: string;
    code: string;
    type: CodeType;
    redemptionCount: number;
    maxRedemptions: number | null;
  };
  error?: string;
}

/**
 * Type guard: Check if validation response is valid
 */
export function isValidCodeResponse(
  response: ValidateCodeResponse
): response is ValidateCodeResponseValid {
  return response.valid === true;
}

/**
 * Type guard: Check if validation response is invalid
 */
export function isInvalidCodeResponse(
  response: ValidateCodeResponse
): response is ValidateCodeResponseInvalid {
  return response.valid === false;
}

/**
 * Code type labels (for UI display)
 */
export const CODE_TYPE_LABELS: Record<CodeType, string> = {
  VIP_PREVIEW: 'VIP Preview Access',
  VIP_BONUS: 'VIP Bonus Pack',
  VIP_LAUNCH: 'Launch Event Access',
  PARTNER: 'Partner Access',
  MEDIA: 'Media Access',
  INFLUENCER: 'Influencer Access',
};

/**
 * Code type descriptions
 */
export const CODE_TYPE_DESCRIPTIONS: Record<CodeType, string> = {
  VIP_PREVIEW: 'Early access to book excerpt and priority notifications',
  VIP_BONUS: 'Enhanced Agent Charter Pack and premium resources',
  VIP_LAUNCH: 'Exclusive launch event access and live Q&A',
  PARTNER: 'Partner organization benefits and bulk coordination',
  MEDIA: 'Review copy access and press kit resources',
  INFLUENCER: 'Creator resources and promotional materials',
};

/**
 * Code status labels (for UI display)
 */
export const CODE_STATUS_LABELS: Record<CodeStatus, string> = {
  ACTIVE: 'Active',
  REDEEMED: 'Redeemed',
  EXPIRED: 'Expired',
  REVOKED: 'Revoked',
};

/**
 * Code status colors (for UI badges)
 */
export const CODE_STATUS_COLORS: Record<
  CodeStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  ACTIVE: 'default',
  REDEEMED: 'secondary',
  EXPIRED: 'outline',
  REVOKED: 'destructive',
};

/**
 * Entitlement type mapping (code type → entitlement type)
 */
export const CODE_TO_ENTITLEMENT_MAP: Record<
  CodeType,
  EntitlementType | EntitlementType[]
> = {
  VIP_PREVIEW: 'EARLY_EXCERPT',
  VIP_BONUS: 'ENHANCED_BONUS',
  VIP_LAUNCH: 'LAUNCH_EVENT',
  PARTNER: ['BONUS_PACK', 'BULK_DISCOUNT'],
  MEDIA: ['EARLY_EXCERPT', 'PRIORITY_SUPPORT'],
  INFLUENCER: ['ENHANCED_BONUS', 'PRIORITY_SUPPORT'],
};

/**
 * Helper: Map code type to entitlement type(s)
 */
export function mapCodeTypeToEntitlements(type: CodeType): EntitlementType[] {
  const mapping = CODE_TO_ENTITLEMENT_MAP[type];
  return Array.isArray(mapping) ? mapping : [mapping];
}

/**
 * Helper: Format code for display (with separator)
 */
export function formatCodeDisplay(code: string, separator = '-'): string {
  if (code.length === 6) {
    return `${code.substring(0, 3)}${separator}${code.substring(3)}`;
  }
  return code;
}

/**
 * Helper: Normalize code input (remove spaces, hyphens, uppercase)
 */
export function normalizeCodeInput(code: string): string {
  return code.replace(/[\s-]/g, '').toUpperCase();
}

/**
 * Helper: Validate code format (6 alphanumeric characters)
 */
export function isValidCodeFormat(code: string): boolean {
  const normalized = normalizeCodeInput(code);
  return /^[A-Z0-9]{6}$/.test(normalized);
}

/**
 * CLI arguments for code generation script
 */
export interface CLIGenerationArgs {
  count?: number;
  type?: CodeType;
  description?: string;
  maxRedemptions?: number;
  validUntil?: string;
  orgId?: string;
  createdBy?: string;
  output?: string;
  format?: 'json' | 'csv';
  help?: boolean;
}
