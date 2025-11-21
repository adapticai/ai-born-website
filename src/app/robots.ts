import type { MetadataRoute } from 'next';

/**
 * Robots.txt configuration for AI-Born landing page
 *
 * Allows search engines to crawl all public pages while protecting
 * API routes and administrative areas from indexing.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 * @see CLAUDE.md SEO requirements
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/*',
          '/admin/*',
        ],
      },
    ],
    sitemap: 'https://ai-born.org/sitemap.xml',
  };
}
