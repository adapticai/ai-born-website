# AI-Born Landing Page — Development Roadmap

**Project:** ai-born.org
**Timeline:** 2–3 days (with parallel execution)
**Version:** 1.0
**Last updated:** 16 October 2025

---

## Execution Strategy

This roadmap is designed for **parallel execution** by multiple Claude Code sessions or agent swarms. Tasks marked with 🔀 can run concurrently. Tasks marked with 🔗 have dependencies and must run sequentially.

### How to Use This Roadmap
1. **Copy entire task blocks** into separate Claude Code sessions
2. **Execute Phase 1 first** (foundation tasks)
3. **Run Phase 2–4 in parallel** (maximum 4–6 concurrent sessions)
4. **Execute Phase 5 sequentially** (integration dependencies)
5. **Run Phase 6–7 in parallel** (testing & polish)

---

## Phase 1: Foundation & Setup (Sequential)
**Duration:** 2–4 hours | **Parallelizable:** No

### Task 1.1: Project Initialization 🔗
**Session ID:** `FOUNDATION-INIT`
**Dependencies:** None
**Deliverables:** Working Next.js project with TypeScript, Tailwind, and shadcn/ui

#### Instructions for Claude Code:
```
Create a new Next.js 14 project for the AI-Born landing page with the following requirements:

1. Initialize Next.js with App Router, TypeScript, Tailwind CSS
   - Run: npx create-next-app@latest ai-born-website --typescript --tailwind --app
   - Configure for src/ directory structure
   - Enable experimental features if needed for App Router

2. Install core dependencies:
   - shadcn/ui (component library)
   - framer-motion (animations)
   - react-hook-form + @hookform/resolvers + zod (forms)
   - next/font (Google Fonts optimization)

3. Configure Tailwind with brand colours:
   - Add custom colours to tailwind.config.ts:
     * brand-obsidian: #0a0a0f
     * brand-cyan: #00d9ff
     * brand-ember: #ff9f40
     * brand-porcelain: #fafafa
   - Set up CSS custom properties in globals.css

4. Set up shadcn/ui:
   - Run: npx shadcn-ui@latest init
   - Configure with default settings
   - Install initial components: button, card, form, input, textarea

5. Create base directory structure:
   /src
     /app (Next.js App Router)
     /components (UI components)
       /ui (shadcn components)
       /sections (page sections)
     /lib (utilities)
     /types (TypeScript types)
     /styles (global styles)
   /public
     /images
     /assets
     /fonts

6. Configure fonts:
   - Set up Google Fonts (Outfit, Inter) in app/layout.tsx
   - Preload Outfit 700 for hero headline (LCP optimization)

7. Create basic layout:
   - app/layout.tsx with metadata
   - app/page.tsx placeholder
   - Basic SEO metadata structure

8. Test build:
   - Run: npm run dev
   - Verify: http://localhost:3000 loads

9. Initialize git repository (if not already):
   - git init
   - Create .gitignore (node_modules, .next, .env.local, etc.)
   - Initial commit

Reference: See CLAUDE.md sections "Technical Stack" and "Brand System"
```

---

### Task 1.2: TypeScript Types & Interfaces 🔗
**Session ID:** `FOUNDATION-TYPES`
**Dependencies:** Task 1.1 (project exists)
**Deliverables:** Complete type definitions

#### Instructions for Claude Code:
```
Create TypeScript types for the AI-Born landing page:

1. Create /src/types/index.ts with interfaces for:
   - Book (title, subtitle, author, formats, retailers)
   - Retailer (name, url, logo, geo, format)
   - Endorsement (quote, name, title, affiliation, featured)
   - Framework (slug, title, description, icon)
   - FAQ (id, question, answer)
   - MediaKit (assets: synopsis, pressRelease, covers, headshots)
   - Analytics event schemas (all events from CLAUDE.md)

2. Create /src/types/analytics.ts for GTM dataLayer events:
   - HeroCTAClick
   - PreorderClick
   - LeadCaptureSubmit
   - BonusClaimSubmit
   - etc. (see CLAUDE.md "Analytics & Tracking")

3. Create /src/types/forms.ts for Zod schemas:
   - EmailCaptureSchema (name?, email)
   - BonusClaimSchema (email, orderId, receipt file)
   - MediaRequestSchema (name, email, outlet, message)
   - BulkOrderSchema (name, email, company, quantity, message)

4. Export all types from /src/types/index.ts

Reference: See CLAUDE.md "Analytics & Tracking" and form requirements
```

---

### Task 1.3: Utility Functions & Helpers 🔗
**Session ID:** `FOUNDATION-UTILS`
**Dependencies:** Task 1.2 (types exist)
**Deliverables:** Reusable utility functions

#### Instructions for Claude Code:
```
Create utility functions for the AI-Born landing page:

1. Create /src/lib/analytics.ts:
   - trackEvent(event: AnalyticsEvent) function
   - GTM dataLayer push helper
   - Safe window check for SSR

2. Create /src/lib/geo.ts:
   - detectUserGeo() → 'US' | 'UK' | 'EU' | 'AU'
   - getDefaultRetailers(geo) → Retailer[]
   - Persist geo preference in localStorage

3. Create /src/lib/retailers.ts:
   - retailerData: Record of all retailers with geo-availability
   - getRetailerUrl(retailer, format, utm) → string
   - UTM parameter builder

4. Create /src/lib/validation.ts:
   - Zod schema validators (export from types)
   - Client-side validation helpers

5. Create /src/lib/api.ts:
   - fetch wrappers for API endpoints
   - Error handling utilities
   - Rate limit retry logic

6. Create /src/lib/utils.ts (if not from shadcn):
   - cn() for className merging (clsx + tailwind-merge)
   - formatDate, debounce, throttle, etc.

Reference: See CLAUDE.md "Technical Stack" and "Analytics & Tracking"
```

---

## Phase 2: Design System & Reusable Components (Parallel)
**Duration:** 3–5 hours | **Parallelizable:** Yes (2–3 sessions)

### Task 2.1: Base UI Components 🔀
**Session ID:** `DESIGN-BASE`
**Dependencies:** Task 1.1 (project + shadcn)
**Deliverables:** Reusable UI components

#### Instructions for Claude Code:
```
Create base UI components for AI-Born landing page:

1. Install additional shadcn components:
   - npx shadcn-ui@latest add dialog dropdown-menu separator badge accordion

2. Create /src/components/ui/Section.tsx:
   - Wrapper component for each page section
   - Props: id (anchor), className, children
   - Applies consistent padding, max-width, spacing

3. Create /src/components/ui/Container.tsx:
   - Max-width container (e.g., max-w-7xl)
   - Responsive padding
   - Center alignment

4. Create /src/components/ui/Heading.tsx:
   - Variants: h1, h2, h3, h4
   - Font: Outfit (brand system)
   - Consistent sizing scale

5. Create /src/components/ui/Text.tsx:
   - Body text variants (body, small, large)
   - Font: Inter (brand system)

6. Create /src/components/ui/Link.tsx:
   - Next.js Link wrapper with analytics
   - External link icon (optional)
   - Tracks outbound clicks

7. Create /src/components/ui/AnimatedCard.tsx:
   - Card with Framer Motion hover/expand
   - Used for framework cards
   - Duration: 200–300ms, ease-out

Reference: See CLAUDE.md "Brand System & Visual Language"
```

---

### Task 2.2: CTA & Button Components 🔀
**Session ID:** `DESIGN-CTA`
**Dependencies:** Task 1.1 (project)
**Deliverables:** Button and CTA components

