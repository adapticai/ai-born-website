'use client';

import * as React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Upload, FileCheck, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';


import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trackEvent } from '@/lib/analytics';
import { submitBonusClaim, getErrorMessage } from '@/lib/api';
import { bonusClaimSchema, type BonusClaimFormData } from '@/types/forms';

// ============================================================================
// Constants
// ============================================================================

const RETAILERS = [
  { value: 'amazon', label: 'Amazon' },
  { value: 'barnes-noble', label: 'Barnes & Noble' },
  { value: 'bookshop', label: 'Bookshop.org' },
  { value: 'target', label: 'Target' },
  { value: 'walmart', label: 'Walmart' },
  { value: 'indie', label: 'Independent Bookstore' },
  { value: 'other', label: 'Other' },
];

const FORMATS = [
  { value: 'hardcover', label: 'Hardcover' },
  { value: 'ebook', label: 'E-book' },
  { value: 'audiobook', label: 'Audiobook' },
];

// ============================================================================
// Props Interface
// ============================================================================

interface BonusClaimFormProps {
  /** Optional callback on successful submission */
  onSuccess?: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Bonus claim form component for Agent Charter Pack redemption
 * Features: File upload, progress indicator, React Hook Form, Zod validation
 */
export function BonusClaimForm({ onSuccess }: BonusClaimFormProps) {
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [selectedFileName, setSelectedFileName] = React.useState<string | null>(null);

  const form = useForm<BonusClaimFormData>({
    resolver: zodResolver(bonusClaimSchema),
    defaultValues: {
      email: '',
      orderId: '',
      retailer: '',
      format: 'hardcover',
      honeypot: '',
      acceptTerms: false,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  /**
   * Handle file input change
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      form.setValue('receipt', file);
      form.clearErrors('receipt');
    }
  };

  /**
   * Handle form submission
   */
  const onSubmit = async (data: BonusClaimFormData) => {
    try {
      setErrorMessage(null);
      setUploadProgress(0);

      // Validate file is present
      if (!data.receipt) {
        setErrorMessage('Please upload a receipt file');
        return;
      }

      // Create a simple hash of the order ID for analytics
      const hashString = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
      };

      // Track form submission attempt
      trackEvent({
        event: 'bonus_claim_submit',
        retailer: data.retailer,
        order_id_hash: hashString(data.orderId),
        receipt_uploaded: !!data.receipt,
      });

      // Simulate upload progress (in real implementation, use XMLHttpRequest or fetch with progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Submit to API
      const response = await submitBonusClaim(
        data.email,
        data.orderId,
        data.receipt,
        data.retailer
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        setIsSuccess(true);

        // Track successful submission
        trackEvent({
          event: 'bonus_claim_submit',
          retailer: data.retailer,
          order_id_hash: hashString(data.orderId),
          receipt_uploaded: !!data.receipt,
          success: true,
        });

        // Call onSuccess callback
        onSuccess?.();

        // Reset form after 7 seconds
        setTimeout(() => {
          form.reset();
          setIsSuccess(false);
          setSelectedFileName(null);
          setUploadProgress(0);
        }, 7000);
      }
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      setUploadProgress(0);

      // Track submission error
      trackEvent({
        event: 'form_error',
        form_id: 'bonus-claim',
        error_type: 'network',
      });
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 p-6 text-center rounded-none"
          >
            <CheckCircle2 className="mx-auto mb-3 size-12 text-black dark:text-white" />
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2 font-outfit tracking-tight">
              Claim submitted successfully!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-inter">
              Your bonus pack will arrive in your inbox within 24 hours. Check your email!
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Honeypot field - hidden from users */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  className="absolute left-[-9999px]"
                  aria-hidden="true"
                  {...form.register('honeypot')}
                />

                {/* Email field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Order ID field */}
                <FormField
                  control={form.control}
                  name="orderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Order ID <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 123-4567890-1234567"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Find this in your order confirmation email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Retailer dropdown */}
                <FormField
                  control={form.control}
                  name="retailer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Retailer <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select where you purchased" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {RETAILERS.map((retailer) => (
                            <SelectItem key={retailer.value} value={retailer.value}>
                              {retailer.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Format dropdown */}
                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Format <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select book format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FORMATS.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Receipt file upload */}
                <FormField
                  control={form.control}
                  name="receipt"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Receipt Upload <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                            className="cursor-pointer"
                          />
                          {selectedFileName && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <FileCheck className="size-4 text-black dark:text-white" />
                              <span>{selectedFileName}</span>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Max 5MB. Accepts JPG, PNG, WebP, or PDF
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Upload progress bar */}
                {isSubmitting && uploadProgress > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uploading...</span>
                      <span className="font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Terms acceptance checkbox */}
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={isSubmitting}
                          className="mt-1 size-4 rounded border-input"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          I confirm this is a valid receipt for AI-Born{' '}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Error message */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                    role="alert"
                  >
                    {errorMessage}
                  </motion.div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Submitting Claim...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 size-4" />
                      Submit Claim
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
