/**
 * File Upload & Validation Utilities
 * Handles secure file uploads with MIME type validation
 */

import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Allowed file types for receipt uploads
 */
export const ALLOWED_RECEIPT_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/pdf': ['.pdf'],
} as const;

/**
 * Maximum file size (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Result of file validation
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  mimeType?: string;
  extension?: string;
}

/**
 * Validate file type by checking actual MIME type from file contents
 * This prevents extension spoofing attacks
 *
 * @param fileBuffer - File buffer to validate
 * @param declaredMimeType - MIME type declared by client
 * @returns Validation result
 */
export async function validateFileType(
  fileBuffer: Buffer,
  declaredMimeType: string
): Promise<FileValidationResult> {
  try {
    // Get actual MIME type from file contents
    const fileType = await fileTypeFromBuffer(fileBuffer);

    if (!fileType) {
      return {
        valid: false,
        error: 'Unable to determine file type. Please ensure the file is a valid image or PDF.',
      };
    }

    // Check if MIME type is allowed
    const allowedTypes = Object.keys(ALLOWED_RECEIPT_TYPES);
    if (!allowedTypes.includes(fileType.mime)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, and PDF files are allowed.',
      };
    }

    // Check if declared MIME type matches actual MIME type
    // Allow some flexibility for common variations (e.g., image/jpg vs image/jpeg)
    const normalizedDeclared = normalizeMimeType(declaredMimeType);
    const normalizedActual = normalizeMimeType(fileType.mime);

    if (normalizedDeclared !== normalizedActual) {
      return {
        valid: false,
        error: 'File content does not match the declared file type.',
      };
    }

    return {
      valid: true,
      mimeType: fileType.mime,
      extension: fileType.ext,
    };
  } catch (error: unknown) {
     
    console.error('File validation error:', error);
    return {
      valid: false,
      error: 'File validation failed. Please try again with a different file.',
    };
  }
}

/**
 * Normalize MIME type to handle common variations
 */
function normalizeMimeType(mimeType: string): string {
  const normalized = mimeType.toLowerCase().trim();
  // Handle image/jpg -> image/jpeg
  if (normalized === 'image/jpg') {
    return 'image/jpeg';
  }
  return normalized;
}

/**
 * Generate a unique filename with hash and timestamp
 *
 * @param originalName - Original filename
 * @param extension - File extension
 * @returns Unique filename
 */
export function generateUniqueFilename(originalName: string, extension: string): string {
  const timestamp = Date.now();
  const hash = crypto
    .createHash('sha256')
    .update(`${originalName}-${timestamp}-${Math.random()}`)
    .digest('hex')
    .substring(0, 16);

  return `receipt-${timestamp}-${hash}.${extension}`;
}

/**
 * Save file to disk
 *
 * @param fileBuffer - File buffer to save
 * @param filename - Filename to save as
 * @param uploadDir - Directory to save to (relative to public)
 * @returns Full path to saved file
 */
export async function saveFile(
  fileBuffer: Buffer,
  filename: string,
  uploadDir: string
): Promise<string> {
  try {
    // Ensure upload directory exists
    const fullUploadDir = path.join(process.cwd(), 'public', uploadDir);
    await fs.mkdir(fullUploadDir, { recursive: true });

    // Save file
    const fullPath = path.join(fullUploadDir, filename);
    await fs.writeFile(fullPath, fileBuffer);

    // Return relative path (for URL)
    return path.join(uploadDir, filename);
  } catch (error: unknown) {
     
    console.error('Error saving file:', error);
    throw new Error('Failed to save file');
  }
}

/**
 * Delete file from disk
 *
 * @param filePath - Relative path to file (from public directory)
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    await fs.unlink(fullPath);
  } catch (error: unknown) {
     
    console.error('Error deleting file:', error);
    // Don't throw error, just log it
  }
}

/**
 * Sanitize filename to prevent path traversal attacks
 *
 * @param filename - Filename to sanitize
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and other dangerous characters
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.+/g, '.')
    .substring(0, 255); // Limit filename length
}

/**
 * Validate file size
 *
 * @param size - File size in bytes
 * @returns Whether file size is valid
 */
export function validateFileSize(size: number): { valid: boolean; error?: string } {
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  if (size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    };
  }

  return { valid: true };
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return ext.startsWith('.') ? ext.substring(1) : ext;
}

/**
 * Calculate SHA-256 hash of file buffer for deduplication
 *
 * @param buffer - File buffer
 * @returns SHA-256 hash as hex string
 */
export function calculateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
