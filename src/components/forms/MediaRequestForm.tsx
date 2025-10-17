'use client';

import * as React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Send, Loader2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { trackEvent } from '@/lib/analytics';
import { submitMediaRequest, getErrorMessage } from '@/lib/api';
import { mediaRequestSchema, type MediaRequestFormData } from '@/types/forms';

// ============================================================================
// Constants
// ============================================================================

const REQUEST_TYPES = [
  { value: 'galley', label: 'Advanced Reader Copy (ARC)' },
  { value: 'interview', label: 'Interview Request' },
  { value: 'review-copy', label: 'Review Copy' },
  { value: 'speaking', label: 'Speaking Engagement' },
  { value: 'partnership', label: 'Partnership Opportunity' },
  { value: 'other', label: 'Other' },
];

// ============================================================================
// Props Interface
// ============================================================================

interface MediaRequestFormProps {
  /** Optional callback on successful submission */
  onSuccess?: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Media request form component for press/journalist inquiries
 * Features: Honeypot spam detection, React Hook Form, Zod validation
 */
export function MediaRequestForm({ onSuccess }: MediaRequestFormProps) {
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const form = useForm<MediaRequestFormData>({
    resolver: zodResolver(mediaRequestSchema),
    defaultValues: {
      name: '',
      email: '',
      outlet: '',
      requestType: 'other',
      phone: '',
      message: '',
      deadline: '',
      honeypot: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  /**
   * Handle form submission
   */
  const onSubmit = async (data: MediaRequestFormData) => {
    try {
      setErrorMessage(null);

      // Check honeypot field for spam
      if (data.honeypot) {
        console.warn('Honeypot field filled - potential spam');
        // Silently fail for spam
        return;
      }

      // Map request type to analytics-compatible value
      const requestTypeMap: Record<string, 'galley' | 'interview' | 'review-copy' | 'speaking' | 'other'> = {
        'galley': 'galley',
        'interview': 'interview',
        'review-copy': 'review-copy',
        'speaking': 'speaking',
        'partnership': 'other',
        'other': 'other',
      };

      const analyticsRequestType = requestTypeMap[data.requestType] || 'other';

      // Track form submission attempt
      trackEvent({
        event: 'media_request_submit',
        request_type: analyticsRequestType,
      });

      // Submit to API
      const response = await submitMediaRequest({
        name: data.name,
        email: data.email,
        outlet: data.outlet,
        requestType: data.requestType,
        message: data.message,
      });

      if (response.success) {
        setIsSuccess(true);

        // Track successful submission
        trackEvent({
          event: 'media_request_submit',
          request_type: analyticsRequestType,
          success: true,
        });

        // Call onSuccess callback
        onSuccess?.();

        // Reset form after 7 seconds
        setTimeout(() => {
          form.reset();
          setIsSuccess(false);
        }, 7000);
      }
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);

      // Track submission error
      trackEvent({
        event: 'form_error',
        form_id: 'media-request',
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
              Request received!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-inter">
              Thank you for your interest. We'll get back to you within 1-2 business days.
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

                {/* Name field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your full name"
                          autoComplete="name"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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

                {/* Outlet field */}
                <FormField
                  control={form.control}
                  name="outlet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Outlet/Organization <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., The New York Times, TechCrunch"
                          autoComplete="organization"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone field (optional) */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          autoComplete="tel"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Request type dropdown */}
                <FormField
                  control={form.control}
                  name="requestType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Request Type <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select request type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {REQUEST_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Message textarea */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Message <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide details about your request..."
                          rows={5}
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum 20 characters. Please include any relevant details, deadlines, or
                        specific needs.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Deadline field (optional) */}
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        If you have a specific deadline for your request
                      </FormDescription>
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
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 size-4" />
                      Submit Request
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
