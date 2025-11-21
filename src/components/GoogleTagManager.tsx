/**
 * Google Tag Manager Component
 * Handles GTM script injection with consent gating and CSP nonce support
 */

'use client';

import { useEffect } from 'react';

import Script from 'next/script';

import { useConsent } from '@/hooks/use-consent';
import { initializeConsentMode } from '@/lib/consent';

interface GoogleTagManagerProps {
  /** GTM Container ID (e.g., 'GTM-XXXXXXX') */
  gtmId: string;
  /** Optional nonce for CSP */
  nonce?: string;
  /** Enable GTM preview mode for testing */
  previewMode?: boolean;
  /** Preview environment (auth and preview parameters) */
  previewEnv?: {
    auth: string;
    preview: string;
  };
}

/**
 * Google Tag Manager integration component
 *
 * Features:
 * - Consent-gated loading
 * - CSP nonce support
 * - Preview mode for testing
 * - TypeScript dataLayer support
 *
 * @example
 * <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID!} />
 *
 * @example With preview mode
 * <GoogleTagManager
 *   gtmId="GTM-XXXXXXX"
 *   previewMode
 *   previewEnv={{ auth: "xxx", preview: "env-1" }}
 * />
 */
export function GoogleTagManager({
  gtmId,
  nonce,
  previewMode = false,
  previewEnv,
}: GoogleTagManagerProps) {
  const { hasConsent } = useConsent();

  // Initialize consent mode before GTM loads
  useEffect(() => {
    initializeConsentMode();
  }, []);

  // Don't load GTM if:
  // 1. No GTM ID provided
  // 2. Not in preview mode AND user hasn't consented to analytics
  if (!gtmId) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[GTM] No GTM ID provided. Set NEXT_PUBLIC_GTM_ID environment variable.');
    }
    return null;
  }

  const shouldLoadGTM = previewMode || hasConsent('analytics');

  if (!shouldLoadGTM) {
    return null;
  }

  // Build GTM URL with optional preview parameters
  const buildGTMUrl = () => {
    const baseUrl = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;

    if (previewMode && previewEnv) {
      return `${baseUrl}&gtm_auth=${previewEnv.auth}&gtm_preview=${previewEnv.preview}&gtm_cookies_win=x`;
    }

    return baseUrl;
  };

  return (
    <>
      {/* GTM Script - Head */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl${
            previewMode && previewEnv
              ? `+'&gtm_auth=${previewEnv.auth}&gtm_preview=${previewEnv.preview}&gtm_cookies_win=x'`
              : ''
          };f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');
          `.trim(),
        }}
      />

      {/* GTM NoScript - Body (for users with JS disabled) */}
      <noscript>
        <iframe
          src={buildGTMUrl().replace('/gtm.js', '/ns.html')}
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
 * GTM NoScript fallback component
 * Should be placed at the top of <body>
 */
export function GoogleTagManagerNoScript({
  gtmId,
  previewMode = false,
  previewEnv,
}: Pick<GoogleTagManagerProps, 'gtmId' | 'previewMode' | 'previewEnv'>) {
  if (!gtmId) return null;

  const buildNoScriptUrl = () => {
    const baseUrl = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;

    if (previewMode && previewEnv) {
      return `${baseUrl}&gtm_auth=${previewEnv.auth}&gtm_preview=${previewEnv.preview}&gtm_cookies_win=x`;
    }

    return baseUrl;
  };

  return (
    <noscript>
      <iframe
        src={buildNoScriptUrl()}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
