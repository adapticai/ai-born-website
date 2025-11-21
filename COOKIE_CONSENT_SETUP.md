# Cookie Consent Setup Guide

This guide explains how to set up and use the GDPR/CCPA compliant cookie consent system for the AI-Born landing page.

## Quick Start

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Google Tag Manager ID:

```bash
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

### 2. Integration (Already Done)

The cookie consent system is already integrated in `/src/app/layout.tsx`:

```tsx
import { CookieConsent } from "@/components/CookieConsent";
import { GTMConditional } from "@/components/GTMConditional";

export default function RootLayout({ children }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="en">
      <body>
        {children}

        {/* Cookie Consent Banner */}
        <CookieConsent />

        {/* GTM - only loads after analytics consent */}
        {gtmId && <GTMConditional gtmId={gtmId} />}
      </body>
    </html>
  );
}
```

### 3. Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. You should see the cookie consent banner at the bottom of the page

4. Test the following scenarios:
   - Click "Accept All" - GTM should load
   - Click "Reject All" - GTM should NOT load
   - Click "Customize" - Choose preferences and save

5. Check browser console for GTM events:
   ```javascript
   window.dataLayer
   ```

## Components

### CookieConsent

Main banner component that displays on first visit.

**Props:**
```typescript
{
  policyUrl?: string;       // Default: "/privacy#cookies"
  privacyUrl?: string;      // Default: "/privacy"
  position?: 'top' | 'bottom';  // Default: "bottom"
  className?: string;
}
```

**Example:**
```tsx
<CookieConsent
  policyUrl="/legal/cookies"
  privacyUrl="/legal/privacy"
  position="bottom"
/>
```

### useConsent Hook

Access consent state anywhere in your app.

**Example:**
```tsx
import { useConsent } from '@/components/CookieConsent';

export function MyComponent() {
  const { hasConsent, preferences } = useConsent();

  // Check if analytics consent is given
  if (hasConsent('analytics')) {
    // Track analytics event
    console.log('Analytics allowed');
  }

  return <div>...</div>;
}
```

### CookieSettingsButton

Allow users to change preferences after initial choice.

**Example:**
```tsx
import { CookieSettingsButton } from '@/components/CookieConsent';

export function Footer() {
  return (
    <footer>
      <CookieSettingsButton>
        Manage Cookie Preferences
      </CookieSettingsButton>
    </footer>
  );
}
```

### GTMConditional

Conditionally loads GTM based on consent.

**Props:**
```typescript
{
  gtmId: string;                  // Required: GTM Container ID
  gtmAuth?: string;               // Optional: Environment auth
  gtmPreview?: string;            // Optional: Environment preview
  dataLayerEvents?: Record<string, unknown>[];  // Optional: Initial events
}
```

## How It Works

### 1. First Visit

When a user visits for the first time:

1. `CookieConsent` banner displays at the bottom
2. GTM does NOT load (consent not given)
3. User makes a choice:
   - **Accept All**: All cookies enabled, GTM loads
   - **Reject All**: Only necessary cookies, GTM does NOT load
   - **Customize**: User selects specific categories

### 2. Returning Visit

When a user returns:

1. `CookieConsent` banner does NOT display
2. Preferences loaded from localStorage
3. GTM loads only if analytics consent was given
4. User can change preferences via `CookieSettingsButton`

### 3. Consent Storage

Preferences stored in localStorage:

```javascript
{
  "necessary": true,      // Always true
  "analytics": true,      // User choice
  "marketing": false,     // User choice
  "timestamp": 1234567890,
  "version": "1.0"
}
```

**Key:** `ai-born-cookie-consent`

### 4. GTM Integration

The system uses GTM Consent Mode v2:

```javascript
// Default state (before consent)
window.dataLayer.push({
  event: 'consent_default',
  consent: {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  },
});

// After user accepts analytics
window.dataLayer.push({
  event: 'consent_update',
  consent: {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  },
});
```

## Advanced Usage

### Tracking Custom Events

Use the helper functions to track events:

```tsx
import { pushGTMEvent } from '@/components/GTMConditional';

// Track custom event
pushGTMEvent({
  event: 'custom_event',
  category: 'button',
  action: 'click',
  label: 'pre-order',
});
```

### Checking Consent Before Tracking

Always check consent before tracking:

```tsx
import { useConsent } from '@/components/CookieConsent';
import { pushGTMEvent } from '@/components/GTMConditional';

