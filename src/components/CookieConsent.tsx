'use client';

import { useCallback, useEffect, useState } from 'react';

import { X } from 'lucide-react';

/**
 * Cookie Consent Types
 */
export type ConsentCategory = 'necessary' | 'analytics' | 'marketing';

export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  version: string;
}

/**
 * Local Storage Keys
 */
const STORAGE_KEY = 'ai-born-cookie-consent';
const CONSENT_VERSION = '1.0';

/**
 * Default consent preferences (necessary only)
 */
const DEFAULT_PREFERENCES: ConsentPreferences = {
  necessary: true, // Always true, cannot be disabled
  analytics: false,
  marketing: false,
  timestamp: Date.now(),
  version: CONSENT_VERSION,
};

/**
 * Hook to access and manage cookie consent state
 */
export function useConsent() {
  const [preferences, setPreferencesState] = useState<ConsentPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ConsentPreferences = JSON.parse(stored);

        // Check if version matches, otherwise reset
        if (parsed.version === CONSENT_VERSION) {
          setPreferencesState(parsed);
        } else {
          // Version mismatch - clear old consent
          localStorage.removeItem(STORAGE_KEY);
          setPreferencesState(null);
        }
      }
    } catch (error) {
      console.error('Failed to load cookie consent preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save consent preferences
   */
  const setPreferences = useCallback((newPreferences: Partial<ConsentPreferences>) => {
    const updatedPreferences: ConsentPreferences = {
      ...DEFAULT_PREFERENCES,
      ...newPreferences,
      necessary: true, // Always enforce necessary
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPreferences));
      setPreferencesState(updatedPreferences);

      // Trigger GTM update event
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'cookie_consent_update',
          consent_preferences: {
            analytics: updatedPreferences.analytics,
            marketing: updatedPreferences.marketing,
          },
        });
      }
    } catch (error) {
      console.error('Failed to save cookie consent preferences:', error);
    }
  }, []);

  /**
   * Accept all cookies
   */
  const acceptAll = useCallback(() => {
    setPreferences({
      analytics: true,
      marketing: true,
    });
  }, [setPreferences]);

  /**
   * Reject all non-necessary cookies
   */
  const rejectAll = useCallback(() => {
    setPreferences({
      analytics: false,
      marketing: false,
    });
  }, [setPreferences]);

  /**
   * Reset consent (clear stored preferences)
   */
  const resetConsent = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setPreferencesState(null);
    } catch (error) {
      console.error('Failed to reset cookie consent:', error);
    }
  }, []);

  /**
   * Check if a specific category is consented
   */
  const hasConsent = useCallback(
    (category: ConsentCategory): boolean => {
      if (!preferences) return category === 'necessary';
      return preferences[category] || false;
    },
    [preferences]
  );

  /**
   * Check if user has made a choice
   */
  const hasChoiceMade = preferences !== null;

  return {
    preferences,
    isLoading,
    hasChoiceMade,
    hasConsent,
    setPreferences,
    acceptAll,
    rejectAll,
    resetConsent,
  };
}

/**
 * Cookie Consent Banner Component Props
 */
interface CookieConsentProps {
  /**
   * URL to cookie policy page
   * @default "/privacy#cookies"
   */
  policyUrl?: string;

  /**
   * URL to privacy policy page
   * @default "/privacy"
   */
  privacyUrl?: string;

  /**
   * Position of the banner
   * @default "bottom"
   */
  position?: 'top' | 'bottom';

  /**
   * Custom className for the banner
   */
  className?: string;
}

/**
 * GDPR/CCPA Compliant Cookie Consent Banner
 *
 * Features:
 * - Displays on first visit before GTM loads
 * - Accept/Reject/Customize options
 * - Stores consent in localStorage
 * - Integrates with GTM
 * - Provides cookie policy link
 * - Accessibility features (keyboard nav, ARIA labels)
 * - Brand colors from CLAUDE.md
 * - Reduced motion support
 * - Persists preferences across sessions
 */
