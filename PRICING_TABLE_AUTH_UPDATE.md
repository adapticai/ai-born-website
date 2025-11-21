# Pricing Table Authentication Update

## Summary

Updated the `PricingTable` component to display different CTAs based on user authentication status and pre-order state.

## Changes Made

### 1. Updated `/src/components/blocks/pricing-table.tsx`

**Before:** Generic pricing table with free/startup/enterprise plans

**After:** Book-focused pricing table with hardcover/ebook/audiobook formats that shows:

- **Non-authenticated users:** "Sign up to pre-order" button that redirects to sign-in page
- **Authenticated users (no pre-order):** "Pre-order now" button that opens RetailerMenu
- **Authenticated users (has pre-ordered):** Disabled "Pre-ordered" button with checkmark icon

#### Key Features:
- Accepts `user` prop with authentication state and `hasPreordered` flag
- Accepts optional `initialGeo` prop for regional pricing (defaults to "US")
- Shows book-specific comparison features (Content, Bonuses, Experience)
- Integrates with existing `RetailerMenu` component for authenticated pre-orders
- Uses `getFormattedPrice()` to display prices by format and region
- Fully responsive with mobile/desktop layouts

#### Props Interface:
```typescript
interface PricingTableProps {
  user?: {
    id: string;
    email: string;
    name?: string | null;
    hasPreordered?: boolean;
  } | null;
  initialGeo?: GeoRegion;
}
```

### 2. Updated `/src/app/pricing/page.tsx`

**Before:** Static page component rendering PricingTable without props

**After:** Async server component that:
- Fetches current user with `getCurrentUser()`
- Fetches user entitlements with `getUserEntitlements(userId)`
- Passes user data (including `hasPreordered` flag) to PricingTable component

### 3. Updated `/src/components/RetailerMenu.tsx`

**Change:** Added `'pricing-table'` as a valid `originSection` value for analytics tracking

```typescript
originSection?: 'hero' | 'footer' | 'bonus' | 'header' | 'mobile-header' | 'pricing-table';
```

## Dependencies

The implementation relies on these existing utilities:

- `@/lib/auth` - `getCurrentUser()`, `getUserEntitlements()`, `getSignInUrl()`
- `@/lib/pricing` - `getFormattedPrice()`
- `@/lib/retailers` - Retailer data and utilities
- `@/components/RetailerMenu` - Pre-order retailer selection dialog
- `@/types` - TypeScript types for `BookFormat`, `GeoRegion`

## User Flow

### Non-authenticated User
1. Views pricing table with "Sign up to pre-order" buttons
2. Clicks button → Redirects to sign-in page (`/auth/signin?callbackUrl=/`)
3. After sign-in → Returns to page and sees "Pre-order now" button

### Authenticated User (No Pre-order)
1. Views pricing table with "Pre-order now" buttons
2. Clicks button → Opens RetailerMenu dialog
3. Selects format, region, and retailer → Redirected to retailer site

### Authenticated User (Has Pre-ordered)
1. Views pricing table with disabled "Pre-ordered" button
2. Visual confirmation of existing pre-order (checkmark icon)

## Analytics Events

When users interact with the pricing table, the following analytics events are tracked:

- `retailer_menu_open` - When RetailerMenu is opened from pricing table
  - `origin_section: 'pricing-table'`
- `format_toggle` - When user switches between formats
- `region_switch` - When user changes geographic region
- `preorder_click` - When user clicks through to retailer

## Testing Recommendations

1. **Non-authenticated state:**
   - Verify "Sign up to pre-order" button appears
   - Verify clicking redirects to sign-in page
   - Verify callback URL preserves current page

2. **Authenticated state (no pre-order):**
   - Verify "Pre-order now" button appears
   - Verify RetailerMenu opens correctly
   - Verify all format options work

3. **Authenticated state (has pre-order):**
   - Verify "Pre-ordered" button is disabled
   - Verify checkmark icon displays
   - Verify consistent state across all formats

4. **Regional pricing:**
   - Verify prices display correctly for US/UK/EU/AU regions
   - Verify format availability by region

5. **Responsive design:**
   - Test mobile collapsible view
   - Test desktop grid layout
   - Verify button placement and sizing

## Files Modified

- `/src/components/blocks/pricing-table.tsx` - Main component logic
- `/src/app/pricing/page.tsx` - Page wrapper with auth data
- `/src/components/RetailerMenu.tsx` - Added origin section type
- `/src/app/bulk-orders/page.tsx` - Fixed unrelated import issue

## Database Requirements

For the `hasPreordered` flag to work properly, ensure:

1. User model has `hasPreordered` boolean field (or similar)
2. `getUserEntitlements()` queries this field from the database
3. Pre-order verification system updates this flag when users complete orders

## Notes

- Component is client-side (`"use client"`) for interactivity
- Page is server-side (async) for authentication checks
- All icons from `lucide-react` package
- Follows existing code style and patterns
- Maintains accessibility with ARIA labels
- Pre-existing build errors in other files (CTAButton, BookBulkOrders) are unrelated to these changes
