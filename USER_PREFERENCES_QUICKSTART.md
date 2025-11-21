# User Preferences API - Quick Start Guide

## Setup (5 minutes)

### 1. Run Database Migration

```bash
# Generate and apply Prisma migration
npx prisma migrate dev --name add_user_preferences

# Generate Prisma Client
npx prisma generate
```

### 2. Verify Files

Check that these files exist:

- ✓ `/src/types/user.ts` - Type definitions
- ✓ `/src/app/api/user/preferences/route.ts` - API endpoints
- ✓ `/src/components/settings/PreferencesSettings.tsx` - UI component (updated)
- ✓ `prisma/schema.prisma` - Database schema (updated)

### 3. Test the API

**Option A: Via Browser**

1. Start dev server: `npm run dev`
2. Sign in to the application
3. Navigate to: `http://localhost:3000/settings`
4. Click on "Preferences" tab
5. Change settings and click "Save preferences"

**Option B: Via curl (requires auth cookie)**

```bash
# GET preferences
curl http://localhost:3000/api/user/preferences \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# PUT preferences
curl -X PUT http://localhost:3000/api/user/preferences \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "theme": "dark",
    "emailNotifications": {
      "newsletter": true
    }
  }'
```

## Basic Usage

### Fetch User Preferences

```typescript
// In a client component
const response = await fetch('/api/user/preferences');
const data = await response.json();

if (data.success) {
  console.log(data.preferences);
}
```

### Update Preferences

```typescript
const response = await fetch('/api/user/preferences', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    theme: 'dark',
    emailNotifications: {
      newsletter: true,
      productUpdates: false
    }
  })
});

const data = await response.json();
```

### Use in React Component

```tsx
'use client';

import { useEffect, useState } from 'react';
import type { UserPreferences } from '@/types/user';

export function MyComponent() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPreferences() {
      const res = await fetch('/api/user/preferences');
      const data = await res.json();

      if (data.success) {
        setPreferences(data.preferences);
      }
      setLoading(false);
    }

    loadPreferences();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>Theme: {preferences?.theme}</p>
      <p>Newsletter: {preferences?.emailNotifications.newsletter ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

## Common Scenarios

### Check if User Has Newsletter Enabled

```typescript
const res = await fetch('/api/user/preferences');
const data = await res.json();

if (data.success && data.preferences.emailNotifications.newsletter) {
  console.log('User is subscribed to newsletter');
}
```

### Toggle a Single Preference

```typescript
// Fetch current preferences
const getRes = await fetch('/api/user/preferences');
const current = await getRes.json();

// Update just one field
await fetch('/api/user/preferences', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emailNotifications: {
      ...current.preferences.emailNotifications,
      newsletter: !current.preferences.emailNotifications.newsletter
    }
  })
});
```

### Apply Theme Preference

```typescript
const res = await fetch('/api/user/preferences');
const data = await res.json();

if (data.success) {
  const theme = data.preferences.theme;

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (theme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // System theme
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', isDark);
  }
}
```

## API Reference

### Endpoints

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/api/user/preferences` | Fetch preferences | 100/hour |
| PUT | `/api/user/preferences` | Update preferences | 20/hour |

### Types

```typescript
interface UserPreferences {
  emailNotifications: {
    newsletter: boolean;
    marketingEmails: boolean;
    productUpdates: boolean;
    weeklyDigest: boolean;
    bonusNotifications: boolean;
    launchEvents: boolean;
  };
  theme: "light" | "dark" | "system";
  language: "en" | "en-GB";
  communication: {
    preferredChannel: "email" | "none";
    emailFrequency: "immediate" | "daily" | "weekly" | "never";
    mediaContact: boolean;
    bulkOrderContact: boolean;
  };
}
```

### Response Format

**Success:**
```json
{
  "success": true,
  "preferences": { /* UserPreferences */ }
}
```

**Error:**
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable message",
  "statusCode": 400
}
```

## Troubleshooting

### "Authentication required" error

**Issue:** Not signed in

**Fix:** Ensure user is authenticated before calling API

```typescript
import { useSession } from 'next-auth/react';

export function MyComponent() {
  const { data: session, status } = useSession();

  if (status === 'unauthenticated') {
    return <p>Please sign in</p>;
  }

  // Now safe to call API
}
```

### "Rate limit exceeded" error

**Issue:** Too many requests

**Fix:** Implement proper caching and debouncing

```typescript
import { debounce } from 'lodash';

const savePreferences = debounce(async (prefs) => {
  await fetch('/api/user/preferences', {
    method: 'PUT',
    body: JSON.stringify(prefs)
  });
}, 1000); // Wait 1 second after last change
```

### Preferences not persisting

**Issue:** Database migration not run

**Fix:**
```bash
npx prisma migrate dev
npx prisma generate
npm run dev
```

## Next Steps

1. Read full documentation: `USER_PREFERENCES_API.md`
2. Implement theme switcher in navbar
3. Add preference-based email segmentation
4. Set up preference analytics

## Need Help?

- Check `/docs` for additional documentation
- Review example code in `/src/components/settings/PreferencesSettings.tsx`
- Check API implementation in `/src/app/api/user/preferences/route.ts`

---

**Version:** 1.0.0
**Last Updated:** 2025-10-19
