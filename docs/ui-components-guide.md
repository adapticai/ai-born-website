# Base UI Components Guide

## Overview

This document provides comprehensive documentation for the base UI components created for the AI-Born landing page. All components are fully typed with TypeScript, accessible (WCAG 2.2 AA), and integrate with the brand system.

**Location:** `/src/components/ui/`

**Created:** October 16, 2025
**Task:** Phase 2, Task 2.1 - Base UI Components

---

## Components

### 1. Section Component

**File:** `section.tsx`

Wrapper component for page sections with consistent padding, spacing, and support for full-width backgrounds.

#### Props

```typescript
interface SectionProps {
  id?: string;              // For anchor links and navigation
  className?: string;       // Additional CSS classes
  children: React.ReactNode; // Section content
  fullWidth?: boolean;      // Extend beyond container (default: false)
  variant?: 'default' | 'light' | 'dark' | 'accent'; // Background variant
}
```

#### Usage Examples

```tsx
import { Section } from '@/components/ui';

// Basic section
<Section id="hero">
  <h1>Hero Content</h1>
</Section>

// Dark variant (for hero sections)
<Section id="hero" variant="dark">
  <Heading as="h1">The job title is dying.</Heading>
</Section>

// Light variant (for contrast)
<Section id="overview" variant="light">
  <Container>
    <Heading as="h2">What the Book Argues</Heading>
  </Container>
</Section>

// Accent variant (gradient background)
<Section id="frameworks" variant="accent">
  <Container>
    {/* Framework cards */}
  </Container>
</Section>
```

#### Features

- ✅ Consistent vertical padding (py-16 md:py-24)
- ✅ Full-width background support
- ✅ Brand color variants
- ✅ Semantic HTML (`<section>` element)
- ✅ Anchor link support via `id` prop

---

### 2. Container Component

**File:** `container.tsx`

Max-width centered container with responsive horizontal padding.

#### Props

```typescript
interface ContainerProps {
  className?: string;       // Additional CSS classes
  children: React.ReactNode; // Container content
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
}
```

#### Usage Examples

```tsx
import { Container } from '@/components/ui';

// Default 7xl max-width (recommended for most sections)
<Container>
  <h1>Centered Content</h1>
</Container>

// Smaller max-width for focused content
<Container maxWidth="2xl">
  <Text variant="large">
    A focused paragraph with optimal line length.
  </Text>
</Container>

// Full width (no max-width constraint)
<Container maxWidth="full">
  {/* Full-width content */}
</Container>
```

#### Features

- ✅ Default max-width: 7xl (80rem / 1280px)
- ✅ Responsive horizontal padding (px-4 sm:px-6 lg:px-8)
- ✅ Center alignment (mx-auto)
- ✅ Multiple max-width variants

---

### 3. Heading Component

**File:** `heading.tsx`

Typography component for headings using Outfit font with consistent sizing scale.

#### Props

```typescript
interface HeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; // Semantic level
  variant?: 'h1' | 'h2' | 'h3' | 'h4';           // Visual variant
  className?: string;       // Additional CSS classes
  children: React.ReactNode; // Heading text
}
```

#### Usage Examples

```tsx
import { Heading } from '@/components/ui';

// Hero headline (h1)
<Heading as="h1" variant="h1">
  The job title is dying.
</Heading>

// Section heading (h2)
<Heading as="h2" variant="h2">
  What You'll Learn
</Heading>

// Subsection heading (h3)
<Heading as="h3" variant="h3">
  The Five Planes
</Heading>

// Semantic vs. Visual: h3 element with h2 styling
<Heading as="h3" variant="h2">
  Visually prominent but semantically h3
</Heading>

// With custom styles
<Heading as="h2" className="text-brand-cyan">
  Accented Heading
</Heading>
```

#### Features

- ✅ Uses Outfit font family (font-outfit variable)
- ✅ Responsive sizing (mobile → desktop)
- ✅ Proper semantic HTML
- ✅ Separation of semantic level (`as`) and visual style (`variant`)

#### Size Scale

| Variant | Mobile Size | Desktop Size | Weight |
|---------|------------|--------------|--------|
| h1      | text-5xl   | text-7xl     | bold (700) |
| h2      | text-4xl   | text-5xl     | bold (700) |
| h3      | text-3xl   | text-4xl     | semibold (600) |
| h4      | text-2xl   | text-3xl     | semibold (600) |

---

### 4. Text Component

**File:** `text.tsx`

Body text component using Inter font with variants for different text sizes.

#### Props

```typescript
interface TextProps {
  variant?: 'body' | 'large' | 'small' | 'caption'; // Text size
  as?: 'p' | 'span' | 'div';     // HTML element (default: 'p')
  className?: string;             // Additional CSS classes
  children: React.ReactNode;      // Text content
}
```

#### Usage Examples

