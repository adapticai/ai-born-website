# BookFooter Component - Quick Reference

## Component Location
`/Users/iroselli/ai-born-website/src/components/sections/BookFooter.tsx`

## Usage

```tsx
import { BookFooter } from "@/components/sections/BookFooter";

export default function Page() {
  return (
    <>
      {/* Your page content */}
      <BookFooter />
    </>
  );
}
```

## Structure Overview

```
BookFooter
├── Newsletter Section
│   ├── Heading: "Stay Updated"
│   ├── Subheading: "Get the free excerpt + launch invites"
│   ├── EmailCaptureForm (source="newsletter-footer")
│   └── Privacy note
│
├── Main Footer (4-Column Grid)
│   ├── Column 1: Pre-order
│   │   ├── RetailerMenu button
│   │   └── Quick links (overview, frameworks, excerpt, endorsements)
│   │
│   ├── Column 2: Resources
│   │   ├── About the Author
│   │   ├── Media Kit
│   │   ├── Bulk Orders
│   │   ├── FAQ
│   │   └── Mic Press, LLC
│   │
│   ├── Column 3: Legal
│   │   ├── Privacy Policy
│   │   ├── Terms of Service
│   │   ├── Cookie Policy
│   │   ├── Cookie Settings (button)
│   │   └── Accessibility
│   │
│   └── Column 4: Connect
│       ├── Social Media (X, LinkedIn, Instagram, YouTube, TikTok)
│       └── Contact Emails (General, Press, Partnerships)
│
└── Copyright Section
    ├── Mic Press, LLC Logo
    └── Copyright & Publisher Info
```

## Key Props & Configuration

### RetailerMenu
- **triggerText**: "See All Retailers"
- **originSection**: "footer"
- **className**: Full-width on mobile, responsive

### EmailCaptureForm
- **source**: "newsletter-footer"

### CookieSettingsButton
- **className**: "text-left" (alignment)

## Customization Points

### Social Media URLs
**Lines 190-247**: Update when actual social accounts are created
```tsx
href="https://x.com/aibornbook"           // Update to real account
href="https://linkedin.com/company/aiborn"
href="https://instagram.com/aibornbook"
href="https://youtube.com/@aibornbook"
href="https://tiktok.com/@aibornbook"
```

### Contact Emails
**Lines 252-278**: Verify these email addresses exist
```tsx
mailto:info@micpress.com
mailto:press@micpress.com
mailto:partnerships@micpress.com
```

### Internal Links
Ensure these routes/anchors exist:
- `#overview` - Overview section
- `#frameworks` - Key Frameworks section
- `#excerpt` - Free Excerpt section
- `#endorsements` - Endorsements section
- `#author` - About the Author section
- `#media` - Media Kit section
- `/bulk-orders` - Bulk orders page
- `/faq` - FAQ page
- `/privacy` - Privacy policy page
- `/terms` - Terms of service page
- `/privacy#cookies` - Cookie policy (anchor)
- `/accessibility` - Accessibility statement

## Responsive Breakpoints

- **Mobile** (< md): Single column, stacked layout
- **Tablet** (md): 4-column grid begins
- **Desktop** (lg): Wider gaps between columns

## Dark Mode

All colors have dark mode variants:
- Backgrounds: `bg-white` → `dark:bg-black`
- Borders: `border-slate-200` → `dark:border-slate-900`
- Text: `text-slate-600` → `dark:text-slate-400`
- Headings: `text-black` → `dark:text-white`

## Analytics Events

The footer triggers these events:

1. **retailer_menu_open**
   - Triggered: When "See All Retailers" clicked
   - Data: `{ origin_section: 'footer' }`

2. **preorder_click**
   - Triggered: When user selects retailer
   - Data: `{ retailer, format, geo }`

3. **newsletter_subscribed**
   - Triggered: When newsletter form submitted
   - Data: `{ source: 'newsletter-footer' }`

4. **cookie_consent_update**
   - Triggered: When Cookie Settings clicked
   - Data: `{ analytics, marketing }`

## Accessibility Features

- ✓ Semantic `<footer>` element
- ✓ Proper heading hierarchy (h3, h4)
- ✓ ARIA labels on all social links
- ✓ Keyboard navigation support
- ✓ Color contrast meets WCAG 2.2 AA
- ✓ Mail icons marked `aria-hidden="true"`
- ✓ External links use `rel="noopener noreferrer"`

## Common Issues & Solutions

### Issue: Cookie Settings button not working
**Solution**: Ensure CookieConsent component is imported in layout

### Issue: Retailer menu not opening
**Solution**: Check RetailerMenu component is properly configured

### Issue: Social links 404
**Solution**: Update social media URLs to actual accounts

### Issue: Email links not working
**Solution**: Verify email addresses exist and are properly formatted

### Issue: Dark mode colors wrong
**Solution**: Check Tailwind dark mode is configured in tailwind.config.ts

## Testing Checklist

- [ ] Newsletter form submits successfully
- [ ] All social media links open correctly
- [ ] All email links open mail client
- [ ] Retailer menu opens and tracks analytics
- [ ] Cookie Settings button reopens consent banner
- [ ] All internal anchor links scroll to correct sections
- [ ] Dark mode displays correctly
- [ ] Mobile layout is readable and functional
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader announces content correctly

## Performance Notes

- Component is client-side rendered ("use client" directive)
- Newsletter form uses React Hook Form (optimized)
- RetailerMenu lazy-loads dialog content
- Social icons are lightweight SVGs
- No heavy dependencies

## Dependencies

Required components:
- `@/components/CookieConsent` (CookieSettingsButton)
- `@/components/forms/EmailCaptureForm`
- `@/components/icons/MicPressLogo`
- `@/components/RetailerMenu`

Required packages:
- `lucide-react` (for icons)
- `next` (Next.js framework)
- `react` (React library)

## Maintenance Schedule

**Monthly**:
- Verify all email addresses work
- Test all external links

**Quarterly**:
- Review social media URLs
- Update copyright year if needed
- Check legal page links

**Annually**:
- Full accessibility audit
- Review and update publisher information
- Verify all content is current

---

**Quick Start**: Import `BookFooter` component and add to your page layout. Verify all links work and social media URLs are updated.

**Support**: See FOOTER_COMPONENT_SUMMARY.md for detailed documentation
