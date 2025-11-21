/**
 * Newsletter Subscription Form Component
 *
 * Features:
 * - Double opt-in flow
 * - Interest-based segmentation (optional)
 * - Source tracking for analytics
 * - GDPR/CCPA compliant
 * - Accessible (WCAG 2.2 AA)
 * - Spam protection (honeypot field)
 *
 * Usage:
 * <NewsletterForm source="hero" />
 * <NewsletterForm source="footer" showInterests />
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { NewsletterSubscribeSchema } from '@/lib/validation';
import type { NewsletterSource, NewsletterInterest } from '@/types/newsletter';

// ============================================================================
// Component Props
// ============================================================================

interface NewsletterFormProps {
  /** Source of the form (for analytics tracking) */
  source?: NewsletterSource;
  /** Show interest selection checkboxes */
  showInterests?: boolean;
  /** Show name field */
  showName?: boolean;
  /** Custom submit button text */
  submitText?: string;
  /** Custom success message */
  successMessage?: string;
  /** Compact layout for footer/sidebar */
  compact?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Callback on successful subscription */
  onSuccess?: (email: string) => void;
}

// Explicitly define form data type to ensure source and interests are required
interface FormData {
  email: string;
  name?: string;
  source: NewsletterSource;
  interests: NewsletterInterest[];
  honeypot?: string;
}

// ============================================================================
// Interest Options
// ============================================================================

const INTEREST_OPTIONS: Array<{
  value: NewsletterInterest;
  label: string;
  description: string;
}> = [
  {
    value: 'launch-updates',
    label: 'Launch Updates',
    description: 'Pre-order news and release announcements',
  },
  {
    value: 'ai-native-org',
    label: 'AI-Native Organisation Design',
    description: 'Insights on building AI-first enterprises',
  },
  {
    value: 'governance',
    label: 'Governance & Trust',
    description: 'AI governance frameworks and best practices',
  },
  {
    value: 'agent-architecture',
    label: 'Agent Architecture',
    description: 'Technical patterns for autonomous systems',
  },
  {
    value: 'defensibility',
    label: 'Strategic Defensibility',
    description: 'Competitive moats in the AI age',
  },
  {
    value: 'speaking-events',
    label: 'Speaking Events',
    description: 'Author talks and workshops',
  },
];

// ============================================================================
// Newsletter Form Component
// ============================================================================