#### Instructions for Claude Code:
```
Create CTA and button components:

1. Create /src/components/ui/Button.tsx (if not from shadcn):
   - Variants: primary (cyan), secondary (ember), ghost
   - Sizes: sm, md, lg
   - Loading state
   - Icon support

2. Create /src/components/CTAButton.tsx:
   - Extends Button with analytics tracking
   - Props: ctaId, event tracking payload
   - Automatically calls trackEvent on click

3. Create /src/components/RetailerMenu.tsx:
   - Dropdown/modal with retailer list
   - Geo-aware (filters by region)
   - Each link tracks preorder_click event
   - Format toggle (hardcover, ebook, audiobook)
   - Visual: Retailer logo + name

4. Create /src/components/DualCTA.tsx:
   - Two side-by-side CTAs (primary + secondary)
   - Used in hero section
   - Responsive (stack on mobile)

Reference: See CLAUDE.md "Hero Section" and "Retailer Smart-Menu"
```

---

### Task 2.3: Form Components 🔀
**Session ID:** `DESIGN-FORMS`
**Dependencies:** Task 1.2 (types), Task 1.3 (validation)
**Deliverables:** Form components with validation

#### Instructions for Claude Code:
```
Create form components using react-hook-form + Zod:

1. Create /src/components/forms/EmailCaptureForm.tsx:
   - Fields: Name (optional), Email (required)
   - Zod validation (EmailCaptureSchema)
   - Submit → API endpoint → instant PDF delivery
   - Success message + auto-close
   - Error handling

2. Create /src/components/forms/BonusClaimForm.tsx:
   - Fields: Email, Order ID, Receipt upload
   - File upload (image/PDF, max 5MB)
   - Zod validation (BonusClaimSchema)
   - Submit → API verification → bonus delivery
   - Progress indicator

3. Create /src/components/forms/MediaRequestForm.tsx:
   - Fields: Name, Email, Outlet, Request Type, Message
   - Zod validation (MediaRequestSchema)
   - Routes to PR inbox
   - Spam honeypot field (hidden)

4. Create /src/components/forms/BulkOrderForm.tsx:
   - Fields: Name, Email, Company, Qty estimate, Message
   - Zod validation (BulkOrderSchema)

5. Form features (all forms):
   - Loading states
   - Error messages (inline + summary)
   - Success animations (Framer Motion)
   - Rate limit handling
   - Analytics events on submit

Reference: See CLAUDE.md "Section Specifications" (forms in sections 5, 8, 9)
```

---

## Phase 3: Section Components (Parallel)
**Duration:** 6–8 hours | **Parallelizable:** Yes (4–6 sessions)

Each section can be built independently. Copy entire task blocks into separate Claude Code sessions.

---

### Task 3.1: Hero Section 🔀
**Session ID:** `SECTION-HERO`
**Dependencies:** Task 2.1, 2.2 (UI components, CTAs)
**Deliverables:** Complete hero section

#### Instructions for Claude Code:
```
Build the hero section for AI-Born landing page:

1. Create /src/components/sections/Hero.tsx:
   - Layout: Two-column (cover left, content right) on desktop; stack on mobile
   - Left column:
     * 3D cover image (placeholder: /images/cover-3d.webp)
     * Format toggles (hardcover, ebook, audiobook) — visual pills
   - Right column:
     * Headline (A/B test variants as prop)
     * Subhead
     * DualCTA component (Pre-order + Get excerpt)
   - Below: Social proof strip (mini endorsements)

2. Headline variants (props):
   - A: "The job title is dying."
   - B: "Three people. Thirty thousand outcomes."
   - C: "From AI-enabled to AI-born."

3. Subhead (from CLAUDE.md):
   - "A definitive blueprint for organisations designed around autonomous intelligence—where machines scale the **how**, and humans choose a **why** worthy of the power we wield."

4. CTAs:
   - Primary: "Pre-order hardcover" → Opens RetailerMenu
   - Secondary: "Get free excerpt" → Opens EmailCaptureForm modal

5. Social proof strip:
   - 4–6 short endorsement quotes (≤140 chars)
   - 6–10 outlet logos (placeholder images)
   - Horizontal scroll on mobile

6. Analytics events:
   - Track hero_cta_click on CTA clicks
   - Track social_proof_view on strip impression

7. Styling:
   - Background: brand-obsidian
   - Text: brand-porcelain
   - Accent: brand-cyan (CTAs)
   - Font: Outfit for headline (700), Inter for subhead (400)
   - Generous padding, negative space

8. Animation:
   - Fade-in on load (Framer Motion)
   - Stagger headline → subhead → CTAs (100ms delays)

Reference: See CLAUDE.md "Hero Section" (§5.1)
```

---

### Task 3.2: Overview Section 🔀
**Session ID:** `SECTION-OVERVIEW`
**Dependencies:** Task 2.1 (UI components)
**Deliverables:** Overview section with value props

#### Instructions for Claude Code:
```
Build the "What the Book Argues" overview section:

1. Create /src/components/sections/Overview.tsx:
   - Section heading: "What the Book Argues"
   - Main copy (90–110 words from CLAUDE.md §5.3)
   - 5 bulleted value propositions (render as styled list or cards)

2. Copy (from CLAUDE.md):
   - Main paragraph (see §5.3)
   - Value props:
     * Architecture over hacks: The Five Planes for AI-native organisations
     * Governance that scales: The New Triumvirate; steward ownership; trust rails
     * Defensibility Stack: Architecture, Governance, Evolution speed, Trust, Distribution
     * Human role redefined: Intent, judgement, taste as the new leverage
     * Pragmatic transition: Reskilling, portable benefits, participation dividends

3. Styling:
   - Two-column layout on desktop (copy left, value props right)
   - Stack on mobile
   - Use brand-cyan for bullet icons or underlines
   - Typography: Inter 500 for copy, 600 for value props

4. Analytics:
   - Track overview_read_depth (scroll depth %)
   - Trigger at 25%, 50%, 75%, 100% scroll

5. Animation:
   - Fade-in on scroll into view
   - Stagger value props (100ms delay each)

Reference: See CLAUDE.md "Overview — What the Book Argues" (§5.3)
```

---

### Task 3.3: Frameworks Section 🔀
**Session ID:** `SECTION-FRAMEWORKS`
**Dependencies:** Task 2.1 (UI components, AnimatedCard)
**Deliverables:** Key frameworks section with expandable cards

#### Instructions for Claude Code:
```
Build the "What You'll Learn" frameworks section:

1. Create /src/components/sections/Frameworks.tsx:
   - Section heading: "What You'll Learn"
   - Subheading: "Five frameworks to rebuild your organisation"
   - Grid of 5 framework cards (AnimatedCard component)
   - CTA below grid: "Read a free chapter" (scroll to excerpt section)

2. Framework data (from CLAUDE.md §5.4):
   1. The Five Planes — Data, Models, Agents, Orchestration, Governance
   2. Iteration Half-Life — Compressing cycles as a competitive moat
   3. Cognitive Overhead Index — Measuring institutional drag
   4. New Triumvirate — Architect, Intent-Setter, Guardian roles
   5. Defensibility Stack — Where moats live in AI-native era

3. Card behavior:
   - Hover: Subtle scale (1.02) + shadow increase
   - Click/tap: Expand to show full description (modal or inline)
   - Icon for each framework (placeholder or simple geometric shape)

4. Styling:
   - Grid: 2 columns on mobile, 3 on tablet, 5 on desktop (adjust for readability)
   - Card background: Slightly lighter than obsidian (subtle contrast)
   - Border: brand-cyan on hover
   - Typography: Outfit 600 for titles, Inter 400 for descriptions

5. Analytics:
   - Track framework_card_open {slug} on expand

6. Animation:
   - Cards fade-in with stagger (100ms each)
   - Expand/collapse uses Framer Motion layout animations

Reference: See CLAUDE.md "What You'll Learn — Key Frameworks" (§5.4)
```

