# Assets Directory

This directory contains downloadable assets for the AI-Born landing page.

## Required Files

### Book Excerpt PDF

**File**: `ai-born-excerpt.pdf`

**Current Status**: PLACEHOLDER - Replace with actual excerpt before launch

This should be a design-polished sample chapter from the book. The file should be:

- Accessible (proper PDF/A format)
- Under 5MB for easy download
- Professionally formatted
- Include copyright notice
- Include CTA to pre-order full book

**Current Placeholder Details:**
- Size: 857 bytes
- Content: Minimal PDF with title and placeholder text
- Created by: `/scripts/create-placeholder-pdf.js`
- Access: Token-protected via `/api/excerpt/download`

**To Replace**:
1. Generate final excerpt PDF from book manuscript
2. Replace this file: `/public/assets/ai-born-excerpt.pdf`
3. Recommended: Optimize PDF size (compress images, subset fonts)
4. Ensure file size < 5MB for optimal download experience
5. Test download via `/api/excerpt/download` endpoint

### Press Kit Assets

Additional assets that may be placed here:

- `press-kit.zip` - Complete press kit bundle
- `cover-high-res.png` - High-resolution book cover
- `author-headshot.jpg` - Professional headshot
- `synopsis.pdf` - One-page synopsis

## Access

All files in this directory are publicly accessible at:

```
https://[your-domain]/assets/[filename]
```

Example:
```
https://ai-born.org/assets/ai-born-excerpt.pdf
```

## Notes

- Keep file sizes reasonable for web delivery
- Use descriptive filenames
- Optimize images (WebP preferred)
- Ensure PDFs are accessible (PDF/A format)
