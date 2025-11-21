# Blog Components - Usage Guide

Each blog post can include custom components for enhanced visual storytelling. This guide covers hero sections and pull quotes.

---

## Pull Quotes

Styled blockquote components that can be used anywhere within your blog post content to highlight key insights, testimonials, or important statements.

### Variants

#### 1. Default (`variant` omitted)
Clean, side-bordered quote with colored bar:

```mdx
<PullQuote author="Mehran Granfar" role="Founder & CEO" company="Adaptic.ai">
Your compelling quote goes here. Keep it concise and impactful.
</PullQuote>
```

**Best for:** In-flow quotes that complement the narrative without disrupting reading rhythm

#### 2. Large (`variant="large"`)
Prominent testimonial-style quote with large text:

```mdx
<PullQuote variant="large" author="John Doe" company="Nvidia" logo="/logos/nvidia.svg">
This is a compelling quote that highlights a key insight from the article.
</PullQuote>
```

**Best for:** Major testimonials, partner endorsements, or pivotal statements
**Features:** Large text (3xl on desktop), company logo support

#### 3. Centered (`variant="centered"`)
Centered quote with quotation marks, ideal for statements of intent:

```mdx
<PullQuote variant="centered" author="Mehran Granfar" role="Author" company="AI-Born">
AI-native organisations require architectural thinking across distinct, interdependent layers.
</PullQuote>
```

**Best for:** Mission statements, core thesis, or dramatic emphasis

### Props

- `children` (required): The quote text
- `variant`: `"default"` | `"large"` | `"centered"` (default: `"default"`)
- `author`: Author name (optional but recommended)
- `role`: Author's title/role (optional)
- `company`: Company/organisation name (optional)
- `logo`: Path to company logo SVG (optional, works best with `variant="large"`)

### Examples in Sample Posts

- **Default variant:** `/blog/the-death-of-the-job-title` (near end)
- **Large variant:** `/blog/three-people-thirty-thousand-outcomes` (mid-article)
- **Centered variant:** `/blog/the-five-planes` (near end)

### Styling Notes

- All variants use your brand fonts (Outfit for author, Inter for body)
- Full dark mode support
- `not-prose` class ensures typography plugin doesn't interfere
- Consistent vertical spacing (my-12 to my-24 depending on variant)

---

## Hero Sections

Each blog post can include an optional hero section at the top that appears before the main article content. There are three variants available, each suited to different content types.

## Hero Variants

### 1. Split Layout (`variant: "split"`)

**Best for:** Posts with strong visual elements and testimonials/quotes

Two-column layout with:
- Left: Featured image with gradient border
- Right: Description paragraphs + optional quote with attribution

**Example:**
```yaml
---
title: "Your Post Title"
excerpt: "Your excerpt..."
# ... other frontmatter
hero:
  variant: "split"
  title: "Hero headline that draws readers in"
  description:
    - "First paragraph of context"
    - "Second paragraph expanding on the theme"
  image:
    src: "/images/blog/your-image.jpg"
    alt: "Descriptive alt text"
    width: 1207
    height: 929
  quote:
    text: "A compelling pull quote that reinforces the main theme"
    author: "Quote Author Name"
    role: "Their Title/Role"
    logo: "/path/to/company-logo.svg" # optional
---
```

**See example:** `the-death-of-the-job-title.mdx`

---

### 2. Full-Width Layout (`variant: "full-width"`)

**Best for:** Visually-driven posts that benefit from large imagery

Full-width featured image followed by:
- Two-column text (title + description)
- Optional CTA button

**Example:**
```yaml
---
title: "Your Post Title"
excerpt: "Your excerpt..."
# ... other frontmatter
hero:
  variant: "full-width"
  title: "Compelling headline for the hero section"
  description: "A concise description that complements the visual"
  image:
    src: "https://images.unsplash.com/photo-123456789"
    alt: "Descriptive alt text"
  cta:
    text: "Call to Action"
    href: "/" # can be internal or external link
---
```

**See example:** `three-people-thirty-thousand-outcomes.mdx`

---

### 3. Centered Features Layout (`variant: "centered-features"`)

**Best for:** Framework/concept posts that need to highlight key principles

Centered header + full-width image + feature grid with:
- Icons and titles
- Short descriptions
- 2 columns on mobile, 4 on desktop

**Example:**
```yaml
---
title: "Your Post Title"
excerpt: "Your excerpt..."
# ... other frontmatter
hero:
  variant: "centered-features"
  title: "A centered, impactful headline"
  description: "Supporting description beneath the title"
  image:
    src: "https://images.unsplash.com/photo-123456789"
    alt: "Descriptive alt text"
  features:
    - icon: "layers"
      title: "Feature Name"
      description: "Brief explanation of this feature or principle"
    - icon: "zap"
      title: "Another Feature"
      description: "What makes this important"
    - icon: "shield"
      title: "Third Feature"
      description: "Why readers should care"
    - icon: "sparkles"
      title: "Fourth Feature"
      description: "The impact or outcome"
---
```

**Available icons:** `brain`, `layers`, `users`, `shield`, `zap`, `sparkles`

**See example:** `the-five-planes.mdx`

---

## No Hero Section

To create a blog post without a hero section, simply omit the `hero` field from your frontmatter. The post will display with just the standard article header (title, excerpt, date, author, tags).

---

## Tips

### Image Selection
- **Split layout:** Use images with clear subjects that work well in a portrait-ish crop (aspect ratio ~4:3)
- **Full-width & Centered:** Use landscape images (16:9 or wider)
- All hero images are rendered with grayscale filter for visual consistency

### Image Sources
- Use Unsplash for placeholder images: `https://images.unsplash.com/photo-[ID]?q=80&w=2940&auto=format&fit=crop`
- Store custom images in `/public/images/blog/`
- Reference as `/images/blog/your-image.jpg` in frontmatter

### Description Text
- **Split layout:** Use 2-3 short paragraphs (array format)
- **Full-width:** Single paragraph that fits in ~2-3 lines
- **Centered features:** Single paragraph, concise summary

### Quotes (Split layout only)
- Keep quotes under 2-3 sentences
- Author role is optional but recommended
- Company logo is optional (should be SVG with `dark:invert` class for dark mode)

### Features (Centered layout only)
- Aim for 4 features (works best in grid)
- Keep titles to 2-3 words
- Descriptions should be 10-15 words max

---

## Brand Consistency

All hero variants use:
- **Outfit** font for headings (your brand font)
- **Inter** font for body text
- Slate color palette with full dark mode support
- 2xl rounded corners on images
- Consistent spacing and padding

---

## Example Posts

1. **Split variant:** `/blog/the-death-of-the-job-title` - Good for narrative posts with strong quotes
2. **Full-width variant:** `/blog/three-people-thirty-thousand-outcomes` - Good for big-picture pieces
3. **Centered features variant:** `/blog/the-five-planes` - Good for frameworks and structured concepts
