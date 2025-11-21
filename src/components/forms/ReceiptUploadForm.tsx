'use client';

/**
 * Receipt Upload Form Component
 * Drag-and-drop file upload with validation and preview
 */

import { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ReceiptUploadResponse } from '@/types/receipt';
import { trackEvent } from '@/lib/analytics';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Form validation schema
 */
const receiptUploadSchema = z.object({
  retailer: z.string().min(1, 'Please select a retailer'),
  orderNumber: z.string().optional(),
  format: z.enum(['hardcover', 'ebook', 'audiobook']).optional(),
  purchaseDate: z.string().optional(),
  file: z
    .instanceof(File, { message: 'Receipt file is required' })
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File must be less than 10MB')
    .refine(
      (file) =>
        ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type),
      'Only JPEG, PNG, and PDF files are allowed'
    ),
});

type ReceiptUploadFormData = z.infer<typeof receiptUploadSchema>;

/**
 * Retailer options
 */
const RETAILERS = [
  { value: 'amazon', label: 'Amazon' },
  { value: 'barnes-noble', label: 'Barnes & Noble' },
  { value: 'bookshop', label: 'Bookshop.org' },
  { value: 'apple-books', label: 'Apple Books' },
  { value: 'google-play', label: 'Google Play Books' },
  { value: 'kobo', label: 'Kobo' },
  { value: 'audible', label: 'Audible' },
  { value: 'other', label: 'Other' },
];

/**
 * Upload state
 */
type UploadState =
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  | { status: 'success'; receiptId: string }
  | { status: 'error'; message: string };

interface ReceiptUploadFormProps {
  onSuccess?: (receiptId: string) => void;
  onError?: (error: string) => void;
}

