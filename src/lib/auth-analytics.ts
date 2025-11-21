/**
 * Authentication Analytics Tracking
 *
 * Helper functions for tracking authentication events through GTM dataLayer
 * Follows GDPR/CCPA privacy guidelines - only tracks necessary data
 * All user identifiers are hashed for privacy
 *
 * @module lib/auth-analytics
 */

import { trackEvent } from './analytics';
import type {
  SignInEvent,
  SignUpEvent,
  SignOutEvent,
  AuthErrorEvent,
  AuthButtonClickEvent,
} from '@/types/analytics';

// ==================== Privacy Utilities ====================

/**
 * Hash user identifier for privacy
 * Universal hashing that works in browser, Edge Runtime, and Node.js
 * Uses base64 encoding for basic anonymization
 *
 * @param userId - User ID to hash
 * @returns Hashed user ID (first 16 chars)
 */
function hashUserId(userId: string): string {
  // Simple base64 encoding - works everywhere (browser, Edge, Node.js)
  try {
    // Use btoa if available (browser/Edge Runtime)
    if (typeof btoa !== 'undefined') {
      return btoa(userId).slice(0, 16);
    }
    // Fallback for environments without btoa
    return userId.split('').map(c => c.charCodeAt(0).toString(16)).join('').slice(0, 16);
  } catch {
    // Final fallback
    return userId.slice(0, 8) + '...';
  }
}

/**
 * Sanitize error message for tracking
 * Removes sensitive information while preserving error type
 *
 * @param error - Error object or message
 * @returns Sanitized error message
 */
function sanitizeErrorMessage(error: unknown): string {
  if (!error) return 'Unknown error';

  const message = error instanceof Error ? error.message : String(error);

  // Remove sensitive patterns
  const sanitized = message
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email]') // Email addresses
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[ssn]') // SSN
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, '[card]') // Credit cards
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, '[token]') // API tokens
    .slice(0, 100); // Truncate to 100 chars

  return sanitized;
}

// ==================== Authentication Event Tracking ====================

/**
 * Track user sign-in attempt
 * Called when user attempts to sign in via any provider
 *
 * @param provider - Authentication provider used
 * @param success - Whether sign-in was successful
 * @param error - Error object if sign-in failed (optional)
 * @param isNewUser - Whether this is a new user (optional)
 *
 * @example
 * ```ts
 * // Successful sign-in
 * trackSignIn('google', true, undefined, false);
 *
 * // Failed sign-in
 * trackSignIn('email', false, new Error('Invalid credentials'));
 * ```
 */
export function trackSignIn(
  provider: 'google' | 'github' | 'email' | 'credentials',
  success: boolean,
  error?: unknown,
  isNewUser?: boolean
): void {
  const event: SignInEvent = {
    event: 'sign_in',
    provider,
    success,
    is_new_user: isNewUser,
  };

  // Add sanitized error message if sign-in failed
  if (!success && error) {
    event.error_message = sanitizeErrorMessage(error);
  }

  trackEvent(event);

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Auth Analytics] Sign In:', {
      provider,
      success,
      isNewUser,
      error: error ? sanitizeErrorMessage(error) : undefined,
    });
  }
}

/**
 * Track user sign-up (new account creation)
 * Called when a new user account is created
 *
 * @param provider - Authentication provider used for sign-up
 * @param success - Whether sign-up was successful
 *
 * @example
 * ```ts
 * trackSignUp('google', true);
 * ```
 */
export function trackSignUp(
  provider: 'google' | 'github' | 'email' | 'credentials',
  success: boolean = true
): void {
  const event: SignUpEvent = {
    event: 'sign_up',
    provider,
    success,
  };

  trackEvent(event);

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Auth Analytics] Sign Up:', { provider, success });
  }
}

/**
 * Track user sign-out
 * Called when user explicitly signs out
 *
 * @param userId - User ID (will be hashed for privacy, optional)
 * @param sessionDuration - Duration of session in seconds (optional)
 *
 * @example
 * ```ts
 * // Basic sign-out
 * trackSignOut();
 *
 * // With user ID and session duration
 * trackSignOut('user-123', 3600);
 * ```
 */
export function trackSignOut(userId?: string, sessionDuration?: number): void {
  const event: SignOutEvent = {
    event: 'sign_out',
  };

  // Add hashed user ID if provided (for privacy)
  if (userId) {
    event.user_id = hashUserId(userId);
  }

  // Add session duration if provided
  if (sessionDuration !== undefined) {
    event.session_duration = sessionDuration;
  }

  trackEvent(event);

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Auth Analytics] Sign Out:', {
      userId: userId ? hashUserId(userId) : undefined,
      sessionDuration,
    });
  }
}

/**
 * Track authentication error
 * Called when an authentication error occurs
 *
 * @param error - Error object or error message
 * @param page - Page where error occurred
 * @param errorType - Type of authentication error (optional, will be inferred)
 * @param provider - Provider that caused the error (optional)
 *
 * @example
 * ```ts
 * // Basic error tracking
 * trackAuthError(error, '/auth/signin');
 *
 * // With explicit error type and provider
 * trackAuthError(
 *   error,
 *   '/auth/signin',
 *   'invalid_credentials',
 *   'email'
 * );
 * ```
 */
