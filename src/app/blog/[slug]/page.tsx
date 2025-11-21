import Link from "next/link";
import { notFound } from "next/navigation";

import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { BlogHero, type BlogHeroProps } from "@/components/blog/BlogHero";
import { mdxComponents } from "@/components/blog/mdx-components";
import { BookNavbarWrapper } from "@/components/BookNavbarWrapper";
import { BookFooter } from "@/components/sections/BookFooter";
import { ShareButton } from "@/components/ShareButton";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { generateBlogPostMetadata, generateBlogPostStructuredData } from "@/lib/metadata";

// Generate static paths for all blog posts
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for each post
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return generateBlogPostMetadata({
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    date: post.date,
    author: post.author,
    tags: post.tags,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Transform hero data if present
  const heroProps: BlogHeroProps | null = post.hero
    ? ({
        variant: post.hero.variant,
        title: post.hero.title || post.title,
        description: post.hero.description || post.excerpt,
        image: post.hero.image,
        quote: post.hero.quote,
        cta: post.hero.cta,
        features: post.hero.features,
      } as BlogHeroProps)
    : null;

  return (
    <>
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
          ),
        }}
      />
      <BookNavbarWrapper />
      <main className="min-h-screen bg-white dark:bg-black">
        {/* Hero Section (if configured) */}
        {heroProps && <BlogHero {...heroProps} />}

        {/* Article Header */}
        <article className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
          {/* Back Link */}
          <Link
            href="/blog"
            className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to all posts</span>
          </Link>

          {/* Title */}
          <header className="mb-12 space-y-6">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-400">
              {post.excerpt}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 border-b border-t border-slate-200 py-4 dark:border-slate-800">
              <div className="flex items-center gap-4 text-sm">
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  {post.author.name}
                  {post.author.role && (
                    <span className="ml-2 font-normal text-slate-600 dark:text-slate-400">
                      · {post.author.role}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{post.readingTime}</span>
                </div>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* Article Content with Medium-like styling */}
          <div className="prose prose-slate prose-lg dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-h2:mt-12 prose-h2:text-3xl prose-h3:mt-8 prose-h3:text-2xl prose-p:leading-relaxed prose-a:font-medium prose-a:text-slate-900 prose-a:no-underline hover:prose-a:text-slate-600 dark:prose-a:text-slate-50 dark:hover:prose-a:text-slate-300 prose-blockquote:border-l-4 prose-blockquote:border-slate-300 prose-blockquote:pl-6 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-slate-600 dark:prose-blockquote:border-slate-700 dark:prose-blockquote:text-slate-400 prose-strong:font-semibold prose-strong:text-slate-900 dark:prose-strong:text-slate-50 prose-code:rounded prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-[''] dark:prose-code:bg-slate-800 prose-pre:rounded-xl prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-800 prose-ul:my-6 prose-ol:my-6 prose-li:my-2 max-w-none">
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    rehypeSlug,
                    [
                      rehypeAutolinkHeadings,
                      {
                        behavior: "wrap",
                        properties: {
                          className: ["anchor"],
                        },
                      },
                    ],
                    [
                      rehypePrettyCode,
                      {
                        theme: {
                          dark: "github-dark",
                          light: "github-light",
                        },
                      },
                    ],
                  ],
                },
              }}
            />
          </div>

          {/* Article Footer */}
          <footer className="mt-16 border-t border-slate-200 pt-8 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <Link
                href="/blog"
                className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span>Back to all posts</span>
              </Link>

              <ShareButton title={post.title} excerpt={post.excerpt} />
            </div>
          </footer>
        </article>
      </main>
      <BookFooter />
    </>
  );
}
