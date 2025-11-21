# Session Timeout Handling

## Overview

The session timeout system provides comprehensive user feedback and automatic session management for authenticated users. It monitors NextAuth session expiration and provides timely warnings, automatic session refresh for active users, and graceful handling of expired sessions.

## Features

### 1. **Progressive Warning System**
- **5-minute warning**: Amber toast notification with gentle reminder
- **1-minute critical warning**: Red toast notification with urgent alert
- **Expiration modal**: Full-screen modal requiring user action

### 2. **Automatic Session Refresh**
- Monitors user activity (mouse, keyboard, scroll, touch)
- Automatically refreshes session for active users
- Only refreshes when:
  - User has been active within 5 minutes
  - Session is approaching expiration (within 10 minutes)
  - Session has not expired yet

### 3. **User-Friendly Feedback**
- Toast notifications using sonner library
- Brand-styled modal dialogs
- Clear time remaining displays
- Accessible notifications

## Architecture

### Components

```
src/
├── components/
│   └── auth/
│       └── SessionTimeout.tsx       # Main component
├── hooks/
│   ├── useSessionTimeout.ts         # Session monitoring hook
│   └── index.ts                     # Hook exports
└── app/
    └── layout.tsx                   # Integration point
```

### Component: SessionTimeout

**Location**: `/src/components/auth/SessionTimeout.tsx`

**Purpose**: Monitors session expiration and provides user feedback

**Features**:
- Toast notifications at 5min and 1min thresholds
- Modal dialog on session expiration
- Automatic session refresh for active users
- Development debug panel

**Usage**:
```tsx
import { SessionTimeout } from '@/components/auth/SessionTimeout';

// Already integrated in app/layout.tsx
<SessionProvider>
  <SessionTimeout />
  {children}
</SessionProvider>
```

### Hook: useSessionTimeout

**Location**: `/src/hooks/useSessionTimeout.ts`

**Purpose**: Custom hook for session timeout monitoring

**Returns**:
```typescript
interface SessionTimeoutState {
  isExpiring: boolean;              // Within 5-minute warning window
  isExpired: boolean;                // Session has expired
  timeRemaining: number;             // Milliseconds until expiration
  isCritical: boolean;               // Within 1-minute critical window
  formattedTimeRemaining: string;    // "4m 32s" format
}
```

**Callbacks**:
```typescript
interface SessionTimeoutCallbacks {
  onWarning?: () => void;    // Called at 5-minute threshold
  onCritical?: () => void;   // Called at 1-minute threshold
  onExpired?: () => void;    // Called when session expires
}
```

**Usage**:
```tsx
const { isExpiring, isExpired, formattedTimeRemaining } = useSessionTimeout({
  onWarning: () => console.log('Session expiring soon'),
  onExpired: () => console.log('Session expired')
});
```

## Configuration

### Timeout Thresholds

Located in `/src/hooks/useSessionTimeout.ts`:

```typescript
const TIMEOUT_THRESHOLDS = {
  WARNING: 5 * 60 * 1000,      // 5 minutes
  CRITICAL: 1 * 60 * 1000,     // 1 minute
  CHECK_INTERVAL: 30 * 1000,   // 30 seconds
};
```

### Session Refresh Configuration

Located in `/src/components/auth/SessionTimeout.tsx`:

```typescript
const SESSION_CONFIG = {
  REFRESH_WINDOW: 10 * 60 * 1000,      // Refresh if within 10 minutes
  ACTIVITY_THRESHOLD: 5 * 60 * 1000,   // Active if interaction within 5 minutes
  ACTIVITY_DEBOUNCE: 1000,             // 1 second debounce
};
```

### Activity Events

The following user interactions are monitored:
- `mousedown`
- `keydown`
- `scroll`
- `touchstart`
- `click`

## User Experience

### Warning Timeline

```
Session Lifetime: 30 minutes (example)

|--------------------------|-----|-----|
0min                      25min 29min 30min
                           ↓     ↓     ↓
                        Warning Critical Expired
```

### Warning Toast (5 minutes before expiration)

- **Icon**: Clock icon
- **Title**: "Session Expiring Soon"
- **Message**: "Your session will expire in 5 minutes. Save your work."
- **Color**: Brand ember (amber)
- **Duration**: 10 seconds
- **Dismissible**: Yes

### Critical Toast (1 minute before expiration)

- **Icon**: Alert triangle
- **Title**: "Session Expiring"
- **Message**: "Your session will expire in 1 minute!"
- **Color**: Red
- **Duration**: 30 seconds
- **Dismissible**: Yes

### Expiration Modal

- **Type**: Alert Dialog (blocks interaction)
- **Icon**: Alert triangle in ember circle
- **Title**: "Session Expired"
- **Message**: "Your session has expired for security reasons. Please sign in again to continue."
- **Action**: "Sign In Again" button
- **Behavior**: Redirects to sign-in with callback URL

### Auto-Refresh Success Toast

- **Title**: "Session Extended"
- **Message**: "Your session has been automatically renewed."
- **Color**: Green
- **Duration**: 3 seconds

## Integration

### Already Integrated

The session timeout system is already integrated in `/src/app/layout.tsx`:

```tsx
<SessionProvider>
  <ThemeProvider>
    <AuthErrorBoundary>
      <SessionTimeout />
      <Toaster position="top-right" />
      {children}
    </AuthErrorBoundary>
  </ThemeProvider>
</SessionProvider>
```

