/**
 * Cookie Consent Utility Functions
 *
 * This module provides utility functions for working with cookie consent
 * throughout the application. Re-exports from the main CookieConsent component
 * for better developer experience.
 */

export {
  useConsent,
  CookieConsent,
  CookieSettingsButton,
  type ConsentCategory,
  type ConsentPreferences,
} from '@/components/CookieConsent';

export {
  GTMConditional,
  pushGTMEvent,
  setGTMUserProperties,
} from '@/components/GTMConditional';

/**
 * Check if analytics tracking is allowed
 * Convenience function for common use case
 *
 * @example
 * if (canTrackAnalytics()) {
 *   trackEvent({ event: 'page_view' });
 * }
 */
export function canTrackAnalytics(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const stored = localStorage.getItem('ai-born-cookie-consent');
    if (!stored) return false;

    const preferences = JSON.parse(stored);
    return preferences.analytics === true;
  } catch {
    return false;
  }
}

/**
 * Check if marketing tracking is allowed
 * Convenience function for common use case
 *
 * @example
 * if (canTrackMarketing()) {
 *   loadFacebookPixel();
 * }
 */
export function canTrackMarketing(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const stored = localStorage.getItem('ai-born-cookie-consent');
    if (!stored) return false;

    const preferences = JSON.parse(stored);
    return preferences.marketing === true;
  } catch {
    return false;
  }
}

/**
 * Get current consent preferences
 * Returns null if no consent has been given yet
 *
 * @example
 * const prefs = getConsentPreferences();
 * if (prefs?.analytics) {
 *   // Track analytics
 * }
 */
export function getConsentPreferences() {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem('ai-born-cookie-consent');
    if (!stored) return null;

    return JSON.parse(stored);
  } catch {
    return null;
  }
}
