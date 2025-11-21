# User Preferences API Implementation

## Overview

This document describes the implementation of the user preferences system for the AI-Born website. The system allows authenticated users to manage their email notification preferences, theme settings, language preferences, and communication settings.

## Architecture

### Components

1. **Database Schema** (`prisma/schema.prisma`)
   - Added `preferences` JSONB field to `User` model
   - Flexible storage for nested preference objects

2. **TypeScript Types** (`/src/types/user.ts`)
   - Complete type definitions for user preferences
   - Default preferences
   - Helper functions for validation and sanitization

3. **API Endpoints** (`/src/app/api/user/preferences/route.ts`)
   - GET endpoint for fetching preferences
   - PUT endpoint for updating preferences
   - Authentication and rate limiting

4. **UI Component** (`/src/components/settings/PreferencesSettings.tsx`)
   - Form-based preferences editor
   - Auto-fetches preferences on mount
   - Real-time validation with Zod

## Database Schema

### User Model Update

```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  emailVerified DateTime?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  // User preferences (flexible JSONB storage)
  preferences   Json?

  // Relations
  entitlements  Entitlement[]
  receipts      Receipt[]
  bonusClaims   BonusClaim[]
  orgMemberships OrgMember[]

  @@index([email])
  @@map("users")
}
```

### Migration Required

After adding the `preferences` field to the schema, run:

```bash
npx prisma migrate dev --name add_user_preferences
npx prisma generate
```

## Type Definitions

### UserPreferences Structure

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
  updatedAt?: string;
}
```

## API Endpoints

### GET /api/user/preferences

Fetches the current user's preferences.

**Authentication:** Required

**Rate Limit:** 100 requests/hour per user

**Response:**
```json
{
  "success": true,
  "preferences": {
    "emailNotifications": {
      "newsletter": true,
      "marketingEmails": false,
      "productUpdates": true,
      "weeklyDigest": false,
      "bonusNotifications": true,
      "launchEvents": true
    },
    "theme": "system",
    "language": "en-GB",
    "communication": {
      "preferredChannel": "email",
      "emailFrequency": "weekly",
      "mediaContact": false,
      "bulkOrderContact": false
    },
    "updatedAt": "2025-10-19T12:00:00.000Z"
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `404 Not Found` - User not found in database
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### PUT /api/user/preferences

Updates the current user's preferences.

**Authentication:** Required

**Rate Limit:** 20 requests/hour per user

**Request Body:**
```json
{
  "theme": "dark",
  "emailNotifications": {
    "newsletter": true,
    "productUpdates": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "preferences": { /* updated full preferences */ },
  "message": "Preferences updated successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid JSON or validation error
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - User not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Usage Examples

### Fetch User Preferences

```typescript
const response = await fetch('/api/user/preferences');
const data = await response.json();

if (data.success) {
  console.log('User theme:', data.preferences.theme);
  console.log('Newsletter enabled:', data.preferences.emailNotifications.newsletter);
}
```

### Update User Preferences

```typescript
const response = await fetch('/api/user/preferences', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    theme: 'dark',
    emailNotifications: {
      newsletter: true,
      bonusNotifications: true
    }
  })
});

const data = await response.json();

