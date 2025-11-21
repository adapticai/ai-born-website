# Press Kit Download System

Complete documentation for the AI-Born press kit download functionality.

## Overview

Production-ready press kit download system that generates ZIP files on-the-fly containing all press materials. Built with Next.js 14+ App Router, TypeScript, and Archiver.

## Features

- **On-the-fly ZIP generation**: No temp files, streams directly to client
- **Graceful degradation**: Includes only available assets, handles missing files
- **Analytics tracking**: GTM dataLayer integration for download events
- **Production-ready error handling**: Proper HTTP status codes and error messages
- **Performance optimized**: Streaming for memory efficiency
- **Type-safe**: Full TypeScript coverage
- **Accessible**: Keyboard navigation, ARIA labels, screen reader support

## Architecture

### Files Created

```
src/
├── app/
│   ├── api/
│   │   └── presskit/
│   │       └── download/
│   │           └── route.ts           # API endpoint for ZIP generation
│   └── media/
│       └── page.tsx                   # Press kit landing page
├── components/
│   └── PressKitDownloadButton.tsx     # Download button component
├── lib/
│   └── presskit.ts                    # Press kit utility functions
└── types/
    └── presskit.ts                    # TypeScript type definitions

public/
└── press-kit/
    ├── README.md                      # Asset documentation
    ├── synopsis.txt                   # Book synopsis
    ├── press-release.txt              # Press release
    ├── chapter-list.txt               # Chapter list
    ├── excerpts.txt                   # Selected excerpts
    ├── interview-topics.txt           # Interview topics
    ├── cover-art/
    │   ├── cover-high-res.png        # High-res cover
    │   ├── cover-3d-hardcover.png    # 3D hardcover mockup
    │   └── cover-3d-ebook.jpg        # 3D ebook mockup
    ├── headshots/
    │   └── README.txt                 # Headshot placeholders
    └── logos/
        ├── ai-born-logo.svg          # AI-Born logo
        └── adaptic-logo.svg          # Adaptic.ai logo
```

## API Endpoint

### GET `/api/presskit/download`

Generates and streams a ZIP file containing all available press kit assets.

**Request:**
```bash
curl -O https://ai-born.org/api/presskit/download
```

**Response:**
- **Success (200)**: ZIP file stream with assets
- **Not Found (404)**: No assets available
- **Server Error (500)**: ZIP generation failed

**Headers:**
```
Content-Type: application/zip
Content-Disposition: attachment; filename="AI-Born_Press-Kit_YYYY-MM-DD.zip"
Cache-Control: public, max-age=3600
X-Asset-Count: [number]
X-Generation-Time: [milliseconds]ms
```

**ZIP Contents:**
```
AI-Born_Press-Kit_YYYY-MM-DD.zip
├── README.txt                                    # Generated manifest
├── AI-Born_Synopsis.txt
├── AI-Born_Press-Release.txt
├── AI-Born_Chapter-List.txt
├── AI-Born_Selected-Excerpts.txt
├── AI-Born_Interview-Topics.txt
├── Cover-Art/
│   ├── AI-Born_Cover_High-Res.png
│   ├── AI-Born_3D-Hardcover.png
│   └── AI-Born_3D-eBook.jpg
└── Logos/
    ├── AI-Born_Logo.svg
    └── Adaptic_Logo.svg
```

## Components

### PressKitDownloadButton

Primary download button with loading states, error handling, and analytics.

**Usage:**
```tsx
import { PressKitDownloadButton } from '@/components/PressKitDownloadButton';

export default function MediaPage() {
  return (
    <div>
      <PressKitDownloadButton
        variant="default"
        size="lg"
        label="Download press kit"
        showIcon={true}
        fullWidth={false}
      />
    </div>
  );
}
```

