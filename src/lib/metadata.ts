import type { Metadata } from "next";

/**
 * Site Configuration
 * Single source of truth for site-wide metadata
 */
export const siteConfig = {
  name: "AI-Born",
  title: "AI-Born: The Machine Core, the Human Cortex, and the Next Economy of Being",
  description:
    "The definitive blueprint for AI-native organisations and manifesto for the human transition ahead. Part field manual, part historical reckoning, part moral call to arms.",
  url: "https://ai-born.org",
  author: {
    name: "Mehran Granfar",
    jobTitle: "Founder & CEO",
    affiliation: "Adaptic.ai",
  },
  publisher: {
    name: "Mic Press, LLC.",
    url: "https://micpress.com",
  },
  social: {
    twitter: "@mehrangranfar",
    linkedin: "mehrangranfar",
  },
} as const;

/**
 * Default OG and Twitter images
 */
export const defaultImages = {
  og: `${siteConfig.url}/og-image.jpg`,
  twitter: `${siteConfig.url}/twitter-card.jpg`,
} as const;

/**
 * Page Metadata Configuration
 */
interface PageMetadataConfig {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | "book" | "profile";
  image?: string;
  twitterCard?: "summary" | "summary_large_image";
  keywords?: string[];
  noIndex?: boolean;
  publishedTime?: string;
  authors?: string[];
}

/**
 * Generate complete metadata for a page
 *
 * @param config - Page metadata configuration
 * @returns Complete Next.js metadata object
 *
 * @example
 * ```ts
 * export const metadata = generatePageMetadata({
 *   title: "About the Author",
 *   description: "Meet Mehran Granfar...",
 *   path: "/author",
 *   type: "profile",
 * });
 * ```
 */
export function generatePageMetadata(config: PageMetadataConfig): Metadata {
  const {
    title,
    description,
    path,
    type = "website",
    image,
    twitterCard = "summary",
    keywords = [],
    noIndex = false,
    publishedTime,
    authors,
  } = config;

  const canonicalUrl = `${siteConfig.url}${path}`;
  const ogImage = image || defaultImages.og;
  const twitterImage = image || defaultImages.twitter;

  // Format title with site name (unless it's the homepage)
  const fullTitle = path === "/" ? title : `${title} | ${siteConfig.name}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title: fullTitle,
      description,
      type,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      ...(publishedTime && { publishedTime }),
      ...(authors && { authors }),
    },
    twitter: {
      card: twitterCard,
      title: fullTitle,
      description,
      images: [twitterImage],
      creator: siteConfig.social.twitter,
    },
  };
}

/**
 * Generate metadata for blog posts
 *
 * @param post - Blog post data
 * @returns Complete metadata for blog post
 */
interface BlogPostMetadata {
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  author: {
    name: string;
  };
  image?: string;
  tags?: string[];
}

export function generateBlogPostMetadata(post: BlogPostMetadata): Metadata {
  const canonicalUrl = `${siteConfig.url}/blog/${post.slug}`;
  const ogImage = post.image || `${siteConfig.url}/og-blog.jpg`;

  // Generate keywords from tags
  const keywords = post.tags || [];

  return {
    title: post.title,
    description: post.excerpt,
    keywords: [
      ...keywords,
      "AI-native organisations",
      "enterprise AI",
      "AI transformation",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: canonicalUrl,
      siteName: siteConfig.name,
      publishedTime: post.date,
      authors: [post.author.name],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
      creator: siteConfig.social.twitter,
    },
  };
}

/**
 * Generate JSON-LD structured data for the book
 */
export function generateBookStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: siteConfig.title,
    author: {
      "@type": "Person",
      name: siteConfig.author.name,
      jobTitle: siteConfig.author.jobTitle,
      affiliation: {
        "@type": "Organization",
        name: siteConfig.author.affiliation,
      },
    },
    workExample: [
      {
        "@type": "Book",
        bookFormat: "https://schema.org/Hardcover",
      },
      {
        "@type": "Book",
        bookFormat: "https://schema.org/EBook",
      },
    ],
    publisher: {
      "@type": "Organization",
      name: siteConfig.publisher.name,
      url: siteConfig.publisher.url,
      legalName: siteConfig.publisher.name,
    },
    inLanguage: "en",
    genre: ["Business", "Technology", "Economics"],
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/PreOrder",
      priceCurrency: "USD",
    },
  };
}

/**
 * Generate JSON-LD structured data for the author
 */
export function generateAuthorStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.author.name,
    jobTitle: siteConfig.author.jobTitle,
    worksFor: {
      "@type": "Organization",
      name: siteConfig.author.affiliation,
    },
    url: `${siteConfig.url}/author`,
    sameAs: [
      `https://twitter.com/${siteConfig.social.twitter.replace("@", "")}`,
      `https://linkedin.com/in/${siteConfig.social.linkedin}`,
    ],
  };
}

/**
 * Generate JSON-LD structured data for a blog post
 */
