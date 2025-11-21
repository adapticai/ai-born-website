import fs from "fs";
import matter from "gray-matter";
import path from "path";
import readingTime from "reading-time";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: {
    name: string;
    role?: string;
  };
  tags?: string[];
  coverImage?: string;
  readingTime: string;
  content: string;
  hero?: {
    variant: "split" | "full-width" | "centered-features";
    title?: string;
    description?: string | string[];
    image?: {
      src: string;
      alt: string;
      width?: number;
      height?: number;
    };
    quote?: {
      text: string;
      author: string;
      role?: string;
      logo?: string;
    };
    cta?: {
      text: string;
      href: string;
    };
    features?: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
}

const postsDirectory = path.join(process.cwd(), "content/blog");

// Ensure the content directory exists
export function ensureBlogDirectory() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
}

/**
 * Get all blog posts sorted by date (newest first)
 */
export function getAllPosts(): BlogPost[] {
  ensureBlogDirectory();

  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames
    .filter((fileName) => {
      // Filter out README and other non-post files
      const isMarkdown = fileName.endsWith(".md") || fileName.endsWith(".mdx");
      const isNotReadme = !fileName.toUpperCase().startsWith("README");
      return isMarkdown && isNotReadme;
    })
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, "");
      return getPostBySlug(slug);
    })
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return posts;
}

/**
 * Get a single blog post by slug
 */
export function getPostBySlug(slug: string): BlogPost | null {
  ensureBlogDirectory();

  try {
    // Try .mdx first, then .md
    let fullPath = path.join(postsDirectory, `${slug}.mdx`);
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(postsDirectory, `${slug}.md`);
      if (!fs.existsSync(fullPath)) {
        return null;
      }
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    // Calculate reading time
    const stats = readingTime(content);

    return {
      slug,
      title: data.title || "Untitled",
      excerpt: data.excerpt || "",
      date: data.date || new Date().toISOString(),
      author: {
        name: data.author?.name || data.author || "Anonymous",
        role: data.author?.role,
      },
      tags: data.tags || [],
      coverImage: data.coverImage,
      readingTime: stats.text,
      content,
      hero: data.hero,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

/**
 * Get all unique tags from all posts
 */
export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tags = new Set<string>();

  posts.forEach((post) => {
    post.tags?.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).sort();
}

/**
 * Get posts by tag
 */
export function getPostsByTag(tag: string): BlogPost[] {
  const posts = getAllPosts();
  return posts.filter((post) => post.tags?.includes(tag));
}
