# AI-Born Landing Page — Technical Requirements

**Project:** AI-Born Book Landing Page (ai-born.org)
**Version:** 1.0
**Date:** 16 October 2025
**Purpose:** Single-page marketing site to drive US pre-orders, capture leads, and provide media resources

---

## Project Overview

**Book Title:** *AI-Born: The Machine Core, the Human Cortex, and the Next Economy of Being*
**Author:** Mehran Granfar
**Primary Goal:** Drive 6,000+ US pre-orders before launch; 10,000–12,000 week-one sales across diversified retailers (NYT-friendly distribution)

---

## Success Criteria (KPIs)

### Primary Metrics
- **Pre-orders:** ≥6,000 US units before on-sale date
- **Launch week total:** 10,000–12,000 combined formats across multiple retailers
- **Email sign-ups:** ≥10,000 qualified leads
- **Media kit downloads:** ≥1,000
- **Week-1 reviews:** ≥150 on Amazon/Goodreads (target 4.6★+)

### Engagement Metrics
- **Hero CTA CTR:** ≥4.5%
- **Landing → retailer click-through:** ≥25%
- **Lead magnet conversion:** ≥10%

### Performance Budgets
- **LCP (Largest Contentful Paint):** ≤2.0s on 4G
- **TBT (Total Blocking Time):** ≤150ms
- **CLS (Cumulative Layout Shift):** ≤0.1
- **Lighthouse Score:** ≥95

---

## Brand System & Visual Language

### Design Philosophy
**Mood:** Institutional, near-future, serious — *architecture over spectacle*

### Colour Palette
Define as CSS custom properties and Tailwind tokens:

```css
:root {
  --brand-obsidian: #0a0a0f;      /* Backgrounds, midnight ink */
  --brand-cyan: #00d9ff;          /* Machine flowlines, primary accent */
  --brand-ember: #ff9f40;         /* Human halo, secondary accent */
  --brand-porcelain: #fafafa;     /* Body copy, high-contrast text */
}
```

**Tailwind config:**
```js
colors: {
  'brand-obsidian': 'var(--brand-obsidian)',
  'brand-cyan': 'var(--brand-cyan)',
  'brand-ember': 'var(--brand-ember)',
  'brand-porcelain': 'var(--brand-porcelain)',
}
```

### Typography
- **Headlines:** Google Fonts **Outfit** (weights: 600, 700, 800)
- **Body:** Google Fonts **Inter** (weights: 400, 500, 600)
- **Preload:** Hero font weights for LCP optimization

### Layout Principles
- Grid-based with generous negative space
- 2xl rounded corners (`rounded-2xl`)
- Soft shadows for UI cards (Tailwind `shadow-lg`, `shadow-xl`)
- Avoid parallax effects to maintain CLS ≤0.1

### Motion & Animation
- **Library:** Framer Motion
- **Duration:** 200–300ms
- **Easing:** `ease-out` for natural feel
- **Reduced motion:** Respect `prefers-reduced-motion` media query
- **CLS prevention:** Reserve space for animated elements

### Imagery
- **Hero:** 3D hardcover + eBook mockup (1×, 2× resolution, WebP format)
- **Motif:** Subtle animated "cortex ↔ core" visual element
- **Format:** Next.js Image with responsive srcsets, lazy loading below fold
- **Alt text:** Descriptive for all images

---

## Technical Stack

### Core Framework
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **React:** Latest stable
- **Styling:** Tailwind CSS 3.x + shadcn/ui components
- **Animation:** Framer Motion
- **Forms:** React Hook Form + Zod validation

### Performance & Rendering
- **Rendering strategy:** Server-side rendering (SSR) for SEO
- **Edge caching:** Cloudflare/Vercel Edge for fast global delivery
- **Image optimization:** `next/image` with responsive srcsets
- **Format:** WebP with JPEG/PNG fallbacks
- **Lazy loading:** Below-fold content and images

### Backend & APIs
- **Email capture:** Lightweight API endpoint (rate-limited)
- **Bonus claim:** File upload verification + secure delivery
- **Email delivery:** Transactional service (SendGrid/Postmark/Resend)
- **Storage:** Minimal (S3/R2 for press kit assets)
- **Rate limiting:** Per-IP, per-endpoint (prevent spam)

