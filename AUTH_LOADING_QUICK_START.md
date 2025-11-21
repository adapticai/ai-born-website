# AuthLoadingState - Quick Start Guide

## TL;DR

Use `AuthLoadingState` for beautiful, consistent loading states across your authentication UI.

## Quick Import

```tsx
import { AuthLoadingState } from "@/components/auth";
```

## Common Patterns

### 1. Page Loading (Most Common)

```tsx
<Suspense fallback={<AuthLoadingState variant="page" showSpinner />}>
  <YourPageContent />
</Suspense>
```

### 2. Form Loading

```tsx
{isLoading ? (
  <AuthLoadingState variant="form" message="Submitting..." />
) : (
  <YourForm />
)}
```

### 3. Button Loading

```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <AuthLoadingState variant="button" message="Processing..." />
  ) : (
    "Submit"
  )}
</Button>
```

### 4. Card/Section Loading

```tsx
<AuthLoadingState
  variant="card"
  message="Loading content..."
  showSpinner
/>
```

## All Variants At a Glance

| Variant | Use For | Shows Spinner | Item Count |
|---------|---------|---------------|------------|
| `page` | Full page loads | ✅ Yes | - |
| `button` | Button states | ✅ Yes | - |
| `card` | Cards, containers | ✅ Yes | - |
| `form` | Form loading | ✅ Yes | - |
| `table` | Data tables | ✅ Yes | ⚙️ Optional |
| `list` | List views | ✅ Yes | ⚙️ Optional |

## Props Cheat Sheet

```tsx
interface AuthLoadingStateProps {
  variant?: "page" | "button" | "card" | "form" | "table" | "list";
  message?: string;          // Optional loading message
  showSpinner?: boolean;     // Default: true
  itemCount?: number;        // For table/list variants
  className?: string;        // Additional styles
}
```

## Copy-Paste Examples

### Example 1: Replace Old Loading Spinner

**Before:**
```tsx
{loading && <div className="spinner">Loading...</div>}
```

**After:**
```tsx
{loading && <AuthLoadingState variant="page" message="Loading..." />}
```

### Example 2: Add to Suspense Boundary

```tsx
export default function MyPage() {
  return (
    <Suspense
      fallback={
        <AuthLoadingState
          variant="page"
          message="Loading your data..."
          showSpinner
        />
      }
    >
      <DataComponent />
    </Suspense>
  );
}
```

### Example 3: List with Custom Count

```tsx
<AuthLoadingState
  variant="list"
  message="Loading items..."
  itemCount={5}
/>
```

## Files You Can Copy From

Working examples in:
- `/src/app/auth/signin/page.tsx` - Form loading
- `/src/app/account/page.tsx` - Suspense boundary
- `/src/app/account/AccountContent.tsx` - Page loading
- `/src/app/downloads/page.tsx` - Complex Suspense setup

## Common Mistakes to Avoid

❌ **Don't** forget Suspense for async components:
```tsx
<AsyncComponent /> // Missing Suspense!
```

✅ **Do** wrap with Suspense:
```tsx
<Suspense fallback={<AuthLoadingState variant="page" />}>
  <AsyncComponent />
</Suspense>
```

---

❌ **Don't** use wrong variant for context:
```tsx
// Don't use 'button' for full page loading
<AuthLoadingState variant="button" />
```

✅ **Do** match variant to UI:
```tsx
// Use 'page' for full page loading
<AuthLoadingState variant="page" />
```

---

❌ **Don't** forget to provide helpful messages:
```tsx
<AuthLoadingState variant="page" /> // No context!
```

✅ **Do** tell users what's loading:
```tsx
<AuthLoadingState variant="page" message="Loading your account..." />
```

## Need More Info?

See full documentation: `/AUTH_LOADING_STATE_COMPONENT.md`

---

**Quick Reference Card**

```tsx
// 1. Import
import { AuthLoadingState } from "@/components/auth";

// 2. Use in Suspense
<Suspense fallback={<AuthLoadingState variant="page" />}>
  <Component />
</Suspense>

// 3. Or use conditionally
{loading && <AuthLoadingState variant="card" message="Loading..." />}

// 4. That's it! 🎉
```