---

### Task 3.4: Excerpt & Bonus Section 🔀
**Session ID:** `SECTION-EXCERPT`
**Dependencies:** Task 2.3 (Form components)
**Deliverables:** Excerpt gate and bonus claim

#### Instructions for Claude Code:
```
Build the excerpt and pre-order bonus section:

1. Create /src/components/sections/ExcerptBonus.tsx:
   - Two-column layout (or tabbed interface)
   - Left: "Get Free Excerpt" — EmailCaptureForm
   - Right: "Pre-order Bonus" — BonusClaimForm

2. Free Excerpt:
   - Heading: "Read Before You Buy"
   - Copy: Short pitch for excerpt (2–3 sentences)
   - EmailCaptureForm component
   - On submit success: Instant PDF download link + confirmation message
   - Email includes: Excerpt PDF + launch updates opt-in

3. Pre-order Bonus:
   - Heading: "Claim Your Agent Charter Pack"
   - Copy (from CLAUDE.md §5.5):
     "Pre-order AI-Born and claim the Agent Charter Pack—VP-agent templates, sub-agent ladders, escalation/override protocols—plus a mini Cognitive Overhead Index diagnostic. Upload proof of purchase (any retailer) to receive your pack by email within 24 hours."
   - BonusClaimForm component
   - On submit: Backend verifies → sends bonus pack via email

4. Styling:
   - Background: Slightly lighter section for contrast
   - Forms: Card-style containers
   - CTAs: brand-ember for secondary action (bonus)

5. Analytics:
   - lead_capture_submit (excerpt form)
   - bonus_claim_submit (bonus form)

Reference: See CLAUDE.md "Free Excerpt & Pre-order Bonus" (§5.5)
```

---

### Task 3.5: Author Section 🔀
**Session ID:** `SECTION-AUTHOR`
**Dependencies:** Task 2.1 (UI components)
**Deliverables:** Author bio section

#### Instructions for Claude Code:
```
Build the "About the Author" section:

1. Create /src/components/sections/Author.tsx:
   - Section heading: "About the Author"
   - Layout: Image left, bio right (or centered on mobile)
   - Author headshot (placeholder: /images/author-headshot.jpg)
   - Bio copy (from CLAUDE.md §5.6)
   - CTA: "Download full bio + headshots" (press kit)

2. Bio (from CLAUDE.md):
   "Mehran Granfar is Founder & CEO of Adaptic.ai, an AI-born institutional platform fusing autonomous intelligence with modern finance. A systems architect and strategic futurist, he works where AI, governance, and economic design meet—helping organisations evolve from AI-enabled to AI-native."

3. CTA behavior:
   - Click → Downloads author press kit (ZIP or PDF)
   - Tracks author_press_download event

4. Styling:
   - Headshot: Circular crop, subtle cyan border/glow
   - Typography: Inter 500 for bio
   - CTA: Secondary button style (brand-ember or ghost)

5. Animation:
   - Fade-in on scroll

Reference: See CLAUDE.md "About the Author" (§5.6)
```

---

### Task 3.6: Endorsements Section 🔀
**Session ID:** `SECTION-ENDORSEMENTS`
**Dependencies:** Task 2.1 (UI components)
**Deliverables:** Endorsements section with expand

#### Instructions for Claude Code:
```
Build the endorsements section:

1. Create /src/components/sections/Endorsements.tsx:
   - Section heading: "What People Are Saying"
   - Grid of 6 featured endorsements (always visible)
   - "Show more" button → Expands to show full list

2. Endorsement data structure:
   - Quote (≤40 words per tile)
   - Name
   - Title
   - Affiliation
   - Featured flag (boolean)

3. Layout:
   - Grid: 2 columns on mobile, 3 on desktop
   - Each tile: Card with quote, attribution below
   - Hover: Subtle highlight

4. Expand behavior:
   - "Show more" reveals hidden endorsements (smooth animation)
   - "Show less" collapses back to 6

5. Styling:
   - Background: Alternating section (contrast with adjacent sections)
   - Quote marks: Large, brand-cyan
   - Typography: Inter 400 for quotes, 600 for names

6. Analytics:
   - endorsement_tab_change (if tabbed by category)
   - endorsement_expand (on show more click)

Reference: See CLAUDE.md "Endorsements" (§5.7)
```

---

### Task 3.7: Media & Press Section 🔀
**Session ID:** `SECTION-MEDIA`
**Dependencies:** Task 2.3 (MediaRequestForm)
**Deliverables:** Media kit and press section

#### Instructions for Claude Code:
```
Build the "For Media & Partners" section:

1. Create /src/components/sections/MediaPress.tsx:
   - Section heading: "For Media & Partners"
   - Subheading: "Press kit, speaking requests, and interview topics"
   - Grid of downloadable assets (cards with icons)
   - MediaRequestForm component

2. Downloadable assets (from CLAUDE.md §5.8):
   - One-page synopsis (PDF)
   - Press release (PDF, note if embargoed)
   - Cover art (high-res ZIP)
   - Author headshots (ZIP with multiple poses)
   - Chapter list (PDF)
   - Selected excerpts (PDF)
   - Interview topics (PDF)

3. Asset cards:
   - Icon + title + format + file size
   - Click → Instant download (or auto-generate ZIP)
   - Tracks presskit_download {asset_type}

4. MediaRequestForm:
   - Below asset grid
   - Heading: "Request a galley or book an interview"
   - Routes to PR inbox

5. Styling:
   - Professional, clean design
   - Icons: Document/download icons
   - CTAs: Ghost or secondary style

6. Analytics:
   - presskit_download
   - media_request_submit

Reference: See CLAUDE.md "For Media & Partners" (§5.8)
```

---

### Task 3.8: Bulk Orders Section 🔀
**Session ID:** `SECTION-BULK`
**Dependencies:** Task 2.3 (BulkOrderForm)
**Deliverables:** Corporate/bulk orders section

#### Instructions for Claude Code:
```
Build the corporate and bulk orders section:

1. Create /src/components/sections/BulkOrders.tsx:
   - Section heading: "Corporate & Bulk Orders"
   - Subheading: "NYT-friendly distributed purchasing"
   - Copy explaining distributed ordering strategy (from CLAUDE.md §5.9)
   - BulkOrderForm component

2. Copy (NYT-friendly guidance):
   - Explain option to purchase via multiple retailers/locations
   - Recommend regional store partners for distributed invoicing
   - Coordinate multi-store fulfillment
   - "Contact us to coordinate distributed bulk orders"

3. BulkOrderForm:
   - Fields: Name, Email, Company, Quantity estimate, Message
   - Submit → Routes to sales/partnerships inbox
   - Tracks bulk_interest_submit {qty_band}

4. Styling:
   - Professional tone
   - Icons: Store/distribution graphics
   - Form: Card-style container

5. Analytics:
   - bulk_interest_submit

Reference: See CLAUDE.md "Corporate & Bulk Orders" (§5.9)
```

---

### Task 3.9: FAQ Section 🔀
**Session ID:** `SECTION-FAQ`
**Dependencies:** Task 2.1 (UI components, Accordion)
**Deliverables:** FAQ section with collapsible questions

