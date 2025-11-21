# Auth-Aware CTAButton Implementation Checklist

Use this checklist to implement auth-aware functionality across the AI-Born landing page.

## Core Implementation ✅

- [x] Update CTAButton component with auth-aware props
- [x] Add AuthAwareText interface
- [x] Implement auto sign-in redirect
- [x] Add auth state to analytics events
- [x] Add data attributes for testing
- [x] Create comprehensive documentation
- [x] Create usage examples
- [x] Ensure backward compatibility

## Page Sections to Update

### 1. Hero Section
- [ ] **Location:** `/src/components/sections/BookHero.tsx`
- [ ] **Button:** "Get Free Excerpt"
- [ ] **Action:** Update to require auth, redirect to `/excerpt`
- [ ] **Text:**
  - Authenticated: "Download Excerpt"
  - Unauthenticated: "Sign In to Download"

```tsx
<CTAButton
  ctaId="hero-excerpt"
  requireAuth
  isAuthenticated={!!user}
  authAwareText={{
    authenticated: 'Download Excerpt',
    unauthenticated: 'Sign In to Download'
  }}
  signInCallbackUrl="/excerpt"
  eventData={{ event: 'hero_cta_click', cta_id: 'excerpt' }}
/>
```

### 2. Free Excerpt Section
- [ ] **Location:** Excerpt/lead magnet section
- [ ] **Button:** "Get Your Free Excerpt"
- [ ] **Action:** Email gate → auth-aware
- [ ] **Text:**
  - Authenticated: "Download Now"
  - Unauthenticated: "Sign In to Get Excerpt"

```tsx
<CTAButton
  ctaId="excerpt-claim"
  requireAuth
  isAuthenticated={!!user}
  authAwareText={{
    authenticated: 'Download Now',
    unauthenticated: 'Sign In to Get Excerpt'
  }}
  signInCallbackUrl="/excerpt"
/>
```

### 3. Pre-order Bonus Section
- [ ] **Location:** Bonus pack section
- [ ] **Button:** "Claim Bonus Pack"
- [ ] **Action:** Require auth + pre-order verification
- [ ] **Text:**
  - Authenticated: "Claim Your Bonus Pack"
  - Unauthenticated: "Sign In to Claim"

```tsx
<CTAButton
  ctaId="bonus-claim"
  requireAuth
  isAuthenticated={!!user}
  authAwareText={{
    authenticated: 'Claim Your Bonus Pack',
    unauthenticated: 'Sign In to Claim'
  }}
  signInCallbackUrl="/bonus-claim"
/>
```

### 4. Media Kit Section
- [ ] **Location:** `/src/app/media-kit/page.tsx` or media section
- [ ] **Decision:** Public or auth-gated?
- [ ] **If Public:** No auth required
- [ ] **If Private:** Require auth for downloads

**Option A: Public (No Auth)**
```tsx
<CTAButton
  ctaId="presskit-download"
  onClick={() => downloadPressKit()}
>
  Download Press Kit
</CTAButton>
```

**Option B: Auth Required**
```tsx
<CTAButton
  ctaId="presskit-download"
  requireAuth
  isAuthenticated={!!user}
  authAwareText={{
    authenticated: 'Download Press Kit',
    unauthenticated: 'Sign In for Press Kit'
  }}
/>
```

### 5. Newsletter Section
- [ ] **Location:** Newsletter sign-up section
- [ ] **Button:** Newsletter subscribe
- [ ] **Action:** Require auth for subscription
- [ ] **Text:**
  - Authenticated: "Subscribe to Newsletter"
  - Unauthenticated: "Sign In & Subscribe"

```tsx
<CTAButton
  ctaId="newsletter-subscribe"
  requireAuth
  isAuthenticated={!!user}
  authAwareText={{
    authenticated: 'Subscribe to Newsletter',
    unauthenticated: 'Sign In & Subscribe'
  }}
  signInCallbackUrl="/newsletter"
/>
```

### 6. Author Bio Section
- [ ] **Location:** About the author section
- [ ] **Button:** "Download full bio + headshots"
- [ ] **Decision:** Public or auth-gated?
- [ ] **Implementation:** Same as media kit (public or private)