### Hosting & Deployment
- **Host:** Vercel (recommended) or similar edge platform
- **CDN:** Integrated with host or Cloudflare
- **Environment:** Staging + Production
- **CI/CD:** GitHub Actions or Vercel auto-deploy

---

## Information Architecture

Single-scroll modular layout with smooth anchor navigation:

1. **Hero** — Cover, thesis, dual CTAs
2. **Social Proof Strip** — Endorsement mosaic + logos
3. **What the Book Argues** — Overview section
4. **What You'll Learn** — Key frameworks (expandable cards)
5. **Free Excerpt / Pre-order Bonus** — Email gate
6. **About the Author** — Bio + press kit CTA
7. **Endorsements** — Expandable testimonials
8. **For Media & Partners** — Press kit, speaking requests
9. **Corporate & Bulk Orders** — NYT-friendly guidance
10. **FAQ** — Collapsible questions
11. **Email Capture + Social** — Newsletter sign-up
12. **Footer** — Retailer list, legal, privacy, imprint

---

## Section Specifications

### 1. Hero Section

**Objective:** Immediate clarity + purchase action

**Layout:**
- Left: 3D cover render + format toggles (hardcover/eBook/audiobook)
- Right: Headline, subhead, dual CTAs
- Below: Social proof strip

**Headline Variants (A/B test ready):**
- A: *"The job title is dying."*
- B: *"Three people. Thirty thousand outcomes."*
- C: *"From AI-enabled to AI-born."*

**Subhead:**
*"A definitive blueprint for organisations designed around autonomous intelligence—where machines scale the **how**, and humans choose a **why** worthy of the power we wield."*

**Primary CTAs:**
- **Pre-order Hardcover** → Retailer smart-menu
- **Get Free Excerpt** → Email gate (instant PDF)

**Retailer Smart-Menu:**
- Geo-aware (default: US; manual toggle: UK/EU/AU)
- Retailers: Amazon, Barnes & Noble, Bookshop.org, Apple Books, Google Play, Kobo
- Each link includes UTM tracking

**Analytics Events:**
```js
// Hero CTA click
{
  event: 'hero_cta_click',
  cta_id: 'preorder' | 'excerpt',
  format: 'hardcover' | 'ebook' | 'audiobook',
  retailer: string,
  geo: 'US' | 'UK' | 'EU' | 'AU'
}

// Retailer menu interaction
{
  event: 'retailer_menu_open',
  origin_section: 'hero' | 'footer'
}

// Outbound pre-order click
{
  event: 'preorder_click',
  retailer: string,
  format: string
}
```

---

### 2. Social Proof Strip

**Objective:** Establish credibility in 3 seconds

**Content:**
- 4–6 short endorsement blurbs (≤140 characters each)
- 6–10 outlet/programme logos (earned media or expected coverage)

**Analytics:**
```js
{ event: 'social_proof_view' }  // Impression tracking
{ event: 'endorsement_expand', endorsement_id: string }
```

---

### 3. Overview — What the Book Argues

**Objective:** Convey stakes + scope; convert skimmers

**Copy (90–110 words):**
*"This is not another book about AI tools. **AI-Born** is a field manual for designing institutions where autonomous agents execute, learn, and adapt—and where humans provide intent, judgement, and taste. Blending systems architecture with moral philosophy, it shows how to rebuild the enterprise for an age when three people can orchestrate what once took thirty thousand. You'll learn the Five Planes of AI-native design, the Defensibility Stack that replaces traditional moats, and the governance patterns that keep power aligned with purpose. Pragmatic, rigorous, and hopeful—this is the blueprint for moving from AI-enabled to **AI-born**."*

**Bulleted Value Props (choose 5):**
- Architecture over hacks: The Five Planes for AI-native organisations
- Governance that scales: The New Triumvirate; steward ownership; trust rails
- Defensibility Stack: Architecture, Governance, Evolution speed, Trust, Distribution
- Human role redefined: Intent, judgement, taste as the new leverage
- Pragmatic transition: Reskilling, portable benefits, participation dividends

**Analytics:**
```js
{ event: 'overview_read_depth', pct: number }  // Scroll depth tracking
```

---

