'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';

import { redeemVIPCode } from '@/lib/api';
import { VIPCodeRedemptionSchema, type VIPCodeRedemptionInput } from '@/lib/validation';
import {
  trackVIPCodeRedeemAttempt,
  trackVIPCodeRedeemSuccess,
  trackVIPCodeRedeemFailure,
  trackFormError,
  trackPageView,
} from '@/lib/analytics';

/**
 * User type from auth
 */
interface User {
  id?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

/**
 * VIP Code Redemption Form Component
 * Handles VIP code validation, submission, and success/error states
 *
 * Features:
 * - Auto-fills email for authenticated users
 * - Associates redemptions with user accounts
 * - Redirects to downloads page after successful redemption
 */
interface RedeemFormProps {
  user: User | null;
}

export function RedeemForm({ user }: RedeemFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{
    benefits: string[];
    expiresAt?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<VIPCodeRedemptionInput>({
    resolver: zodResolver(VIPCodeRedemptionSchema),
    defaultValues: {
      code: '',
      honeypot: '',
    },
  });

  // Track page view on mount
  useEffect(() => {
    trackPageView('/redeem', 'Redeem VIP Code');
  }, []);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: VIPCodeRedemptionInput) => {
    // Check honeypot
    if (data.honeypot && data.honeypot.length > 0) {
      return;
    }

    // Require authentication
    if (!user) {
      setErrorMessage('You must be logged in to redeem a VIP code. Please sign in and try again.');
      trackVIPCodeRedeemFailure('not_authenticated');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessData(null);

    // Track redemption attempt
    trackVIPCodeRedeemAttempt('valid');

    try {
      const response = await redeemVIPCode(data.code);

      if (response.success && response.data) {
        // Success - show benefits and redirect after 2 seconds
        setSuccessData(response.data);
        trackVIPCodeRedeemSuccess(response.data.benefits?.length);
        form.reset();

        // Redirect to downloads page after showing success message
        setTimeout(() => {
          router.push('/downloads');
        }, 2000);
      } else {
        // API returned error
        const message = response.message || 'Failed to redeem VIP code. Please try again.';
        setErrorMessage(message);
        trackVIPCodeRedeemFailure('server_error');
      }
    } catch (error: any) {
      // Handle different error types
      let failureReason: 'invalid_code' | 'expired' | 'already_used' | 'server_error' | 'not_authenticated' = 'server_error';
      let message = 'An unexpected error occurred. Please try again.';

      if (error.code === 'INVALID_CODE') {
        failureReason = 'invalid_code';
        message = 'This VIP code is not valid. Please check the code and try again.';
      } else if (error.code === 'CODE_EXPIRED') {
        failureReason = 'expired';
        message = 'This VIP code has expired. Please contact support for assistance.';
      } else if (error.code === 'CODE_ALREADY_USED') {
        failureReason = 'already_used';
        message = 'This VIP code has already been redeemed.';
      } else if (error.code === 'UNAUTHORIZED' || error.status === 401) {
        failureReason = 'not_authenticated';
        message = 'You must be logged in to redeem a VIP code. Please sign in and try again.';
      } else if (error.code === 'RATE_LIMIT') {
        message = 'Too many attempts. Please try again later.';
      } else if (error.message) {
        message = error.message;
      }

      setErrorMessage(message);
      trackVIPCodeRedeemFailure(failureReason);

      // Track form error
      trackFormError('vip-redeem', error.code === 'RATE_LIMIT' ? 'rate-limit' : 'server', 'code');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle validation errors
   */
  const onError = () => {
    trackFormError('vip-redeem', 'validation', 'code');
    trackVIPCodeRedeemAttempt('invalid');
  };

  return (
    <Card className="bg-brand-obsidian border-brand-cyan/20 mx-auto max-w-2xl">
      <CardHeader>
        <h2 className="text-center text-2xl font-semibold text-brand-porcelain">
          Enter Your VIP Code
        </h2>
        {user && (
          <p className="text-muted-foreground mt-2 text-center text-sm">
            Signed in as <span className="text-brand-cyan">{user.email}</span>
          </p>
        )}
        {!user && (
          <div className="bg-brand-ember/10 border-brand-ember/20 mt-4 rounded-lg border p-4">
            <p className="text-brand-ember text-center text-sm">
              You must be signed in to redeem a VIP code.{' '}
              <a
                href="/auth/signin?callbackUrl=/redeem"
                className="underline hover:no-underline"
              >
                Sign in now
              </a>
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {successData ? (
            <SuccessMessage
              key="success"
              benefits={successData.benefits}
              expiresAt={successData.expiresAt}
            />
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
                  {/* VIP Code Input */}
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VIP Code</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="ABC123"
                            className="text-center text-lg font-mono uppercase tracking-wider"
                            maxLength={6}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="characters"
                            spellCheck={false}
                            disabled={isSubmitting || !user}
                            onChange={(e) => {
                              // Convert to uppercase automatically
                              const value = e.target.value.toUpperCase();
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the 6-character code (letters and numbers only)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Honeypot Field (hidden from users) */}
                  <FormField
                    control={form.control}
                    name="honeypot"
                    render={({ field }) => (
                      <div className="hidden" aria-hidden="true">
                        <Input {...field} tabIndex={-1} autoComplete="off" />
                      </div>
                    )}
                  />

                  {/* Error Message */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-destructive/10 border-destructive/50 text-destructive rounded-lg border p-4 text-sm"
                      role="alert"
                    >
                      {errorMessage}
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || !user}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Redeeming...
                      </>
                    ) : !user ? (
                      'Sign in to Redeem'
                    ) : (
                      'Redeem Code'
                    )}
                  </Button>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

/**
 * Success Message Component
 * Displays benefits after successful redemption
 */
interface SuccessMessageProps {
  benefits: string[];
  expiresAt?: string;
}

function SuccessMessage({ benefits, expiresAt }: SuccessMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 text-center"
    >
      {/* Success Icon */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
        <svg
          className="h-8 w-8 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Success Message */}
      <div>
        <h3 className="mb-2 text-2xl font-bold text-brand-porcelain">
          Code Redeemed Successfully!
        </h3>
        <p className="text-muted-foreground">
          Your VIP benefits have been unlocked and are now active.
        </p>
        <p className="text-brand-cyan mt-2 text-sm">
          Redirecting to downloads page...
        </p>
      </div>

      {/* Benefits List */}
      {benefits && benefits.length > 0 && (
        <div className="text-left">
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-cyan">
            Unlocked Benefits
          </h4>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li
                key={index}
                className="text-muted-foreground flex items-start text-sm"
              >
                <span className="mr-2 text-brand-cyan">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expiration Notice */}
      {expiresAt && (
        <p className="text-muted-foreground text-xs">
          Benefits expire on {new Date(expiresAt).toLocaleDateString()}
        </p>
      )}
    </motion.div>
  );
}