#### Instructions for Claude Code:
```
Build the FAQ section:

1. Create /src/components/sections/FAQ.tsx:
   - Section heading: "Frequently Asked Questions"
   - shadcn/ui Accordion component (collapsible Q&A)
   - 8–12 common questions

2. FAQ content (from CLAUDE.md §5.10):
   - Formats & retailers
   - Shipping times
   - How pre-orders work
   - Bonus claim process
   - Accessibility of excerpt
   - Media/speaking requests
   - Return policy (if applicable)
   - International availability

3. Accordion behavior:
   - Click question → Expands answer (smooth animation)
   - Click again → Collapses
   - Allow multiple open at once (or single-open mode)

4. Styling:
   - Typography: Outfit 600 for questions, Inter 400 for answers
   - Icons: Chevron or plus/minus indicator
   - Hover: Subtle highlight

5. Analytics:
   - faq_open {question_id}

Reference: See CLAUDE.md "FAQ" (§5.10)
```

---

### Task 3.10: Footer & Newsletter 🔀
**Session ID:** `SECTION-FOOTER`
**Dependencies:** Task 2.3 (EmailCaptureForm)
**Deliverables:** Footer with newsletter and links

#### Instructions for Claude Code:
```
Build the footer with newsletter sign-up:

1. Create /src/components/sections/Footer.tsx:
   - Newsletter sign-up (above footer proper)
   - Footer grid with links and info

2. Newsletter section:
   - Heading: "Stay Updated"
   - Copy: "Get the free excerpt + launch invites"
   - EmailCaptureForm (simplified: email only, no name)
   - Compliance note: "We respect your privacy. Unsubscribe anytime."

3. Footer grid (3–4 columns on desktop, stack on mobile):
   - Column 1: Book info (title, author, publisher)
   - Column 2: Quick links (Retailers, Press kit, FAQ, Contact)
   - Column 3: Legal (Privacy policy, Terms, Accessibility statement)
   - Column 4: Social media icons (placeholder links)

4. Retailer list (repeat from hero):
   - Amazon, Barnes & Noble, Bookshop.org, Apple Books, Google Play, Kobo
   - Each link includes UTM tracking

5. Styling:
   - Background: brand-obsidian (darkest)
   - Text: brand-porcelain with reduced opacity (0.7)
   - Links: Hover → brand-cyan
   - Social icons: Mono, subtle color on hover

6. Analytics:
   - newsletter_subscribed {source_referrer}
   - Footer link clicks (outbound)

7. Copyright notice:
   - "© 2025 Mehran Granfar. All rights reserved."

Reference: See CLAUDE.md "Email Capture" (§5.11) and "Footer" (§5.12)
```

---

## Phase 4: API Endpoints (Parallel)
**Duration:** 3–4 hours | **Parallelizable:** Yes (2–3 sessions)

### Task 4.1: Email Capture API 🔀
**Session ID:** `API-EMAIL`
**Dependencies:** Task 1.2 (types), Task 1.3 (validation)
**Deliverables:** `/api/email-capture` endpoint

#### Instructions for Claude Code:
```
Build the email capture API endpoint:

1. Create /src/app/api/email-capture/route.ts (Next.js App Router API):
   - Method: POST
   - Body: { name?: string, email: string, source?: string }
   - Validation: EmailCaptureSchema (Zod)

2. Logic:
   - Validate input (reject if invalid)
   - Check rate limit (10 requests/hour per IP)
   - Add email to mailing list (transactional service integration)
   - Send excerpt PDF via email (link or attachment)
   - Return success/error response

3. Transactional email integration:
   - Use SendGrid, Postmark, or Resend
   - Email template: Welcome + PDF link + CTA to pre-order
   - Subject: "Your free excerpt of AI-Born"

4. Rate limiting:
   - Store request counts in memory (or Redis for production)
   - Return 429 if exceeded
   - Reset counts hourly

5. Error handling:
   - 400: Invalid input
   - 429: Rate limit exceeded
   - 500: Server error (log to monitoring)

6. Response format:
   {
     success: boolean,
     message: string,
     data?: { downloadUrl: string }
   }

7. Security:
   - Validate email format
   - Sanitize inputs (prevent XSS)
   - CORS: Restrict to production domain
   - Add honeypot check (if honeypot field filled → reject silently)

Reference: See CLAUDE.md "Free Excerpt & Pre-order Bonus" (§5.5)
```

---

### Task 4.2: Bonus Claim API 🔀
**Session ID:** `API-BONUS`
**Dependencies:** Task 1.2 (types), Task 1.3 (validation)
**Deliverables:** `/api/bonus-claim` endpoint

#### Instructions for Claude Code:
```
Build the bonus claim API endpoint:

1. Create /src/app/api/bonus-claim/route.ts:
   - Method: POST
   - Body: FormData { email, orderId, receiptFile }
   - Validation: BonusClaimSchema (Zod)

2. Logic:
   - Validate inputs (email, orderId format, file type/size)
   - Rate limit: 3 requests/hour per IP
   - Upload receipt to secure storage (S3/R2)
   - Verify order (manual or automated — start with manual)
   - Send bonus pack via email (ZIP with Agent Charter Pack + COI tool)
   - Return success/error response

3. File upload:
   - Accept: image/* (JPEG, PNG), application/pdf
   - Max size: 5MB
   - Store with unique filename (hash + timestamp)
   - Temporary storage (delete after 30 days)

4. Email delivery:
   - Subject: "Your AI-Born Pre-order Bonus Pack"
   - Attach or link to ZIP file
   - Include thank-you message + social share CTA

5. Verification flow (MVP = manual):
   - Store claim in database with status (pending, approved, rejected)
   - Admin reviews receipt manually
   - On approval → trigger bonus email
   - (Future: Automated OCR or retailer API integration)

6. Error handling:
   - 400: Invalid input or file format
   - 413: File too large
   - 429: Rate limit exceeded
   - 500: Server error

7. Security:
   - Validate file MIME type (not just extension)
   - Scan for malware (if available)
   - Store receipts securely (private bucket)

Reference: See CLAUDE.md "Free Excerpt & Pre-order Bonus" (§5.5)
```

---

### Task 4.3: Media & Bulk Request APIs 🔀
**Session ID:** `API-REQUESTS`
**Dependencies:** Task 1.2 (types), Task 1.3 (validation)
**Deliverables:** `/api/media-request` and `/api/bulk-order` endpoints

#### Instructions for Claude Code:
```
Build the media request and bulk order API endpoints:

1. Create /src/app/api/media-request/route.ts:
   - Method: POST
   - Body: { name, email, outlet, requestType, message }
   - Validation: MediaRequestSchema (Zod)
   - Logic:
     * Validate inputs
     * Rate limit: 5 requests/hour per IP
     * Check honeypot field (reject if filled)
     * Send email to PR inbox (pr@adaptic.ai or similar)
     * Return success response
   - Email format:
     * Subject: "Media Request: [requestType] from [outlet]"
     * Body: Include all form fields + timestamp

2. Create /src/app/api/bulk-order/route.ts:
   - Method: POST
   - Body: { name, email, company, quantity, message }
   - Validation: BulkOrderSchema (Zod)
   - Logic:
     * Validate inputs
     * Rate limit: 5 requests/hour per IP
     * Send email to sales inbox (sales@adaptic.ai or similar)
     * Return success response
   - Email format:
     * Subject: "Bulk Order Inquiry: [company] ([quantity] copies)"
     * Body: Include all form fields + timestamp

3. Security (both endpoints):
   - Honeypot field check
   - Email validation (regex + DNS check if needed)
   - Sanitize message content (prevent XSS)
   - CORS: Restrict to production domain

4. Error handling:
   - 400: Invalid input
   - 429: Rate limit exceeded
   - 500: Server error

Reference: See CLAUDE.md "For Media & Partners" (§5.8) and "Corporate & Bulk Orders" (§5.9)
```

