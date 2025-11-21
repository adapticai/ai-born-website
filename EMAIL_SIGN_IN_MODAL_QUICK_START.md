# Email Sign In Modal - Quick Start Guide

## Installation

No installation needed! All dependencies are already available in the project.

## Basic Usage

### 1. Import the Component

```tsx
import { EmailSignInButton } from "@/components/auth/SignInButton";
```

### 2. Add to Your Page

```tsx
export default function MyPage() {
  return (
    <div>
      <h1>Welcome</h1>
      <EmailSignInButton />
    </div>
  );
}
```

That's it! The button will open a beautiful modal when clicked.

## Common Use Cases

### Full-Width Button
```tsx
<EmailSignInButton className="w-full" />
```

### Large Button
```tsx
<EmailSignInButton size="lg" />
```

### Outline Style
```tsx
<EmailSignInButton variant="outline" />
```

### Custom Text
```tsx
<EmailSignInButton>
  Sign in to your account
</EmailSignInButton>
```

### With Callback URL
```tsx
<EmailSignInButton callbackUrl="/dashboard">
  Continue to Dashboard
</EmailSignInButton>
```

### Brand-Styled
```tsx
<EmailSignInButton
  className="bg-brand-cyan text-brand-obsidian hover:bg-brand-cyan/90"
  size="lg"
>
  Get Started
</EmailSignInButton>
```

## What Happens When User Clicks?

1. **Modal Opens**: Beautiful dialog appears
2. **User Enters Email**: With real-time validation
3. **Click "Send magic link"**: Loading state shows
4. **Success**: Confirmation message displays
5. **User Checks Email**: Clicks link to sign in
6. **Redirects**: To `callbackUrl` or home page

## Modal States

| State | What User Sees |
|-------|----------------|
| **Input** | Email form with "Send magic link" button |
| **Loading** | Spinner with "Sending magic link..." |
| **Success** | Green checkmark + "Check your email" message |
| **Error** | Red alert + error message + "Try again" button |

## File Locations

- **Component**: `/src/components/auth/EmailSignInModal.tsx`
- **Button**: `/src/components/auth/SignInButton.tsx`
- **Docs**: `/src/components/auth/EMAIL_SIGN_IN_MODAL.md`
- **Examples**: `/src/components/auth/EmailSignInExample.tsx`

## Need More Control?

Use the modal directly:

```tsx
"use client";

import { useState } from "react";
import { EmailSignInModal } from "@/components/auth/EmailSignInModal";

export function CustomSignIn() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Custom Trigger
      </button>

      <EmailSignInModal
        open={open}
        onOpenChange={setOpen}
        callbackUrl="/account"
      />
    </>
  );
}
```

## Props Reference

### EmailSignInButton

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "outline" \| "ghost" \| "link"` | `"default"` | Button style |
| `size` | `"default" \| "sm" \| "lg" \| "icon"` | `"default"` | Button size |
| `className` | `string` | - | Custom CSS classes |
| `callbackUrl` | `string` | `"/"` | Redirect URL after sign-in |
| `children` | `ReactNode` | `"Sign in with Email"` | Button text |

### EmailSignInModal

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | Required | Modal open state |
| `onOpenChange` | `(open: boolean) => void` | Required | State change handler |
| `callbackUrl` | `string` | `"/"` | Redirect URL |

## Troubleshooting

### Modal doesn't open?
- Make sure you're using `"use client"` directive
- Check that state is properly managed

### Email not sending?
- Verify NextAuth email provider is configured
- Check environment variables (SMTP settings)

### Styling issues?
- Make sure Tailwind classes are being processed
- Check that brand colors are defined in `tailwind.config.ts`

## Full Documentation

For complete documentation, see:
- [EMAIL_SIGN_IN_MODAL.md](/src/components/auth/EMAIL_SIGN_IN_MODAL.md)
- [EMAIL_SIGN_IN_MODAL_IMPLEMENTATION.md](/EMAIL_SIGN_IN_MODAL_IMPLEMENTATION.md)

## Questions?

Check the example implementations:
```tsx
import { EmailSignInExample } from "@/components/auth/EmailSignInExample";
```

---

**Quick Reference Created**: 19 October 2025
