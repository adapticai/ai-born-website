# Welcome Page - Quick Reference

## File Locations
```
/src/app/welcome/page.tsx           → Server Component (auth & data)
/src/app/welcome/welcome-content.tsx → Client Component (UI & animations)
```

## Route
```
https://ai-born.org/welcome
```

## Authentication
- **Protected**: Yes, requires authentication via `requireAuth()`
- **Redirect**: Unauthenticated users → `/auth/signin?callbackUrl=/welcome`

## Data Fetched
```typescript
// User data
const userData = await prisma.user.findUnique({
  where: { id: user.id },
  select: { id, name, email, createdAt }
});

// User entitlements
const entitlements = await getUserEntitlements(user.id);
// Returns: { hasPreordered, hasExcerpt, hasAgentCharterPack }
```

## Page Structure

```
┌─────────────────────────────────────────┐
│         BookNavbarWrapper               │
├─────────────────────────────────────────┤
│                                         │
│  [Sparkles Icon]                        │
│  Welcome, [User Name]                   │
│  Your journey into AI-native...         │
│  [Member since badge]                   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ 📖   │ │ 🛒   │ │ 🎁   │ │ ✨   │  │
│  │Download Preorder Claim  Explore   │
│  │Excerpt  Book   Bonus   Content   │  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Progress Checklist                     │
│  [Checkboxes and items]                 │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  What's next?                           │
│  [Explore the Book] [View Dashboard]    │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [Success indicator if content unlocked]│
│                                         │
├─────────────────────────────────────────┤
│         BookFooter                      │
└─────────────────────────────────────────┘
```

## Feature Cards

