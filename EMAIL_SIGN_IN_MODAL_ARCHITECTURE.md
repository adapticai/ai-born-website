# Email Sign In Modal - Architecture

## Component Hierarchy

```
EmailSignInButton (wrapper component)
│
├── Button (trigger)
│   └── EmailIcon + Text
│
└── EmailSignInModal
    │
    └── Dialog (shadcn/ui)
        │
        └── DialogContent
            │
            ├── DialogHeader
            │   ├── DialogTitle (dynamic based on state)
            │   └── DialogDescription (dynamic based on state)
            │
            └── Content (varies by state):
                │
                ├── Input State:
                │   └── Form (react-hook-form)
                │       └── FormField
                │           ├── FormLabel
                │           ├── FormControl
                │           │   └── Input (email)
                │           └── FormMessage (validation errors)
                │       └── Button ("Send magic link")
                │
                ├── Loading State:
                │   ├── Loader2 (animated spinner)
                │   └── Text ("Sending magic link...")
                │
                ├── Success State:
                │   ├── CheckCircle2 (success icon)
                │   ├── Text (confirmation message)
                │   └── Button ("Close")
                │
                └── Error State:
                    ├── AlertCircle (error icon)
                    ├── Text (error message)
                    └── Actions
                        ├── Button ("Cancel")
                        └── Button ("Try again")
```

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       User Clicks Button                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Modal Opens  │
                    │ State: INPUT │
                    └──────┬───────┘
                           │
                 ┌─────────┴─────────┐
                 │                   │
                 ▼                   ▼
         ┌───────────────┐   ┌──────────────┐
         │ User Enters   │   │ User Closes  │
         │ Invalid Email │   │    Modal     │
         └───────┬───────┘   └──────┬───────┘
                 │                   │
                 ▼                   ▼
         ┌───────────────┐   ┌──────────────┐
         │ Show Error    │   │ Auto-Reset   │
         │ Stay on INPUT │   │  to INPUT    │
         └───────────────┘   └──────────────┘

                 ▼
         ┌───────────────┐
         │ User Enters   │
         │  Valid Email  │
         └───────┬───────┘
                 │
                 ▼
         ┌───────────────┐
         │ State: LOADING│
         │   (Spinner)   │
         └───────┬───────┘
                 │
         ┌───────┴────────┐
         │                │
         ▼                ▼
┌────────────────┐  ┌─────────────────┐
│ signIn() Fails │  │ signIn() Success│
└────────┬───────┘  └────────┬────────┘
         │                   │
         ▼                   ▼
┌────────────────┐  ┌─────────────────┐
│ State: ERROR   │  │ State: SUCCESS  │
│ Show Message   │  │ "Check Email"   │
└────────┬───────┘  └────────┬────────┘
         │                   │
         ▼                   ▼
┌────────────────┐  ┌─────────────────┐
│ Click "Try     │  │ User Clicks     │
│  Again" → INPUT│  │ "Close" or X    │
└────────────────┘  └────────┬────────┘
         │                   │
         └───────┬───────────┘
                 │
                 ▼
         ┌──────────────┐
         │ Modal Closes │
         │  Auto-Reset  │
         └──────────────┘
```

## Data Flow

```
User Action → Component State → UI Update
     │              │               │
     │              │               └─→ Visual feedback
     │              │
     │              └─→ Form validation
     │                  │
     │                  ├─→ Valid: proceed
     │                  └─→ Invalid: show error
     │
     └─→ API Call (signIn)
         │
         ├─→ Success: show confirmation
         └─→ Error: show error message
```

## Component Dependencies

```
EmailSignInModal.tsx
│
├── React Hooks
│   ├── useState (modal state management)
│   └── useForm (form state from react-hook-form)
│
├── External Libraries
│   ├── next-auth/react (signIn function)
│   ├── zod (email validation schema)
│   ├── @hookform/resolvers (zodResolver)
│   └── lucide-react (icons)
│
└── Internal Components (shadcn/ui)
    ├── Dialog
    ├── Form
    ├── Input
    └── Button
```

## Error Handling Flow

```
signIn() Call
│
├─→ Network Error
│   └─→ Show: "An unexpected error occurred..."
│
├─→ result.error === "AccessDenied"
│   └─→ Show: "Access denied. Please check your email..."
│
├─→ result.error === "Configuration"
│   └─→ Show: "Email service is not configured..."
│
├─→ Other Error
│   └─→ Show: "Failed to send magic link..."
│
└─→ Success (no error)
    └─→ Show: "Check your email" with user's email address
