# Press Kit Assets

This directory contains all assets for the AI-Born press kit.

## Directory Structure

```
press-kit/
├── synopsis.pdf              # One-page book synopsis
├── press-release.pdf          # Official press release
├── chapter-list.pdf           # Complete chapter list
├── excerpts.pdf               # Selected book excerpts
├── interview-topics.pdf       # Suggested interview topics
├── cover-art/
│   ├── cover-high-res.png    # High-resolution book cover
│   ├── cover-3d-hardcover.png # 3D hardcover mockup
│   └── cover-3d-ebook.png    # 3D eBook mockup
├── headshots/
│   ├── mehran-granfar-1.jpg  # Author headshot - formal
│   ├── mehran-granfar-2.jpg  # Author headshot - casual
│   └── mehran-granfar-3.jpg  # Author headshot - speaking
└── logos/
    ├── ai-born-logo.svg      # AI-Born logo (SVG)
    ├── ai-born-logo.png      # AI-Born logo (PNG)
    ├── adaptic-logo.svg      # Adaptic.ai logo (SVG)
    └── adaptic-logo.png      # Adaptic.ai logo (PNG)
```

## Asset Requirements

### Documents (PDF format)
- **synopsis.pdf**: One-page overview of the book
- **press-release.pdf**: Official press release (embargo-capable)
- **chapter-list.pdf**: Full table of contents
- **excerpts.pdf**: Selected excerpts for preview
- **interview-topics.pdf**: Suggested topics for interviews

### Cover Art (PNG format, high resolution)
- **cover-high-res.png**: 300 DPI, minimum 2000px width
- **cover-3d-hardcover.png**: 3D mockup, transparent background
- **cover-3d-ebook.png**: Digital device mockup

### Headshots (JPG format, high resolution)
- **mehran-granfar-1.jpg**: Formal business portrait
- **mehran-granfar-2.jpg**: Casual professional shot
- **mehran-granfar-3.jpg**: Speaking/presenting pose

### Logos (SVG preferred, PNG as fallback)
- **ai-born-logo**: Book/project logo in vector format
- **adaptic-logo**: Company logo in vector format

## Asset Guidelines

### Image Specifications
- **Resolution**: Minimum 300 DPI for print
- **Format**: PNG for covers/mockups, JPG for photos, SVG for logos
- **Color space**: sRGB for web, CMYK for print
- **Background**: Transparent PNG for logos and mockups

### Document Specifications
- **Format**: PDF/A for archival quality
- **Fonts**: Embedded
- **Links**: Clickable where applicable
- **Size**: Optimised for web (<5MB per file)

## Usage

Assets in this directory are automatically included in the press kit ZIP when downloaded via:
- `/api/presskit/download` API endpoint
- Press kit download button on media/press pages

Missing assets are gracefully handled - the ZIP will include only available files.

## Contact

For additional materials or custom assets:
- Email: press@ai-born.org
- Website: https://ai-born.org/media
