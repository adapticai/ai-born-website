# Excerpt Modal Quick Start Guide

## Overview

The ExcerptModal component now intelligently handles authenticated users by checking their entitlement status and providing the appropriate experience.

## Usage

### Basic Usage (No Changes Required)

The modal works the same way as before for components that use it:

```tsx
import { ExcerptModal } from "@/components/ExcerptModal";

function MyComponent() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setModalOpen(true)}>
        Get Free Excerpt
      </button>

      <ExcerptModal
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
```

## User Flows

### 1. Unauthenticated User Flow

```
User clicks "Get Free Excerpt"
    ↓
Modal opens → Shows loading spinner
    ↓
Checks session status
    ↓
Shows "Sign In Required" view
    ↓
User clicks "Sign In" button
    ↓
Redirects to /auth/signin?callbackUrl={currentPage}
    ↓
After sign-in, redirects back to page
    ↓
Modal reopens → Checks entitlement → Shows appropriate view
```

### 2. Authenticated User (No Entitlement) Flow

```
User clicks "Get Free Excerpt"
    ↓
Modal opens → Shows loading spinner
    ↓
Checks session & entitlement
    ↓
Shows claim form (email + optional name)
    ↓
User submits form
    ↓
Shows success state with download link
```

### 3. Authenticated User (Has Entitlement) Flow

```
User clicks "Get Free Excerpt"
    ↓
Modal opens → Shows loading spinner
    ↓
Checks session & entitlement
    ↓
Shows "You Already Have Access!" view
    ↓
Download button ready immediately
```

## Modal States

### State 1: Loading
- **When:** Initial state while checking auth/entitlement
- **UI:** Centered loading spinner
- **Duration:** Usually <500ms

### State 2: Sign-In Required
- **When:** User is not authenticated
- **UI:**
  - Lock/login icon
  - "Sign in to access your free excerpt" message
  - "Sign In" button (full width, primary style)
  - Note: "Don't have an account? We'll create one automatically"

### State 3: Claim Form
- **When:** User is authenticated but no entitlement
- **UI:**
  - Email input (required)
  - Name input (optional)
  - Honeypot field (hidden, anti-spam)
  - "Get Free Excerpt" submit button
  - Privacy note

### State 4: Download Ready
- **When:** User has existing entitlement
- **UI:**
  - Green checkmark icon
  - "You Already Have Access!" title
  - "Download Excerpt" button
  - "Close" button

### State 5: Success
- **When:** After successful form submission
- **UI:**
  - Green checkmark icon
  - "Excerpt Sent Successfully!" title
  - Email confirmation message
  - Download button (if available)
  - "Close" button

## API Integration

### Check Entitlement Endpoint

```typescript
GET /api/excerpt/check-entitlement

// Response
{
  hasEntitlement: boolean;
  downloadUrl?: string;
  message: string;
}
```

### Excerpt Request Endpoint (Existing)

```typescript
POST /api/excerpt/request

// Request Body
{
  email: string;
  name?: string;
  honeypot?: string;
  source: string;
}

// Response
{
  success: boolean;
  downloadUrl?: string;
  message: string;
}
```

## Analytics Events

### Tracked Events

1. **lead_capture_submit** (Form submission)
```javascript
{
  event: 'lead_capture_submit',
  source: 'hero-excerpt'
}
```

2. **excerpt_download** (Download from authenticated state)
```javascript
{
  event: 'excerpt_download',
  source: 'modal-authenticated'
}
```

3. **form_error** (Error handling)
```javascript
{
  event: 'form_error',
  form_id: 'excerpt-modal',
  error_type: 'rate-limit' | 'server'
}
```

## Implementation Checklist

### Prerequisites
- [x] SessionProvider added to root layout
- [x] NextAuth configured and working
- [x] Auth utilities available (`@/lib/auth`)
- [ ] Database schema supports user entitlements
- [ ] `hasEntitlement()` function implemented with DB query

### To Complete Implementation

1. **Update `hasEntitlement()` function** in `/src/lib/auth.ts`:
```typescript
export async function hasEntitlement(
  entitlement: "preorder" | "excerpt" | "agentCharterPack"
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  // TODO: Replace with actual database query
  const userRecord = await prisma.user.findUnique({
    where: { id: user.id },
    select: { hasExcerpt: true, hasPreordered: true, hasAgentCharterPack: true }
  });

  const entitlementMap = {
    preorder: userRecord?.hasPreordered,
    excerpt: userRecord?.hasExcerpt,
    agentCharterPack: userRecord?.hasAgentCharterPack,
  };

  return !!entitlementMap[entitlement];
}
```