---

## Phase 5: Integration & Features (Sequential)
**Duration:** 4–6 hours | **Parallelizable:** Partial

### Task 5.1: Page Assembly 🔗
**Session ID:** `INTEGRATION-PAGE`
**Dependencies:** All Phase 3 tasks (sections complete)
**Deliverables:** Complete landing page

#### Instructions for Claude Code:
```
Assemble all sections into the main landing page:

1. Edit /src/app/page.tsx:
   - Import all section components
   - Render in order (per CLAUDE.md IA):
     1. Hero
     2. SocialProofStrip (if separate)
     3. Overview
     4. Frameworks
     5. ExcerptBonus
     6. Author
     7. Endorsements
     8. MediaPress
     9. BulkOrders
     10. FAQ
     11. Footer (includes newsletter)

2. Smooth scroll anchors:
   - Add id to each section for anchor navigation
   - Enable smooth scroll behavior (CSS: scroll-behavior: smooth)

3. Sticky header (optional):
   - If navigation menu added: Sticky position with smooth scroll links
   - Logo + CTAs (Pre-order, Excerpt)

4. Scroll-to-top button (optional):
   - Appears after scrolling down 50vh
   - Smooth scroll to top on click

5. Test page:
   - npm run dev
   - Verify all sections render
   - Check responsive behavior (mobile, tablet, desktop)
   - Test smooth scroll navigation

Reference: See CLAUDE.md "Information Architecture" (§3)
```

---

### Task 5.2: Analytics Implementation 🔗
**Session ID:** `INTEGRATION-ANALYTICS`
**Dependencies:** Task 5.1 (page assembled)
**Deliverables:** GTM + analytics tracking

#### Instructions for Claude Code:
```
Implement analytics tracking across the site:

1. Add Google Tag Manager:
   - Create GTM container (if not exists)
   - Add GTM script to app/layout.tsx (<head> and <body>)
   - Initialize dataLayer

2. Implement trackEvent() calls:
   - Audit all CTAs and forms
   - Add trackEvent() on:
     * hero_cta_click (hero CTAs)
     * preorder_click (retailer links)
     * lead_capture_submit (excerpt form)
     * bonus_claim_submit (bonus form)
     * framework_card_open (framework cards)
     * overview_read_depth (scroll tracking)
     * social_proof_view (impression tracking)
     * presskit_download (media downloads)
     * media_request_submit, bulk_interest_submit
     * faq_open (accordion opens)
     * newsletter_subscribed (footer form)

3. Scroll depth tracking:
   - Use IntersectionObserver or scroll event
   - Track overview_read_depth at 25%, 50%, 75%, 100%

4. Outbound link tracking:
   - Wrap all external links (retailers, social media)
   - Track click + destination

5. Test analytics:
   - Use GTM Preview mode
   - Verify all events fire correctly
   - Check dataLayer structure matches CLAUDE.md spec

6. Privacy compliance:
   - Add cookie consent banner (if required for GDPR)
   - Opt-in before initializing tracking (if needed)

Reference: See CLAUDE.md "Analytics & Tracking" (§9)
```

---

### Task 5.3: SEO Implementation 🔗
**Session ID:** `INTEGRATION-SEO`
**Dependencies:** Task 5.1 (page assembled)
**Deliverables:** Complete SEO setup

#### Instructions for Claude Code:
```
Implement SEO metadata and optimizations:

1. Update app/layout.tsx metadata:
   - Title: "AI-Born — The Blueprint for AI-Native Organisations | Mehran Granfar"
   - Description: "A definitive field manual for building AI-native enterprises—architecture, governance, and the human role when machines scale execution."
   - Open Graph tags (title, description, image, type, url)
   - Twitter Card tags (card type, title, description, image)

2. Create Open Graph image:
   - Design 1200×630px image (cover + branding)
   - Save as /public/og-image.jpg (optimized, <300KB)

3. Add JSON-LD structured data:
   - Add script tag in layout.tsx with Book schema (from CLAUDE.md §8)
   - Include: book name, author, publisher, formats, offers

4. Create sitemap:
   - Generate /public/sitemap.xml
   - Include: homepage, press kit page (if separate)
   - Submit to Google Search Console (post-launch)

5. Create robots.txt:
   - /public/robots.txt
   - Allow all, reference sitemap

6. Add canonical tag:
   - Ensure canonical URL is set to https://ai-born.org

7. Performance optimizations (SEO-related):
   - Preload critical fonts (Outfit 700)
   - Optimize images (next/image with priority on hero cover)
   - Minify CSS/JS (Next.js does this automatically)

8. Test SEO:
   - Use Lighthouse SEO audit (target: 100)
   - Verify meta tags in browser dev tools
   - Check structured data with Google Rich Results Test

Reference: See CLAUDE.md "SEO & Metadata" (§8)
```

---

## Phase 6: Testing & QA (Parallel)
**Duration:** 4–6 hours | **Parallelizable:** Yes (2–3 sessions)

### Task 6.1: Accessibility Audit 🔀
**Session ID:** `QA-ACCESSIBILITY`
**Dependencies:** Task 5.1 (page assembled)
**Deliverables:** WCAG 2.2 AA compliance

#### Instructions for Claude Code:
```
Perform accessibility audit and fixes:

1. Automated testing:
   - Run Lighthouse Accessibility audit (target: ≥95)
   - Install and run axe DevTools browser extension (target: 0 violations)
   - Fix all critical and serious issues

2. Semantic HTML audit:
   - Verify proper landmark elements (<nav>, <main>, <aside>, <footer>)
   - Check heading hierarchy (h1 → h2 → h3, no skips)
   - Ensure form labels are associated with inputs

3. Keyboard navigation test:
   - Tab through entire page (all interactive elements reachable)
   - Test Enter/Space on buttons, links
   - Test Escape to close modals
   - Verify focus indicators are visible (outline or custom style)

4. Colour contrast check:
   - Use browser tools or WebAIM contrast checker
   - Ensure ≥4.5:1 for body text, ≥3:1 for large text
   - Fix any failing combinations

5. Screen reader test:
   - Test with NVDA (Windows) or VoiceOver (macOS)
   - Verify all content is readable
   - Check alt text on images
   - Test form error announcements

6. Reduced motion support:
   - Wrap Framer Motion animations in prefers-reduced-motion check
   - Example:
     const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
     <motion.div animate={shouldReduceMotion ? {} : { opacity: 1 }} />

7. ARIA usage audit:
   - Use ARIA sparingly (prefer semantic HTML)
   - Verify correct ARIA roles, states, properties
   - Remove redundant ARIA (e.g., role="button" on <button>)

8. Document findings and fixes:
   - Create /docs/accessibility-report.md
   - List issues found + resolutions

Reference: See CLAUDE.md "Accessibility (WCAG 2.2 AA)" (§10)
```

---

### Task 6.2: Performance Audit 🔀
**Session ID:** `QA-PERFORMANCE`
**Dependencies:** Task 5.1 (page assembled)
**Deliverables:** Performance budgets met

