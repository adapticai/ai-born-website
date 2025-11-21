# Analytics & Performance Monitoring

This document describes the analytics and performance monitoring setup for the AI-Born landing page.

## Overview

The site uses a multi-layered analytics approach:

1. **Vercel Analytics** - Automatic Web Vitals tracking and audience insights
2. **Vercel Speed Insights** - Real User Monitoring (RUM) for performance
3. **Google Tag Manager (GTM)** - Custom event tracking and third-party integrations
4. **Custom Web Vitals Tracking** - GTM dataLayer integration with performance budgets

## Performance Budgets (CLAUDE.md)

The following performance budgets are enforced per CLAUDE.md specifications:

| Metric | Target | Description |
|--------|--------|-------------|
| **LCP** | ≤2.0s | Largest Contentful Paint - main content load time |
| **FID** | ≤100ms | First Input Delay - interactivity responsiveness |
| **INP** | ≤200ms | Interaction to Next Paint - overall responsiveness |
| **CLS** | ≤0.1 | Cumulative Layout Shift - visual stability |
| **TBT** | ≤150ms | Total Blocking Time - main thread blocking |
| **TTFB** | ≤600ms | Time to First Byte - server response time |

**Target Lighthouse Score:** ≥95

## Architecture

### 1. Vercel Analytics (`@vercel/analytics`)

**Location:** `/src/app/layout.tsx`

```tsx
import { Analytics } from "@vercel/analytics/react";

// In body
<Analytics />
```

**Features:**
- Automatic Web Vitals collection (LCP, FID, CLS, INP, TTFB, FCP)
- Audience segmentation and tracking
- Privacy-friendly (no cookies, GDPR compliant)
- Real-time dashboard in Vercel

**Configuration:** `vercel.json`
```json
{
  "analytics": {
    "enable": true
  }
}
```

### 2. Vercel Speed Insights (`@vercel/speed-insights`)

**Location:** `/src/app/layout.tsx`

```tsx
import { SpeedInsights } from "@vercel/speed-insights/next";

// In body
<SpeedInsights />
```

**Features:**
- Real User Monitoring (RUM)
- Performance scores per route
- Device and browser breakdown
- Geographic performance data

**Configuration:** `vercel.json`
```json
{
  "speedInsights": {
    "enable": true
  }
}
```

### 3. Custom Web Vitals Tracking

**Location:** `/src/lib/analytics.ts`

**Core Functions:**

#### `trackWebVital(metric: Metric): void`

Tracks Web Vitals metrics to GTM dataLayer with budget validation.

```typescript
import { onCLS, onFID, onLCP, onINP, onTTFB, onFCP } from 'web-vitals';
import { trackWebVital } from '@/lib/analytics';

// Automatically track all metrics
onCLS(trackWebVital);
onFID(trackWebVital);
onLCP(trackWebVital);
onINP(trackWebVital);
onTTFB(trackWebVital);
onFCP(trackWebVital);
```

**Event Schema:**
```typescript
{
  event: 'web_vitals',
  metric_name: 'LCP' | 'FID' | 'CLS' | 'INP' | 'TTFB' | 'FCP',
  metric_value: number,          // Actual value
  metric_rating: 'good' | 'needs-improvement' | 'poor',
  metric_delta: number,           // Change since last report
  metric_id: string,              // Unique metric ID
  navigation_type: string,        // Navigation type
  exceeds_budget: boolean,        // Whether budget exceeded
  budget_threshold: number,       // Budget threshold value
  timestamp: string               // ISO 8601 timestamp
}
```

**Budget Validation:**
- Automatically compares metrics against CLAUDE.md budgets
- Logs warnings in console when budgets exceeded
- Tracks budget compliance in GTM dataLayer

#### `trackAudience(segment: string): void`

Track user segments for audience analytics.

```typescript
import { trackAudience } from '@/lib/analytics';

// Track user segments
trackAudience('returning-visitor');
trackAudience('pre-order-customer');
trackAudience('vip-code-redeemed');
```

