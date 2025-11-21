import Link from "next/link";

import { Calendar, Clock, ArrowRight } from "lucide-react";

import { BookNavbarWrapper } from "@/components/BookNavbarWrapper";
import { BookFooter } from "@/components/sections/BookFooter";
import { getAllPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata.blog;

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <BookNavbarWrapper />
      <main className="min-h-screen bg-white dark:bg-black">
        {/* Header */}
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
              Thought Pieces
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Exploring AI-native organisations, the future of work, and the
              architecture of intelligence.
            </p>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="mx-auto max-w-4xl px-6 pb-24">
          <div className="space-y-16">
            {posts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-slate-600 dark:text-slate-400">
                  No posts yet. Check back soon.
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <article
                  key={post.slug}
                  className="group relative border-b border-slate-200 pb-16 last:border-0 dark:border-slate-800"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block space-y-4"
                  >
                    {/* Meta */}
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

                    {/* Title */}
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-slate-600 dark:text-slate-50 dark:group-hover:text-slate-300 sm:text-4xl">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                      {post.excerpt}
                    </p>

                    {/* Author & Tags */}
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="text-sm text-slate-900 dark:text-slate-50">
                        <span className="font-medium">{post.author.name}</span>
                        {post.author.role && (
                          <>
                            <span className="mx-2 text-slate-400">·</span>
                            <span className="text-slate-600 dark:text-slate-400">
                              {post.author.role}
                            </span>
                          </>
                        )}
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

                    {/* Read More */}
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-50">
                      <span>Read article</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </article>
              ))
            )}
          </div>
        </div>
      </main>
      <BookFooter />
    </>
  );
}
