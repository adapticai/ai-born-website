# Analytics Integration Examples

Production-ready examples for using Vercel Analytics and Web Vitals tracking.

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [Web Vitals Tracking](#web-vitals-tracking)
3. [Custom Event Tracking](#custom-event-tracking)
4. [Audience Segmentation](#audience-segmentation)
5. [Conversion Tracking](#conversion-tracking)
6. [Performance Monitoring](#performance-monitoring)

---

## Basic Setup

The analytics are already integrated into the layout. No additional setup required.

**Files:**
- ✅ `/src/app/layout.tsx` - Analytics, SpeedInsights, WebVitalsReporter
- ✅ `/src/lib/analytics.ts` - All tracking functions
- ✅ `/src/components/WebVitalsReporter.tsx` - Web Vitals integration
- ✅ `/vercel.json` - Vercel configuration

---

## Web Vitals Tracking

### Automatic Tracking

Web Vitals are automatically tracked via the `WebVitalsReporter` component.

**What's tracked:**
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- INP (Interaction to Next Paint)
- TTFB (Time to First Byte)
- FCP (First Contentful Paint)

**Where to view:**
1. **Vercel Dashboard:** https://vercel.com/[team]/[project]/analytics
2. **GTM dataLayer:** Check browser DevTools console in development
3. **Google Analytics:** Configure in GTM

### Manual Tracking

```typescript
'use client';

import { useEffect } from 'react';
import { onCLS, onFID, onLCP } from 'web-vitals';
import { trackWebVital } from '@/lib/analytics';

export function MyComponent() {
  useEffect(() => {
    // Track specific metrics manually
    onCLS(trackWebVital);
    onFID(trackWebVital);
    onLCP(trackWebVital);
  }, []);

  return <div>My Component</div>;
}
```

### Custom Performance Tracking

```typescript
'use client';

import { useEffect } from 'react';
import { getPerformanceMetrics, logPerformanceMetrics } from '@/lib/analytics';

export function PerformanceDebugger() {
  useEffect(() => {
    // Get performance metrics
    const metrics = getPerformanceMetrics();
    console.log('Performance:', metrics);

    // Or log to console (development only)
    logPerformanceMetrics();
  }, []);

  return null;
}
```

---

## Custom Event Tracking

### Pre-order Click

```typescript
'use client';

import { trackPreorderClick } from '@/lib/analytics';

export function PreOrderButton() {
  const handleClick = () => {
    // Track pre-order click (conversion event)
    trackPreorderClick(
      'amazon',      // retailer
      'hardcover',   // format
      'US',          // geo
      'launch-week'  // campaign (optional)
    );

    // Redirect to retailer
    window.open('https://amazon.com/...', '_blank');
  };

  return (
    <button onClick={handleClick}>
      Pre-order on Amazon
    </button>
  );
}
```

### Hero CTA Click

```typescript
'use client';

import { trackHeroCTAClick } from '@/lib/analytics';

export function HeroCTA() {
  const handleExcerptClick = () => {
    trackHeroCTAClick(
      'excerpt',     // cta_id
      'hardcover',   // format (current selection)
      'US'          // geo (from context/localStorage)
    );

    // Show excerpt modal or scroll to form
  };

  const handlePreorderClick = () => {
    trackHeroCTAClick(
      'preorder',
      'hardcover',
      'US',
      'amazon'      // retailer (optional)
    );

    // Open retailer menu
  };

  return (
    <div>
      <button onClick={handleExcerptClick}>Get Free Excerpt</button>
      <button onClick={handlePreorderClick}>Pre-order Now</button>
    </div>
  );
}
```

### Lead Capture Form

```typescript
'use client';

import { useState } from 'react';
import { trackLeadCapture, trackFormError } from '@/lib/analytics';

export function ExcerptForm() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'hero-excerpt' })
      });

      if (response.ok) {
        // Track successful capture
        trackLeadCapture('hero-excerpt', true);

        // Show success message
        alert('Check your email for the excerpt!');
      } else {
        // Track failure
        trackLeadCapture('hero-excerpt', false);

        // Track error
        trackFormError(
          'lead-capture',
          response.status === 429 ? 'rate-limit' : 'server',
          'email'
        );
      }
    } catch (error) {
      // Track network error
      trackLeadCapture('hero-excerpt', false);
      trackFormError('lead-capture', 'network');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit">Get Free Excerpt</button>
    </form>
  );
}
```

### Framework Card Interaction

```typescript
'use client';

import { useState } from 'react';
import { trackFrameworkCardOpen } from '@/lib/analytics';

export function FrameworkCard({ slug, title, content }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    if (!isOpen) {
      // Track card open (only on open, not close)
      trackFrameworkCardOpen(slug, title);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div onClick={handleToggle}>
      <h3>{title}</h3>
      {isOpen && <div>{content}</div>}
    </div>
  );
}
```

### FAQ Interaction

```typescript
'use client';

import { trackFAQOpen } from '@/lib/analytics';

export function FAQItem({ id, question, answer }: Props) {
  const handleOpen = () => {
    // Track FAQ open
    trackFAQOpen(
      id,
      question.substring(0, 50) // First 50 chars
    );
  };

  return (
    <details onClick={handleOpen}>
      <summary>{question}</summary>
      <p>{answer}</p>
    </details>
  );
}
```

### Scroll Depth Tracking

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { trackScrollDepth } from '@/lib/analytics';

export function ScrollTracker() {
  const trackedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent =
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;

      // Track at 25%, 50%, 75%, 100% milestones
      [25, 50, 75, 100].forEach((milestone) => {
        if (scrollPercent >= milestone && !trackedRef.current.has(milestone)) {
          trackedRef.current.add(milestone);
          trackScrollDepth(milestone as 25 | 50 | 75 | 100);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
}
```

---

## Audience Segmentation

### Track User Segments

```typescript
'use client';

import { useEffect } from 'react';
import { trackAudience } from '@/lib/analytics';

export function AudienceTracker() {
  useEffect(() => {
    // Check if returning visitor
    const visits = parseInt(localStorage.getItem('visit_count') || '0');
    if (visits > 1) {
      trackAudience('returning-visitor');
    } else {
      trackAudience('first-time-visitor');
    }

    // Track UTM source
    const params = new URLSearchParams(window.location.search);
    const source = params.get('utm_source');
    if (source) {
      trackAudience(`source-${source}`);
    }

    // Track if VIP code redeemed
    const hasVIPAccess = localStorage.getItem('vip_access') === 'true';
    if (hasVIPAccess) {
      trackAudience('vip-code-redeemed');
    }

    // Track pre-order status
    const hasPreordered = localStorage.getItem('has_preordered') === 'true';
    if (hasPreordered) {
      trackAudience('pre-order-customer');
    }
  }, []);

  return null;
}
```

---

## Conversion Tracking

### Pre-order Conversion

```typescript
'use client';

import { trackConversion, trackPreorderClick } from '@/lib/analytics';

export function CheckoutButton() {
  const handleClick = () => {
    const retailer = 'amazon';
    const format = 'hardcover';
    const price = 29.99;

    // Track pre-order click
    trackPreorderClick(retailer, format, 'US');

    // Track conversion with value
    trackConversion('pre-order', price, {
      retailer,
      format,
      geo: 'US',
      campaign: 'launch-week'
    });

    // Mark as preordered
    localStorage.setItem('has_preordered', 'true');

    // Redirect to retailer
    window.open('https://amazon.com/...', '_blank');
  };

  return <button onClick={handleClick}>Pre-order - $29.99</button>;
}
```

### Newsletter Signup Conversion

```typescript
'use client';

import { trackConversion, trackNewsletterSubscribe } from '@/lib/analytics';

export function NewsletterForm() {
  const handleSubmit = async (email: string) => {
    // Submit to API
    await fetch('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    // Track newsletter subscription
    trackNewsletterSubscribe('footer', true);

    // Track as conversion (lead)
    trackConversion('newsletter-signup', undefined, {
      source: 'footer'
    });
  };

  return <form onSubmit={(e) => {
    e.preventDefault();
    handleSubmit(new FormData(e.currentTarget).get('email') as string);
  }}>
    <input type="email" name="email" required />
    <button>Subscribe</button>
  </form>;
}
```

---

## Performance Monitoring

### Check Performance Budgets

```typescript
'use client';

import { useEffect } from 'react';
import { PERFORMANCE_BUDGETS, getPerformanceMetrics } from '@/lib/analytics';

export function PerformanceBudgetChecker() {
  useEffect(() => {
    // Wait for page to fully load
    window.addEventListener('load', () => {
      const metrics = getPerformanceMetrics();

      // Check TTFB budget
      if (metrics.ttfb > PERFORMANCE_BUDGETS.TTFB) {
        console.warn(
          `⚠️ TTFB exceeds budget: ${metrics.ttfb}ms > ${PERFORMANCE_BUDGETS.TTFB}ms`
        );
      }

      // Check FCP
      if (metrics.fcp > 1800) {
        console.warn(`⚠️ FCP is slow: ${metrics.fcp}ms`);
      }

      console.log('Performance Budgets:', PERFORMANCE_BUDGETS);
      console.log('Current Metrics:', metrics);
    });
  }, []);

  return null;
}
```

### Real-time Performance Dashboard

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getPerformanceMetrics, PERFORMANCE_BUDGETS } from '@/lib/analytics';

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<Record<string, number>>({});

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(getPerformanceMetrics());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      background: 'black',
      color: 'white',
      padding: '1rem',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <h4>Performance Metrics</h4>
      <div>TTFB: {metrics.ttfb?.toFixed(0)}ms (budget: {PERFORMANCE_BUDGETS.TTFB}ms)</div>
      <div>FCP: {metrics.fcp?.toFixed(0)}ms</div>
      <div>DOM Interactive: {metrics.domInteractive?.toFixed(0)}ms</div>
      <div>Load Complete: {metrics.loadComplete?.toFixed(0)}ms</div>
    </div>
  );
}
```

---

## Testing Analytics

### Development Testing

```typescript
'use client';

import { useEffect } from 'react';
import { trackEvent, trackWebVital } from '@/lib/analytics';

export function AnalyticsTest() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Test custom event
      trackEvent({
        event: 'test_event',
        test_property: 'test_value'
      });

      // Check dataLayer
      console.log('dataLayer:', window.dataLayer);

      // Test Web Vitals
      console.log('Web Vitals tracking is active');
    }
  }, []);

  return null;
}
```

### GTM Preview Mode

1. Open Google Tag Manager
2. Click "Preview"
3. Enter your site URL
4. Verify events are firing in Tag Assistant

### Browser Console Testing

```javascript
// In browser console, check dataLayer
window.dataLayer

// Should show array of events:
// [
//   { event: 'web_vitals', metric_name: 'LCP', ... },
//   { event: 'hero_cta_click', cta_id: 'preorder', ... },
//   ...
// ]
```

---

## Environment-Specific Behavior

### Development
- All events logged to console
- Performance budgets displayed on load
- Web Vitals logged with budget validation

### Production
- Silent operation (no console logs)
- Events sent to GTM dataLayer
- Metrics sent to Vercel Analytics

### Testing the difference:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('[Analytics]', event);
} else {
  // Silent in production
}
```

---

## Common Patterns

### Component with Multiple Tracking Events

```typescript
'use client';

import { useState } from 'react';
import {
  trackRetailerMenuOpen,
  trackPreorderClick,
  trackRegionSwitch
} from '@/lib/analytics';

export function RetailerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [region, setRegion] = useState<GeoRegion>('US');

  const handleOpen = () => {
    trackRetailerMenuOpen('hero');
    setIsOpen(true);
  };

  const handleRegionChange = (newRegion: GeoRegion) => {
    trackRegionSwitch(region, newRegion);
    setRegion(newRegion);
  };

  const handleRetailerClick = (retailer: string) => {
    trackPreorderClick(retailer, 'hardcover', region);
    window.open(`https://${retailer}.com/...`, '_blank');
  };

  return (
    <div>
      <button onClick={handleOpen}>Choose Retailer</button>
      {isOpen && (
        <div>
          <select onChange={(e) => handleRegionChange(e.target.value as GeoRegion)}>
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
          </select>
          <button onClick={() => handleRetailerClick('amazon')}>Amazon</button>
          <button onClick={() => handleRetailerClick('barnes-noble')}>Barnes & Noble</button>
        </div>
      )}
    </div>
  );
}
```

---

## Debugging

### Check if Analytics are Working

```typescript
// In browser console:

// 1. Check if dataLayer exists
console.log('dataLayer:', window.dataLayer);

// 2. Check if Vercel Analytics loaded
console.log('Vercel Analytics:', window.va);

// 3. Trigger test event
window.dataLayer?.push({ event: 'test', test_property: 'test' });

// 4. Check recent events
window.dataLayer?.slice(-5)
```

### Common Issues

**1. Events not appearing in GTM:**
- Check if GTM ID is set in `.env.local`
- Verify cookie consent was given
- Check if GTM container is published

**2. Web Vitals not tracking:**
- Verify `WebVitalsReporter` is in layout
- Check browser console for Web Vitals logs
- Wait for metrics to be captured (may take a few seconds)

**3. Vercel Analytics not showing data:**
- Ensure deployed to Vercel
- Wait up to 24 hours for data to appear
- Check Analytics is enabled in Vercel dashboard

---

## Best Practices

1. **Always track conversions** - Pre-orders, email captures, etc.
2. **Use audience segments** - Track user types for better insights
3. **Monitor performance budgets** - Stay within CLAUDE.md targets
4. **Test in development** - Verify events before deploying
5. **Keep events consistent** - Follow the defined schemas in `/src/types/analytics.ts`

---

## Reference

See `/ANALYTICS.md` for full documentation.
