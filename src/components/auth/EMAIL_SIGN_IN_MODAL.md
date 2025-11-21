# Email Sign In Modal

A beautiful, accessible modal component for email magic link authentication using shadcn/ui components.

## Features

- **Email validation** using Zod schemas
- **Multiple states**: input, loading, success, and error
- **Accessible**: Full keyboard navigation and ARIA labels
- **Brand-aligned**: Uses AI-Born brand colors (cyan accent)
- **Error handling**: Graceful error states with retry functionality
- **Auto-reset**: Cleans up state when modal closes

## Usage

### Basic Usage with EmailSignInButton

The easiest way to use the modal is through the `EmailSignInButton` component, which automatically handles the modal state:

```tsx
import { EmailSignInButton } from "@/components/auth/SignInButton";

export default function MyPage() {
  return (
    <EmailSignInButton
      callbackUrl="/account"
      variant="default"
      size="lg"
    >
      Sign in with Email
    </EmailSignInButton>
  );
}
```

### Custom Integration

You can also use the modal directly for custom implementations:

```tsx
"use client";

import { useState } from "react";
import { EmailSignInModal } from "@/components/auth/EmailSignInModal";
import { Button } from "@/components/ui/button";

export default function CustomSignIn() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setModalOpen(true)}>
        Custom Sign In
      </Button>

      <EmailSignInModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        callbackUrl="/dashboard"
      />
    </>
  );
}
```

## Props

### EmailSignInModal

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | Required | Whether the modal is open |
| `onOpenChange` | `(open: boolean) => void` | Required | Callback when modal state changes |
| `callbackUrl` | `string` | `"/"` | URL to redirect to after sign-in |

### EmailSignInButton

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `callbackUrl` | `string` | `"/"` | URL to redirect to after sign-in |
| `variant` | `"default" \| "outline" \| "ghost" \| "link"` | `"default"` | Button variant |
| `size` | `"default" \| "sm" \| "lg" \| "icon"` | `"default"` | Button size |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | `"Sign in with Email"` | Button text |

## Modal States

### 1. Input State
- Email input field with validation
- "Send magic link" button
- Real-time email format validation

### 2. Loading State
- Animated spinner
- "Sending magic link..." message
- Disabled interactions

### 3. Success State
- Success icon (green checkmark)
- Confirmation message with email address
- "Close" button

### 4. Error State
- Error icon (red alert)
- Descriptive error message
- "Try again" and "Cancel" buttons

## Error Handling

The modal handles various error scenarios:

- **AccessDenied**: Invalid email or access denied
- **Configuration**: Email service not configured
- **Network errors**: Generic network failures
- **Rate limiting**: Too many requests (handled by backend)

Each error displays a user-friendly message and offers retry functionality.

## Accessibility

- **Keyboard navigation**: Full support for Tab, Enter, Escape
- **ARIA labels**: Proper labeling for screen readers
- **Focus management**: Auto-focus on email input when opened
- **Visual indicators**: Clear focus states and error messages
- **Screen reader**: Tested with NVDA and VoiceOver

## Brand Integration

The modal uses AI-Born brand colors:

- **Primary accent**: `brand-cyan` (#00d9ff) for CTAs and success states
- **Dark background**: `brand-obsidian` (#0a0a0f) for text on cyan buttons
- **Error states**: Standard destructive colors for consistency

## Analytics Integration

The component supports analytics tracking through NextAuth callbacks. Track these events:

```typescript
// Magic link sent successfully
{
  event: 'magic_link_sent',
  email_domain: 'example.com',
  callback_url: '/account'
}

// Sign-in error
{
  event: 'magic_link_error',
  error_type: 'AccessDenied',
  callback_url: '/account'
}
```

## Examples

### Different Variants

```tsx
// Primary button (default)
<EmailSignInButton>
  Sign in with Email
</EmailSignInButton>

// Outline button
<EmailSignInButton variant="outline">
  Email Sign In
</EmailSignInButton>

// Large size
<EmailSignInButton size="lg">
  Get Started
</EmailSignInButton>

// Custom styling
<EmailSignInButton
  className="w-full"
  variant="outline"
>
  Continue with Email
</EmailSignInButton>
```

### With Callback URL

```tsx
// Redirect to account page after sign-in
<EmailSignInButton callbackUrl="/account">
  Sign in
</EmailSignInButton>

// Redirect to checkout
<EmailSignInButton callbackUrl="/checkout">
  Sign in to Complete Purchase
</EmailSignInButton>
```

### Custom Modal Trigger

```tsx
"use client";

import { useState } from "react";
import { EmailSignInModal } from "@/components/auth/EmailSignInModal";

export function CustomTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        Custom Trigger Element
      </div>

      <EmailSignInModal
        open={open}
        onOpenChange={setOpen}
        callbackUrl="/dashboard"
      />
    </>
  );
}
```

## Implementation Details

### Form Validation

Uses Zod schema for robust email validation:

```typescript
const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});
```

### State Management

Modal maintains four distinct states:
- `input`: Default state with form
- `loading`: While sending magic link
- `success`: After successful send
- `error`: When send fails

### Auto-cleanup

Modal automatically resets to initial state when closed (after 200ms animation delay).

## Dependencies

- `next-auth`: Authentication provider
- `react-hook-form`: Form state management
- `zod`: Schema validation
- `@hookform/resolvers`: Zod resolver for react-hook-form
- `lucide-react`: Icons
- `shadcn/ui`: UI components (Dialog, Form, Input, Button)

## Testing

### Unit Tests

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmailSignInModal } from './EmailSignInModal';

test('validates email format', async () => {
  const onOpenChange = jest.fn();

  render(
    <EmailSignInModal
      open={true}
      onOpenChange={onOpenChange}
    />
  );

  const input = screen.getByPlaceholderText('name@example.com');
  const button = screen.getByText('Send magic link');

  fireEvent.change(input, { target: { value: 'invalid-email' } });
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test('email sign-in flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Sign in with Email');

  await page.fill('input[type="email"]', 'test@example.com');
  await page.click('text=Send magic link');

  await expect(page.locator('text=Check your email')).toBeVisible();
  await expect(page.locator('text=test@example.com')).toBeVisible();
});
```

## Troubleshooting

### Modal doesn't open
- Ensure `open` state is properly managed
- Check that Dialog component is imported from `@/components/ui/dialog`

### Email not sending
- Verify NextAuth email provider is configured
- Check environment variables (SMTP settings)
- Review NextAuth debug logs

### Validation errors not showing
- Ensure Zod schema is properly configured
- Check FormMessage component is included in FormField
- Verify react-hook-form setup

## Related Components

- [SignInButton](/src/components/auth/SignInButton.tsx) - Main authentication button
- [AuthButton](/src/components/auth/AuthButton.tsx) - Unified auth state button
- [Dialog](/src/components/ui/dialog.tsx) - Modal component
- [Form](/src/components/ui/form.tsx) - Form wrapper components

## License

This component is part of the AI-Born website codebase.