### 7. Bulk Orders Section
- [ ] **Location:** `/src/app/bulk-orders/page.tsx`
- [ ] **Button:** Contact form submission
- [ ] **Decision:** Public form or require auth?
- [ ] **If Auth Required:** Update form component

### 8. Footer CTAs
- [ ] **Location:** Footer retailer links
- [ ] **Action:** Generally public, no auth needed
- [ ] **Verify:** Current implementation is correct

## Component Updates

### DualCTA Component
- [x] **Location:** `/src/components/DualCTA.tsx`
- [x] **Status:** Already compatible (optional props)
- [ ] **Test:** Verify works with auth-aware props

Example usage:
```tsx
<DualCTA
  primaryText="Pre-order"
  primaryAction={openRetailerMenu}
  primaryProps={{ ctaId: 'hero-preorder' }}
  secondaryText={user ? 'Download' : 'Sign In'}
  secondaryAction={handleExcerpt}
  secondaryProps={{
    ctaId: 'hero-excerpt',
    requireAuth: true,
    isAuthenticated: !!user,
    authAwareText: {
      authenticated: 'Download Excerpt',
      unauthenticated: 'Sign In to Download'
    }
  }}
/>
```

### RetailerMenu Component
- [x] **Location:** `/src/components/RetailerMenu.tsx`
- [x] **Status:** Pre-orders generally public
- [ ] **Decision:** Should pre-orders require auth?
- [ ] **If Yes:** Update retailer menu trigger button

## API Route Updates

### Excerpt Delivery API
- [ ] **Location:** `/src/app/api/excerpt/route.ts`
- [ ] **Action:** Add auth check
- [ ] **Verify:** Returns 401 if not authenticated

```tsx
export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Deliver excerpt
}
```

### Bonus Claim API
- [ ] **Location:** `/src/app/api/bonus-claim/route.ts`
- [ ] **Action:** Verify auth + entitlement
- [ ] **Check:** User has pre-ordered

```tsx
export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Verify pre-order
  // Process claim
}
```

### Newsletter API
- [ ] **Location:** `/src/app/api/newsletter/route.ts`
- [ ] **Action:** Associate subscription with user
- [ ] **Check:** User is authenticated

## Page-Level Auth Checks

### Protected Pages
Update these pages to require authentication:

- [ ] `/src/app/bonus-claim/page.tsx` - Bonus claim form
- [ ] `/src/app/downloads/page.tsx` - Download center (if exists)
- [ ] `/src/app/account/page.tsx` - Account settings (if exists)
- [ ] `/src/app/excerpt/page.tsx` - Excerpt download (if protected)

Add to each protected page:
```tsx
import { requireAuth } from '@/lib/auth';

export default async function ProtectedPage() {
  const user = await requireAuth(); // Redirects if not authenticated

  return <div>...</div>;
}
```

## Analytics Updates

### Event Tracking
- [x] **Auth state:** Automatically added to all CTAButton clicks
- [ ] **Verify:** Analytics dashboard shows `is_authenticated` property
- [ ] **Test:** Fire test events and verify in analytics

### New Events to Track
```javascript
// These are automatically tracked by auth-aware buttons:
{
  event: 'auth_required_cta_click',
  cta_id: string
}

// All existing events now include:
{
  ...existing_data,
  is_authenticated: boolean
}
```

## Testing Checklist

### Manual Testing
- [ ] Test sign-in redirect from unauthenticated state
- [ ] Test button text changes after sign-in
- [ ] Test callback URLs work correctly
- [ ] Test loading states with auth
- [ ] Test analytics events fire correctly
- [ ] Test keyboard navigation works
- [ ] Test screen reader announces correctly

### Automated Testing
- [ ] Write tests for auth-aware button behavior
- [ ] Write tests for redirect logic
- [ ] Write tests for analytics tracking
- [ ] Write tests for text changes
- [ ] Write integration tests for protected pages

Example test:
```typescript
describe('Auth-Aware CTAButton', () => {
  it('redirects to sign-in when unauthenticated', () => {
    render(
      <CTAButton
        ctaId="test"
        requireAuth
        isAuthenticated={false}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringContaining('/auth/signin')
    );
  });
});
```

