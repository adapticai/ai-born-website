# Media Kit Authentication & Download Tracking

This document summarizes the implementation of authenticated user tracking for press kit downloads.

## Overview

The media kit page and press kit download functionality now:
1. Auto-fills forms for authenticated users
2. Tracks who downloads the press kit (both client-side and server-side)
3. Provides seamless UX for logged-in users

## Changes Made

### 1. Media Kit Page (`/src/app/media-kit/page.tsx`)

**Before:**
- Static server component with no user awareness
- Generic download button with no tracking

**After:**
- Fetches current user using `getCurrentUser()` from `@/lib/auth`
- Passes user data to `PressKitDownloadButton` for tracking
- Changed to async server component

```typescript
export default async function MediaKitPage() {
  const user = await getCurrentUser();

  return (
    // ...
    <PressKitDownloadButton
      userEmail={user?.email}
      userName={user?.name}
    />
  );
}
```

### 2. Press Kit Download Button (`/src/components/PressKitDownloadButton.tsx`)

**Enhanced with:**
- Optional `userEmail` and `userName` props
- Client-side tracking includes authentication status and user info
- Analytics events now include:
  - `authenticated: boolean`
  - `user_email?: string`
  - `user_name?: string`

```typescript
trackEvent({
  event: 'presskit_download',
  asset_type: 'full-kit',
  timestamp: new Date().toISOString(),
  user_email: userEmail || undefined,
  user_name: userName || undefined,
  authenticated: !!userEmail,
});
```

### 3. Press Kit Download API (`/src/app/api/presskit/download/route.ts`)

**Enhanced with:**
- Server-side user detection using `getCurrentUser()`
- Analytics logging includes user information
- Tracks both authenticated and anonymous downloads

```typescript
const user = await getCurrentUser();
const isAuthenticated = !!user;

console.log('[Analytics] Press kit download:', {
  event: 'presskit_download',
  // ... other fields
  authenticated: isAuthenticated,
  user_email: user?.email || undefined,
  user_name: user?.name || undefined,
});
```

### 4. Media Request Form (`/src/components/forms/MediaRequestForm.tsx`)

**Enhanced with:**
- Optional `userEmail` and `userName` props for auto-fill
- Default values set from user data when available
- Improves UX by pre-filling name and email fields

```typescript
const form = useForm<MediaRequestFormData>({
  resolver: zodResolver(mediaRequestSchema),
  defaultValues: {
    name: userName || '',
    email: userEmail || '',
    // ... other fields
  },
});
```

### 5. Media Page (`/src/app/media/page.tsx`)

**Enhanced with:**
- Async server component
- Fetches current user
- Passes user data to download button

### 6. Analytics Types (`/src/types/analytics.ts`)

**Updated `PresskitDownloadEvent` interface:**

```typescript
export interface PresskitDownloadEvent extends BaseAnalyticsEvent {
  event: 'presskit_download';
  asset_type: 'synopsis' | 'press-release' | 'covers' | 'headshots' | 'full-kit';
  // ... existing fields
  authenticated?: boolean;        // NEW
  user_email?: string;           // NEW
  user_name?: string;            // NEW
}
```

## Benefits

### For Users
1. **Seamless Experience**: Authenticated users don't need to re-enter their information
2. **Faster Workflow**: Pre-filled forms reduce friction
3. **Consistency**: Same user data across all interactions

### For Analytics
1. **Better Attribution**: Know which users (by email) download press kit
2. **Conversion Tracking**: Link press kit downloads to eventual conversions
3. **User Journey**: Track authenticated vs anonymous downloads
4. **Segmentation**: Analyze download patterns by user type

### For Marketing
1. **Lead Scoring**: Identify engaged press/media contacts
2. **Follow-up**: Know who has accessed press materials
3. **Personalization**: Tailor communications based on engagement
4. **ROI Tracking**: Measure press kit effectiveness by user segment

## Usage Examples

### Viewing Analytics Data

**Client-Side (GTM dataLayer):**
```javascript
window.dataLayer // Array of events including:
[
  {
    event: 'presskit_download',
    asset_type: 'full-kit',
    authenticated: true,
    user_email: 'journalist@nytimes.com',
    user_name: 'Jane Doe',
    timestamp: '2025-10-19T10:30:00.000Z'
  }
]
```

**Server-Side (Console Logs):**
```
[Analytics] Press kit download: {
  event: 'presskit_download',
  asset_type: 'full_kit',
  asset_count: 12,
  generation_time_ms: 342,
  timestamp: '2025-10-19T10:30:00.000Z',
  user_agent: 'Mozilla/5.0...',
  authenticated: true,
  user_email: 'journalist@nytimes.com',
  user_name: 'Jane Doe'
}
```

## Privacy Considerations

1. **User Consent**: Ensure cookie consent banner is shown before tracking
2. **Data Minimization**: Only track email/name when user is already authenticated
3. **Anonymization**: Server logs should be rotated/anonymized per privacy policy
4. **GDPR Compliance**: Users should have ability to request data deletion
5. **Opt-out**: Respect analytics opt-out preferences

## Testing

### Manual Testing
1. **Unauthenticated User**:
   - Visit `/media-kit`
   - Click "Download Complete Press Kit"
   - Verify download works
   - Check dataLayer: `authenticated: false`, no user_email/user_name

2. **Authenticated User**:
   - Sign in to the application
   - Visit `/media-kit`
   - Click download button
   - Check dataLayer: `authenticated: true`, includes user_email/user_name

3. **Media Request Form**:
   - Sign in
   - Visit media kit page (if form is there) or media request page
   - Verify name and email are pre-filled
   - Submit form successfully

### Automated Testing
```typescript
// Example test
test('tracks authenticated press kit downloads', async () => {
  const mockUser = { email: 'test@example.com', name: 'Test User' };

  // Mock getCurrentUser to return user
  jest.mock('@/lib/auth', () => ({
    getCurrentUser: jest.fn().mockResolvedValue(mockUser)
  }));

  // Render component
  render(<MediaKitPage />);

  // Click download
  await userEvent.click(screen.getByText(/Download Complete Press Kit/i));

  // Verify analytics event
  expect(window.dataLayer).toContainEqual(
    expect.objectContaining({
      event: 'presskit_download',
      authenticated: true,
      user_email: 'test@example.com',
      user_name: 'Test User'
    })
  );
});
```

## Future Enhancements

1. **Database Logging**: Store download events in database for long-term analysis
2. **Admin Dashboard**: View press kit downloads by user/date/segment
3. **Email Notifications**: Alert team when specific users download press kit
4. **Advanced Attribution**: Link downloads to eventual media coverage
5. **A/B Testing**: Test different press kit contents for different user segments

## Files Modified

- `/src/app/media-kit/page.tsx` - Added user fetching and prop passing
- `/src/app/media/page.tsx` - Added user fetching and prop passing
- `/src/components/PressKitDownloadButton.tsx` - Added user tracking props
- `/src/components/forms/MediaRequestForm.tsx` - Added auto-fill capability
- `/src/app/api/presskit/download/route.ts` - Added server-side user tracking
- `/src/types/analytics.ts` - Extended PresskitDownloadEvent interface

## Related Documentation

- `AUTH_IMPLEMENTATION_SUMMARY.md` - Authentication system overview
- `ANALYTICS.md` - Complete analytics implementation guide
- `PRESSKIT_SUMMARY.md` - Press kit system documentation
- `CLAUDE.md` - Project requirements (Section 9: Analytics & Tracking)