```tsx
import { Text } from '@/components/ui';

// Large lead text
<Text variant="large">
  A definitive blueprint for organisations designed around
  autonomous intelligence—where machines scale the how, and
  humans choose a why worthy of the power we wield.
</Text>

// Default body text
<Text variant="body">
  This is standard paragraph text optimized for readability
  with proper line-height and spacing.
</Text>

// Small text
<Text variant="small">
  Fine print, captions, or auxiliary information.
</Text>

// Caption text (muted)
<Text variant="caption">
  Image caption or metadata text.
</Text>

// As a span (inline)
<Text as="span" variant="body">
  Inline text element
</Text>
```

#### Features

- ✅ Uses Inter font family (font-inter variable)
- ✅ Optimal line-height for readability
- ✅ Multiple size variants
- ✅ Flexible HTML element rendering

#### Size Scale

| Variant | Size     | Line Height | Use Case |
|---------|----------|-------------|----------|
| large   | text-xl (md:text-2xl) | leading-relaxed | Lead paragraphs, subheadings |
| body    | text-base | leading-relaxed | Standard body text |
| small   | text-sm   | leading-normal  | Fine print, captions |
| caption | text-xs   | leading-normal  | Metadata, timestamps |

---

### 5. Link Component

**File:** `link.tsx`

Enhanced Next.js Link with automatic external link detection and analytics tracking.

#### Props

```typescript
interface LinkProps {
  href: string;              // Link destination
  className?: string;        // Additional CSS classes
  children: React.ReactNode; // Link text/content
  showExternalIcon?: boolean; // Show external link icon (default: false)
  trackClick?: boolean;      // Track analytics (default: true)
  analyticsData?: Record<string, unknown>; // Custom analytics data
  external?: boolean;        // Force external behavior
}
```

#### Usage Examples

```tsx
import { Link } from '@/components/ui';

// Internal link (uses Next.js Link)
<Link href="/about">About Us</Link>

// External link (opens in new tab)
<Link href="https://amazon.com" showExternalIcon>
  Buy on Amazon
</Link>

// External link without tracking
<Link href="https://example.com" trackClick={false}>
  Visit Example
</Link>

// With custom analytics data
<Link
  href="https://amazon.com/ai-born"
  analyticsData={{
    retailer: 'amazon',
    format: 'hardcover',
    source: 'hero'
  }}
>
  Pre-order on Amazon
</Link>

// Force external behavior for relative URL
<Link href="/external-redirect" external>
  External Redirect
</Link>
```

#### Features

- ✅ Automatic external link detection
- ✅ Opens external links in new tab (target="_blank")
- ✅ Security attributes (rel="noopener noreferrer")
- ✅ Analytics tracking via trackEvent()
- ✅ Optional external link icon (lucide-react)
- ✅ Focus-visible ring for accessibility
- ✅ Hover state (text-brand-cyan)

#### Analytics

External links automatically track:
- Event: `outbound_link_click`
- Properties: `link_url`, `link_text`
- Merges with custom `analyticsData`

---

### 6. AnimatedCard Component

**File:** `animated-card.tsx`

Card component with Framer Motion animations for hover and tap interactions.

#### Props

```typescript
interface AnimatedCardProps {
  className?: string;        // Additional CSS classes
  children: React.ReactNode; // Card content
  enableHover?: boolean;     // Enable hover animation (default: true)
  enableTap?: boolean;       // Enable tap animation (default: true)
  hoverScale?: number;       // Hover scale factor (default: 1.02)
  tapScale?: number;         // Tap scale factor (default: 0.98)
  duration?: number;         // Animation duration in seconds (default: 0.2)
  disableReducedMotion?: boolean; // Override prefers-reduced-motion
}
```

#### Usage Examples

```tsx
import {
  AnimatedCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui';

// Basic animated card
<AnimatedCard>
  <CardHeader>
    <CardTitle>The Five Planes</CardTitle>
    <CardDescription>
      Data, Models, Agents, Orchestration, Governance
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>Framework description...</p>
  </CardContent>
</AnimatedCard>

// Custom animation settings
<AnimatedCard
  hoverScale={1.05}
  duration={0.3}
  enableTap={false}
>
  <CardContent>
    <h3>Custom Animation</h3>
  </CardContent>
</AnimatedCard>

// Disable hover (tap only)
<AnimatedCard enableHover={false}>
  <CardContent>Tap-only card</CardContent>
</AnimatedCard>

// Grid of framework cards
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {frameworks.map((framework) => (
    <AnimatedCard key={framework.slug}>
      <CardHeader>
        <CardTitle>{framework.title}</CardTitle>
        <CardDescription>{framework.description}</CardDescription>
      </CardHeader>
    </AnimatedCard>
  ))}
</div>
```

#### Features

- ✅ Smooth scale animations (transform: scale)
- ✅ Respects prefers-reduced-motion
- ✅ Hover and tap states
- ✅ Customizable animation parameters
- ✅ Built on shadcn Card component
- ✅ Enhanced shadow on hover
- ✅ Brand-cyan border on hover

#### Animation Details

- **Hover:** scale(1.02) + shadow-xl + border-brand-cyan/50
- **Tap:** scale(0.98)
- **Duration:** 200ms (hover), 100ms (tap)
- **Easing:** easeOut
- **Reduced Motion:** Animations disabled if user prefers reduced motion

