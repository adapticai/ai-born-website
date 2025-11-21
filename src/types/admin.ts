/**
 * Admin Interface Types
 *
 * Type definitions for admin dashboard and receipt review queue
 */

import { ReceiptStatus, BonusClaimStatus } from '@prisma/client';

// ============================================================================
// RECEIPT REVIEW QUEUE
// ============================================================================

/**
 * Receipt review queue item
 */
export interface ReceiptReviewQueueItem {
  /** Receipt ID */
  id: string;
  /** User email */
  userEmail: string;
  /** Retailer name */
  retailer: string;
  /** Order number */
  orderNumber: string | null;
  /** Purchase date */
  purchaseDate: Date | null;
  /** Book format */
  format: string | null;
  /** Receipt file URL */
  fileUrl: string;
  /** Receipt status */
  status: ReceiptStatus;
  /** Uploaded at */
  createdAt: Date;
  /** Verification confidence score (0-1) */
  confidence: number | null;
  /** Manual review reason */
  manualReviewReason: string | null;
  /** Associated bonus claim ID */
  bonusClaimId: string | null;
  /** Bonus claim status */
  bonusClaimStatus: BonusClaimStatus | null;
}

/**
 * Receipt review filters
 */
export interface ReceiptReviewFilters {
  /** Filter by status */
  status?: ReceiptStatus[];
  /** Filter by retailer */
  retailer?: string[];
  /** Filter by date range */
  dateFrom?: Date;
  dateTo?: Date;
  /** Filter by confidence threshold */
  confidenceBelow?: number;
  /** Filter by manual review flag */
  requiresManualReview?: boolean;
  /** Search by user email */
  userEmail?: string;
  /** Search by order number */
  orderNumber?: string;
}

/**
 * Receipt review action
 */
export type ReceiptReviewAction = 'approve' | 'reject' | 'request_info';

/**
 * Receipt review decision
 */
export interface ReceiptReviewDecision {
  /** Receipt ID */
  receiptId: string;
  /** Action taken */
  action: ReceiptReviewAction;
  /** Admin user ID */
  adminId: string;
  /** Admin notes/reason */
  notes: string;
  /** Timestamp */
  timestamp: Date;
}

// ============================================================================
// ADMIN DASHBOARD STATS
// ============================================================================

/**
 * Receipt verification statistics
 */
export interface ReceiptVerificationStats {
  /** Total receipts uploaded */
  totalUploaded: number;
  /** Pending verification */
  pending: number;
  /** Verified */
  verified: number;
  /** Rejected */
  rejected: number;
  /** Requiring manual review */
  manualReview: number;
  /** Average confidence score */
  averageConfidence: number;
  /** Auto-verification rate (%) */
  autoVerificationRate: number;
  /** Verification time (median, in hours) */
  medianVerificationTime: number;
}

/**
 * Fraud detection statistics
 */
export interface FraudDetectionStats {
  /** Total fraud cases detected */
  totalFraudDetected: number;
  /** Fraud detection rate (%) */
  fraudDetectionRate: number;
  /** Common fraud patterns */
  commonPatterns: {
    pattern: string;
    count: number;
  }[];
  /** Fraud by retailer */
  byRetailer: {
    retailer: string;
    count: number;
  }[];
}

/**
 * Bonus claim statistics
 */
export interface BonusClaimStats {
  /** Total bonus claims */
  totalClaims: number;
  /** Claims by status */
  byStatus: {
    status: BonusClaimStatus;
    count: number;
  }[];
  /** Average processing time (hours) */
  averageProcessingTime: number;
  /** Delivery success rate (%) */
  deliverySuccessRate: number;
}

/**
 * Admin dashboard data
 */
export interface AdminDashboardData {
  /** Receipt verification stats */
  receiptStats: ReceiptVerificationStats;
  /** Fraud detection stats */
  fraudStats: FraudDetectionStats;
  /** Bonus claim stats */
  bonusClaimStats: BonusClaimStats;
  /** Recent activity */
  recentActivity: ReceiptReviewQueueItem[];
  /** Items requiring attention */
  attentionRequired: ReceiptReviewQueueItem[];
}

// ============================================================================
// ADMIN ACTIONS
// ============================================================================

/**
 * Admin action log entry
 */
export interface AdminActionLog {
  /** Log entry ID */
  id: string;
  /** Admin user ID */
  adminId: string;
  /** Action type */
  action: 'approve_receipt' | 'reject_receipt' | 'update_settings' | 'manual_bonus_delivery';
  /** Target entity ID */
  entityId: string;
  /** Entity type */
  entityType: 'receipt' | 'bonus_claim' | 'settings';
  /** Action details */
  details: Record<string, unknown>;
  /** Timestamp */
  timestamp: Date;
}

/**
 * Manual bonus pack delivery request
 */
export interface ManualBonusDeliveryRequest {
  /** Bonus claim ID */
  bonusClaimId: string;
  /** Delivery email (override) */
  deliveryEmail?: string;
  /** Admin notes */
  notes: string;
}

// ============================================================================
// RECEIPT METADATA
// ============================================================================

/**
 * Receipt verification metadata
 */
export interface ReceiptVerificationMetadata {
  /** OCR extraction result */
  ocrResult: {
    text: string;
    confidence: number;
    redactedText: string;
    piiDetected: string[];
  };
  /** LLM parsing result */
  parsingResult: {
    retailer: string | null;
    amount: number | null;
    currency: string | null;
    bookTitle: string | null;
    purchaseDate: Date | null;
    format: string | null;
    confidence: number;
  };
  /** Fraud detection result */
  fraudCheck: {
    isFraudulent: boolean;
    reasons: string[];
  };
  /** Verification score (0-100) */
  verificationScore: number;
  /** Processing timestamps */
  processing: {
    startedAt: Date;
    completedAt: Date | null;
    duration: number | null; // milliseconds
  };
}

// ============================================================================
// ADMIN PERMISSIONS
// ============================================================================

/**
 * Admin permission levels
 */
export enum AdminPermission {
  VIEW_RECEIPTS = 'view_receipts',
  APPROVE_RECEIPTS = 'approve_receipts',
  REJECT_RECEIPTS = 'reject_receipts',
  VIEW_BONUS_CLAIMS = 'view_bonus_claims',
  DELIVER_BONUS = 'deliver_bonus',
  VIEW_STATS = 'view_stats',
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_ADMIN_LOGS = 'view_admin_logs',
}

/**
 * Admin role definition
 */
export interface AdminRole {
  /** Role ID */
  id: string;
  /** Role name */
  name: string;
  /** Role permissions */
  permissions: AdminPermission[];
}

/**
 * Common admin roles
 */
export const ADMIN_ROLES: Record<string, AdminRole> = {
  VIEWER: {
    id: 'viewer',
    name: 'Viewer',
    permissions: [
      AdminPermission.VIEW_RECEIPTS,
      AdminPermission.VIEW_BONUS_CLAIMS,
      AdminPermission.VIEW_STATS,
    ],
  },
  REVIEWER: {
    id: 'reviewer',
    name: 'Reviewer',
    permissions: [
      AdminPermission.VIEW_RECEIPTS,
      AdminPermission.APPROVE_RECEIPTS,
      AdminPermission.REJECT_RECEIPTS,
      AdminPermission.VIEW_BONUS_CLAIMS,
      AdminPermission.VIEW_STATS,
    ],
  },
  ADMIN: {
    id: 'admin',
    name: 'Administrator',
    permissions: Object.values(AdminPermission),
  },
};
