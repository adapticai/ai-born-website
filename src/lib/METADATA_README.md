# Metadata System Documentation

## Overview

The AI-Born website uses a centralised metadata management system to ensure consistent, SEO-optimised metadata across all pages. This system is built around the `/src/lib/metadata.ts` helper library.

## Architecture

### Core Files

- **`/src/lib/metadata.ts`** - Central metadata helper library
- **`/src/app/layout.tsx`** - Root layout with default metadata
- **Page-specific metadata** - Each page.tsx file imports and uses metadata helpers

### Site Configuration

All site-wide constants are defined in `/src/lib/metadata.ts`:

```typescript
export const siteConfig = {
  name: "AI-Born",
  title: "AI-Born: The Machine Core, the Human Cortex, and the Next Economy of Being",
  description: "...",
  url: "https://ai-born.org",
  author: { ... },
  publisher: { ... },
  social: { ... },
}
```

## Usage

### 1. Using Pre-configured Page Metadata

For common pages, use the pre-configured metadata from `pageMetadata`:

```typescript
// /src/app/author/page.tsx
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata.author;
```

Available pre-configured pages:
- `pageMetadata.home`
- `pageMetadata.author`
- `pageMetadata.mediaKit`
- `pageMetadata.bulkOrders`
- `pageMetadata.faq`
- `pageMetadata.redeem`
- `pageMetadata.blog`
- `pageMetadata.privacy`
- `pageMetadata.terms`

### 2. Generating Custom Page Metadata

For custom pages, use the `generatePageMetadata()` helper:

```typescript
import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata({
  title: "Custom Page Title",
  description: "Page description (≤160 characters)",
  path: "/custom-page",
  type: "website", // or "article", "book", "profile"
  image: "https://ai-born.org/custom-og-image.jpg", // optional
  twitterCard: "summary_large_image", // or "summary"
  keywords: ["keyword1", "keyword2"], // optional
  noIndex: false, // set to true to prevent indexing
});
```

### 3. Blog Post Metadata

For blog posts, use the `generateBlogPostMetadata()` helper:

```typescript
import { generateBlogPostMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);

  return generateBlogPostMetadata({
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    date: post.date,
    author: post.author,
    tags: post.tags,
  });
}
```

## Structured Data (JSON-LD)

### Book Schema

The root layout (`/src/app/layout.tsx`) includes JSON-LD structured data for the book:

```typescript
import { generateBookStructuredData } from '@/lib/metadata';

// In <head>:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(generateBookStructuredData())
  }}
/>
```

### Author Schema

The author page includes Person schema:

```typescript
import { generateAuthorStructuredData } from '@/lib/metadata';

// In component:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(generateAuthorStructuredData())
  }}
/>
```

### Blog Post Schema

Each blog post includes BlogPosting schema:

```typescript
import { generateBlogPostStructuredData } from '@/lib/metadata';

// In component:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(
      generateBlogPostStructuredData({
        title: post.title,
        excerpt: post.excerpt,
        slug: post.slug,
        date: post.date,
        author: post.author,
        tags: post.tags,
      })
    )
  }}
/>
```

## Open Graph Images

### Default Images

Default OG and Twitter images are defined in `metadata.ts`:

```typescript
export const defaultImages = {
  og: "https://ai-born.org/og-image.jpg",
  twitter: "https://ai-born.org/twitter-card.jpg",
}
```

### Image Specifications

**Open Graph Image** (`og-image.jpg`):
- Dimensions: 1200×630px
- Format: JPG or PNG
- Max size: 8MB (recommended <1MB)
- Location: `/public/og-image.jpg`

**Twitter Card Image** (`twitter-card.jpg`):
- Dimensions: 1200×630px
- Format: JPG or PNG
- Max size: 5MB (recommended <1MB)
- Location: `/public/twitter-card.jpg`

**Blog OG Image** (`og-blog.jpg`):
- Dimensions: 1200×630px
- Used for blog listing page
- Location: `/public/og-blog.jpg`

### Custom Page Images

To use a custom OG image for a specific page:

```typescript
export const metadata = generatePageMetadata({
  title: "Page Title",
  description: "Description",
  path: "/page",
  image: "https://ai-born.org/custom-page-og.jpg", // Custom image
});
```

## Metadata Checklist

When creating a new page, ensure you include:

- [ ] **Title** - Unique, descriptive, ≤60 characters
- [ ] **Description** - Compelling, ≤160 characters
- [ ] **Canonical URL** - Absolute URL to the page
- [ ] **Open Graph** - title, description, type, url, image
- [ ] **Twitter Card** - card type, title, description, image
- [ ] **Robots** - index/noindex, follow/nofollow
- [ ] **Keywords** - Relevant keywords (optional)
- [ ] **Structured Data** - JSON-LD for rich results (where applicable)

