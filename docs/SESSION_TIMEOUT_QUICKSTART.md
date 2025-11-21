# Session Timeout - Quick Start Guide

## Overview

The session timeout system is already integrated and ready to use. This guide shows you how to test and customize it.

## What's Already Done

✅ Session timeout monitoring component
✅ Progressive warning system (5min, 1min)
✅ Automatic session refresh for active users
✅ Expiration modal with sign-in button
✅ Toast notifications
✅ Integration in app layout
✅ Brand styling applied

## Testing the System

### Quick Test (Development)

1. **Shorten session duration for testing**:

```typescript
// In auth.config.ts or equivalent
export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 3 * 60, // 3 minutes for testing
  },
};
```

2. **Sign in to the application**

3. **Wait and observe**:
   - At 2 minutes 30 seconds: Amber warning toast appears
   - At 2 minutes: Red critical toast appears
   - At 3 minutes: Expiration modal appears

4. **Test auto-refresh**:
   - Move your mouse before session expires
   - Green "Session Extended" toast should appear

### Debug Panel

In development mode, a debug panel shows in the bottom-right when session is expiring:

```
Session Debug Info
Time remaining: 2m 15s
Is expiring: Yes
Is expired: No
```

## Files Created

```
/src/components/auth/SessionTimeout.tsx     # Main component
/src/hooks/useSessionTimeout.ts             # Monitoring hook
/src/hooks/index.ts                         # Hook exports
/docs/SESSION_TIMEOUT.md                    # Full documentation
/docs/SESSION_TIMEOUT_QUICKSTART.md         # This file
```

## Integration Points

### Layout Integration

Already integrated in `/src/app/layout.tsx`:

```tsx
<SessionProvider>
  <SessionTimeout />      {/* Monitors and shows warnings */}
  <Toaster />            {/* Displays toast notifications */}
  {children}
</SessionProvider>
```

## Customization

### Adjust Warning Times

Edit `/src/hooks/useSessionTimeout.ts`:

```typescript
const TIMEOUT_THRESHOLDS = {
  WARNING: 10 * 60 * 1000,    // Change: 10 minute warning
  CRITICAL: 2 * 60 * 1000,    // Change: 2 minute critical
  CHECK_INTERVAL: 30 * 1000,  // Keep: 30 second checks
};
```

### Adjust Auto-Refresh Behavior

Edit `/src/components/auth/SessionTimeout.tsx`:

```typescript
const SESSION_CONFIG = {
  // Refresh session if within this window
  REFRESH_WINDOW: 15 * 60 * 1000,      // Change: 15 minutes

  // User active if interaction within this period
  ACTIVITY_THRESHOLD: 10 * 60 * 1000,  // Change: 10 minutes

  // Debounce activity events
  ACTIVITY_DEBOUNCE: 1000,             // Keep: 1 second
};
```

### Change Toast Position

Edit `/src/app/layout.tsx`:

```tsx
// Options: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
<Toaster position="bottom-right" />
```

## Usage in Components

### Use the Hook Directly

```tsx
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

function MyComponent() {
  const { isExpiring, formattedTimeRemaining } = useSessionTimeout();

  if (isExpiring) {
    return (
      <div className="banner">
        Session expires in {formattedTimeRemaining}
      </div>
    );
  }

  return null;
}
```

### Custom Callbacks

```tsx
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

function MyPage() {
  const timeout = useSessionTimeout({
    onWarning: () => {
      console.log('Save your work!');
      saveForm();
    },
    onExpired: () => {
      console.log('Clearing local state');
      clearLocalData();
    },
  });

  return <div>Page content</div>;
}
```

## User Experience Flow

### Normal Session

```
User signs in → Works normally → Auto-refresh keeps session alive
```

### Approaching Expiration (Active User)

```
5min warning → User continues working → Auto-refresh → Session extended
```

### Approaching Expiration (Inactive User)

```
5min warning → 1min critical → Expiration modal → User must sign in again
```

## Toast Examples

### Warning Toast (5 minutes)
```
🕐 Session Expiring Soon
Your session will expire in 5 minutes. Save your work.
```

### Critical Toast (1 minute)
```
⚠️ Session Expiring
Your session will expire in 1 minute!
```

### Auto-Refresh Success
```
✓ Session Extended
Your session has been automatically renewed.
```

### Expiration
```
🔑 Session Expired
Please sign in again to continue.
```

## Activity Detection

The system monitors these user interactions:
- Mouse clicks
- Keyboard input
- Scrolling
- Touch events

If any occur within 5 minutes before expiration, the session auto-refreshes.

## Production Configuration

### Recommended Session Duration

```typescript
// Production settings in auth.config.ts
export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 60,  // 30 minutes
  },
};
```

With this setting:
- Warning at 25 minutes
- Critical warning at 29 minutes
- Expiration at 30 minutes
- Auto-refresh window: 20-30 minutes

## Troubleshooting

### Issue: No warnings appearing

**Fix**: Ensure you're signed in and session has `expires` field

```tsx
// Check session in browser console
console.log(session);
// Should have: { expires: "2024-01-01T12:00:00.000Z", ... }
```

### Issue: Auto-refresh not working

**Fix**: Check that NextAuth update is available

```tsx
// In SessionTimeout.tsx, verify:
const { update } = useSession();
// update should be a function
```

### Issue: Modal styling broken

**Fix**: Ensure Tailwind is processing the component

```javascript
// In tailwind.config.ts, verify:
content: [
  "./src/components/**/*.{ts,tsx}",
  // ...
],
```

## What Happens When

| Time Remaining | Event |
|---------------|-------|
| 5 minutes | Amber toast warning |
| 1 minute | Red toast critical warning |
| 0 seconds | Expiration modal appears |
| User interacts | Session auto-refreshes (if in 10min window) |
| User clicks "Sign In Again" | Redirects to sign-in with callback |

## Next Steps

1. **Test in development** with shortened session duration
2. **Verify warnings appear** at expected times
3. **Test auto-refresh** by staying active
4. **Customize thresholds** if needed for your use case
5. **Set production session duration** to appropriate value

## Additional Resources

- Full documentation: `/docs/SESSION_TIMEOUT.md`
- NextAuth docs: https://next-auth.js.org/
- Sonner docs: https://sonner.emilkowal.ski/

## Support Checklist

- [ ] Session timeout component is imported in layout
- [ ] Toaster component is added to layout
- [ ] SessionProvider wraps the app
- [ ] User can sign in successfully
- [ ] Session has expires field
- [ ] Warnings appear at expected times
- [ ] Auto-refresh works when active
- [ ] Modal appears on expiration
- [ ] Sign in redirect works from modal

All items should be checked ✓ if system is working correctly.
