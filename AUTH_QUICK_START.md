# Auth.js Quick Start Guide

Get authentication working in 5 minutes.

## 1. Generate Secret

```bash
openssl rand -base64 32
```

Copy the output to `.env`:

```bash
NEXTAUTH_SECRET="<paste-generated-secret-here>"
NEXTAUTH_URL="http://localhost:3000"
```

## 2. Set Up Database (Required)

Add Prisma schema to `prisma/schema.prisma`:

```prisma
// Copy the schema from AUTH_SETUP.md, section "Database Setup"
```

Run migrations:

```bash
npx prisma migrate dev --name add-auth-tables
npx prisma generate
```

## 3. Add SessionProvider to Layout

Update `src/app/layout.tsx`:

```tsx
import { SessionProvider } from '@/components/auth';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

## 4. Test Authentication

Start the dev server:

```bash
npm run dev
```

Visit: http://localhost:3000/auth/signin

## 5. Optional: Configure OAuth

### Google OAuth (Optional)

1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Add to `.env`:

```bash
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### GitHub OAuth (Optional)

1. Go to https://github.com/settings/developers
2. Create new OAuth App
3. Add callback URL: `http://localhost:3000/api/auth/callback/github`
4. Add to `.env`:

```bash
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

## 6. Use in Your App

### Server Component

```tsx
import { requireAuth } from '@/lib/auth';

export default async function ProfilePage() {
  const user = await requireAuth();

  return <div>Welcome, {user.name}!</div>;
}
```

### Client Component

```tsx
'use client';

import { useSession } from 'next-auth/react';
import { SignInButton } from '@/components/auth';

export function UserProfile() {
  const { data: session } = useSession();

  if (!session) return <SignInButton />;

  return <div>Hello, {session.user.name}!</div>;
}
```

## Available Components

```tsx
import {
  SignInButton,
  GoogleSignInButton,
  GitHubSignInButton,
  EmailSignInButton,
  SignOutButton,
  UserNav,
  SessionProvider,
} from '@/components/auth';
```

## Auth Routes

- Sign in: `/auth/signin`
- Sign out: `/auth/signout`
- Error: `/auth/error`
- Email verification: `/auth/verify-request`

## Protected Routes

These routes require authentication (configured in middleware):

- `/dashboard`
- `/profile`
- `/account`
- `/settings`
- `/bonus-claim`
- `/downloads`

Unauthenticated users are automatically redirected to sign-in.

## Troubleshooting

**"Configuration error"**
→ Missing `NEXTAUTH_SECRET` in `.env`

**"Database error"**
→ Run `npx prisma migrate dev`

**"Email not sending"**
→ Check `RESEND_API_KEY` in `.env`

**Need more help?**
→ See `AUTH_SETUP.md` for complete documentation

---

That's it! You now have a production-ready authentication system.
