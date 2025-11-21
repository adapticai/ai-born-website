import { type MetadataRoute } from "next";

import { getAllPosts } from "@/lib/blog";

const baseUrl = "https://ai-born.org";

/**
 * Generate sitemap for SEO
 * Includes all static pages and dynamic blog posts
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Get current date for lastModified
  const currentDate = new Date();

  // Static pages with their respective priorities and change frequencies
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/author`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/media-kit`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bulk-orders`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // Get all blog posts and generate URLs
  let blogPostPages: MetadataRoute.Sitemap = [];
  try {
    const posts = getAllPosts();
    blogPostPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    // If blog posts fail to load, continue with static pages only
    console.error("Error loading blog posts for sitemap:", error);
  }

  // Combine static pages and blog posts
  return [...staticPages, ...blogPostPages];
}