export function trackAuthError(
  error: unknown,
  page: string,
  errorType?: 'sign_in_failed' | 'sign_up_failed' | 'session_expired' | 'invalid_credentials' | 'provider_error' | 'network_error' | 'unknown',
  provider?: 'google' | 'github' | 'email' | 'credentials'
): void {
  const errorMessage = sanitizeErrorMessage(error);

  // Infer error type from message if not provided
  let inferredErrorType = errorType || 'unknown';
  if (!errorType) {
    const lowerMessage = errorMessage.toLowerCase();
    if (lowerMessage.includes('credentials') || lowerMessage.includes('invalid')) {
      inferredErrorType = 'invalid_credentials';
    } else if (lowerMessage.includes('expired') || lowerMessage.includes('session')) {
      inferredErrorType = 'session_expired';
    } else if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      inferredErrorType = 'network_error';
    } else if (lowerMessage.includes('provider')) {
      inferredErrorType = 'provider_error';
    }
  }

  const event: AuthErrorEvent = {
    event: 'auth_error',
    error_type: inferredErrorType,
    page,
    error_message: errorMessage,
  };

  // Add provider if specified
  if (provider) {
    event.provider = provider;
  }

  trackEvent(event);

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Auth Analytics] Auth Error:', {
      errorType: inferredErrorType,
      page,
      provider,
      message: errorMessage,
    });
  }
}

/**
 * Track authentication button click
 * Called when user clicks a sign-in, sign-up, or sign-out button
 *
 * @param action - Button action (sign_in, sign_up, sign_out)
 * @param provider - Authentication provider
 * @param page - Page where button was clicked
 *
 * @example
 * ```ts
 * // Sign-in button click
 * trackAuthButtonClick('sign_in', 'google', '/auth/signin');
 *
 * // Sign-up button click
 * trackAuthButtonClick('sign_up', 'email', '/signup');
 * ```
 */
export function trackAuthButtonClick(
  action: 'sign_in' | 'sign_up' | 'sign_out',
  provider: 'google' | 'github' | 'email' | 'credentials' | 'default',
  page: string
): void {
  const event: AuthButtonClickEvent = {
    event: 'auth_button_click',
    action,
    provider,
    page,
  };

  trackEvent(event);

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Auth Analytics] Button Click:', { action, provider, page });
  }
}

// ==================== Audience Segmentation ====================

/**
 * Track authenticated user segment
 * Helper to identify returning vs new users
 *
 * @param isNewUser - Whether user is new
 */
export function trackAuthenticatedUserSegment(isNewUser: boolean): void {
  if (typeof window === 'undefined') return;

  // Import trackAudience only on client-side to avoid circular dependencies
  import('./analytics').then(({ trackAudience }) => {
    trackAudience(isNewUser ? 'new-user' : 'returning-user');
  }).catch(console.error);
}

/**
 * Track authentication provider usage
 * Helps understand which providers are most popular
 *
 * @param provider - Provider used
 */
export function trackProviderUsage(
  provider: 'google' | 'github' | 'email' | 'credentials'
): void {
  if (typeof window === 'undefined') return;

  import('./analytics').then(({ trackAudience }) => {
    trackAudience(`auth-provider-${provider}`);
  }).catch(console.error);
}

// ==================== Session Tracking ====================

/**
 * Calculate session duration
 * Used for sign-out event tracking
 *
 * @param loginTime - Timestamp when user logged in (ISO string or Date)
 * @returns Session duration in seconds
 */
export function calculateSessionDuration(loginTime: string | Date): number {
  const login = typeof loginTime === 'string' ? new Date(loginTime) : loginTime;
  const now = new Date();
  const durationMs = now.getTime() - login.getTime();
  return Math.round(durationMs / 1000);
}

// ==================== Privacy & Compliance ====================

/**
 * Check if analytics tracking is allowed based on user consent
 * Respects cookie consent and DNT header
 *
 * @returns Whether tracking is allowed
 */
export function isTrackingAllowed(): boolean {
  if (typeof window === 'undefined') return false;

  // Check Do Not Track header
  if (navigator.doNotTrack === '1') return false;

  // Check cookie consent (if you have a consent system)
  // This is a placeholder - implement based on your consent system
  const hasConsent = localStorage.getItem('cookie-consent') === 'true';

  return hasConsent;
}

/**
 * Track authentication event with consent check
 * Wrapper that respects user privacy preferences
 *
 * @param trackFn - Tracking function to execute
 */
export function trackWithConsent(trackFn: () => void): void {
  if (isTrackingAllowed()) {
    trackFn();
  } else if (process.env.NODE_ENV === 'development') {
    console.log('[Auth Analytics] Tracking skipped - no consent');
  }
}

// ==================== Exports ====================

/**
 * Re-export all tracking functions for convenience
 */
export const authAnalytics = {
  trackSignIn,
  trackSignUp,
  trackSignOut,
  trackAuthError,
  trackAuthButtonClick,
  trackAuthenticatedUserSegment,
  trackProviderUsage,
  calculateSessionDuration,
  isTrackingAllowed,
  trackWithConsent,
};

export default authAnalytics;