### Card 1: Download Excerpt
- **Color**: Brand Cyan (#00d9ff)
- **Icon**: BookOpen
- **Status**: Shows "Already unlocked" if `hasExcerpt === true`
- **Link**: `/downloads` (if unlocked) or `/#excerpt`
- **CTA**: "View Downloads" or "Get Excerpt"

### Card 2: Pre-order Book
- **Color**: Brand Ember (#ff9f40)
- **Icon**: ShoppingCart
- **Status**: Shows "Pre-order confirmed" if `hasPreordered === true`
- **Link**: `/#hero`
- **CTA**: "View Retailers" or "Pre-order Now"

### Card 3: Claim Bonus Pack
- **Color**: Brand Cyan (outline variant)
- **Icon**: Gift
- **Status**: Shows "Pack delivered" if `hasAgentCharterPack === true`
- **Link**: `/bonus-claim`
- **CTA**: "Download Pack" or "Claim Bonus"

### Card 4: Explore Content
- **Color**: Slate (outline variant)
- **Icon**: Sparkles
- **Status**: N/A
- **Link**: `/#overview`
- **CTA**: "Explore the Book"

## Props Flow

```typescript
// page.tsx (Server) → welcome-content.tsx (Client)
interface WelcomeContentProps {
  userName: string;              // Formatted display name
  userEmail: string;             // User's email
  createdAt: Date;               // Account creation date
  entitlements: {
    hasPreordered: boolean;      // Has verified receipt
    hasExcerpt: boolean;         // Has excerpt entitlement
    hasAgentCharterPack: boolean; // Has bonus pack delivered
  };
}
```

## Success Messages

Based on entitlements, shows one of:

```typescript
// All unlocked
"You've unlocked all available content. Check your downloads page for bonus materials."

// Pre-ordered + Excerpt
"You've unlocked your excerpt and pre-ordered the book. Upload your receipt to claim the bonus pack."

// Excerpt only
"You've unlocked your free excerpt. Pre-order to claim the bonus pack."

// Default
"You're making great progress. Continue exploring to unlock more content."
```

## Styling

### Colors
```css
brand-cyan:      #00d9ff  /* Machine/tech features */
brand-ember:     #ff9f40  /* Human/action features */
brand-obsidian:  #0a0a0f  /* Dark backgrounds */
brand-porcelain: #fafafa  /* Light text */
```

### Fonts
```css
font-outfit  /* Headlines, titles, buttons */
font-inter   /* Body text, descriptions */
```

### Responsive Breakpoints
```css
sm:  640px  → 2 columns
lg:  1024px → 4 columns
```

## Animations

All animations use Framer Motion:
- **Duration**: 0.3s
- **Easing**: ease-out
- **Stagger**: 0.1s delay between cards
- **Hover**: -4px translate Y + scale 1.1 on icons
- **Respects**: prefers-reduced-motion media query

## Navigation Links

```typescript
/downloads       // User's downloads page
/bonus-claim     // Bonus claim flow
/account         // User dashboard
/#hero           // Homepage hero section
/#excerpt        // Excerpt section
/#overview       // Overview section
```

## Common Tasks

### Update welcome message
Edit line 146 in `welcome-content.tsx`:
```typescript
<h1 className="font-outfit mb-4 text-4xl...">
  Welcome, {userName}
</h1>
```

### Add new feature card
In `welcome-content.tsx`, add to grid around line 163:
```typescript
<FeatureCard
  icon={YourIcon}
  iconColor="brand-cyan"
  title="Your Title"
  description="Your description"
  hasAccess={entitlements.yourEntitlement}
  href="/your-link"
  ctaText="Your CTA"
  delay={0.5}
/>
```

### Modify success criteria
Edit line 331-347 in `welcome-content.tsx`:
```typescript
{(entitlements.hasExcerpt || ...) && (
  <motion.div>
    {/* Success message */}
  </motion.div>
)}
```

### Change date format
Edit the `formatDate` function around line 47:
```typescript
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
```

## Testing

### Manual Test Checklist
```bash
# 1. Authentication
- [ ] Unauthenticated users redirected to sign-in
- [ ] Authenticated users see welcome page

# 2. Personalization
- [ ] User's name displays correctly
- [ ] Member since date shows
- [ ] Date format is readable

# 3. Entitlements
- [ ] Excerpt card reflects hasExcerpt status
- [ ] Pre-order card reflects hasPreordered status
- [ ] Bonus card reflects hasAgentCharterPack status
- [ ] Links change based on status

# 4. Navigation
- [ ] All card CTAs link to correct pages
- [ ] Quick action buttons work
- [ ] BookNavbar displays
- [ ] BookFooter displays

# 5. Responsive
- [ ] Mobile: 1 column layout
- [ ] Tablet: 2 column layout
- [ ] Desktop: 4 column layout

# 6. Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announces content
- [ ] Focus states visible
- [ ] ARIA labels present

# 7. Visual
- [ ] Brand colors display correctly
- [ ] Fonts load properly
- [ ] Animations smooth
- [ ] Dark mode works
```

## Troubleshooting

### User not seeing their entitlements
```typescript
// Check getUserEntitlements in @/lib/auth
// Verify Prisma queries return correct data
const entitlements = await getUserEntitlements(user.id);
console.log(entitlements); // Debug output
```

### Date not showing
```typescript
// Check user.createdAt is fetched
const userData = await prisma.user.findUnique({
  where: { id: user.id },
  select: { createdAt: true } // ← Must be included
});
```

### Cards not displaying correctly
```typescript
// Check that all Card subcomponents are imported
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
```

### Animations not working
```typescript
// Check Framer Motion is installed
npm list framer-motion

// Verify motion components are used
<motion.div variants={...}>
```

## Performance Considerations

- **Server-side rendering**: All data fetched on server
- **Database queries**: Optimized with parallel Promise.all
- **Animations**: GPU-accelerated transforms
- **Images**: None required (icon-based)
- **Bundle size**: ~8KB gzipped (with Framer Motion)

## SEO Settings

```typescript
export const metadata: Metadata = {
  title: "Welcome to AI-Born | Your Journey Begins",
  description: "Welcome to AI-Born. Explore...",
  robots: {
    index: false,  // Don't index onboarding
    follow: false, // Don't follow links
  },
};
```

## Future Enhancements

Consider adding:
- [ ] Onboarding tour/tooltips
- [ ] Progress persistence in database
- [ ] Confetti on completion
- [ ] Video tutorials
- [ ] Achievement badges
- [ ] Social sharing
- [ ] Email notifications
- [ ] Personalized recommendations

---

**Last Updated**: 19 October 2025
**Version**: 1.0
**Maintainer**: AI-Born Development Team