**Event Schema:**
```typescript
{
  event: 'audience_segment',
  segment: string,
  timestamp: string
}
```

#### `trackConversion(conversionType: string, value?: number, metadata?: Record<string, unknown>): void`

Track conversion events with value.

```typescript
import { trackConversion } from '@/lib/analytics';

// Track pre-order conversion
trackConversion('pre-order', 29.99, {
  retailer: 'amazon',
  format: 'hardcover',
  geo: 'US'
});
```

**Event Schema:**
```typescript
{
  event: 'conversion',
  conversion_type: string,
  value: number,
  currency: 'USD',
  ...metadata,
  timestamp: string
}
```

#### `getPerformanceMetrics(): Record<string, number>`

Get current performance metrics summary.

```typescript
import { getPerformanceMetrics } from '@/lib/analytics';

const metrics = getPerformanceMetrics();
// {
//   dns: 15,
//   tcp: 28,
//   ttfb: 142,
//   download: 89,
//   domInteractive: 456,
//   domComplete: 892,
//   loadComplete: 1024,
//   fp: 234,
//   fcp: 456
// }
```

#### `logPerformanceMetrics(): void`

Log performance metrics to console (development only).

```typescript
import { logPerformanceMetrics } from '@/lib/analytics';

// In development, logs all metrics to console
logPerformanceMetrics();
```

### 4. Web Vitals Reporter Component

**Location:** `/src/components/WebVitalsReporter.tsx`

Automatically integrates Web Vitals tracking with Next.js.

```tsx
import { useReportWebVitals } from 'next/web-vitals';
import { trackWebVital } from '@/lib/analytics';

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    trackWebVital(metric);
  });

  return null;
}
```

**Features:**
- Uses Next.js built-in `useReportWebVitals` hook
- Automatically tracks all Core Web Vitals
- Sends to both Vercel Analytics and GTM dataLayer
- Logs performance budgets in development

## GTM Event Tracking

All custom events are tracked via the `trackEvent()` function.

### Event Types

See `/src/types/analytics.ts` for full event schemas.

**Key Events:**
- `hero_cta_click` - Hero CTA interactions
- `preorder_click` - Pre-order conversions
- `retailer_menu_open` - Retailer menu opens
- `lead_capture_submit` - Email captures
- `bonus_claim_submit` - Bonus redemptions
- `framework_card_open` - Framework card interactions
- `web_vitals` - Performance metrics

### Usage Examples

```typescript
import {
  trackPreorderClick,
  trackHeroCTAClick,
  trackLeadCapture,
  trackEvent
} from '@/lib/analytics';

// Track pre-order click
trackPreorderClick('amazon', 'hardcover', 'US', 'launch-week');

// Track hero CTA
trackHeroCTAClick('excerpt', 'hardcover', 'US');

// Track lead capture
trackLeadCapture('hero-excerpt', true);

// Track custom event
trackEvent({
  event: 'custom_event',
  custom_property: 'value'
});
```

## GTM Configuration

### DataLayer Initialization

The dataLayer is automatically initialized in `/src/lib/analytics.ts`:

```typescript
window.dataLayer = window.dataLayer || [];
```

### Event Schema

All events include:
- `event` - Event name (required)
- `book` - Always set to `'ai-born'`
- `timestamp` - ISO 8601 timestamp
- Additional event-specific properties

## Development Debugging

### Console Logging

In development mode, all analytics events are logged to console:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('[Analytics]', event);
  console.log('[Web Vitals] LCP:', '1234ms', '[good]', '✓ Within budget');
}
```

### Performance Budget Warnings

Budget violations are logged with warnings:

```
[Web Vitals] LCP: 2500ms [needs-improvement] ⚠️ EXCEEDS BUDGET (2000ms)
[Web Vitals] CLS: 0.08 [good] ✓ Within budget (0.1)
```

### Performance Metrics

Log all performance metrics:

```typescript
import { logPerformanceMetrics } from '@/lib/analytics';