#### Instructions for Claude Code:
```
Perform performance audit and optimizations:

1. Lighthouse Performance audit:
   - Target: ≥95 score
   - Test on throttled 4G (Lighthouse mobile mode)
   - Identify bottlenecks

2. Core Web Vitals check:
   - LCP (Largest Contentful Paint): ≤2.0s
   - TBT (Total Blocking Time): ≤150ms
   - CLS (Cumulative Layout Shift): ≤0.1

3. Image optimization:
   - Verify all images use next/image
   - Check formats: WebP with JPEG/PNG fallbacks
   - Ensure responsive srcsets (1×, 2×)
   - Lazy load below-fold images
   - Add priority to hero cover image (LCP optimization)

4. Font optimization:
   - Preload critical fonts (Outfit 700 for hero)
   - Use font-display: swap (prevent FOIT)
   - Subset fonts if possible (remove unused glyphs)

5. JavaScript optimization:
   - Check bundle size (npm run build → analyze)
   - Code-split large components (React.lazy if needed)
   - Defer non-critical JS

6. CSS optimization:
   - Purge unused Tailwind classes (automatic in production build)
   - Check for unused shadcn components

7. Caching strategy:
   - Verify static assets have long cache headers
   - Use stale-while-revalidate for images
   - Edge cache configuration (if using Vercel/Cloudflare)

8. Animation optimization:
   - Ensure animations use GPU-accelerated properties (transform, opacity)
   - Avoid animating layout properties (width, height, top, left)
   - Reserve space for animated elements (prevent CLS)

9. Test on real devices:
   - Test on actual mobile device (if available)
   - Use Chrome DevTools device emulation
   - Check performance on slow 3G

10. Document findings:
    - Create /docs/performance-report.md
    - List metrics + optimizations applied

Reference: See CLAUDE.md "Success Criteria" (performance budgets) and "Technical Spec" (§7)
```

---

### Task 6.3: Cross-browser & Device Testing 🔀
**Session ID:** `QA-COMPAT`
**Dependencies:** Task 5.1 (page assembled)
**Deliverables:** Cross-browser compatibility verified

#### Instructions for Claude Code:
```
Test cross-browser and device compatibility:

1. Browser testing (desktop):
   - Chrome (latest)
   - Firefox (latest)
   - Safari (latest)
   - Edge (latest)
   - Verify layout, interactions, animations

2. Mobile browser testing:
   - Chrome Mobile (Android)
   - Safari Mobile (iOS)
   - Test responsive breakpoints (375px, 768px, 1024px, 1440px)

3. Responsive design checks:
   - All sections stack properly on mobile
   - Text is readable (no overflow, appropriate sizes)
   - CTAs are tappable (min 44×44px touch targets)
   - Forms are usable on mobile (large inputs, appropriate keyboard types)

4. Known issues to check:
   - Safari: CSS sticky positioning
   - Firefox: Framer Motion animations
   - Mobile Safari: 100vh issues (viewport units)
   - Touch devices: Hover effects (ensure tap works)

5. Test forms:
   - Email validation works across browsers
   - File upload works on mobile
   - Error messages display correctly
   - Success states work

6. Test modals/dropdowns:
   - Retailer menu opens correctly
   - Forms in modals work
   - Close on Escape or backdrop click
   - No scroll issues (body scroll lock)

7. Test navigation:
   - Smooth scroll works (or degrades gracefully)
   - Anchor links work
   - Back button works (no broken states)

8. Document issues:
   - Create /docs/compatibility-report.md
   - List browser-specific issues + workarounds

Reference: See CLAUDE.md "Technical Spec" (§7)
```

---

## Phase 7: Content, Assets & Polish (Parallel)
**Duration:** 3–5 hours | **Parallelizable:** Yes (2–3 sessions)

### Task 7.1: Content Population 🔀
**Session ID:** `CONTENT-COPY`
**Dependencies:** Task 5.1 (page assembled)
**Deliverables:** All copy finalized

#### Instructions for Claude Code:
```
Populate all content from CLAUDE.md Copy Bank:

1. Audit all sections for placeholder text:
   - Hero headline (choose variant or set up A/B test)
   - Hero subhead
   - Overview paragraph
   - Framework descriptions
   - Author bio
   - Endorsements (populate with real/placeholder quotes)
   - FAQ answers
   - Footer copy

2. Copy source: CLAUDE.md §6 "Copy Bank"

3. Ensure consistency:
   - British spelling throughout (organisations, labour, etc.)
   - Em dashes for parenthetical statements
   - Bold for key terms (AI-Born, Agent Charter Pack, etc.)
   - Sentence case for headlines/CTAs

4. Proofread:
   - Check for typos, grammar issues
   - Verify tone matches guidelines (authoritative, hopeful, precise)
   - Remove any marketing fluff or superlatives

5. Test readability:
   - Read entire page top-to-bottom
   - Ensure logical flow
   - Check line lengths (ideal: 50–75 characters per line)

Reference: See CLAUDE.md "Copy Bank" (§6) and "Language & Tone Guidelines"
```

---

### Task 7.2: Asset Integration 🔀
**Session ID:** `CONTENT-ASSETS`
**Dependencies:** Asset delivery (external)
**Deliverables:** All images, PDFs, and media integrated

#### Instructions for Claude Code:
```
Integrate all assets from asset checklist:

1. Images (from CLAUDE.md §11 "Asset Checklist"):
   - COVER-3D-HARD (hero) → /public/images/cover-3d.webp (1×, 2×)
   - COVER-3D-EBOOK → /public/images/cover-ebook.webp
   - OG-IMAGE → /public/og-image.jpg (1200×630)
   - LOGOS-MOSAIC (social proof) → /public/images/logos/
   - Author headshot → /public/images/author-headshot.jpg

2. Documents:
   - EXCERPT-PDF → /public/assets/ai-born-excerpt.pdf
   - PRESS-KIT-ZIP → /public/assets/press-kit.zip
   - BONUS-PACK → (stored securely for email delivery)

3. Fonts (if not using Google Fonts CDN):
   - Outfit (600, 700, 800) → /public/fonts/
   - Inter (400, 500, 600) → /public/fonts/
   - Update layout.tsx to use local fonts

4. Optimize images:
   - Convert to WebP (with JPEG fallbacks)
   - Generate 1× and 2× resolutions
   - Run through image optimizer (e.g., Squoosh, ImageOptim)
   - Verify file sizes (<300KB for hero, <100KB for others)

5. Update component references:
   - Replace all placeholder image paths with real assets
   - Verify next/image src paths
   - Test all image loads correctly

6. Test downloads:
   - Click all download links (excerpt, press kit)
   - Verify files download correctly
   - Check file names are descriptive (ai-born-excerpt.pdf, not download.pdf)

Reference: See CLAUDE.md "Asset Checklist" (§11)
```

---

### Task 7.3: Visual Polish & Animations 🔀
**Session ID:** `CONTENT-POLISH`
**Dependencies:** Task 5.1 (page assembled), Task 7.2 (assets integrated)
**Deliverables:** Final visual polish

#### Instructions for Claude Code:
```
Apply final visual polish and animations:

1. Review brand system compliance:
   - Verify colour usage (obsidian, cyan, ember, porcelain)
   - Check typography (Outfit headlines, Inter body)
   - Ensure consistent spacing, padding
   - Verify rounded corners (2xl) on cards

2. Animation review:
   - Test all Framer Motion animations
   - Ensure 200–300ms duration, ease-out easing
   - Verify no janky animations (use transform/opacity only)
   - Check reduced-motion support

3. Micro-interactions:
   - Hover states on all interactive elements
   - Focus states visible and styled
   - Loading states on form submissions
   - Success/error animations

4. Spacing & layout:
   - Consistent section padding (e.g., py-16 md:py-24)
   - Balanced negative space
   - Aligned elements (grids, flex)
   - Responsive breakpoints smooth

5. Shadow & depth:
   - Apply soft shadows to cards (shadow-lg, shadow-xl)
   - Ensure depth hierarchy (raised elements)
   - Hover: Increase shadow for lift effect

6. Icon & graphic details:
   - Add subtle "cortex ↔ core" motif (animated SVG or canvas)
   - Ensure all icons are consistent style
   - Social media icons in footer

7. Final visual QA:
   - Compare against design mood board (institutional, near-future)
   - Ensure "architecture over spectacle" principle
   - Check for visual bugs (overlaps, misalignments)

Reference: See CLAUDE.md "Brand System & Visual Language" (§4)
```

