/**
 * VIP Code Generator
 *
 * Generates unique, human-readable alphanumeric codes for VIP access.
 * Excludes confusing characters (0/O, 1/I/l) for better readability.
 */

import { prisma } from '@/lib/prisma';
import { CodeType } from '@prisma/client';

/**
 * Characters excluded: 0, O, 1, I, l (to prevent confusion)
 * Remaining: 31 characters (A-Z except I,O + 2-9)
 */
const CODE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const CODE_LENGTH = 6;

/**
 * Generate a random alphanumeric code
 */
export function generateRandomCode(length: number = CODE_LENGTH): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * CODE_CHARS.length);
    code += CODE_CHARS[randomIndex];
  }
  return code;
}

/**
 * Format code for display (e.g., "ABC-123" or "ABC123")
 */
export function formatCode(code: string, withSeparator: boolean = false): string {
  if (withSeparator && code.length === 6) {
    return `${code.substring(0, 3)}-${code.substring(3)}`;
  }
  return code;
}

/**
 * Check if a code already exists in the database
 */
export async function codeExists(code: string): Promise<boolean> {
  const existing = await prisma.code.findUnique({
    where: { code },
  });
  return existing !== null;
}

/**
 * Generate a unique code by checking for collisions
 */
export async function generateUniqueCode(
  length: number = CODE_LENGTH,
  maxAttempts: number = 10
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateRandomCode(length);
    const exists = await codeExists(code);
    if (!exists) {
      return code;
    }
  }
  throw new Error(
    `Failed to generate unique code after ${maxAttempts} attempts. Database may be saturated.`
  );
}

/**
 * Batch generate unique codes
 */
export async function generateUniqueCodes(
  count: number,
  length: number = CODE_LENGTH
): Promise<string[]> {
  const codes: string[] = [];
  const codeSet = new Set<string>();

  // First pass: generate random codes
  while (codes.length < count) {
    const code = generateRandomCode(length);
    if (!codeSet.has(code)) {
      codeSet.add(code);
      codes.push(code);
    }
  }

  // Second pass: check database for collisions
  const existingCodes = await prisma.code.findMany({
    where: {
      code: { in: codes },
    },
    select: { code: true },
  });

  const existingSet = new Set(existingCodes.map((c) => c.code));

  // Replace collisions
  const finalCodes: string[] = [];
  for (const code of codes) {
    if (existingSet.has(code)) {
      // Generate a new unique code
      const replacement = await generateUniqueCode(length);
      finalCodes.push(replacement);
    } else {
      finalCodes.push(code);
    }
  }

  return finalCodes;
}

/**
 * Code generation options
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
  entitlementTypes?: string[]; // For future use with entitlements
}

/**
 * Generate and save VIP codes to database
 */
export async function generateAndSaveCodes(
  options: CodeGenerationOptions
): Promise<
  Array<{
    id: string;
    code: string;
    type: CodeType;
    validFrom: Date;
    validUntil: Date | null;
  }>
> {
  const {
    count,
    type,
    description,
    maxRedemptions,
    validFrom = new Date(),
    validUntil,
    createdBy,
    orgId,
  } = options;

  // Validate count
  if (count <= 0 || count > 10000) {
    throw new Error('Count must be between 1 and 10,000');
  }

  // Generate unique codes
  const codes = await generateUniqueCodes(count);

  // Batch insert
  const createdCodes = await prisma.$transaction(
    codes.map((code) =>
      prisma.code.create({
        data: {
          code,
          type,
          description,
          maxRedemptions,
          validFrom,
          validUntil,
          createdBy,
          orgId,
        },
        select: {
          id: true,
          code: true,
          type: true,
          validFrom: true,
          validUntil: true,
        },
      })
    )
  );

  return createdCodes;
}

/**
 * Validate a code and check if it can be redeemed
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

export async function validateCode(
  codeString: string
): Promise<CodeValidationResult> {
  // Normalize code (remove spaces, hyphens, convert to uppercase)
  const normalizedCode = codeString.replace(/[\s-]/g, '').toUpperCase();

  // Find code
  const code = await prisma.code.findUnique({
    where: { code: normalizedCode },
    select: {
      id: true,
      code: true,
      type: true,
      status: true,
      redemptionCount: true,
      maxRedemptions: true,
      validFrom: true,
      validUntil: true,
    },
  });

  if (!code) {
    return {
      valid: false,
      error: 'Code not found',
    };
  }

  // Check status
  if (code.status === 'REVOKED') {
    return {
      valid: false,
      error: 'Code has been revoked',
    };
  }

  if (code.status === 'EXPIRED') {
    return {
      valid: false,
      error: 'Code has expired',
    };
  }

  // Check validity period
  const now = new Date();
  if (code.validFrom > now) {
    return {
      valid: false,
      error: 'Code is not yet valid',
    };
  }

  if (code.validUntil && code.validUntil < now) {
    return {
      valid: false,
      error: 'Code has expired',
    };
  }

  // Check redemption limit
  if (
    code.maxRedemptions !== null &&
    code.redemptionCount >= code.maxRedemptions
  ) {
    return {
      valid: false,
      error: 'Code has reached maximum redemptions',
    };
  }

  return {
    valid: true,
    code: {
      id: code.id,
      code: code.code,
      type: code.type,
      redemptionCount: code.redemptionCount,
      maxRedemptions: code.maxRedemptions,
    },
  };
}

/**
 * Redeem a code (increment redemption count)
 */
export async function redeemCode(codeId: string): Promise<void> {
  await prisma.code.update({
    where: { id: codeId },
    data: {
      redemptionCount: { increment: 1 },
      updatedAt: new Date(),
    },
  });
}

/**
 * Export codes to CSV format
 */
export function exportCodesToCsv(
  codes: Array<{
    code: string;
    type: CodeType;
    validFrom: Date;
    validUntil: Date | null;
  }>
): string {
  const headers = ['Code', 'Type', 'Valid From', 'Valid Until'];
  const rows = codes.map((c) => [
    c.code,
    c.type,
    c.validFrom.toISOString(),
    c.validUntil?.toISOString() || 'Never',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Calculate code statistics
 */
export interface CodeStatistics {
  totalCodes: number;
  activeCount: number;
  redeemedCount: number;
  expiredCount: number;
  revokedCount: number;
  totalRedemptions: number;
  redemptionRate: number; // Percentage
}

export async function getCodeStatistics(
  type?: CodeType
): Promise<CodeStatistics> {
  const where = type ? { type } : {};

  const [total, byStatus, redemptions] = await Promise.all([
    prisma.code.count({ where }),
    prisma.code.groupBy({
      by: ['status'],
      where,
      _count: true,
    }),
    prisma.code.aggregate({
      where,
      _sum: {
        redemptionCount: true,
      },
    }),
  ]);

  const statusCounts = byStatus.reduce(
    (acc, item) => {
      acc[item.status] = item._count;
      return acc;
    },
    {
      ACTIVE: 0,
      REDEEMED: 0,
      EXPIRED: 0,
      REVOKED: 0,
    } as Record<string, number>
  );

  const totalRedemptions = redemptions._sum.redemptionCount || 0;

  return {
    totalCodes: total,
    activeCount: statusCounts.ACTIVE,
    redeemedCount: statusCounts.REDEEMED,
    expiredCount: statusCounts.EXPIRED,
    revokedCount: statusCounts.REVOKED,
    totalRedemptions,
    redemptionRate: total > 0 ? (totalRedemptions / total) * 100 : 0,
  };
}
