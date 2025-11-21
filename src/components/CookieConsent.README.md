# Cookie Consent System

GDPR/CCPA compliant cookie consent implementation for the AI-Born landing page.

## Features

- ✅ Displays on first visit before GTM loads
- ✅ Accept/Reject/Customize options
- ✅ Stores consent in localStorage
- ✅ Integrates with GTM (gates tracking until consent given)
- ✅ Provides cookie policy link
- ✅ Full accessibility (keyboard nav, ARIA labels, screen reader support)
- ✅ Uses brand colors from CLAUDE.md (obsidian, cyan, ember, porcelain)
- ✅ Reduced motion support (`prefers-reduced-motion` media query)
- ✅ Persists preferences across sessions
- ✅ Type-safe with TypeScript

## Components

### 1. `CookieConsent`

Main cookie consent banner component. Displays on first visit and allows users to manage their cookie preferences.

**Props:**

```typescript
interface CookieConsentProps {
  policyUrl?: string;      // Default: "/privacy#cookies"
  privacyUrl?: string;     // Default: "/privacy"
  position?: 'top' | 'bottom';  // Default: "bottom"
  className?: string;
}
```

**Usage:**

```tsx
import { CookieConsent } from '@/components/CookieConsent';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
```

### 2. `useConsent` Hook

React hook for accessing and managing cookie consent state.

**API:**

```typescript
const {
  preferences,      // Current consent preferences
  isLoading,        // Loading state
  hasChoiceMade,    // Whether user has made a choice
  hasConsent,       // Check consent for specific category
  setPreferences,   // Set custom preferences
  acceptAll,        // Accept all cookies
  rejectAll,        // Reject non-necessary cookies
  resetConsent,     // Clear stored preferences
} = useConsent();
```

**Usage:**

```tsx
import { useConsent } from '@/components/CookieConsent';

export function MyComponent() {
  const { hasConsent, acceptAll } = useConsent();

  // Check if analytics consent is given
  if (hasConsent('analytics')) {
    // Track analytics event
  }

  return (
    <button onClick={acceptAll}>
      Accept All Cookies
    </button>
  );
}
```

### 3. `CookieSettingsButton`

Button component that allows users to change their cookie preferences after initial choice.

**Props:**

```typescript
interface CookieSettingsButtonProps {
  children?: React.ReactNode;  // Default: "Cookie Settings"
  className?: string;
}
```

**Usage:**

```tsx
import { CookieSettingsButton } from '@/components/CookieConsent';

export function Footer() {
  return (
    <footer>
      <CookieSettingsButton />
    </footer>
  );
}
```

### 4. `GTMConditional`

Google Tag Manager wrapper that respects cookie consent. Only loads GTM after user has consented to analytics.

**Props:**

```typescript
interface GTMConditionalProps {
  gtmId: string;              // GTM Container ID (e.g., "GTM-XXXXXXX")
  gtmAuth?: string;           // Optional: GTM auth for environment-specific containers
  gtmPreview?: string;        // Optional: GTM preview for environment-specific containers
  dataLayerEvents?: Record<string, unknown>[];  // Optional: Initial dataLayer events
}
```

**Usage:**

```tsx
import { GTMConditional } from '@/components/GTMConditional';

export default function Layout({ children }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html>
      <body>
        {children}
        {gtmId && <GTMConditional gtmId={gtmId} />}
      </body>
    </html>
  );
}
```

## Cookie Categories

The system manages three categories of cookies:

### 1. **Necessary** (always enabled)
Essential cookies required for the website to function. Cannot be disabled.

**Examples:**
- Session cookies
- Authentication cookies
- Security cookies

### 2. **Analytics** (opt-in)
Cookies that help understand how visitors interact with the website.

**Examples:**
- Google Analytics
- Google Tag Manager
- Heatmap tools

### 3. **Marketing** (opt-in)
Cookies used to track visitors across websites for advertising purposes.

**Examples:**
- Facebook Pixel
- Google Ads
- Retargeting pixels

## Data Structure

Consent preferences are stored in `localStorage` with the following structure:

```typescript
interface ConsentPreferences {
  necessary: boolean;   // Always true
  analytics: boolean;
  marketing: boolean;
  timestamp: number;    // Unix timestamp
  version: string;      // Consent version (for future updates)
}
```

**localStorage key:** `ai-born-cookie-consent`

## GTM Integration

The system integrates with Google Tag Manager's Consent Mode v2:

```javascript
// Default consent state (denied until user accepts)
window.dataLayer.push({
  event: 'consent_default',
  consent: {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  },
});

// Updated consent state (after user choice)
window.dataLayer.push({
  event: 'consent_update',
  consent: {
    analytics_storage: 'granted',  // if analytics accepted
    ad_storage: 'granted',         // if marketing accepted
    ad_user_data: 'granted',       // if marketing accepted
    ad_personalization: 'granted', // if marketing accepted
  },
});
```

## Events

The system pushes the following events to GTM dataLayer:

### `cookie_consent_update`
Triggered when user updates their consent preferences.

```javascript
{
  event: 'cookie_consent_update',
  consent_preferences: {
    analytics: boolean,
    marketing: boolean,
  },
}
```

## Environment Variables

Set the following environment variables in `.env.local`:

```bash
# Required: GTM Container ID
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Optional: GTM Auth (for environment-specific containers)
NEXT_PUBLIC_GTM_AUTH=your-auth-token

# Optional: GTM Preview (for environment-specific containers)
NEXT_PUBLIC_GTM_PREVIEW=env-1
```

## Accessibility

The cookie consent banner is fully accessible:

- ✅ Semantic HTML with proper ARIA labels
- ✅ Keyboard navigation support (Tab, Enter, Space)
- ✅ Screen reader friendly
- ✅ Focus indicators on all interactive elements
- ✅ Reduced motion support (`prefers-reduced-motion`)
- ✅ Color contrast ratios ≥4.5:1

## Compliance

### GDPR (General Data Protection Regulation)
- ✅ Explicit consent required before non-essential cookies
- ✅ Users can withdraw consent at any time
- ✅ Clear information about cookie purposes
- ✅ Links to privacy and cookie policies

### CCPA (California Consumer Privacy Act)
- ✅ "Reject All" option for non-essential cookies
- ✅ Clear notice of data collection
- ✅ Links to privacy policy with opt-out rights

## Testing

### Manual Testing Checklist

1. **First Visit**
   - [ ] Banner displays on first visit
   - [ ] GTM does not load until consent given
   - [ ] All buttons are functional

2. **Accept All**
   - [ ] Banner closes
   - [ ] GTM loads
   - [ ] Preferences saved to localStorage
   - [ ] dataLayer events pushed

3. **Reject All**
   - [ ] Banner closes
   - [ ] GTM does not load
   - [ ] Preferences saved to localStorage

4. **Customize**
   - [ ] Customize view opens
   - [ ] Checkboxes work correctly
   - [ ] "Necessary" checkbox is disabled
   - [ ] Save button saves preferences

5. **Returning User**
   - [ ] Banner does not show if choice made
   - [ ] GTM loads based on saved preferences

6. **Cookie Settings Button**
   - [ ] Opens banner again
   - [ ] Allows changing preferences

7. **Accessibility**
   - [ ] Keyboard navigation works
   - [ ] Focus indicators visible
   - [ ] Screen reader announces content correctly
   - [ ] Reduced motion respected

### Browser Testing

Test in the following browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Screen Reader Testing

Test with:
- NVDA (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

## Customization

### Brand Colors

The component uses CSS custom properties from `globals.css`:

```css
--brand-obsidian: #0a0a0f;      /* Background */
--brand-slate-*: #...;          /* Grayscale palette */
--brand-porcelain: #f8fafc;     /* Text */
```

### Animation

Animations respect the `prefers-reduced-motion` media query:

```css
motion-safe:animate-in          /* Animations for users who allow motion */
motion-reduce:animate-none      /* No animations for users who prefer reduced motion */
```

## Troubleshooting

### GTM not loading
- Check that `NEXT_PUBLIC_GTM_ID` is set in `.env.local`
- Verify user has accepted analytics cookies
- Check browser console for errors

### Consent not persisting
- Check if localStorage is enabled
- Verify browser is not in private/incognito mode
- Check localStorage for `ai-born-cookie-consent` key

### Banner showing every time
- Check if localStorage is being cleared
- Verify consent version matches (change `CONSENT_VERSION` to reset all users)

## Future Enhancements

Potential improvements for future versions:

- [ ] Cookie scanner to auto-detect cookies
- [ ] A/B testing different banner positions/copy
- [ ] Analytics dashboard for consent rates
- [ ] Multi-language support
- [ ] Cookie categories customization via CMS
- [ ] Integration with other consent management platforms

## Support

For questions or issues, please contact the development team or file an issue in the project repository.

---

**Version:** 1.0
**Last Updated:** October 2025
**Maintained by:** AI-Born Development Team