export function ReceiptUploadForm({ onSuccess, onError }: ReceiptUploadFormProps) {
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' });
  const [dragActive, setDragActive] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ReceiptUploadFormData>({
    resolver: zodResolver(receiptUploadSchema),
  });

  const selectedFile = watch('file');

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(
    (file: File) => {
      setValue('file', file, { shouldValidate: true });

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }

      // Track file selection
      trackEvent({
        event: 'bonus_claim_file_select',
        file_type: file.type,
        file_size: file.size,
      });
    },
    [setValue]
  );

  /**
   * Handle drag and drop
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    },
    [handleFileSelect]
  );

  /**
   * Remove selected file
   */
  const handleRemoveFile = useCallback(() => {
    setValue('file', undefined as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setValue]);

  /**
   * Submit form
   */
  const onSubmit = async (data: ReceiptUploadFormData) => {
    try {
      setUploadState({ status: 'uploading', progress: 0 });

      // Create FormData
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('retailer', data.retailer);
      if (data.orderNumber) {
        formData.append('orderNumber', data.orderNumber);
      }
      if (data.format) {
        formData.append('format', data.format);
      }
      if (data.purchaseDate) {
        formData.append('purchaseDate', data.purchaseDate);
      }

      // Track upload attempt
      trackEvent({
        event: 'bonus_claim_submit',
        retailer: data.retailer,
        format: data.format || 'unknown',
        receipt_uploaded: true,
        order_id_hash: data.orderNumber
          ? btoa(data.orderNumber).substring(0, 16)
          : 'none',
      });

      // Simulate progress (since fetch doesn't provide upload progress)
      const progressInterval = setInterval(() => {
        setUploadState((prev) =>
          prev.status === 'uploading'
            ? { ...prev, progress: Math.min(prev.progress + 10, 90) }
            : prev
        );
      }, 200);

      // Upload
      const response = await fetch('/api/receipts/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      const result: ReceiptUploadResponse = await response.json();

      if (result.success && result.data) {
        setUploadState({
          status: 'success',
          receiptId: result.data.receiptId,
        });

        // Track success
        trackEvent({
          event: 'bonus_claim_submit',
          retailer: data.retailer,
          receipt_uploaded: true,
          success: true,
          order_id_hash: data.orderNumber
            ? btoa(data.orderNumber).substring(0, 16)
            : 'none',
        });

        onSuccess?.(result.data.receiptId);

        // Reset form after delay
        setTimeout(() => {
          reset();
          setFilePreview(null);
          setUploadState({ status: 'idle' });
        }, 3000);
      } else {
        const errorMessage = result.message || 'Upload failed';
        setUploadState({ status: 'error', message: errorMessage });

        // Track error
        trackEvent({
          event: 'form_error',
          form_id: 'receipt-upload',
          error_type: (result.error as 'validation' | 'network' | 'server' | 'rate-limit' | 'unknown') || 'unknown',
        });

        onError?.(errorMessage);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = 'Upload failed. Please try again.';
      setUploadState({ status: 'error', message: errorMessage });

      trackEvent({
        event: 'form_error',
        form_id: 'receipt-upload',
        error_type: 'network',
      });

      onError?.(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* File Upload Drop Zone */}
      <div>
        <Label htmlFor="file-upload">Receipt Upload</Label>
        <div
          className={`mt-2 border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
            dragActive
              ? 'border-brand-cyan bg-brand-cyan/5'
              : errors.file
                ? 'border-red-500 bg-red-500/5'
                : 'border-gray-300 hover:border-brand-cyan/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-4">
              {/* File Preview */}
              {filePreview ? (
                <div className="relative inline-block">
                  <img
                    src={filePreview}
                    alt="Receipt preview"
                    className="max-h-48 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-12 w-12 text-brand-cyan" />
                  <div className="text-left">
                    <p className="font-medium text-brand-porcelain">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-brand-porcelain font-medium mb-2">
                Drop your receipt here, or click to browse
              </p>
              <p className="text-sm text-gray-400 mb-4">
                JPEG, PNG, or PDF • Max 10MB
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>
            </>
          )}

          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
        {errors.file && (
          <p className="mt-2 text-sm text-red-500">{errors.file.message}</p>
        )}
      </div>

      {/* Retailer Selection */}
      <div>
        <Label htmlFor="retailer">Retailer *</Label>
        <Select onValueChange={(value) => setValue('retailer', value)}>
          <SelectTrigger id="retailer" className="mt-2">
            <SelectValue placeholder="Select retailer" />
          </SelectTrigger>
          <SelectContent>
            {RETAILERS.map((retailer) => (
              <SelectItem key={retailer.value} value={retailer.value}>
                {retailer.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.retailer && (
          <p className="mt-2 text-sm text-red-500">{errors.retailer.message}</p>
        )}
      </div>

      {/* Order Number */}
      <div>
        <Label htmlFor="orderNumber">Order Number (Optional)</Label>
        <Input
          id="orderNumber"
          type="text"
          placeholder="e.g., 123-4567890-1234567"
          {...register('orderNumber')}
          className="mt-2"
        />
        {errors.orderNumber && (
          <p className="mt-2 text-sm text-red-500">{errors.orderNumber.message}</p>
        )}
      </div>

      {/* Book Format */}
      <div>
        <Label htmlFor="format">Book Format (Optional)</Label>
        <Select onValueChange={(value) => setValue('format', value as any)}> {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
          <SelectTrigger id="format" className="mt-2">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hardcover">Hardcover</SelectItem>
            <SelectItem value="ebook">eBook</SelectItem>
            <SelectItem value="audiobook">Audiobook</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Purchase Date */}
      <div>
        <Label htmlFor="purchaseDate">Purchase Date (Optional)</Label>
        <Input
          id="purchaseDate"
          type="date"
          {...register('purchaseDate')}
          className="mt-2"
        />
      </div>

      {/* Upload Progress */}
      {uploadState.status === 'uploading' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-brand-porcelain">Uploading...</span>
            <span className="text-brand-cyan">{uploadState.progress}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-cyan transition-all duration-300"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadState.status === 'success' && (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-green-500">Upload successful!</p>
            <p className="text-gray-400">
              We will verify your receipt within 24 hours.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {uploadState.status === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-red-500">Upload failed</p>
            <p className="text-gray-400">{uploadState.message}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={uploadState.status === 'uploading' || uploadState.status === 'success'}
      >
        {uploadState.status === 'uploading' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : uploadState.status === 'success' ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Uploaded
          </>
        ) : (
          'Upload Receipt'
        )}
      </Button>

      {/* Help Text */}
      <p className="text-xs text-gray-400 text-center">
        Your receipt will be verified within 24 hours. You will receive the Agent
        Charter Pack via email once verified.
      </p>
    </form>
  );
}