export function generateBlogPostStructuredData(post: BlogPostMetadata) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.publisher.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${post.slug}`,
    },
    ...(post.image && {
      image: {
        "@type": "ImageObject",
        url: post.image,
      },
    }),
    ...(post.tags && {
      keywords: post.tags.join(", "),
    }),
  };
}

/**
 * Default metadata for pages without specific configuration
 */
export const defaultMetadata: Metadata = {
  title: {
    default: `${siteConfig.name} — The Blueprint for AI-Native Organisations | ${siteConfig.author.name}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "AI-native organisations",
    "AI architecture",
    "autonomous agents",
    "AI governance",
    "enterprise AI",
    siteConfig.author.name,
    `${siteConfig.name} book`,
    "business AI",
    "AI transformation",
    "AI strategy",
  ],
  authors: [{ name: siteConfig.author.name }],
  creator: siteConfig.author.name,
  publisher: siteConfig.publisher.name,
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: `${siteConfig.name} | ${siteConfig.author.name}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: defaultImages.og,
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
    locale: "en_US",
    type: "book",
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.author.name}`,
    description: siteConfig.description,
    images: [defaultImages.twitter],
    creator: siteConfig.social.twitter,
  },
};

/**
 * Pre-configured metadata for common pages
 */
export const pageMetadata = {
  home: generatePageMetadata({
    title: `${siteConfig.name} — The Blueprint for AI-Native Organisations | ${siteConfig.author.name}`,
    description: siteConfig.description,
    path: "/",
    type: "book",
    twitterCard: "summary_large_image",
    keywords: [
      "AI-native organisations",
      "AI architecture",
      "autonomous agents",
      "AI governance",
      "enterprise AI",
      siteConfig.author.name,
      "business transformation",
    ],
  }),

  author: generatePageMetadata({
    title: "About the Author",
    description: `Meet ${siteConfig.author.name}, author of ${siteConfig.name} and ${siteConfig.author.jobTitle} of ${siteConfig.author.affiliation}. A systems architect and strategic futurist working at the frontier of AI, governance, and economic design.`,
    path: "/author",
    type: "profile",
  }),

  mediaKit: generatePageMetadata({
    title: "Media Kit",
    description: `Press materials, author bio, book assets, and media contact information for ${siteConfig.name} by ${siteConfig.author.name}.`,
    path: "/media-kit",
  }),

  bulkOrders: generatePageMetadata({
    title: "Bulk Orders",
    description: `Corporate and bulk orders for ${siteConfig.name} by ${siteConfig.author.name}. NYT-friendly distributed ordering guidance for organisations.`,
    path: "/bulk-orders",
  }),

  faq: generatePageMetadata({
    title: "FAQ",
    description: `Frequently asked questions about ${siteConfig.name} by ${siteConfig.author.name}. Find answers about formats, retailers, pre-orders, and bonus content.`,
    path: "/faq",
  }),

  redeem: generatePageMetadata({
    title: "Redeem VIP Code",
    description: `Redeem your VIP code to unlock exclusive benefits, early access, and bonus content for ${siteConfig.name}. Access the Agent Charter Pack and priority updates.`,
    path: "/redeem",
  }),

  blog: generatePageMetadata({
    title: "Thought Pieces",
    description:
      "Exploring AI-native organisations, the future of work, and the architecture of intelligence. Essays on building institutions for the age of autonomous agents.",
    path: "/blog",
  }),

  privacy: generatePageMetadata({
    title: "Privacy Policy",
    description: `Privacy policy for ${siteConfig.url}. Learn how we collect, use, and protect your personal information.`,
    path: "/privacy",
    noIndex: true,
  }),

  terms: generatePageMetadata({
    title: "Terms of Service",
    description: `Terms of service for ${siteConfig.url}. Read our terms and conditions for using this website.`,
    path: "/terms",
    noIndex: true,
  }),

  contact: generatePageMetadata({
    title: "Contact",
    description: `Get in touch with ${siteConfig.publisher.name}. Media enquiries, speaking requests, bulk orders, and general questions about ${siteConfig.name}.`,
    path: "/contact",
  }),

  media: generatePageMetadata({
    title: "Media & Press",
    description: `Media resources and press coverage for ${siteConfig.name} by ${siteConfig.author.name}. Download press materials and view featured coverage.`,
    path: "/media",
  }),

  // Auth pages (noindex)
  authSignIn: generatePageMetadata({
    title: "Sign In",
    description: "Sign in to your account.",
    path: "/auth/signin",
    noIndex: true,
  }),

  authSignOut: generatePageMetadata({
    title: "Sign Out",
    description: "Sign out of your account.",
    path: "/auth/signout",
    noIndex: true,
  }),

  authError: generatePageMetadata({
    title: "Authentication Error",
    description: "An error occurred during authentication.",
    path: "/auth/error",
    noIndex: true,
  }),

  authVerifyRequest: generatePageMetadata({
    title: "Verify Email",
    description: "Check your email to complete sign in.",
    path: "/auth/verify-request",
    noIndex: true,
  }),

  // Admin pages (noindex)
  adminCodes: generatePageMetadata({
    title: "VIP Codes Admin",
    description: "Manage VIP codes and redemptions.",
    path: "/admin/codes",
    noIndex: true,
  }),

  adminExperiments: generatePageMetadata({
    title: "Experiments Admin",
    description: "Manage A/B tests and experiments.",
    path: "/admin/experiments",
    noIndex: true,
  }),
} as const;
