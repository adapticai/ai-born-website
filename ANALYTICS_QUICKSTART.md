# Analytics Quick Start Guide

Fast-track setup guide for Google Tag Manager integration in the AI-Born landing page.

---

## 5-Minute Setup

### 1. Get GTM Container ID

1. Go to [Google Tag Manager](https://tagmanager.google.com)
2. Create/select container
3. Copy Container ID (format: `GTM-XXXXXXX`)

### 2. Configure Environment

```bash
# Create .env.local (copy from .env.example)
cp .env.example .env.local

# Edit .env.local and add:
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Test It Works

1. Open http://localhost:3000
2. Open DevTools → Console
3. Look for `[Analytics]` logs
4. Accept cookies in the banner
5. Click around and verify events are logged

**Done!** GTM is now integrated with consent gating.

---

## Using Analytics in Your Code

### Import Tracking Functions

```typescript
import {
  trackPreorderClick,
  trackLeadCapture,
  trackBonusClaim,
  trackFrameworkCardOpen,
  trackFAQOpen,
} from '@/lib/analytics';
```

### Track Pre-order Clicks

```typescript
function handlePreorderClick(retailer: string) {
  trackPreorderClick(retailer, 'hardcover', 'US');
}
```

### Track Form Submissions

```typescript
async function handleEmailSubmit(email: string) {
  try {
    const response = await fetch('/api/lead-capture', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      trackLeadCapture('hero-excerpt', true);
    } else {
      trackLeadCapture('hero-excerpt', false);
    }
  } catch (error) {
    trackAPIError('/api/lead-capture', 500);
  }
}
```

### Track User Interactions

```typescript
// Framework card opened
trackFrameworkCardOpen('five-planes', 'The Five Planes');

// FAQ opened
trackFAQOpen('faq-shipping');

// Social proof viewed
trackSocialProofView(6);

// Scroll depth
trackScrollDepth(50); // 50% scrolled
```

---

## All Available Events

### High-Priority (KPI Events)

- **`trackPreorderClick`** — Pre-order conversion (primary KPI)
- **`trackLeadCapture`** — Email capture (primary KPI)
- **`trackBonusClaim`** — Bonus claim (secondary KPI)

### Hero Section

- **`trackHeroCTAClick`** — Hero CTA clicked
- **`trackRetailerMenuOpen`** — Retailer menu opened

### Content Engagement

- **`trackFrameworkCardOpen`** — Framework card expanded
- **`trackOverviewReadDepth`** — Overview section scroll
- **`trackSocialProofView`** — Social proof viewed
- **`trackEndorsementExpand`** — Endorsement expanded
- **`trackEndorsementTabChange`** — Endorsement tab switched

### Navigation

- **`trackScrollDepth`** — Page scroll milestones
- **`trackAnchorNavigation`** — Anchor link clicked
- **`trackRegionSwitch`** — Region changed
- **`trackFormatToggle`** — Format changed

### Media & Press

- **`trackPressKitDownload`** — Press kit downloaded
- **`trackAuthorPressDownload`** — Author bio downloaded
- **`trackMediaRequest`** — Media request submitted

### Other

- **`trackFAQOpen`** — FAQ opened
- **`trackBulkInterest`** — Bulk order inquiry
- **`trackVideoPlay`** — Video played
- **`trackVideoComplete`** — Video completed
- **`trackNewsletterSubscribe`** — Newsletter subscribed

### Error Tracking

- **`trackFormError`** — Form error
- **`trackAPIError`** — API error

---

## Type Safety

All functions are fully typed:

```typescript
// ✅ TypeScript will enforce correct parameters
trackPreorderClick('amazon', 'hardcover', 'US');

// ❌ TypeScript will catch errors
trackPreorderClick('amazon', 'invalid-format', 'US'); // Error!
```

---

## Checking Consent Status

```typescript
'use client';

import { useConsent } from '@/components/CookieConsent';

function MyComponent() {
  const { hasConsent, acceptAll, rejectAll } = useConsent();

  if (hasConsent('analytics')) {
    // User has consented to analytics
    // GTM is loaded and tracking
  }

  return <div>...</div>;
}
```

---

## Testing

### Development Console

Look for `[Analytics]` logs in browser console:

```
[Analytics] {
  event: 'preorder_click',
  retailer: 'amazon',
  format: 'hardcover',
  geo: 'US',
  book: 'ai-born',
  timestamp: '2025-10-18T12:34:56.789Z'
}
```

### Check dataLayer

In browser console:

```javascript
window.dataLayer
// Shows array of all queued events
```

### Test Without Consent

1. Clear localStorage: `localStorage.clear()`
2. Reload page
3. **Reject** cookies
4. Click around — events logged to console but GTM doesn't load
5. Accept cookies
6. GTM loads and starts tracking

---

## Production Checklist

Before deploying:

- [ ] `NEXT_PUBLIC_GTM_ID` set in production environment
- [ ] Preview mode disabled (default)
- [ ] GTM container published
- [ ] Tags configured in GTM
- [ ] Privacy policy updated
- [ ] Cookie banner tested
- [ ] Events tested end-to-end

---

## Need Help?

- **Full documentation:** See `GTM_INTEGRATION.md`
- **Type definitions:** See `/src/types/analytics.ts`
- **Implementation:** See `/src/lib/analytics.ts`
- **Components:** See `/src/components/CookieConsent.tsx` and `/src/components/GTMConditional.tsx`

---

**Quick Links:**
- [GTM Documentation](https://developers.google.com/tag-manager)
- [Google Consent Mode](https://support.google.com/tagmanager/answer/10718549)
- [Next.js Script Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/scripts)