export function CookieConsent({
  policyUrl = '/privacy#cookies',
  privacyUrl = '/privacy',
  position = 'bottom',
  className = '',
}: CookieConsentProps) {
  const { hasChoiceMade, acceptAll, rejectAll, isLoading } = useConsent();
  const [showCustomize, setShowCustomize] = useState(false);
  const [customPrefs, setCustomPrefs] = useState({
    analytics: false,
    marketing: false,
  });
  const { setPreferences } = useConsent();

  // Don't render if already consented or still loading
  if (isLoading || hasChoiceMade) {
    return null;
  }

  /**
   * Handle accept all
   */
  const handleAcceptAll = () => {
    acceptAll();
  };

  /**
   * Handle reject all
   */
  const handleRejectAll = () => {
    rejectAll();
  };

  /**
   * Handle customize view toggle
   */
  const handleToggleCustomize = () => {
    setShowCustomize(!showCustomize);
  };

  /**
   * Handle save custom preferences
   */
  const handleSaveCustom = () => {
    setPreferences(customPrefs);
  };

  /**
   * Handle checkbox change
   */
  const handleCheckboxChange = (category: 'analytics' | 'marketing') => {
    setCustomPrefs(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (
    e: React.KeyboardEvent,
    action: () => void
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const positionClasses = position === 'top'
    ? 'top-0 left-0 right-0'
    : 'bottom-0 left-0 right-0';

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      aria-modal="true"
      className={`fixed ${positionClasses} z-50 ${className}`}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--brand-obsidian)]/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Banner Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--brand-slate-700)] bg-[var(--brand-obsidian)] p-6 shadow-2xl motion-safe:animate-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-300 motion-reduce:animate-none sm:p-8">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2
                  id="cookie-consent-title"
                  className="font-outfit text-xl font-semibold text-[var(--brand-porcelain)] sm:text-2xl"
                >
                  Cookie Preferences
                </h2>
                <p
                  id="cookie-consent-description"
                  className="mt-2 font-inter text-sm text-[var(--brand-slate-300)] sm:text-base"
                >
                  We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
                  You can choose which cookies you're comfortable with.
                </p>
              </div>

              {/* Close button (reject all) */}
              <button
                onClick={handleRejectAll}
                onKeyDown={(e) => handleKeyDown(e, handleRejectAll)}
                aria-label="Reject all cookies and close"
                className="flex-shrink-0 rounded-lg p-2 text-[var(--brand-slate-400)] transition-colors hover:bg-[var(--brand-slate-800)] hover:text-[var(--brand-porcelain)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-slate-600)] focus:ring-offset-2 focus:ring-offset-[var(--brand-obsidian)]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Customize Section (collapsible) */}
            {showCustomize && (
              <div
                className="space-y-4 rounded-xl border border-[var(--brand-slate-800)] bg-[var(--brand-slate-900)] p-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200 motion-reduce:animate-none"
                role="group"
                aria-labelledby="cookie-categories-title"
              >
                <h3
                  id="cookie-categories-title"
                  className="font-outfit text-lg font-semibold text-[var(--brand-porcelain)]"
                >
                  Cookie Categories
                </h3>

                {/* Necessary Cookies (always on) */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="cookie-necessary"
                    checked={true}
                    disabled={true}
                    aria-describedby="cookie-necessary-description"
                    className="mt-1 h-4 w-4 rounded border-[var(--brand-slate-600)] bg-[var(--brand-slate-800)] text-[var(--brand-slate-500)] opacity-50 focus:ring-0"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="cookie-necessary"
                      className="font-inter text-sm font-medium text-[var(--brand-porcelain)]"
                    >
                      Necessary Cookies <span className="text-[var(--brand-slate-500)]">(Required)</span>
                    </label>
                    <p
                      id="cookie-necessary-description"
                      className="mt-1 font-inter text-xs text-[var(--brand-slate-400)]"
                    >
                      Essential for the website to function properly. Cannot be disabled.
                    </p>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="cookie-analytics"
                    checked={customPrefs.analytics}
                    onChange={() => handleCheckboxChange('analytics')}
                    aria-describedby="cookie-analytics-description"
                    className="mt-1 h-4 w-4 rounded border-[var(--brand-slate-600)] bg-[var(--brand-slate-800)] text-[var(--brand-slate-300)] transition-colors focus:ring-2 focus:ring-[var(--brand-slate-600)] focus:ring-offset-2 focus:ring-offset-[var(--brand-slate-900)]"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="cookie-analytics"
                      className="cursor-pointer font-inter text-sm font-medium text-[var(--brand-porcelain)]"
                    >
                      Analytics Cookies
                    </label>
                    <p
                      id="cookie-analytics-description"
                      className="mt-1 font-inter text-xs text-[var(--brand-slate-400)]"
                    >
                      Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                    </p>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="cookie-marketing"
                    checked={customPrefs.marketing}
                    onChange={() => handleCheckboxChange('marketing')}
                    aria-describedby="cookie-marketing-description"
                    className="mt-1 h-4 w-4 rounded border-[var(--brand-slate-600)] bg-[var(--brand-slate-800)] text-[var(--brand-slate-300)] transition-colors focus:ring-2 focus:ring-[var(--brand-slate-600)] focus:ring-offset-2 focus:ring-offset-[var(--brand-slate-900)]"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="cookie-marketing"
                      className="cursor-pointer font-inter text-sm font-medium text-[var(--brand-porcelain)]"
                    >
                      Marketing Cookies
                    </label>
                    <p
                      id="cookie-marketing-description"
                      className="mt-1 font-inter text-xs text-[var(--brand-slate-400)]"
                    >
                      Used to track visitors across websites to display relevant and engaging advertisements.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Left side: Policy links */}
              <div className="flex flex-wrap gap-4 text-sm">
                <a
                  href={policyUrl}
                  className="font-inter text-[var(--brand-slate-400)] underline decoration-[var(--brand-slate-600)] underline-offset-2 transition-colors hover:text-[var(--brand-porcelain)] hover:decoration-[var(--brand-slate-400)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-slate-600)] focus:ring-offset-2 focus:ring-offset-[var(--brand-obsidian)]"
                >
                  Cookie Policy
                </a>
                <a
                  href={privacyUrl}
                  className="font-inter text-[var(--brand-slate-400)] underline decoration-[var(--brand-slate-600)] underline-offset-2 transition-colors hover:text-[var(--brand-porcelain)] hover:decoration-[var(--brand-slate-400)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-slate-600)] focus:ring-offset-2 focus:ring-offset-[var(--brand-obsidian)]"
                >
                  Privacy Policy
                </a>
              </div>

              {/* Right side: Action buttons */}
              <div className="flex flex-col gap-3 sm:flex-row">
                {showCustomize ? (
                  <>
                    <button
                      onClick={handleToggleCustomize}
                      onKeyDown={(e) => handleKeyDown(e, handleToggleCustomize)}
                      className="rounded-lg border border-[var(--brand-slate-700)] bg-transparent px-6 py-2.5 font-inter text-sm font-medium text-[var(--brand-porcelain)] transition-colors hover:bg-[var(--brand-slate-800)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-slate-600)] focus:ring-offset-2 focus:ring-offset-[var(--brand-obsidian)]"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSaveCustom}
                      onKeyDown={(e) => handleKeyDown(e, handleSaveCustom)}
                      className="rounded-lg bg-[var(--brand-porcelain)] px-6 py-2.5 font-inter text-sm font-medium text-[var(--brand-obsidian)] transition-colors hover:bg-[var(--brand-slate-200)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-porcelain)] focus:ring-offset-2 focus:ring-offset-[var(--brand-obsidian)]"
                    >
                      Save Preferences
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleToggleCustomize}
                      onKeyDown={(e) => handleKeyDown(e, handleToggleCustomize)}
                      className="rounded-lg border border-[var(--brand-slate-700)] bg-transparent px-6 py-2.5 font-inter text-sm font-medium text-[var(--brand-porcelain)] transition-colors hover:bg-[var(--brand-slate-800)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-slate-600)] focus:ring-offset-2 focus:ring-offset-[var(--brand-obsidian)]"
                    >
                      Customize
                    </button>
                    <button
                      onClick={handleRejectAll}
                      onKeyDown={(e) => handleKeyDown(e, handleRejectAll)}
                      className="rounded-lg border border-[var(--brand-slate-700)] bg-transparent px-6 py-2.5 font-inter text-sm font-medium text-[var(--brand-porcelain)] transition-colors hover:bg-[var(--brand-slate-800)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-slate-600)] focus:ring-offset-2 focus:ring-offset-[var(--brand-obsidian)]"
                    >
                      Reject All
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      onKeyDown={(e) => handleKeyDown(e, handleAcceptAll)}
                      className="rounded-lg bg-[var(--brand-porcelain)] px-6 py-2.5 font-inter text-sm font-medium text-[var(--brand-obsidian)] transition-colors hover:bg-[var(--brand-slate-200)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-porcelain)] focus:ring-offset-2 focus:ring-offset-[var(--brand-obsidian)]"
                    >
                      Accept All
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Cookie Settings Button Component
 * Use this to allow users to change their cookie preferences after initial choice
 */
interface CookieSettingsButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export function CookieSettingsButton({
  children = 'Cookie Settings',
  className = '',
}: CookieSettingsButtonProps) {
  const { resetConsent } = useConsent();

  return (
    <button
      onClick={resetConsent}
      className={`font-inter text-sm text-[var(--brand-slate-400)] underline decoration-[var(--brand-slate-600)] underline-offset-2 transition-colors hover:text-[var(--brand-porcelain)] hover:decoration-[var(--brand-slate-400)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-slate-600)] focus:ring-offset-2 ${className}`}
    >
      {children}
    </button>
  );
}
