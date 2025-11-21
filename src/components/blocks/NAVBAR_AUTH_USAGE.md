# Navbar Authentication UI - Usage Guide

## Overview

The Navbar component has been updated to include authentication UI that displays different states based on whether a user is authenticated or not.

## Features

### Desktop View
- **Not Authenticated**: Shows "Sign In" and "Sign Up" buttons
- **Authenticated**: Shows user avatar with dropdown menu containing:
  - User name and email
  - Account link
  - Settings link
  - Sign out link

### Mobile View
- **Not Authenticated**: Shows "Sign In" and "Sign Up" buttons in mobile menu
- **Authenticated**: Shows user avatar, name, email, and quick access links in mobile menu

## Usage

### Option 1: Server-Side Wrapper (Recommended)

Use the `NavbarWrapper` component in your layout. It automatically fetches the user session on the server:

```tsx
// app/layout.tsx
import { NavbarWrapper } from "@/components/blocks/navbar-wrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NavbarWrapper />
        {children}
      </body>
    </html>
  );
}
```

### Option 2: Direct Usage with Manual User Prop

If you need more control, use the `Navbar` component directly and pass the user manually:

```tsx
// app/layout.tsx
import { Navbar } from "@/components/blocks/navbar";
import { getCurrentUser } from "@/lib/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <Navbar user={user} />
        {children}
      </body>
    </html>
  );
}
```

### Option 3: Without Authentication

The navbar still works without authentication by passing `undefined` or `null`:

```tsx
import { Navbar } from "@/components/blocks/navbar";

export default function Layout() {
  return <Navbar user={null} />;
}
```

## Component Structure

### Files

1. **`navbar.tsx`** - Client component with UI logic
2. **`navbar-wrapper.tsx`** - Server component that fetches user data

### Type Definitions

```typescript
interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

interface NavbarProps {
  user?: User | null;
}
```

## Authentication Routes

The component links to the following authentication routes:

- **Sign In**: `/auth/signin`
- **Sign Up**: `/auth/signup`
- **Sign Out**: `/auth/signout`
- **Account**: `/account`
- **Settings**: `/settings`

Make sure these routes exist in your application or update the hrefs accordingly.

## Styling

The component uses existing design system tokens:

- Consistent with the current Navbar styling
- Uses `shadcn/ui` components (Avatar, DropdownMenu, Button)
- Fully responsive with mobile menu support
- Matches the existing color scheme and spacing

## User Avatar

The avatar component:

1. **Shows user image** if available
2. **Falls back to initials** from user name or email
3. **Uses accent colors** for fallback background

### Initials Logic

- If name exists: Uses first letter of each word (max 2)
- If only email exists: Uses first 2 characters
- Fallback: Shows "U"

## Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Focus states on all interactive elements
- Screen reader friendly

## Example: Conditional Rendering Based on Auth

```tsx
import { NavbarWrapper } from "@/components/blocks/navbar-wrapper";

export default function Page() {
  return (
    <div>
      <NavbarWrapper />
      <main>
        {/* Your content */}
      </main>
    </div>
  );
}
```

## Customization

### Changing Auth Routes

Update the link hrefs in `navbar.tsx`:

```tsx
// For Sign In
<Link href="/your-custom-signin" className="max-lg:hidden">
  <Button variant="ghost" size="sm">
    <span className="relative z-10">Sign In</span>
  </Button>
</Link>

// For Sign Out
<Link href="/your-custom-signout" className="cursor-pointer">
  <LogOut className="mr-2 size-4" />
  Sign out
</Link>
```

### Adding Menu Items

Add items to the dropdown menu in `navbar.tsx`:

```tsx
<DropdownMenuContent align="end" className="w-56">
  {/* Existing items */}
  <DropdownMenuItem asChild>
    <Link href="/billing" className="cursor-pointer">
      <CreditCard className="mr-2 size-4" />
      Billing
    </Link>
  </DropdownMenuItem>
</DropdownMenuContent>
```

## Integration with Auth Systems

The navbar works with any authentication system that provides a user object with the following shape:

```typescript
{
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}
```

### Auth.js (NextAuth)

Already integrated via `getCurrentUser` from `@/lib/auth`.

### Clerk

```tsx
import { currentUser } from "@clerk/nextjs/server";

export async function NavbarWrapper() {
  const clerkUser = await currentUser();

  const user = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    name: clerkUser.fullName,
    image: clerkUser.imageUrl,
  } : null;

  return <Navbar user={user} />;
}
```

### Supabase

```tsx
import { createServerClient } from "@/lib/supabase/server";

export async function NavbarWrapper() {
  const supabase = createServerClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  const user = supabaseUser ? {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.user_metadata?.name,
    image: supabaseUser.user_metadata?.avatar_url,
  } : null;

  return <Navbar user={user} />;
}
```

## Troubleshooting

### User not showing even when authenticated

1. Check that `getCurrentUser()` is returning the user object
2. Verify the user object has the correct shape
3. Ensure you're using the server wrapper or fetching user in a server component

### Dropdown not working

1. Verify `@radix-ui/react-dropdown-menu` is installed
2. Check that dropdown-menu component exists in `@/components/ui/dropdown-menu`

### Avatar not displaying

1. Verify `@radix-ui/react-avatar` is installed
2. Check that avatar component exists in `@/components/ui/avatar`
3. Ensure image URLs are accessible (CORS, authentication)

## Performance Notes

- The `NavbarWrapper` uses server-side rendering for authentication checks
- User data is fetched once per page load on the server
- No client-side auth state management required
- Uses React cache for optimal performance

## Security Notes

- User authentication is verified server-side
- No sensitive user data exposed to client unnecessarily
- Sign out links trigger server-side session invalidation
- Protected routes should still verify authentication in middleware

## Next Steps

1. Ensure authentication routes (`/auth/signin`, `/auth/signup`, `/auth/signout`) exist
2. Create or verify `/account` and `/settings` pages exist
3. Test the navbar in both authenticated and unauthenticated states
4. Customize menu items and routes as needed for your application
