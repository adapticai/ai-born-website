# A/B Testing Framework Documentation

Complete guide to the production-ready A/B testing framework for the AI-Born landing page.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Core Concepts](#core-concepts)
4. [Usage Examples](#usage-examples)
5. [API Reference](#api-reference)
6. [Admin Dashboard](#admin-dashboard)
7. [Analytics Integration](#analytics-integration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The A/B testing framework provides a complete solution for running controlled experiments on the AI-Born landing page. It includes:

- **Deterministic variant assignment** - Users consistently see the same variant
- **Cookie-based persistence** - Assignments survive page reloads
- **Statistical analysis** - Built-in chi-squared test for significance
- **GTM integration** - All events tracked to Google Tag Manager
- **React components** - Easy-to-use components and hooks
- **Admin dashboard** - Visual interface for managing experiments

### Current Experiments

Based on CLAUDE.md test candidates:

1. **Hero Headline** - 3 variants testing different messaging approaches
2. **CTA Label** - 2 variants testing urgency vs exclusivity
3. **Bonus Placement** - 2 variants testing visibility vs detail

---

## Quick Start

### 1. Using Components

The simplest way to run an experiment is with the `ABTest` component:

```tsx
import { ABTest, ABVariant } from '@/components/ABTest';

function HeroSection() {
  return (
    <ABTest experiment="hero-headline">
      <ABVariant name="A">
        <h1>The job title is dying.</h1>
      </ABVariant>
      <ABVariant name="B">
        <h1>Three people. Thirty thousand outcomes.</h1>
      </ABVariant>
      <ABVariant name="C">
        <h1>From AI-enabled to AI-born.</h1>
      </ABVariant>
    </ABTest>
  );
}
```

### 2. Using Hooks

For more control, use the `useExperiment` hook:

```tsx
import { useExperiment } from '@/hooks/useExperiment';
import { getHeroHeadline } from '@/config/experiments';

function HeroSection() {
  const variant = useExperiment('hero-headline');
  const headline = getHeroHeadline(variant);

  return <h1>{headline}</h1>;
}
```

### 3. Tracking Conversions

Track conversion events to measure experiment success:

```tsx
import { useExperiment, useTrackExperiment } from '@/hooks/useExperiment';

function CTAButton() {
  const variant = useExperiment('cta-label');
  const trackConversion = useTrackExperiment('cta-label');

  const handleClick = () => {
    trackConversion('hero_cta_click', undefined, {
      cta_id: 'preorder',
      format: 'hardcover',
    });
  };

  return <button onClick={handleClick}>Pre-order Now</button>;
}
```

---

## Core Concepts

### Experiments

An experiment is a test configuration with multiple variants. Each experiment has:

- **ID** - Unique identifier (e.g., `'hero-headline'`)
- **Name** - Human-readable name
- **Variants** - 2+ variants with weights that sum to 1.0
- **Active flag** - Whether experiment is currently running
- **Traffic allocation** - Percentage of users to include (0-1)

### Variants

Variants are the different versions being tested. Each variant has:

- **ID** - Single letter/number identifier (A, B, C, etc.)
- **Name** - Descriptive name (e.g., "Labour Focus")
- **Weight** - Traffic allocation (0-1, sum must equal 1.0)
- **Description** - Optional description for documentation

### Assignment

When a user first encounters an experiment:

1. User ID is generated (stored in localStorage)
2. Hash function deterministically selects variant based on user ID + experiment ID
3. Assignment is saved to cookie (90-day expiration)
4. `experiment_assigned` event is sent to GTM

### Conversions

Conversion events track user actions within an experiment:

1. Call `trackExperiment()` with event name and optional value
2. System looks up user's variant assignment
3. `experiment_conversion` event is sent to GTM with variant context
4. Events are aggregated for statistical analysis

---

## Usage Examples

### Example 1: Hero Headline Test

Test three different headlines to maximize engagement:

```tsx
// src/components/sections/BookHero.tsx
import { ABTest, ABVariant } from '@/components/ABTest';
import { useTrackExperiment } from '@/hooks/useExperiment';

export function BookHero() {
  const trackConversion = useTrackExperiment('hero-headline');

  const handleCTAClick = (ctaId: 'preorder' | 'excerpt') => {
    trackConversion('hero_cta_click', undefined, { cta_id: ctaId });
  };

  return (
    <section className="hero">
      <ABTest experiment="hero-headline">
        <ABVariant name="A">
          <h1 className="text-6xl font-bold">The job title is dying.</h1>
        </ABVariant>
        <ABVariant name="B">
          <h1 className="text-6xl font-bold">
            Three people. Thirty thousand outcomes.
          </h1>
        </ABVariant>
        <ABVariant name="C">
          <h1 className="text-6xl font-bold">From AI-enabled to AI-born.</h1>
        </ABVariant>
      </ABTest>

      <button onClick={() => handleCTAClick('preorder')}>
        Pre-order Hardcover
      </button>
      <button onClick={() => handleCTAClick('excerpt')}>
        Get Free Excerpt
      </button>
    </section>
  );
}
```

### Example 2: CTA Label Test

Test different call-to-action labels:

```tsx
import { useExperiment, useExperimentTracking } from '@/hooks/useExperiment';
import { getCTALabel } from '@/config/experiments';

export function PreorderButton() {
  const variant = useExperiment('cta-label');
  const { trackCTAClick } = useExperimentTracking('cta-label');
  const label = getCTALabel(variant);

  return (
    <button
      onClick={() => trackCTAClick('preorder')}
      className="btn-primary"
    >
      {label}
    </button>
  );
}
```

### Example 3: Multiple Experiments

Use multiple experiments on the same component:

```tsx
import { useMultipleExperiments } from '@/hooks/useExperiment';
import { getHeroHeadline, getCTALabel } from '@/config/experiments';

export function HeroSection() {
  const variants = useMultipleExperiments(['hero-headline', 'cta-label']);

  const headline = getHeroHeadline(variants['hero-headline']);
  const ctaLabel = getCTALabel(variants['cta-label']);

  return (
    <div>
      <h1>{headline}</h1>
      <button>{ctaLabel}</button>
    </div>
  );
}
```

### Example 4: Conditional Rendering

Test different layouts or components:

```tsx
import { useExperiment } from '@/hooks/useExperiment';

export function BonusSection() {
  const variant = useExperiment('bonus-placement');

  if (variant === 'A') {
    // Show bonus in hero
    return null; // Bonus is rendered in hero instead
  }

  // Variant B - dedicated section
  return (
    <section className="bonus-section">
      <h2>Pre-order Bonus</h2>
      <p>Agent Charter Pack + COI Diagnostic</p>
    </section>
  );
}
```

---

## API Reference

### Components

#### `<ABTest>`

Wrapper component that selects and renders the appropriate variant.

**Props:**

- `experiment` (string) - Experiment ID from `experiments.ts`
- `children` (ReactNode) - `ABVariant` components
- `fallback` (ReactNode, optional) - Fallback content if no variant matches
- `className` (string, optional) - CSS class for wrapper div

**Example:**

```tsx
<ABTest experiment="hero-headline" fallback={<DefaultHeadline />}>
  <ABVariant name="A">...</ABVariant>
  <ABVariant name="B">...</ABVariant>
</ABTest>
```

#### `<ABVariant>`

Defines content for a specific variant. Must be child of `ABTest`.

**Props:**

- `name` (string) - Variant ID (A, B, C, etc.)
- `children` (ReactNode) - Content to render for this variant

---

### Hooks

#### `useExperiment(experimentId: string)`

Get assigned variant for an experiment.

**Parameters:**

- `experimentId` - Experiment ID from `experiments.ts`

**Returns:**

- `string` - Variant ID (A, B, C, etc.)

**Example:**

```tsx
const variant = useExperiment('hero-headline');
// variant = 'A', 'B', or 'C'
```

#### `useTrackExperiment(experimentId: string)`

Get tracking function for experiment conversions.

**Parameters:**

- `experimentId` - Experiment ID

**Returns:**

- `(eventName: string, value?: number, metadata?: object) => void`

**Example:**

```tsx
const trackConversion = useTrackExperiment('hero-headline');
trackConversion('preorder_click', 29.99, { retailer: 'amazon' });
```

#### `useExperimentVariant(experimentId: string)`

Get variant with additional metadata.

**Returns:**

```typescript
{
  variant: string;
  variantName: string;
  variantDescription?: string;
  experiment?: Experiment;
  isActive: boolean;
}
```

#### `useMultipleExperiments(experimentIds: string[])`

Get variants for multiple experiments.

**Parameters:**

- `experimentIds` - Array of experiment IDs

**Returns:**

- `Record<string, string>` - Map of experiment ID to variant ID

#### `useExperimentTracking(experimentId: string)`

Get pre-configured tracking functions for common events.

**Returns:**

```typescript
{
  trackCTAClick: (ctaId, metadata?) => void;
  trackPreorderClick: (retailer, metadata?) => void;
  trackLeadCapture: (source, success?) => void;
  trackBonusClaim: (retailer, success?) => void;
  trackScrollDepth: (percentage) => void;
  trackFrameworkOpen: (slug) => void;
  trackRetailerMenuOpen: () => void;
  track: (eventName, value?, metadata?) => void;
}
```

---

### Core Functions

#### `getVariant(experimentId: string, experiment: Experiment): string`

Get variant assignment for user. Handles caching and persistence.

#### `trackExperiment(experimentId: string, eventName: string, value?: number, metadata?: object): void`

Track conversion event for experiment.

#### `calculateSignificance(variants: VariantMetrics[], confidenceLevel: 90 | 95 | 99 | 99.9): SignificanceResult`

Calculate statistical significance using chi-squared test.

#### `forceVariant(experimentId: string, variantId: string, variantName: string): void`

Force specific variant for testing (overrides assignment).

#### `clearAllAssignments(): void`

Clear all experiment assignments (resets all users).

---

## Admin Dashboard

Access the admin dashboard at `/admin/experiments` to:

- View all experiments and their status
- See variant performance metrics
- Check statistical significance
- Force specific variants for testing
- Clear experiment assignments

### Dashboard Features

1. **Experiment List** - View all configured experiments
2. **Variant Metrics** - Participants, conversions, conversion rate
3. **Statistical Analysis** - Chi-squared test results
4. **Significance Test** - Confidence level, p-value, winning variant
5. **Testing Tools** - Force variants, clear assignments

### Mock Data

The dashboard currently uses mock data for demonstration. In production:

1. Connect to analytics API to fetch real metrics
2. Calculate actual conversion rates from GTM events
3. Update `generateMockStats()` function with API calls

---

## Analytics Integration

### GTM Events

The framework sends two event types to Google Tag Manager:

#### 1. `experiment_assigned`

Fired when user is assigned to a variant.

```javascript
{
  event: 'experiment_assigned',
  experiment_id: 'hero-headline',
  variant_id: 'B',
  variant_name: 'Scale Focus',
  timestamp: '2025-10-18T12:00:00.000Z'
}
```

#### 2. `experiment_conversion`

Fired when user completes a conversion goal.

```javascript
{
  event: 'experiment_conversion',
  experiment_id: 'hero-headline',
  variant_id: 'B',
  variant_name: 'Scale Focus',
  conversion_event: 'preorder_click',
  conversion_value: 29.99,
  retailer: 'amazon',
  format: 'hardcover',
  timestamp: '2025-10-18T12:05:00.000Z'
}
```

### GTM Configuration

1. **Create Triggers** for both event types
2. **Create Variables** for experiment and variant IDs
3. **Create Tags** to send data to analytics platform
4. **Set up Conversion Goals** for each conversion event

### Recommended Conversion Events

From `ConversionEvents` in `experiments.ts`:

- `hero_cta_click` - Hero CTA clicked
- `preorder_click` - Pre-order button clicked (primary conversion)
- `lead_capture_submit` - Email captured
- `bonus_claim_submit` - Bonus claimed
- `scroll_depth_*` - Scroll depth milestones
- `framework_card_open` - Framework card opened

---

## Best Practices

### 1. Experiment Design

**DO:**

- Test one variable at a time
- Run experiments for at least 1-2 weeks
- Ensure variants sum to 1.0 weight
- Set clear conversion goals
- Document experiment hypothesis

**DON'T:**

- Change experiment config mid-test
- Run too many experiments simultaneously
- Stop experiments before statistical significance
- Test minor variations (need meaningful difference)

### 2. Variant Weights

```typescript
// Equal distribution (recommended for most experiments)
variants: [
  { id: 'A', weight: 0.5, ... },
  { id: 'B', weight: 0.5, ... },
]

// Unequal distribution (use cautiously)
variants: [
  { id: 'A', weight: 0.8, ... }, // Control - 80%
  { id: 'B', weight: 0.2, ... }, // Risky variant - 20%
]
```

### 3. Traffic Allocation

```typescript
// Full traffic (default)
trafficAllocation: 1.0

// Partial rollout (50% of users)
trafficAllocation: 0.5
```

### 4. Conversion Tracking

**Track meaningful actions:**

```tsx
// Good - primary conversion
trackConversion('preorder_click', 29.99);

// Good - secondary metric
trackConversion('lead_capture_submit');

// Bad - not meaningful for experiment
trackConversion('mouse_move');
```

### 5. Statistical Significance

- **Minimum sample size:** 100+ conversions per variant
- **Confidence level:** 95% recommended (99% for major changes)
- **P-value threshold:** ≤0.05 for significance
- **Improvement:** Look for ≥10% lift over control

### 6. Debugging

```tsx
// Check current assignments in console
import { getAllAssignments } from '@/lib/ab-testing';
console.log(getAllAssignments());

// Force specific variant for testing
import { forceVariant } from '@/lib/ab-testing';
forceVariant('hero-headline', 'B', 'Scale Focus');

// Clear assignments to test new assignment
import { clearAllAssignments } from '@/lib/ab-testing';
clearAllAssignments();
```

---

## Troubleshooting

### Problem: User sees different variant on each page load

**Solution:** Check that cookies are enabled. Assignments are stored in cookies with 90-day expiration.

### Problem: Experiment not showing up in dashboard

**Solution:** Ensure experiment is added to `experiments.ts` registry:

```typescript
export const experiments: Record<string, Experiment> = {
  'my-experiment': myExperiment,
};
```

### Problem: Conversion events not tracked

**Solution:** Verify:

1. GTM container is loaded
2. `window.dataLayer` is defined
3. Conversion event name matches `ConversionEvents` enum
4. User is assigned to experiment (check cookie)

### Problem: Statistical test shows "not significant" with good data

**Solution:**

- Increase sample size (need more participants)
- Run experiment longer
- Check if difference is large enough (need ≥10% improvement)
- Verify conversion rates are being calculated correctly

### Problem: Variants not distributed evenly

**Solution:** Check variant weights sum to 1.0:

```typescript
// Incorrect - sums to 0.99
variants: [
  { id: 'A', weight: 0.33, ... },
  { id: 'B', weight: 0.33, ... },
  { id: 'C', weight: 0.33, ... },
]

// Correct - sums to 1.0
variants: [
  { id: 'A', weight: 0.33, ... },
  { id: 'B', weight: 0.33, ... },
  { id: 'C', weight: 0.34, ... },
]
```

---

## Adding New Experiments

### Step 1: Define Experiment

Add to `src/config/experiments.ts`:

```typescript
export const myExperiment: Experiment = {
  id: 'my-experiment',
  name: 'My Experiment Name',
  description: 'Test description',
  active: true,
  variants: [
    { id: 'A', name: 'Control', weight: 0.5 },
    { id: 'B', name: 'Treatment', weight: 0.5 },
  ],
  trafficAllocation: 1.0,
};

// Add to registry
export const experiments: Record<string, Experiment> = {
  ...existingExperiments,
  'my-experiment': myExperiment,
};
```

### Step 2: Create Variant Content

```typescript
export const myExperimentVariants = {
  A: 'Control content',
  B: 'Treatment content',
} as const;

export function getMyExperimentContent(variantId: string): string {
  return myExperimentVariants[variantId as 'A' | 'B'] || myExperimentVariants.A;
}
```

### Step 3: Use in Component

```tsx
import { ABTest, ABVariant } from '@/components/ABTest';

function MyComponent() {
  return (
    <ABTest experiment="my-experiment">
      <ABVariant name="A">Control content</ABVariant>
      <ABVariant name="B">Treatment content</ABVariant>
    </ABTest>
  );
}
```

### Step 4: Track Conversions

```tsx
import { useTrackExperiment } from '@/hooks/useExperiment';

function MyComponent() {
  const trackConversion = useTrackExperiment('my-experiment');

  const handleConversion = () => {
    trackConversion('my_conversion_event', value, metadata);
  };

  return <button onClick={handleConversion}>Convert</button>;
}
```

---

## Performance Considerations

The A/B testing framework is optimized for performance:

- **Minimal JS bundle:** ~5KB gzipped
- **No render blocking:** Assignments computed client-side
- **Efficient hashing:** Deterministic variant selection
- **Cookie storage:** Faster than localStorage
- **SSR compatible:** Returns default variant on server, assigns on client

### CLS Prevention

To prevent Cumulative Layout Shift:

1. **Reserve space** for variant content
2. **Use same dimensions** across variants
3. **Preload critical variants** if needed

```tsx
// Good - same height for all variants
<ABTest experiment="hero-headline">
  <ABVariant name="A">
    <h1 className="h-20">Short headline</h1>
  </ABVariant>
  <ABVariant name="B">
    <h1 className="h-20">Longer headline text</h1>
  </ABVariant>
</ABTest>
```

---

## License

This A/B testing framework is part of the AI-Born landing page codebase.

Copyright 2025 Mic Press, LLC.