export function TrackingButton() {
  const { hasConsent } = useConsent();

  const handleClick = () => {
    if (hasConsent('analytics')) {
      pushGTMEvent({
        event: 'button_click',
        button_id: 'pre-order',
      });
    }
  };

  return <button onClick={handleClick}>Pre-order</button>;
}
```

### Custom Consent Preferences

Set custom preferences:

```tsx
import { useConsent } from '@/components/CookieConsent';

export function CustomConsentForm() {
  const { setPreferences } = useConsent();

  const handleSave = () => {
    setPreferences({
      analytics: true,
      marketing: false,
    });
  };

  return <button onClick={handleSave}>Save</button>;
}
```

## Compliance

### GDPR Compliance

✅ **Explicit Consent**: Users must actively accept cookies
✅ **Granular Control**: Users can choose specific categories
✅ **Right to Withdraw**: Users can change preferences anytime
✅ **Clear Information**: Banner explains cookie purposes
✅ **Privacy Policy**: Links to detailed cookie policy

### CCPA Compliance

✅ **Notice**: Banner clearly states data collection
✅ **Opt-Out**: "Reject All" button for non-essential cookies
✅ **Privacy Rights**: Link to privacy policy with CCPA rights
✅ **No Discrimination**: Site functions without accepting cookies

## Accessibility

The cookie consent banner is fully accessible:

- ✅ **Semantic HTML**: Proper ARIA roles and labels
- ✅ **Keyboard Navigation**: Tab, Enter, Space keys work
- ✅ **Screen Reader**: All content is announced
- ✅ **Focus Indicators**: Clear focus states on all elements
- ✅ **Reduced Motion**: Respects `prefers-reduced-motion`
- ✅ **Color Contrast**: All text meets WCAG AA standards (≥4.5:1)

## Troubleshooting

### Banner Shows Every Time

**Issue**: Banner displays on every page load
**Cause**: localStorage is being cleared or blocked
**Solution**:
- Check if browser is in private/incognito mode
- Verify localStorage is enabled
- Check browser console for errors

### GTM Not Loading

**Issue**: GTM doesn't load after accepting cookies
**Cause**: Environment variable not set or consent not given
**Solution**:
- Verify `NEXT_PUBLIC_GTM_ID` is set in `.env.local`
- Check browser console: `window.dataLayer`
- Verify consent: `localStorage.getItem('ai-born-cookie-consent')`

### Consent Not Persisting

**Issue**: Preferences don't persist across sessions
**Cause**: localStorage is disabled or cleared
**Solution**:
- Check browser privacy settings
- Verify site is not set to clear cookies on exit
- Check for browser extensions blocking localStorage

### TypeScript Errors

**Issue**: Type errors when using hooks
**Cause**: Missing type imports
**Solution**:
```tsx
import type { ConsentCategory } from '@/components/CookieConsent';
```

## Testing Checklist

Before deploying to production, test:

- [ ] Banner displays on first visit
- [ ] Banner doesn't display on return visits
- [ ] "Accept All" enables all cookies and loads GTM
- [ ] "Reject All" disables non-essential cookies
- [ ] "Customize" allows granular control
- [ ] Preferences persist after page reload
- [ ] GTM loads only when analytics consent given
- [ ] `CookieSettingsButton` reopens banner
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Screen reader announces content correctly
- [ ] Focus indicators visible on all elements
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Works on mobile devices (iOS, Android)
- [ ] Respects `prefers-reduced-motion`

## Browser Support

The cookie consent system supports:

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile (Android 10+)

## Performance

The cookie consent system is optimized for performance:

- **Bundle Size**: ~8KB gzipped
- **No Dependencies**: Uses only React and Next.js
- **Lazy Loading**: GTM loads only after consent
- **localStorage**: Fast preference retrieval
- **No Network Calls**: All logic client-side

## Privacy Policy Requirements

Your privacy policy should include:

1. **What cookies we use**:
   - Necessary (session, security)
   - Analytics (Google Analytics, GTM)
   - Marketing (if applicable)

2. **Why we use them**:
   - Necessary: Site functionality
   - Analytics: Understand user behavior
   - Marketing: Personalized advertising

3. **How to manage cookies**:
   - Browser settings
   - Cookie consent banner
   - Cookie settings button

4. **Third-party cookies**:
   - Google Analytics
   - Google Tag Manager
   - (List all third-party services)

5. **User rights**:
   - Right to opt-out
   - Right to delete data
   - Right to data portability (GDPR)

## Support

For questions or issues:

1. Check this documentation
2. Review `/src/components/CookieConsent.README.md`
3. Contact the development team

---

**Version:** 1.0
**Last Updated:** October 2025
**Maintained by:** AI-Born Development Team
