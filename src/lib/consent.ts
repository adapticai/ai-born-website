/**
 * Cookie Consent Management
 * Handles user consent for analytics/marketing cookies (GDPR/CCPA compliant)
 */

import { safeLocalStorage } from './utils';

// Consent storage key
const CONSENT_KEY = 'ai-born-cookie-consent';

// Consent types
export type ConsentType = 'analytics' | 'marketing' | 'functional';

export interface ConsentPreferences {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: number;
}

// Default consent state (opt-out by default for privacy)
const DEFAULT_CONSENT: ConsentPreferences = {
  analytics: false,
  marketing: false,
  functional: true, // Functional cookies are necessary
  timestamp: Date.now(),
};

/**
 * Get current consent preferences from localStorage
 */
export function getConsentPreferences(): ConsentPreferences {
  const stored = safeLocalStorage.getItem(CONSENT_KEY);

  if (!stored) {
    return DEFAULT_CONSENT;
  }

  try {
    return JSON.parse(stored) as ConsentPreferences;
  } catch (error) {
    console.error('Error parsing consent preferences:', error);
    return DEFAULT_CONSENT;
  }
}

/**
 * Save consent preferences to localStorage
 */
export function setConsentPreferences(preferences: Partial<ConsentPreferences>): void {
  const current = getConsentPreferences();
  const updated: ConsentPreferences = {
    ...current,
    ...preferences,
    timestamp: Date.now(),
  };

  safeLocalStorage.setItem(CONSENT_KEY, JSON.stringify(updated));

  // Trigger consent update event for GTM
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'consent_update',
      consent_preferences: updated,
    });
  }
}

/**
 * Check if user has given consent for a specific type
 */
export function hasConsent(type: ConsentType): boolean {
  const preferences = getConsentPreferences();
  return preferences[type] ?? false;
}

/**
 * Check if user has set consent preferences (not first visit)
 */
export function hasConsentBeenSet(): boolean {
  return safeLocalStorage.getItem(CONSENT_KEY) !== null;
}

/**
 * Grant all consent types
 */
export function grantAllConsent(): void {
  setConsentPreferences({
    analytics: true,
    marketing: true,
    functional: true,
  });
}

/**
 * Deny all optional consent types (keep functional)
 */
export function denyAllConsent(): void {
  setConsentPreferences({
    analytics: false,
    marketing: false,
    functional: true,
  });
}

/**
 * Clear consent preferences (reset to default)
 */
export function clearConsent(): void {
  safeLocalStorage.removeItem(CONSENT_KEY);
}

/**
 * Initialize GTM consent mode (Google Consent Mode v2)
 * Should be called before GTM loads
 */
export function initializeConsentMode(): void {
  if (typeof window === 'undefined') return;

  // Check if gtag is available (will be set by GTM)
  const gtag = (window as any).gtag;

  if (typeof gtag !== 'function') {
    // Queue consent commands for when gtag loads
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      functionality_storage: 'granted',
      personalization_storage: 'denied',
      security_storage: 'granted',
    });
  }

  // Apply existing consent if available
  const preferences = getConsentPreferences();
  if (hasConsentBeenSet()) {
    updateConsentMode(preferences);
  }
}

/**
 * Update GTM consent mode based on user preferences
 */
export function updateConsentMode(preferences: ConsentPreferences): void {
  if (typeof window === 'undefined') return;

  const gtag = (window as any).gtag;
  if (typeof gtag !== 'function') return;

  gtag('consent', 'update', {
    analytics_storage: preferences.analytics ? 'granted' : 'denied',
    ad_storage: preferences.marketing ? 'granted' : 'denied',
    ad_user_data: preferences.marketing ? 'granted' : 'denied',
    ad_personalization: preferences.marketing ? 'granted' : 'denied',
    functionality_storage: preferences.functional ? 'granted' : 'denied',
    personalization_storage: preferences.analytics ? 'granted' : 'denied',
  });
}