### 4. What You'll Learn — Key Frameworks

**Format:** 5 expandable/hoverable cards

**Frameworks:**
1. **The Five Planes** — Data, Models, Agents, Orchestration, Governance
2. **Iteration Half-Life** — Compressing cycles as a competitive moat
3. **Cognitive Overhead Index** — Measuring institutional drag
4. **New Triumvirate** — Architect, Intent-Setter, Guardian roles
5. **Defensibility Stack** — Where moats live in AI-native era

**CTA:** *Read a free chapter* (scroll-to excerpt section)

**Analytics:**
```js
{ event: 'framework_card_open', slug: string }
```

---

### 5. Free Excerpt & Pre-order Bonus

**Mechanics:**
1. User enters email → instant PDF delivery (design-polished excerpt)
2. Auto-email includes download link + launch updates opt-in

**Pre-order Bonus:**
- Upload proof of purchase → receive **Agent Charter Pack**
- Includes: VP-agent templates, sub-agent ladders, escalation/override protocols
- Plus: **Cognitive Overhead Index (COI)** diagnostic mini-tool (Google Sheet)

**Copy (55–75 words):**
*"Pre-order **AI-Born** and claim the **Agent Charter Pack**—VP-agent templates, sub-agent ladders, escalation/override protocols—plus a mini **Cognitive Overhead Index** diagnostic. Upload proof of purchase (any retailer) to receive your pack by email within 24 hours."*

**Analytics:**
```js
{ event: 'lead_capture_submit', source: string }
{ event: 'bonus_claim_submit', retailer: string, order_id_hash: string }
```

---

### 6. About the Author

**Bio (site-optimized, 60–80 words):**
*"Mehran Granfar is Founder & CEO of **Adaptic.ai**, an AI-born institutional platform fusing autonomous intelligence with modern finance. A systems architect and strategic futurist, he works where AI, governance, and economic design meet—helping organisations evolve from AI-enabled to AI-native."*

**CTA:** Download full bio + headshots (press kit)

**Analytics:**
```js
{ event: 'author_press_download' }
```

---

### 7. Endorsements

**Layout:** 6 featured quotes in grid; expandable list for more

**Requirements:**
- ≤40 words per testimonial tile
- Show name, title, affiliation
- High-contrast typography for readability

**Analytics:**
```js
{ event: 'endorsement_tab_change', tab_id: string }
```

---

### 8. For Media & Partners

**Contents:**
- One-page synopsis (PDF)
- Press release (embargo-capable)
- High-res cover art
- Author headshots (multiple poses, formats)
- Chapter list
- Selected excerpts
- Interview topics
- Contact form (routes to PR inbox)

**CTAs:**
- *Request galley*
- *Book an interview*

**Analytics:**
```js
{ event: 'presskit_download', asset_type: string }
{ event: 'media_request_submit', request_type: string }
```

---

### 9. Corporate & Bulk Orders

**NYT-Friendly Guidance:**
- Purchase via **multiple retailers/locations**
- Recommend **regional store partners** for distributed invoicing
- Coordinate **multi-store fulfillment**

**CTA:** *Coordinate distributed bulk orders* (contact form)

**Analytics:**
```js
{ event: 'bulk_interest_submit', qty_band: string }
```

---

### 10. FAQ

**Truncate/expand pattern**

**Topics:**
- Formats & retailers
- Shipping times
- How pre-orders work
- Bonus claim process
- Accessibility of excerpt
- Media/speaking requests

**Analytics:**
```js
{ event: 'faq_open', question_id: string }
```

---

### 11. Email Capture

**Offer:** *Get the free excerpt + launch invites*

**Form Fields:**
- Name (optional)
- Email (required)

**Compliance:**
- Double opt-in
- One-click unsubscribe
- GDPR/CCPA compliant

**Analytics:**
```js
{ event: 'newsletter_subscribed', source_referrer: string }
```

---

### 12. Footer

**Content:**
- Retailer list (repeat from hero)
- Imprint/publisher info
- Privacy policy link
- Terms of service
- Copyright notice
- Social links

---

## Copy Bank (Production-Ready)

### Hero Headline (Choose One)
- *"The job title is dying."*
- *"Three people. Thirty thousand outcomes."*
- *"From AI-enabled to AI-born."*