**Props:**
- `variant`: Button style (default, outline, ghost, link, destructive, secondary)
- `size`: Button size (default, sm, lg, icon)
- `label`: Custom button text (default: "Download press kit")
- `className`: Additional CSS classes
- `showIcon`: Display icon (default: true)
- `fullWidth`: Full width button (default: false)

**States:**
- **Idle**: Ready to download
- **Loading**: Generating press kit (spinner)
- **Success**: Download started (checkmark)
- **Error**: Download failed (error icon + message)

### PressKitDownloadLink

Compact link-style variant for inline use.

**Usage:**
```tsx
import { PressKitDownloadLink } from '@/components/PressKitDownloadButton';

<PressKitDownloadLink label="Download full press kit" />
```

## Analytics

### Events Tracked

**Download Initiation:**
```javascript
{
  event: 'presskit_download',
  asset_type: 'full_kit',
  asset_count: 10,
  generation_time_ms: 234,
  timestamp: '2025-10-18T12:00:00.000Z',
  user_agent: 'Mozilla/5.0...'
}
```

**Download Error:**
```javascript
{
  event: 'presskit_download_error',
  error_message: 'Failed to download press kit',
  timestamp: '2025-10-18T12:00:00.000Z'
}
```

### Server-Side Logging

```javascript
console.log('[Press Kit] Generated ZIP with 10 assets in 234ms');
console.log('[Analytics] Press kit download:', { ... });
```

## Asset Management

### Adding New Assets

1. Add files to `/public/press-kit/` directory
2. Update `getPressKitManifest()` in `/src/lib/presskit.ts`:

```typescript
export function getPressKitManifest(): PressKitManifest {
  return {
    documents: [
      {
        path: 'press-kit/new-document.pdf',
        filename: 'AI-Born_New-Document.pdf',
        description: 'Description of new document',
      },
      // ... other documents
    ],
    // ... images, logos
  };
}
```

3. Missing files are automatically excluded from ZIP

### Asset Specifications

**Documents (PDF or TXT):**
- Synopsis: One-page overview
- Press release: Official announcement
- Chapter list: Full table of contents
- Excerpts: Selected passages
- Interview topics: Suggested questions

**Images (PNG/JPG, 300 DPI minimum):**
- Cover art: High-res book cover
- 3D mockups: Hardcover and ebook
- Headshots: Multiple poses (when available)

**Logos (SVG preferred, PNG fallback):**
- AI-Born logo
- Adaptic.ai logo

## Error Handling

### Missing Assets

```typescript
// System automatically filters out missing files
const manifest = getAvailableAssets(fullManifest, publicDir);

// Logs warning if assets missing
console.warn('[Press Kit] 3 asset(s) not found. Including 7 available assets.');
```

### ZIP Generation Errors

```typescript
archive.on('error', (err) => {
  console.error('[Press Kit] Archive error:', err);
  // Returns 500 error response
});
```

### Client-Side Errors

```typescript
try {
  const response = await fetch('/api/presskit/download');
  if (!response.ok) {
    throw new Error('Failed to download press kit');
  }
  // Trigger download
} catch (error) {
  setDownloadState('error');
  trackEvent({ event: 'presskit_download_error', ... });
}
```

## Performance

### Streaming

- No temp files created
- Direct stream to response
- Memory efficient for large files
- Handles concurrent downloads

### Compression

```typescript
const archive = archiver('zip', {
  zlib: { level: 6 }, // Balanced compression
});
```

### Caching

```typescript
headers: {
  'Cache-Control': 'public, max-age=3600', // 1 hour cache
}
```

## Security

### Rate Limiting

Implement per-IP rate limiting:

```typescript
// Example with next-rate-limit
import rateLimit from 'next-rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function GET(request: NextRequest) {
  await limiter.check(request, 10, 'CACHE_TOKEN'); // 10 requests per minute
  // ... rest of handler
}
```

### File Access

- Only serves files from `/public/press-kit/` directory
- Path traversal prevented by path.join()
- No user input in file paths

