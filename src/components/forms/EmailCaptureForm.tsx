'use client';

import * as React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Download, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';


import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { trackEvent } from '@/lib/analytics';
import { submitEmailCapture, getErrorMessage } from '@/lib/api';
import { emailCaptureSchema, type EmailCaptureFormData } from '@/types/forms';

// ============================================================================
// Props Interface
// ============================================================================

interface EmailCaptureFormProps {
  /** Form source for analytics tracking */
  source?: 'hero-excerpt' | 'bonus-section' | 'newsletter-footer' | 'popup' | 'other';
  /** Optional callback on successful submission */
  onSuccess?: (data: { downloadUrl?: string }) => void;
  /** Custom submit button text */
  submitText?: string;
  /** Show name field (optional) */
  showNameField?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Email capture form component for free excerpt downloads
 * Features: React Hook Form, Zod validation, analytics tracking
 */
export function EmailCaptureForm({
  source = 'other',
  onSuccess,
  submitText = 'Get Free Excerpt',
  showNameField = true,
}: EmailCaptureFormProps) {
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [downloadUrl, setDownloadUrl] = React.useState<string | undefined>();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const form = useForm<EmailCaptureFormData>({
    resolver: zodResolver(emailCaptureSchema),
    defaultValues: {
      name: '',
      email: '',
      honeypot: '',
      source,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  /**
   * Handle form submission
   */
  const onSubmit = async (data: EmailCaptureFormData) => {
    try {
      setErrorMessage(null);

      // Map source to analytics-compatible value
      const analyticsSource = source === 'other' ? 'popup' : source;

      // Track form submission attempt
      trackEvent({
        event: 'lead_capture_submit',
        source: analyticsSource,
      });

      // Submit to API
      const response = await submitEmailCapture({
        name: data.name || undefined,
        email: data.email,
        source: data.source,
      });

      if (response.success) {
        setIsSuccess(true);
        setDownloadUrl(response.data?.downloadUrl);

        // Track successful submission
        trackEvent({
          event: 'lead_capture_submit',
          source: analyticsSource,
          success: true,
        });

        // Call onSuccess callback
        onSuccess?.(response.data || {});

        // Reset form after 5 seconds
        setTimeout(() => {
          form.reset();
          setIsSuccess(false);
          setDownloadUrl(undefined);
        }, 5000);
      }
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);

      // Track submission error
      trackEvent({
        event: 'form_error',
        form_id: 'email-capture',
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
              Success! Check your email
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 font-inter">
              We've sent the free excerpt to your inbox. Check your email for the download link.
            </p>
            {downloadUrl && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none"
              >
                <a href={downloadUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 size-4" />
                  Download Now
                </a>
              </Button>
            )}
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

                {/* Name field (optional) */}
                {showNameField && (
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your name"
                            autoComplete="name"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Email field (required) */}
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
                      <Mail className="mr-2 size-4 animate-pulse" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 size-4" />
                      {submitText}
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
