/**
 * File Upload Utilities
 * Handles secure file uploads to S3/R2 with validation and virus scanning
 */

import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import type {
  FileUploadValidation,
  StorageConfig,
  UploadOptions,
  DuplicateCheckResult,
} from '@/types/receipt';

/**
 * Maximum file size for receipt uploads (10MB)
 */
export const MAX_RECEIPT_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Allowed MIME types for receipt uploads
 */
export const ALLOWED_RECEIPT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
] as const;

/**
 * File extension mapping
 */
const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
};

/**
 * Storage client singleton
 */
let storageClient: S3Client | null = null;

/**
 * Get or create S3/R2 client
 */
function getStorageClient(): S3Client {
  if (storageClient) {
    return storageClient;
  }

  const config = getStorageConfig();

  storageClient = new S3Client({
    region: config.region || 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    // For Cloudflare R2, force path-style URLs
    forcePathStyle: config.endpoint?.includes('r2.cloudflarestorage.com'),
  });

  return storageClient;
}

/**
 * Get storage configuration from environment variables
 */
function getStorageConfig(): StorageConfig {
  // Check for R2 configuration first
  if (process.env.R2_BUCKET) {
    return {
      bucket: process.env.R2_BUCKET,
      endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      publicUrl: process.env.R2_PUBLIC_URL,
    };
  }

  // Fall back to S3 configuration
  if (process.env.AWS_S3_BUCKET) {
    return {
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      publicUrl: process.env.S3_PUBLIC_URL,
    };
  }

  throw new Error('Storage configuration not found. Set R2_BUCKET or AWS_S3_BUCKET environment variables.');
}

/**
 * Validate uploaded file
 */