## SEO Best Practices

### Title Tags

- Keep under 60 characters
- Include primary keyword
- Make unique per page
- Format: `Page Title | AI-Born` (automatically templated)

### Meta Descriptions

- Keep under 160 characters
- Include call-to-action
- Make compelling and accurate
- Include primary and secondary keywords naturally

### Open Graph

- Always include og:title, og:description, og:image, og:url
- Use `type: "book"` for homepage
- Use `type: "article"` for blog posts
- Use `type: "profile"` for author page
- Use `type: "website"` for other pages

### Twitter Cards

- Use `summary_large_image` for pages with hero images
- Use `summary` for text-heavy pages
- Always include creator (`@mehrangranfar`)

### Canonical URLs

- Always set canonical URL to prevent duplicate content
- Use absolute URLs (e.g., `https://ai-born.org/about`)
- Ensure consistency across HTTP/HTTPS

### Structured Data

- Include Book schema on homepage
- Include Person schema on author page
- Include BlogPosting schema on blog posts
- Validate with [Google Rich Results Test](https://search.google.com/test/rich-results)

## Testing & Validation

### Tools

1. **Twitter Card Validator**
   - URL: https://cards-dev.twitter.com/validator
   - Verify: Card type, title, description, image

2. **Facebook Sharing Debugger**
   - URL: https://developers.facebook.com/tools/debug/
   - Verify: OG tags, image rendering, scraping

3. **LinkedIn Post Inspector**
   - URL: https://www.linkedin.com/post-inspector/
   - Verify: Title, description, image

4. **Google Rich Results Test**
   - URL: https://search.google.com/test/rich-results
   - Verify: Structured data validation

5. **Lighthouse SEO Audit**
   - Run: `npm run build && npm run start`
   - Chrome DevTools > Lighthouse > SEO
   - Target score: ≥95

### Manual Testing

```bash
# Build and start production server
npm run build
npm run start

# View page source
# Check for:
# - <title> tag
# - <meta name="description">
# - <meta property="og:*">
# - <meta name="twitter:*">
# - <link rel="canonical">
# - <script type="application/ld+json">
```

## Troubleshooting

### OG Image Not Showing

1. Verify image exists at `/public/og-image.jpg`
2. Check image dimensions (1200×630px)
3. Clear cache on social platforms
4. Use absolute URL (https://ai-born.org/og-image.jpg)

### Duplicate Titles

1. Check that page-specific metadata exports correct title
2. Verify root layout template is correct
3. Ensure no hardcoded titles in page components

### Missing Canonical URL

1. Import `pageMetadata` or use `generatePageMetadata()`
2. Ensure `path` parameter is set correctly
3. Check that `metadataBase` is set in root layout

### Structured Data Errors

1. Validate JSON-LD with Rich Results Test
2. Check for missing required fields
3. Ensure correct schema type for content
4. Verify date formats (ISO 8601)

## Migration Guide

### Converting Existing Page

**Before:**
```typescript
export const metadata: Metadata = {
  title: "Page Title",
  description: "Description",
  alternates: {
    canonical: "https://ai-born.org/page",
  },
  // ... manual configuration
};
```

**After:**
```typescript
import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata({
  title: "Page Title",
  description: "Description",
  path: "/page",
});
```

## Maintenance

### Updating Site-Wide Metadata

To update site-wide defaults (e.g., changing site name, author info):

1. Edit `/src/lib/metadata.ts`
2. Update `siteConfig` object
3. Changes automatically propagate to all pages

### Adding New Page Templates

To add a new pre-configured page:

1. Add entry to `pageMetadata` object in `/src/lib/metadata.ts`
2. Use `generatePageMetadata()` helper
3. Export from `pageMetadata`

```typescript
export const pageMetadata = {
  // ... existing pages
  newPage: generatePageMetadata({
    title: "New Page",
    description: "Description",
    path: "/new-page",
  }),
};
```

## Performance Considerations

- Metadata is statically generated at build time
- No runtime overhead
- OG images should be optimised (WebP + JPG fallback)
- Keep structured data minimal and relevant

## Accessibility

- Ensure titles are descriptive and meaningful
- Meta descriptions should accurately summarise content
- Don't rely on metadata alone for accessibility
- Complement with proper semantic HTML and ARIA attributes

## Additional Resources

- [Next.js Metadata Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org Book](https://schema.org/Book)
- [Schema.org BlogPosting](https://schema.org/BlogPosting)
- [Google Search Central](https://developers.google.com/search/docs)