### Hero Subhead
*"A blueprint for AI-native organisations—machines scale the **how**; humans choose the **why**."*

### CTA Labels
- *Pre-order hardcover*
- *Get free excerpt*
- *See all retailers*

### Elevator Pitch
*"When three people can orchestrate what once required 30,000, the enterprise—and human purpose—must be redesigned from first principles. **AI-Born** is the blueprint for that transformation."*

### Single-Line Hook
*"The machines will scale the **how**. Can we choose a **why** worthy of the power we now wield?"*

---

## SEO & Metadata

### Meta Tags
```html
<title>AI-Born — The Blueprint for AI-Native Organisations | Mehran Granfar</title>
<meta name="description" content="A definitive field manual for building AI-native enterprises—architecture, governance, and the human role when machines scale execution." />
```

### Open Graph
```html
<meta property="og:title" content="AI-Born | Mehran Granfar" />
<meta property="og:description" content="The blueprint for AI-native organisations." />
<meta property="og:image" content="https://ai-born.org/og-image.jpg" />
<meta property="og:type" content="book" />
<meta property="og:url" content="https://ai-born.org" />
```

### Twitter Card
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="AI-Born | Mehran Granfar" />
<meta name="twitter:description" content="The blueprint for AI-native organisations." />
<meta name="twitter:image" content="https://ai-born.org/twitter-card.jpg" />
```

### JSON-LD Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "Book",
  "name": "AI-Born: The Machine Core, the Human Cortex, and the Next Economy of Being",
  "author": {
    "@type": "Person",
    "name": "Mehran Granfar",
    "jobTitle": "Founder & CEO",
    "affiliation": {
      "@type": "Organization",
      "name": "Adaptic.ai"
    }
  },
  "workExample": [
    {
      "@type": "BookFormatType",
      "bookFormat": "Hardcover"
    },
    {
      "@type": "BookFormatType",
      "bookFormat": "EBook"
    }
  ],
  "publisher": {
    "@type": "Organization",
    "name": "Adaptic Press"
  },
  "inLanguage": "en",
  "genre": ["Business", "Technology", "Economics"],
  "offers": [
    {
      "@type": "Offer",
      "availability": "https://schema.org/PreOrder",
      "price": "TBD",
      "priceCurrency": "USD"
    }
  ]
}
```

### Sitemap
- Index LP + media kit pages
- Canonical tags on all pages
- robots.txt: Allow all, sitemap reference

---

## Analytics & Tracking

### Tooling
- **GTM (Google Tag Manager)** for event management
- **Privacy-friendly analytics** (Plausible, Fathom, or similar)
- **Server-side events** where possible for accuracy

### DataLayer Schema
```js
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'preorder_click',
  book: 'ai-born',
  retailer: 'amazon',
  format: 'hardcover',
  geo: 'US',
  campaign: 'launch-week'
});
```

### Key Events
- `hero_cta_click`
- `retailer_menu_open`
- `preorder_click` (conversion event)
- `lead_capture_submit`
- `bonus_claim_submit`
- `framework_card_open`
- `overview_read_depth`
- `social_proof_view`
- `presskit_download`
- `media_request_submit`
- `bulk_interest_submit`
- `faq_open`
- `newsletter_subscribed`

### A/B Test Candidates
- Hero headline (3 variants)
- CTA label ('Pre-order now' vs 'Reserve your copy')
- Bonus placement (hero vs dedicated section)

### Attribution
- UTM normalization across all outbound links
- Campaign IDs per channel (email, social, paid, PR)
- Nightly export to data warehouse for restock coordination

---

## Accessibility (WCAG 2.2 AA)

### Requirements
- **Semantic HTML5:** Proper landmarks (`<nav>`, `<main>`, `<aside>`, `<footer>`)
- **Heading hierarchy:** Logical h1–h6 structure
- **Focus states:** Visible for keyboard navigation
- **Colour contrast:** ≥4.5:1 for body text, ≥3:1 for large text
- **Alt text:** Descriptive for all images
- **Form labels:** Associated with inputs
- **ARIA:** Use sparingly, only when semantic HTML insufficient
- **Keyboard navigation:** All interactive elements accessible via Tab/Enter/Space
- **Reduced motion:** Respect `prefers-reduced-motion` media query
- **Screen reader testing:** NVDA (Windows), VoiceOver (macOS)