export async function validateReceiptFile(
  fileBuffer: Buffer,
  declaredMimeType: string,
  fileSize: number
): Promise<FileUploadValidation> {
  // Validate file size
  if (fileSize > MAX_RECEIPT_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${MAX_RECEIPT_FILE_SIZE / (1024 * 1024)}MB`,
      size: fileSize,
    };
  }

  if (fileSize === 0) {
    return {
      valid: false,
      error: 'File is empty',
      size: fileSize,
    };
  }

  // Detect actual file type from buffer (prevents extension spoofing)
  const fileType = await fileTypeFromBuffer(fileBuffer);

  if (!fileType) {
    return {
      valid: false,
      error: 'Unable to determine file type. Please upload a valid image or PDF.',
    };
  }

  // Verify MIME type is allowed
  if (!ALLOWED_RECEIPT_MIME_TYPES.includes(fileType.mime as typeof ALLOWED_RECEIPT_MIME_TYPES[number])) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, and PDF files are allowed.',
      mimeType: fileType.mime,
    };
  }

  // Verify declared MIME type matches actual (with normalization)
  const normalizedDeclared = normalizeMimeType(declaredMimeType);
  const normalizedActual = normalizeMimeType(fileType.mime);

  if (normalizedDeclared !== normalizedActual) {
    return {
      valid: false,
      error: 'File content does not match the declared file type.',
      mimeType: fileType.mime,
    };
  }

  // Calculate file hash for duplicate detection
  const hash = calculateFileHash(fileBuffer);

  return {
    valid: true,
    mimeType: fileType.mime,
    extension: fileType.ext,
    size: fileSize,
    hash,
  };
}

/**
 * Normalize MIME type to handle variations
 */
function normalizeMimeType(mimeType: string): string {
  const normalized = mimeType.toLowerCase().trim();

  // Handle common variations
  if (normalized === 'image/jpg') {
    return 'image/jpeg';
  }

  return normalized;
}

/**
 * Calculate SHA-256 hash of file for duplicate detection
 */
export function calculateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Generate secure filename with timestamp and hash
 */
export function generateSecureFilename(
  originalName: string,
  mimeType: string,
  userId: string
): string {
  const timestamp = Date.now();
  const extension = MIME_TO_EXTENSION[mimeType] || 'bin';

  // Create unique identifier from user ID and timestamp
  const uniqueId = crypto
    .createHash('sha256')
    .update(`${userId}-${originalName}-${timestamp}-${Math.random()}`)
    .digest('hex')
    .substring(0, 16);

  return `receipt-${timestamp}-${uniqueId}.${extension}`;
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.+/g, '.')
    .replace(/^\.+/, '')
    .substring(0, 255);
}

/**
 * Upload file to S3/R2
 */
export async function uploadToStorage(
  fileBuffer: Buffer,
  filename: string,
  options: UploadOptions = {}
): Promise<string> {
  try {
    const config = getStorageConfig();
    const client = getStorageClient();

    // Construct full key with optional folder
    const key = options.folder
      ? `${options.folder}/${filename}`
      : filename;

    // Upload file
    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: options.contentType || 'application/octet-stream',
      Metadata: options.metadata || {},
      CacheControl: options.maxAge ? `max-age=${options.maxAge}` : undefined,
    });

    await client.send(command);

    // Construct public URL
    const fileUrl = constructFileUrl(config, key);

    return fileUrl;
  } catch (error) {
    console.error('Upload to storage failed:', error);
    throw new Error('Failed to upload file to storage');
  }
}

/**
 * Check if file exists in storage
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    const config = getStorageConfig();
    const client = getStorageClient();

    const command = new HeadObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });

    await client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Construct public URL for uploaded file
 */
function constructFileUrl(config: StorageConfig, key: string): string {
  // Use custom public URL if provided
  if (config.publicUrl) {
    return `${config.publicUrl}/${key}`;
  }

  // For R2, construct URL from endpoint
  if (config.endpoint?.includes('r2.cloudflarestorage.com')) {
    // This will need to be the public R2 domain, not the API endpoint
    // In production, you should set R2_PUBLIC_URL environment variable
    console.warn('R2_PUBLIC_URL not set. Using storage endpoint which may not be publicly accessible.');
    return `${config.endpoint}/${config.bucket}/${key}`;
  }

  // For S3, construct standard URL
  return `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`;
}

/**
 * Virus scanning placeholder
 * In production, integrate with ClamAV or a cloud scanning service
 */
export async function scanFileForVirus(fileBuffer: Buffer): Promise<boolean> {
  // TODO: Implement virus scanning
  // Options:
  // 1. ClamAV for self-hosted scanning
  // 2. VirusTotal API for cloud scanning
  // 3. AWS GuardDuty Malware Protection
  // 4. Cloudflare Zero Trust malware scanning

  // For now, perform basic checks

  // Check file size isn't suspiciously small or large
  if (fileBuffer.length < 100 || fileBuffer.length > MAX_RECEIPT_FILE_SIZE) {
    return false;
  }

  // Check for executable signatures in the first bytes
  const header = fileBuffer.slice(0, 4);
  const executableSignatures = [
    Buffer.from([0x4D, 0x5A]), // MZ (DOS/Windows executable)
    Buffer.from([0x7F, 0x45, 0x4C, 0x46]), // ELF (Linux executable)
  ];

  for (const signature of executableSignatures) {
    if (header.slice(0, signature.length).equals(signature)) {
      return false; // Executable detected
    }
  }

  return true; // Passed basic checks
}

/**
 * Image optimization for receipt images
 * Optionally compress large images to reduce storage costs
 */
export async function optimizeImage(
  fileBuffer: Buffer,
  mimeType: string
): Promise<Buffer> {
  // For MVP, return buffer as-is
  // In production, consider using sharp or similar library to:
  // 1. Compress images to reasonable quality
  // 2. Strip EXIF metadata (privacy)
  // 3. Convert to WebP for better compression

  // TODO: Implement image optimization
  // Example with sharp:
  // if (mimeType.startsWith('image/')) {
  //   return await sharp(fileBuffer)
  //     .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
  //     .jpeg({ quality: 85 })
  //     .toBuffer();
  // }

  return fileBuffer;
}

/**
 * Check for duplicate file by hash
 */
export async function checkDuplicateFile(
  fileHash: string,
  prismaClient: any // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<DuplicateCheckResult> {
  try {
    const existingReceipt = await prismaClient.receipt.findUnique({
      where: { fileHash },
      select: { id: true, userId: true },
    });

    if (existingReceipt) {
      return {
        isDuplicate: true,
        existingReceiptId: existingReceipt.id,
        existingUserId: existingReceipt.userId,
      };
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error('Duplicate check failed:', error);
    // Don't fail upload on duplicate check error
    return { isDuplicate: false };
  }
}

/**
 * Strip EXIF metadata from images for privacy
 */
export async function stripMetadata(
  fileBuffer: Buffer,
  mimeType: string
): Promise<Buffer> {
  // For images, strip EXIF data which may contain location, device info, etc.
  // For MVP, return buffer as-is
  // In production, use sharp or exiftool

  // TODO: Implement metadata stripping
  // Example with sharp:
  // if (mimeType.startsWith('image/')) {
  //   return await sharp(fileBuffer)
  //     .rotate() // Auto-rotate based on EXIF
  //     .withMetadata({ exif: {} }) // Strip EXIF
  //     .toBuffer();
  // }

  return fileBuffer;
}

/**
 * Validate storage configuration
 */
export function validateStorageConfig(): boolean {
  try {
    getStorageConfig();
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if storage is configured (for dev vs. production)
 */
export function isStorageConfigured(): boolean {
  return !!(process.env.R2_BUCKET || process.env.AWS_S3_BUCKET);
}

/**
 * Get storage provider name
 */
export function getStorageProvider(): 'r2' | 's3' | 'none' {
  if (process.env.R2_BUCKET) {
    return 'r2';
  }
  if (process.env.AWS_S3_BUCKET) {
    return 's3';
  }
  return 'none';
}
