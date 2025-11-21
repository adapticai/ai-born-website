# Google Tag Manager Integration Guide

Complete documentation for the GTM integration in the AI-Born landing page, including consent management, analytics tracking, and production deployment.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup](#setup)
4. [Usage](#usage)
5. [Analytics Events](#analytics-events)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This implementation provides:

- **Consent-gated GTM loading** — GTM only loads after user grants analytics consent (GDPR/CCPA compliant)
- **TypeScript-first analytics** — Fully typed event tracking with 27 predefined event types
- **Google Consent Mode v2** — Proper consent signaling to Google services
- **Production-ready** — Error handling, SSR compatibility, CSP support
- **No mocks** — Real GTM integration ready for production use

---

## Architecture

### Components

```
src/
├── components/
│   ├── CookieConsent.tsx          # Cookie consent banner UI
│   ├── GTMConditional.tsx         # Consent-gated GTM loader
│   └── GoogleTagManager.tsx       # Alternative GTM component (if needed)
├── hooks/
│   └── use-consent.ts             # Consent management hook
├── lib/
│   ├── consent.ts                 # Consent logic & Google Consent Mode
│   └── analytics.ts               # Typed event tracking functions
└── app/
    └── layout.tsx                 # GTM integration in root layout
```

### Data Flow

```
User visits site
    ↓
CookieConsent banner displays
    ↓
User accepts/rejects cookies
    ↓
Consent saved to localStorage
    ↓
GTMConditional checks consent
    ↓
If analytics consent = true → Load GTM
    ↓
Analytics events tracked via dataLayer
```

---

## Setup

### 1. Environment Variables

Create a `.env.local` file (copy from `.env.example`):

```bash
# Required for GTM to load
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Optional: Preview mode for testing
NEXT_PUBLIC_GTM_PREVIEW_MODE=false
NEXT_PUBLIC_GTM_PREVIEW_AUTH=
NEXT_PUBLIC_GTM_PREVIEW_ID=
```

### 2. Get Your GTM Container ID

1. Go to [Google Tag Manager](https://tagmanager.google.com)
2. Create a new container (if you don't have one)
3. Copy your Container ID (format: `GTM-XXXXXXX`)
4. Add it to `.env.local`

### 3. Configure GTM Container

In your GTM container, create tags for the analytics events you want to track:

**Example: Pre-order Click Tag**

- **Tag Type:** Google Analytics: GA4 Event
- **Event Name:** `preorder_click`
- **Trigger:** Custom Event (`preorder_click`)
- **Parameters:**
  - `retailer`: `{{dlv - retailer}}`
  - `format`: `{{dlv - format}}`
  - `geo`: `{{dlv - geo}}`

**Required Variables:**
Create Data Layer Variables for each parameter:
- Variable Name: `dlv - retailer`
- Data Layer Variable Name: `retailer`
- (Repeat for `format`, `geo`, etc.)

---

## Usage

### Basic Event Tracking

```typescript
import {
  trackPreorderClick,
  trackLeadCapture,
  trackBonusClaim,
} from '@/lib/analytics';

// Track pre-order click
function handlePreorderClick() {
  trackPreorderClick('amazon', 'hardcover', 'US', 'launch-week');
}

// Track lead capture
function handleEmailSubmit() {
  trackLeadCapture('hero-excerpt', true);
}

// Track bonus claim
function handleBonusClaim(orderIdHash: string) {
  trackBonusClaim('barnes-noble', orderIdHash, true, true);
}
```

### Using the Generic trackEvent Function

For custom events or advanced use cases:

```typescript
import { trackEvent } from '@/lib/analytics';
import type { AnalyticsEvent } from '@/types';

// Custom event
trackEvent({
  event: 'custom_event_name',
  custom_param: 'value',
  book: 'ai-born',
} as AnalyticsEvent);
```

### Accessing Consent State

```typescript
'use client';

import { useConsent } from '@/components/CookieConsent';

function MyComponent() {
  const { hasConsent, preferences, acceptAll, rejectAll } = useConsent();

  if (hasConsent('analytics')) {
    // Analytics is enabled
    // Load additional tracking scripts if needed
  }

  return (
    <div>
      <button onClick={acceptAll}>Accept All Cookies</button>
      <button onClick={rejectAll}>Reject All Cookies</button>
    </div>
  );
}
```

### Manual Consent Management

```typescript
import {
  getConsentPreferences,
  setConsentPreferences,
  hasConsent,
  grantAllConsent,
  denyAllConsent,
} from '@/lib/consent';

// Check current consent
const preferences = getConsentPreferences();
console.log(preferences);
// { analytics: true, marketing: false, functional: true, timestamp: 1234567890 }

// Grant specific consent
setConsentPreferences({ analytics: true });

// Check if user has given consent
if (hasConsent('analytics')) {
  // Track analytics event
}

// Grant/deny all
grantAllConsent(); // Sets analytics + marketing to true
denyAllConsent();  // Sets analytics + marketing to false (keeps functional)
```

---

## Analytics Events

### All Available Events (27 total)

#### Hero Section
- `hero_cta_click` — Hero CTA interaction
- `retailer_menu_open` — Retailer menu opened
- `preorder_click` — Pre-order conversion (key metric)

#### Lead Capture
- `lead_capture_submit` — Email capture form submission
- `newsletter_subscribed` — Newsletter subscription
- `bonus_claim_submit` — Pre-order bonus claim

#### Content Engagement
- `framework_card_open` — Framework card expanded
- `overview_read_depth` — Overview section scroll depth
- `social_proof_view` — Social proof section viewed
- `endorsement_expand` — Endorsement expanded
- `endorsement_tab_change` — Endorsement tab switched

#### FAQ
- `faq_open` — FAQ item expanded

#### Media & Press
- `presskit_download` — Press kit downloaded
- `author_press_download` — Author bio/headshots downloaded
- `media_request_submit` — Media request form submitted

#### Bulk Orders
- `bulk_interest_submit` — Bulk order inquiry submitted

#### Video
- `video_play` — Video playback started
- `video_complete` — Video watched to completion

#### Navigation
- `scroll_depth` — Page scroll milestones (25%, 50%, 75%, 100%)
- `anchor_navigation` — Anchor link navigation
- `region_switch` — Geographic region changed
- `format_toggle` — Book format changed

#### Errors
- `form_error` — Form validation/submission error
- `api_error` — API call failure

### Event Examples

See `/src/lib/analytics.ts` for detailed JSDoc documentation and examples for each function.

**Quick Reference:**

```typescript
// Pre-order click (conversion event)
trackPreorderClick('amazon', 'hardcover', 'US', 'launch-week');

// Hero CTA click
trackHeroCTAClick('preorder', 'hardcover', 'US', 'amazon');

// Retailer menu open
trackRetailerMenuOpen('hero');

// Lead capture
trackLeadCapture('hero-excerpt', true);

// Bonus claim
trackBonusClaim('amazon', 'order123hash', true, true);

// Framework card open
trackFrameworkCardOpen('five-planes', 'The Five Planes');

// Social proof view
trackSocialProofView(6);

// FAQ open
trackFAQOpen('faq-shipping', 'How long does shipping take?');

// Press kit download
trackPressKitDownload('full-kit', 'zip');

// Scroll depth
trackScrollDepth(50); // 50% scrolled

// Region switch
trackRegionSwitch('US', 'UK');

// Format toggle
trackFormatToggle('hardcover', 'ebook');

// Form error
trackFormError('lead-capture', 'validation', 'email');

// API error
trackAPIError('/api/lead-capture', 500, 'Internal server error');
```

---

## Testing

### 1. Local Development Testing

1. Set `NEXT_PUBLIC_GTM_ID` in `.env.local`
2. Run the development server: `npm run dev`
3. Open browser DevTools → Console
4. Look for `[Analytics]` logs showing events being tracked
5. Check `window.dataLayer` in console to see queued events

```javascript
// In browser console
console.log(window.dataLayer);
// Should show array of events
```

### 2. GTM Preview Mode

Enable preview mode to test GTM without consent requirement:

```bash
# .env.local
NEXT_PUBLIC_GTM_PREVIEW_MODE=true
```

**Warning:** Only use preview mode in development/staging. Never in production.

### 3. GTM Debug Mode

1. Install [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Click extension → Enable for this site
3. Reload page
4. Click extension → Show tags
5. Verify tags are firing correctly

### 4. Testing Consent Flow

1. Clear localStorage: `localStorage.clear()`
2. Reload page
3. Cookie consent banner should appear
4. Accept cookies
5. Verify GTM script loads (check Network tab for `gtm.js`)
6. Trigger an event (e.g., click pre-order button)
7. Check `window.dataLayer` to see event

### 5. Testing Without Consent

1. Clear localStorage
2. Reload page
3. Reject all cookies
4. Verify GTM script does NOT load
5. Trigger an event — should see `[Analytics]` log in console but NOT in GTM

---

## Production Deployment

### Pre-deployment Checklist

- [ ] GTM Container ID set in environment variables
- [ ] GTM container published (not in draft mode)
- [ ] All required tags configured in GTM
- [ ] All data layer variables created
- [ ] Preview mode disabled (`NEXT_PUBLIC_GTM_PREVIEW_MODE=false`)
- [ ] Privacy policy includes cookie information
- [ ] Cookie consent banner tested
- [ ] Analytics events tested end-to-end
- [ ] No console errors related to GTM

### Environment Variables

**Production:**
```bash
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GTM_PREVIEW_MODE=false
```

**Staging (optional preview):**
```bash
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GTM_PREVIEW_MODE=true
NEXT_PUBLIC_GTM_PREVIEW_AUTH=your_auth_token
NEXT_PUBLIC_GTM_PREVIEW_ID=env-1
```

### Vercel Deployment

1. Go to Vercel project settings
2. Navigate to Environment Variables
3. Add `NEXT_PUBLIC_GTM_ID` with your GTM container ID
4. Deploy

### Performance Considerations

- GTM loads with `strategy="afterInteractive"` (after page interactive)
- Consent check prevents unnecessary script loading
- DataLayer events are queued before GTM loads
- No impact on Core Web Vitals when properly configured

### CSP (Content Security Policy)

If using strict CSP, add these directives:

```
script-src 'self' https://www.googletagmanager.com;
img-src 'self' https://www.googletagmanager.com;
connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com;
```

For inline GTM script, use nonce:
```typescript
<GoogleTagManager gtmId={gtmId} nonce={nonce} />
```

---

## Troubleshooting

### GTM Not Loading

**Symptoms:** No `gtm.js` in Network tab

**Solutions:**
1. Check `NEXT_PUBLIC_GTM_ID` is set correctly
2. Verify user has given analytics consent
3. Check browser console for errors
4. Clear localStorage and re-consent
5. Verify GTM container is published (not draft)

### Events Not Appearing in GTM

**Symptoms:** Events logged in console but not in GTM

**Solutions:**
1. Check GTM tags are configured correctly
2. Verify triggers match event names exactly
3. Check data layer variables are created
4. Use GTM Preview mode to debug
5. Check if GTM container is in debug mode

### Consent Banner Not Showing

**Symptoms:** Banner never appears

**Solutions:**
1. Clear localStorage: `localStorage.removeItem('ai-born-cookie-consent')`
2. Check if `CookieConsent` component is rendered in layout
3. Check browser console for React errors
4. Verify component is client-side (`'use client'` directive)

### TypeScript Errors

**Symptoms:** Type errors when using analytics functions

**Solutions:**
1. Ensure `@/types` exports are correct
2. Check import paths
3. Restart TypeScript server
4. Verify all event types are exported in `/src/types/analytics.ts`

### Events Not Typed Correctly

**Symptoms:** TypeScript not catching invalid event properties

**Solutions:**
1. Use specific helper functions instead of generic `trackEvent`
2. Ensure you're importing from `@/lib/analytics`
3. Check that event types match those defined in `/src/types/analytics.ts`

### Preview Mode Not Working

**Symptoms:** Preview mode enabled but GTM still requires consent

**Solutions:**
1. Verify `NEXT_PUBLIC_GTM_PREVIEW_MODE=true` in `.env.local`
2. Restart development server after changing env vars
3. Check component logic in `GTMConditional.tsx`

---

## Additional Resources

- [Google Tag Manager Documentation](https://developers.google.com/tag-manager)
- [Google Consent Mode v2](https://support.google.com/tagmanager/answer/10718549)
- [GA4 Event Tracking](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [Next.js Script Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/scripts)

---

## Support

For issues specific to this implementation:
1. Check this documentation first
2. Review component source code in `/src/components/`
3. Check type definitions in `/src/types/analytics.ts`
4. Review helper functions in `/src/lib/analytics.ts`

For GTM-specific issues:
- [GTM Community Forum](https://www.en.advertisercommunity.com/t5/Google-Tag-Manager/ct-p/Google-Tag-Manager)
- [GTM Support](https://support.google.com/tagmanager)

---

**Last Updated:** October 2025
**Version:** 1.0
**Maintained by:** AI-Born Development Team