---

## Integration with Brand System

All components use the brand color system defined in `tailwind.config.ts`:

```typescript
colors: {
  brand: {
    obsidian: '#0a0a0f',  // Dark background
    cyan: '#00d9ff',      // Primary accent
    ember: '#ff9f40',     // Secondary accent
    porcelain: '#fafafa', // Light background
  }
}
```

### Typography

- **Headings:** Outfit font (--font-outfit)
- **Body:** Inter font (--font-inter)
- Both fonts loaded in `layout.tsx` with preload and swap

---

## Accessibility Features

All components follow WCAG 2.2 AA guidelines:

### Section
- ✅ Semantic HTML (`<section>`)
- ✅ ID for anchor navigation

### Container
- ✅ Responsive padding for mobile readability
- ✅ Optimal max-width for reading

### Heading
- ✅ Proper heading hierarchy
- ✅ Semantic level separate from visual style

### Text
- ✅ Proper line-height (1.625 for body text)
- ✅ Readable font sizes

### Link
- ✅ Focus-visible ring
- ✅ External link indication
- ✅ Keyboard accessible
- ✅ Security attributes for external links

### AnimatedCard
- ✅ Respects prefers-reduced-motion
- ✅ Keyboard accessible (can disable tap for keyboard-only)
- ✅ Focus indicators inherited from Card

---

## Usage Patterns

### Typical Page Section

```tsx
import { Section, Container, Heading, Text } from '@/components/ui';

export function OverviewSection() {
  return (
    <Section id="overview" variant="light">
      <Container>
        <Heading as="h2" variant="h2" className="mb-6">
          What the Book Argues
        </Heading>
        <Text variant="large" className="mb-8">
          AI-Born reframes the enterprise as a cognitive system...
        </Text>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Value propositions */}
        </div>
      </Container>
    </Section>
  );
}
```

### Framework Cards Grid

```tsx
import {
  AnimatedCard,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui';

export function FrameworksGrid({ frameworks }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {frameworks.map((framework) => (
        <AnimatedCard key={framework.slug}>
          <CardHeader>
            <CardTitle className="font-outfit text-2xl">
              {framework.title}
            </CardTitle>
            <CardDescription>
              {framework.description}
            </CardDescription>
          </CardHeader>
        </AnimatedCard>
      ))}
    </div>
  );
}
```

### Call-to-Action Links

```tsx
import { Link } from '@/components/ui';

export function RetailerLinks({ retailers }) {
  return (
    <div className="flex flex-col gap-3">
      {retailers.map((retailer) => (
        <Link
          key={retailer.id}
          href={retailer.url}
          showExternalIcon
          analyticsData={{
            event: 'preorder_click',
            retailer: retailer.name,
            format: 'hardcover'
          }}
          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-brand-cyan"
        >
          <span>{retailer.name}</span>
        </Link>
      ))}
    </div>
  );
}
```

---

## Import Convenience

All components are exported from a central index:

```tsx
// Import all at once
import {
  Section,
  Container,
  Heading,
  Text,
  Link,
  AnimatedCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui';

// Or import individually
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
```

---

## Testing

### Component Verification

```bash
# TypeScript compilation check
npx tsc --noEmit

# Run dev server
npm run dev
```

### Manual Testing Checklist

- [ ] Section: Verify anchor links work
- [ ] Container: Check responsive padding on mobile
- [ ] Heading: Verify font-outfit is loaded
- [ ] Text: Check line-height is readable
- [ ] Link: Test external links open in new tab
- [ ] Link: Verify analytics tracking in browser console
- [ ] AnimatedCard: Test hover animation
- [ ] AnimatedCard: Test with prefers-reduced-motion enabled

---

## Next Steps

These base components are ready for use in Phase 3 section components:

- ✅ Hero Section (Task 3.1)
- ✅ Overview Section (Task 3.2)
- ✅ Frameworks Section (Task 3.3)
- ✅ Excerpt/Bonus Section (Task 3.4)
- ✅ Author Section (Task 3.5)
- ✅ Endorsements Section (Task 3.6)
- ✅ Media/Press Section (Task 3.7)
- ✅ Bulk Orders Section (Task 3.8)
- ✅ FAQ Section (Task 3.9)
- ✅ Footer Section (Task 3.10)

---

## File Locations

```
/src/components/ui/
├── section.tsx          # Section wrapper
├── container.tsx        # Max-width container
├── heading.tsx          # Typography - headings
├── text.tsx             # Typography - body text
├── link.tsx             # Enhanced Next.js Link
├── animated-card.tsx    # Animated card with Framer Motion
└── index.ts             # Central export file
```

---

## Summary

✅ **6 base UI components created**
✅ **All components fully typed with TypeScript**
✅ **Integrated with brand color system**
✅ **Accessibility compliant (WCAG 2.2 AA)**
✅ **Analytics tracking integrated**
✅ **Framer Motion animations**
✅ **Responsive and mobile-friendly**
✅ **Documented with usage examples**

**Task 2.1 Complete** ✓