### Testing Checklist
- [ ] Lighthouse Accessibility score ≥95
- [ ] axe DevTools scan (0 violations)
- [ ] Keyboard-only navigation test
- [ ] Screen reader test (NVDA + VoiceOver)
- [ ] Colour contrast check (all text)
- [ ] Focus indicator visible on all interactive elements

---

## Internationalization & Geo-Targeting

### Default
- **Primary market:** United States
- **Language:** British English spelling throughout

### Geo-Aware Features
- **Retailer list:** Default to US retailers; manual region switcher
- **Regions:** US, UK, EU, AU
- **Currency:** Display in local currency if applicable (future enhancement)

### Manual Region Switcher
- Dropdown or toggle in header/footer
- Persists selection in localStorage
- Updates retailer links dynamically

---

## Security & Compliance

### Form Security
- **Rate limiting:** Per-IP (e.g., 10 requests/hour)
- **Spam protection:** Honeypot field + hCaptcha/Turnstile (if needed)
- **Input validation:** Server-side with Zod schemas
- **HTTPS:** Enforce across entire site

### Privacy
- **Privacy policy:** Linked in footer
- **Cookie consent:** Opt-in where required (GDPR/CCPA)
- **Data retention:** Clear policy for email list and uploads
- **Email security:** SPF, DKIM, DMARC configured

### Compliance
- **GDPR:** EU users have right to erasure, portability
- **CCPA:** California users have opt-out rights
- **CAN-SPAM:** One-click unsubscribe in all emails

---

## Asset Checklist

### Images
- **COVER-3D-HARD** — 3D hardcover PNGs (1×, 2×, WebP)
- **COVER-3D-EBOOK** — eBook device mockups
- **OG-IMAGE** — 1200×630px (cover + branding)
- **LOGOS-MOSAIC** — Press/institutional logos (SVG preferred)

### Video
- **TRAILER-S** — 15–30s social trailer (1:1, 9:16, 16:9 formats)

### Documents
- **EXCERPT-PDF** — Design-polished sample chapter (accessible)
- **PRESS-KIT-ZIP** — Covers, headshots, synopsis, chapter list, logos
- **BONUS-PACK** — Agent Charter Pack + COI diagnostic (Google Sheet)

### Fonts
- **Outfit** (600, 700, 800) — Preload for hero
- **Inter** (400, 500, 600)

---

## Engineering Task Mapping

### Frontend
- **FE-LP-001** Build LP with sections per IA; responsive; SSR; edge cache
- **FE-LP-002** Retailer smart-menu with geo-default + manual override; outbound click tracking
- **FE-LP-003** Email gate + bonus claim flow (file upload, backend verify, secure delivery)
- **FE-LP-004** Press kit auto-zip + CDN delivery
- **FE-LP-005** Analytics events + dataLayer; GTM containers; consent banner
- **FE-LP-006** Accessibility QA; keyboard nav; reduced-motion support
- **FE-LP-007** SEO implementation (meta, OG, JSON-LD, sitemap)

### Backend
- **BE-LP-001** Minimal API for claim verification + mailing; rate-limit + spam filter
- **BE-LP-002** Email delivery integration (transactional service)
- **BE-LP-003** File upload handling (proof of purchase for bonus)

### Operations
- **OPS-LP-001** Retailer link management + UTM governance; nightly KPI export
- **OPS-LP-002** CDN configuration + edge caching rules
- **OPS-LP-003** Analytics dashboard setup (GTM + privacy-friendly tool)

---

## Acceptance Criteria (Definition of Done)

### Performance
- [ ] Lighthouse score ≥95 (Performance, Accessibility, Best Practices, SEO)
- [ ] LCP ≤2.0s on 4G
- [ ] TBT ≤150ms
- [ ] CLS ≤0.1

### Functionality
- [ ] All CTAs functional and tracked
- [ ] Retailer links validated (all geo variants)
- [ ] Email gate delivers excerpt <60s post-submit
- [ ] Bonus claim flow works end-to-end
- [ ] Press kit auto-generates and downloads