### Required Dependencies

All dependencies are already installed:
- `next-auth` - Session management
- `sonner` - Toast notifications
- `@radix-ui/react-alert-dialog` - Modal dialogs
- `lucide-react` - Icons

## Development

### Debug Panel

In development mode (`NODE_ENV=development`), a debug panel appears in the bottom-right corner when session is expiring:

```
Session Debug Info
Time remaining: 4m 32s
Is expiring: Yes
Is expired: No
```

### Testing Session Timeout

To test the session timeout functionality:

1. **Adjust NextAuth Session Duration**:
   ```typescript
   // In auth.config.ts or equivalent
   export const authOptions = {
     session: {
       strategy: "jwt",
       maxAge: 2 * 60, // 2 minutes for testing
     },
   };
   ```

2. **Sign in and wait** for warnings to appear

3. **Test automatic refresh**:
   - Move mouse or interact with page
   - Session should auto-refresh before expiration

4. **Test expiration**:
   - Stop interacting with page
   - Wait for session to expire
   - Modal should appear

## Accessibility

### ARIA Attributes

- Toast notifications have `role="alert"`
- Modal has proper ARIA labels
- Keyboard navigation supported
- Focus management in modal

### Screen Reader Support

- Announcements for warnings
- Clear modal title and description
- Action button clearly labeled

### Keyboard Navigation

- Modal can be dismissed with Escape
- "Sign In Again" button is keyboard accessible
- Toast notifications are keyboard dismissible

## Brand Styling

### Color Palette

Uses brand colors from design system:

- **Warning**: `brand-ember` (#ff9f40)
- **Critical**: Red (#ef4444)
- **Success**: Green (#22c55e)
- **Accent**: `brand-cyan` (#00d9ff)

### Typography

- **Titles**: Outfit font (brand heading font)
- **Body**: Inter font (brand body font)
- **Weight**: Semibold (600) for emphasis

### Components

- Rounded corners: `rounded-lg` for toasts, `rounded-2xl` for modals
- Shadows: `shadow-lg` for elevation
- Dark mode support throughout

## API Reference

### SessionTimeout Component

```tsx
import { SessionTimeout } from '@/components/auth/SessionTimeout';

// No props required
<SessionTimeout />
```

### useSessionTimeout Hook

```tsx
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

const timeout = useSessionTimeout({
  onWarning: () => {
    // Handle 5-minute warning
  },
  onCritical: () => {
    // Handle 1-minute critical warning
  },
  onExpired: () => {
    // Handle session expiration
  },
});

// Access state
const {
  isExpiring,              // boolean
  isExpired,               // boolean
  isCritical,              // boolean
  timeRemaining,           // number (milliseconds)
  formattedTimeRemaining,  // string ("4m 32s")
} = timeout;
```

## Best Practices

### 1. **Session Duration Configuration**

Set appropriate session duration based on security requirements:

```typescript
// For sensitive operations: shorter sessions
maxAge: 15 * 60  // 15 minutes

// For general use: longer sessions
maxAge: 30 * 60  // 30 minutes

// For long-form content: extended sessions
maxAge: 60 * 60  // 1 hour
```

### 2. **Activity Detection**

The system monitors user activity to determine if automatic refresh is appropriate:

- Only refreshes for active users
- Prevents unnecessary API calls
- Balances security with UX

### 3. **Warning Timing**

Current thresholds (5min warning, 1min critical) provide:

- Adequate time to save work
- Urgency without annoyance
- Clear progression of warnings

### 4. **Toast Persistence**

- Warning toast: 10 seconds (informative, dismissible)
- Critical toast: 30 seconds (more urgent, stays longer)
- Expiration toast: Infinity (requires action via modal)

## Troubleshooting

### Warnings Not Appearing

**Issue**: No toast notifications when session expires

**Solutions**:
1. Verify `<Toaster />` is in layout
2. Check `<SessionTimeout />` is inside `<SessionProvider>`
3. Verify session has `expires` field

### Modal Not Showing

**Issue**: Expiration modal doesn't appear

**Solutions**:
1. Check console for errors
2. Verify AlertDialog components are installed
3. Check z-index conflicts

### Auto-Refresh Not Working

**Issue**: Session expires despite user activity

**Solutions**:
1. Check `update()` function is available
2. Verify session configuration allows refresh
3. Check activity detection events

### Debug Panel Not Visible

**Issue**: Can't see debug info in development

**Solutions**:
1. Verify `NODE_ENV=development`
2. Wait until session is expiring
3. Check bottom-right corner of screen

## Future Enhancements

Potential improvements:

1. **Customizable Thresholds**: Allow per-route timeout configuration
2. **Pause on Visibility**: Extend session when tab is not visible
3. **Countdown Timer**: Show countdown in toast notifications
4. **Activity Indicators**: Visual feedback for active session
5. **Session History**: Track session refresh events
6. **Custom Callbacks**: Per-page timeout handlers

## Related Documentation

- [NextAuth Documentation](https://next-auth.js.org/)
- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [Radix UI Alert Dialog](https://www.radix-ui.com/docs/primitives/components/alert-dialog)

## Support

For issues or questions:
1. Check this documentation
2. Review component comments
3. Test in development mode with debug panel
4. Adjust thresholds in configuration constants