## Testing

### Manual Testing

1. Start dev server: `npm run dev`
2. Visit: `http://localhost:3000/media`
3. Click "Download press kit" button
4. Verify ZIP downloads with expected files
5. Check browser DevTools for analytics events

### Test Cases

**Happy Path:**
- ✓ All assets present
- ✓ ZIP generates successfully
- ✓ README.txt included
- ✓ Correct filename format
- ✓ Analytics event fires

**Error Cases:**
- ✓ No assets available (404 error)
- ✓ Archive generation fails (500 error)
- ✓ Missing assets gracefully excluded
- ✓ Client displays error state

### Verify Analytics

```javascript
// Check dataLayer in browser console
console.log(window.dataLayer);

// Should show:
[
  {
    event: 'presskit_download',
    asset_type: 'full_kit',
    asset_count: 10,
    // ...
  }
]
```

## Deployment

### Environment Variables

No environment variables required for basic functionality.

Optional for rate limiting:
```env
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=10
```

### Build

```bash
npm run build
```

Verify:
- No TypeScript errors
- API route compiled successfully
- All imports resolved

### Production Checklist

- [ ] All press kit assets uploaded to `/public/press-kit/`
- [ ] High-resolution images (300 DPI)
- [ ] PDF documents optimized (<5MB each)
- [ ] SVG logos included
- [ ] README files updated
- [ ] Analytics events firing
- [ ] Error handling tested
- [ ] Download button on media page
- [ ] SEO metadata complete
- [ ] Cache headers configured

## Monitoring

### Server Logs

```bash
# Success
[Press Kit] Generated ZIP with 10 assets in 234ms

# Warning
[Press Kit] 2 asset(s) not found. Including 8 available assets.

# Error
[Press Kit] Archive error: ENOENT: no such file or directory
```

### Analytics Dashboard

Monitor these metrics:
- Press kit download count
- Average generation time
- Error rate
- Asset count per download
- User agent distribution

## Troubleshooting

### "No assets available" error

**Cause**: No files found in `/public/press-kit/`

**Solution**:
1. Verify files exist in `/public/press-kit/` directory
2. Check file paths in `getPressKitManifest()`
3. Ensure public directory is accessible

### ZIP generation fails

**Cause**: Archiver error during streaming

**Solution**:
1. Check server logs for specific error
2. Verify file permissions
3. Ensure sufficient memory for ZIP generation
4. Check disk space

### Download doesn't start in browser

**Cause**: Client-side JavaScript error

**Solution**:
1. Check browser console for errors
2. Verify `Content-Disposition` header present
3. Test in different browser
4. Check CORS if on different domain

## Future Enhancements

### Planned Features

- [ ] Individual asset downloads (not just full ZIP)
- [ ] Press kit versioning (track changes over time)
- [ ] Custom press kit builder (select specific assets)
- [ ] Email delivery option (send press kit via email)
- [ ] Usage analytics (which assets accessed most)
- [ ] Embargoed content (password-protected sections)
- [ ] Multi-language support
- [ ] PDF generation from markdown (dynamic press releases)

### API Extensions

**Individual asset download:**
```
GET /api/presskit/download/[asset-id]
```

**Custom press kit:**
```
POST /api/presskit/download
Body: { assets: ['synopsis', 'cover-art', 'logos'] }
```

**Email delivery:**
```
POST /api/presskit/send
Body: { email: 'journalist@outlet.com', assets: [...] }
```

## Support

### Contact

- **Press enquiries**: press@ai-born.org
- **Technical issues**: See GitHub repository issues
- **Asset requests**: press@ai-born.org

### Resources

- CLAUDE.md: Full project specification
- /public/press-kit/README.md: Asset guidelines
- /src/types/analytics.ts: Analytics event types

---

**Last updated**: 18 October 2025
**Version**: 1.0
**Maintainer**: AI-Born Development Team