### Accessibility
- [ ] Screen reader pass (NVDA + VoiceOver)
- [ ] Keyboard navigation test pass
- [ ] Colour contrast ≥4.5:1 (body text)
- [ ] Reduced motion support

### Analytics
- [ ] All events firing with correct schemas
- [ ] GTM container verified in production
- [ ] Conversion tracking tested (outbound clicks)

### Legal
- [ ] Privacy policy live and linked
- [ ] Cookie consent banner (if required)
- [ ] Bonus T&Cs visible and clear

### SEO
- [ ] Meta tags complete (title, description, OG, Twitter)
- [ ] JSON-LD structured data validated
- [ ] Sitemap generated and submitted
- [ ] Canonical tags in place

---

## Timeline (2–3 Day Build)

**Assumes parallel asset delivery**

### Day 1: Structure + Core
- Next.js project setup (TypeScript, Tailwind, shadcn/ui)
- Hero section + retailer menu
- Email gate (excerpt delivery)
- Basic analytics events

### Day 2: Content + Features
- All remaining sections (social proof → footer)
- Press kit download functionality
- Bonus claim flow (upload + verification)
- Accessibility QA
- SEO implementation

### Day 3: Polish + Launch
- Content polish (copy, imagery)
- A/B test variants setup
- Performance optimization (image formats, lazy loading)
- Final QA (cross-browser, device testing)
- Production deployment

---

## Language & Tone Guidelines

### Voice
- **Authoritative but accessible:** Speak with confidence without condescension
- **Serious but hopeful:** Acknowledge stakes while maintaining optimism
- **Precise language:** Avoid marketing fluff; choose specific terms
- **British spelling:** Use throughout (e.g., "organisations", "labour")

### Formatting Conventions
- **Em dashes:** Use for parenthetical statements (e.g., "the enterprise—and human purpose—must be redesigned")
- **Bold for emphasis:** Key terms and concepts (**AI-Born**, **Agent Charter Pack**)
- **Sentence case:** Headlines and CTAs (e.g., "Pre-order hardcover" not "Pre-Order Hardcover")

### Prohibited
- Marketing superlatives ("revolutionary", "game-changing")
- Hype language ("amazing", "incredible")
- Unnecessary exclamation marks
- Emoji (except where explicitly approved)

---

## Content Management (Future)

### CMS Fields (if headless CMS added later)
- **Book Metadata:** Title, subtitle, author, publisher, ISBN
- **Formats:** Hardcover, eBook, audiobook (price, availability, retailers)
- **Retailers:** Name, logo, geo-availability, URL templates
- **Endorsements:** Quote, name, title, affiliation, featured flag
- **Events:** Title, date, location, registration link
- **Media Kit:** PDFs, images, videos (versioned)
- **FAQ:** Question, answer, display order
- **Bonuses:** Title, description, eligibility, asset links

---

## Support & Maintenance

### Post-Launch Tasks
- Monitor analytics daily (first 2 weeks)
- A/B test winning variants → make permanent
- Address form spam if patterns emerge
- Update retailer links if changes occur
- Respond to media requests <24h
- Track NYT list eligibility (distributed sales reporting)

### Technical Maintenance
- Weekly uptime checks
- Monthly dependency updates (security patches)
- Quarterly performance audits
- Annual accessibility re-certification

---

## Questions for Stakeholders

- [ ] Final hardcover price (for structured data)
- [ ] Official on-sale date (for countdown feature)
- [ ] Publisher imprint name (for footer + structured data)
- [ ] ISBN-13 (for structured data + retailer deep-linking)
- [ ] Press embargo dates (if applicable)
- [ ] Preferred transactional email service
- [ ] GA4/GTM property IDs
- [ ] Social media handles (for footer links)

---

## References & Links

- **Figma/Design:** [Insert link when available]
- **Asset Repository:** [Insert Dropbox/Drive link]
- **Analytics Dashboard:** [Insert link post-setup]
- **Staging Site:** [Insert URL]
- **Production Site:** https://ai-born.org

---

*This document is the single source of truth for the AI-Born landing page. All development, content, and design decisions should reference this spec.*

**Last updated:** 16 October 2025
**Maintained by:** Project lead (update as needed)