---

## Phase 8: Launch Preparation (Sequential)
**Duration:** 2–3 hours | **Parallelizable:** No

### Task 8.1: Production Build & Deploy 🔗
**Session ID:** `LAUNCH-DEPLOY`
**Dependencies:** All previous phases complete
**Deliverables:** Staging + production deployments

#### Instructions for Claude Code:
```
Prepare and deploy to production:

1. Pre-deployment checklist:
   - [ ] All tests pass (npm run test, if tests exist)
   - [ ] Lighthouse audits pass (≥95 all categories)
   - [ ] No console errors or warnings
   - [ ] All environment variables set (.env.production)
   - [ ] Analytics verified (GTM container ID correct)
   - [ ] Email service configured (API keys, from address)
   - [ ] Press kit assets uploaded to CDN

2. Build production bundle:
   - Run: npm run build
   - Check output: No errors, bundle sizes reasonable
   - Analyze bundle (if needed): npm run analyze

3. Deploy to staging:
   - Platform: Vercel (recommended) or similar
   - URL: staging-ai-born.vercel.app (or custom subdomain)
   - Test full site on staging:
     * All pages load
     * Forms submit correctly
     * Analytics fire
     * Downloads work
     * No broken links

4. Staging QA (full smoke test):
   - [ ] Hero loads, CTAs work
   - [ ] Email capture sends excerpt
   - [ ] Bonus claim uploads file
   - [ ] Retailer links open correct stores
   - [ ] Press kit downloads
   - [ ] Media form routes to correct inbox
   - [ ] Analytics events fire in GTM Preview
   - [ ] Mobile responsive (test on real device)

5. Deploy to production:
   - Platform: Vercel with custom domain (ai-born.org)
   - DNS: Point domain to Vercel (A/CNAME records)
   - SSL: Auto-provisioned by Vercel (verify HTTPS works)
   - Environment: Production environment variables

6. Post-deployment verification:
   - [ ] https://ai-born.org loads
   - [ ] All sections render
   - [ ] Forms work (submit test email)
   - [ ] Analytics tracking works (check GTM in real-time)
   - [ ] Lighthouse audit on live site (≥95)

7. Submit sitemap:
   - Submit https://ai-born.org/sitemap.xml to Google Search Console
   - Submit to Bing Webmaster Tools

Reference: See CLAUDE.md "Timeline" (§15) and "Acceptance Criteria" (§14)
```

---

### Task 8.2: Monitoring & Analytics Setup 🔗
**Session ID:** `LAUNCH-MONITORING`
**Dependencies:** Task 8.1 (deployed to production)
**Deliverables:** Monitoring dashboards configured

#### Instructions for Claude Code:
```
Set up monitoring and analytics:

1. Google Tag Manager:
   - Verify GTM container is live and firing events
   - Set up GTM dashboard to monitor key events
   - Create conversion goals (preorder_click, lead_capture_submit)

2. Analytics dashboard:
   - If using Plausible/Fathom: Verify tracking
   - Set up custom events for KPIs
   - Create dashboard with key metrics:
     * Hero CTA CTR
     * Landing → retailer click-through
     * Lead magnet conversion
     * Scroll depth

3. Error monitoring:
   - Set up Sentry or similar (optional but recommended)
   - Track JavaScript errors
   - Set up alerts for critical errors

4. Uptime monitoring:
   - Use UptimeRobot or similar (free tier)
   - Monitor https://ai-born.org every 5 minutes
   - Set up email/SMS alerts for downtime

5. Email delivery monitoring:
   - Check transactional email service dashboard
   - Verify emails are delivering (check spam rates)
   - Set up alerts for bounces/complaints

6. Performance monitoring:
   - Use Vercel Analytics or similar
   - Monitor Core Web Vitals in production
   - Set up alerts if LCP > 2.5s or CLS > 0.1

7. Create monitoring document:
   - /docs/monitoring.md
   - List all monitoring tools, dashboards, alerts
   - Include login credentials (store securely)

Reference: See CLAUDE.md "Analytics & Tracking" (§9)
```

---

### Task 8.3: Launch Communications 🔗
**Session ID:** `LAUNCH-COMMS`
**Dependencies:** Task 8.1 (live site)
**Deliverables:** Launch announcement materials

#### Instructions for Claude Code:
```
Prepare launch communications (coordinate with marketing):

1. Social media assets:
   - Create launch announcement posts (Twitter, LinkedIn, etc.)
   - Include:
     * Book cover image
     * Key hook ("The job title is dying." or variant)
     * Link to https://ai-born.org
     * Hashtags (#AIBorn, #AIFuture, etc.)

2. Email announcement (to existing list, if any):
   - Subject: "AI-Born is live — claim your free excerpt"
   - Body:
     * Announce launch
     * Link to site
     * CTA to pre-order or get excerpt
     * Include social share buttons

3. Press release:
   - Finalize and distribute (if media embargo lifted)
   - Include link to press kit on site

4. Partner outreach:
   - Email to potential endorsers, partners
   - Request social shares, reviews
   - Provide pre-written social posts for easy sharing

5. Community posts:
   - Reddit, Hacker News, Product Hunt (if applicable)
   - Genuine engagement, not spammy
   - Highlight unique value (architecture over tools, pragmatic transition)

6. Update author profiles:
   - Twitter bio, LinkedIn, personal site
   - Add link to https://ai-born.org

7. Monitor initial feedback:
   - Watch for comments, questions on social media
   - Respond promptly and authentically
   - Address any site issues immediately

Reference: See CLAUDE.md "Success Criteria" (§1)
```

---

## Phase 9: Post-Launch Optimization (Ongoing)
**Duration:** Ongoing | **Parallelizable:** Yes

### Task 9.1: A/B Testing Setup 🔀
**Session ID:** `OPTIMIZE-ABTEST`
**Dependencies:** Task 8.1 (live site with traffic)
**Deliverables:** A/B tests running

#### Instructions for Claude Code:
```
Set up A/B tests for key elements:

1. Hero headline test:
   - Variants (from CLAUDE.md §5.1):
     A: "The job title is dying."
     B: "Three people. Thirty thousand outcomes."
     C: "From AI-enabled to AI-born."
   - Tool: Google Optimize, Vercel Edge Config, or custom (50/50 split)
   - Metric: Hero CTA CTR
   - Duration: 7–14 days or 5,000+ visitors per variant

2. CTA label test:
   - Variants:
     A: "Pre-order hardcover"
     B: "Reserve your copy"
     C: "Order now"
   - Metric: Click-through to retailer
   - Duration: 7 days or 3,000+ clicks

3. Bonus placement test:
   - Variants:
     A: Bonus in hero section (highly visible)
     B: Bonus in dedicated section (current design)
   - Metric: Bonus claim submission rate
   - Duration: 14 days

4. Implement A/B test tracking:
   - Log variant assignment in analytics
   - Track conversions per variant
   - Use statistical significance calculator (p < 0.05)

5. Document test plan:
   - /docs/ab-tests.md
   - List all tests, hypotheses, results

6. Analyze results:
   - After test duration, analyze data
   - Implement winning variant permanently
   - Document learnings

Reference: See CLAUDE.md "Analytics & Tracking" (§9, A/B test candidates)
```

---

