/**
 * Receipt Upload Types
 * Type definitions for receipt verification system
 */

import { type BookFormat } from './index';

/**
 * Receipt upload status
 */
export enum ReceiptUploadStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  DUPLICATE = 'DUPLICATE',
}

/**
 * Receipt metadata
 */
export interface ReceiptMetadata {
  id: string;
  userId: string;
  retailer: string;
  orderNumber?: string;
  format?: BookFormat;
  purchaseDate?: string;
  status: ReceiptUploadStatus;
  fileUrl: string;
  fileHash: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Receipt upload request payload
 */
export interface ReceiptUploadRequest {
  retailer: string;
  orderNumber?: string;
  format?: BookFormat;
  purchaseDate?: string;
  file: File;
}

/**
 * Receipt upload response
 */
export interface ReceiptUploadResponse {
  success: boolean;
  message: string;
  data?: {
    receiptId: string;
    status: ReceiptUploadStatus;
    fileUrl?: string;
  };
  error?: string;
}

/**
 * File upload validation result
 */
export interface FileUploadValidation {
  valid: boolean;
  error?: string;
  mimeType?: string;
  extension?: string;
  size?: number;
  hash?: string;
}

/**
 * Upload progress event
 */
export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Receipt verification job payload
 */
export interface ReceiptVerificationJob {
  receiptId: string;
  fileUrl: string;
  retailer: string;
  orderNumber?: string;
  userId: string;
  createdAt: string;
}

/**
 * Receipt duplicate check result
 */
export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingReceiptId?: string;
  existingUserId?: string;
}

/**
 * S3/R2 upload configuration
 */
export interface StorageConfig {
  bucket: string;
  region?: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl?: string;
}

/**
 * Upload options for storage client
 */
export interface UploadOptions {
  folder?: string;
  metadata?: Record<string, string>;
  contentType?: string;
  maxAge?: number;
}