```

## Validation Flow

```
User Types Email
│
├─→ onChange Event
│   └─→ React Hook Form Updates State
│       │
│       └─→ Zod Validation (Real-time)
│           │
│           ├─→ Valid: Clear error
│           └─→ Invalid: Show error message
│
└─→ Form Submit
    │
    ├─→ Validation Fails
    │   └─→ Prevent submission
    │       └─→ Show field errors
    │
    └─→ Validation Passes
        └─→ Call signIn()
            └─→ Set state to LOADING
```

## Modal Lifecycle

```
Component Mount
│
├─→ Initial State: "input"
│
├─→ Modal Closed (open = false)
│   └─→ No rendering (hidden)
│
├─→ Modal Opens (open = true)
│   │
│   ├─→ Render DialogContent
│   │   └─→ Auto-focus email input
│   │
│   ├─→ User Interaction
│   │   └─→ State changes (input → loading → success/error)
│   │
│   └─→ Modal Closes
│       │
│       └─→ 200ms delay
│           └─→ Reset to initial state
│               ├─→ State: "input"
│               ├─→ Clear error message
│               └─→ Reset form
│
└─→ Component Unmount
    └─→ Cleanup (automatic)
```

## Security Flow

```
User Email Input
│
├─→ Client-Side Validation (Zod)
│   ├─→ Email format check
│   ├─→ Required field check
│   └─→ XSS prevention (React escaping)
│
├─→ NextAuth signIn()
│   │
│   ├─→ Server-Side Validation
│   │   ├─→ Email format re-check
│   │   ├─→ Rate limiting
│   │   └─→ Email domain validation
│   │
│   ├─→ Generate Magic Link Token
│   │   ├─→ Secure random token
│   │   ├─→ Expiration time (e.g., 24 hours)
│   │   └─→ Store in database
│   │
│   └─→ Send Email
│       ├─→ SMTP transport (secure)
│       ├─→ Email template
│       └─→ Magic link with token
│
└─→ User Clicks Link
    │
    └─→ NextAuth Verification
        ├─→ Token validation
        ├─→ Expiration check
        ├─→ Create session
        └─→ Redirect to callbackUrl
```

## Accessibility Tree

```
Dialog (role="dialog")
│
├─→ DialogTitle (aria-labelledby)
│   └─→ Dynamic title based on state
│
├─→ DialogDescription (aria-describedby)
│   └─→ Dynamic description
│
└─→ Content
    │
    ├─→ Form (if state === "input")
    │   │
    │   └─→ FormField
    │       │
    │       ├─→ Label (htmlFor, aria-label)
    │       │
    │       ├─→ Input (aria-invalid, aria-describedby)
    │       │   └─→ Email validation
    │       │
    │       └─→ FormMessage (role="alert" if error)
    │
    ├─→ Status Message (if loading/success/error)
    │   └─→ Live region (implicit)
    │
    └─→ Buttons
        └─→ Proper focus management
```

## Performance Optimizations

```
Rendering
│
├─→ Conditional Rendering
│   └─→ Only render active state content
│
├─→ Form Optimization
│   ├─→ React Hook Form (minimal re-renders)
│   └─→ Controlled components only when needed
│
├─→ Cleanup
│   └─→ Auto-reset on close (prevent memory leaks)
│
└─→ Bundle Size
    └─→ Use existing shadcn/ui components
        └─→ No additional dependencies
```

## Integration Points

```
EmailSignInModal
│
├─→ NextAuth
│   ├─→ signIn('email', { email, callbackUrl })
│   └─→ Email provider configuration
│
├─→ Environment
│   ├─→ SMTP settings
│   └─→ Email templates
│
├─→ Analytics (optional)
│   ├─→ Modal open event
│   ├─→ Form submit event
│   ├─→ Success event
│   └─→ Error events
│
└─→ Parent Component
    ├─→ open state
    ├─→ onOpenChange callback
    └─→ callbackUrl prop
```

## File Structure

```
src/components/auth/
│
├── EmailSignInModal.tsx
│   └── Exports:
│       ├── EmailSignInModal (component)
│       └── EmailSignInModalProps (interface)
│
├── SignInButton.tsx
│   └── Exports:
│       ├── SignInButton
│       ├── EmailSignInButton (uses EmailSignInModal)
│       ├── GoogleSignInButton
│       └── GitHubSignInButton
│
├── EmailSignInExample.tsx
│   └── Example implementations
│
└── EMAIL_SIGN_IN_MODAL.md
    └── Complete documentation
```

---

**Architecture Documentation Created**: 19 October 2025
**Purpose**: Reference for understanding component structure and data flow