2. **Add database fields** to User model:
```prisma
model User {
  id                    String   @id @default(cuid())
  email                 String   @unique
  name                  String?
  hasExcerpt           Boolean  @default(false)
  excerptGrantedAt     DateTime?
  hasPreordered        Boolean  @default(false)
  hasAgentCharterPack  Boolean  @default(false)
  // ... other fields
}
```

3. **Update excerpt claim logic** to set entitlement:
```typescript
// In /api/excerpt/request/route.ts
await prisma.user.update({
  where: { email: data.email },
  data: {
    hasExcerpt: true,
    excerptGrantedAt: new Date()
  }
});
```

## Customization

### Changing Sign-In Behavior

Modify the `handleSignIn()` function in ExcerptModal:

```typescript
const handleSignIn = () => {
  // Custom redirect logic
  const callbackUrl = encodeURIComponent("/bonus-claim");
  window.location.href = `/auth/signin?callbackUrl=${callbackUrl}`;
};
```

### Adding Custom Messaging

Update the dialog content function:

```typescript
const getDialogContent = () => {
  switch (view) {
    case "sign-in":
      return {
        title: "Your Custom Title",
        description: "Your custom description",
      };
    // ... other cases
  }
};
```

### Styling States

Each state component has its own styling. Modify in the component:

```typescript
// LoadingState styling
className="flex justify-center py-8"

// SignInState styling
className="space-y-6 py-4"

// DownloadState styling
className="space-y-6 py-4 text-center"
```

## Troubleshooting

### Issue: "useSession is not defined"
**Solution:** Ensure SessionProvider is wrapping your app in layout.tsx

### Issue: Modal always shows loading state
**Solution:** Check that the session status is being properly detected. Add console.log to debug:
```typescript
useEffect(() => {
  console.log('Session status:', status);
  console.log('Session data:', session);
}, [status, session]);
```

### Issue: Entitlement check fails
**Solution:**
1. Verify `/api/excerpt/check-entitlement` endpoint is accessible
2. Check user is properly authenticated
3. Ensure `hasEntitlement()` function is implemented

### Issue: Download URL not showing
**Solution:** Verify the API response includes `downloadUrl` field when `hasEntitlement: true`

## Testing

### Manual Testing Steps

1. **Test Unauthenticated Flow:**
   - Log out
   - Click "Get Free Excerpt"
   - Verify sign-in prompt appears
   - Click "Sign In"
   - Verify redirect to sign-in page

2. **Test Authenticated Without Entitlement:**
   - Sign in
   - Ensure user has no excerpt entitlement
   - Click "Get Free Excerpt"
   - Verify form appears
   - Submit form
   - Verify success state

3. **Test Authenticated With Entitlement:**
   - Sign in
   - Grant excerpt entitlement to user (via database)
   - Click "Get Free Excerpt"
   - Verify download state appears immediately

4. **Test State Transitions:**
   - Open modal
   - Verify loading spinner appears first
   - Verify transition to appropriate state
   - Verify animations are smooth

### Integration Testing

```typescript
// Example test
describe('ExcerptModal', () => {
  it('shows sign-in prompt for unauthenticated users', async () => {
    // Mock useSession to return unauthenticated state
    mockUseSession({ status: 'unauthenticated', data: null });

    render(<ExcerptModal open={true} onOpenChange={jest.fn()} />);

    expect(screen.getByText('Sign In Required')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
```

## Performance Considerations

- **Loading State:** Minimized by using cached session data
- **Entitlement Check:** Single API call per modal open
- **Animations:** Optimized with Framer Motion
- **State Management:** Uses local state, no Redux overhead

## Security Notes

- All entitlement checks happen server-side
- Download URLs should be signed/time-limited in production
- CSRF protection handled by NextAuth
- Rate limiting on excerpt request endpoint

---

**Quick Links:**
- [Full Documentation](/EXCERPT_MODAL_AUTH_UPDATE.md)
- [Auth Setup](/AUTH_QUICK_START.md)
- [Excerpt Feature Docs](/EXCERPT_FEATURE.md)

**Last Updated:** 2025-10-19