### Task 9.2: Performance Monitoring & Optimization 🔀
**Session ID:** `OPTIMIZE-PERF`
**Dependencies:** Task 8.1 (live site)
**Deliverables:** Ongoing performance improvements

#### Instructions for Claude Code:
```
Monitor and optimize performance post-launch:

1. Weekly performance checks:
   - Run Lighthouse audit on live site
   - Check Core Web Vitals (LCP, TBT, CLS)
   - Monitor real-user metrics (Vercel Analytics, CrUX)

2. Image optimization:
   - Identify large images causing slow LCP
   - Further compress or lazy-load
   - Consider AVIF format (if widely supported)

3. JavaScript optimization:
   - Analyze bundle size (npm run analyze)
   - Code-split large components if needed
   - Defer non-critical scripts

4. CDN optimization:
   - Review cache hit rates
   - Adjust cache headers if needed
   - Consider preloading critical resources

5. Mobile performance:
   - Focus on mobile metrics (50%+ traffic likely mobile)
   - Test on slow 3G
   - Optimize for low-end devices

6. Monitor regressions:
   - Track performance over time
   - Alert if LCP increases >10%
   - Roll back problematic deployments

7. Document optimizations:
   - Update /docs/performance-report.md
   - Track improvements over time

Reference: See CLAUDE.md "Performance Budgets" (§1)
```

---

### Task 9.3: Conversion Rate Optimization 🔀
**Session ID:** `OPTIMIZE-CRO`
**Dependencies:** Task 8.1 (live site with analytics)
**Deliverables:** CRO improvements

#### Instructions for Claude Code:
```
Analyze and optimize conversion rates:

1. Funnel analysis:
   - Track drop-off points:
     * Landing → Hero CTA click
     * Hero CTA → Retailer click
     * Landing → Email capture
     * Email capture → Bonus claim
   - Identify highest drop-off steps

2. Heatmap analysis (optional):
   - Use Hotjar or similar (if budget allows)
   - Identify where users click, scroll
   - Find confusing UI elements

3. Form optimization:
   - Monitor form abandonment rates
   - Simplify if needed (fewer fields)
   - Improve error messages (more helpful)
   - Test inline validation vs submit-time

4. CTA optimization:
   - Test button colours, sizes, labels
   - Test placement (hero vs sticky header)
   - Test single vs dual CTAs

5. Social proof optimization:
   - Test different endorsements (rotate featured quotes)
   - Test logo placement (above fold vs below)

6. Mobile optimization:
   - Focus on mobile conversion rates
   - Test mobile-specific CTAs (e.g., tap-to-call)
   - Simplify mobile forms

7. Monitor KPIs:
   - Hero CTA CTR (target: ≥4.5%)
   - Landing → retailer (target: ≥25%)
   - Lead magnet conversion (target: ≥10%)

8. Document findings:
   - /docs/cro-report.md
   - Track changes and impact

Reference: See CLAUDE.md "Success Criteria" (engagement metrics, §1)
```

---

## Quick Reference: Task Dependencies

```
Phase 1 (Sequential):
  1.1 → 1.2 → 1.3

Phase 2 (Parallel):
  2.1, 2.2, 2.3 (all depend on 1.1)

Phase 3 (Parallel):
  3.1, 3.2, 3.3 (depend on 2.1)
  3.4 (depends on 2.3)
  3.5, 3.6 (depend on 2.1)
  3.7 (depends on 2.3)
  3.8 (depends on 2.3)
  3.9, 3.10 (depend on 2.1)

Phase 4 (Parallel):
  4.1, 4.2, 4.3 (all depend on 1.2, 1.3)

Phase 5 (Sequential):
  5.1 (depends on all Phase 3)
  5.2, 5.3 (depend on 5.1)

Phase 6 (Parallel):
  6.1, 6.2, 6.3 (all depend on 5.1)

Phase 7 (Parallel):
  7.1, 7.2, 7.3 (all depend on 5.1)

Phase 8 (Sequential):
  8.1 → 8.2 → 8.3

Phase 9 (Ongoing, Parallel):
  9.1, 9.2, 9.3 (all depend on 8.1)
```

---

## Parallel Execution Strategy

**Maximum 6 concurrent sessions:**

### Round 1 (after Phase 1 complete):
1. Session A: Task 2.1 (Base UI)
2. Session B: Task 2.2 (CTA)
3. Session C: Task 2.3 (Forms)
4. Session D: Task 4.1 (Email API)
5. Session E: Task 4.2 (Bonus API)
6. Session F: Task 4.3 (Request APIs)

### Round 2 (after Round 1 complete):
1. Session A: Task 3.1 (Hero)
2. Session B: Task 3.2 (Overview)
3. Session C: Task 3.3 (Frameworks)
4. Session D: Task 3.4 (Excerpt)
5. Session E: Task 3.5 (Author)
6. Session F: Task 3.6 (Endorsements)

### Round 3 (after Round 2 complete):
1. Session A: Task 3.7 (Media)
2. Session B: Task 3.8 (Bulk)
3. Session C: Task 3.9 (FAQ)
4. Session D: Task 3.10 (Footer)
5. Session E: Task 7.1 (Content)
6. Session F: Task 7.2 (Assets)

### Round 4 (after Round 3 complete):
1. Session A: Task 5.1 (Assembly) — Sequential, wait for completion
2. Then parallel:
   - Session B: Task 5.2 (Analytics)
   - Session C: Task 5.3 (SEO)
   - Session D: Task 6.1 (A11y)
   - Session E: Task 6.2 (Performance)
   - Session F: Task 6.3 (Compat)

### Round 5 (after Round 4 complete):
1. Session A: Task 7.3 (Polish)
2. Session B: Task 8.1 (Deploy) — Sequential
3. Session C: Task 8.2 (Monitoring) — After 8.1
4. Session D: Task 8.3 (Comms) — After 8.1

### Ongoing (after launch):
1. Session A: Task 9.1 (A/B tests)
2. Session B: Task 9.2 (Performance)
3. Session C: Task 9.3 (CRO)

---

## Time Estimates by Phase

- **Phase 1:** 2–4 hours (sequential)
- **Phase 2:** 3–5 hours (parallel: 1–2 hours wall time)
- **Phase 3:** 6–8 hours (parallel: 2–3 hours wall time)
- **Phase 4:** 3–4 hours (parallel: 1–2 hours wall time)
- **Phase 5:** 4–6 hours (mostly sequential: 4–6 hours wall time)
- **Phase 6:** 4–6 hours (parallel: 2–3 hours wall time)
- **Phase 7:** 3–5 hours (parallel: 1–2 hours wall time)
- **Phase 8:** 2–3 hours (sequential)
- **Phase 9:** Ongoing

**Total:** 27–41 hours of work
**Wall time (with parallel execution):** 15–25 hours over 2–3 days

---

## Success Metrics (Post-Launch)

Track these weekly:
- [ ] Pre-orders ≥6,000 before launch
- [ ] Week-1 sales: 10,000–12,000
- [ ] Email sign-ups ≥10,000
- [ ] Media kit downloads ≥1,000
- [ ] Amazon/Goodreads reviews ≥150 (4.6★+)
- [ ] Hero CTA CTR ≥4.5%
- [ ] Landing → retailer CTR ≥25%
- [ ] Lead magnet conversion ≥10%
- [ ] Lighthouse score ≥95 (all categories)
- [ ] LCP ≤2.0s, TBT ≤150ms, CLS ≤0.1

---

*This roadmap is designed for execution by multiple Claude Code sessions or AI agent swarms. Copy task blocks directly into sessions for parallel development.*

**Last updated:** 16 October 2025
**Maintained by:** Project lead