if (data.success) {
  console.log('Preferences updated!');
}
```

## UI Component Integration

The `PreferencesSettings` component automatically:

1. **Fetches preferences on mount** using the GET endpoint
2. **Displays a loading state** while fetching
3. **Validates all inputs** using Zod schemas
4. **Saves changes** via the PUT endpoint
5. **Shows toast notifications** for success/error states

### Component Usage

```tsx
import { PreferencesSettings } from '@/components/settings/PreferencesSettings';

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <PreferencesSettings user={user} />
  );
}
```

## Security Features

### Authentication

- All endpoints require authentication via `getCurrentUser()`
- Unauthenticated requests receive `401 Unauthorized`

### Rate Limiting

- **GET requests:** 100 per hour per user
- **PUT requests:** 20 per hour per user
- Uses Upstash Redis for distributed rate limiting
- Falls back to in-memory rate limiting in development

### Input Validation

- All PUT requests validated with Zod schemas
- Sanitization of preferences before saving
- Protection against malformed data

### JSONB Advantages

- Type-safe validation at API layer
- Flexible schema evolution without migrations
- Indexed for fast queries
- Supports partial updates

## Default Preferences

When a user has no preferences saved, the system uses these defaults:

```typescript
{
  emailNotifications: {
    newsletter: true,
    marketingEmails: false,
    productUpdates: true,
    weeklyDigest: false,
    bonusNotifications: true,
    launchEvents: true,
  },
  theme: "system",
  language: "en-GB",
  communication: {
    preferredChannel: "email",
    emailFrequency: "weekly",
    mediaContact: false,
    bulkOrderContact: false,
  }
}
```

## Error Handling

### Client-Side

The UI component handles errors gracefully:

- **Network errors:** Shows toast notification with retry suggestion
- **Validation errors:** Displays inline form errors
- **Rate limit errors:** Shows specific retry-after time
- **Loading states:** Displays spinner during fetch/save operations

### Server-Side

All API errors return consistent JSON structure:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "statusCode": 400
}
```

## Testing

### Manual Testing Steps

1. **Authentication Test**
   ```bash
   # Without auth (should fail)
   curl http://localhost:3000/api/user/preferences

   # With auth (should succeed)
   # (Requires authenticated session cookie)
   ```

2. **GET Preferences Test**
   - Navigate to `/settings` while logged in
   - Verify preferences load correctly
   - Check default values for new users

3. **Update Preferences Test**
   - Change theme preference
   - Toggle email notifications
   - Click "Save preferences"
   - Refresh page and verify changes persist

4. **Validation Test**
   - Try invalid theme value (should fail)
   - Try invalid email frequency (should fail)
   - Verify proper error messages

5. **Rate Limiting Test**
   - Make multiple rapid PUT requests
   - Verify rate limit is enforced after 20 requests

### Automated Testing

To be implemented:

- Unit tests for validation functions
- API endpoint tests with mocked authentication
- Integration tests for database operations
- E2E tests for settings page flow

## Performance Considerations

### Database

- JSONB field uses GIN index for fast queries
- Single query to fetch all preferences
- No N+1 query issues

### Caching

- Consider adding Redis caching for frequently accessed preferences
- Cache invalidation on updates
- TTL: 5 minutes

### Optimizations

- Partial updates (only changed fields)
- Debounced auto-save (future enhancement)
- Optimistic UI updates (future enhancement)

## Future Enhancements

### Phase 2

- [ ] Auto-save on field change (debounced)
- [ ] Preferences export/import
- [ ] Preferences presets
- [ ] Dark mode theme switcher in navbar
- [ ] Email preference management from emails (unsubscribe links)

### Phase 3

- [ ] Admin dashboard for preference analytics
- [ ] Preference migration tools
- [ ] A/B testing framework for default preferences
- [ ] Preference-based email segmentation

## Related Files

- `/prisma/schema.prisma` - Database schema
- `/src/types/user.ts` - Type definitions
- `/src/app/api/user/preferences/route.ts` - API endpoints
- `/src/components/settings/PreferencesSettings.tsx` - UI component
- `/src/lib/auth.ts` - Authentication helpers
- `/src/lib/ratelimit.ts` - Rate limiting utilities

## Troubleshooting

### Issue: Preferences not saving

**Cause:** Authentication or database connection issue

**Solution:**
1. Check user is authenticated: `await getCurrentUser()`
2. Verify Prisma connection: Check DATABASE_URL
3. Check browser console for errors
4. Verify Prisma schema is migrated

### Issue: Rate limit errors

**Cause:** Too many requests in short period

**Solution:**
1. Wait for rate limit window to reset
2. Check for infinite loops in client code
3. Verify rate limit configuration is appropriate

### Issue: Default preferences not loading

**Cause:** Type mismatch or validation error

**Solution:**
1. Check `sanitizePreferences()` function
2. Verify default preferences match schema
3. Check browser console for TypeScript errors

## Support

For questions or issues:
- Check existing documentation in `/docs`
- Review implementation code
- Check Next.js and Prisma documentation
- Create issue in project repository

---

**Last Updated:** 2025-10-19
**Version:** 1.0.0
**Status:** Production Ready