## Accessibility Checklist

- [x] **Data attributes:** Added for testing/screen readers
- [ ] **ARIA labels:** Verify meaningful labels
- [ ] **Focus states:** Test keyboard focus indicators
- [ ] **Screen reader:** Test with VoiceOver/NVDA
- [ ] **Keyboard nav:** Test Tab/Enter/Space
- [ ] **High contrast:** Test button visibility

## Documentation Updates

- [x] **Component docs:** Created AUTH_AWARE_CTA_BUTTON.md
- [x] **Quick start:** Created AUTH_AWARE_CTA_QUICK_START.md
- [x] **Examples:** Created AuthAwareCTAButtonExample.tsx
- [x] **Summary:** Created AUTH_AWARE_CTA_SUMMARY.md
- [ ] **Update README:** Add link to auth-aware docs (if applicable)
- [ ] **Team training:** Share docs with team

## Deployment Checklist

### Pre-Deployment
- [ ] Review all changes
- [ ] Run TypeScript build: `npm run build`
- [ ] Run tests: `npm test`
- [ ] Test in staging environment
- [ ] Verify analytics in test mode
- [ ] Check accessibility with Lighthouse

### Post-Deployment
- [ ] Monitor analytics for auth events
- [ ] Check error logs for auth failures
- [ ] Verify sign-in redirects work in production
- [ ] Test end-to-end user flows
- [ ] Monitor conversion rates

### Rollback Plan
If issues arise:
1. All new props are optional - existing code unaffected
2. Can selectively disable auth requirements by removing `requireAuth` prop
3. Can revert to manual auth checks if needed

## Performance Monitoring

### Metrics to Track
- [ ] **Auth check time:** Server-side auth calls
- [ ] **Redirect time:** Time to sign-in page
- [ ] **Conversion rate:** Auth-gated vs public CTAs
- [ ] **Bounce rate:** Users leaving at auth gate
- [ ] **Completion rate:** Users completing auth flow

### Analytics Queries
```javascript
// Track auth requirement impact
SELECT
  cta_id,
  COUNT(*) as clicks,
  SUM(CASE WHEN is_authenticated THEN 1 ELSE 0 END) as authenticated_clicks,
  SUM(CASE WHEN is_authenticated THEN 0 ELSE 1 END) as auth_required_clicks
FROM analytics_events
WHERE event_name = 'cta_click'
GROUP BY cta_id;

// Track auth-required redirect events
SELECT
  cta_id,
  COUNT(*) as auth_redirects
FROM analytics_events
WHERE event_name = 'auth_required_cta_click'
GROUP BY cta_id;
```

## Success Criteria

- [ ] All protected actions require authentication
- [ ] All CTAs show appropriate text for auth state
- [ ] Sign-in redirects work correctly
- [ ] Callback URLs return users to intended page
- [ ] Analytics track auth state on all events
- [ ] No regression in existing functionality
- [ ] Accessibility maintained (WCAG 2.2 AA)
- [ ] Performance budget maintained

## Next Steps

1. **Prioritize sections** - Start with hero and excerpt
2. **Implement incrementally** - One section at a time
3. **Test thoroughly** - Manual + automated tests
4. **Monitor analytics** - Track impact on conversions
5. **Iterate** - Adjust based on user behavior

## Resources

- [Component Source](/src/components/CTAButton.tsx)
- [Full Documentation](/src/components/AUTH_AWARE_CTA_BUTTON.md)
- [Quick Start Guide](/AUTH_AWARE_CTA_QUICK_START.md)
- [Usage Examples](/src/components/examples/AuthAwareCTAButtonExample.tsx)
- [Implementation Summary](/AUTH_AWARE_CTA_SUMMARY.md)

## Questions?

Before implementing, consider:
1. Which CTAs should require auth?
2. Should media kit be public or gated?
3. Should newsletter require auth or just email?
4. What are the callback URLs for each flow?
5. How should analytics track auth state?

Document decisions and update this checklist accordingly.