logPerformanceMetrics();
// [Performance Metrics]
//   dns: 15ms
//   tcp: 28ms
//   ttfb: 142ms
//   download: 89ms
//   domInteractive: 456ms
//   domComplete: 892ms
//   loadComplete: 1024ms
//   fp: 234ms
//   fcp: 456ms
```

## Privacy & Compliance

### Vercel Analytics
- **No cookies** - Uses beacon API
- **GDPR compliant** - No personal data collection
- **Privacy-friendly** - Aggregated data only

### GTM Events
- **Hashed IDs** - Order IDs and company names hashed for privacy
- **Sanitized data** - No PII in events
- **Cookie consent** - Respects user consent preferences

### Cookie Consent

GTM only loads after user consent via `/src/components/CookieConsent.tsx`.

## Monitoring & Alerts

### Vercel Dashboard

Access analytics at:
- **Analytics:** https://vercel.com/[team]/[project]/analytics
- **Speed Insights:** https://vercel.com/[team]/[project]/speed-insights

### GTM Dashboard

Configure in Google Tag Manager:
- Real-time event monitoring
- Custom dashboards for KPIs
- Alerts for budget violations

### Recommended Alerts

Set up alerts for:
1. **LCP > 2.5s** - Performance degradation
2. **CLS > 0.1** - Layout stability issues
3. **Conversion rate drop** - Pre-order tracking
4. **Error rate spike** - Form/API errors

## Performance Optimization

### Budget Compliance Checklist

- [ ] LCP ≤2.0s (target from CLAUDE.md)
- [ ] TBT ≤150ms
- [ ] CLS ≤0.1
- [ ] FID ≤100ms
- [ ] INP ≤200ms
- [ ] TTFB ≤600ms
- [ ] Lighthouse Score ≥95

### Optimization Tips

1. **Reduce LCP:**
   - Optimize images (WebP, responsive srcsets)
   - Preload critical resources
   - Use CDN for static assets
   - Minimize render-blocking resources

2. **Reduce CLS:**
   - Reserve space for images/ads
   - Use `aspect-ratio` CSS
   - Avoid inserting content above existing content
   - Preload fonts with `font-display: swap`

3. **Reduce TBT/FID/INP:**
   - Code split large bundles
   - Defer non-critical JavaScript
   - Use web workers for heavy computation
   - Optimize event handlers

4. **Reduce TTFB:**
   - Use edge caching (Vercel Edge)
   - Optimize API routes
   - Enable compression
   - Use HTTP/2

## Testing

### Local Testing

```bash
# Start development server
npm run dev

# Check console for Web Vitals logs
# Open DevTools → Console
# Look for [Web Vitals] and [Analytics] logs
```

### Production Testing

1. Deploy to Vercel
2. Open Vercel Analytics dashboard
3. Monitor Web Vitals in real-time
4. Check GTM dataLayer in browser DevTools

### Budget Validation

```typescript
import { PERFORMANCE_BUDGETS, VITALS_THRESHOLDS } from '@/lib/analytics';

console.log('Budgets:', PERFORMANCE_BUDGETS);
console.log('Thresholds:', VITALS_THRESHOLDS);
```

## Files Modified

- `/src/app/layout.tsx` - Added Analytics, SpeedInsights, WebVitalsReporter
- `/src/lib/analytics.ts` - Extended with Web Vitals tracking
- `/src/components/WebVitalsReporter.tsx` - Created Web Vitals reporter
- `/vercel.json` - Created Vercel configuration
- `/package.json` - Added @vercel/analytics and @vercel/speed-insights

## Environment Variables

No additional environment variables required. Analytics work out of the box.

**Optional:**
- `NEXT_PUBLIC_GTM_ID` - Google Tag Manager ID (already configured)

## References

- [Vercel Analytics Docs](https://vercel.com/docs/analytics)
- [Vercel Speed Insights Docs](https://vercel.com/docs/speed-insights)
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Web Vitals](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)
- CLAUDE.md - Performance budgets and KPIs

## Support

For questions or issues:
1. Check Vercel Analytics dashboard
2. Review console logs in development
3. Validate GTM dataLayer events
4. Contact team for dashboard access
