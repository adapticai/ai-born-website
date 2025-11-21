'use client';

import * as React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Send, Loader2, Info } from 'lucide-react';
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
import { submitBulkOrder, getErrorMessage } from '@/lib/api';
import { bulkOrderSchema, type BulkOrderFormData } from '@/types/forms';

// ============================================================================
// Constants
// ============================================================================

const FORMATS = [
  { value: 'hardcover', label: 'Hardcover' },
  { value: 'ebook', label: 'E-book' },
  { value: 'audiobook', label: 'Audiobook' },
  { value: 'mixed', label: 'Mixed Formats' },
];

const REGIONS = [
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'EU', label: 'European Union' },
  { value: 'AU', label: 'Australia' },
  { value: 'other', label: 'Other' },
];

const DISTRIBUTION_STRATEGIES = [
  {
    value: 'single',
    label: 'Single retailer/location',
    description: 'Order from one retailer or store location (not NYT-eligible)',
  },
  {
    value: 'regional',
    label: 'Regional distribution',
    description: 'Multiple regional stores for distributed fulfillment',
  },
  {
    value: 'multi-store',
    label: 'Multi-store distribution (NYT-eligible)',
    description: 'Multiple retailers/locations across regions (supports NYT list eligibility)',
    recommended: true,
  },
];

const TIMELINES = [
  { value: 'rush-1-week', label: 'Rush (1 week)' },
  { value: '2-4-weeks', label: '2-4 weeks' },
  { value: '1-2-months', label: '1-2 months' },
  { value: '2-3-months', label: '2-3 months' },
  { value: 'flexible', label: 'Flexible timeline' },
];

// ============================================================================
// Props Interface
// ============================================================================

interface BulkOrderFormProps {
  /** Optional callback on successful submission */
  onSuccess?: () => void;
  /** Authenticated user data for auto-filling contact info */
  user?: {
    id: string;
    email?: string | null;
    name?: string | null;
  } | null;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Bulk order inquiry form component for corporate/institutional orders
 * Features: NYT-friendly distributed bulk orders, React Hook Form, Zod validation
 * Auto-fills contact info for authenticated users
 */
export function BulkOrderForm({ onSuccess, user }: BulkOrderFormProps) {
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const form = useForm<BulkOrderFormData>({
    resolver: zodResolver(bulkOrderSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      company: '',
      phone: '',
      quantity: 10,
      format: 'hardcover',
      distributionStrategy: 'multi-store',
      timeline: 'flexible',
      deliveryDate: '',
      region: 'US',
      message: '',
      customization: false,
      honeypot: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  /**
   * Handle form submission
   */
  const onSubmit = async (data: BulkOrderFormData) => {
    try {
      setErrorMessage(null);

      // Check honeypot field for spam
      if (data.honeypot) {
        console.warn('Honeypot field filled - potential spam');
        // Silently fail for spam
        return;
      }

      // Create quantity band for analytics
      const getQuantityBand = (qty: number): '<50' | '50-100' | '100-500' | '500-1000' | '1000+' => {
        if (qty < 50) return '<50';
        if (qty < 100) return '50-100';
        if (qty < 500) return '100-500';
        if (qty < 1000) return '500-1000';
        return '1000+';
      };

      // Track form submission attempt
      trackEvent({
        event: 'bulk_interest_submit',
        qty_band: getQuantityBand(data.quantity),
      });

      // Submit to API
      const response = await submitBulkOrder({
        name: data.name,
        email: data.email,
        company: data.company,
        phone: data.phone,
        quantity: data.quantity,
        format: data.format,
        distributionStrategy: data.distributionStrategy,
        timeline: data.timeline,
        region: data.region,
        customization: data.customization,
        message: data.message,
      });

      if (response.success) {
        setIsSuccess(true);

        // Track successful submission
        trackEvent({
          event: 'bulk_interest_submit',
          qty_band: getQuantityBand(data.quantity),
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
        form_id: 'bulk-order',
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
              Inquiry received!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-inter">
              Thank you for your interest in bulk orders. We'll contact you within 1-2 business
              days with pricing and options.
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

                <div className="grid gap-4 md:grid-cols-2">
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
                            placeholder="you@company.com"
                            autoComplete="email"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Company field */}
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Company/Organization <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your company name"
                            autoComplete="organization"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone field */}
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
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Quantity field */}
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Quantity <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={10}
                            max={100000}
                            placeholder="10"
                            disabled={isSubmitting}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 10)}
                          />
                        </FormControl>
                        <FormDescription>Minimum 10 copies</FormDescription>
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
                              <SelectValue placeholder="Select format" />
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
                </div>

                {/* Distribution Strategy - Full Width with explanations */}
                <FormField
                  control={form.control}
                  name="distributionStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Distribution Strategy <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select distribution strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DISTRIBUTION_STRATEGIES.map((strategy) => (
                            <SelectItem key={strategy.value} value={strategy.value}>
                              <div className="flex items-center gap-2">
                                {strategy.label}
                                {strategy.recommended && (
                                  <span className="text-xs text-brand-ember">(Recommended)</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {DISTRIBUTION_STRATEGIES.find((s) => s.value === field.value)?.description}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* NYT Eligibility Guidance */}
                {form.watch('distributionStrategy') === 'multi-store' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-md bg-brand-ember/10 border border-brand-ember/20 p-4"
                  >
                    <div className="flex gap-3">
                      <Info className="size-5 text-brand-ember flex-shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-brand-ember">
                          NYT Bestseller List Eligibility
                        </h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          Multi-store distribution supports New York Times bestseller list eligibility. Our team will coordinate:
                        </p>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-4 list-disc">
                          <li>Distributed purchases across multiple retailers and locations</li>
                          <li>Regional store partnerships for coordinated fulfillment</li>
                          <li>Multi-store invoicing that complies with NYT reporting standards</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Timeline dropdown */}
                  <FormField
                    control={form.control}
                    name="timeline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Timeline <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIMELINES.map((timeline) => (
                              <SelectItem key={timeline.value} value={timeline.value}>
                                {timeline.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Region dropdown */}
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Region <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {REGIONS.map((region) => (
                              <SelectItem key={region.value} value={region.value}>
                                {region.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Delivery date field */}
                  <FormField
                    control={form.control}
                    name="deliveryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desired Delivery Date (optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Customization checkbox */}
                <FormField
                  control={form.control}
                  name="customization"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
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
                          I'm interested in customization options
                        </FormLabel>
                        <FormDescription>
                          Such as bookplates, custom covers, or corporate branding
                        </FormDescription>
                      </div>
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
                          placeholder="Please provide details about your bulk order needs, timeline, and any special requirements..."
                          rows={5}
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum 20 characters. Include any specific requirements or questions.
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
                      Sending Inquiry...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 size-4" />
                      Submit Inquiry
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