export function NewsletterForm({
  source = 'other',
  showInterests = false,
  showName = false,
  submitText = 'Subscribe',
  successMessage = 'Thanks! Check your email to confirm your subscription.',
  compact = false,
  className = '',
  onSuccess,
}: NewsletterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(NewsletterSubscribeSchema) as any,
    defaultValues: {
      source,
      interests: ['launch-updates'], // Default interest
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setSubmitStatus('error');
        setErrorMessage(
          result.message ||
            'Something went wrong. Please try again or contact support.'
        );
        return;
      }

      // Success
      setSubmitStatus('success');
      reset();

      // Track analytics event
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'newsletter_subscribed',
          source_referrer: source,
          success: true,
          book: 'ai-born',
          timestamp: new Date().toISOString(),
        });
      }

      // Callback
      if (onSuccess) {
        onSuccess(data.email);
      }
    } catch (error) {
      console.error('[Newsletter Form] Error:', error);
      setSubmitStatus('error');
      setErrorMessage(
        'Network error. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      {submitStatus === 'success' ? (
        <div
          className="rounded-lg border-2 border-brand-cyan bg-brand-cyan/10 p-4 text-center"
          role="alert"
          aria-live="polite"
        >
          <svg
            className="mx-auto mb-2 h-12 w-12 text-brand-cyan"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-brand-porcelain font-medium">{successMessage}</p>
          <p className="mt-1 text-sm text-brand-porcelain/70">
            Please check your inbox and confirm your subscription.
          </p>
          <button
            onClick={() => setSubmitStatus('idle')}
            className="mt-3 text-sm text-brand-cyan underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-brand-obsidian"
          >
            Subscribe another email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field (Optional) */}
          {showName && (
            <div>
              <label
                htmlFor="newsletter-name"
                className="mb-1 block text-sm font-medium text-brand-porcelain"
              >
                Name (optional)
              </label>
              <input
                id="newsletter-name"
                type="text"
                {...register('name')}
                className="w-full rounded-lg border border-brand-porcelain/20 bg-brand-obsidian px-4 py-2 text-brand-porcelain placeholder-brand-porcelain/40 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                placeholder="Your name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p
                  id="name-error"
                  className="mt-1 text-sm text-red-400"
                  role="alert"
                >
                  {errors.name.message}
                </p>
              )}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label
              htmlFor="newsletter-email"
              className="mb-1 block text-sm font-medium text-brand-porcelain"
            >
              Email address <span className="text-red-400">*</span>
            </label>
            <input
              id="newsletter-email"
              type="email"
              {...register('email')}
              className="w-full rounded-lg border border-brand-porcelain/20 bg-brand-obsidian px-4 py-2 text-brand-porcelain placeholder-brand-porcelain/40 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
              placeholder="you@example.com"
              required
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p
                id="email-error"
                className="mt-1 text-sm text-red-400"
                role="alert"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Interest Selection (Optional) */}
          {showInterests && (
            <div>
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-brand-porcelain">
                  What are you interested in? (optional)
                </legend>
                <div className="space-y-2">
                  {INTEREST_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-start gap-2 rounded-lg border border-brand-porcelain/10 p-3 transition-colors hover:border-brand-cyan/30 hover:bg-brand-cyan/5"
                    >
                      <input
                        type="checkbox"
                        value={option.value}
                        {...register('interests')}
                        className="mt-0.5 h-4 w-4 rounded border-brand-porcelain/30 bg-brand-obsidian text-brand-cyan focus:ring-2 focus:ring-brand-cyan/50 focus:ring-offset-2 focus:ring-offset-brand-obsidian"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-brand-porcelain">
                          {option.label}
                        </div>
                        <div className="text-xs text-brand-porcelain/60">
                          {option.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {/* Honeypot (Spam Protection) */}
          <input
            type="text"
            {...register('honeypot')}
            className="absolute left-[-9999px]"
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="off"
          />

          {/* Hidden Source Field */}
          <input type="hidden" {...register('source')} value={source} />

          {/* Error Message */}
          {submitStatus === 'error' && errorMessage && (
            <div
              className="rounded-lg border-2 border-red-400 bg-red-400/10 p-3 text-sm text-red-400"
              role="alert"
              aria-live="assertive"
            >
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full rounded-lg bg-brand-cyan px-6 py-3 font-semibold text-brand-obsidian
              transition-all duration-200
              hover:bg-brand-cyan/90 focus:outline-none focus:ring-2 focus:ring-brand-cyan
              focus:ring-offset-2 focus:ring-offset-brand-obsidian
              disabled:cursor-not-allowed disabled:opacity-50
              ${compact ? 'py-2 text-sm' : ''}
            `}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Subscribing...
              </span>
            ) : (
              submitText
            )}
          </button>

          {/* Privacy Notice */}
          <p className="text-xs text-brand-porcelain/50">
            By subscribing, you agree to receive occasional emails about AI-Born
            and related content. You can unsubscribe at any time.{' '}
            <a
              href="/privacy"
              className="text-brand-cyan underline hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
          </p>
        </form>
      )}
    </div>
  );
}

// ============================================================================
// Compact Variant (for footer/sidebar)
// ============================================================================

export function CompactNewsletterForm({
  source = 'footer',
  className = '',
}: {
  source?: NewsletterSource;
  className?: string;
}) {
  return (
    <NewsletterForm
      source={source}
      compact
      showInterests={false}
      showName={false}
      submitText="Subscribe"
      className={className}
    />
  );
}
