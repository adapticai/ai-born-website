'use client';

import { useEffect } from 'react';

import Script from 'next/script';

import { useConsent } from './CookieConsent';

/**
 * GTM Conditional Loader Props
 */
interface GTMConditionalProps {
  /**
   * Google Tag Manager Container ID
   * @example "GTM-XXXXXXX"
   */
  gtmId: string;

  /**
   * Optional GTM auth parameter for environment-specific containers
   */
  gtmAuth?: string;

  /**
   * Optional GTM preview parameter for environment-specific containers
   */
  gtmPreview?: string;

  /**
   * Additional dataLayer events to push on initialization
   */
  dataLayerEvents?: Record<string, unknown>[];
}

/**
 * Conditionally loads Google Tag Manager based on cookie consent
 *
 * Features:
 * - Only loads GTM after user has consented to analytics
 * - Initializes dataLayer before GTM loads
 * - Supports environment-specific containers (gtmAuth/gtmPreview)
 * - Updates GTM consent mode when preferences change
 * - Production-ready with error handling
 */
export function GTMConditional({
  gtmId,
  gtmAuth,
  gtmPreview,
  dataLayerEvents = [],
}: GTMConditionalProps) {
  const { hasConsent, preferences, isLoading } = useConsent();

  /**
   * Initialize dataLayer and set default consent state
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize dataLayer if not exists
    window.dataLayer = window.dataLayer || [];

    // Set default consent state (denied until user accepts)
    window.dataLayer.push({
      event: 'consent_default',
      consent: {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      },
    });

    // Push any custom initialization events
    dataLayerEvents.forEach(event => {
      window.dataLayer.push(event);
    });
  }, [dataLayerEvents]);

  /**
   * Update consent when preferences change
   */
  useEffect(() => {
    if (typeof window === 'undefined' || !preferences) return;

    window.dataLayer = window.dataLayer || [];

    // Update consent based on user preferences
    window.dataLayer.push({
      event: 'consent_update',
      consent: {
        analytics_storage: preferences.analytics ? 'granted' : 'denied',
        ad_storage: preferences.marketing ? 'granted' : 'denied',
        ad_user_data: preferences.marketing ? 'granted' : 'denied',
        ad_personalization: preferences.marketing ? 'granted' : 'denied',
      },
    });
  }, [preferences]);

  /**
   * Don't load GTM if:
   * - Still loading consent preferences
   * - User hasn't consented to analytics
   * - No GTM ID provided
   */
  if (isLoading || !hasConsent('analytics') || !gtmId) {
    return null;
  }

  /**
   * Build GTM URL with optional auth/preview params
   */
  const gtmParams = new URLSearchParams();
  gtmParams.set('id', gtmId);
  if (gtmAuth) gtmParams.set('gtm_auth', gtmAuth);
  if (gtmPreview) gtmParams.set('gtm_preview', gtmPreview);
  gtmParams.set('gtm_cookies_win', 'x');

  const gtmUrl = `https://www.googletagmanager.com/gtm.js?${gtmParams.toString()}`;

  return (
    <>
      {/* GTM Script */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            '${gtmUrl}';f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />

      {/* GTM NoScript Fallback */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}${gtmAuth ? `&gtm_auth=${gtmAuth}` : ''}${gtmPreview ? `&gtm_preview=${gtmPreview}` : ''}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}

/**
 * GTM Event Push Helper
 * Use this to push events to dataLayer in a type-safe way
 */
export function pushGTMEvent(event: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(event);
  }
}

/**
 * GTM User Properties Helper
 * Use this to set user properties in GTM
 */
export function setGTMUserProperties(properties: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'user_properties',
      ...properties,
    });
  }
}
