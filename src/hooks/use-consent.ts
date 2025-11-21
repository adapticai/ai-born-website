/**
 * React Hook for Cookie Consent Management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

import {
  getConsentPreferences,
  setConsentPreferences,
  hasConsent,
  hasConsentBeenSet,
  grantAllConsent,
  denyAllConsent,
  updateConsentMode,
  type ConsentPreferences,
  type ConsentType,
} from '@/lib/consent';

export interface UseConsentReturn {
  /** Current consent preferences */
  preferences: ConsentPreferences;
  /** Check if user has given consent for a specific type */
  hasConsent: (type: ConsentType) => boolean;
  /** Check if consent has been set (not first visit) */
  isConsentSet: boolean;
  /** Update consent preferences */
  updateConsent: (preferences: Partial<ConsentPreferences>) => void;
  /** Grant all consent types */
  acceptAll: () => void;
  /** Deny all optional consent types */
  rejectAll: () => void;
  /** Show consent banner (for reset) */
  showBanner: boolean;
  /** Set banner visibility */
  setShowBanner: (show: boolean) => void;
}

/**
 * Hook for managing cookie consent
 *
 * @example
 * const { preferences, hasConsent, acceptAll, rejectAll } = useConsent();
 *
 * if (hasConsent('analytics')) {
 *   // Load analytics scripts
 * }
 */
export function useConsent(): UseConsentReturn {
  const [preferences, setPreferences] = useState<ConsentPreferences>(() =>
    getConsentPreferences()
  );
  const [isConsentSet, setIsConsentSet] = useState<boolean>(() =>
    hasConsentBeenSet()
  );
  const [showBanner, setShowBanner] = useState<boolean>(false);

  // Initialize consent state on mount
  useEffect(() => {
    const currentPreferences = getConsentPreferences();
    setPreferences(currentPreferences);
    setIsConsentSet(hasConsentBeenSet());

    // Show banner if consent hasn't been set
    if (!hasConsentBeenSet()) {
      setShowBanner(true);
    }
  }, []);

  // Update consent preferences
  const updateConsent = useCallback((updates: Partial<ConsentPreferences>) => {
    setConsentPreferences(updates);
    const updated = getConsentPreferences();
    setPreferences(updated);
    setIsConsentSet(true);
    setShowBanner(false);

    // Update Google Consent Mode
    updateConsentMode(updated);
  }, []);

  // Accept all consent types
  const acceptAll = useCallback(() => {
    grantAllConsent();
    const updated = getConsentPreferences();
    setPreferences(updated);
    setIsConsentSet(true);
    setShowBanner(false);

    // Update Google Consent Mode
    updateConsentMode(updated);
  }, []);

  // Reject all optional consent types
  const rejectAll = useCallback(() => {
    denyAllConsent();
    const updated = getConsentPreferences();
    setPreferences(updated);
    setIsConsentSet(true);
    setShowBanner(false);

    // Update Google Consent Mode
    updateConsentMode(updated);
  }, []);

  // Check consent helper
  const checkConsent = useCallback((type: ConsentType): boolean => {
    return hasConsent(type);
  }, []);

  return {
    preferences,
    hasConsent: checkConsent,
    isConsentSet,
    updateConsent,
    acceptAll,
    rejectAll,
    showBanner,
    setShowBanner,
  };
}
